from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import (
    Bank, BankCreate, BankUpdate, BankResponse, BankWithCards,
    Card, CardCreate, CardUpdate, CardResponse, CardWithCashback, User
)
from app.auth import get_current_active_user

router = APIRouter(prefix="/banks", tags=["banks"])


@router.get("/", response_model=List[BankWithCards])
def get_banks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить все банки пользователя"""
    banks = db.query(Bank).filter(Bank.user_id == current_user.id).all()
    return banks


@router.post("/", response_model=BankResponse)
def create_bank(
    bank: BankCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Создать новый банк"""
    db_bank = Bank(name=bank.name, user_id=current_user.id)
    db.add(db_bank)
    db.commit()
    db.refresh(db_bank)
    return db_bank


@router.get("/{bank_id}", response_model=BankWithCards)
def get_bank(
    bank_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить банк по ID"""
    bank = db.query(Bank).filter(
        Bank.id == bank_id,
        Bank.user_id == current_user.id
    ).first()
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    return bank


@router.put("/{bank_id}", response_model=BankResponse)
def update_bank(
    bank_id: int,
    bank_update: BankUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Обновить банк"""
    db_bank = db.query(Bank).filter(
        Bank.id == bank_id,
        Bank.user_id == current_user.id
    ).first()
    if not db_bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    
    db_bank.name = bank_update.name
    db.commit()
    db.refresh(db_bank)
    return db_bank


@router.delete("/{bank_id}")
def delete_bank(
    bank_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Удалить банк"""
    db_bank = db.query(Bank).filter(
        Bank.id == bank_id,
        Bank.user_id == current_user.id
    ).first()
    if not db_bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    
    db.delete(db_bank)
    db.commit()
    return {"message": "Bank deleted successfully"}


# Cards routes
@router.post("/{bank_id}/cards", response_model=CardResponse)
def create_card(
    bank_id: int,
    card: CardCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Добавить карту к банку"""
    db_bank = db.query(Bank).filter(
        Bank.id == bank_id,
        Bank.user_id == current_user.id
    ).first()
    if not db_bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    
    db_card = Card(
        name=card.name,
        bank_id=bank_id,
        card_type=card.card_type
    )
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card


@router.get("/{bank_id}/cards", response_model=List[CardWithCashback])
def get_cards(
    bank_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить все карты банка"""
    # Проверяем, что банк принадлежит пользователю
    db_bank = db.query(Bank).filter(
        Bank.id == bank_id,
        Bank.user_id == current_user.id
    ).first()
    if not db_bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    
    cards = db.query(Card).filter(Card.bank_id == bank_id).all()
    return cards


@router.put("/cards/{card_id}", response_model=CardResponse)
def update_card(
    card_id: int,
    card_update: CardUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Обновить карту"""
    # Проверяем, что карта принадлежит пользователю через банк
    db_card = db.query(Card).join(Bank).filter(
        Card.id == card_id,
        Bank.user_id == current_user.id
    ).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    if card_update.name is not None:
        db_card.name = card_update.name
    if card_update.card_type is not None:
        db_card.card_type = card_update.card_type
    
    db.commit()
    db.refresh(db_card)
    return db_card


@router.delete("/cards/{card_id}")
def delete_card(
    card_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Удалить карту"""
    # Проверяем, что карта принадлежит пользователю через банк
    db_card = db.query(Card).join(Bank).filter(
        Card.id == card_id,
        Bank.user_id == current_user.id
    ).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    db.delete(db_card)
    db.commit()
    return {"message": "Card deleted successfully"}
