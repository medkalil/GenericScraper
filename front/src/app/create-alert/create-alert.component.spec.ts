//import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
/* import { ReactiveFormsModule } from "@angular/forms";
import { MatAutocomplete } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { ToastrModule } from "ngx-toastr";
 */
import { CreateAlertComponent } from "./create-alert.component";

describe("CreateAlertComponent", () => {
  let component: CreateAlertComponent;
  let fixture: ComponentFixture<CreateAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateAlertComponent],
      imports: [],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});

//test only 1 file.
//  ng test --include='**/create-alert.component.spec.ts'
