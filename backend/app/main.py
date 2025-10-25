from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import banks, cashback, ocr, auth

# Инициализация приложения
app = FastAPI(
    title="Cashback Optimizer API",
    description="API для оптимизации кешбека по банковским картам",
    version="1.0.0"
)

# Настройка CORS для работы с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(auth.router)
app.include_router(banks.router)
app.include_router(cashback.router)
app.include_router(ocr.router)


@app.on_event("startup")
async def startup_event():
    """Инициализация базы данных при запуске"""
    init_db()


@app.get("/")
def read_root():
    """Главная страница API"""
    return {
        "message": "Cashback Optimizer API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Проверка здоровья API"""
    return {"status": "healthy"}
