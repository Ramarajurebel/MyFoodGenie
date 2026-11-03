import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdsListComponent } from './prods-list.component';

describe('ProdsListComponent', () => {
  let component: ProdsListComponent;
  let fixture: ComponentFixture<ProdsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProdsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
