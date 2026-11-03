import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementorderComponent } from './movementorder.component';

describe('MovementorderComponent', () => {
  let component: MovementorderComponent;
  let fixture: ComponentFixture<MovementorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovementorderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovementorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
