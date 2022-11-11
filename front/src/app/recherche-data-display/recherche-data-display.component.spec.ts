import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RechercheDataDisplayComponent } from "./recherche-data-display.component";

describe("RechercheDataDisplayComponent", () => {
  let component: RechercheDataDisplayComponent;
  let fixture: ComponentFixture<RechercheDataDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RechercheDataDisplayComponent],
      imports: [HttpClientModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RechercheDataDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
