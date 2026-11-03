import {
    Component,
    Inject,
    LOCALE_ID,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import * as XLSX from 'xlsx';
import { orderitem } from '../../shared/classes/orderitem';
import { Orders } from '../../shared/classes/orders';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';

import { Subject } from 'rxjs';

import { vmspayloadType } from '../../shared/classes/orders';
@Component({
    selector: 'app-vms-trans',
    templateUrl: './vms-trans.component.html',
    styleUrls: ['./vms-trans.component.scss']
})

export class VmsTransComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';

    public orderForm: FormGroup;

    modalReference: any;
    public statusdisable = true;
    public statuscontrol = new FormControl();
    public accId: string;



    protected _onDestroy = new Subject<void>();
    selectedVmsOrder: Orders;
    isMatDrawerOpened: boolean = false;
    currentStatus: string;
    interval: any;
    isRefreshStarted: boolean = false;
    prepTime: FormControl = new FormControl('');
    isOrderAccepted: boolean = false;
    vendorId: number = 0;
    dispenseStatus: any;
    dispenseTransId: any;
    filteredusers: any[];
    dispenseStatusCompleted: number = 0;
    reservedCount: number = 0;
    reservedItemCount: number = 0;
    ItemdispenseStatus: number = 0;
    selectedOrderItem: orderitem;
    refundQty: FormControl = new FormControl();
    machList = [];
    vmsSaleList = [];
    orderfilter= [{key:true,name:'with order'},
    {key:false,name:'without order'}]
    totaltransactions: number;
    totalItemcount: number = 0;
    row: Orders;
    totalSuccessCount: number = 0;
    totalFailureCount: number = 0;
    withoutOrderCount: number = 0;
    constructor(
        private _sanitizer: DomSanitizer,
        private productItemsService: ProjectService,
        private router: Router,
        private modalService: NgbModal,
        private dialog: MatDialog,
        @Inject(LOCALE_ID) public locale: string,

    ) {

    }





    async ngOnInit() {
        const vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }


        this.orderForm = new FormGroup({
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
            // paymentMethod: new FormControl(''),
            machineId: new FormControl(''),
            orderfilter: new FormControl(''),

        });
        const macresp = await this.productItemsService.fetchRequestPost("vmsapis/getMachines", {});
        this.machList = macresp.data;

       let order = this.orderForm.controls['orderfilter'].value;
        let sdate = this.orderForm.controls['startDate'].value;
        let date = new Date();
        date.setHours(0, 0, 0, 1);

        let sdateInMillis = date.getTime();


        let endDate = new Date();
        endDate.setHours(23, 59, 59);
        let edateInMillis = endDate.getTime();
        let vmsPayload: vmspayloadType = {
            isOrders: order
        };
        vmsPayload.startdate = sdateInMillis;
        vmsPayload.enddate = edateInMillis;

        this.productItemsService
            .getVmsSalesReport(vmsPayload)
            .subscribe((data) => {
                console.log("vmssale", data);

                this.vmsSaleList = data.data;
                this.totaltransactions = this.vmsSaleList.length
                this.totalItemcount = 0;
                this.totalSuccessCount = 0;
                this.totalFailureCount = 0;
                this.withoutOrderCount = 0;
                this.vmsSaleList.forEach(obj => {
                    this.totalItemcount += obj.cartData.length;
                    if(obj.naviOrderId==null) this.withoutOrderCount += 1
                   obj.cartData.forEach((item)=>{
                   
                        if(item.status=='SUCCESS'){
                            this.totalSuccessCount += 1;
                        }
                        else if(item.status !='SUCCESS')
                        {
                            this.totalFailureCount +=  1;

                            console.log("failure",this.totalFailureCount);
                            
                        }
                    
                   })
                });
            console.log("vmsSaleList",this.vmsSaleList)
            });
          
           
        //   this.vmsSaleList.forEach((obj)=>{
        //     let totalCount = 0;
        //     obj.cartData.forEach((item)=>{
        //         totalCount += item.qty + 1;
        //     });
        //     this.totalItemcount = totalCount;
        //   })
        // this.StartRefershingOrders();    
    }

    StartRefershingOrders() {
        this.isRefreshStarted = true;
        this.interval = setInterval(() => {
            this.GetOrdersOnly();
        }, 5000);
    }
    OnRefreshPress(value) {
        console.log(value);
        if (value === true) this.StartRefershingOrders();
        else this.StopRefreshingOrders();
    }
    StopRefreshingOrders() {
        this.isRefreshStarted = false;
        this.ngOnDestroy();
    }

    onView(row, content) {
        this.modalReference = this.modalService.open(content, {
            ariaLabelledBy: 'modal-basic-title',
        });



    }

    OnOrderClick(order: Orders) {
        this.selectedVmsOrder = order;
        this.row = this.selectedVmsOrder
        this.isMatDrawerOpened = true;
        console.log(order);



    }
    onLinkpress(row, items) {
        console.log(row);
        this.selectedVmsOrder = row;

        this.modalReference = this.modalService.open(items, {
            size: 'lg',
            windowClass: 'modal-xl',
        });


    }
    OnClose() {
        this.modalReference.close();
    }
    async GetOrdersOnly() {
        let order = this.orderForm.controls['orderfilter'].value;
      
        let sdate = this.orderForm.controls['startDate'].value;
        let date = new Date(sdate);
        date.setHours(0, 0, 0, 0);

        let sdateInMillis = date.getTime();


        let endDate = new Date(this.orderForm.controls['endDate'].value);
        endDate.setHours(23, 59, 59);
        let edateInMillis = endDate.getTime();
        let vmsPayload: vmspayloadType = {
            isOrders: order
        };
        vmsPayload.startdate = sdateInMillis;
        vmsPayload.enddate = edateInMillis;
        this.productItemsService
            .getVmsSalesReport(vmsPayload)
            .subscribe((data) => {
                console.log("vmssale", data);
                this.vmsSaleList = data.data;
                this.totaltransactions = this.vmsSaleList.length
                this.totalItemcount = 0;
                this.vmsSaleList.forEach(obj => {
                    this.totalItemcount += obj.cartData.length;
                });
            console.log("vmsSaleList",this.vmsSaleList)
            });
    }
    OnExport(){
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.vmsSaleList);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
        // Save Excel file
        this.saveAsExcelFile(excelBuffer, 'vmsSaleList');
         }
         private saveAsExcelFile(buffer: any, fileName: string): void {
            const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
            const url: string = window.URL.createObjectURL(data);
            const link: HTMLAnchorElement = document.createElement('a');
            link.href = url;
            link.download = fileName + '.xlsx';
            link.click();
            window.URL.revokeObjectURL(url);
          }
    async onSearch() {

        
        let machineid = this.orderForm.controls['machineId'].value;
        let order = this.orderForm.controls['orderfilter'].value;
        let vmsPayload: vmspayloadType = {
            isOrders: null
        };
        let sdate = this.orderForm.controls['startDate'].value;
        let date = new Date(sdate);
        date.setHours(0, 0, 1, 0);

        let sdateInMillis = date.getTime();


        let endDate = new Date(this.orderForm.controls['endDate'].value);
        endDate.setHours(23, 59, 59);
        let edateInMillis = endDate.getTime();
        vmsPayload.startdate = sdateInMillis;
        vmsPayload.enddate = edateInMillis;
        if (machineid != null && machineid != "" && machineid != "all") vmsPayload.machineId = machineid;
        vmsPayload.isOrders = order;
        console.log(vmsPayload)
        this.productItemsService
            .getVmsSalesReport(vmsPayload)
            .subscribe((data) => {
                console.log("vmssale", data);
                this.vmsSaleList = data.data;
                this.totaltransactions = this.vmsSaleList.length;
                this.totalItemcount = 0;
                this.totalSuccessCount = 0;
                this.totalFailureCount = 0;
                this.withoutOrderCount = 0;
                this.vmsSaleList.forEach(obj => {
                    this.totalItemcount += obj.cartData.length;
                    if(obj.naviOrderId==null) this.withoutOrderCount += 1
                    obj.cartData.forEach((item)=>{
                 
                    if(item.status=='SUCCESS'){
                        this.totalSuccessCount += 1;
                    }
                    else if(item.status !='SUCCESS')
                    {
                        this.totalFailureCount +=  1;
                        console.log("failure",this.totalFailureCount);
                        
                    }
                   })
                });
            console.log("vmsSaleList",this.vmsSaleList)
            });
           
       
    }
    ngOnDestroy() {
        clearInterval(this.interval);
    }


}



