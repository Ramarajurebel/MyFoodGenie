import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IteminventoryComponent } from './iteminventory.component';

describe('IteminventoryComponent', () => {
  let component: IteminventoryComponent;
  let fixture: ComponentFixture<IteminventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IteminventoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IteminventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
