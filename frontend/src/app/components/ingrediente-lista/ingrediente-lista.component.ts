import { Component } from '@angular/core';
import { Ingrediente, IngredienteService } from '../../services/ingrediente.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-ingrediente-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatIconModule],
  templateUrl: './ingrediente-lista.component.html',
  styleUrl: './ingrediente-lista.component.scss'
})
export class IngredienteListaComponent {
  ingredientes: Ingrediente[] = [];
  displayedColumns: string[] = ['id', 'nome', 'quantidade', 'actions'];
  ingredienteForm: FormGroup;
  editingId: number | null = null;
  editForm: FormGroup | null = null;

  constructor(
    private ingredienteService: IngredienteService,
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.ingredienteForm = this.fb.group({
      nome: ['', Validators.required],
      quantidade: ['', Validators.required]
    });
    this.loadIngredientes();
  }

  loadIngredientes() {
    this.ingredienteService.getIngredientes().subscribe(data => {
      this.ingredientes = data;
    });
  }

  adicionarIngrediente() {
    if (this.ingredienteForm.valid) {
      const nextId = this.ingredientes.length > 0 ? Math.max(...this.ingredientes.map(i => i.id)) + 1 : 1;
      const newIngrediente = { id: nextId, ...this.ingredienteForm.value };
      this.ingredienteService.adicionarIngrediente(newIngrediente).subscribe(() => {
        this.snackBar.open('Ingrediente adicionado!', 'Fechar', { duration: 2000 });
        this.ingredienteForm.reset();
        this.loadIngredientes();
      });
    }
  }

  startEdit(ingrediente: Ingrediente) {
    this.editingId = ingrediente.id;
    this.editForm = this.fb.group({
      id: [ingrediente.id, Validators.required],
      nome: [ingrediente.nome, Validators.required],
      quantidade: [ingrediente.quantidade, Validators.required]
    });
  }

  saveEdit(ingrediente: Ingrediente) {
    if (this.editForm && this.editForm.valid) {
      const updated = this.editForm.value;
      this.ingredientes = this.ingredientes.map(i => i.id === ingrediente.id ? updated : i);
      this.saveAll();
      this.editingId = null;
      this.editForm = null;
      this.snackBar.open('Ingrediente atualizado!', 'Fechar', { duration: 2000 });
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = null;
  }

  deleteIngrediente(ingrediente: Ingrediente) {
    this.ingredientes = this.ingredientes.filter(i => i.id !== ingrediente.id);
    this.saveAll();
    this.snackBar.open('Ingrediente removido!', 'Fechar', { duration: 2000 });
  }

  saveAll() {
    const formData = new FormData();
    const csv = ['id,nome,quantidade', ...this.ingredientes.map(i => `${i.id},${i.nome},${i.quantidade}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    formData.append('file', blob, 'ingredientes.csv');
    this.http.post('http://127.0.0.1:8000/import/ingredientes', formData).subscribe(() => {
      this.loadIngredientes();
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      this.http.post('http://127.0.0.1:8000/import/ingredientes', formData).subscribe({
        next: () => {
          this.snackBar.open('Importação concluída!', 'Fechar', { duration: 2000 });
          this.loadIngredientes();
        },
        error: () => {
          this.snackBar.open('Erro ao importar CSV.', 'Fechar', { duration: 2000 });
        }
      });
    }
  }

  exportCSV() {
    this.http.get('http://127.0.0.1:8000/export/ingredientes', { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ingredientes.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  get nomeControl() {
    return this.editForm ? (this.editForm.get('nome') as import('@angular/forms').FormControl) : null;
  }

  get quantidadeControl() {
    return this.editForm ? (this.editForm.get('quantidade') as import('@angular/forms').FormControl) : null;
  }
}
