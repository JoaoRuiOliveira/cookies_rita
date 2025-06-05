import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncomendaListaComponent } from './encomenda-lista.component';

describe('EncomendaListaComponent', () => {
  let component: EncomendaListaComponent;
  let fixture: ComponentFixture<EncomendaListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncomendaListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncomendaListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
