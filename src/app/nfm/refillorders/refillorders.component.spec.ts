import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefillordersComponent } from './refillorders.component';

describe('RefillordersComponent', () => {
  let component: RefillordersComponent;
  let fixture: ComponentFixture<RefillordersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefillordersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefillordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
