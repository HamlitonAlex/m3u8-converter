# 飞书 MiMo 机器人

飞书 + 小米 MiMo 的聊天机器人，支持多轮对话。

## 快速开始

### 1. 安装依赖

```bash
cd feishu-bot
pip install -r requirements.txt
```

### 2. 创建飞书应用

1. 打开 [飞书开放平台](https://open.feishu.cn/app)
2. 点击「创建企业自建应用」
3. 填写应用名称（如"MiMo 助手"）和描述
4. 进入应用 → **凭证与基础信息**，记录下 `App ID` 和 `App Secret`

### 3. 开启机器人能力

1. 左侧菜单 → **添加应用能力** → 开启「机器人」
2. 左侧菜单 → **事件与回调**
   - 加密策略：选择「不加密」（本地调试用）
   - 记录下 `Verification Token`
3. 左侧菜单 → **事件与回调** → **事件配置**
   - 请求地址：`http://你的公网地址:9000/webhook/event`（本地用 ngrok）
   - 添加事件：`im.message.receive_v1`（接收消息）

### 4. 配置环境变量

编辑 `.env` 文件，填入飞书和 MiMo 的配置：

```env
FEISHU_APP_ID=cli_xxxxxx
FEISHU_APP_SECRET=xxxxxx
FEISHU_VERIFICATION_TOKEN=xxxxxx

MIMO_API_KEY=你的key
MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/anthropic
MIMO_MODEL=mimo 2.5
```

### 5. 本地运行 + 内网穿透

```bash
# 启动服务
python main.py

# 另一个终端，用 ngrok 暴露到公网
ngrok http 9000
```

拿到 ngrok 的公网地址（如 `https://xxxx.ngrok-free.app`），填到飞书事件配置的请求地址：
`https://xxxx.ngrok-free.app/webhook/event`

### 6. 测试

在飞书中找到你的机器人，发一条消息，应该会收到 MiMo 的回复。

## 文件结构

```
feishu-bot/
├── main.py          # FastAPI 主程序，处理飞书 webhook
├── mimo_client.py   # MiMo API 调用
├── config.py        # 配置读取
├── requirements.txt
├── .env             # 环境变量（不要提交到 git）
└── .env.example     # 环境变量模板
```

## 注意事项

- `.env` 包含密钥，已在 `.gitignore` 中忽略
- 本地调试必须用 ngrok / cpolar 等内网穿透工具
- 每个会话保存最近 10 轮对话历史（内存中，重启丢失）
- 飞书群聊中 @机器人 才会触发（取决于应用权限配置）
