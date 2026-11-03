import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvtIngrReportComponent } from './evt-ingr-report.component';

describe('EvtIngrReportComponent', () => {
  let component: EvtIngrReportComponent;
  let fixture: ComponentFixture<EvtIngrReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvtIngrReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvtIngrReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
