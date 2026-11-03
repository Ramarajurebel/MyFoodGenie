import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfmSaleTransactionsComponent } from './nfm-sale-transactions.component';

describe('NfmSaleTransactionsComponent', () => {
  let component: NfmSaleTransactionsComponent;
  let fixture: ComponentFixture<NfmSaleTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NfmSaleTransactionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NfmSaleTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
