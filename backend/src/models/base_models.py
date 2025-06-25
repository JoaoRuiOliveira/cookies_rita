from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Cliente(BaseModel):
    id: int
    nome: str
    email: str
    contacto: str

class Ingrediente(BaseModel):
    id: int
    nome: str
    quantidade: float  # em gramas

class Encomenda(BaseModel):
    id: int
    cliente_id: int
    ingredientes: List[Ingrediente]
    total: float
    timestamp: str  # ISO format string
    data_entrega: str  # ISO format string for delivery date

class Produto(BaseModel):
    id: int
    nome: str
    preco: float
    estoque: int

class ReceitaIngrediente(BaseModel):
    id: int
    quantidade: float

class Receita(BaseModel):
    id: int
    nome: str
    descricao: str
    ingredientes: List[ReceitaIngrediente]

class CalendarEvent(BaseModel):
    id: Optional[int] = None
    title: str
    date: str  # ISO format string
    description: str
    isImportant: bool = False
    startDate: Optional[str] = None  # ISO format string for multi-day events
    endDate: Optional[str] = None    # ISO format string for multi-day events
    category: str = "general"  # general, holiday, meeting, party, delivery, order
    order_id: Optional[int] = None  # Link to order if it's a delivery event 