from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import pytesseract
import io
import re
from app.models import OCRResponse
from typing import List, Dict

router = APIRouter(prefix="/ocr", tags=["ocr"])


def get_category_icon(category_name: str) -> str:
    """Определяет иконку для категории по её названию"""
    category_lower = category_name.lower()
    
    icon_mapping = {
        'азс': 'local_gas_station',
        'заправка': 'local_gas_station',
        'бензин': 'local_gas_station',
        'кафе': 'restaurant',
        'ресторан': 'restaurant',
        'еда': 'restaurant',
        'супермаркет': 'shopping_cart',
        'продукты': 'shopping_cart',
        'магазин': 'shopping_cart',
        'аптека': 'local_pharmacy',
        'лекарство': 'local_pharmacy',
        'медицина': 'local_pharmacy',
        'клиника': 'medical_services',
        'больница': 'medical_services',
        'транспорт': 'directions_bus',
        'автобус': 'directions_bus',
        'метро': 'train',
        'такси': 'local_taxi',
        'билет': 'confirmation_number',
        'кино': 'movie',
        'развлечение': 'sports_esports',
        'игра': 'sports_esports',
        'онлайн': 'shopping_bag',
        'интернет': 'shopping_bag',
        'курс': 'school',
        'образование': 'school',
        'книга': 'menu_book',
        'отель': 'hotel',
        'путешествие': 'flight',
        'авиа': 'flight',
        'спорт': 'fitness_center',
        'тренажер': 'fitness_center',
        'красота': 'face',
        'салон': 'content_cut',
        'ремонт': 'build',
        'стройка': 'construction',
        'услуга': 'support_agent',
    }
    
    for key, icon in icon_mapping.items():
        if key in category_lower:
            return icon
    
    return 'shopping_cart'  # Иконка по умолчанию


def extract_cashback_info(text: str) -> List[Dict[str, float]]:
    """
    Извлекает категории и проценты кешбека из текста.
    Использует регулярные выражения для поиска паттернов типа:
    - "Категория: 5%" или "5% кешбек на АЗС"
    """
    categories = []
    seen = set()  # Для избежания дубликатов
    
    # Слова, которые нужно удалить из названий категорий
    stop_words = [
        'подробнее', 'далее', 'еще', 'больше', 'всего', 'итого',
        'сумма', 'бонус', 'кешбек', 'накопления', 'процент', '%', 'руб',
        'рублей', 'коп', 'копеек', 'до', 'от', 'с', 'по', 'на', 'за',
        'в', 'во', 'к', 'ко', 'о', 'об', 'обо', 'при', 'про', 'со', 'из',
        'изо', 'над', 'под', 'подо', 'перед', 'передо', 'за', 'зао',
        'между', 'среди', 'через', 'сквозь', 'для', 'ради', 'благодаря',
        'согласно', 'вопреки', 'навстречу', 'наподобие', 'вроде', 'вследствие',
        'ввиду', 'вслед', 'вместо', 'кроме', 'сверх', 'среди', 'между',
        'около', 'возле', 'близ', 'вдоль', 'вокруг', 'около', 'против',
        'напротив', 'позади', 'впереди', 'сверху', 'снизу', 'внутри',
        'снаружи', 'вне', 'внутрь', 'наружу', 'вверх', 'вниз', 'вперед',
        'назад', 'влево', 'вправо', 'налево', 'направо', 'туда', 'сюда',
        'оттуда', 'отсюда', 'везде', 'всюду', 'нигде', 'никуда', 'никуда',
        'никогда', 'всегда', 'иногда', 'часто', 'редко', 'всегда', 'никогда'
    ]
    
    # Улучшенные паттерны для русских текстов
    patterns = [
        # Процент перед названием категории: "5% Рестораны"
        r'(\d+(?:[.,]\d+)?)\s*%\s*([А-ЯЁа-яёA-Za-z\s\-]+)',
        # Название категории перед процентом: "Рестораны: 5%"
        r'([А-ЯЁа-яёA-Za-z\s\-]+)[:\-]\s*(\d+(?:[.,]\d+)?)\s*%',
        # Название категории перед процентом без двоеточия: "Супермаркеты 2%"
        r'([А-ЯЁа-яёA-Za-z\s\-]+)\s+(\d+(?:[.,]\d+)?)\s*%',
        # Процент на/для категории: "5% на АЗС"
        r'(\d+(?:[.,]\d+)?)\s*%\s*на\s+([А-ЯЁа-яёA-Za-z\s\-]+)',
        # Процент для категории: "5% для АЗС"
        r'(\d+(?:[.,]\d+)?)\s*%\s*для\s+([А-ЯЁа-яёA-Za-z\s\-]+)',
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            groups = match.groups()
            if len(groups) == 2:
                try:
                    # Пытаемся найти процент и категорию
                    # Проверяем первую группу - это процент?
                    try:
                        percent_str = groups[0].replace(',', '.')
                        percent = float(percent_str)
                        category = groups[1].strip()
                    except ValueError:
                        # Если не процент, значит первая группа - категория
                        try:
                            percent_str = groups[1].replace(',', '.')
                            percent = float(percent_str)
                            category = groups[0].strip()
                        except ValueError:
                            continue
                    
                    # Очистка категории от лишних символов, иконок и мусора
                    category = re.sub(r'[^\w\s\-а-яА-ЯёЁ]', ' ', category).strip()
                    
                    # НЕ убираем "все" - оставляем "Все покупки" как есть
                    
                    # Специальная обработка для случаев типа "Аптеки Подробнее"
                    # Если есть слово "подробнее" или подобные, убираем их
                    if 'подробнее' in category.lower() or 'далее' in category.lower():
                        # Убираем слова "подробнее" и "далее" из конца
                        words = category.split()
                        filtered_words = []
                        for word in words:
                            if word.lower() not in ['подробнее', 'далее']:
                                filtered_words.append(word)
                        category = ' '.join(filtered_words)
                    
                    # Удаляем стоп-слова и лишние слова
                    words = category.split()
                    filtered_words = []
                    for word in words:
                        word_lower = word.lower()
                        # Пропускаем стоп-слова и слова, которые явно не являются названиями категорий
                        if (word_lower not in stop_words and 
                            len(word) > 1 and 
                            not word_lower.endswith('ее') and  # "подробнее", "далее"
                            not word_lower.endswith('ше') and  # "больше"
                            not word_lower.endswith('ще') and  # "еще"
                            word_lower not in ['всего', 'итого', 'сумма', 'бонус']):
                            filtered_words.append(word)
                    category = ' '.join(filtered_words)
                    
                    # Удаляем одиночные буквы и цифры
                    category = re.sub(r'\b[а-яА-Яa-z]\b', '', category).strip()
                    # Удаляем множественные пробелы
                    category = re.sub(r'\s+', ' ', category).strip()
                    
                    # Фильтрация
                    if len(category) > 2 and 0 <= percent <= 100:
                        # Нормализуем название категории для дедупликации
                        normalized_category = category.lower().strip()
                        
                        # Проверяем, не является ли это дубликатом
                        is_duplicate = False
                        for existing_cat in categories:
                            if (existing_cat["category_name"].lower().strip() == normalized_category and 
                                abs(existing_cat["cashback_percent"] - percent) < 0.1):
                                is_duplicate = True
                                break
                        
                        if not is_duplicate:
                            categories.append({
                                "category_name": category,
                                "cashback_percent": percent,
                                "icon": get_category_icon(category)
                            })
                except Exception:
                    continue
    
    return categories


@router.post("/screenshot", response_model=OCRResponse)
async def process_screenshot(file: UploadFile = File(...)):
    """
    Загружает и обрабатывает скриншот для извлечения информации о кешбеке.
    Использует Tesseract OCR для распознавания текста.
    """
    # Проверяем тип файла
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Читаем изображение
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Конвертируем в RGB, если нужно
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Улучшение качества изображения для лучшего распознавания
        # Увеличиваем контраст
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)
        
        # Применяем OCR с поддержкой русского языка
        try:
            text = pytesseract.image_to_string(image, lang='rus+eng')
        except Exception:
            # Если русский не установлен, используем английский
            text = pytesseract.image_to_string(image, lang='eng')
        
        # Очистка текста от мусора и иконок
        # Удаляем странные символы и иконки, но оставляем важные для распознавания
        text = re.sub(r'[^\w\s%\.,:;\-\+\*\&\(\)\[\]а-яА-ЯёЁ]', ' ', text)
        # Удаляем одиночные символы-мусор
        text = re.sub(r'\s[^\w%а-яА-ЯёЁ]\s', ' ', text)
        # Удаляем одиночные цифры и буквы, которые не являются процентами
        text = re.sub(r'\b[а-яА-Яa-z]\b(?!\s*%)', ' ', text)
        # Нормализуем пробелы
        text = re.sub(r'\s+', ' ', text)
        # Удаляем лишние пробелы в начале и конце
        text = text.strip()
        
        # Извлекаем категории из текста
        categories = extract_cashback_info(text)
        
        return OCRResponse(categories=categories)
        
    except pytesseract.TesseractNotFoundError:
        raise HTTPException(
            status_code=500, 
            detail="Tesseract OCR не установлен. Установите его через: brew install tesseract"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@router.post("/screenshot-base64", response_model=OCRResponse)
async def process_screenshot_base64(data: dict):
    """
    Обрабатывает изображение в формате base64.
    """
    import base64
    
    try:
        # Декодируем base64
        image_base64 = data.get("image_base64", "")
        image_bytes = base64.b64decode(image_base64)
        
        # Открываем изображение
        image = Image.open(io.BytesIO(image_bytes))
        
        # Конвертируем в RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Применяем OCR
        text = pytesseract.image_to_string(image)
        
        # Извлекаем категории
        categories = extract_cashback_info(text)
        
        return OCRResponse(categories=categories)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
