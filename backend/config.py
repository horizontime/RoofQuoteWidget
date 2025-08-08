from pydantic_settings import BaseSettings
from typing import List, Union

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./roof_quote_pro.db"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    GOOGLE_MAPS_API_KEY: str = "placeholder-api-key"
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5242880
    
    class Config:
        env_file = ".env"
    
    def get_cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS

settings = Settings()