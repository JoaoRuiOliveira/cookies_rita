from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from datetime import datetime
import os
from typing import List

from models.base_models import Cliente, Ingrediente, Encomenda, Produto, Receita
from services.csv_service import CSVService
from config.settings import (
    CLIENTES_CSV, INGREDIENTES_CSV, ENCOMENDAS_CSV, 
    PRODUTOS_CSV, RECEITAS_CSV, MAX_FILE_SIZE
)

router = APIRouter()

# Root endpoint
@router.get("/")
def read_root():
    return {"message": "Bem-vindo à API de Encomendas!"}

# Cliente endpoints
@router.post("/clientes/")
def criar_cliente(cliente: Cliente):
    clientes = CSVService.read_csv(str(CLIENTES_CSV), Cliente)
    clientes.append(cliente)
    clientes.sort(key=lambda x: x.id)
    CSVService.write_csv(str(CLIENTES_CSV), clientes, ['id', 'nome', 'email'], Cliente)
    return cliente

@router.get("/clientes/")
def listar_clientes():
    return CSVService.read_csv(str(CLIENTES_CSV), Cliente)

# Ingrediente endpoints
@router.post("/ingredientes/")
def adicionar_ingrediente(ingrediente: Ingrediente):
    ingredientes = CSVService.read_csv(str(INGREDIENTES_CSV), Ingrediente)
    ingredientes.append(ingrediente)
    ingredientes.sort(key=lambda x: x.id)
    CSVService.write_csv(str(INGREDIENTES_CSV), ingredientes, ['id', 'nome', 'quantidade'], Ingrediente)
    return ingrediente

@router.get("/ingredientes/")
def listar_ingredientes():
    return CSVService.read_csv(str(INGREDIENTES_CSV), Ingrediente)

# Encomenda endpoints
@router.post("/encomendas/")
def criar_encomenda(encomenda: Encomenda):
    # Set timestamp if not provided
    if not getattr(encomenda, 'timestamp', None):
        encomenda.timestamp = datetime.now().isoformat()
    encomendas = CSVService.read_csv(str(ENCOMENDAS_CSV), Encomenda)
    encomendas.append(encomenda)
    encomendas.sort(key=lambda x: x.id)
    CSVService.write_csv(
        str(ENCOMENDAS_CSV),
        encomendas,
        ['id', 'cliente_id', 'ingredientes', 'total', 'timestamp', 'data_entrega'],
        Encomenda
    )
    return encomenda

@router.get("/encomendas/")
def listar_encomendas():
    return CSVService.read_csv(str(ENCOMENDAS_CSV), Encomenda)

@router.put("/encomendas/{encomenda_id}")
def atualizar_encomenda(encomenda_id: int, encomenda: Encomenda):
    encomendas = CSVService.read_csv(str(ENCOMENDAS_CSV), Encomenda)
    updated = False
    for idx, e in enumerate(encomendas):
        if e.id == encomenda_id:
            encomendas[idx] = encomenda
            updated = True
            break
    if not updated:
        return JSONResponse(content={"error": "Encomenda não encontrada."}, status_code=404)
    CSVService.write_csv(
        str(ENCOMENDAS_CSV),
        encomendas,
        ['id', 'cliente_id', 'ingredientes', 'total', 'timestamp', 'data_entrega'],
        Encomenda
    )
    return encomenda

@router.delete("/encomendas/{encomenda_id}")
def deletar_encomenda(encomenda_id: int):
    encomendas = CSVService.read_csv(str(ENCOMENDAS_CSV), Encomenda)
    new_encomendas = [e for e in encomendas if e.id != encomenda_id]
    if len(new_encomendas) == len(encomendas):
        return JSONResponse(content={"error": "Encomenda não encontrada."}, status_code=404)
    CSVService.write_csv(
        str(ENCOMENDAS_CSV),
        new_encomendas,
        ['id', 'cliente_id', 'ingredientes', 'total', 'timestamp', 'data_entrega'],
        Encomenda
    )
    return JSONResponse(content={"message": "Encomenda removida com sucesso."})

# Import/Export endpoints
@router.post("/import/ingredientes")
def import_ingredientes(file: UploadFile = File(...)):
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        return JSONResponse(content={"error": "Arquivo muito grande."}, status_code=400)
    if not file.filename.endswith('.csv'):
        return JSONResponse(content={"error": "Tipo de arquivo inválido."}, status_code=400)
    try:
        import csv
        csv.Sniffer().sniff(contents.decode('utf-8'))
    except Exception:
        return JSONResponse(content={"error": "Arquivo CSV inválido."}, status_code=400)
    if os.path.exists(INGREDIENTES_CSV):
        os.rename(INGREDIENTES_CSV, str(INGREDIENTES_CSV) + ".bak")
    with open(INGREDIENTES_CSV, "wb") as f:
        f.write(contents)
    return JSONResponse(content={"message": "Importação concluída!"})

@router.post("/import/encomendas")
def import_encomendas(file: UploadFile = File(...)):
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        return JSONResponse(content={"error": "Arquivo muito grande."}, status_code=400)
    if not file.filename.endswith('.csv'):
        return JSONResponse(content={"error": "Tipo de arquivo inválido."}, status_code=400)
    try:
        import csv
        csv.Sniffer().sniff(contents.decode('utf-8'))
    except Exception:
        return JSONResponse(content={"error": "Arquivo CSV inválido."}, status_code=400)
    if os.path.exists(ENCOMENDAS_CSV):
        os.rename(ENCOMENDAS_CSV, str(ENCOMENDAS_CSV) + ".bak")
    with open(ENCOMENDAS_CSV, "wb") as f:
        f.write(contents)
    return JSONResponse(content={"message": "Importação concluída!"})

@router.post("/import/clientes")
def import_clientes(file: UploadFile = File(...)):
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        return JSONResponse(content={"error": "Arquivo muito grande."}, status_code=400)
    if not file.filename.endswith('.csv'):
        return JSONResponse(content={"error": "Tipo de arquivo inválido."}, status_code=400)
    try:
        import csv
        csv.Sniffer().sniff(contents.decode('utf-8'))
    except Exception:
        return JSONResponse(content={"error": "Arquivo CSV inválido."}, status_code=400)
    if os.path.exists(CLIENTES_CSV):
        os.rename(CLIENTES_CSV, str(CLIENTES_CSV) + ".bak")
    with open(CLIENTES_CSV, "wb") as f:
        f.write(contents)
    return JSONResponse(content={"message": "Importação concluída!"})

@router.post("/import/produtos")
def import_produtos(file: UploadFile = File(...)):
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        return JSONResponse(content={"error": "Arquivo muito grande."}, status_code=400)
    if not file.filename.endswith('.csv'):
        return JSONResponse(content={"error": "Tipo de arquivo inválido."}, status_code=400)
    try:
        import csv
        csv.Sniffer().sniff(contents.decode('utf-8'))
    except Exception:
        return JSONResponse(content={"error": "Arquivo CSV inválido."}, status_code=400)
    if os.path.exists(PRODUTOS_CSV):
        os.rename(PRODUTOS_CSV, str(PRODUTOS_CSV) + ".bak")
    with open(PRODUTOS_CSV, "wb") as f:
        f.write(contents)
    return JSONResponse(content={"message": "Importação concluída!"})

@router.post("/import/receitas")
def import_receitas(file: UploadFile = File(...)):
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        return JSONResponse(content={"error": "Arquivo muito grande."}, status_code=400)
    if not file.filename.endswith('.csv'):
        return JSONResponse(content={"error": "Tipo de arquivo inválido."}, status_code=400)
    try:
        import csv
        csv.Sniffer().sniff(contents.decode('utf-8'))
    except Exception:
        return JSONResponse(content={"error": "Arquivo CSV inválido."}, status_code=400)
    
    # Sort the CSV by ID before saving
    try:
        decoded_content = contents.decode('utf-8')
        lines = decoded_content.strip().split('\\n')
        header = lines[0]
        reader = csv.reader(lines[1:])
        # Sort by the first column (ID), converting to int for correct numeric sorting
        sorted_rows = sorted(reader, key=lambda row: int(row[0]))
        
        # Reconstruct the CSV content
        import io
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(header.split(','))
        writer.writerows(sorted_rows)
        sorted_contents = output.getvalue().encode('utf-8')
    except Exception as e:
        # If sorting fails, just use the original content but log the error
        print(f"Could not sort CSV, saving as is. Error: {e}")
        sorted_contents = contents

    if os.path.exists(RECEITAS_CSV):
        os.rename(RECEITAS_CSV, str(RECEITAS_CSV) + ".bak")
    with open(RECEITAS_CSV, "wb") as f:
        f.write(sorted_contents)
    return JSONResponse(content={"message": "Importação concluída!"})

# Export endpoints
@router.get("/export/ingredientes")
def export_ingredientes():
    return FileResponse(str(INGREDIENTES_CSV), media_type='text/csv', filename='ingredientes.csv')

@router.get("/export/encomendas")
def export_encomendas():
    return FileResponse(str(ENCOMENDAS_CSV), media_type='text/csv', filename='encomendas.csv')

@router.get("/export/clientes")
def export_clientes():
    return FileResponse(str(CLIENTES_CSV), media_type='text/csv', filename='clientes.csv')

# Produto endpoints
@router.post("/produtos/")
def criar_produto(produto: Produto):
    produtos = CSVService.read_csv(str(PRODUTOS_CSV), Produto)
    produtos.append(produto)
    produtos.sort(key=lambda x: x.id)
    CSVService.write_csv(str(PRODUTOS_CSV), produtos, ['id', 'nome', 'preco', 'estoque'], Produto)
    return produto

@router.get("/produtos/")
def listar_produtos():
    return CSVService.read_csv(str(PRODUTOS_CSV), Produto)

@router.put("/produtos/{produto_id}")
def atualizar_produto(produto_id: int, produto: Produto):
    produtos = CSVService.read_csv(str(PRODUTOS_CSV), Produto)
    updated = False
    for idx, p in enumerate(produtos):
        if p.id == produto_id:
            produtos[idx] = produto
            updated = True
            break
    if not updated:
        return JSONResponse(content={"error": "Produto não encontrado."}, status_code=404)
    CSVService.write_csv(str(PRODUTOS_CSV), produtos, ['id', 'nome', 'preco', 'estoque'], Produto)
    return produto

@router.delete("/produtos/{produto_id}")
def deletar_produto(produto_id: int):
    produtos = CSVService.read_csv(str(PRODUTOS_CSV), Produto)
    new_produtos = [p for p in produtos if p.id != produto_id]
    if len(new_produtos) == len(produtos):
        return JSONResponse(content={"error": "Produto não encontrado."}, status_code=404)
    CSVService.write_csv(str(PRODUTOS_CSV), new_produtos, ['id', 'nome', 'preco', 'estoque'], Produto)
    return JSONResponse(content={"message": "Produto removido com sucesso."})

@router.get("/export/produtos")
def export_produtos():
    return FileResponse(str(PRODUTOS_CSV), media_type='text/csv', filename='produtos.csv')

# Receita endpoints
@router.post("/receitas/")
def criar_receita(receita: Receita):
    receitas = CSVService.read_csv(str(RECEITAS_CSV), Receita)
    receitas.append(receita)
    receitas.sort(key=lambda x: x.id)
    CSVService.write_csv(str(RECEITAS_CSV), receitas, ['id', 'nome', 'descricao', 'ingredientes'], Receita)
    return receita

@router.get("/receitas/")
def listar_receitas():
    return CSVService.read_csv(str(RECEITAS_CSV), Receita)

@router.put("/receitas/{receita_id}")
def atualizar_receita(receita_id: int, receita: Receita):
    receitas = CSVService.read_csv(str(RECEITAS_CSV), Receita)
    updated = False
    for idx, r in enumerate(receitas):
        if r.id == receita_id:
            receitas[idx] = receita
            updated = True
            break
    if not updated:
        return JSONResponse(content={"error": "Receita não encontrada."}, status_code=404)
    CSVService.write_csv(str(RECEITAS_CSV), receitas, ['id', 'nome', 'descricao', 'ingredientes'], Receita)
    return receita

@router.delete("/receitas/{receita_id}")
def deletar_receita(receita_id: int):
    receitas = CSVService.read_csv(str(RECEITAS_CSV), Receita)
    new_receitas = [r for r in receitas if r.id != receita_id]
    if len(new_receitas) == len(receitas):
        return JSONResponse(content={"error": "Receita não encontrada."}, status_code=404)
    CSVService.write_csv(str(RECEITAS_CSV), new_receitas, ['id', 'nome', 'descricao', 'ingredientes'], Receita)
    return JSONResponse(content={"message": "Receita removida com sucesso."})