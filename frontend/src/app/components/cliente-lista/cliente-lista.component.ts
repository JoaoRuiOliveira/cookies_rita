import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cliente, ClienteService } from '../../services/cliente.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [
    CommonModule, HttpClientModule, MatSnackBarModule, MatTableModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule
  ],
  templateUrl: './cliente-lista.component.html',
  styleUrl: './cliente-lista.component.scss'
})
export class ClienteListaComponent {
  clientes: Cliente[] = [];
  displayedColumns: string[] = ['id', 'nome', 'email', 'contacto', 'actions'];
  clienteForm: FormGroup;
  editingId: number | null = null;
  editForm: FormGroup | null = null;

  constructor(
    private clienteService: ClienteService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.clienteForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contacto: ['', Validators.required]
    });
    this.loadClientes();
  }

  loadClientes() {
    this.clienteService.getClientes().subscribe((data) => {
      this.clientes = data.map(c => ({
        ...c,
        contacto: c.contacto ?? ''
      }));
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      this.http.post('http://127.0.0.1:8000/import/clientes', formData).subscribe({
        next: () => {
          this.snackBar.open('Importação concluída!', 'Fechar', { duration: 2000 });
          this.loadClientes();
        },
        error: () => {
          this.snackBar.open('Erro ao importar CSV.', 'Fechar', { duration: 2000 });
        }
      });
    }
  }

  exportCSV() {
    this.http.get('http://127.0.0.1:8000/export/clientes', { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clientes.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  adicionarCliente() {
    if (this.clienteForm.valid) {
      const nextId = this.clientes.length > 0 ? Math.max(...this.clientes.map(c => c.id)) + 1 : 1;
      const newCliente = { id: nextId, ...this.clienteForm.value };
      this.clienteService.adicionarCliente(newCliente).subscribe(() => {
        this.snackBar.open('Cliente adicionado!', 'Fechar', { duration: 2000 });
        this.clienteForm.reset();
        this.loadClientes();
      });
    }
  }

  startEdit(cliente: Cliente) {
    this.editingId = cliente.id;
    this.editForm = this.fb.group({
      id: [cliente.id, Validators.required],
      nome: [cliente.nome, Validators.required],
      email: [cliente.email, [Validators.required, Validators.email]],
      contacto: [cliente.contacto, Validators.required]
    });
  }

  saveEdit(cliente: Cliente) {
    if (this.editForm && this.editForm.valid) {
      const updated = this.editForm.value;
      // Remove old, add updated (simulate update)
      this.clientes = this.clientes.map(c => c.id === cliente.id ? updated : c);
      // Save all to backend (overwrite CSV)
      this.http.post('http://127.0.0.1:8000/import/clientes', this.toCSVFormData(this.clientes)).subscribe(() => {
        this.snackBar.open('Cliente atualizado!', 'Fechar', { duration: 2000 });
        this.editingId = null;
        this.editForm = null;
        this.loadClientes();
      });
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = null;
  }

  deleteCliente(cliente: Cliente) {
    this.clientes = this.clientes.filter(c => c.id !== cliente.id);
    this.http.post('http://127.0.0.1:8000/import/clientes', this.toCSVFormData(this.clientes)).subscribe(() => {
      this.snackBar.open('Cliente removido!', 'Fechar', { duration: 2000 });
      this.loadClientes();
    });
  }

  toCSVFormData(clientes: Cliente[]): FormData {
    const formData = new FormData();
    const csv = ['id,nome,email,contacto', ...clientes.map(c => `${c.id},${c.nome},${c.email},${c.contacto}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    formData.append('file', blob, 'clientes.csv');
    return formData;
  }

  get nomeControl() {
    return this.editForm ? (this.editForm.get('nome') as import('@angular/forms').FormControl) : null;
  }

  get emailControl() {
    return this.editForm ? (this.editForm.get('email') as import('@angular/forms').FormControl) : null;
  }

  get contactoControl() {
    return this.editForm ? (this.editForm.get('contacto') as import('@angular/forms').FormControl) : null;
  }
}
