import httpx
import config

SYSTEM_PROMPT = "你是小米 MiMo 助手，通过飞书与用户对话。回答简洁、有帮助。"


async def chat(user_message: str, history: list[dict] | None = None) -> str:
    """调用 MiMo API (Anthropic 兼容格式) 获取回复"""
    messages = []
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{config.MIMO_BASE_URL}/v1/messages",
            headers={
                "x-api-key": config.MIMO_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": config.MIMO_MODEL,
                "system": SYSTEM_PROMPT,
                "messages": messages,
                "max_tokens": 2048,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["content"][0]["text"]
