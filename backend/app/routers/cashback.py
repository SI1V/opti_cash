from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import (
    CashbackCategory, CashbackCategoryCreate, CashbackCategoryUpdate,
    CashbackCategoryResponse, Card, Bank, RecommendationResponse, User
)
from app.auth import get_current_active_user

router = APIRouter(prefix="/cashback", tags=["cashback"])


@router.get("/categories", response_model=List[CashbackCategoryResponse])
def get_cashback_categories(
    card_id: int = None,
    month: int = None,
    year: int = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить все категории кешбека пользователя"""
    query = db.query(CashbackCategory).join(Card).join(Bank).filter(
        Bank.user_id == current_user.id
    )
    
    if card_id:
        query = query.filter(CashbackCategory.card_id == card_id)
    if month:
        query = query.filter(CashbackCategory.month == month)
    if year:
        query = query.filter(CashbackCategory.year == year)
    
    categories = query.all()
    return categories


@router.post("/cards/{card_id}/categories", response_model=CashbackCategoryResponse)
def create_cashback_category(
    card_id: int,
    category: CashbackCategoryCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Добавить категорию кешбека к карте"""
    # Проверяем существование карты и принадлежность пользователю
    card = db.query(Card).join(Bank).filter(
        Card.id == card_id,
        Bank.user_id == current_user.id
    ).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    db_category = CashbackCategory(
        category_name=category.category_name,
        cashback_percent=category.cashback_percent,
        card_id=card_id,
        month=category.month or datetime.now().month,
        year=category.year or datetime.now().year,
        icon=category.icon or "shopping_cart"
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/categories/{category_id}", response_model=CashbackCategoryResponse)
def update_cashback_category(
    category_id: int,
    category_update: CashbackCategoryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Обновить категорию кешбека"""
    db_category = db.query(CashbackCategory).join(Card).join(Bank).filter(
        CashbackCategory.id == category_id,
        Bank.user_id == current_user.id
    ).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if category_update.category_name is not None:
        db_category.category_name = category_update.category_name
    if category_update.cashback_percent is not None:
        db_category.cashback_percent = category_update.cashback_percent
    if category_update.month is not None:
        db_category.month = category_update.month
    if category_update.year is not None:
        db_category.year = category_update.year
    if category_update.icon is not None:
        db_category.icon = category_update.icon
    
    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/categories/{category_id}")
def delete_cashback_category(
    category_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Удалить категорию кешбека"""
    db_category = db.query(CashbackCategory).join(Card).join(Bank).filter(
        CashbackCategory.id == category_id,
        Bank.user_id == current_user.id
    ).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}


@router.get("/recommendations/{category}", response_model=RecommendationResponse)
def get_recommendations(
    category: str,
    month: int = None,
    year: int = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить рекомендации по выбору карты для категории"""
    # Используем текущий месяц и год, если не указано
    if not month:
        month = datetime.now().month
    if not year:
        year = datetime.now().year
    
    # Получаем все категории для указанного месяца и года пользователя
    categories = db.query(CashbackCategory).join(Card).join(Bank).filter(
        CashbackCategory.category_name.ilike(f"%{category}%"),
        CashbackCategory.month == month,
        CashbackCategory.year == year,
        Bank.user_id == current_user.id
    ).all()
    
    if not categories:
        return RecommendationResponse(
            category=category,
            recommendations=[]
        )
    
    # Формируем список рекомендаций
    recommendations = []
    for cat in categories:
        card = db.query(Card).filter(Card.id == cat.card_id).first()
        if card:
            bank = db.query(Bank).filter(Bank.id == card.bank_id).first()
            recommendations.append({
                "card_name": card.name,
                "card_id": card.id,
                "bank_name": bank.name if bank else "Unknown",
                "cashback_percent": cat.cashback_percent,
                "category_name": cat.category_name
            })
    
    # Сортируем по кешбеку (от большего к меньшему)
    recommendations.sort(key=lambda x: x["cashback_percent"], reverse=True)
    
    return RecommendationResponse(
        category=category,
        recommendations=recommendations
    )
