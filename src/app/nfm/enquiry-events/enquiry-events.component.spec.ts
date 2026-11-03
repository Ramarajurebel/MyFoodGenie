import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryEventsComponent } from './enquiry-events.component';

describe('EnquiryEventsComponent', () => {
  let component: EnquiryEventsComponent;
  let fixture: ComponentFixture<EnquiryEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnquiryEventsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiryEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
