import csv
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List
from datetime import datetime
import logging
import sys
import io

# File paths
CLIENTES_CSV = 'clientes.csv'
INGREDIENTES_CSV = 'ingredientes.csv'
ENCOMENDAS_CSV = 'encomendas.csv'
PRODUTOS_CSV = 'produtos.csv'
RECEITAS_CSV = 'receitas.csv'

# Criação do objeto FastAPI
app = FastAPI()

# Configuração para permitir requisições do frontend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens
    allow_methods=["*"],  # Permite todos os métodos
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

# Rota raiz
@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API de Encomendas!"}

# Modelos de dados
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

# Utility functions for CSV

def escape_csv_field(value):
    if isinstance(value, str) and value and value[0] in ('=', '+', '-', '@'):
        return "'" + value
    return value

def read_csv(file_path, model_class):
    items = []
    if not os.path.exists(file_path):
        return items
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Convert fields to correct types
            if model_class == Cliente:
                row['id'] = int(row['id'])
                items.append(Cliente(**row))
            elif model_class == Ingrediente:
                row['id'] = int(row['id'])
                row['quantidade'] = float(row['quantidade'])
                items.append(Ingrediente(**row))
            elif model_class == Encomenda:
                row['id'] = int(row['id'])
                row['cliente_id'] = int(row['cliente_id'])
                row['total'] = float(row['total'])
                import ast
                row['ingredientes'] = [Ingrediente(**i) for i in ast.literal_eval(row['ingredientes'])]
                # Handle missing timestamp for backward compatibility
                row['timestamp'] = row.get('timestamp', '')
                items.append(Encomenda(**row))
            elif model_class == Produto:
                row['id'] = int(row['id'])
                row['preco'] = float(row['preco'])
                row['estoque'] = int(row['estoque'])
                items.append(Produto(**row))
    return items

def write_csv(file_path, items, fieldnames, model_class):
    with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for item in items:
            data = item.dict()
            if model_class == Encomenda:
                data['ingredientes'] = str([i.dict() for i in item.ingredientes])
            # Escape all fields
            for k in data:
                data[k] = escape_csv_field(data[k])
            writer.writerow(data)

# Endpoints para clientes
@app.post("/clientes/")
def criar_cliente(cliente: Cliente):
    clientes = read_csv(CLIENTES_CSV, Cliente)
    clientes.append(cliente)
    write_csv(CLIENTES_CSV, clientes, ['id', 'nome', 'email'], Cliente)
    return cliente

@app.get("/clientes/")
def listar_clientes():
    return read_csv(CLIENTES_CSV, Cliente)

# Endpoints para ingredientes
@app.post("/ingredientes/")
def adicionar_ingrediente(ingrediente: Ingrediente):
    ingredientes = read_csv(INGREDIENTES_CSV, Ingrediente)
    ingredientes.append(ingrediente)
    write_csv(INGREDIENTES_CSV, ingredientes, ['id', 'nome', 'quantidade'], Ingrediente)
    return ingrediente

@app.get("/ingredientes/")
def listar_ingredientes():
    return read_csv(INGREDIENTES_CSV, Ingrediente)

# Endpoints para encomendas
@app.post("/encomendas/")
def criar_encomenda(encomenda: Encomenda):
    # Set timestamp if not provided
    if not getattr(encomenda, 'timestamp', None):
        encomenda.timestamp = datetime.now().isoformat()
    encomendas = read_csv(ENCOMENDAS_CSV, Encomenda)
    write_csv(ENCOMENDAS_CSV, encomendas + [encomenda], ['id', 'cliente_id', 'ingredientes', 'total', 'timestamp'], Encomenda)
    return encomenda

@app.get("/encomendas/")
def listar_encomendas():
    return read_csv(ENCOMENDAS_CSV, Encomenda)

@app.put("/encomendas/{encomenda_id}")
def atualizar_encomenda(encomenda_id: int, encomenda: Encomenda):
    encomendas = read_csv(ENCOMENDAS_CSV, Encomenda)
    updated = False
    for idx, e in enumerate(encomendas):
        if e.id == encomenda_id:
            encomendas[idx] = encomenda
            updated = True
            break
    if not updated:
        return JSONResponse(content={"error": "Encomenda não encontrada."}, status_code=404)
    write_csv(ENCOMENDAS_CSV, encomendas, ['id', 'cliente_id', 'ingredientes', 'total', 'timestamp'], Encomenda)
    return encomenda

@app.delete("/encomendas/{encomenda_id}")
def deletar_encomenda(encomenda_id: int):
    encomendas = read_csv(ENCOMENDAS_CSV, Encomenda)
    new_encomendas = [e for e in encomendas if e.id != encomenda_id]
    if len(new_encomendas) == len(encomendas):
        return JSONResponse(content={"error": "Encomenda não encontrada."}, status_code=404)
    write_csv(ENCOMENDAS_CSV, new_encomendas, ['id', 'cliente_id', 'ingredientes', 'total', 'timestamp'], Encomenda)
    return JSONResponse(content={"message": "Encomenda removida com sucesso."})

@app.post("/import/ingredientes")
def import_ingredientes(file: UploadFile = File(...)):
    contents = file.file.read()
    if len(contents) > 2 * 1024 * 1024:
        return JSONResponse(content={"error": "Arquivo muito grande."}, status_code=400)
    if not file.filename.endswith('.csv'):
        return JSONResponse(content={"error": "Tipo de arquivo inválido."}, status_code=400)
    try:
        csv.Sniffer().sniff(contents.decode('utf-8'))
    except Exception:
        return JSONResponse(content={"error": "Arquivo CSV inválido."}, status_code=400)
    if os.path.exists(INGREDIENTES_CSV):
        os.rename(INGREDIENTES_CSV, INGREDIENTES_CSV + ".bak")
    with open(INGREDIENTES_CSV, "wb") as f:
        f.write(contents)
    return JSONResponse(content={"message": "Importação concluída!"})

@app.post("/import/encomendas")
def import_encomendas(file: UploadFile = File(...)):
    contents = file.file.read()
    if len(contents) > 2 * 1024 * 1024:
        return JSONResponse(content={"error": "Arquivo muito grande."}, status_code=400)
    if not file.filename.endswith('.csv'):
        return JSONResponse(content={"error": "Tipo de arquivo inválido."}, status_code=400)
    try:
        csv.Sniffer().sniff(contents.decode('utf-8'))
    except Exception:
        return JSONResponse(content={"error": "Arquivo CSV inválido."}, status_code=400)
    if os.path.exists(ENCOMENDAS_CSV):
        os.rename(ENCOMENDAS_CSV, ENCOMENDAS_CSV + ".bak")
    with open(ENCOMENDAS_CSV, "wb") as f:
        f.write(contents)
    return JSONResponse(content={"message": "Importação concluída!"})

@app.post("/import/clientes")
def import_clientes(file: UploadFile = File(...)):
    contents = file.file.read()
    if len(contents) > 2 * 1024 * 1024:
        return JSONResponse(content={"error": "Arquivo muito grande."}, status_code=400)
    if not file.filename.endswith('.csv'):
        return JSONResponse(content={"error": "Tipo de arquivo inválido."}, status_code=400)
    try:
        csv.Sniffer().sniff(contents.decode('utf-8'))
    except Exception:
        return JSONResponse(content={"error": "Arquivo CSV inválido."}, status_code=400)
    if os.path.exists(CLIENTES_CSV):
        os.rename(CLIENTES_CSV, CLIENTES_CSV + ".bak")
    with open(CLIENTES_CSV, "wb") as f:
        f.write(contents)
    return JSONResponse(content={"message": "Importação concluída!"})

@app.post("/import/produtos")
def import_produtos(file: UploadFile = File(...)):
    contents = file.file.read()
    if len(contents) > 2 * 1024 * 1024:
        return JSONResponse(content={"error": "Arquivo muito grande."}, status_code=400)
    if not file.filename.endswith('.csv'):
        return JSONResponse(content={"error": "Tipo de arquivo inválido."}, status_code=400)
    try:
        csv.Sniffer().sniff(contents.decode('utf-8'))
    except Exception:
        return JSONResponse(content={"error": "Arquivo CSV inválido."}, status_code=400)
    if os.path.exists(PRODUTOS_CSV):
        os.rename(PRODUTOS_CSV, PRODUTOS_CSV + ".bak")
    with open(PRODUTOS_CSV, "wb") as f:
        f.write(contents)
    return JSONResponse(content={"message": "Importação concluída!"})

@app.get("/export/ingredientes")
def export_ingredientes():
    return FileResponse(INGREDIENTES_CSV, media_type='text/csv', filename='ingredientes.csv')

@app.get("/export/encomendas")
def export_encomendas():
    return FileResponse(ENCOMENDAS_CSV, media_type='text/csv', filename='encomendas.csv')

@app.get("/export/clientes")
def export_clientes():
    return FileResponse(CLIENTES_CSV, media_type='text/csv', filename='clientes.csv')

@app.post("/produtos/")
def criar_produto(produto: Produto):
    produtos = read_csv(PRODUTOS_CSV, Produto)
    produtos.append(produto)
    write_csv(PRODUTOS_CSV, produtos, ['id', 'nome', 'preco', 'estoque'], Produto)
    return produto

@app.get("/produtos/")
def listar_produtos():
    return read_csv(PRODUTOS_CSV, Produto)

@app.put("/produtos/{produto_id}")
def atualizar_produto(produto_id: int, produto: Produto):
    produtos = read_csv(PRODUTOS_CSV, Produto)
    updated = False
    for idx, p in enumerate(produtos):
        if p.id == produto_id:
            produtos[idx] = produto
            updated = True
            break
    if not updated:
        return JSONResponse(content={"error": "Produto não encontrado."}, status_code=404)
    write_csv(PRODUTOS_CSV, produtos, ['id', 'nome', 'preco', 'estoque'], Produto)
    return produto

@app.delete("/produtos/{produto_id}")
def deletar_produto(produto_id: int):
    produtos = read_csv(PRODUTOS_CSV, Produto)
    new_produtos = [p for p in produtos if p.id != produto_id]
    if len(new_produtos) == len(produtos):
        return JSONResponse(content={"error": "Produto não encontrado."}, status_code=404)
    write_csv(PRODUTOS_CSV, new_produtos, ['id', 'nome', 'preco', 'estoque'], Produto)
    return JSONResponse(content={"message": "Produto removido com sucesso."})

@app.get("/export/produtos")
def export_produtos():
    return FileResponse(PRODUTOS_CSV, media_type='text/csv', filename='produtos.csv')

# Utility functions for receitas

def read_receitas_csv():
    items = []
    if not os.path.exists(RECEITAS_CSV):
        return items
    with open(RECEITAS_CSV, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            row['id'] = int(row['id'])
            import ast
            row['ingredientes'] = [ReceitaIngrediente(**i) for i in ast.literal_eval(row['ingredientes'])]
            items.append(Receita(**row))
    return items

def write_receitas_csv(items):
    with open(RECEITAS_CSV, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'nome', 'descricao', 'ingredientes']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for item in items:
            data = item.dict()
            data['ingredientes'] = str([i.dict() for i in item.ingredientes])
            # Escape all fields
            for k in data:
                data[k] = escape_csv_field(data[k])
            writer.writerow(data)

@app.post("/receitas/")
def criar_receita(receita: Receita):
    receitas = read_receitas_csv()
    receitas.append(receita)
    write_receitas_csv(receitas)
    return receita

@app.get("/receitas/")
def listar_receitas():
    return read_receitas_csv()

@app.put("/receitas/{receita_id}")
def atualizar_receita(receita_id: int, receita: Receita):
    receitas = read_receitas_csv()
    updated = False
    for idx, r in enumerate(receitas):
        if r.id == receita_id:
            receitas[idx] = receita
            updated = True
            break
    if not updated:
        return JSONResponse(content={"error": "Receita não encontrada."}, status_code=404)
    write_receitas_csv(receitas)
    return receita

@app.delete("/receitas/{receita_id}")
def deletar_receita(receita_id: int):
    receitas = read_receitas_csv()
    new_receitas = [r for r in receitas if r.id != receita_id]
    if len(new_receitas) == len(receitas):
        return JSONResponse(content={"error": "Receita não encontrada."}, status_code=404)
    write_receitas_csv(new_receitas)
    return JSONResponse(content={"message": "Receita removida com sucesso."})

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Starting FastAPI application...")
        import uvicorn
        logger.info("Current working directory: %s", os.getcwd())
        logger.info("Checking CSV files...")
        for csv_file in [CLIENTES_CSV, INGREDIENTES_CSV, ENCOMENDAS_CSV, PRODUTOS_CSV, RECEITAS_CSV]:
            logger.info("Checking %s: %s", csv_file, "exists" if os.path.exists(csv_file) else "missing")
        
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="debug")
    except Exception as e:
        logger.error("Failed to start application: %s", str(e), exc_info=True)
        input("Press Enter to exit...")
        sys.exit(1)
