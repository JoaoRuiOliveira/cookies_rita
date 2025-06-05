import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReceitaIngrediente {
  id: number;
  quantidade: number;
}

export interface Receita {
  id: number;
  nome: string;
  descricao: string;
  ingredientes: ReceitaIngrediente[];
}

@Injectable({
  providedIn: 'root'
})
export class ReceitaService {
  private apiUrl = 'http://127.0.0.1:8000/receitas';

  constructor(private http: HttpClient) { }

  getReceitas(): Observable<Receita[]> {
    return this.http.get<Receita[]>(this.apiUrl + '/');
  }

  adicionarReceita(receita: Receita): Observable<Receita> {
    return this.http.post<Receita>(this.apiUrl + '/', receita);
  }

  atualizarReceita(receita: Receita): Observable<Receita> {
    return this.http.put<Receita>(`${this.apiUrl}/${receita.id}`, receita);
  }

  deletarReceita(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 