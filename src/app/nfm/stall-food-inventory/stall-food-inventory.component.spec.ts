import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallFoodInventoryComponent } from './stall-food-inventory.component';

describe('StallFoodInventoryComponent', () => {
  let component: StallFoodInventoryComponent;
  let fixture: ComponentFixture<StallFoodInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StallFoodInventoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallFoodInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
