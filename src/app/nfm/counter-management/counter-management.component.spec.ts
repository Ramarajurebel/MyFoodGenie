import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterManagementComponent } from './counter-management.component';

describe('CounterManagementComponent', () => {
  let component: CounterManagementComponent;
  let fixture: ComponentFixture<CounterManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CounterManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CounterManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
