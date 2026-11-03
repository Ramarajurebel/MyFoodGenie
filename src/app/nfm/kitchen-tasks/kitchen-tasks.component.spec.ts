import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenTasksComponent } from './kitchen-tasks.component';

describe('KitchenTasksComponent', () => {
  let component: KitchenTasksComponent;
  let fixture: ComponentFixture<KitchenTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KitchenTasksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KitchenTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
