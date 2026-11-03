import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenieInventoryComponent } from './genie-inventory.component';

describe('GenieInventoryComponent', () => {
  let component: GenieInventoryComponent;
  let fixture: ComponentFixture<GenieInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenieInventoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenieInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
