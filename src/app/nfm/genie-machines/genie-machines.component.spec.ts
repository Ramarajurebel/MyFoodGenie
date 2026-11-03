import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenieMachinesComponent } from './genie-machines.component';

describe('GenieMachinesComponent', () => {
  let component: GenieMachinesComponent;
  let fixture: ComponentFixture<GenieMachinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenieMachinesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenieMachinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
