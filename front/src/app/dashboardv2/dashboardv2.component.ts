import { ThrowStmt } from "@angular/compiler";
import { Component, OnInit } from "@angular/core";
import { QueryDbService } from "app/services/query-db.service";
import * as Chartist from "chartist";

@Component({
  selector: "app-dashboardv2",
  templateUrl: "./dashboardv2.component.html",
  styleUrls: ["./dashboardv2.component.scss"],
})
export class Dashboardv2Component implements OnInit {
  rootList: string[];
  selectedRoot: any;
  selectedRootData: any[];
  selectedRootMotCleList: any[];
  selectedRootMotCleAndItemsList: any[] = []; // [(motCle,numberIfItems),....
  topMotCle: string;
  topMotClelength: number;
  topMotClePersentqge: number;
  topCategorie: string;
  topCategorielength: number;
  topCategoriePersentqge: number;
  chartBarData: any[] = [];
  chartPieData: any[] = [];
  websiteViewsChart: any;
  categoriePieChart: any;
  selectedRootDate: any[];
  selectedRootDateOccurence: number[];
  dates: any;
  isDateData: any[] = ["", ""];

  keys: any[];
  tableData: any[];

  constructor(private queryDbService: QueryDbService) {}

  startAnimationForLineChart(chart) {
    let seq: any, delays: any, durations: any;
    seq = 0;
    delays = 80;
    durations = 500;

    chart.on("draw", function (data) {
      if (data.type === "line" || data.type === "area") {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path
              .clone()
              .scale(1, 0)
              .translate(0, data.chartRect.height())
              .stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint,
          },
        });
      } else if (data.type === "point") {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: "ease",
          },
        });
      }
    });

    seq = 0;
  }

  startAnimationForBarChart(chart) {
    let seq2: any, delays2: any, durations2: any;

    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on("draw", function (data) {
      if (data.type === "bar") {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: "ease",
          },
        });
        //test/
        data.element.attr({
          style:
            "stroke: hsl(" +
            Math.floor((Chartist.getMultiValue(data.value) / 100) * 100) +
            ", 50%, 50%);",
        });
        //test/
      }
    });

    seq2 = 0;
  }

  startAnimationForPieChart(chart) {
    let seq2: any, delays2: any, durations2: any;

    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on("draw", function (data) {
      //console.log("hay lalalalal", data);

      if (data.type === "slice") {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: "ease",
          },
        });
        //test/
        data.element.attr({
          style:
            "stroke: hsl(" +
            Math.floor((Chartist.getMultiValue(data.value) / 100) * 100) +
            ", 50%, 50%);",
        });
        //test/
      }
    });

    seq2 = 0;
  }

  ngOnInit() {
    /*BEGIN: init for table data */
    this.tableData = [
      {
        classified_as: "Télécom",
        item0:
          "Supply of VHF radio Repeaters, Base radios, mobile radios, portable radios and their accessories under Framework Contract for Mara, Simiyu, Kagera, Mwanza, Geita Songwe,Njombe, Mbeya, Iringa, Songea, Rukwa, Lindi, Mtwara, …",
        item1: "Location Remaining time",
        item2:
          "Ongoing tenders\n      \n     \n   \n                   \n                   Tanzania",
        item3: "Location Remaining time",
        item4: "",
        item5: "08/24/2022",
      },
      {
        classified_as: "Télécom",
        item0:
          "Supply of Radio Mast for Tanesco Substation and offices for KIA, Karatu, Mzakwe, Kiteto, Kigoma, Urambo, Bariadi, Nyamongo, Nkasi, Sumbawanga, Newala, Mtwara, Kibaha, Ilala, Mikumi and Iyovi in Tanesco Substation …",
        item1: "Location Remaining time",
        item2:
          "Ongoing tenders\n      \n     \n   \n                   \n                   Tanzania",
        item3: "Location Remaining time",
        item4: "",
        item5: "08/22/2022",
      },
      {
        classified_as: "Télécom",
        item0:
          "Supply and Commissioning Of ICT Equipment (Laptops, Projectors, Printers and APC Smart Ups)",
        item1: "Location Remaining time",
        item2:
          "Ongoing tenders\n      \n     \n   \n                   \n                   Tanzania",
        item3: "Location Remaining time",
        item4: "5 days, 21 hours",
        item5: "08/18/2022",
      },
    ];
    this.keys = Object.keys(this.tableData[0]);
    this.selectedRoot = "Root";
    /*END: init for table data */

    this.getRootList();

    var pieData: any = {
      labels: ["M", "T", "W", "T", "F", "S", "S"],
      series: [12, 17, 7, 17, 23, 18, 38],
    };

    var pieOptions = {
      width: "200px",
      height: "180px",
      chartPadding: 30,
      labelOffset: 50,
      labelDirection: "explode",
    };
    this.categoriePieChart = new Chartist.Pie(
      "#ct-chart-pie",
      pieData,
      pieOptions
    );

    this.startAnimationForPieChart(this.categoriePieChart);

    /* ----------==========     Dates Chart initialization For Documentation    ==========---------- */
    var dataDates: any = {
      labels: [
        "27/07/2022",
        "18/07/2022",
        "27/06/2022",
        "16/07/2022",
        "13/02/2014",
      ],
      series: [[230, 750, 450, 300, 280]],
    };

    const optionsDates: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0,
      }),
      low: 0,
      //high: 100,
      chartPadding: { top: 5, right: 0, bottom: 20, left: 0 },
    };

    this.dates = new Chartist.Line("#dates", dataDates, optionsDates);

    this.startAnimationForLineChart(this.dates);

    /* ----------==========     Completed Tasks Chart initialization    ==========---------- */

    /*  const dataCompletedTasksChart: any = {
      labels: [
        "27/07/2022",
        "18/07/2022",
        "27/06/2022",
        "16/07/2022",
        "13/02/2014",
      ],
      series: [[230, 750, 450, 300, 280]],
    };

    const optionsCompletedTasksChart: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0,
      }),
      low: 0,
      high: 1000, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    };

    var completedTasksChart = new Chartist.Line(
      "#completedTasksChart",
      dataCompletedTasksChart,
      optionsCompletedTasksChart
    );

    // start animation for the Completed Tasks Chart - Line Chart
    this.startAnimationForLineChart(completedTasksChart); */

    /* ----------==========     Mot cle utiliser chart Chart initialization    ==========---------- */

    var datawebsiteViewsChart = {
      labels: ["Lundi", "Mardi", "Mercredi"],
      series: [[10, 20, 50]],
    };
    var optionswebsiteViewsChart = {
      seriesBarDistance: 30,
      axisX: {
        showGrid: false,
      },
      low: 0,
      high: this.topMotClelength,
      chartPadding: { top: 0, right: 0, bottom: 5, left: 0 },
    };
    var responsiveOptions: any[] = [
      [
        "screen and (max-width: 640px)",
        {
          seriesBarDistance: 5,

          axisX: {
            labelInterpolationFnc: function (value) {
              return value[0];
            },
          },
        },
      ],
    ];
    this.websiteViewsChart = new Chartist.Bar(
      "#websiteViewsChart",
      datawebsiteViewsChart,
      optionswebsiteViewsChart,
      responsiveOptions
    );

    //start animation for the Emails Subscription Chart
    this.startAnimationForBarChart(this.websiteViewsChart);
    /* ----------==========    END : Emails Subscription Chart initialization    ==========---------- */
  }

  getRootList() {
    this.queryDbService.get_root_list().subscribe((res) => {
      this.rootList = res;
    });
  }

  //res : [[dates],[occurences]]
  getDatesofRoot(root) {
    this.queryDbService.getDateDataOfRootIfExiste(root).subscribe((res) => {
      console.log("DATE :", res);
      this.isDateData = res;
      this.selectedRootDate = res[0];
      this.selectedRootDateOccurence = res[1];
      //create a bug hidding (in html) data if table.lenght == 0
      //the tring t dasplya data where not hidden (table.lenght > 0)
      /* this.dates.update({
        labels: this.selectedRootDate.slice(0, 20),
        series: [this.selectedRootDateOccurence.slice(0, 20)],
      }); 
      //creating new chart for the new data
       let data: any = {
        labels: this.selectedRootDate.slice(0, 20),
        series: [this.selectedRootDateOccurence.slice(0, 20)],
      };
      */
      let temp = this.getTop20Dates(
        this.selectedRootDate,
        this.selectedRootDateOccurence
      );
      let data: any = {
        labels: temp[0],
        series: [temp[1]],
      };
      this.dates = new Chartist.Line("#dates", data, {});
      this.startAnimationForLineChart(this.dates);
    });
  }

  getTop20Dates(dates: any[], occurences: any[]) {
    let resList = [];
    let idx = -1;

    let temp = occurences.sort((a, b) => b - a).slice(0, 20);
    for (let i = 0; i < temp.length; i++) {
      idx = occurences.indexOf(temp[i]);
      resList.push(dates[idx]);
    }
    return [resList, temp];
  }

  getUrl($event): void {
    console.log("selected value: ", $event);
    this.selectedRoot = $event;
    //1- get root data
    this.queryDbService.get_all_data(this.selectedRoot).subscribe((res) => {
      this.selectedRootData = res;
      this.keys = Object.keys(res[3]);
      this.tableData = res.slice(3, 7);
      console.log("this.tableData : ", this.tableData);

      console.log("keys ;", this.keys);
      //console.log("data is:", this.selectedRootData);
      //list mot cle
      this.getListMotClesAndData(this.selectedRoot);
    });
    //get date data of tyhe selected root
    this.getDatesofRoot(this.selectedRoot);
  }

  getListMotClesAndData(root) {
    this.getMotCles(root);
    this.getDataGroupedByClassified();
  }

  private getDataGroupedByClassified() {
    this.queryDbService
      .get_data_grouped_by_classified_as(this.selectedRoot)
      .subscribe((res) => {
        console.log("Now FROM HERE", res);
        this.getTopCategorie(res);
        console.log("ALAY  HALALALY", this.getChartPieData(res));
      });
  }

  private getMotCles(root: any) {
    this.queryDbService.get_mot_cles(root).subscribe((res) => {
      console.log("list mot cle", res);
      this.selectedRootMotCleList = res;
      this.getListMotcleAndDataLength(
        this.selectedRoot,
        this.selectedRootMotCleList
      );
    });
  }

  //call filter_resulat_by_mot_cle() for every mot cle
  getListMotcleAndDataLength(root, motCleList) {
    this.selectedRootMotCleAndItemsList = [];
    console.log("iniside getListMotcleAndDataLength 1", motCleList);

    for (let i = 0; i < motCleList.length; i++) {
      this.queryDbService
        .filter_resulat_by_mot_cle(root, motCleList[i])
        .subscribe((res) => {
          let temp = {};
          temp[motCleList[i]] = res.length;
          this.selectedRootMotCleAndItemsList.push(temp);
          console.log(`the data for mot cle ${motCleList[i]} is`, res.length);
          this.getTopMotCle(this.selectedRootMotCleAndItemsList);
          console.log(
            "res from getChartBarData",
            this.getChartBarData(this.selectedRootMotCleAndItemsList)
          );
        });
    }
    console.log("final resulat list", this.selectedRootMotCleAndItemsList);
  }
  getTopMotCle(motCleList) {
    console.log("AHHHAYYYYYYYYYY 1", motCleList);
    motCleList = motCleList.filter((elm) => elm);
    let max = -1;
    let maxKey: any;
    for (let i = 0; i < motCleList.length; i++) {
      Object.entries(motCleList[i]).forEach(([key, value]) => {
        if ((value as number) > max) {
          max = value as number;
          maxKey = key as string;
        }
      });
    }
    console.log("max is", maxKey);
    this.topMotCle = maxKey;
    this.topMotClelength = max;
    this.topMotClePersentqge =
      (this.topMotClelength / this.selectedRootData.length) * 100;
  }

  getTopCategorie(CategorieList) {
    CategorieList = CategorieList.filter((elm) => elm);
    let max = -1;
    let maxKey: any;
    for (let i = 0; i < CategorieList.length; i++) {
      Object.entries(CategorieList[i]).forEach(([key, value]) => {
        if ((value as number) > max) {
          max = value as number;
          maxKey = key as string;
        }
      });
    }

    console.log("max Categorie is", maxKey);
    console.log("max this.selectedRootData.length", this.selectedRootData);
    this.topCategorie = maxKey;
    this.topCategorielength = max;
    this.topCategoriePersentqge =
      (this.topCategorielength / this.selectedRootData.length) * 100;
  }

  getChartBarData(data: any[]) {
    let tempMots: any[] = [];
    let tempLength: any[] = [];
    for (let i = 0; i < data.length; i++) {
      Object.entries(data[i]).forEach(([key, value]) => {
        tempMots.push(key);
        tempLength.push(value);
      });
    }
    this.chartBarData = [tempMots, tempLength];

    console.log("mot of bar charts", this.chartBarData[0]);
    console.log("lenght of bar charts", this.chartBarData[1]);

    this.websiteViewsChart.update({
      //labels: this.chartBarData[0].map((v) => v[0].toUpperCase()),
      labels: this.chartBarData[0],
      series: [this.chartBarData[1]],
    });

    return [tempMots, tempLength];
  }

  // return list 2 length 2 : l[0] => list of categories exp: ['Agriculture et Agroalimentaire', 'BTP Bâtiment', 'Fourni...]
  //                          l[1] => list of occurence of every categorie respecting order exp :  [1, 5, 8, 1, 1, 8, 1, 37]   (Agriculture et Agroalimentaire : 1,BTP Bâtiment:5....)
  getChartPieData(data: any[]) {
    let tempMots: any[] = [];
    let tempLength: any[] = [];
    for (let i = 0; i < data.length; i++) {
      Object.entries(data[i]).forEach(([key, value]) => {
        tempMots.push(key);
        tempLength.push(value);
      });
    }
    this.chartPieData = [tempMots, tempLength];
    console.log("mot of chartPieData :", this.chartPieData[0]);
    console.log("lenght of chartPieData", this.chartPieData[1]);
    this.categoriePieChart.update({
      labels: this.chartPieData[0].map((v) => v[0].toUpperCase()),
      //labels: this.chartPieData[0],
      series: this.chartPieData[1],
    });
    this.startAnimationForPieChart(this.categoriePieChart);
    return [tempMots, tempLength];
  }
}
