import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdhocItemDetailsComponent } from './adhoc-item-details.component';

describe('AdhocItemDetailsComponent', () => {
  let component: AdhocItemDetailsComponent;
  let fixture: ComponentFixture<AdhocItemDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdhocItemDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdhocItemDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
