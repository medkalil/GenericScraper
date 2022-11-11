import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Dashboardv2Component } from "./dashboardv2.component";

describe("Dashboardv2Component", () => {
  let component: Dashboardv2Component;
  let fixture: ComponentFixture<Dashboardv2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Dashboardv2Component],
      imports: [HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Dashboardv2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create dv2", () => {
    const fixture = TestBed.createComponent(Dashboardv2Component);
    const comp = fixture.debugElement.componentInstance;
    console.log("isinde :");
    expect(comp).toBeTruthy();
  });

  it("should have isDateData", () => {
    expect(component.isDateData[0] != "");
  });
});

//test only 1 file.
//  ng test --include='**/create-alert.component.spec.ts'
