import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpPaymentsComponent } from './emp-payments.component';

describe('EmpPaymentsComponent', () => {
  let component: EmpPaymentsComponent;
  let fixture: ComponentFixture<EmpPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmpPaymentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
