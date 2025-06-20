import csv
import os
import ast
from typing import List, Type, TypeVar
from pydantic import BaseModel
from models.base_models import Cliente, Ingrediente, Encomenda, Produto, ReceitaIngrediente, Receita

T = TypeVar('T', bound=BaseModel)

class CSVService:
    @staticmethod
    def escape_csv_field(value) -> str:
        """Escape CSV field to prevent formula injection"""
        if isinstance(value, str) and value and value[0] in ('=', '+', '-', '@'):
            return "'" + value
        return str(value)

    @staticmethod
    def read_csv(file_path: str, model_class: Type[T]) -> List[T]:
        """Read CSV file and return list of model instances"""
        items = []
        if not os.path.exists(file_path):
            return items
        
        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                try:
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
                        row['ingredientes'] = [Ingrediente(**i) for i in ast.literal_eval(row['ingredientes'])]
                        row['timestamp'] = row.get('timestamp', '')
                        row['data_entrega'] = row.get('data_entrega', '')
                        items.append(Encomenda(**row))
                    elif model_class == Produto:
                        row['id'] = int(row['id'])
                        row['preco'] = float(row['preco'])
                        row['estoque'] = int(row['estoque'])
                        items.append(Produto(**row))
                    elif model_class == Receita:
                        row['id'] = int(row['id'])
                        # Safely evaluate 'ingredientes' field
                        ingredientes_str = row.get('ingredientes', '[]')
                        try:
                            ingredientes_list = ast.literal_eval(ingredientes_str)
                            row['ingredientes'] = [ReceitaIngrediente(**i) for i in ingredientes_list]
                        except (ValueError, SyntaxError):
                            row['ingredientes'] = [] # Default to empty list on parsing error
                        items.append(Receita(**row))
                except (ValueError, KeyError, TypeError) as e:
                    print(f"Error processing row: {row}. Error: {e}") # Or use a proper logger
        
        return items

    @staticmethod
    def write_csv(file_path: str, items: List[T], fieldnames: List[str], model_class: Type[T]) -> None:
        """Write list of model instances to CSV file"""
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for item in items:
                data = item.dict()
                if model_class == Encomenda:
                    data['ingredientes'] = str([i.dict() for i in item.ingredientes])
                elif model_class == Receita:
                    data['ingredientes'] = str([i.dict() for i in getattr(item, 'ingredientes', [])])
                
                # Ensure all fieldnames are present in data, add empty string if not
                for field in fieldnames:
                    if field not in data:
                        data[field] = ""

                # Escape all fields
                for k in data:
                    data[k] = CSVService.escape_csv_field(data[k])
                writer.writerow({k: data.get(k, "") for k in fieldnames}) 