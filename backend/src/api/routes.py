from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from datetime import datetime
import os
import json
from typing import List
import logging

from models.base_models import Cliente, Ingrediente, Encomenda, Produto, Receita, CalendarEvent
from services.csv_service import CSVService
from config.settings import (
    CLIENTES_CSV, INGREDIENTES_CSV, ENCOMENDAS_CSV, 
    PRODUTOS_CSV, RECEITAS_CSV, CALENDAR_EVENTS_JSON, MAX_FILE_SIZE
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
    CSVService.write_csv(str(CLIENTES_CSV), clientes, ['id', 'nome', 'email', 'contacto'], Cliente)
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
    with open(RECEITAS_CSV, "wb") as f:
        f.write(contents)
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

@router.get("/export/receitas")
def export_receitas():
    return FileResponse(str(RECEITAS_CSV), media_type='text/csv', filename='receitas.csv')

# Calendar endpoints
@router.get("/calendar-events/")
def get_calendar_events():
    """Get all calendar events including orders from encomendas.csv"""
    try:
        events = []
        
        # Get orders from encomendas.csv and convert them to calendar events
        encomendas = CSVService.read_csv(str(ENCOMENDAS_CSV), Encomenda)
        clientes = CSVService.read_csv(str(CLIENTES_CSV), Cliente)
        
        for order in encomendas:
            # Find client name
            client_name = f"Cliente {order.cliente_id}"
            for client in clientes:
                if client.id == order.cliente_id:
                    client_name = client.nome
                    break
            
            # Create calendar event from order
            order_event = {
                "id": f"order_{order.id}",
                "title": f"Encomenda #{order.id} - {client_name}",
                "date": order.data_entrega.isoformat() if hasattr(order.data_entrega, 'isoformat') else str(order.data_entrega),
                "description": f"Entrega de encomenda - Total: €{order.total}",
                "isImportant": True,
                "category": "order",
                "order_id": order.id,
                "client_name": client_name,
                "total": order.total
            }
            events.append(order_event)
        
        # Also get any additional calendar events from the JSON file (for non-order events)
        if os.path.exists(CALENDAR_EVENTS_JSON):
            try:
                with open(CALENDAR_EVENTS_JSON, 'r', encoding='utf-8') as f:
                    additional_events = json.load(f)
                    # Only add events that are not orders (to avoid duplicates)
                    for event in additional_events:
                        if event.get('category') != 'order':
                            events.append(event)
            except Exception as e:
                logging.error(f"Error reading additional calendar events: {e}")
        
        return events
    except Exception as e:
        logging.error(f"Error reading calendar events: {e}")
        return []

@router.get("/calendar-events/orders/")
def get_order_events():
    """Get calendar events specifically for orders and deliveries"""
    try:
        events = get_calendar_events()
        order_events = [e for e in events if e.get('category') in ['delivery', 'order']]
        return order_events
    except Exception as e:
        logging.error(f"Error getting order events: {e}")
        return []

@router.post("/calendar-events/create-from-order/")
def create_calendar_event_from_order(order_id: int):
    """Create a calendar event from an existing order (now handled automatically)"""
    try:
        # Get the order
        encomendas = CSVService.read_csv(str(ENCOMENDAS_CSV), Encomenda)
        order = None
        for e in encomendas:
            if e.id == order_id:
                order = e
                break
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get client info
        clientes = CSVService.read_csv(str(CLIENTES_CSV), Cliente)
        client = None
        for c in clientes:
            if c.id == order.cliente_id:
                client = c
                break
        
        # Create delivery event
        delivery_event = {
            "id": f"order_{order_id}",
            "title": f"Encomenda #{order_id} - {client.nome if client else f'Cliente {order.cliente_id}'}",
            "date": order.data_entrega.isoformat() if hasattr(order.data_entrega, 'isoformat') else str(order.data_entrega),
            "description": f"Entrega de encomenda - Total: €{order.total}",
            "isImportant": True,
            "category": "order",
            "order_id": order_id,
            "client_name": client.nome if client else f"Cliente {order.cliente_id}",
            "total": order.total
        }
        
        return delivery_event
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating calendar event from order: {e}")
        raise HTTPException(status_code=500, detail="Error creating calendar event from order")

@router.post("/calendar-events/")
def create_calendar_event(event: CalendarEvent):
    """Create a new calendar event (for non-order events)"""
    try:
        # Only allow non-order events to be created manually
        if event.category == 'order':
            raise HTTPException(status_code=400, detail="Order events are created automatically from encomendas.csv")
        
        events = []
        if os.path.exists(CALENDAR_EVENTS_JSON):
            with open(CALENDAR_EVENTS_JSON, 'r', encoding='utf-8') as f:
                events = json.load(f)
        
        # Generate ID if not provided
        if event.id is None:
            event.id = max([e.get('id', 0) for e in events], default=0) + 1
        
        event_dict = event.dict()
        events.append(event_dict)
        
        with open(CALENDAR_EVENTS_JSON, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=2, ensure_ascii=False)
        
        return event_dict
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating calendar event: {e}")
        raise HTTPException(status_code=500, detail="Error creating calendar event")

@router.put("/calendar-events/{event_id}")
def update_calendar_event(event_id: int, event: CalendarEvent):
    """Update an existing calendar event"""
    try:
        # Don't allow updating order events (they come from encomendas.csv)
        if event_id.startswith('order_') or event.category == 'order':
            raise HTTPException(status_code=400, detail="Order events cannot be updated manually")
        
        events = []
        if os.path.exists(CALENDAR_EVENTS_JSON):
            with open(CALENDAR_EVENTS_JSON, 'r', encoding='utf-8') as f:
                events = json.load(f)
        
        event_dict = event.dict()
        event_dict['id'] = event_id
        
        for i, existing_event in enumerate(events):
            if existing_event.get('id') == event_id:
                events[i] = event_dict
                with open(CALENDAR_EVENTS_JSON, 'w', encoding='utf-8') as f:
                    json.dump(events, f, indent=2, ensure_ascii=False)
                return event_dict
        
        raise HTTPException(status_code=404, detail="Calendar event not found")
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating calendar event: {e}")
        raise HTTPException(status_code=500, detail="Error updating calendar event")

@router.delete("/calendar-events/{event_id}")
def delete_calendar_event(event_id: int):
    """Delete a calendar event"""
    try:
        # Don't allow deleting order events (they come from encomendas.csv)
        if str(event_id).startswith('order_'):
            raise HTTPException(status_code=400, detail="Order events cannot be deleted manually")
        
        events = []
        if os.path.exists(CALENDAR_EVENTS_JSON):
            with open(CALENDAR_EVENTS_JSON, 'r', encoding='utf-8') as f:
                events = json.load(f)
        
        original_length = len(events)
        events = [e for e in events if e.get('id') != event_id]
        
        if len(events) == original_length:
            raise HTTPException(status_code=404, detail="Calendar event not found")
        
        with open(CALENDAR_EVENTS_JSON, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=2, ensure_ascii=False)
        
        return {"message": "Calendar event deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting calendar event: {e}")
        raise HTTPException(status_code=500, detail="Error deleting calendar event")

@router.post("/calendar-events/import/")
def import_calendar_events(file: UploadFile = File(...)):
    """Import calendar events from JSON file (for non-order events only)"""
    try:
        if len(file.file.read()) > MAX_FILE_SIZE:
            return JSONResponse(content={"error": "File too large."}, status_code=400)
        
        file.file.seek(0)  # Reset file pointer
        if not file.filename.endswith('.json'):
            return JSONResponse(content={"error": "Invalid file type. Please upload a JSON file."}, status_code=400)
        
        content = file.file.read().decode('utf-8')
        events = json.loads(content)
        
        # Validate events structure
        if not isinstance(events, list):
            return JSONResponse(content={"error": "Invalid JSON format. Expected an array of events."}, status_code=400)
        
        # Filter out order events (they come from encomendas.csv)
        non_order_events = [e for e in events if e.get('category') != 'order']
        
        with open(CALENDAR_EVENTS_JSON, 'w', encoding='utf-8') as f:
            json.dump(non_order_events, f, indent=2, ensure_ascii=False)
        
        return JSONResponse(content={"message": "Calendar events imported successfully!"})
    except json.JSONDecodeError:
        return JSONResponse(content={"error": "Invalid JSON file."}, status_code=400)
    except Exception as e:
        logging.error(f"Error importing calendar events: {e}")
        return JSONResponse(content={"error": "Error importing calendar events."}, status_code=500)

@router.get("/calendar-events/export/")
def export_calendar_events():
    """Export calendar events as JSON file (including orders from encomendas.csv)"""
    try:
        events = get_calendar_events()
        today = datetime.now().strftime("%Y-%m-%d")
        filename = f"calendar-events-{today}.json"
        
        # Create temporary file for download
        temp_file = CALENDAR_EVENTS_JSON.parent / filename
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=2, ensure_ascii=False)
        
        return FileResponse(
            str(temp_file), 
            media_type='application/json', 
            filename=filename
        )
    except Exception as e:
        logging.error(f"Error exporting calendar events: {e}")
        raise HTTPException(status_code=500, detail="Error exporting calendar events")