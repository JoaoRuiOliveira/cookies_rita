import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ingrediente {
  id: number;
  nome: string;
  quantidade: number;
}

@Injectable({
  providedIn: 'root'
})
export class IngredienteService {
  private apiUrl = 'http://127.0.0.1:8000/ingredientes';

  constructor(private http: HttpClient) { }

  getIngredientes(): Observable<Ingrediente[]> {
    return this.http.get<Ingrediente[]>(this.apiUrl + '/');
  }

  adicionarIngrediente(ingrediente: Ingrediente): Observable<Ingrediente> {
    return this.http.post<Ingrediente>(this.apiUrl + '/', ingrediente);
  }
}
