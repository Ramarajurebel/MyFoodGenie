import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfmRecipesComponent } from './nfm-recipes.component';

describe('NfmRecipesComponent', () => {
  let component: NfmRecipesComponent;
  let fixture: ComponentFixture<NfmRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NfmRecipesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NfmRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
