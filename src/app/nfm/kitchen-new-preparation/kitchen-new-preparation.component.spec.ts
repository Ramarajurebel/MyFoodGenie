import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenNewPreparationComponent } from './kitchen-new-preparation.component';

describe('KitchenNewPreparationComponent', () => {
  let component: KitchenNewPreparationComponent;
  let fixture: ComponentFixture<KitchenNewPreparationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KitchenNewPreparationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KitchenNewPreparationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
