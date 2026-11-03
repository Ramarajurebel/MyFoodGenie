import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewQrcodegeneratorComponent } from './new-qrcodegenerator.component';

describe('NewQrcodegeneratorComponent', () => {
  let component: NewQrcodegeneratorComponent;
  let fixture: ComponentFixture<NewQrcodegeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewQrcodegeneratorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewQrcodegeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
