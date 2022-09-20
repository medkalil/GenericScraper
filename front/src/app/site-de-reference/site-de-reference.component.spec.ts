import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteDeReferenceComponent } from './site-de-reference.component';

describe('SiteDeReferenceComponent', () => {
  let component: SiteDeReferenceComponent;
  let fixture: ComponentFixture<SiteDeReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteDeReferenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteDeReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
