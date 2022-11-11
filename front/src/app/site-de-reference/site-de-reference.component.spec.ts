import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ToastrModule } from "ngx-toastr";
import { SiteDeReferenceComponent } from "./site-de-reference.component";
import { MatDialogModule } from "@angular/material/dialog";

describe("SiteDeReferenceComponent", () => {
  let component: SiteDeReferenceComponent;
  let fixture: ComponentFixture<SiteDeReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteDeReferenceComponent],
      imports: [HttpClientModule, ToastrModule.forRoot(), MatDialogModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteDeReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should valid urlList", () => {
    expect(component.urlList.length > 0);
  });
});
