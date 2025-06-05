import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceitaListaComponent } from './receita-lista.component';

describe('ReceitaListaComponent', () => {
  let component: ReceitaListaComponent;
  let fixture: ComponentFixture<ReceitaListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceitaListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceitaListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
