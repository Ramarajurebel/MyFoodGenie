import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackingOrdersComponent } from './packing-orders.component';

describe('PackingOrdersComponent', () => {
  let component: PackingOrdersComponent;
  let fixture: ComponentFixture<PackingOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackingOrdersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackingOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
