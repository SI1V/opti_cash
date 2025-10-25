from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

Base = declarative_base()

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    banks = relationship("Bank", back_populates="user", cascade="all, delete-orphan")


class Bank(Base):
    __tablename__ = "banks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="banks")
    cards = relationship("Card", back_populates="bank", cascade="all, delete-orphan")


class Card(Base):
    __tablename__ = "cards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    bank_id = Column(Integer, ForeignKey("banks.id"))
    card_type = Column(String)  # Visa, MasterCard, etc.
    
    bank = relationship("Bank", back_populates="cards")
    cashback_categories = relationship("CashbackCategory", back_populates="card", cascade="all, delete-orphan")


class CashbackCategory(Base):
    __tablename__ = "cashback_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String, index=True)
    cashback_percent = Column(Float)
    card_id = Column(Integer, ForeignKey("cards.id"))
    month = Column(Integer)  # 1-12
    year = Column(Integer, default=datetime.now().year)
    icon = Column(String, default="shopping_cart")  # Название иконки из Material-UI
    
    card = relationship("Card", back_populates="cashback_categories")


# Pydantic Models (для API)
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class BankCreate(BaseModel):
    name: str


class BankUpdate(BaseModel):
    name: str


class BankResponse(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True


class CardCreate(BaseModel):
    name: str
    card_type: Optional[str] = "Unknown"


class CardUpdate(BaseModel):
    name: Optional[str] = None
    card_type: Optional[str] = None


class CardResponse(BaseModel):
    id: int
    name: str
    bank_id: int
    card_type: Optional[str] = None
    
    class Config:
        from_attributes = True


class CashbackCategoryCreate(BaseModel):
    category_name: str
    cashback_percent: float
    month: int = datetime.now().month
    year: int = datetime.now().year
    icon: Optional[str] = "shopping_cart"


class CashbackCategoryUpdate(BaseModel):
    category_name: Optional[str] = None
    cashback_percent: Optional[float] = None
    month: Optional[int] = None
    year: Optional[int] = None
    icon: Optional[str] = None


class CashbackCategoryResponse(BaseModel):
    id: int
    category_name: str
    cashback_percent: float
    card_id: int
    month: int
    year: int
    icon: str = "shopping_cart"
    
    class Config:
        from_attributes = True


class CardWithCashback(CardResponse):
    cashback_categories: List[CashbackCategoryResponse] = []


class BankWithCards(BankResponse):
    cards: List[CardWithCashback] = []


class RecommendationResponse(BaseModel):
    category: str
    recommendations: List[dict]  # {"card_name": str, "cashback_percent": float, "bank_name": str}
    
    class Config:
        from_attributes = True


class OCRRequest(BaseModel):
    image_base64: str  # base64 encoded image


class OCRResponse(BaseModel):
    categories: List[dict]  # {"category_name": str, "cashback_percent": float}
