import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSiteManuelComponent } from './add-site-manuel.component';

describe('AddSiteManuelComponent', () => {
  let component: AddSiteManuelComponent;
  let fixture: ComponentFixture<AddSiteManuelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSiteManuelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSiteManuelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
