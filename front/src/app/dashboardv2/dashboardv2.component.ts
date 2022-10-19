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
      console.log("hay lalalalal", data);

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
    this.getRootList();

    /* 
    const dataDailySalesChart: any = {
      labels: ["M", "T", "W", "T", "F", "S", "S"],
      series: [[12, 17, 7, 17, 23, 18, 38]],
    };
 */
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

    // this.startAnimationForLineChart(this.categoriePieChart);
    /* ----------==========     Daily Sales Chart initialization For Documentation    ==========---------- */
    const dataDailySalesChart: any = {
      labels: ["M", "T", "W", "T", "F", "S", "S"],
      series: [[12, 17, 7, 17, 23, 18, 38]],
    };

    const optionsDailySalesChart: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0,
      }),
      low: 0,
      high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    };

    var dailySalesChart = new Chartist.Line(
      "#dailySalesChart",
      dataDailySalesChart,
      optionsDailySalesChart
    );

    this.startAnimationForLineChart(dailySalesChart);

    /* ----------==========     Completed Tasks Chart initialization    ==========---------- */

    const dataCompletedTasksChart: any = {
      labels: ["12p", "3p", "6p", "9p", "12p", "3a", "6a", "9a"],
      series: [[230, 750, 450, 300, 280, 240, 200, 190]],
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
    this.startAnimationForLineChart(completedTasksChart);

    /* ----------==========     Emails Subscription Chart initialization    ==========---------- */

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
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
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

  getUrl($event): void {
    console.log("selected value: ", $event);
    this.selectedRoot = $event;
    //1- get root data
    this.queryDbService.get_all_data(this.selectedRoot).subscribe((res) => {
      this.selectedRootData = res;
      this.keys = Object.keys(res[3]);
      this.tableData = res.slice(3, 7);
      console.log("keys ;", this.keys);
      //console.log("data is:", this.selectedRootData);
      //list mot cle
      this.getListMotCles(this.selectedRoot);
    });
  }
  getListMotCles(root) {
    this.queryDbService.get_mot_cles(root).subscribe((res) => {
      console.log("list mot cle", res);
      this.selectedRootMotCleList = res;
      this.getListMotcleAndDataLength(
        this.selectedRoot,
        this.selectedRootMotCleList
      );
    });
    this.queryDbService
      .get_data_grouped_by_classified_as(this.selectedRoot)
      .subscribe((res) => {
        console.log("Now FROM HERE", res);
        this.getTopCategorie(res);
        console.log("ALAY  HALALALY", this.getChartPieData(res));
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
      labels: this.chartBarData[0].map((v) => v[0].toUpperCase()),
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
      series: this.chartPieData[1],
    });
    this.startAnimationForPieChart(this.categoriePieChart);
    return [tempMots, tempLength];
  }
}
