import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpGroupingComponent } from './emp-grouping.component';

describe('EmpGroupingComponent', () => {
  let component: EmpGroupingComponent;
  let fixture: ComponentFixture<EmpGroupingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmpGroupingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpGroupingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
