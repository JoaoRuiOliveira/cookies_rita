import { Component } from '@angular/core';
import { Receita, ReceitaIngrediente, ReceitaService } from '../../services/receita.service';
import { Ingrediente, IngredienteService } from '../../services/ingrediente.service';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-receita-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatIconModule, MatSelectModule],
  templateUrl: './receita-lista.component.html',
  styleUrl: './receita-lista.component.scss'
})
export class ReceitaListaComponent {
  receitas: Receita[] = [];
  ingredientesDisponiveis: Ingrediente[] = [];
  displayedColumns: string[] = ['id', 'nome', 'descricao', 'ingredientes', 'actions'];
  receitaForm: FormGroup;
  editMode: boolean = false;
  editingId: number | null = null;
  editForm: FormGroup | null = null;

  constructor(
    private receitaService: ReceitaService,
    private ingredienteService: IngredienteService,
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.receitaForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: ['', Validators.required],
      ingredientes: this.fb.array([])
    });
    this.loadReceitas();
    this.loadIngredientes();
  }

  get ingredientes(): FormArray {
    return this.receitaForm.get('ingredientes') as FormArray;
  }

  addIngrediente() {
    this.ingredientes.push(this.fb.group({
      id: [null, Validators.required],
      quantidade: [null, [Validators.required, Validators.min(1)]],
    }));
  }

  removerIngrediente(index: number) {
    this.ingredientes.removeAt(index);
  }

  loadReceitas() {
    this.receitaService.getReceitas().subscribe(data => {
      this.receitas = data;
    });
  }

  loadIngredientes() {
    this.ingredienteService.getIngredientes().subscribe(data => {
      this.ingredientesDisponiveis = data;
    });
  }

  adicionarReceita() {
    if (this.receitaForm.valid) {
      const nextId = this.receitas.length > 0 ? Math.max(...this.receitas.map(r => r.id)) + 1 : 1;
      const newReceita = { id: nextId, ...this.receitaForm.value };
      this.receitaService.adicionarReceita(newReceita).subscribe(() => {
        this.snackBar.open('Receita adicionada!', 'Fechar', { duration: 2000 });
        this.receitaForm.reset();
        this.receitaForm.setControl('ingredientes', this.fb.array([]));
        this.loadReceitas();
      });
    }
  }

  startEdit(receita: Receita) {
    this.editMode = true;
    this.editingId = receita.id;
    this.editForm = this.fb.group({
      id: [receita.id, Validators.required],
      nome: [receita.nome, Validators.required],
      descricao: [receita.descricao, Validators.required],
      ingredientes: this.fb.array(receita.ingredientes.map(ingr => this.fb.group({
        id: [ingr.id, Validators.required],
        quantidade: [ingr.quantidade, [Validators.required, Validators.pattern('^[1-9][0-9]*$')]]
      })))
    });
  }

  get editIngredientesFormArray(): FormArray {
    return this.editForm?.get('ingredientes') as FormArray;
  }

  addIngredienteToEditForm() {
    this.editIngredientesFormArray.push(this.fb.group({
      id: ['', Validators.required],
      quantidade: ['', [Validators.required, Validators.pattern('^[1-9][0-9]*$')]]
    }));
  }

  removeIngredienteFromEditForm(index: number) {
    this.editIngredientesFormArray.removeAt(index);
  }

  saveEdit(receita: Receita) {
    if (this.editForm && this.editForm.valid) {
      const updated = this.editForm.value;
      this.receitaService.atualizarReceita(updated).subscribe(() => {
        this.snackBar.open('Receita atualizada!', 'Fechar', { duration: 2000 });
        this.editMode = false;
        this.editingId = null;
        this.editForm = null;
        this.loadReceitas();
      });
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.editingId = null;
    this.editForm = null;
  }

  deleteReceita(receita: Receita) {
    if (confirm('Tem certeza que deseja remover esta receita?')) {
      this.receitaService.deletarReceita(receita.id).subscribe(() => {
        this.snackBar.open('Receita removida!', 'Fechar', { duration: 2000 });
        this.loadReceitas();
      });
    }
  }

  exportCSV() {
    // Export receitas as CSV
    const header = 'id,nome,descricao,ingredientes\n';
    const rows = this.receitas.map(r => `${r.id},"${r.nome}","${r.descricao}","${JSON.stringify(r.ingredientes)}"`).join('\n');
    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'receitas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      const lines = (text as string).split('\n').filter(l => l.trim());
      const receitas: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const [id, nome, descricao, ingredientes] = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
        receitas.push({
          id: Number(id),
          nome: nome.replace(/"/g, ''),
          descricao: descricao.replace(/"/g, ''),
          ingredientes: JSON.parse(ingredientes.replace(/"/g, ''))
        });
      }
      // Optionally, replace all receitas or merge
      this.receitas = receitas;
    };
    reader.readAsText(file);
  }

  getIngredienteNome(id: number): string {
    const ingrediente = this.ingredientesDisponiveis.find(i => i.id === id);
    return ingrediente ? ingrediente.nome : 'Ingrediente';
  }
}
