import os
from dotenv import load_dotenv

load_dotenv()

# 飞书
FEISHU_APP_ID = os.getenv("FEISHU_APP_ID", "")
FEISHU_APP_SECRET = os.getenv("FEISHU_APP_SECRET", "")
FEISHU_VERIFICATION_TOKEN = os.getenv("FEISHU_VERIFICATION_TOKEN", "")
FEISHU_ENCRYPT_KEY = os.getenv("FEISHU_ENCRYPT_KEY", "")

# MiMo (Anthropic 兼容格式)
MIMO_API_KEY = os.getenv("MIMO_API_KEY", "")
MIMO_BASE_URL = os.getenv("MIMO_BASE_URL", "https://token-plan-cn.xiaomimimo.com/anthropic")
MIMO_MODEL = os.getenv("MIMO_MODEL", "mimo 2.5")

# 服务
PORT = int(os.getenv("PORT", "9000"))
