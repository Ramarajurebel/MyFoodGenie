import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductqrComponent } from './productqr.component';

describe('ProductqrComponent', () => {
  let component: ProductqrComponent;
  let fixture: ComponentFixture<ProductqrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductqrComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductqrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
