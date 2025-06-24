import { Routes } from '@angular/router';
import { ReceitaListaComponent } from './components/receita-lista/receita-lista.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ProdutoListaComponent } from './components/produto-lista/produto-lista.component';

export const routes: Routes = [
  { path: '', redirectTo: 'receitas', pathMatch: 'full' },
  { path: 'receitas', component: ReceitaListaComponent },
  { path: 'produtos', component: ProdutoListaComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: '**', redirectTo: 'receitas' }
];
