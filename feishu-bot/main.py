import json
import hashlib
import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

import config
import mimo_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("feishu-bot")

# 存储每个会话的最近 N 轮对话历史
_chat_histories: dict[str, list[dict]] = {}
MAX_HISTORY_ROUNDS = 10

# tenant_access_token 缓存
_token_cache = {"token": "", "expire": 0}


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("飞书 MiMo 机器人启动中...")
    log.info(f"MiMo API: {config.MIMO_BASE_URL}  Model: {config.MIMO_MODEL}")
    yield
    log.info("机器人关闭")


app = FastAPI(lifespan=lifespan)


# ── 飞书 API 工具函数 ──────────────────────────────────────────────

async def get_tenant_token() -> str:
    """获取 tenant_access_token"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/",
            json={
                "app_id": config.FEISHU_APP_ID,
                "app_secret": config.FEISHU_APP_SECRET,
            },
        )
        data = resp.json()
        return data.get("tenant_access_token", "")


async def reply_message(message_id: str, text: str):
    """回复飞书消息"""
    token = await get_tenant_token()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://open.feishu.cn/open-apis/im/v1/messages/{message_id}/reply",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "msg_type": "text",
                "content": json.dumps({"text": text}),
            },
        )
        data = resp.json()
        if data.get("code") != 0:
            log.error(f"回复失败: {data}")


async def send_message(chat_id: str, text: str):
    """主动发送消息"""
    token = await get_tenant_token()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://open.feishu.cn/open-apis/im/v1/messages",
            headers={"Authorization": f"Bearer {token}"},
            params={"receive_id_type": "chat_id"},
            json={
                "receive_id": chat_id,
                "msg_type": "text",
                "content": json.dumps({"text": text}),
            },
        )
        data = resp.json()
        if data.get("code") != 0:
            log.error(f"发送失败: {data}")


# ── 消息处理 ──────────────────────────────────────────────────────

def extract_text(content_str: str) -> str:
    """从飞书消息 content JSON 中提取纯文本"""
    try:
        content = json.loads(content_str)
        return content.get("text", "").strip()
    except (json.JSONDecodeError, AttributeError):
        return ""


async def handle_message(message_id: str, chat_id: str, user_id: str, text: str):
    """处理用户消息：调 MiMo 并回复"""
    if not text:
        return

    log.info(f"收到消息 [{user_id}]: {text[:80]}")

    # 取会话历史
    history = _chat_histories.get(chat_id, [])

    try:
        reply_text = await mimo_client.chat(text, history or None)
    except Exception as e:
        log.error(f"MiMo 调用失败: {e}")
        reply_text = f"抱歉，模型调用出错了: {e}"

    # 更新历史
    history.append({"role": "user", "content": text})
    history.append({"role": "assistant", "content": reply_text})
    if len(history) > MAX_HISTORY_ROUNDS * 2:
        history = history[-MAX_HISTORY_ROUNDS * 2:]
    _chat_histories[chat_id] = history

    # 回复
    await reply_message(message_id, reply_text)
    log.info(f"已回复 [{user_id}]: {reply_text[:80]}")


# ── Webhook 端点 ──────────────────────────────────────────────────

@app.post("/webhook/event")
async def feishu_event(request: Request):
    body = await request.json()
    log.info(f"收到请求: {json.dumps(body, ensure_ascii=False)[:500]}")

    # 1) URL 验证 (飞书添加回调地址时发送)
    if "challenge" in body:
        log.info("收到 URL 验证请求")
        return JSONResponse({"challenge": body["challenge"]})

    # 2) 解析事件
    header = body.get("header", {})
    event_type = header.get("event_type", "")
    event = body.get("event", {})
    log.info(f"事件类型: {event_type}")

    # v2.0 schema 处理
    schema = body.get("schema", "")
    if schema == "2.0":
        pass  # 已按 v2 解析

    if event_type == "im.message.receive_v1":
        msg = event.get("message", {})
        message_id = msg.get("message_id", "")
        chat_id = msg.get("chat_id", "")
        sender_id = event.get("sender", {}).get("sender_id", {}).get("open_id", "")
        msg_type = msg.get("message_type", "")

        # 只处理文本消息
        if msg_type == "text":
            text = extract_text(msg.get("content", ""))
            # 处理 @机器人 的情况，去掉 @mention
            mentions = msg.get("mentions", [])
            if mentions:
                for m in mentions:
                    key = m.get("key", "")
                    if key:
                        text = text.replace(key, "").strip()

            if text:
                import asyncio
                asyncio.create_task(handle_message(message_id, chat_id, sender_id, text))

    return JSONResponse({"code": 0})


@app.get("/health")
async def health():
    return {"status": "ok", "model": config.MIMO_MODEL}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=config.PORT)
