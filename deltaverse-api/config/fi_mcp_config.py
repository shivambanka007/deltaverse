from pydantic_settings import BaseSettings
class FiMCPSettings(BaseSettings):
    base_url: str = "http://localhost:8080"
    timeout: int = 30
fi_mcp_settings = FiMCPSettings()
