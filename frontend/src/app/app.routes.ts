import { Routes } from '@angular/router';
import { ReceitaListaComponent } from './components/receita-lista/receita-lista.component';
import { CalendarComponent } from './components/calendar/calendar.component';

export const routes: Routes = [
  { path: '', redirectTo: 'receitas', pathMatch: 'full' },
  { path: 'receitas', component: ReceitaListaComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: '**', redirectTo: 'receitas' }
];
