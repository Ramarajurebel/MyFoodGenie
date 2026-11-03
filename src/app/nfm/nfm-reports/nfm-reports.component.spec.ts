import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfmReportsComponent } from './nfm-reports.component';

describe('NfmReportsComponent', () => {
  let component: NfmReportsComponent;
  let fixture: ComponentFixture<NfmReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NfmReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NfmReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
