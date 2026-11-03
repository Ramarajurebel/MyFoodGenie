import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodInvComponent } from './food-inv.component';

describe('FoodInvComponent', () => {
  let component: FoodInvComponent;
  let fixture: ComponentFixture<FoodInvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoodInvComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodInvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
