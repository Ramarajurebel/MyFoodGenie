import { Component, OnInit, ViewChild, TemplateRef, LOCALE_ID, Inject } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import {
    ApexAxisChartSeries,
    ApexChart,
    ChartComponent,
    ApexDataLabels,
    ApexPlotOptions,
    ApexYAxis,
    ApexTitleSubtitle,
    ApexXAxis,
    ApexFill,
    ApexTooltip,


} from 'ng-apexcharts';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { formatDate } from '@angular/common';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { SupplierItemsList } from 'app/shared/classes/supplier-items';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { parseInt } from 'lodash';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis | ApexYAxis[];
    xaxis: ApexXAxis;
    fill: ApexFill;

    title: ApexTitleSubtitle;

    tooltip: ApexTooltip;
};
@Component({
    selector: 'app-genie-management',
    templateUrl: './genie-management.component.html',
    styleUrls: ['./genie-management.component.scss']
})
export class GenieManagementComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
    @ViewChild('deleteProd', { static: true }) deleteProd: TemplateRef<any>;
    @ViewChild('deletetrans', { static: true }) deletetrans: TemplateRef<any>;
    @ViewChild('deleterefill', { static: true }) deleterefill: TemplateRef<any>;
    @ViewChild('machdetails', { static: true }) machdetails: TemplateRef<any>;
    @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;

    stallData: any;
    toggleValue: boolean = false;
    toggleInternet: boolean = false;
    toggleNfc: boolean = false;
    toggleCamera: boolean = false;
    uniqueFilteredSuppliers: any[] = [];
    selectedStall: any = {};
    slsReportArray = [];
    public configDetails = [];
    public productDetails = [];
    public transactionDetails = [];
    public refillDetails = [];
    public itemfilter: FormControl = new FormControl();
    public geniefilter: FormControl = new FormControl();
    public editMode = false;
    public TableFieldsForm: FormGroup;
    public ProductFieldsForm: FormGroup;
    public TransactionFieldsForm: FormGroup;
    public RefillFieldsForm: FormGroup;
    public VMSFieldsForm: FormGroup;
    public copyMapping: FormGroup;
    protected _onDestroy = new Subject<void>();
    public suppliersearch: FormControl = new FormControl();
    private apiUrl = '/vendomatic';
    delObj = {};
    delprod = {};
    deltrans = {};
    delrefill = {};
    autoGenieId: number = 0;
    isMatDrawerOpened = false;
    public statusData = [
        'Active',
        'In Active'
    ];
    public refillData = [
        'Open', 'InProgress', 'Refill Rejected', 'Completed'
    ];
    public CheckData = [
        'Reachable',
        'Not Rechable'
    ];
    costData = ['true', 'false'];
    modalReference: MatDialogRef<unknown, any>;
    genieProdMapId: any;
    stallList: any;
    filteredstallData: any;
    genieTransactionId: any;
    genieRefillId: any;
    purchaseDetails: any;
    selectedValue: number = 0;
    selectedChartValue: number = 0;
    suppItems: any;
    genieProducts = [];
    genieRacks = [];
    genieSlots = [];
    genieSuppliers = [];
    EmpstallList: any;
    filteredEmplist: any;
    filteredItemData: any;
    filteredGenieData: any[];
    suppliersList: any;
    filteredSupplier: any;
    refillSupId: FormControl = new FormControl();
    refillItemId: FormControl = new FormControl();
    refillQuantityValidator: number = 0;
    mapngSupName: FormControl = new FormControl();
    mapngItemId: FormControl = new FormControl();
    RefillAvailableStock: any;
    itemObj: any;
    prevObjmapp: any;
    configFilteredData: any;
    purchaseTableData: any[] = [];
    barchartData: any;
    selectedConfigValue: number = 0;
    selectedProductValue: number = 0;
    ProductFilteredData: any;
    selectedRefillValue: number = 0;
    RefillFilteredData: any[];
    selectedTransactionValue: number = 0;
    vendorId: number = 0;
    TransactionFilteredData: any[];
    VMSMachineDetails: any;
    MachineFilteredData: any;
    selectedMachineValue: number = 0;
    MachineInfo: any;
    MachineSlotDetails: any;
    VMSProducts: any;
    Selectedrow: any;
    VMSMachineId: any;
    stocklimitenabled_value: number;
    genieselected: boolean=false;

    constructor(private service: ProjectService, private dialog: MatDialog, private fb: FormBuilder, @Inject(LOCALE_ID) public locale: string, private snackBar: MatSnackBar, private http: HttpClient) {


    }

    async ngOnInit() {
        let vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }
        this.genieselected = false;
        this.RefillFieldsForm = new FormGroup({
            genieId: new FormControl(''),
            supplierId: new FormControl(''),
            supName: new FormControl(''),
            rackId: new FormControl(),
            slotId: new FormControl(),
            itemId: new FormControl(''),
            quantity: new FormControl(''),
            status: new FormControl(''),
            refilledBy: new FormControl(''),
            date: new FormControl(''),
            vendorId: new FormControl('')

        })
        this.TransactionFieldsForm = new FormGroup({
            genieId: new FormControl(''),
            location: new FormControl(''),
            status: new FormControl(''),
            remarks: new FormControl(''),
            startDateTime: new FormControl(''),
            endDateTime: new FormControl(''),
            statusCheck: new FormControl(''),
            powerStatus: new FormControl(false),
            internetStatus: new FormControl(false),
            nfcStatus: new FormControl(false),
            cameraStatus: new FormControl(false),
            vendorId: new FormControl(),
        })
        this.ProductFieldsForm = new FormGroup({
            genieId: new FormControl(''),
            supplierId: new FormControl(''),
            supName: new FormControl(''),
            rackId: new FormControl(''),
            slotId: new FormControl(''),
            quantity: new FormControl(''),
            itemId: new FormControl(''),
            vendorId: new FormControl(''),
        })
        this.TableFieldsForm = new FormGroup({
            serialNo: new FormControl(''),
            vmsMachId: new FormControl(''),
            genieId: new FormControl(''),
            stallId: new FormControl(''),
            name: new FormControl(''),
            keyInfo: new FormControl(''),
            description: new FormControl(''),
            equipmentId: new FormControl('', [Validators.maxLength(4)]),
            functionalLocId: new FormControl('', [Validators.maxLength(22)]),
            // state: new FormControl('',[Validators.maxLength(2)]),
            // city: new FormControl('',[Validators.maxLength(3)]),
            // village: new FormControl('', [Validators.maxLength(3)]),
            // buildingId: new FormControl('',[Validators.maxLength(5)]),
            // fid: new FormControl('',[Validators.maxLength(2)]),
            // serial: new FormControl('', [Validators.maxLength(4)]),
            date: new FormControl(''),
            manufactureId: new FormControl(''),
            model: new FormControl(''),
            dimensions: new FormControl(''),
            displayscreen: new FormControl(''),
            voltage: new FormControl(''),
            power: new FormControl(''),
            weight: new FormControl(''),
            temperature: new FormControl('', [Validators.maxLength(5)]),
            capacity: new FormControl('', [Validators.maxLength(3)]),
            type: new FormControl('', [Validators.maxLength(2)]),
            // totalRacks: new FormControl(''),
            // totalSlots: new FormControl(''),
            // slotsPerRack: new FormControl(''),
            // maxTrayQtyPerSlot: new FormControl(''),
            // maxQuantity: new FormControl(''),
            // location: new FormControl(''),
            status: new FormControl(''),
            quantity: new FormControl(''),
            suitableFor: new FormControl(''),
            vendorId: new FormControl(''),
        });
        this.VMSFieldsForm = new FormGroup({
            slotName: new FormControl(''),
            rowNumber: new FormControl(''),
            coloumnNumber: new FormControl(''),
            productId: new FormControl(''),
            showProductCost: new FormControl(true),
            showProductName: new FormControl(true),
            showProductImage: new FormControl(true),
            stocklimitEnabled: new FormControl(false),
        });
        this.copyMapping = new FormGroup({
            existingGenieId: new FormControl(''),
            reqGenieId: new FormControl('')
        });
        const Empresp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.EmpstallList = Empresp['stallOperatorList'];

        this.filteredEmplist = this.EmpstallList.filter(Emp => Emp.role === "Employee");

        const stallresp = await this.service.fetchRequest('stall/getAllStalls');
        this.stallList = stallresp['supplierList'];
        this.filteredstallData = this.stallList.filter(stall => stall.type === 'Genie');
        console.log("SelectedValue : ", this.selectedStall);

        // this.TableFieldsForm.get('stallId').valueChanges.subscribe((selectedStallId: string) => {
        //   const selectedStall = this.filteredstallData.find(stall => stall.stallid === selectedStallId);
        //   if (selectedStall) {
        //     this.TableFieldsForm.get('genieId').setValue(selectedStall.stallCode);
        //   } else {
        //     this.TableFieldsForm.get('genieId').setValue('');
        //   }
        // });






        const resp = await this.service.fetchRequest(
            'geniemanagement/getAllGenieManagement'
        );

        this.configDetails = resp['genieManagementList'];
        const prodresp = await this.service.fetchRequest(
            'geniemapping/getAllGenieMapping'
        );
        this.productDetails = prodresp['genieMappingList'];
        //
        const tranresp = await this.service.fetchRequest(
            'genietransactions/getAllGenieTransactions'
        );
        this.transactionDetails = tranresp['genieTransactionsList'];
        this.transactionDetails.forEach(transactDate => {
            if (transactDate.startDateTime) {
                transactDate.startDateTime = formatDate(transactDate.startDateTime, 'YYYY-MM-dd HH:mm:ss',
                    this.locale)
            }
            if (transactDate.endDateTime) {
                transactDate.endDateTime = formatDate(transactDate.endDateTime, 'YYYY-MM-dd HH:mm:ss',
                    this.locale)
            }
        })
        const suppList = await this.service.fetchRequest(
            'supplier/getAllSuppliers'
        );
        this.suppliersList = suppList['supplierList'];

        // const startDate = formatDate(
        //   new Date().setHours(0, 0, 1, 0),
        //   'YYYY-MM-dd HH:mm:ss',
        //   this.locale
        // );
        const refillresp = await this.service.fetchRequest(
            'genierefill/getAllGenieRefill'
        );
        this.refillDetails = refillresp['genieRefillList'];
        const suppResp = await this.service.fetchRequest(
            'supplieritem/getAllSupplierItems'
        );
        this.suppItems = suppResp['supplierItemList'];
        this.productDetails.forEach(productmap => {
            this.suppItems.forEach(supplierItem => {
                if (productmap.itemId == parseInt(supplierItem.productId)) {
                    productmap.productname = supplierItem.productname
                }
            })
        })
        this.productDetails.forEach(productmap => {
            this.configDetails.forEach(configItem => {
                if (productmap.genieId == parseInt(configItem.autoGenieId)) {
                    productmap.genieName = configItem.genieId
                }
            })
        })
        this.refillDetails.forEach(refillmap => {
            this.configDetails.forEach(configItem => {
                if (refillmap.genieId == parseInt(configItem.autoGenieId)) {
                    refillmap.genieName = configItem.genieId
                }
            })
        })
        this.refillDetails.forEach(refillItemMap => {
            this.suppItems.forEach(supplierItem => {
                if (refillItemMap.itemId == parseInt(supplierItem.productId)) {
                    refillItemMap.productname = supplierItem.productname
                }
            })
        })
        this.transactionDetails.forEach(transactmap => {
            this.configDetails.forEach(configItem => {
                if (transactmap.genieId == parseInt(configItem.autoGenieId)) {
                    transactmap.genieName = configItem.genieId
                }
            })
        })
        this.filteredItemData = this.suppItems;
        this.filteredGenieData = this.configDetails;
        this.filteredSupplier = this.suppliersList;
        // Assuming filteredProductItems is an array of objects with prodId and prodName properties


        const saleresp = await this.service.fetchRequest(
            'purchaseratecard/getAllpurchaseratecard'
        );
        this.purchaseDetails = saleresp['purchaseRateId'];

        const VMSresp = await this.service.getVendingMachines(
            'vmsapis/getMachines'
        );
        console.log("VMSResp", VMSresp)
        this.VMSMachineDetails = VMSresp.data;
        console.log('Machinedetails', this.VMSMachineDetails);

        const VMSproductresp = await this.service.fetchRequestPost(
            'vmsapis/getProductInfo'
        );

        this.VMSProducts = VMSproductresp;
        console.log('MachineProducts', this.VMSProducts)
    }

    async onMachineChange() {
        this.MachineFilteredData = this.VMSMachineDetails.find(
            (machine) => machine.machineDisplayId === this.selectedMachineValue
        );
        const payload = {
            "machineId": this.MachineFilteredData.machineDisplayId,

        };
        console.log("MachinePayload", payload)
        const resp = await this.service.fetchRequestPost(
            'vmsapis/getMachineSlotDetails',
            payload
        );
        console.log("Slotresp", resp)
        this.MachineSlotDetails = resp
    }
    // sync with VMS
    onSyncVms() {
        let serialnumber = this.TableFieldsForm.controls['serialNo'].value;
        console.log("configserialnumber", serialnumber);
        let VMSdata = this.VMSMachineDetails.forEach(machine => {
            if (machine.serialNumber === serialnumber) {
                this.VMSMachineId = machine.machineDisplayId
            }
        });
        console.log("VMSMachineID", this.VMSMachineId);
        this.TableFieldsForm.controls['vmsMachId'].setValue(this.VMSMachineId);
    }
    showMachineDetails(selectedMachineValue, dialog) {
        const selectedMachine = this.VMSMachineDetails.find(machine => machine.machineDisplayId === selectedMachineValue);
        console.log("selectedMachine", selectedMachine);
        this.MachineInfo = selectedMachine;
        this.modalReference = this.dialog.open(this.machdetails);
        // this.modalReference.close();
    }
    onChangeSupplier() {
        let supTest = this.ProductFieldsForm.get('supplierId').value;
        this.filteredSupplier.forEach(supfilterItem => {
            if (supfilterItem.supId == supTest) {
                this.ProductFieldsForm.get('supName').setValue(supfilterItem.name);
            }
        });
        console.log(this.filteredSupplier);
    }
    convertDateTimeToTimestamp(dateTime: Date): string {
        const formattedTimestamp = formatDate(dateTime, 'yyyy-MM-ddTHH:mm:ss.SSSZ', this.locale);
        const timestamp = Date.parse(formattedTimestamp);
        return timestamp.toString();
    }
    UpdateMachineSlot() { }
    onRefillSupplier() {
        let supTest = this.RefillFieldsForm.get('supplierId').value;
        this.genieSuppliers.forEach(supfilterItem => {
            if (supfilterItem.supplierId == supTest) {
                this.RefillFieldsForm.get('supName').setValue(supfilterItem.supName);
            }
        });
        const uniqueProducts = this.genieSuppliers.map(item => item.prodId);

        this.uniqueFilteredSuppliers = uniqueProducts.map(prodId => {
            return this.uniqueFilteredSuppliers.find(item => item.prodId === prodId);
        });

    }

    async onConfigChange() {
        let data = this.configDetails.filter(sales => {
            return sales.stallId == this.selectedConfigValue;
        });
        this.configFilteredData = data;
        console.log("Dropdown:", this.configFilteredData);
    }
    async onProductChange() {
       
        let data = this.productDetails.filter(sales => {
            return sales.genieId == this.selectedProductValue;
        });
        this.ProductFilteredData = data;
        console.log("ProductdropDown:", this.ProductFilteredData);
        this.genieselected = true;
    }
    async onRefreshGenie(){
        console.log("Refresh",this.selectedProductValue)
  
        const Payload = {
            "genieId" :this.selectedProductValue
        }
        const resp = await this.service.fetchRequestPost(
            'geniemapping/refreshMapping',
            Payload
        );
        // this.productDetails =  resp['genieMappingList'];
        // this.ProductFilteredData = this.productDetails
        // this.productDetails.forEach(productmap => {
        //     this.suppItems.forEach(supplierItem => {
        //         if (productmap.itemId == parseInt(supplierItem.productId)) {
        //             productmap.productname = supplierItem.productname
        //         }
        //     })
        // })
        // this.productDetails.forEach(productmap => {
        //     this.configDetails.forEach(configItem => {
        //         if (productmap.genieId == parseInt(configItem.autoGenieId)) {
        //             productmap.genieName = configItem.genieId
        //         }
        //     })
        // })

    }
    async onCopy(modal){
        this.modalReference = this.dialog.open(modal);
        console.log(this.selectedProductValue,"selectedProductValue")
        const matchingGenie = this.filteredGenieData.find(stall => stall.autoGenieId == this.selectedProductValue);
        if (matchingGenie) {
            this.copyMapping.controls['existingGenieId'].setValue(matchingGenie.autoGenieId);
        }
        // this.copyMapping.controls['currentgenie'].setValue(this.ProductFilteredData.autoGenieId)
    } 
    async onSaveMapping(){
        let form = this.copyMapping.getRawValue();
        console.log("form",form);
        const resp = await this.service.fetchRequestPost(
            'geniemapping/copyGenieData',
            form
        );
        console.log(resp);
        this.ngOnInit();
        this.modalReference.close();
        this.copyMapping.reset();
    }
    async onRefillfilterChange() {
        let data = this.refillDetails.filter(sales => {
            return sales.genieId == this.selectedRefillValue;
        });
        this.RefillFilteredData = data;
        console.log("RefilldropDown:", this.RefillFilteredData);
    }
    async onTransactionfilterChange() {
        let data = this.transactionDetails.filter(sales => {
            return sales.genieId == this.selectedTransactionValue;
        });
        this.TransactionFilteredData = data;
        console.log("TransactiondropDown:", this.TransactionFilteredData);
    }
    async onCounterChange() {
        let data = this.configDetails.filter(sales => {
            return sales.stallId == this.selectedValue;
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
        this.ReportCalculatorData()

    }


    async ReportCalculatorData() {
        const formattedDates: string[] = [];
        const formattedValues: number[] = [];
        const aggregatedData: { [date: string]: number } = {};

        const categories = Object.keys(this.barchartData);
        categories.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        console.log("Categories:", categories)

        categories.forEach(date => {
            const Date = formatDate(date, "YYYY-MM-dd", this.locale);

            const value = Number(this.barchartData[date]);
            formattedDates.push(Date)
            formattedValues.push(value);
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

    onGenieChange() {
        let genie = this.ProductFieldsForm.get('genieId').value;
        this.filteredGenieData.forEach(genie => {
            if (genie.supId == genie) {
                this.RefillFieldsForm.get('genieId').setValue(genie.name);
            }
        });
        this.onRefillSelection();
        //    this.onRefillSupplier();
        //    this.onRackChange();
        //    this.onSlotChange();
    }
    protected filterSupplier() {
        if (!this.suppliersList) {
            return;
        }
        // get the search keyword
        let search = this.suppliersearch.value;
        if (!search) {
            this.filteredSupplier = this.suppliersList.slice();
            return;
        } else {
            const lowerCaseSearch = search.toLowerCase();
            // Filter the suppliers
            this.filteredSupplier = this.suppliersList.filter((supplier) => {
                return supplier.name.toLowerCase().includes(lowerCaseSearch);
            });
        }
        // filter the banks
        // this.filteredSupplier = this.suppliersList.filter((bank) => {
        //     return bank.name.toLowerCase() == search.toLowerCase();
        // });
    }
    protected filteritems() {
        if (!this.suppItems) {
            return;
        }
        // get the search keyword
        let search = this.itemfilter.value;
        if (!search) {
            this.filteredItemData = this.suppItems.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredItemData = this.suppItems.filter(
            (bank) =>
                bank.productname.toLowerCase().indexOf(search.toLowerCase()) > -1
        );
    }
    protected filterGenieitems() {
        if (!this.configDetails) {
            return;
        }
        // get the search keyword
        let search = this.geniefilter.value;
        if (!search) {
            this.filteredGenieData = this.configDetails.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredGenieData = this.configDetails.filter(
            (bank) =>
                bank.name.toLowerCase().indexOf(search.toLowerCase()) > -1
        );
    }
    onStallSelectionChange() {
        const selectedStallId = this.TableFieldsForm.get('stallId').value;
        this.selectedStall = this.filteredstallData.find(stall => stall.stallid == selectedStallId) || {};
        this.TableFieldsForm.get('genieId').setValue(this.selectedStall.stallCode);
    }
    onRefillSelection() {
        this.genieRacks = [];
        this.genieSuppliers = [];
        // this.genieSlots= [];
        const genieId = this.RefillFieldsForm.get('genieId').value;
        const racks = this.productDetails.filter(stall => {
            return stall.genieId == genieId
        });
        racks.forEach((rack) => {
            this.genieRacks.push(rack.rackId);
        });
        this.genieRacks = [...new Set(this.genieRacks)];
        const suppliers = this.productDetails.filter(sup => {
            return sup.genieId == genieId
        })
        // removed duplicates based on key from array of objects
        this.genieSuppliers = suppliers;
        const uniqueGenieIds = new Set();
        const uniqueGenieSuppliers = [];
        this.genieSuppliers.forEach(sup => {
            if (!uniqueGenieIds.has(sup.genieId)) {
                uniqueGenieIds.add(sup.genieId);
                uniqueGenieSuppliers.push(sup);
            }
        });
        this.uniqueFilteredSuppliers = uniqueGenieSuppliers;


    }
    onRackChange() {
        // this.genieRacks=[];
        this.genieSlots = [];
        const rackId = this.RefillFieldsForm.get('rackId').value;
        const genieId = this.RefillFieldsForm.get('genieId').value;

        // this.genieRacks= this.productDetails.filter(stall =>  {
        //   return stall.genieId == RefillId
        // })
        this.genieSlots = this.productDetails.filter(prodmap => {
            return prodmap.rackId == rackId && prodmap.genieId == genieId
        })
        console.log(this.genieSlots)
        console.log(rackId, "ID")
    }
    onSlotChange() {
        // this.genieRacks=[];
        // this.genieSlots= [];
        this.genieProducts = [];
        const slotId = this.RefillFieldsForm.get('slotId').value;
        const genieId = this.RefillFieldsForm.get('genieId').value;
        const rackId = this.RefillFieldsForm.get('rackId').value;
        // this.genieRacks= this.productDetails.filter(stall =>  {
        //   return stall.genieId == RefillId
        // })
        this.genieProducts = this.productDetails.filter(genie => {
            return genie.slotId == slotId && genie.rackId == rackId && genie.genieId == genieId
        });


        this.RefillFieldsForm.get('itemId').setValue(this.genieProducts[0].itemId);
        this.refillItemId.setValue(this.genieProducts[0].itemId + "-" + this.genieProducts[0].prodName)

        const suppName = this.genieProducts[0].supplierId + "-" + this.genieProducts[0].supName;
        this.RefillFieldsForm.get('supplierId').setValue(this.genieProducts[0].supplierId);
        this.RefillFieldsForm.get('supName').setValue(this.genieProducts[0].supName);
        this.refillSupId.setValue(suppName);
        this.refillQuantityValidator = this.genieProducts[0].quantity;
        //
    }
    onToggleChange(event: any) {
        this.toggleValue = event.checked;
    }
    onToggleInteret(event: any) {
        this.toggleInternet = event.checked;
    }
    onToggleNfc(event: any) {
        this.toggleNfc = event.checked;
    }
    onToggleCamera(event: any) {
        this.toggleCamera = event.checked;
    }
    async refillService() {
        const refillresp = await this.service.fetchRequest(
            'genierefill/getAllGenieRefill'
        );
        this.refillDetails = refillresp['genieRefillList'];
        this.refillDetails.forEach(refillmap => {
            this.configDetails.forEach(configItem => {
                if (refillmap.genieId == parseInt(configItem.autoGenieId)) {
                    refillmap.genieName = configItem.genieId
                }
            })
        })
        this.refillDetails.forEach(refillItemMap => {
            this.suppItems.forEach(supplierItem => {
                if (refillItemMap.itemId == parseInt(supplierItem.productId)) {
                    refillItemMap.productname = supplierItem.productname
                }
            })
        })
    }
    OntranstEdit(row) {
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.genieTransactionId = row.genieTransactionId;
        this.TransactionFieldsForm.patchValue({
            genieId: row?.genieId,
            location: row?.location,
            status: row?.status,
            remarks: row?.remarks,
            startDateTime: row.startDateTime,
            endDateTime: row.endDateTime,
            statusCheck: row?.statusCheck,
            powerStatus: row?.powerStatus,
            internetStatus: row?.internetStatus,
            nfcStatus: row?.nfcStatus,
            cameraStatus: row?.cameraStatus,
            vendorId: this.vendorId
        })
    }
    OnRefillEdit(row) {
        this.editMode = true;
        this.isMatDrawerOpened = true;

        this.genieRefillId = row.genieRefillId;
        this.RefillFieldsForm.patchValue({

            genieId: row.genieId,
            supplierId: row.supplierId,
            supName: row.supName,
            rackId: row.rackId,
            slotId: row.slotId,
            itemId: row.itemId,
            quantity: row.quantity,
            status: row.status,
            refilledBy: row.refilledBy,
            date: row.date,
            vendorId: this.vendorId

        })

        this.onRefillSelection();
        this.onRefillSupplier();
        this.onRackChange();
        this.onSlotChange();
        this.RefillFieldsForm.get('rackId').setValue(row.rackId);
        this.RefillFieldsForm.get('slotId').setValue(row.slotId);
        this.RefillFieldsForm.get('supplierId').setValue(row.supplierId);

    }
    OnEdit(row) {
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.autoGenieId = row.autoGenieId;
        this.TableFieldsForm.patchValue({
            serialNo: row?.serialNo,
            vmsMachId: row?.vmsMachId,
            genieId: row?.genieId,
            stallId: row?.stallId,

            name: row?.name,
            description: row?.description,
            equipmentId: row.equipmentId,
            functionalLocId: row.functionalLocId,
            // state:row.state,
            // city: row.city,
            // village: row.village,
            // buildingId: row.buildingId,
            // fid: row.fid,
            // serial: row.serial,
            date: row.date,
            manufactureId: row.manufactureId,
            model: row.model,
            dimensions: row.dimensions,
            displayscreen: row.displayscreen,
            voltage: row.voltage,
            power: row.power,
            weight: row.weight,
            temperature: row.temperature,
            capacity: row.capacity,
            type: row.type,
            // totalRacks: row.totalRacks,
            // totalSlots: row.totalSlots,
            // slotsPerRack: row.slotsPerRack,
            // maxTrayQtyPerSlot: row.maxTrayQtyPerSlot,
            // maxQuantity: row.maxQuantity,
            // location:row.location,
            status: row.status,
            quantity: row?.quantity,
            suitableFor: row.suitableFor,
            vendorId: this.vendorId,
            keyInfo: row?.keyInfo
        })
        this.selectedStall.stallid = row.stallId
    }
    open() {
        this.isMatDrawerOpened = true;

    }
    async OnRefillSave() {
        let data = this.RefillFieldsForm.getRawValue();
        data.rackId = parseInt(data?.rackId);
        data.slotId = parseInt(data?.slotId);
        if (!this.validationCheck()) {
            if (this.editMode) {
                data['genieRefillId'] = this.genieRefillId;
                //   const saveResp = await this.service.fetchRequestPost(
                //     'geniemanagement/createGenieManagement',
                //     data
                // );
                // data['updatedBy'] = user.userName;
            } else {
                data['genieRefillId'] = 0;
                data['vendorId'] = this.vendorId

            }
            const saveResp = await this.service.fetchRequestPost(
                'genierefill/createGenieRefill',
                data
            );
            console.log(saveResp)
            this.refillService();
            this.OnClose();
        }
        else {
            this.snackBar.open('Data Existed Please Check', 'Ok', { duration: 4000 });
        }
    }
    validationCheck() {
        const genieId = this.RefillFieldsForm.get('genieId').value;
        const rackId = this.RefillFieldsForm.get('rackId').value;
        const slotId = this.RefillFieldsForm.get('slotId').value;
        const date = this.RefillFieldsForm.get('date').value;
        if (this.editMode) {
            const matchedDetails = this.refillDetails.filter((refObj) => {
                return refObj.genieId == genieId && refObj.rackId == rackId && refObj.slotId == slotId && refObj.date == date && refObj.genieRefillId != this.genieRefillId
            });
            if (matchedDetails.length > 0) return true;
            else return false;
        }
        else {
            const matchedDetails = this.refillDetails.filter((refObj) => {
                return refObj.genieId == genieId && refObj.rackId == rackId && refObj.slotId == slotId && refObj.date == date
            });
            if (matchedDetails.length > 0) return true;
            else return false;
        }


    }
    OnItemSelectMpng(value) {

        const itemObj = this.filteredItemData.find((supItem) => supItem.supItemId == value);

        this.ProductFieldsForm.controls['itemId'].setValue(parseInt(itemObj.productId));
        this.ProductFieldsForm.controls['supplierId'].setValue(itemObj.supid);
        this.ProductFieldsForm.get('supName').setValue(itemObj.supname)
        this.mapngSupName.setValue(itemObj.supid + "-" + itemObj.supname);
        this.RefillAvailableStock = itemObj.quantity
    }
    async OnSavePopup() {
        let data = this.TableFieldsForm.getRawValue();

        if (this.editMode) {
            data['autoGenieId'] = this.autoGenieId;
            data['vmsMachId'] = data.vmsMachId.toString();
            //   const saveResp = await this.service.fetchRequestPost(
            //     'geniemanagement/createGenieManagement',
            //     data
            // );
            // data['updatedBy'] = user.userName;
        } else {
            data['autoGenieId'] = 0;
            data['vendorId'] = this.vendorId;
            data['vmsMachId'] = data.vmsMachId.toString();

        }
        const saveResp = await this.service.fetchRequestPost(
            'geniemanagement/createGenieManagement',
            data
        );
        console.log(saveResp)
        this.ngOnInit();
        this.OnClose();
    }
    async OnUpdateSlotDetails() {
        let VMSSlotData = this.VMSFieldsForm.getRawValue();
        // passing 1 if true otherwise 0
        const showProductCost = this.VMSFieldsForm.get('showProductCost').value;
        const ProductcostMappedvalue = showProductCost ? 1 : 0
        const showProductName = this.VMSFieldsForm.get('showProductName').value;
        const ProductNameMappedvalue = showProductName ? 1 : 0
        const showProductImage = this.VMSFieldsForm.get('showProductImage').value;
        const ProductImageMappedvalue = showProductImage ? 1 : 0
        const stocklimitEnabled = this.VMSFieldsForm.get('stocklimitEnabled').value;
        if (stocklimitEnabled == "true") {
            this.stocklimitenabled_value = 1
        }
        else {
            this.stocklimitenabled_value = 0
        }
        // const stocklimitEnabledMappedvalue = stocklimitEnabled ? 1:0
        const payload = {
            "enable": this.Selectedrow.enable,
            "productId": VMSSlotData.productId,
            "showProductCost": ProductcostMappedvalue,
            "showProductName": ProductNameMappedvalue,
            "showProductImage": ProductImageMappedvalue,
            "machineId": this.MachineFilteredData.machineDisplayId,
            "stockLimit": 4,
            "stocklimitEnabled": this.stocklimitenabled_value,
            "slotWidth": this.Selectedrow.slotWidth,
            "slotId": this.Selectedrow.slotId
        }
        console.log(payload);
        const saveResp = await this.service.fetchRequestPost(
            'vmsapis/updateSlots',
            payload
        );
        this.onMachineChange();
        this.isMatDrawerOpened = false;
        this.VMSFieldsForm.reset;
    }
    async OnProductSave() {
        // this.prevObjmapp
        let productsData = this.ProductFieldsForm.getRawValue();
        const currentItem = this.ProductFieldsForm.get("itemId").value;
        if (this.editMode) {
            productsData['genieProdMapId'] = this.genieProdMapId;
            if (currentItem != this.prevObjmapp.itemId) {
                const prodMapping = this.suppItems.find(sup => parseInt(sup.productId) == this.prevObjmapp.itemId && sup.supid == this.prevObjmapp.supplierId && sup.endDate == null)
                const payload = prodMapping;
                payload.availableStock += this.prevObjmapp.quantity

                const resp = await this.service.fetchRequestPost(
                    'supplieritem/createSupplierItem',
                    payload
                );
            }

        } else {
            productsData['genieProdMapId'] = 0;
            productsData['vendorId'] = this.vendorId;
        }

        const saveResp = await this.service.fetchRequestPost(
            'geniemapping/createGenieMapping',
            productsData
        );

        this.OnClose();
        this.ngOnInit();
    }
    sendTimestamps() {
        const startDateTimeValue = this.TransactionFieldsForm.get('startDateTime').value;
        const endDateTimeValue = this.TransactionFieldsForm.get('endDateTime').value;

        if (startDateTimeValue && endDateTimeValue) {
            const startTimestamp = moment(startDateTimeValue).unix();
            const endTimestamp = moment(endDateTimeValue).unix();

            console.log('Start Timestamp:', startTimestamp);
            console.log('End Timestamp:', endTimestamp);

            // Now you can send these timestamps to your API or use them as needed
        }
    }

    async OnTransSave() {

        let transData = this.TransactionFieldsForm.getRawValue();

        if (this.editMode) {
            transData['genieTransactionId'] = this.genieTransactionId;
        }
        else {
            transData['genieTransactionId'] = 0;
            transData['vendorId'] = this.vendorId
        }
        if (transData['startDateTime'] != "" && transData['startDateTime'] != null) {
            transData['startDateTime'] = this.convertDateTimeToTimestamp(new Date(transData['startDateTime']));

        }
        if (transData['endDateTime'] != "" && transData['endDateTime'] != null) {
            transData['endDateTime'] = this.convertDateTimeToTimestamp(new Date(transData['endDateTime']));

        }

        //     transData['startDateTime'] = moment(transData['startDateTime']).unix();
        //   transData['endDateTime'] = moment(transData['endDateTime']).unix();
        const saveResp = await this.service.fetchRequestPost(
            'genietransactions/createGenieTransactions',
            transData
        );
        this.OnClose();
        this.ngOnInit();
    }
    onAddProducts() {
        this.isMatDrawerOpened = true;
        this.suppliersearch.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterSupplier();
            });
        this.geniefilter.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {


                this.filterGenieitems();
            });
        this.itemfilter.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {


                this.filteritems();
            });

    }
    onAddtransactions() {
        this.isMatDrawerOpened = true;
        this.geniefilter.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {


                this.filterGenieitems();
            });
    }
    onAddRefill() {
        this.isMatDrawerOpened = true;
        this.refillQuantityValidator = null;
        this.geniefilter.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {


                this.filterGenieitems();
            });
    }
    OnVMSSlotEdit(row) {
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.VMSFieldsForm.patchValue({
            slotName: row.slotName,
            slotId: row.slotId,
            rowNumber: row.rowNumber,
            coloumnNumber: row.coloumnNumber,
            productId: row['Product Id'],
            enable: row.enable,
            stockLimit: row.stockLimit,
            stocklimitEnabled: row.stocklimitEnabled || false
            // vendorId:this.vendorId
        });
        console.log(row);
        // this.VMSFieldsForm.controls['productId'].setValue(row.productId);
        this.Selectedrow = row
    }
    OnproductEdit(row) {
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.genieProdMapId = row.genieProdMapId;
        this.ProductFieldsForm.patchValue({
            genieId: row.genieId,
            supplierId: row.supplierId,
            supName: row.supName,
            rackId: row.rackId,
            slotId: row.slotId,
            quantity: row.quantity,
            itemId: row.itemId,
            vendorId: this.vendorId
        });

        let supItemObjs = this.filteredItemData.filter((item) => {
            return item.supid == row.supplierId && item.productId == row.itemId
        });
        this.OnItemSelectMpng(supItemObjs[0].supItemId);
        this.mapngItemId.setValue(supItemObjs[0].supItemId);
        let supTest = this.ProductFieldsForm.get('supplierId').value;
        this.filteredSupplier.forEach(supfilterItem => {
            if (supfilterItem.supId == supTest) {
                this.ProductFieldsForm.get('supName').setValue(supfilterItem.name);
            }
        });
        this.prevObjmapp = row;
    }
    onDelRefill(dialog, row) {
        this.modalReference = this.dialog.open(this.deleterefill);
        this.delrefill = {};

        this.delrefill['genieRefillId'] = this.genieRefillId;
    }

    onDelProduct(dialog, row) {
        this.modalReference = this.dialog.open(this.deleteProd);
        this.delprod = {};

        this.delprod['genieProdMapId'] = this.genieProdMapId;

    }
    onDelTransaction(dialog, row) {
        this.modalReference = this.dialog.open(this.deletetrans);
        this.deltrans = {};

        this.deltrans['genieTransactionId'] = this.genieTransactionId;

    }

    async productconfirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'geniemapping/deleteGenieMapping',
            this.delprod
        );
        // this.modalReference.close();
        this.OnClose();
        this.ngOnInit();
    }
    async transactionconfirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'genietransactions/deleteGenieTransactions',
            this.deltrans
        );
        // this.modalReference.close();
        this.OnClose();
        this.ngOnInit();
    }
    async refillConfirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'genierefill/deleteGenieRefill',
            this.delrefill
        );
        this.refillService();
        // this.modalReference.close();
        this.OnClose();
        // this.ngOnInit();
    }
    onDelPopup(dialog, row) {
        this.modalReference = this.dialog.open(this.deleteDialog);
        this.delObj = {};

        this.delObj['autoGenieId'] = this.autoGenieId;

    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'geniemanagement/deleteGenieManagement',
            this.delObj
        );
        // this.modalReference.close();
        this.OnClose();
        this.ngOnInit();
    }
    CloseDialog() {
        this.modalReference.close();
        this.editMode = false;
    }
    decline() {
        this.modalReference.close();
    }
    OnClose() {
        this.isMatDrawerOpened = false;
        this.TableFieldsForm.reset();
        this.ProductFieldsForm.reset();
        this.TransactionFieldsForm.reset();
        this.RefillFieldsForm.reset();
        this.copyMapping.reset();
        this.modalReference.close();
        // refill formcontrols
        this.refillSupId.reset();
        this.refillItemId.reset();
        this.editMode = false;
        this.refillQuantityValidator = null;
        this.mapngItemId.reset();
        this.mapngSupName.reset();
        this.TransactionFieldsForm.get('powerStatus').setValue(false);
        this.TransactionFieldsForm.get('internetStatus').setValue(false);
        this.TransactionFieldsForm.get('nfcStatus').setValue(false);
        this.TransactionFieldsForm.get('cameraStatus').setValue(false);
    }

}
