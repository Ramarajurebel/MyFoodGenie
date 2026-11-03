import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfmDashboardComponent } from './nfm-dashboard.component';

describe('NfmDashboardComponent', () => {
  let component: NfmDashboardComponent;
  let fixture: ComponentFixture<NfmDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NfmDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NfmDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
