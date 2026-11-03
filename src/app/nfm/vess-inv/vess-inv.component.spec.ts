import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VessInvComponent } from './vess-inv.component';

describe('VessInvComponent', () => {
  let component: VessInvComponent;
  let fixture: ComponentFixture<VessInvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VessInvComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VessInvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
