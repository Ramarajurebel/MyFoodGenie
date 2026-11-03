import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfmOrdersComponent } from './nfm-orders.component';

describe('NfmOrdersComponent', () => {
  let component: NfmOrdersComponent;
  let fixture: ComponentFixture<NfmOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NfmOrdersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NfmOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
