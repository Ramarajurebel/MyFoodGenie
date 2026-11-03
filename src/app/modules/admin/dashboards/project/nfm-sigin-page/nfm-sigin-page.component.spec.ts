import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfmSiginPageComponent } from './nfm-sigin-page.component';

describe('NfmSiginPageComponent', () => {
  let component: NfmSiginPageComponent;
  let fixture: ComponentFixture<NfmSiginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NfmSiginPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NfmSiginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
