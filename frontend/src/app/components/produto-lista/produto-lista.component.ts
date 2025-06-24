import { Component } from '@angular/core';
import { ProdutoService, Produto } from '../../services/produto.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-produto-lista',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './produto-lista.component.html',
  styleUrls: ['./produto-lista.component.scss']
})
export class ProdutoListaComponent {
  produtos: Produto[] = [];
  produtoForm: FormGroup;
  editMode: boolean = false;
  editingId: number | null = null;
  editForm: FormGroup | null = null;

  constructor(
    private produtoService: ProdutoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.produtoForm = this.fb.group({
      nome: ['', Validators.required],
      preco: [null, [Validators.required, Validators.min(0)]],
      estoque: [null, [Validators.required, Validators.min(0)]]
    });
    this.loadProdutos();
  }

  loadProdutos() {
    this.produtoService.getProdutos().subscribe(data => {
      this.produtos = data.sort((a, b) => a.id - b.id);
    });
  }

  adicionarProduto() {
    if (this.produtoForm.valid) {
      const nextId = this.produtos.length > 0 ? Math.max(...this.produtos.map(p => p.id)) + 1 : 1;
      const newProduto: Produto = { id: nextId, ...this.produtoForm.value };
      this.produtoService.adicionarProduto(newProduto).subscribe(() => {
        this.snackBar.open('Produto adicionado!', 'Fechar', { duration: 2000 });
        this.produtoForm.reset();
        this.loadProdutos();
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    if (file) {
      this.produtoService.importarProdutos(file).subscribe({
        next: () => {
          this.snackBar.open('Produtos importados com sucesso!', 'Fechar', { duration: 2000 });
          this.loadProdutos();
        },
        error: (err) => {
          this.snackBar.open(`Erro ao importar produtos: ${err.error.error || 'Erro desconhecido'}`, 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  startEdit(produto: Produto) {
    this.editMode = true;
    this.editingId = produto.id;
    this.editForm = this.fb.group({
      id: [produto.id, Validators.required],
      nome: [produto.nome, Validators.required],
      preco: [produto.preco, [Validators.required, Validators.min(0)]],
      estoque: [produto.estoque, [Validators.required, Validators.min(0)]]
    });
  }

  saveEdit(produto: Produto) {
    if (this.editForm && this.editForm.valid) {
      const updated = this.editForm.value;
      this.produtoService.atualizarProduto(updated).subscribe(() => {
        this.snackBar.open('Produto atualizado!', 'Fechar', { duration: 2000 });
        this.editMode = false;
        this.editingId = null;
        this.editForm = null;
        this.loadProdutos();
      });
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.editingId = null;
    this.editForm = null;
  }

  deleteProduto(produto: Produto) {
    this.produtoService.deletarProduto(produto.id).subscribe(() => {
      this.snackBar.open('Produto removido!', 'Fechar', { duration: 2000 });
      this.loadProdutos();
    });
  }

  exportCSV() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
    const header = 'id,nome,preco,estoque\n';
    const rows = this.produtos.map(p => `${p.id},"${p.nome}",${p.preco},${p.estoque}`).join('\n');
    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `produtos-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
} 