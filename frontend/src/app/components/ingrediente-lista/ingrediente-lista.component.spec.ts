import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredienteListaComponent } from './ingrediente-lista.component';

describe('IngredienteListaComponent', () => {
  let component: IngredienteListaComponent;
  let fixture: ComponentFixture<IngredienteListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredienteListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngredienteListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
