# Cashback Optimizer - Приложение для оптимизации кешбека

## Описание
Приложение для определения оптимальной банковской карты для оплаты в зависимости от категории покупки и актуальных программ кешбека.

## Технологии

### Backend
- Python (FastAPI)
- SQLite
- Computer Vision (OCR) для распознавания скриншотов

### Frontend
- React
- Responsive Design (mobile-first)
- Material-UI или Tailwind CSS

## Функционал

### Управление данными
- Добавление/редактирование банков и карт
- Управление категориями кешбека по картам
- Настройка кешбека по месяцам
- Считывание скриншотов из приложений банков с помощью OCR
- Ручное редактирование категорий и процентов кешбека

### Основная функция
- Выбор категории покупки
- Отображение оптимальных карт для оплаты с максимальным кешбеком

## Структура проекта

```
.
├── backend/           # Python FastAPI backend
│   ├── app/
│   │   ├── models.py
│   │   ├── database.py
│   │   ├── routers/
│   │   └── main.py
│   ├── requirements.txt
│   └── README.md
├── frontend/          # React frontend
│   ├── src/
│   ├── package.json
│   └── README.md
└── README.md
```

## Быстрый старт

### 1. Настройка Backend

```bash
cd backend

# Создание виртуального окружения
python -m venv venv

# Активация виртуального окружения
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt

# Установка Tesseract OCR (требуется для распознавания скриншотов)
# macOS:
brew install tesseract
# Linux (Ubuntu/Debian):
sudo apt-get install tesseract-ocr
# Windows: скачайте с https://github.com/UB-Mannheim/tesseract/wiki

# Запуск сервера
uvicorn app.main:app --reload
```

Backend будет доступен по адресу: http://localhost:8000
API документация: http://localhost:8000/docs

### 2. Настройка Frontend

В новом терминале:

```bash
cd frontend

# Установка зависимостей
npm install

# Запуск приложения
npm start
```

Frontend будет доступен по адресу: http://localhost:3000

## Структура проекта

```
cashback_opti/
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── models.py     # Модели базы данных
│   │   ├── database.py   # Настройка БД
│   │   ├── main.py       # Главный файл приложения
│   │   └── routers/      # API роутеры
│   ├── requirements.txt
│   └── README.md
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── services/     # API сервисы
│   │   ├── App.js        # Главный компонент
│   │   └── index.js      # Точка входа
│   ├── package.json
│   └── README.md
└── README.md
```

## API Endpoints

- GET `/banks` - список банков
- POST `/banks` - добавить банк
- PUT `/banks/{id}` - редактировать банк
- DELETE `/banks/{id}` - удалить банк
- POST `/banks/{id}/cards` - добавить карту к банку
- PUT `/cards/{id}` - редактировать карту
- DELETE `/cards/{id}` - удалить карту
- POST `/cards/{id}/cashback-categories` - добавить категорию кешбека
- GET `/cashback-categories` - получить все категории
- POST `/ocr/screenshot` - загрузить и распознать скриншот
- GET `/recommendations/{category}` - получить рекомендации по категории
