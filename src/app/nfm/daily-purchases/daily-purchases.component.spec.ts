import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyPurchasesComponent } from './daily-purchases.component';

describe('DailyPurchasesComponent', () => {
  let component: DailyPurchasesComponent;
  let fixture: ComponentFixture<DailyPurchasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyPurchasesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyPurchasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
