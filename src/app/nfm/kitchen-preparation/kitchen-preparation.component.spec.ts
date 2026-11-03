import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenPreparationComponent } from './kitchen-preparation.component';

describe('KitchenPreparationComponent', () => {
  let component: KitchenPreparationComponent;
  let fixture: ComponentFixture<KitchenPreparationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KitchenPreparationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KitchenPreparationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
