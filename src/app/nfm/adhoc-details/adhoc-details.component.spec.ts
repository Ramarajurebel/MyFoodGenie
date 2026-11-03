import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdhocDetailsComponent } from './adhoc-details.component';

describe('AdhocDetailsComponent', () => {
  let component: AdhocDetailsComponent;
  let fixture: ComponentFixture<AdhocDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdhocDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdhocDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
