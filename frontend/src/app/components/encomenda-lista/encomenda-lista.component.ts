import { Component, ChangeDetectorRef } from '@angular/core';
import { Encomenda, EncomendaService, Ingrediente } from '../../services/encomenda.service';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { Produto, ProdutoService } from '../../services/produto.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Cliente, ClienteService } from '../../services/cliente.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-encomenda-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatIconModule, MatDividerModule, MatAutocompleteModule, MatSelectModule],
  templateUrl: './encomenda-lista.component.html',
  styleUrl: './encomenda-lista.component.scss'
})
export class EncomendaListaComponent {
  encomendas: Encomenda[] = [];
  produtos: Produto[] = [];
  clientes: Cliente[] = [];
  displayedColumns: string[] = ['id', 'cliente_id', 'ingredientes', 'total', 'timestamp', 'actions'];
  encomendaForm: FormGroup;
  editMode: boolean = false;
  editingId: number | null = null;

  constructor(
    private encomendaService: EncomendaService,
    private produtoService: ProdutoService,
    private clienteService: ClienteService,
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.encomendaForm = this.fb.group({
      cliente_id: ['', [Validators.required, Validators.pattern('^[1-9][0-9]*$')]],
      cliente_nome: ['', []],
      ingredientes: this.fb.array([], [this.atLeastOneItemValidator()])
    });
    this.loadEncomendas();
    this.loadProdutos();
    this.loadClientes();
    // Subscribe to ingredientes changes to update total in real time
    this.ingredientes.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  get ingredientes(): FormArray {
    return this.encomendaForm.get('ingredientes') as FormArray;
  }

  addIngrediente() {
    // Get the current value from the last added (or empty) ingredient form
    const newIngr = this.fb.group({
      id: ['', []],
      nome: ['', []],
      quantidade: ['', [Validators.required, Validators.pattern('^[1-9][0-9]*$')]]
    });
    // If there is a partially filled last row, use its values
    const ingrArr = this.ingredientes;
    let lastValue = ingrArr.length > 0 ? ingrArr.at(ingrArr.length - 1).value : null;
    if (lastValue && lastValue.nome && lastValue.quantidade) {
      // Check for duplicate by id or name
      const existingIdx = ingrArr.controls.findIndex(ctrl =>
        (ctrl.get('id')?.value && ctrl.get('id')?.value === lastValue.id) ||
        (ctrl.get('nome')?.value && ctrl.get('nome')?.value === lastValue.nome)
      );
      if (existingIdx !== -1 && existingIdx !== ingrArr.length - 1) {
        // Increase quantity of existing
        const existingCtrl = ingrArr.at(existingIdx);
        const currentQty = +existingCtrl.get('quantidade')?.value || 0;
        const addQty = +lastValue.quantidade || 0;
        existingCtrl.patchValue({ quantidade: currentQty + addQty });
        // Remove the duplicate row (last)
        ingrArr.removeAt(ingrArr.length - 1);
        this.snackBar.open('Produto já adicionado, quantidade aumentada.', 'Fechar', { duration: 2000 });
        return;
      }
    }
    ingrArr.push(newIngr);
  }

  loadEncomendas() {
    this.encomendaService.getEncomendas().subscribe(data => {
      this.encomendas = data;
    });
  }

  loadProdutos() {
    this.produtoService.getProdutos().subscribe(data => {
      this.produtos = data;
    });
  }

  loadClientes() {
    this.clienteService.getClientes().subscribe(data => {
      this.clientes = data;
    });
  }

  get total(): number {
    let sum = 0;
    this.ingredientes.controls.forEach(ingrGroup => {
      const id = ingrGroup.get('id')?.value;
      const quantidade = +ingrGroup.get('quantidade')?.value;
      if (!id || isNaN(quantidade) || quantidade <= 0) return;
      const produto = this.produtos.find(p => p.id === +id);
      if (produto) {
        sum += produto.preco * quantidade;
      }
    });
    return sum;
  }

  adicionarEncomenda() {
    if (this.encomendaForm.valid) {
      // Filter out ingredientes with invalid id
      const ingredientesValidos = this.ingredientes.controls
        .map(ctrl => {
          const ingr = ctrl.value;
          return {
            id: ingr.id,
            nome: ingr.nome,
            quantidade: parseFloat(ingr.quantidade)
          };
        })
        .filter(ingr => ingr.id && !isNaN(+ingr.id));
      // Check for duplicate product IDs
      const ids = ingredientesValidos.map(i => i.id);
      const hasDuplicates = ids.some((id, idx) => ids.indexOf(id) !== idx);
      if (hasDuplicates) {
        this.snackBar.open('Não é permitido adicionar o mesmo produto mais de uma vez no pedido.', 'Fechar', { duration: 2500 });
        return;
      }
      const encomendaData = {
        id: this.editMode && this.editingId !== null ? this.editingId : (this.encomendas.length > 0 ? Math.max(...this.encomendas.map(e => e.id)) + 1 : 1),
        cliente_id: this.encomendaForm.value.cliente_id,
        ingredientes: ingredientesValidos,
        total: parseFloat(this.total.toFixed(2)),
        timestamp: '' // Let backend set if not provided
      };
      if (this.editMode && this.editingId !== null) {
        this.encomendaService.atualizarEncomenda(encomendaData).subscribe(() => {
          this.snackBar.open('Pedido atualizado com sucesso!', 'Fechar', { duration: 2000 });
          this.encomendaForm.reset();
          this.encomendaForm.setControl('ingredientes', this.fb.array([]));
          this.editMode = false;
          this.editingId = null;
          this.loadEncomendas();
        });
      } else {
        this.encomendaService.adicionarEncomenda(encomendaData).subscribe(() => {
          this.snackBar.open('Pedido adicionado com sucesso!', 'Fechar', { duration: 2000 });
          this.encomendaForm.reset();
          this.encomendaForm.setControl('ingredientes', this.fb.array([]));
          this.loadEncomendas();
        });
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      this.http.post('http://127.0.0.1:8000/import/encomendas', formData).subscribe({
        next: () => {
          this.snackBar.open('Importação concluída!', 'Fechar', { duration: 2000 });
          this.loadEncomendas();
        },
        error: () => {
          this.snackBar.open('Erro ao importar CSV.', 'Fechar', { duration: 2000 });
        }
      });
    }
  }

  exportCSV() {
    this.http.get('http://127.0.0.1:8000/export/encomendas', { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'encomendas.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  startEdit(encomenda: Encomenda) {
    this.editMode = true;
    this.editingId = encomenda.id;
    this.encomendaForm.patchValue({
      cliente_id: encomenda.cliente_id
    });
    // Clear and repopulate ingredientes
    this.ingredientes.clear();
    encomenda.ingredientes.forEach(ingr => {
      this.ingredientes.push(this.fb.group({
        id: [ingr.id],
        nome: [ingr.nome, Validators.required],
        quantidade: [ingr.quantidade, [Validators.required, Validators.pattern('^[1-9][0-9]*$')]]
      }));
    });
  }

  deleteEncomenda(encomenda: Encomenda) {
    if (confirm('Tem certeza que deseja remover este pedido?')) {
      this.encomendaService.deletarEncomenda(encomenda.id).subscribe(() => {
        this.snackBar.open('Pedido removido com sucesso!', 'Fechar', { duration: 2000 });
        this.loadEncomendas();
        // If deleting the one being edited, reset form
        if (this.editMode && this.editingId === encomenda.id) {
          this.encomendaForm.reset();
          this.encomendaForm.setControl('ingredientes', this.fb.array([]));
          this.editMode = false;
          this.editingId = null;
        }
      });
    }
  }

  atLeastOneItemValidator(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const arr = formArray as FormArray;
      return arr && arr.length > 0 ? null : { atLeastOne: true };
    };
  }

  onProdutoIdSelected(i: number) {
    const ingrGroup = this.ingredientes.at(i);
    const id = ingrGroup.get('id')?.value;
    const produto = this.produtos.find(p => p.id === +id);
    if (produto) {
      ingrGroup.patchValue({ nome: produto.nome });
    }
  }

  onProdutoIdInput(i: number) {
    const ingrGroup = this.ingredientes.at(i);
    const id = ingrGroup.get('id')?.value;
    const produto = this.produtos.find(p => p.id === +id);
    if (produto) {
      ingrGroup.patchValue({ nome: produto.nome });
    }
  }

  onProdutoNomeSelected(i: number) {
    const ingrGroup = this.ingredientes.at(i);
    const nome = ingrGroup.get('nome')?.value;
    const produto = this.produtos.find(p => p.nome === nome);
    if (produto) {
      ingrGroup.patchValue({ id: produto.id });
    } else {
      ingrGroup.patchValue({ id: null });
    }
  }

  onProdutoNomeInput(i: number) {
    const ingrGroup = this.ingredientes.at(i);
    const nome = ingrGroup.get('nome')?.value;
    const produto = this.produtos.find(p => p.nome === nome);
    if (produto) {
      ingrGroup.patchValue({ id: produto.id });
    } else {
      ingrGroup.patchValue({ id: null });
    }
  }

  onClienteIdSelected() {
    const id = this.encomendaForm.get('cliente_id')?.value;
    const cliente = this.clientes.find(c => c.id === +id);
    if (cliente) {
      this.encomendaForm.patchValue({ cliente_nome: cliente.nome });
    }
  }

  onClienteIdInput() {
    const id = this.encomendaForm.get('cliente_id')?.value;
    const cliente = this.clientes.find(c => c.id === +id);
    if (cliente) {
      this.encomendaForm.patchValue({ cliente_nome: cliente.nome });
    }
  }

  onClienteNomeSelected() {
    const nome = this.encomendaForm.get('cliente_nome')?.value;
    const cliente = this.clientes.find(c => c.nome === nome);
    if (cliente) {
      this.encomendaForm.patchValue({ cliente_id: cliente.id });
    }
  }

  onClienteNomeInput() {
    const nome = this.encomendaForm.get('cliente_nome')?.value;
    const cliente = this.clientes.find(c => c.nome === nome);
    if (cliente) {
      this.encomendaForm.patchValue({ cliente_id: cliente.id });
    }
  }

  getClienteNome(id: number): string {
    const cliente = this.clientes.find(c => c.id === id);
    return cliente ? cliente.nome : id.toString();
  }

  get hasDuplicateIngredientes(): boolean {
    const ids = this.ingredientes.controls.map(ctrl => ctrl.get('id')?.value);
    return ids.some((id, idx) => id && ids.indexOf(id) !== idx);
  }

  isDuplicateRow(i: number): boolean {
    const ids = this.ingredientes.controls.map(ctrl => ctrl.get('id')?.value);
    const id = ids[i];
    return id && ids.indexOf(id) !== i;
  }

  get lastRowIncomplete(): boolean {
    if (this.ingredientes.length === 0) return false;
    const last = this.ingredientes.at(this.ingredientes.length - 1);
    return !last.get('nome')?.value || !last.get('quantidade')?.value;
  }

  removeIngrediente(i: number) {
    this.ingredientes.removeAt(i);
  }
}