import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityFrameworkComponent } from './entity-framework.component';

describe('EntityFrameworkComponent', () => {
  let component: EntityFrameworkComponent;
  let fixture: ComponentFixture<EntityFrameworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityFrameworkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityFrameworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
