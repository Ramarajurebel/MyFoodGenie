import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookingLunchDinnerComponent } from './cooking-lunch-dinner.component';

describe('CookingLunchDinnerComponent', () => {
  let component: CookingLunchDinnerComponent;
  let fixture: ComponentFixture<CookingLunchDinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CookingLunchDinnerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookingLunchDinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
