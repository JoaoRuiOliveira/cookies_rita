from pydantic import BaseModel
from typing import List

class Cliente(BaseModel):
    id: int
    nome: str
    email: str

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