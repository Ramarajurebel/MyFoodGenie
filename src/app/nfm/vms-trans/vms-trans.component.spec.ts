import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsTransComponent } from './vms-trans.component';

describe('VmsTransComponent', () => {
  let component: VmsTransComponent;
  let fixture: ComponentFixture<VmsTransComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VmsTransComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VmsTransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
