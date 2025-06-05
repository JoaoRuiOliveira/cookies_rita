import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ClienteListaComponent } from './components/cliente-lista/cliente-lista.component';
import { IngredienteListaComponent } from './components/ingrediente-lista/ingrediente-lista.component';
import { EncomendaListaComponent } from './components/encomenda-lista/encomenda-lista.component';
import { ReceitaListaComponent } from './components/receita-lista/receita-lista.component';
import { CalendarComponent } from './components/calendar/calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    ClienteListaComponent,
    IngredienteListaComponent,
    EncomendaListaComponent,
    ReceitaListaComponent,
    CalendarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'cookies-rita';
}
