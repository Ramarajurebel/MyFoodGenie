import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenieManagementComponent } from './genie-management.component';

describe('GenieManagementComponent', () => {
  let component: GenieManagementComponent;
  let fixture: ComponentFixture<GenieManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenieManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenieManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
