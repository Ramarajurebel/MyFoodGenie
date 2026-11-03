import {
    Component,
    ElementRef,
    Inject,
    LOCALE_ID,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexFill,
    ApexOptions,
    ApexPlotOptions,
    ApexTitleSubtitle,
    ApexXAxis,
    ApexYAxis,
    ChartComponent,
    ApexLegend,
    ApexTooltip,

} from 'ng-apexcharts';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { formatDate } from '@angular/common';
import { Orders } from 'app/shared/classes/orders';
import { Router } from '@angular/router';
import { KitchenInventoryClass } from './../../shared/classes/kitchen-inventory';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { MenuInventory } from 'app/shared/classes/menuInventory';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { SaleOrderItemsGroup } from './../../shared/classes/groupsaleorderitems';
import * as moment from 'moment'; 
import { HttpClient } from '@angular/common/http';


export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis | ApexYAxis[];
    xaxis: ApexXAxis;
    fill: ApexFill;
    legend: ApexLegend;
    title: ApexTitleSubtitle;
    markers: any; //ApexMarkers;
    stroke: any;
    tooltip: ApexTooltip;
};

export interface Genie {
    name: string;
    cloudStatus: string;
    totalQty: number;
    avblQty: number;
    slotCount: number;
    saleQty: number;
    reservedQty: number;
    correctionQty: number;
    genieid: number;
    emptyQty: number;
    vmsmachid: string;
  }
  interface GenieMargin {
    name: string;
    vmsmachid: string;
    genieid: number;
    totalQty: number;
    avblQty: number;
    saleQty: number;
    totalMargin: number;
    totalAvblMargin: number;
    totalSaleMargin: number;
  }
@Component({
    selector: 'app-nfm-reports',
    templateUrl: './nfm-reports.component.html',
    styleUrls: ['./nfm-reports.component.scss'],
})
export class NfmReportsComponent implements OnInit {
    selectedDate: string;
    salesChartDetails: ApexOptions;
    expensesChartDetails: ApexOptions;
    arrayOfPayMethodAmounts = [];
    arrayOfPayMethodNames = [];
    totalAmount: number = 0;
    paytmAmount: number = 0;
    cashAmount: number = 0;
    othersAmount: number = 0;
    tiffinsCash: number = 0;
    tiffinsTransactions = [];
    lunchTransactions = [];
    snacksTransactions = [];
    dinnerTransactions = [];
    allCategoriesTransactions = [];
    startDate = new FormControl('');
    endDate = new FormControl('');
    expensesTotalAmount: number = 0;
    expensesTiffinsAmount: number = 0;
    expensesLunchAmount: number = 0;
    expensesSnacksAmount: number = 0;
    expensesDinnerAmount: number = 0;
    expensesArray = [];
    expensesChartColors = [];
    outofStockItems: KitchenInventoryClass[] = [];
    outofStockItemsVegetables: KitchenInventoryClass[] = [];
    outofStockItemsGroceries: KitchenInventoryClass[] = [];
    outofStockItemsNonVeg: KitchenInventoryClass[] = [];
    outofStockItemsOthers: KitchenInventoryClass[] = [];
    enquiryCount: number = 0;
    selectedTabData = new MatTableDataSource();
    displayedColumns: string[] = [
        'sno',
        'itemName',
        'purchasedDate',
        'balance',
    ];
    tiffinsSaleOrderData = [];
    lunchSaleOrderData = [];
    snacksSaleOrderData = [];
    dinnerSaleOrderData = [];
    modalReference: any;
    adhocItemformGroup: FormGroup;
    geniepurchaseandsales: FormGroup; 
    public ItemSaleReportForm: FormGroup;
    adhocPoData = [];
    public uomData = [
        'gms',
        'ml',
        'pieces',
        'bunch',
        'Kgs',
        'Bag (50 Kgs)',
        'Tray (25 Kgs)',
        'Tin (15 Kgs)',
    ];
    protected _onDestroy = new Subject<void>();
    productsList = [];
    filtereditems = [];
    itemControl: FormControl = new FormControl('');
    itemStockControl: FormControl = new FormControl('');
    kitInvRow = [];
    public categories = ['Vegetables', 'Groceries', 'Non Veg', 'Others'];
    tiffinsSaleOrderPrice: number = 0;
    lunchSaleOrderPrice: number = 0;
    snacksSaleOrderPrice: number = 0;
    dinnerSaleOrderPrice: number = 0;
    @ViewChild('chart') chart: ChartComponent;
    public counterChartOptions: Partial<ChartOptions>;
    public ReopertchartOptions: Partial<ChartOptions>;
    public ReportcalculatorOptions: Partial<ChartOptions>;
    counterData = [];
    paymentMethodsList = [];
    overallSalesList = [];
    overallTotal: number = 0;
    menuInventoryList: MenuInventory[] = [];
    stallControl: FormControl = new FormControl('All');
    subCatControl: FormControl = new FormControl('All');
    stallData = [];
    ReportData = [];
    subCatData = [];
    public editMode = false;
    public delobj = {};
    public TableFieldsForm: FormGroup;
    genies: Genie[] = [];
    geniesMargin: GenieMargin[] = [];
    grossTotalMargin: number = 0;
    totalAvailableMargin: number = 0;
    totalSaleMargin: number = 0;
    totalAvailableQty: number = 0;
    totalQuantity1: number = 0;
    totalSaleQty: number = 0;
    totalEmptyQty: number = 0;

    private apiUrl = 'https://myfoodgenie.com/nfmgenieapi/report/getqtyinfogenie';
    private apiUrl1 = 'https://myfoodgenie.com/nfmgenieapi/report/getqtymargininfogenie';
    @ViewChild('invStartDate') invStartDate: ElementRef;
    @ViewChild('invEndDate') invEndDate: ElementRef;
    @ViewChild('vendororderStartDate') vendororderStartDate: ElementRef;
    @ViewChild('vendororderEndDate') vendororderEndDate: ElementRef;
    @ViewChild('startDateSaleItems') startDateSaleItems: ElementRef;
    @ViewChild('endDateSaleItems') endDateSaleItems: ElementRef;
    @ViewChild('startDateReportSaleItems') startDateReportSaleItems: ElementRef<HTMLInputElement>;
    @ViewChild('endDateReportSaleItems') endDateReportSaleItems: ElementRef<HTMLInputElement>;
    @ViewChild('sdvmsreport') sdvmsreport: ElementRef;
    @ViewChild('edvmsreport') edvmsreport: ElementRef;
    

    saleCount: number = 0;
    stallinventoryid: number = 0;
    filteredStalls = [];
    productIngrList = [];
    filteredIngrs = [];
    itemdispenseStatus = [{ name: 'SUCCESS', key: 'SUCCESS' }, { name: 'REFUNDED', key: 'REFUNDED' }]
    public stallsearch: FormControl = new FormControl();
    public itemfilter: FormControl = new FormControl();
    mobileNumber: string = '';
    userRole: string;
    allOrdersData: Orders[] = [];
    stallOperator = [];
    vendorId: number = 0;
    interval: any;
    vendorSaleOrderItemsList: SaleOrderItemsGroup[] = [];
    naviSaleOrderItemsList: SaleOrderItemsGroup[] = [];
    vendorSaleOrderItem: SaleOrderItemsGroup;
    default: boolean = true;
    purchaseData: number[] = [];
    salesData: number[] = [];
    ReportfilteredData: any[];
    totalPrice: number = 0;
    listlength: number = 0;
    AveragePrice: number = 0;
    itemsaleReportData: any;
    totalSaleReportItems: number;
    configDetails = [];
    purchaseTableData: any[] = [];
    selectedCounterValue: any;
    selectedChartValue: any;
    public chartOptions: Partial<ChartOptions>;
    barchartData: any;
    sdVms: FormControl = new FormControl();
    edVms: FormControl = new FormControl();
    itemStatus: FormControl = new FormControl('SUCCESS');
    macCtrlVms: FormControl = new FormControl('all');
    vmsMacsList = [];
    itemStatusList = ['SUCCESS', 'Others'];
     vmsItemsByGroup: { [key: string]: number };
    totalQuantity: number = 0;
    genieMangresp: any;
    genieList: any[];
    geniesalesReport: FormGroup;
    geniedailysalesReport: FormGroup;
    ItemStockReportForm: FormGroup;
    SalesList: any[];
    totalSum: number=0;
    public GeniechartOptions: Partial<ChartOptions>
    totalGenieSum: number;
    StockReportData: any;
    StockitemCount: any;
    Stockbalance: any;
    ItemStockData: any;
    stockProdId: any;
    ItemStockQty: number;
    constructor(
        private service: ProjectService,
        private modalService: NgbModal,
        @Inject(LOCALE_ID) public locale: string,
        private router: Router,
        private dialog: MatDialog,
        private http: HttpClient
    ) {

        const user = JSON.parse(localStorage.getItem('user'));
        console.log('before role', this.userRole);
        this.mobileNumber = user.mobileNumber;
        this.userRole = user.role;
        console.log('after role', this.userRole);
    }
    @ViewChild(MatSort) sort: MatSort;
    ngAfterViewInit() {
        this.selectedTabData.sort = this.sort;
    }
    async ngOnInit() {

        
        const vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }
        this.adhocItemformGroup = new FormGroup({
            adhocpoid: new FormControl(),
            category: new FormControl(''),
            productlist: new FormControl(''),
            quantity: new FormControl(),
            uom: new FormControl(''),
            price: new FormControl(),
            available: new FormControl(),
            finalprice: new FormControl(),
            purchasedquantity: new FormControl(),
            lastpddate: new FormControl(),
            lastpdfrom: new FormControl(''),
            lastpdprice: new FormControl(),
            ispacked: new FormControl(),
            isreceived: new FormControl(),
        });
        this.TableFieldsForm = new FormGroup({
            date: new FormControl(''),
            itemName: new FormControl(''),
            saleCount: new FormControl(''),
            packedCount: new FormControl(''),
            stallid: new FormControl(''),
            itemUOM: new FormControl(''),
            itemID: new FormControl(''),
            balance: new FormControl(''),
            subCategory: new FormControl(''),
            reserveQuantity: new FormControl(''),
            packedDate: new FormControl(''),
            expiryInDays: new FormControl('')
        });
        // this.counterChartData(todayDate, todayDate);
        this.ItemSaleReportForm = new FormGroup({
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
            dStatus: new FormControl('SUCCESS'),
            stallid: new FormControl('0'),
        });
        this.ItemStockReportForm = new FormGroup({ 
            stallid: new FormControl(''),
            prods: new FormControl('')
        });
        this.geniepurchaseandsales = new FormGroup({ 
            genieIdsList:new FormControl(''),
            startDate:new FormControl(new Date()),
            endDate:new FormControl(new Date())
        });
        // geniesalesReport
        this.geniesalesReport = new FormGroup({ 
            genieIdsList:new FormControl(''),
            startSalesDate:new FormControl(moment().subtract(30, 'days').toDate()),
            endSalesDate:new FormControl(new Date())
        });
        // geniedailysalesReport
        this.geniedailysalesReport = new FormGroup({ 
           
            startDate:new FormControl(new Date()),
            endDate:new FormControl(new Date())
        });
        const adhocresp = await this.service.fetchRequest(
            'adhocpo/getAllAdhocpo'
        );

        this.adhocPoData = adhocresp['adhocpoList'];
        // stall operator
        const opResp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.stallOperator = opResp['stallOperatorList'];
        // for vendorid
        if (this.mobileNumber != '9618812143') {
            this.stallOperator.forEach((op) => {
                if (op.mobile == this.mobileNumber) {
                    this.vendorId = op.vendorId;
                }
            });
        }
        const stallresp = await this.service.fetchRequest('stall/getAllStalls');
        this.stallData = stallresp['supplierList'];
        this.ReportData = this.stallData;
        this.itemsaleReportData = this.stallData.filter((obj) => {
            return obj.status == "Active" && obj.type == "Genie"
        });
        console.log("itemsaleReportData", this.itemsaleReportData)
        // this.ReportfilteredData = this.ReportData
        const ingrPayload = { catid: 112, prodid: 0, vendorId: this.vendorId };
        const ingrResp = await this.service.fetchRequestPost(
            'rest/product/ProductsByVariants',
            ingrPayload
        );
        this.productIngrList = ingrResp['productitems'];
        this.filteredIngrs = this.productIngrList;
        this.filteredStalls = this.stallData;
        let subcatpayload = {
            shopId: 11,
            vendorId: 1001,
            catId: 118,
        };
        const subcatresp = await this.service.fetchRequestPost(
            'rest/subcategory/SubcategoryByCategory',
            subcatpayload
        );
        this.subCatData = subcatresp['subcategories'];
        this.adhocPoData = this.adhocPoData.filter((po) => {
            return po.status != 'Completed';
        });
        const payloadprod = {
            catid: 112,
            prodid: 0,
        };
        const purchaseRateCardResp = await this.service.fetchRequest(
            'purchaseratecard/getAllpurchaseratecard'
        );
        this.productsList = purchaseRateCardResp['purchaseratecardList'];
        const paysList = await this.service.fetchRequest(
            'paymentmethod/getAllPaymentMethod'
        );
        this.paymentMethodsList = paysList['paymentMethodList'];

        const resp = await this.service.fetchRequest(
            'geniemanagement/getAllGenieManagement'
        );

        this.configDetails = resp['genieManagementList'];
        
    this.genieMangresp  = this.configDetails
        console.log('before payment', this.paymentMethodsList);

        console.log('product card', this.productsList);
        this.filtereditems = this.productsList;
        const startDate = formatDate(
            new Date().setHours(0, 0, 1, 0),
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
        const endDate = formatDate(
            new Date().setHours(23, 59, 59),
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
        const payload = {
            startDate,
            endDate,
        };


        console.log(payload);

        this.http.get<Genie[]>(this.apiUrl).subscribe({
            next: data => {
              this.genies = data;
              this.calculateTotals1();
            },
            error: error => {
              console.error('Error fetching data', error);
            }
          });
           
          this.http.get<GenieMargin[]>(this.apiUrl1).subscribe({
            next: data => {
              this.geniesMargin = data;
              this.calculateTotals();
            },
            error: error => {
              console.error('Error fetching data', error);
            }
          });
          

        this.service.getOrderCollection(payload).subscribe(async (data) => {
            this.allOrdersData = data?.orders;
            console.log(data);
            this.paytmAmount = 0;
            this.cashAmount = 0;
            if (data?.orders) {
                data.orders.forEach((order: Orders) => {
                    this.totalAmount += order.amount;
                });
                // for overall paytm and cash
                data.orders.forEach((order: Orders) => {
                    if (order?.paymentMode === 'paytmAtStall') {
                        this.paytmAmount += order.amount;
                    }
                    if (order?.paymentMode === 'cod') {
                        this.cashAmount += order.amount;
                    }
                    if (order?.paymentMode.includes('Others')) {
                        this.othersAmount += order.amount;
                    }
                });

                console.log('amount pay List', this.paymentMethodsList);
                // array for piechart
                let arraySeries = [];
                arraySeries[0] = this.paytmAmount;
                arraySeries[1] = this.cashAmount;
                arraySeries[2] = this.othersAmount;
                // sepearating category wise payments
                // this.tiffinsTransactions = data.orders.filter(
                //     (order: Orders) => {
                //         return order.subCatName === 'Tiffins';
                //     }
                // );
                // this.lunchTransactions = data.orders.filter((order: Orders) => {
                //     return order.subCatName === 'Lunch';
                // });
                // this.snacksTransactions = data.orders.filter(
                //     (order: Orders) => {
                //         return order.subCatName === 'Snacks';
                //     }
                // );
                // this.dinnerTransactions = data.orders.filter(
                //     (order: Orders) => {
                //         return order.subCatName === 'Dinner';
                //     }
                // );
                // adding each payment type and category wise details to another array
                // if (this.tiffinsTransactions.length > 0) {
                //     this.allCategoriesTransactions = this.eachSubCategoryAmountAndDetails(
                //         'Tiffins',
                //         this.tiffinsTransactions,
                //         0
                //     );
                // }
                // if (this.lunchTransactions.length > 0) {
                //     this.allCategoriesTransactions = this.eachSubCategoryAmountAndDetails(
                //         'Lunch',
                //         this.lunchTransactions,
                //         1
                //     );
                // }
                // if (this.snacksTransactions.length > 0) {
                //     this.allCategoriesTransactions = this.eachSubCategoryAmountAndDetails(
                //         'Snacks',
                //         this.snacksTransactions,
                //         2
                //     );
                // }
                // if (this.dinnerTransactions.length > 0) {
                //     this.allCategoriesTransactions = this.eachSubCategoryAmountAndDetails(
                //         'Dinner',
                //         this.dinnerTransactions,
                //         3
                //     );
                // }
                // this.allCategoriesTransactions = this.allCategoriesTransactions.filter(
                //     (value) => Object.keys(value).length !== 0
                // );
                // this.salesChartDetails = {
                //     chart: {
                //         animations: {
                //             speed: 400,
                //             animateGradually: {
                //                 enabled: false,
                //             },
                //         },
                //         fontFamily: 'inherit',
                //         foreColor: 'inherit',
                //         height: '100%',
                //         type: 'donut',
                //         sparkline: {
                //             enabled: true,
                //         },
                //     },
                //     colors: ['#3182CE', '#63B3ED', '#ff0000'],
                //     labels: ['Paytm', 'COD', 'Others'],
                //     plotOptions: {
                //         pie: {
                //             startAngle: 0,
                //             endAngle: 360,
                //             expandOnClick: true,
                //             offsetX: 0,
                //             offsetY: 0,
                //             customScale: 1,
                //             dataLabels: {
                //                 offset: 0,
                //                 minAngleToShowLabel: 10,
                //             },
                //             donut: {
                //                 size: '70%',
                //                 background: 'transparent',
                //                 labels: {
                //                     show: true,
                //                     name: {
                //                         show: true,
                //                         fontSize: '22px',
                //                         fontFamily:
                //                             'Helvetica, Arial, sans-serif',
                //                         fontWeight: 600,
                //                         color: undefined,
                //                         offsetY: -10,
                //                         formatter: function (val) {
                //                             return val;
                //                         },
                //                     },
                //                     value: {
                //                         show: true,
                //                         fontSize: '16px',
                //                         fontFamily:
                //                             'Helvetica, Arial, sans-serif',
                //                         fontWeight: 400,
                //                         color: undefined,
                //                         offsetY: 16,
                //                         formatter: function (val) {
                //                             return val;
                //                         },
                //                     },
                //                     total: {
                //                         show: true,
                //                         showAlways: true,
                //                         label: 'Total',
                //                         fontSize: '22px',
                //                         fontFamily:
                //                             'Helvetica, Arial, sans-serif',
                //                         fontWeight: 600,
                //                         color: '#373d3f',
                //                         formatter: function (w) {
                //                             return w.globals.seriesTotals.reduce(
                //                                 (a, b) => {
                //                                     return a + b;
                //                                 },
                //                                 0
                //                             );
                //                         },
                //                     },
                //                 },
                //             },
                //         },
                //     },
                //     series: arraySeries,
                //     dataLabels: {
                //         formatter: function (val, opts) {
                //             console.log(opts.w.config.series);
                //             return opts.w.config.series[opts.seriesIndex];
                //         },
                //     },
                //     states: {
                //         hover: {
                //             filter: {
                //                 type: 'none',
                //             },
                //         },
                //         active: {
                //             filter: {
                //                 type: 'none',
                //             },
                //         },
                //     },
                //     tooltip: {
                //         enabled: true,
                //         fillSeriesColor: false,
                //         theme: 'dark',
                //         custom: ({
                //             seriesIndex,
                //             w,
                //         }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                //                                             <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                //                                             <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                //                                             <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}</div>
                //                                         </div>`,
                //     },
                // };
            }
            // end for sales
            // below is for expenses
            // let expensesArray = [];
            // let todayDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
            // let payloadEvent = {
            //     startDate: todayDate,
            //     endDate: todayDate,
            //     vendorId: this.vendorId,
            // };
            // const resp = await this.service.fetchRequestPost(
            //     'keventheader/geteventbydate',
            //     payloadEvent
            // );
            // expensesArray = resp['keventheaderList'];
            // let expensesChartLabels = [];
            // let expensesChartSeries = [];
            // expensesArray.forEach((event) => {
            //     if (event.type === 'Tiffins') {
            //         this.expensesTiffinsAmount += parseFloat(
            //             event.totalcost.toFixed(2)
            //         );
            //     }
            //     if (event.type === 'Lunch') {
            //         this.expensesLunchAmount += parseFloat(
            //             event.totalcost.toFixed(2)
            //         );
            //     }
            //     if (event.type === 'Snacks') {
            //         this.expensesSnacksAmount += parseFloat(
            //             event.totalcost.toFixed(2)
            //         );
            //     }
            //     if (event.type === 'Dinner') {
            //         this.expensesDinnerAmount += parseFloat(
            //             event.totalcost.toFixed(2)
            //         );
            //     }
            // });
            // if (this.expensesTiffinsAmount != 0) {
            //     expensesChartLabels[0] = 'Tiffins';
            //     expensesChartSeries[0] = this.expensesTiffinsAmount;
            //     this.expensesChartColors[0] = '#3182CE';
            // }
            // if (this.expensesLunchAmount != 0) {
            //     expensesChartLabels[1] = 'Lunch';
            //     expensesChartSeries[1] = this.expensesLunchAmount;

            //     this.expensesChartColors[1] = '#ff0000';
            // }
            // if (this.expensesSnacksAmount != 0) {
            //     expensesChartLabels[2] = 'Snacks';
            //     expensesChartSeries[2] = this.expensesSnacksAmount;
            //     this.expensesChartColors[2] = '#63B3ED';
            // }
            // if (this.expensesDinnerAmount != 0) {
            //     expensesChartLabels[3] = 'Dinner';
            //     expensesChartSeries[3] = this.expensesDinnerAmount;
            //     this.expensesChartColors[3] = '#008000';
            // }
            // expensesChartLabels = expensesChartLabels.filter((value) => value);
            // expensesChartSeries = expensesChartSeries.filter((value) => value);
            // this.expensesChartColors = this.expensesChartColors.filter(
            //     (value) => value
            // );
            // this.expensesChartDetails = {
            //     chart: {
            //         animations: {
            //             speed: 400,
            //             animateGradually: {
            //                 enabled: false,
            //             },
            //         },
            //         fontFamily: 'inherit',
            //         foreColor: 'inherit',
            //         height: 'auto',
            //         type: 'donut',
            //         sparkline: {
            //             enabled: true,
            //         },
            //     },
            //     colors: this.expensesChartColors,
            //     labels: expensesChartLabels,
            //     plotOptions: {
            //         pie: {
            //             startAngle: 0,
            //             endAngle: 360,
            //             expandOnClick: true,
            //             offsetX: 0,
            //             offsetY: 0,
            //             customScale: 1,
            //             dataLabels: {
            //                 offset: 0,
            //                 minAngleToShowLabel: 10,
            //             },
            //             donut: {
            //                 size: '70%',
            //                 background: 'transparent',
            //                 labels: {
            //                     show: true,
            //                     name: {
            //                         show: true,
            //                         fontSize: '22px',
            //                         fontFamily: 'Helvetica, Arial, sans-serif',
            //                         fontWeight: 600,
            //                         color: undefined,
            //                         offsetY: -10,
            //                         formatter: function (val) {
            //                             return val;
            //                         },
            //                     },
            //                     value: {
            //                         show: true,
            //                         fontSize: '16px',
            //                         fontFamily: 'Helvetica, Arial, sans-serif',
            //                         fontWeight: 400,
            //                         color: undefined,
            //                         offsetY: 16,
            //                         formatter: function (val) {
            //                             return val;
            //                         },
            //                     },
            //                     total: {
            //                         show: true,
            //                         showAlways: true,
            //                         label: 'Total',
            //                         fontSize: '22px',
            //                         fontFamily: 'Helvetica, Arial, sans-serif',
            //                         fontWeight: 600,
            //                         color: '#373d3f',
            //                         formatter: function (w) {
            //                             return w.globals.seriesTotals.reduce(
            //                                 (a, b) => {
            //                                     return parseFloat(
            //                                         (a + b).toFixed(2)
            //                                     );
            //                                 },
            //                                 0
            //                             );
            //                         },
            //                     },
            //                 },
            //             },
            //         },
            //     },
            //     series: expensesChartSeries,
            //     dataLabels: {
            //         formatter: function (val, opts) {
            //             console.log(opts.w.config.series);
            //             return opts.w.config.series[opts.seriesIndex];
            //         },
            //     },

            //     tooltip: {
            //         enabled: true,
            //         fillSeriesColor: false,
            //         theme: 'dark',
            //         custom: ({
            //             seriesIndex,
            //             w,
            //         }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
            //                                         <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
            //                                         <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
            //                                         <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}</div>
            //                                     </div>`,
            //     },
            // };
            // below is for enquiry
            let enquiryResp = [];
            let enquiryData = await this.service.fetchRequest(
                'enquiry/getAllEnquiry'
            );
            enquiryData = enquiryData['enquiryList'];
            enquiryData = enquiryData.filter((enq) => {
                return enq.status != 'Completed';
            });
            this.enquiryCount = enquiryData.length;
            console.log(this.enquiryCount);
            // below is for out of stock items
            const todayDateInv = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
            const vmstodayDateInv = new Date().toISOString().slice(0, 10);
            this.sdVms.setValue(vmstodayDateInv);
            this.edVms.setValue(vmstodayDateInv);
           
            // this.sdvmsreport.nativeElement.value = vmstodayDateInv;
            // this.edvmsreport.nativeElement.value = vmstodayDateInv;
            // if (startDate != todayDate && endDate != todayDate) {
            const payloadInv = {
                startDate: todayDateInv,
                endDate: todayDateInv,
            };
            const respInv = await this.service.fetchRequestPost(
                'kitcheninventory/getkitcheninventory',
                payloadInv
            );
            this.outofStockItems = respInv['kitcheninventoryList'];
            // for balance
            this.outofStockItems.forEach((inv) => {
                inv['balance'] = inv.availableQuantity - inv.saleQuantity;
            });
            // logic for sale quantites where quantity is minus
            this.outofStockItems = this.outofStockItems.filter((inv) => {
                return inv.balance <= 0;
            });
            // const stallId = this.ItemSaleReportForm.controls['stallid'].value;
            // const dispenseStatus = this.ItemSaleReportForm.controls['dStatus'].value;
            this.seperateQtyByCategory(this.outofStockItems);

            // this.counterChartData(todayDate, todayDate);
            this.onGo();
            if (this.mobileNumber != '9618812143') {
                this.getUserSaleOrderData(startDate, endDate, this.vendorId);
                this.onGo();
                // this.getitemSaleReprotData(startDate, endDate, stallId,dispenseStatus,this.vendorId);
            }
            else {
                this.getSaleOrderData(startDate, endDate);
            }
            this.getVmsSalesReport()
            // let ReportData = await this.service.fetchRequest(
            //     'report/getitemstockavail'
            // );
            // this.StockReportData = ReportData;
            // console.log('ReportData',ReportData)
            // this.StockitemCount=this.StockReportData.length;
            // this.Stockbalance = 0;
            // this.StockReportData.forEach((stock)=>{
            //     this.Stockbalance += stock?.balanceQuantity || 0;
            // })
            this.startDateReportSaleItems.nativeElement.value = todayDateInv;
            this.endDateReportSaleItems.nativeElement.value = todayDateInv;
            this.invStartDate.nativeElement.value = todayDateInv;
            this.invEndDate.nativeElement.value = todayDateInv;
            this.vendororderStartDate.nativeElement.value = todayDateInv;
            this.vendororderEndDate.nativeElement.value = todayDateInv;
           
           
          
            // this.macCtrlVms.setValue('all');
            // this.itemStatus.setValue('SUCCESS');
            
           
            // this.UserBasedSalesData();
            const dateRangeStart = this.startDateReportSaleItems.nativeElement.value
            const dateRangeEnd = this.endDateReportSaleItems.nativeElement.value
            this.dateRangeReportOrderData(this.startDateReportSaleItems.nativeElement, this.endDateReportSaleItems.nativeElement)
            this.MenuInventoryData(todayDateInv, todayDateInv);
        });
        // this.ReportCalculatorData();
        // this.ReportcalculatorOptions.xaxis.categories = this.ReportData.map((stall: any) => stall.name);
        this.ReportChartData();

        this.ReportfilteredData = this.ReportData.filter((data: any) => data.type == "Genie");
        this.ReopertchartOptions.xaxis.categories = this.ReportfilteredData.map((stall: any) => stall.name);

        const macresp = await this.service.fetchRequestPost("vmsapis/getMachines", {});
        console.log("macResp", macresp);
        this.vmsMacsList = macresp.data;
        this.itemStockControl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
            this.filterStockproducts();
        });
        // let sDate = this.sdVms.value;
        // let eDate = this.edVms.value;
        // let formattedSDate = new Date(sDate);
        // let formattedeDate = new Date(eDate);
        // let sDateInms: number;
        // let eDateInms: number;
        // type vmspayloadType = {
        //     startdate?: number,
        //     enddate?: number,
        //     limit?: number,
        //     machineId?: string,
        //     status?: string
        // }
        // this.AutoRefresh();

    }
    protected filterStockproducts() {
        if (!this.productIngrList) {
            return;
        }
        // get the search keyword
        let search = this.itemStockControl.value;
        if (!search) {
            this.filteredIngrs = this.productIngrList.slice();
            return;
        } else {
            search = search.toLowerCase();
        }

        // filter the banks
        this.filteredIngrs = this.productIngrList.filter(
            (bank) =>
                bank.prodName.toLowerCase().indexOf(search.toString()) > -1 ||
                bank.prodId.toString().indexOf(search) > -1
        );
    }
    async getVmsSalesReport() {
        this.totalQuantity = 0;
        let sDate = this.sdVms.value;
        let eDate = this.edVms.value;
        let formattedSDate = new Date(sDate);
        let formattedeDate = new Date(eDate);
        let sDateInms: number;
        let eDateInms: number;
        type vmspayloadType = {
            startdate?: number,
            enddate?: number,
            limit?: number,
            machineId?: string,
            status?: string
        }
        if (sDate != null) {
            formattedSDate = new Date(sDate);
            formattedSDate.setHours(0, 0, 1);
            sDateInms = formattedSDate.getTime();
        }
        if (eDate != null) {
            formattedeDate = new Date(eDate);
            formattedeDate.setHours(23, 59, 59);
            eDateInms = formattedeDate.getTime();
        }

        const status = this.itemStatus.value;
        const machineId = this.macCtrlVms.value;
        const payload: vmspayloadType = {};
        if (sDateInms != null) payload.startdate = sDateInms;
        if (eDateInms != null) payload.enddate = eDateInms;
        if (status != null) payload.status = status;
        if (machineId != null && machineId != "all" && machineId != "") payload.machineId = machineId;
        this.service.getVmsSaleByItemGroup(payload).subscribe((data) => {
            if (data) {
                // console.log("before sort", data);

                // let sortedObjectByValuesDesc = {};
                // Object.entries(data)
                //     .sort((a: any, b: any) => Number(b[1]) - Number(a[1]))
                //     .forEach(([key, value]) => {
                //         sortedObjectByValuesDesc[key] = value;
                //     });


                this.vmsItemsByGroup = data;
              
                console.log("after sort", this.vmsItemsByGroup);
                this.totalQuantity = Object.values(this.vmsItemsByGroup).reduce((total, value) => total + value, 0);
        //         const totalQuantity = Object.values(data).reduce((total, value) => total + value, 0);
        // console.log("Total Quantity:", totalQuantity);
                // this.calculateTotalQuantity();
            }
        });
     
    }
   
    unsorted() { }

    // this.service.getVmsSalesReport()


    async onCounterChange() {
        let data = this.configDetails.filter(sales => {
            return sales.stallId == this.selectedCounterValue;
        });

        let stallId, genieId, stallDate;

        if (data.length > 0) {
            stallId = data[0].stallId,
                genieId = data[0].autoGenieId;
            stallDate = data[0].date;
        }
        const payload = {
            "stallId": stallId,
            "genieId": genieId,
            "stallDate": stallDate
        };
        console.log("Payload:", payload)
        const resp = await this.service.fetchRequestPost(
            'genieprodinventory/getSalesReport',
            payload
        );
        console.log(resp);
        this.purchaseTableData.splice(0, this.purchaseTableData.length);
        this.purchaseTableData.push(resp);
        // this.barchartData = resp.slsReport;

        console.log("TableData:", this.purchaseTableData)

        // console.log("BarData",this.barchartData)
        // this.ReportCalculatorData();
    }
    async onChartCounterChange() {
        let data = this.configDetails.filter(sales => {
            return sales.stallId == this.selectedChartValue;
        });

        let stallId, genieId, stallDate;

        if (data.length > 0) {
            stallId = data[0].stallId,
                genieId = data[0].autoGenieId;
            stallDate = data[0].date;
        }
        const payload = {
            "stallId": stallId,
            "genieId": genieId,
            "stallDate": stallDate
        };
        const resp = await this.service.fetchRequestPost(
            'genieprodinventory/getSalesReport',
            payload
        );
        console.log(resp);
        // this.purchaseTableData.push(resp);
        this.barchartData = resp.slsReport;
        this.barReportCalculatorData()

    }
    async barReportgenieCalculatorData() {
        const formattedGenies: string[] = [];
        const formattedValues: number[] = [];
        const aggregatedData: {[genie: string]: number } = {};

        const categories = Object.keys(this.barchartData);
        categories.sort((a, b) => Number(a) - Number(b));
        console.log("Categories:", categories)
        let totalSum = 0;
        categories.forEach(genie => {
            const value = Number(this.barchartData[genie]);
            formattedGenies.push(genie);
            formattedValues.push(value);
            totalSum += value;
        });

        console.log("formattedGenies:", formattedGenies)
        const mergedData = formattedGenies.map((genie, index) => ({
            genie,
            value: formattedValues[index],
        }));
        console.log("Merged Data:", mergedData);
        // const yDataPoints = Object.values(this.barchartData);
        // const Values = yDataPoints.map(value => Number(value));
        // console.log("Values:", yDataPoints)
        mergedData.forEach(dataPoint => { 
            const { genie, value } = dataPoint;
            if (aggregatedData[genie]) {
                aggregatedData[genie] += value;
            } else {
                aggregatedData[genie] = value;
            }
        });
        console.log("Aggregated Data:", aggregatedData);
        const xaxisDates = Object.keys(aggregatedData);
        const yaxisValues = Object.values(aggregatedData);
        const xaxisGenieNames = xaxisDates.map(genieId => {
            const foundGenie = this.genieMangresp.find(genie => genie.autoGenieId == genieId); // Use '==' for type coercion
            return foundGenie ? `${genieId}-${foundGenie.description}` : `Genie ${genieId}`;
           
        });
        this.totalGenieSum = totalSum;
        this.GeniechartOptions = {
            xaxis: {
                categories: xaxisGenieNames,
            },
            series: [
                {
                    name: "Report",
                    type: "column",
                    data: yaxisValues,
                },
            ],
            chart: {
                height: 350,
                type: 'bar',
                stacked: false
            },
            title: {
                text: "Daily Sales Report",
                align: "left",
                offsetX: 110
            },
            tooltip: {
                fixed: {
                    enabled: true,
                    position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
                    offsetY: 30,
                    offsetX: 60
                }
            },
            dataLabels: {
                enabled: true,

                offsetY: -20,
                style: {
                    fontSize: "12px",
                    colors: ["#304758"]
                }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        position: "top" // top, center, bottom
                    }
                }
            },
        }
    }
    async barReportCalculatorData() {
        const formattedDates: string[] = [];
        const formattedValues: number[] = [];
        const aggregatedData: { [date: string]: number } = {};

        const categories = Object.keys(this.barchartData);
        categories.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        console.log("Categories:", categories)
        let totalSum = 0;
        categories.forEach(date => {
            const Date = formatDate(date, "YYYY-MM-dd", this.locale);

            const value = Number(this.barchartData[date]);
            formattedDates.push(Date)
            formattedValues.push(value);
            totalSum += value;
        });

        console.log("formattedDates:", Date)
        const mergedData = formattedDates.map((date, index) => ({
            date,
            value: formattedValues[index],
        }));
        console.log("Merged Data:", mergedData);
        const yDataPoints = Object.values(this.barchartData);
        const Values = yDataPoints.map(value => Number(value));
        console.log("Values:", yDataPoints)
        mergedData.forEach(dataPoint => {
            const { date, value } = dataPoint;
            if (aggregatedData[date]) {
                aggregatedData[date] += value;
            } else {
                aggregatedData[date] = value;
            }
        });
        console.log("Aggregated Data:", aggregatedData);
        const xaxisDates = Object.keys(aggregatedData);
        const yaxisValues = Object.values(aggregatedData);
        this.totalSum = totalSum;
        this.chartOptions = {
            xaxis: {
                categories: xaxisDates,
            },
            series: [
                {
                    name: "Report",
                    type: "column",
                    data: yaxisValues,
                },
            ],
            chart: {
                height: 350,
                type: 'bar',
                stacked: false
            },
            title: {
                text: "Sales Report",
                align: "left",
                offsetX: 110
            },
            tooltip: {
                fixed: {
                    enabled: true,
                    position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
                    offsetY: 30,
                    offsetX: 60
                }
            },
            dataLabels: {
                enabled: true,

                offsetY: -20,
                style: {
                    fontSize: "12px",
                    colors: ["#304758"]
                }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        position: "top" // top, center, bottom
                    }
                }
            },
        }
    }
    AutoRefresh() {
        const startDate = formatDate(
            new Date().setHours(0, 0, 0, 0),
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
        const endDate = formatDate(
            new Date().setHours(23, 59, 59),
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
        const payload = {
            startDate,
            endDate,
        };
        const stallId = this.ItemSaleReportForm.controls['stallid'].value;
        const dispenseStatus = this.ItemSaleReportForm.controls['dStatus'].value;
        const todayDateInv = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        this.interval = setInterval(() => {
            console.log('inside');
            this.MenuInventoryData(todayDateInv, todayDateInv);
            this.service.getOrderCollection(payload).subscribe((data) => {
                console.log('inside orders');
                this.allOrdersData = data.orders;
                if (this.allOrdersData?.length > 0) {
                    this.UserBasedSalesData();
                }
                this.getUserSaleOrderData(startDate, endDate, this.vendorId);
                this.onGo();
                // this.getitemSaleReprotData(startDate, endDate, stallId,dispenseStatus,this.vendorId);

            });
        }, 5000);
    }
    async dateRangeReportOrderData(
        dateRangeStart: HTMLInputElement,
        dateRangeEnd: HTMLInputElement
    ) {

        const sDate = new Date(dateRangeStart.value);
        let eDate = new Date(dateRangeEnd.value);

        const startDate = formatDate(
            sDate,
            'YYYY-MM-dd 00:00:00',
            this.locale
        );
        const endDate = formatDate(
            eDate,
            'YYYY-MM-dd 23:59:59',
            this.locale
        );
        // console.log(startDate);
        // console.log(endDate);
        let payload = {
            startDate,
            endDate,
        };
        const resp = await this.service.fetchRequestPost(
            'adhocpo/getPurchaseAndSales',
            payload
        );
        console.log(resp);
        if (resp && resp.purchase) {
            this.purchaseData = Object.values(resp.purchase);
            console.log(this.purchaseData);
        }
        if (resp && resp.sales) {
            this.salesData = Object.values(resp.sales);
            console.log(this.salesData);
        }
        this.ReportChartData();
        this.ReportfilteredData = this.ReportData.filter((data: any) => data.type == "Genie");
        console.log(this.ReportfilteredData);
        this.ReopertchartOptions.xaxis.categories = this.ReportfilteredData.map((stall: any) => stall.name);
    }
    // dateRangeSaleOrderData(
    //     dateRangeStart: HTMLInputElement,
    //     dateRangeEnd: HTMLInputElement
    // ) {
    //     const sDate = new Date(dateRangeStart.value);
    //     const eDate = new Date(dateRangeEnd.value);
    //     const startDate = formatDate(
    //         sDate.setHours(0, 0, 0, 0),
    //         'YYYY-MM-dd HH:mm:ss',
    //         this.locale
    //     );
    //     const endDate = formatDate(
    //         eDate.setHours(23, 59, 59),
    //         'YYYY-MM-dd HH:mm:ss',
    //         this.locale
    //     );
    //     this.getUserSaleOrderData(startDate, endDate, this.vendorId);
    // }
    async onItemStockGo(){
        const prodId = this.ItemStockReportForm.controls['prods'].value;
        const stallId = this.ItemStockReportForm.controls['stallid'].value;
        console.log("prodId",prodId)
        console.log('stallId',stallId)

    }
    async onGo() {
      
        const itemstartDate = this.ItemSaleReportForm.controls['startDate'].value;
        const itemendDate = this.ItemSaleReportForm.controls['endDate'].value;
        const stallId = this.ItemSaleReportForm.controls['stallid'].value;
        const dispenseStatus = this.ItemSaleReportForm.controls['dStatus'].value;

        const startDate = formatDate(
            itemstartDate.setHours(0, 0, 0, 0),
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
        const endDate = formatDate(
            itemendDate.setHours(23, 59, 59),
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
      
        let payload = {
            stallId,
            dispenseStatus,
            startDate,
            endDate,
            vendorId: this.vendorId,
        };
        console.log(payload)
        this.totalPrice = 0;
        this.listlength = 0;
        this.AveragePrice = 0;
        this.vendorSaleOrderItemsList = [];
        this.service
            .getGroupSaleOrders(payload)
            .subscribe((data: SaleOrderItemsGroup[]) => {
                // for unique subcategories
                if (data.length > 0) {
                    this.vendorSaleOrderItemsList = data;
                    this.vendorSaleOrderItemsList.sort((a, b) => b.totalQuantity - a.totalQuantity);
                    this.totalPrice = this.vendorSaleOrderItemsList.reduce((sum, item) => sum + item.totalPrice, 0);
                    this.listlength = this.vendorSaleOrderItemsList.reduce((sum, item) => sum + item.totalQuantity, 0);

                    this.totalSaleReportItems = this.vendorSaleOrderItemsList.length;
                    this.AveragePrice = parseFloat((this.totalPrice / this.listlength).toFixed(2));

                }
            });
          this.getUserSaleOrderData(startDate, endDate, stallId);
    }
    dateRangeVendorOrders(
        dateRangeStart: HTMLInputElement,
        dateRangeEnd: HTMLInputElement
    ) {
        const sDate = new Date(dateRangeStart.value);
        const eDate = new Date(dateRangeEnd.value);
        const startDate = formatDate(
            sDate.setHours(0, 0, 0, 0),
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
        const endDate = formatDate(
            eDate.setHours(23, 59, 59),
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
        let payload = {
            startDate,
            endDate,
        };
        this.service.getOrderCollection(payload).subscribe((data) => {
            this.allOrdersData = data?.orders;
            this.UserBasedSalesData();
        });
    }
    toggleAutoRefresh(event) {
        if (!event.checked) this.ngOnDestroy();
        else this.AutoRefresh();
    }
    async UserBasedSalesData() {
        this.paymentMethodsList = this.paymentMethodsList.filter(
            (person, index, self) =>
                index ===
                self.findIndex((p) => p.paymentType === person.paymentType)
        );
        if (this.allOrdersData?.length > 0) {
            console.log('payment Methods', this.paymentMethodsList);
            // for defaulting price zero
            this.paymentMethodsList.forEach((method) => {
                method['amount'] = 0;
            });
            // for overall sales
            this.allOrdersData.forEach((order: Orders) => {
                // testing number 7995885506
                if (this.mobileNumber != '9618812143') {
                    if (order.mobileno == this.mobileNumber) {
                        this.paymentMethodsList.forEach((payType) => {
                            if (order.paymentMode === payType.paymentType) {
                                payType.amount += order.amount;
                            }
                        });
                    }
                } else {
                    this.paymentMethodsList.forEach((payType) => {
                        if (order.paymentMode === payType.paymentType) {
                            payType.amount += order.amount;
                        }
                    });
                }
            });
            this.overallTotal = 0;
            this.paymentMethodsList.forEach((method) => {
                this.overallTotal += method.amount;
            });
        }
    }
    async MenuInventoryData(startDate, endDate) {
        let stallId = this.stallControl.value;
        let subCategory = this.subCatControl.value;
        const payload = {
            startDate,
            endDate,
        };
        const resp = await this.service.fetchRequestPost(
            'stallinventory/getStallInventoryByDate',
            payload
        );
        this.menuInventoryList = resp['stallInventoryList'];
        this.menuInventoryList.forEach((menu) => {
            this.stallData.forEach((stall) => {
                if (menu.stallid === stall.stallid) {
                    menu['stallName'] = stall.name;
                }
            });
        });
        if (stallId != 'All') {
            this.menuInventoryList = this.menuInventoryList.filter((item) => {
                return item.stallid === parseInt(stallId);
            });
        }
        if (subCategory != 'All') {
            this.menuInventoryList = this.menuInventoryList.filter((item) => {
                return item.subCategory === parseInt(subCategory);
            });
        }
        //
        if (this.mobileNumber != '9618812143') {
            this.stallOperator.forEach((op) => {
                if (op.mobile === this.mobileNumber) {
                    this.vendorId = op?.vendorId;
                }
            });
            this.menuInventoryList = this.menuInventoryList.filter((data) => {
                return data?.vendorId === this.vendorId;
            });
        }
    }
    open(content) {
        this.stallsearch.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterstall();
            });
        this.itemfilter.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filteritems();
            });
        // this.productsarray();
        this.modalReference = this.modalService.open(content);
        this.TableFieldsForm.controls['itemUOM'].disable();
        this.TableFieldsForm.controls['date'].enable();
        this.editMode = false;

        this.TableFieldsForm.markAsUntouched();
    }
    protected filterstall() {
        if (!this.stallData) {
            return;
        }
        // get the search keyword
        let search = this.stallsearch.value;
        if (!search) {
            this.filteredStalls = this.stallData.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredStalls = this.stallData.filter(
            (bank) => bank.name.toLowerCase().indexOf(search.toLowerCase()) > -1
        );
    }
    protected filteritems() {
        if (!this.productIngrList) {
            return;
        }
        // get the search keyword
        let search = this.itemfilter.value;
        if (!search) {
            this.filteredIngrs = this.productIngrList.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredIngrs = this.productIngrList.filter(
            (bank) =>
                bank.prodName.toLowerCase().indexOf(search.toLowerCase()) > -1
        );
    }
    OnClose() {
        this.modalReference.close();
    }
    OnGoPress() {
        const invSDate = this.invStartDate.nativeElement.value;
        const invEDate = this.invEndDate.nativeElement.value;
        if (invSDate && invEDate) {
            const sDate = new Date(Date.parse(invSDate));
            const eDate = new Date(Date.parse(invEDate));
            let startDate = formatDate(sDate, 'YYYY-MM-dd', this.locale);
            let endDate = formatDate(eDate, 'YYYY-MM-dd', this.locale);
            this.MenuInventoryData(startDate, endDate);
        }
    }
    onDelPopup(template, row) {
        this.delobj = {
            stallinventoryid: row.stallinventoryid,
        };
        this.modalReference = this.modalService.open(template, {
            ariaLabelledBy: 'modal-basic-title',
        });
    }
    async confirm() {
        const delresp = await this.service.fetchRequestdel(
            'stallinventory/deleteStallInventory',
            this.delobj
        );

        this.modalReference.close();
        this.OnGoPress();
    }
    onEdit(content, data) {
        this.stallsearch.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterstall();
            });
        this.itemfilter.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filteritems();
            });
        this.modalReference = this.modalService.open(content, {
            ariaLabelledBy: 'modal-basic-title',
        });
        this.TableFieldsForm.markAsUntouched();

        this.TableFieldsForm.controls['stallid'].disable();
        this.TableFieldsForm.controls['itemUOM'].disable();
        this.TableFieldsForm.controls['date'].disable();

        this.stallinventoryid = data.stallinventoryid;
        this.TableFieldsForm.patchValue({
            date: data?.date,
            itemName: data?.itemName,
            saleCount: data.saleCount,
            packedCount: data.packedCount,
            stallid: data.stallid,
            itemUOM: data.itemUOM,
            itemID: data.itemID,
            balance: data.balance,
            subCategory: data?.subCategory,
            reserveQuantity: data?.reserveQuantity,
            packedDate: data?.packedDate,
            expiryInDays: data?.expiryInDays

        });
        this.saleCount = data.saleCount;

        this.editMode = true;
    }
    async onSavePopup() {
        const data = this.TableFieldsForm.getRawValue();
        data.subCategory = parseInt(data.subCategory);
        if (this.editMode) {
            data['saleCount'] = this.saleCount;
            data['stallinventoryid'] = this.stallinventoryid;

            data['balance'] = data.balance;
            this.TableFieldsForm.controls['stallid'].enable();
        } else {
            data['stallinventoryid'] = 0;
            data['saleCount'] = 0;
            data['balance'] = 0;
        }
        const saveresp = await this.service.fetchRequestPost(
            'stallinventory/createStallInventory',
            data
        );
        this.modalReference.close();
        this.editMode = false;
        this.TableFieldsForm.reset();
        this.stallinventoryid = 0;

        this.OnGoPress();
    }
    OnItemSelect(selectedItem) {
        const prodid = parseInt(selectedItem.source.value);
        this.productIngrList.forEach((item) => {
            item.variants.forEach((object) => {
                if (prodid == object.prodId) {
                    // console.log(`all objects are ${JSON.stringify(object)}`);
                    this.TableFieldsForm.controls['itemName'].setValue(
                        item.prodName
                    );
                    this.TableFieldsForm.controls['itemUOM'].setValue(
                        object.uom
                    );
                }
            });
        });
    }
    async ReportCalculatorData() {
        this.ReportcalculatorOptions = {
            series: [
                {
                    name: "Report",
                    type: "column",
                    data: [1.4, 2, 2.5, 1.5, 2.5, 2.8, 3.8, 4.6, 4.5]
                }
            ],
            chart: {
                height: 350,
                type: 'bar',
                stacked: false
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                width: [1]
            },
            title: {
                text: "Report Calculator",
                align: "left",
                offsetX: 110
            },
            xaxis: {
                categories: this.stallData
            },
            yaxis: [

                {
                    seriesName: "Report",
                    opposite: true,

                    axisTicks: {
                        show: true
                    },
                    axisBorder: {
                        show: true,
                        color: "#00E396"
                    },


                },

            ],
            tooltip: {
                fixed: {
                    enabled: true,
                    position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
                    offsetY: 30,
                    offsetX: 60
                }
            },

        }
    }
    async ReportChartData() {
        this.ReopertchartOptions = {
            series: [
                {
                    name: "Purchase",
                    type: "column",
                    data: this.purchaseData
                },
                {
                    name: "Sales",
                    type: "column",
                    data: this.salesData
                }
            ],
            chart: {
                height: 350,
                type: 'bar',
                stacked: false
            },
            plotOptions: {
                bar: {
                    colors: {
                        ranges: [
                            {
                                from: 0,
                                to: 1,
                                color: '#E759AC',
                            }
                        ]
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                width: [1, 1, 4]
            },
            title: {
                text: "Purchase & Sales Report",
                align: "left",
                offsetX: 110
            },
            xaxis: {
                categories: this.ReportfilteredData
            },

            yaxis: [
                {
                    axisTicks: {
                        show: false
                    },
                    axisBorder: {
                        show: true,
                        color: "#008FFB"
                    },


                    tooltip: {
                        enabled: true
                    },
                },
                {
                    seriesName: "Purchase",
                    opposite: true,

                    axisTicks: {
                        show: true
                    },
                    axisBorder: {
                        show: true,
                        color: "#00E396"
                    },


                },

            ],
            tooltip: {
                fixed: {
                    enabled: true,
                    position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
                    offsetY: 30,
                    offsetX: 60
                }
            },

        }
    }
    async counterChartData(startDate, endDate) {
        const payload = {
            startDate,
            endDate,
        };
        const resp = await this.service.fetchRequestPost(
            'stall/counterData',
            payload
        );
        this.counterData = resp;
        console.log('counterData resp', resp);
        let stallNameArray = [];
        let stallAmount = [];
        this.counterData.forEach((counter) => {
            stallNameArray.push(counter.stallName);
            stallAmount.push(counter.totalAmount);
        });
        console.log('stall Array', stallNameArray);
        console.log('stall amount', stallAmount);
        this.counterChartOptions = {
            series: [
                {
                    name: 'Amount',
                    data: stallAmount,
                },
            ],
            chart: {
                height: 350,
                type: 'bar',
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        position: 'top', // top, center, bottom
                    },
                },
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return '$ ' + val;
                },
                offsetY: -20,
                style: {
                    fontSize: '12px',
                    colors: ['#304758'],
                },
            },

            xaxis: {
                categories: stallNameArray,
                position: 'top',
                labels: {
                    offsetY: -18,
                },
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                crosshairs: {
                    fill: {
                        type: 'gradient',
                        gradient: {
                            colorFrom: '#D8E3F0',
                            colorTo: '#BED1E6',
                            stops: [0, 100],
                            opacityFrom: 0.4,
                            opacityTo: 0.5,
                        },
                    },
                },
                tooltip: {
                    enabled: true,
                    offsetY: -35,
                },
            },
            yaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                labels: {
                    show: false,
                    formatter: function (val) {
                        return '$' + val;
                    },
                },
            },
            title: {
                text: 'Expenses of each counter',
                floating: false,
                offsetY: 320,
                align: 'center',
                style: {
                    color: '#444',
                },
            },
        };

        console.log('ctr options', this.counterChartOptions);
    }
    onAddtoPoPress(row, modal) {
        this.kitInvRow = row;
        this.adhocItemformGroup.controls['productlist'].setValue(row.itemId);
        let uom = '';
        let subCatName = '';
        this.productsList.forEach((prod) => {
            if (prod.itemId === row.itemId) {
                uom = prod.uom;
                subCatName = prod.subCategoryName;
            }
        });
        this.adhocItemformGroup.controls['uom'].setValue(uom);
        this.adhocItemformGroup.controls['category'].setValue(subCatName);
        this.modalReference = this.dialog.open(modal);
    }
    getSaleOrderData(startDate, endDate) {
        // change the logic you can write this in one array instead of multiple arrays
        let tiffPayload = {
            startDate,
            endDate,
            type: 'Tiffins',
            vendorId: 1001,
        };
        let lunchPayload = {
            startDate,
            endDate,
            type: 'Lunch',
            vendorId: 1001,
        };
        let snacksPayload = {
            startDate,
            endDate,
            type: 'Snacks',
            vendorId: 1001,
        };
        let dinnerPayload = {
            startDate,
            endDate,
            type: 'Dinner',
            vendorId: 1001,
        };
        this.service.getGroupSaleOrders(tiffPayload).subscribe((data) => {
            this.tiffinsSaleOrderData = data;
            this.tiffinsSaleOrderData.forEach((item) => {
                this.tiffinsSaleOrderPrice += item.totalPrice;
            });
        });
        this.service.getGroupSaleOrders(lunchPayload).subscribe((data) => {
            this.lunchSaleOrderData = data;
            this.lunchSaleOrderData.forEach((item) => {
                this.lunchSaleOrderPrice += item.totalPrice;
            });
        });
        this.service.getGroupSaleOrders(snacksPayload).subscribe((data) => {
            this.snacksSaleOrderData = data;
            this.snacksSaleOrderData.forEach((item) => {
                this.snacksSaleOrderPrice += item.totalPrice;
            });
        });
        this.service.getGroupSaleOrders(dinnerPayload).subscribe((data) => {
            this.dinnerSaleOrderData = data;
            this.dinnerSaleOrderData.forEach((item) => {
                this.dinnerSaleOrderPrice += item.totalPrice;
            });
        });
    }
    getUserSaleOrderData(startDate, endDate, vendorId) {
        let payload = {
            // stallid,
            // dispenseStatus,
            startDate,
            endDate,
            vendorId,
        };
        this.totalPrice = 0;
        this.listlength = 0;
        this.AveragePrice = 0;
        this.vendorSaleOrderItemsList = [];
        this.service
            .getGroupSaleOrders(payload)
            .subscribe((data: SaleOrderItemsGroup[]) => {
                // for unique subcategories
                if (data.length > 0) {
                    this.vendorSaleOrderItemsList = data;
                    this.vendorSaleOrderItemsList.sort((a, b) => b.totalQuantity - a.totalQuantity);
                    this.totalPrice = this.vendorSaleOrderItemsList.reduce((sum, item) => sum + item.totalPrice, 0);
                    this.listlength = this.vendorSaleOrderItemsList.reduce((sum, item) => sum + item.totalQuantity, 0);
                    this.totalSaleReportItems = this.vendorSaleOrderItemsList.length;
                    this.AveragePrice = parseFloat((this.totalPrice / this.listlength).toFixed(2));

                }
            });
    }
    getitemSaleReprotData(startDate, endDate, vendorId, stallId, dispenseStatus) {
        let payload = {
            stallId,
            dispenseStatus,
            startDate,
            endDate,
            vendorId,
        };
        this.totalPrice = 0;
        this.listlength = 0;
        this.AveragePrice = 0;
        this.vendorSaleOrderItemsList = [];
        this.service
            .getGroupSaleOrders(payload)
            .subscribe((data: SaleOrderItemsGroup[]) => {
                // for unique subcategories
                if (data.length > 0) {
                    this.vendorSaleOrderItemsList = data;
                    this.vendorSaleOrderItemsList.sort((a, b) => b.totalQuantity - a.totalQuantity);
                    this.totalPrice = this.vendorSaleOrderItemsList.reduce((sum, item) => sum + item.totalPrice, 0);

                    // this.listlength = this.vendorSaleOrderItemsList.length;
                    this.listlength = this.vendorSaleOrderItemsList.reduce((sum, item) => sum + item.totalQuantity, 0);
                    this.totalSaleReportItems = this.vendorSaleOrderItemsList.length;
                    this.AveragePrice = parseFloat((this.totalPrice / this.listlength).toFixed(2));

                }
            });
    }
  async onStockItemclick(prod,modal){
        // console.log(prod)
        // this.stockProdId = prod;
        this.stockProdId = '';
        const resp = await this.service.fetchRequest(
            'report/getstockavailbyitem',{ itemId: prod }
          
        );
     this.ItemStockData = resp;
     console.log("ItemStockData",this.ItemStockData);
     this.ItemStockQty = 0;
     this.ItemStockData.forEach((obj)=>{
        this.ItemStockQty += obj?.availQuantity || 0;
     })
     this.modalReference = this.dialog.open(modal);
     this.stockProdId = this.productIngrList.find((obj) => obj?.prodId == prod);
console.log(this.stockProdId)
    }
    onSelectStockProducts(value){
        console.log(value)  
      }
    onSelectProducts(value) {
        console.log(value);
        let uom = '';

        let subCatName = '';
        // logic from getting price from purchase rate card
        this.productsList.forEach((rateCard) => {
            if (rateCard.itemId === value) {
                uom = rateCard.uom;
                subCatName = rateCard.subCategoryName;
                this.adhocItemformGroup.controls['uom'].setValue(uom);
                this.adhocItemformGroup.controls['category'].setValue(uom);
            }
        });
    }
    seperateQtyByCategory(allData: KitchenInventoryClass[]) {
        this.outofStockItemsGroceries = allData.filter((inv) => {
            return inv.category == 'Groceries';
        });
        this.outofStockItemsVegetables = allData.filter((inv) => {
            return inv.category == 'Vegetables';
        });
        this.outofStockItemsNonVeg = allData.filter((inv) => {
            return inv.category == 'Non Veg';
        });
        this.outofStockItemsOthers = allData.filter((inv) => {
            return inv.category == 'Others';
        });
        this.selectedTabData = new MatTableDataSource(
            this.outofStockItemsVegetables
        );
    }
    dateChangeCounter(
        dateRangeStart: HTMLInputElement,
        dateRangeEnd: HTMLInputElement
    ) {
        const sDate = new Date(dateRangeStart.value);
        const eDate = new Date(dateRangeEnd.value);
        let startDate = formatDate(sDate, 'YYYY-MM-dd', this.locale);
        let endDate = formatDate(eDate, 'YYYY-MM-dd', this.locale);
        this.counterChartData(startDate, endDate);
    }
    dateChangeSale(
        dateRangeStart: HTMLInputElement,
        dateRangeEnd: HTMLInputElement
    ) {
        const sDate = new Date(dateRangeStart.value);
        const eDate = new Date(dateRangeEnd.value);
        const startDate = formatDate(
            sDate.setHours(0, 0, 0, 0),
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
        const endDate = formatDate(
            eDate.setHours(23, 59, 59),
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
        if (this.mobileNumber != "9618812143") {
            this.getUserSaleOrderData(startDate, endDate, this.vendorId);
        }
        else this.getSaleOrderData(startDate, endDate);
    }
    announceSortChange(sort: Sort) {
        let data = this.selectedTabData.data;

        if (!sort.active || sort.direction === '') {
            this.selectedTabData.data = data;
        } else {
            data = data.sort((a, b) => {
                const aValue = (a as any)[sort.active];
                const bValue = (b as any)[sort.active];
                return (
                    (aValue < bValue ? -1 : 1) *
                    (sort.direction === 'asc' ? 1 : -1)
                );
            });
            this.selectedTabData.data = data;
            console.log(data);
        }
    }
    OutOfStockTabChange(event) {
        console.log(event);
        if (event.index === 0)
            this.selectedTabData = new MatTableDataSource(
                this.outofStockItemsVegetables
            );
        else if (event.index === 1)
            this.selectedTabData = new MatTableDataSource(
                this.outofStockItemsGroceries
            );
        else if (event.index === 2)
            this.selectedTabData = new MatTableDataSource(
                this.outofStockItemsNonVeg
            );
        else if (event.index === 3)
            this.selectedTabData = new MatTableDataSource(
                this.outofStockItemsOthers
            );
    }
    // eachSubCategoryAmountAndDetails(
    //     categoryType: string,
    //     array: any,
    //     objectNumber: number
    // ) {
    //     this.allCategoriesTransactions[objectNumber] = new Object({
    //         type: categoryType,
    //     });
    //     let totalAmount = 0;
    //     let payTm = 0;
    //     let cash = 0;
    //     let othersAmount = 0;
    //     array.forEach((order) => {
    //         totalAmount += order.amount;
    //     });
    //     array.forEach((order: Orders) => {
    //         if (order.paymentMode === 'paytmAtStall') payTm += order.amount;
    //         else if (order.paymentMode === 'cod') cash += order.amount;
    //         else if (order.paymentMode.includes('Others')) {
    //             othersAmount += order.amount;
    //         }
    //     });

    //     this.allCategoriesTransactions[objectNumber][
    //         'totalAmount'
    //     ] = totalAmount;
    //     this.allCategoriesTransactions[objectNumber].paytm = payTm;
    //     this.allCategoriesTransactions[objectNumber].cod = cash;
    //     this.allCategoriesTransactions[
    //         objectNumber
    //     ].othersAmount = othersAmount;
    //     return this.allCategoriesTransactions;
    // }
    // dateRangeChange(
    //     dateRangeStart: HTMLInputElement,
    //     dateRangeEnd: HTMLInputElement
    // ) {
    //     const sDate = new Date(dateRangeStart.value);
    //     const eDate = new Date(dateRangeEnd.value);
    //     const startDate = formatDate(
    //         sDate.setHours(0, 0, 0, 0),
    //         'YYYY-MM-dd HH:mm:ss',
    //         this.locale
    //     );
    //     const endDate = formatDate(
    //         eDate.setHours(23, 59, 59),
    //         'YYYY-MM-dd HH:mm:ss',
    //         this.locale
    //     );
    //     const payload = {
    //         startDate,
    //         endDate,
    //     };
    //     console.log(payload);
    //     this.service.getOrderCollection(payload).subscribe((data) => {
    //         console.log(data);
    //         this.paytmAmount = 0;
    //         this.cashAmount = 0;
    //         if (data.orders) {
    //             data.orders.forEach((order: Orders) => {
    //                 this.totalAmount += order.amount;
    //             });
    //             // for overall paytm and cash
    //             data.orders.forEach((order: Orders) => {
    //                 if (order.paymentMode === 'paytmAtStall') {
    //                     this.paytmAmount += order.amount;
    //                 }
    //                 if (order.paymentMode === 'cod') {
    //                     this.cashAmount += order.amount;
    //                 }
    //             });
    //             // array for piechart
    //             let arraySeries = [];
    //             arraySeries[0] = this.paytmAmount;
    //             arraySeries[1] = this.cashAmount;
    //             // sepearating category wise payments
    //             this.tiffinsTransactions = data.orders.filter(
    //                 (order: Orders) => {
    //                     return order.subCatName === 'Tiffins';
    //                 }
    //             );
    //             this.lunchTransactions = data.orders.filter((order: Orders) => {
    //                 return order.subCatName === 'Lunch';
    //             });
    //             this.snacksTransactions = data.orders.filter(
    //                 (order: Orders) => {
    //                     return order.subCatName === 'Snacks';
    //                 }
    //             );
    //             this.dinnerTransactions = data.orders.filter(
    //                 (order: Orders) => {
    //                     return order.subCatName === 'Dinner';
    //                 }
    //             );
    //             // adding each payment type and category wise details to another array
    //             if (this.tiffinsTransactions.length > 0) {
    //                 this.allCategoriesTransactions = this.eachSubCategoryAmountAndDetails(
    //                     'Tiffins',
    //                     this.tiffinsTransactions,
    //                     0
    //                 );
    //             }
    //             if (this.lunchTransactions.length > 0) {
    //                 this.allCategoriesTransactions = this.eachSubCategoryAmountAndDetails(
    //                     'Lunch',
    //                     this.lunchTransactions,
    //                     1
    //                 );
    //             }
    //             if (this.snacksTransactions.length > 0) {
    //                 this.allCategoriesTransactions = this.eachSubCategoryAmountAndDetails(
    //                     'Snacks',
    //                     this.snacksTransactions,
    //                     2
    //                 );
    //             }
    //             if (this.dinnerTransactions.length > 0) {
    //                 this.allCategoriesTransactions = this.eachSubCategoryAmountAndDetails(
    //                     'Dinner',
    //                     this.dinnerTransactions,
    //                     3
    //                 );
    //             }

    //             this.allCategoriesTransactions = this.allCategoriesTransactions.filter(
    //                 (value) => Object.keys(value).length !== 0
    //             );
    //             this.salesChartDetails = {
    //                 chart: {
    //                     animations: {
    //                         speed: 400,
    //                         animateGradually: {
    //                             enabled: false,
    //                         },
    //                     },
    //                     fontFamily: 'inherit',
    //                     foreColor: 'inherit',
    //                     height: '100%',
    //                     type: 'donut',
    //                     sparkline: {
    //                         enabled: false,
    //                     },
    //                     toolbar: {
    //                         show: true,
    //                     },
    //                 },
    //                 colors: ['#3182CE', '#63B3ED'],
    //                 labels: ['Paytm', 'COD'],
    //                 plotOptions: {
    //                     pie: {
    //                         startAngle: 0,
    //                         endAngle: 360,
    //                         expandOnClick: true,
    //                         offsetX: 0,
    //                         offsetY: 0,
    //                         customScale: 1,
    //                         dataLabels: {
    //                             offset: 0,
    //                             minAngleToShowLabel: 10,
    //                         },
    //                         donut: {
    //                             size: '70%',
    //                             background: 'transparent',
    //                             labels: {
    //                                 show: true,
    //                                 name: {
    //                                     show: true,
    //                                     fontSize: '22px',
    //                                     fontFamily:
    //                                         'Helvetica, Arial, sans-serif',
    //                                     fontWeight: 600,
    //                                     color: undefined,
    //                                     offsetY: -10,
    //                                     formatter: function (val) {
    //                                         return val;
    //                                     },
    //                                 },
    //                                 value: {
    //                                     show: true,
    //                                     fontSize: '16px',
    //                                     fontFamily:
    //                                         'Helvetica, Arial, sans-serif',
    //                                     fontWeight: 400,
    //                                     color: undefined,
    //                                     offsetY: 16,
    //                                     formatter: function (val) {
    //                                         return val;
    //                                     },
    //                                 },
    //                                 total: {
    //                                     show: true,
    //                                     showAlways: true,
    //                                     label: 'Total',
    //                                     fontSize: '22px',
    //                                     fontFamily:
    //                                         'Helvetica, Arial, sans-serif',
    //                                     fontWeight: 600,
    //                                     color: '#373d3f',
    //                                     formatter: function (w) {
    //                                         return w.globals.seriesTotals.reduce(
    //                                             (a, b) => {
    //                                                 return a + b;
    //                                             },
    //                                             0
    //                                         );
    //                                     },
    //                                 },
    //                             },
    //                         },
    //                     },
    //                 },
    //                 series: arraySeries,
    //                 dataLabels: {
    //                     formatter: function (val, opts) {
    //                         console.log(opts.w.config.series);
    //                         return opts.w.config.series[opts.seriesIndex];
    //                     },
    //                 },
    //                 states: {
    //                     hover: {
    //                         filter: {
    //                             type: 'none',
    //                         },
    //                     },
    //                     active: {
    //                         filter: {
    //                             type: 'none',
    //                         },
    //                     },
    //                 },
    //                 tooltip: {
    //                     enabled: true,
    //                     fillSeriesColor: false,
    //                     theme: 'dark',
    //                     custom: ({
    //                         seriesIndex,
    //                         w,
    //                     }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
    //                                                         <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
    //                                                         <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
    //                                                         <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}</div>
    //                                                     </div>`,
    //                 },
    //             };
    //         }
    //     });
    // }
    enquiryClick() {
        this.router.navigateByUrl('nfm/kitchen-tasks/enquiry');
    }
    protected filterproducts() {
        if (!this.productsList) {
            return;
        }
        // get the search keyword
        let search = this.itemControl.value;
        if (!search) {
            this.filtereditems = this.productsList.slice();
            return;
        } else {
            search = search.toLowerCase();
        }

        // filter the banks
        this.filtereditems = this.productsList.filter(
            (bank) =>
                bank.itemName.toLowerCase().indexOf(search.toString()) > -1
        );
    }
    async OnSavePO(){
        let payload = this.adhocItemformGroup.value;
        payload['adhocpoitemid'] = 0;
        payload['available'] = false;
        payload['ispacked'] = false;
        payload['isreceived'] = false;
        const updateresp = await this.service.fetchRequestPost(
            'adhocpoitem/createadhocpoitem',
            payload
        );
        const invPayload = this.kitInvRow;
        invPayload['checked'] = true;
        const invResp = await this.service.fetchRequestPost(
            'kitcheninventory/createkitcheninventory',
            invPayload
        );
        this.modalReference.close();

        this.adhocItemformGroup.reset();
    }
    async onSearch(){
        let form = this.geniepurchaseandsales.getRawValue();
        let startDate = form?.startDate;
        let endDate = form?.endDate;
        const geniesListValues = form?.genieIdsList;
        let genieId = geniesListValues;
        let stallIdList = form?.genieIdsList;
        let stallId=stallIdList;
        stallIdList = stallIdList.join(',');
        form['stallIdList'] = stallIdList;
        form['stallId'] = null;
        form['genieId'] = null;
    
        // getting genieIds based on stallId
        this.genieList=[];
        // this.genieNamesList = [];
       geniesListValues.map((obj)=>{
        const foundGenie = this.genieMangresp.find((genie) => obj == genie.stallId);
        if (foundGenie) {
          this.genieList.push(foundGenie.autoGenieId);
        } 
        })
        console.log("genieList",this.genieList);
    
        const geniesListString = this.genieList.join(',');
        // const genieNamesListString = this.genieNamesList.join(',');
        // console.log("this.genieNamesList",this.genieNamesList)
        form.genieIdsList = geniesListString;
        form['startDate'] = formatDate(
            startDate,
            'YYYY-MM-dd',
            this.locale
        );
        form['endDate'] =  formatDate(
            endDate,
            'YYYY-MM-dd',
            this.locale
        );
        if(genieId.length==1){
            form['genieIdsList'] = null;
            let Id = genieId[0];
            const genie = this.genieMangresp.find((genie) =>{
                if(Id == genie.stallId){
                    return genie;
                }
            });
            form['genieId'] = genie.autoGenieId;

        }
        if(stallId.length==1){
            form['stallIdList'] = null;
            form['stallId'] = stallId[0];
        }
      
        console.log("form",form);
        const resp = await this.service.fetchRequestPost(
            'genieprodinventory/getSalesReport',
            form
        );
        console.log(resp);
        this.purchaseTableData.splice(0, this.purchaseTableData.length);
        this.purchaseTableData.push(resp);
        console.log("TableData:", this.purchaseTableData)
    }
    async onSearchDailySalesReport(){
        let form = this.geniedailysalesReport.getRawValue();
        let startDate = form?.startDate;
        let endDate = form?.endDate;
        console.log("itemsalesreport",this.itemsaleReportData)
        const geniesListValues = this.itemsaleReportData.map(stall => stall.
            stallid
            );
        let genieId = geniesListValues;
        this.SalesList=[];
        // this.genieNamesList = [];
        geniesListValues.map((obj)=>{
        const foundGenie = this.genieMangresp.find((genie) => obj == genie.stallId);
        if (foundGenie) {
          this.SalesList.push(foundGenie.autoGenieId);
        } 
        })
        console.log("SalesList",this.SalesList);
    
        const geniesListString = this.SalesList.join(',');
        // const genieNamesListString = this.genieNamesList.join(',');
        // console.log("this.genieNamesList",this.genieNamesList)
        form.genieIdsList = geniesListString;
        form['startDate'] = formatDate(
            startDate,
            'YYYY-MM-dd',
            this.locale
        );
        form['endDate'] =  formatDate(
            endDate,
            'YYYY-MM-dd',
            this.locale
        );
        if(genieId.length==1){
            form['genieIdsList'] = null;
            let Id = genieId[0];
            const genie = this.genieMangresp.find((genie) =>{
                if(Id == genie.stallId){
                    return genie;
                }
            });
            form['genieId'] = genie.autoGenieId;
        }
        console.log("salesform",form);
        const resp = await this.service.fetchRequestPost(
            'genieprodinventory/getSalesByGenie',
            form
        );
        console.log(resp);
        this.barchartData = resp;
        this.barReportgenieCalculatorData()
    }
   async onSearchSalesReport(){
        let form = this.geniesalesReport.getRawValue();
        let startDate = form?.startSalesDate;
        let endDate = form?.endSalesDate;
        const geniesListValues = form?.genieIdsList;
        let genieId = geniesListValues;
        this.SalesList=[];
        // this.genieNamesList = [];
       geniesListValues.map((obj)=>{
        const foundGenie = this.genieMangresp.find((genie) => obj == genie.stallId);
        if (foundGenie) {
          this.SalesList.push(foundGenie.autoGenieId);
        } 
        })
        console.log("SalesList",this.SalesList);
    
        const geniesListString = this.SalesList.join(',');
        // const genieNamesListString = this.genieNamesList.join(',');
        // console.log("this.genieNamesList",this.genieNamesList)
        form.genieIdsList = geniesListString;
        form['startDate'] = formatDate(
            startDate,
            'YYYY-MM-dd',
            this.locale
        );
        form['endDate'] =  formatDate(
            endDate,
            'YYYY-MM-dd',
            this.locale
        );
        if(genieId.length==1){
            form['genieIdsList'] = null;
            let Id = genieId[0];
            const genie = this.genieMangresp.find((genie) =>{
                if(Id == genie.stallId){
                    return genie;
                }
            });
            form['genieId'] = genie.autoGenieId;
        }
        console.log("salesform",form);
        const resp = await this.service.fetchRequestPost(
            'genieprodinventory/getSalesByDate',
            form
        );
        console.log(resp);
        this.barchartData = resp;
        this.barReportCalculatorData()
    }
    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
    calculateTotals() {
    this.grossTotalMargin = this.geniesMargin.reduce((sum, item) => sum + item.totalMargin, 0);
    this.totalAvailableMargin = this.geniesMargin.reduce((sum, item) => sum + item.totalAvblMargin, 0);
    this.totalSaleMargin = this.geniesMargin.reduce((sum, item) => sum + item.totalSaleMargin, 0);
    
    
  }
  calculateTotals1(){
    this.totalAvailableQty = this.genies.reduce((sum, item) => sum + item.avblQty, 0);
    this.totalSaleQty = this.genies.reduce((sum, item) => sum + item.saleQty, 0);
    this.totalEmptyQty = this.genies.reduce((sum, item) => sum + item.emptyQty, 0);
    this.totalQuantity1 = this.genies.reduce((sum, item) => sum + item.totalQty, 0);
  }
  
}
