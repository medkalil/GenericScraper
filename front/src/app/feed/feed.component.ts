import { AfterViewInit, Component, OnInit } from "@angular/core";
import { QueryDbService } from "app/services/query-db.service";
import "rxjs/Rx";
import { Observable } from "rxjs/Rx";
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx'; 

@Component({
  selector: "app-feed",
  templateUrl: "./feed.component.html",
  styleUrls: ["./feed.component.scss"],
})
export class FeedComponent implements OnInit {
  rootList: any[];
  currentRoot: any;
  data: any;
  keys: any[];
  mot_cles: any[];
  selected_mot_cle: string;
  isWaiting = false;
  noUrlBtn = true;
  dataSelectedLeght = 0;
  selectedIndex: number;
  eventData: any;
  noData = false;
  noKeys = false;

  constructor(private queryDbService: QueryDbService) {}

  ngOnInit(): void {
    this.queryDbService.get_root_list().subscribe((res) => {
      this.rootList = res;
    });
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  getCurrentRoot(c) {
    this.currentRoot = c;
    console.log("currentRoot is here", this.currentRoot);
    this.isWaiting = true;
    this.noUrlBtn = true;

    this.queryDbService.get_root_data(this.currentRoot).subscribe((res) => {
      if (res.length == 0) {
        this.data = [];
        this.noData = true;
        this.isWaiting = false;
      } else {
        this.data = res;
        this.keys = Object.keys(res[0]);
        console.log("curre", this.data);
        console.log("keys", this.keys);
        this.isWaiting = false;
        this.noData = false;
        this.itemHaveUrl(this.data);
        this.dataSelectedLeght = this.data.length;
      }
    });
    this.queryDbService.get_mot_cles(this.currentRoot).subscribe((res) => {
      console.log("the mot cle res is ", res);

      if (res.length == 0) {
        this.noKeys = true;
        this.mot_cles = [];
      } else {
        this.mot_cles = res;
        console.log("mot_cles", this.mot_cles);
        this.mot_cles = Array.from(new Set(this.mot_cles));
      }
    });
  }

  selecting_mot_cle() {
    let value = (<HTMLSelectElement>document.getElementById("select_mot_cle"))
      .value;
    console.log("value is:", value);
    this.isWaiting = true;
    this.noUrlBtn = true;
    console.log("is wiautinh", this.isWaiting);
    this.queryDbService
      .filter_resulat_by_mot_cle(this.currentRoot, value)
      .subscribe((res) => {
        this.data = res;
        this.keys = Object.keys(res[0]);
        this.isWaiting = false;
        console.log("data CHANGES", this.data);
        this.itemHaveUrl(this.data);
        this.dataSelectedLeght = res.length;
        console.log("dataSelectedLeght:", this.dataSelectedLeght);
      });

    console.log("data CHANGES");
  }

  clickMe(item) {
    console.log("clickMe ", item);
    if (item["url"]) {
      console.log("url existe ");
      window.open(item["url"]);
    }
  }

  itemHaveUrl(data) {
    for (var val of data) {
      if (val["url"]) {
        this.noUrlBtn = false;
      } else {
        this.noUrlBtn = true;
      }
    }
  }

  scrolling_right() {
    var right = document.querySelector(".scol-container");
    right.scrollBy(350, 0);
    console.log("is right");
  }
  scrolling_left() {
    var right = document.querySelector(".scol-container");
    right.scrollBy(-350, 0);
    console.log("is left");
  }

  exportAsPDF(divId,currentRoot){
        console.log("expprting pdf",divId);
        let data = document.getElementById(divId);  
        html2canvas(data, { allowTaint: true }).then(canvas => {
          let HTML_Width = canvas.width;
          let HTML_Height = canvas.height;
          let top_left_margin = 15;
          let PDF_Width = HTML_Width + (top_left_margin * 2);
          let PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
          let canvas_image_width = HTML_Width;
          let canvas_image_height = HTML_Height;
          let totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;
          canvas.getContext('2d');
          let imgData = canvas.toDataURL("image/jpeg", 1.0);
          let pdf = new jspdf('p', 'pt', [PDF_Width, PDF_Height]);
          pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);
          for (let i = 1; i <= totalPDFPages; i++) {
            pdf.addPage([PDF_Width, PDF_Height], 'p');
            pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height);
          }
           pdf.save(`${currentRoot}.pdf`);
        });
    }

    exportAsCSV(currentRoot){
      console.log("csv data",this.data);
      const data = this.data;
      const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
      const header = Object.keys(data[0]);
      let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(header.join(','));
      let csvArray = csv.join('\r\n');
  
      var blob = new Blob(["\uFEFF"+csvArray], {type: 'text/csv; charset=utf-8' })
      saveAs(blob, `${currentRoot}.csv`);
    }

    exportAsXLSX(currentRoot){
      console.log("excel data",this.data);
       /* table id is passed over here */   
       let element = document.getElementById('excel-table'); 
       const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, `${currentRoot}.xlsx`);
    } 

}