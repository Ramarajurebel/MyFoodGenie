import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanToTextComponent } from './scan-to-text.component';

describe('ScanToTextComponent', () => {
  let component: ScanToTextComponent;
  let fixture: ComponentFixture<ScanToTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanToTextComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanToTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
