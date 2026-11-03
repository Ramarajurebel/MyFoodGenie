import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRateCardComponent } from './purchase-rate-card.component';

describe('PurchaseRateCardComponent', () => {
  let component: PurchaseRateCardComponent;
  let fixture: ComponentFixture<PurchaseRateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseRateCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseRateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
