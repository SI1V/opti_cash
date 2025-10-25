# Cashback Optimizer Backend

## Описание
FastAPI backend для приложения оптимизации кешбека.

## Установка

### 1. Установка зависимостей Python
```bash
python -m venv venv
source venv/bin/activate  # Для Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Установка Tesseract OCR

#### macOS
```bash
brew install tesseract
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install tesseract-ocr
```

#### Windows
Скачайте и установите с [официального сайта](https://github.com/UB-Mannheim/tesseract/wiki)

## Запуск
```bash
uvicorn app.main:app --reload
```

API будет доступно по адресу: http://localhost:8000

## Документация API
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Структура проекта

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # Главный файл приложения
│   ├── models.py        # Модели данных
│   ├── database.py      # Настройка базы данных
│   └── routers/
│       ├── __init__.py
│       ├── banks.py     # API для банков и карт
│       ├── cashback.py  # API для категорий кешбека
│       └── ocr.py       # API для OCR
├── requirements.txt
└── README.md
```

## API Endpoints

### Banks (Банки)
- `GET /banks` - получить все банки
- `POST /banks` - создать банк
- `GET /banks/{bank_id}` - получить банк по ID
- `PUT /banks/{bank_id}` - обновить банк
- `DELETE /banks/{bank_id}` - удалить банк

### Cards (Карты)
- `POST /banks/{bank_id}/cards` - добавить карту
- `GET /banks/{bank_id}/cards` - получить карты банка
- `PUT /banks/cards/{card_id}` - обновить карту
- `DELETE /banks/cards/{card_id}` - удалить карту

### Cashback Categories (Категории кешбека)
- `GET /cashback/categories` - получить категории
- `POST /cashback/cards/{card_id}/categories` - добавить категорию
- `PUT /cashback/categories/{category_id}` - обновить категорию
- `DELETE /cashback/categories/{category_id}` - удалить категорию
- `GET /cashback/recommendations/{category}` - получить рекомендации

### OCR (Распознавание скриншотов)
- `POST /ocr/screenshot` - загрузить и распознать скриншот
- `POST /ocr/screenshot-base64` - распознать изображение из base64
