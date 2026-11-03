import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsChildComponent } from './events-child.component';

describe('EventsChildComponent', () => {
  let component: EventsChildComponent;
  let fixture: ComponentFixture<EventsChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventsChildComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
