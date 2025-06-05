import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ingrediente {
  id: number;
  nome: string;
  quantidade: number;
}

export interface Encomenda {
  id: number;
  cliente_id: number;
  ingredientes: Ingrediente[];
  total: number;
  timestamp: string; // ISO date string
}

@Injectable({
  providedIn: 'root'
})
export class EncomendaService {
  private apiUrl = 'http://127.0.0.1:8000/encomendas';

  constructor(private http: HttpClient) { }

  getEncomendas(): Observable<Encomenda[]> {
    return this.http.get<Encomenda[]>(this.apiUrl + '/');
  }

  adicionarEncomenda(encomenda: Encomenda): Observable<Encomenda> {
    return this.http.post<Encomenda>(this.apiUrl + '/', encomenda);
  }

  atualizarEncomenda(encomenda: Encomenda): Observable<Encomenda> {
    return this.http.put<Encomenda>(`${this.apiUrl}/${encomenda.id}`, encomenda);
  }

  deletarEncomenda(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
