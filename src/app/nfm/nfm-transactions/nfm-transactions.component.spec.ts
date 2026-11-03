import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfmTransactionsComponent } from './nfm-transactions.component';

describe('NfmTransactionsComponent', () => {
  let component: NfmTransactionsComponent;
  let fixture: ComponentFixture<NfmTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NfmTransactionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NfmTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
