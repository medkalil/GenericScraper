import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechercheDataTablesComponent } from './recherche-data-tables.component';

describe('RechercheDataTablesComponent', () => {
  let component: RechercheDataTablesComponent;
  let fixture: ComponentFixture<RechercheDataTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RechercheDataTablesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RechercheDataTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
