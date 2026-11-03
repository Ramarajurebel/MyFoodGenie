import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepLunchDinnerComponent } from './prep-lunch-dinner.component';

describe('PrepLunchDinnerComponent', () => {
  let component: PrepLunchDinnerComponent;
  let fixture: ComponentFixture<PrepLunchDinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrepLunchDinnerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrepLunchDinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
