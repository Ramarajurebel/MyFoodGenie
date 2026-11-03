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

import { orderitem } from '../../shared/classes/orderitem';
import { Orders } from '../../shared/classes/orders';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';

import { AudioService } from './../audio.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'app-nfm-orders',
    templateUrl: './nfm-orders.component.html',
    styleUrls: ['./nfm-orders.component.scss'],
})
export class NfmOrdersComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public order = [];
    public TablefieldsForm: FormGroup;
    public operatorName = [];
    public stalloperator = [];
    public totalitemsprice: number;
    public totalitems: number;
    modalReference: any;
    public statusdisable = true;
    public statuscontrol = new FormControl();
    public accId: string;
    public OrderStatus = [
        { value: 'Created', name: 'Created' },
        { value: 'Submitted', name: 'Submitted' },
        { value: 'InProcess', name: 'Reserved' },
        { value: 'Cancelled', name: 'Cancelled' },
        { value: 'Completed', name: 'Completed' },
        { value: 'Refund Completed', name: 'Refund Completed' },
    ];
    public orderStatus: string;
    public temp = [];
    orders: Orders[] = [];
    public paymethodsettings: IDropdownSettings;
    public orderstatussettings: IDropdownSettings;
    itemControl: FormControl = new FormControl('');
    protected _onDestroy = new Subject<void>();
    public orderitems: orderitem[] = [];
    paymentmethod = [
        { value: 'PAYTMATCTR', name: 'PAYTMATCTR' },
        { value: 'COD', name: 'COD' },
        { value: 'UPIQR', name: 'UPIQR' },
        { value: 'online', name: 'online' },
    ];
    paymentstatus = ['Unpaid', 'Paid', 'refunded to wallet'];
    PaymentMethod = ['online','mfgwallet']
    dStatus = ['Dispense Completed', 'Dispense Started', 'Dispense Failed']
    mangoes = [true, false];
    public orderId: number;
    totaldelv = 0;
    totalpaym = 0;
    allorders = [];
    itemcount = 0;
    totalcount = 0;
    AveragePrice: number = 0;
    totalMarginAmount: number = 0;
    user: any;
    public orderForm: FormGroup;
    accountId = '100003';
    totaItems: number = 0;
    totalPrice: number = 0;
    total = 0;
    enableEdit = false;
    enableEditIndex = null;
    isEditable: boolean;
    allPOheaders = [];
    events = [];
    stallData = [];
    category = [
        { subCatId: 129, subCatName: 'Tiffins' },
        { subCatId: 130, subCatName: 'Lunch' },
        { subCatId: 131, subCatName: 'Snacks' },
        { subCatId: 132, subCatName: 'Dinner' },
    ];
    list_order: any[];
    selectedOrder: Orders;
    isMatDrawerOpened: boolean = false;
    currentStatus: string;
    interval: any;
    isRefreshStarted: boolean = false;
    prepTime: FormControl = new FormControl('');
    isOrderAccepted: boolean = false;
    vendorId: number = 0;
    dispenseStatus: any;
    dispenseTransId: any;
    filteredorders: any[];
    dispenseStatusCompleted: number = 0;
    reservedCount: number = 0;
    reservedItemCount: number = 0;
    ItemdispenseStatus: number = 0;
    selectedOrderItem: orderitem;
    refundQty: FormControl = new FormControl();
    genieManagementList = [];
    dispenseSuccessCount: number;
    dispenseFailedCount: number;
    dispenseFailedItems: number = 0;
    dispensefailedOrders: number = 0;
    mfgwalletAmount: number = 0;
    onlineAmount: number= 0;
    debounceTimeout: any;
    constructor(
        private _sanitizer: DomSanitizer,
        private productItemsService: ProjectService,
        private router: Router,
        private modalService: NgbModal,
        private dialog: MatDialog,
        @Inject(LOCALE_ID) public locale: string,
        private audioService: AudioService
    ) {
        //this.user = JSON.parse(localStorage.getItem('user'));
        //if (this.user) {

        // }
        // this.orders = [{ orderStatus: '' }];
    }

    updateFilter(event) {
        //   const val = event.target.value.toLowerCase();
        //   // filter our data
        //   const temp = this.temp.filter(function (d) {
        //     return d.name.toLowerCase().indexOf(val) !== -1 || !val;
        //   });
        //   // update the rows
        //   this.order = temp;
        //   // Whenever the filter changes, always go back to the first page
        //   this.table.offset = 0;
    }
    enableEditMethod(e, i) {
        this.enableEdit = true;
        this.enableEditIndex = i;
        console.log(i, e);
    }
    openRefundModal(modal, orderItem: orderitem) {
        this.modalReference = this.modalService.open(modal);
        this.selectedOrderItem = orderItem;
    }
    initiateRefund() {
        const order = this.selectedOrder;
        const orderItem = this.selectedOrderItem;
        const refundQty = this.refundQty.value;
        if (refundQty == null || refundQty == 0) return
        const payload = {
            orderId: orderItem.orderId,
            itemId: orderItem.itemId,
            rackId: orderItem.rackId,
            slotId: orderItem.slotId,
            orderItemAutoId: orderItem.orderItemAutoId,
            genieId: order.genieId,
            itemQuantity: refundQty,
            totalPrice: orderItem.itemPrice * refundQty * 100

        }
        this.productItemsService.initiateRefundForItem(payload).subscribe((data) => {
            if (data.status != "Failed") alert("refund Success");
            else alert("Refund Failed");
            this.GetOrdersOnly();
        },
            (error) => {
                alert("Error Occured");
                console.error(error);
            });

    }
    async updateOrderStatus(orderstatus) {
        this.audioService.stop();
        let value = this.TablefieldsForm.value;
        let payload = {
            accountId: this.selectedOrder.accountId,
            orderId: this.selectedOrder.orderId,
            orderStatus: orderstatus,
            paymentStatus: this.selectedOrder?.paymentStatus,
            shippingAddressName: value?.shipaddress,
            paymentMode: this.selectedOrder?.paymentMode,
            assignedTo: value?.assignedTo,
        };
        // this.productItemsService.updateOrderStatus(payload).subscribe((data) => {
        //   let orderText = 'OrderId:' + data.orderId + ' Updated successfully!';

        // });
        const resp = await this.productItemsService.fetchRequestPost(
            'rest/order/updateOrderStatus',
            payload
        );
        this.onSearch();

        this.isMatDrawerOpened = false;
    }

    async ngOnInit() {
        const vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }
        this.TablefieldsForm = new FormGroup({
            orderid: new FormControl(''),
            name: new FormControl(''),
            paymethod: new FormControl(''),
            mobileno: new FormControl(''),
            itemscount: new FormControl(''),
            orderdate: new FormControl(''),
            orderamount: new FormControl(''),
            dispenseTime: new FormControl(''),
            devcharges: new FormControl(''),
            payamount: new FormControl(''),
            paystatus: new FormControl(''),
            orderstatus: new FormControl(''),
            shipaddress: new FormControl(''),
            assignedTo: new FormControl(''),
        });
        this.paymethodsettings = {
            singleSelection: false,
            idField: 'value',
            textField: 'name',

            allowSearchFilter: true,
        };
        this.orderstatussettings = {
            singleSelection: false,
            idField: 'value',

            textField: 'name',

            allowSearchFilter: true,
        };
        this.orderForm = new FormGroup({
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
            // paymentMethod: new FormControl(''),
            dStatus: new FormControl(''),
            mobileno: new FormControl(''),
            paymentStatus: new FormControl('Paid'),
            orderstatus: new FormControl(''),
            stallid: new FormControl(''),
            category: new FormControl(''),
            Ordermobileno: new FormControl(''),
            paymentmethod: new FormControl(''),
            searchorderid:new FormControl('')
        });
        const respstall = await this.productItemsService.fetchRequest(
            'stall/getAllStalls'
        );
        this.stallData = respstall['supplierList'];

        const resp = await this.productItemsService.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.stalloperator = resp['stallOperatorList'];
        this.operatorName = this.stalloperator.filter((item) => {
            if (item?.role == 'Employee') return item;
        });
        console.log(this.operatorName);
        this.filteredorders = this.orders;
        this.itemControl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterusers();
            });
        let orderPayload: Orders = {
            totalOrderMargin: 0
        };
        let pstatus = this.orderForm.controls['paymentStatus'].value;
        let sdate = this.orderForm.controls['startDate'].value;
        let date = new Date(sdate);
        date.setHours(0, 0, 0, 0);

        let startDate = formatDate(date, 'YYYY-MM-dd HH:mm:ss', this.locale);

        let endDate = new Date(this.orderForm.controls['endDate'].value);
        endDate.setHours(23, 59, 59);
        let finalEndDate = formatDate(
            endDate,
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
        orderPayload['startDate'] = startDate;
        orderPayload['endDate'] = finalEndDate;
        orderPayload['vendorId'] = this.vendorId;
        const genieresp = await this.productItemsService.fetchRequest("geniemanagement/getAllGenieManagement");
        this.genieManagementList = genieresp['genieManagementList'];
        this.productItemsService
            .getOrderCollection(orderPayload)
            .subscribe(async (data) => {
                // if (Array.isArray(data?.orders)) {
                //   this.orders = data?.orders;
                // } else if (data?.orders) {
                //   this.orders = [data?.orders];
                // } else {
                //   this.orders = [];
                // }
                let temp = [];
                this.orders = data.orders;
                this.filteredorders = this.orders;
                if (pstatus) {
                    this.orders = this.orders.filter((item: any) => {
                        return (
                            item.paymentStatus.toLowerCase().toString() ==
                            pstatus.toLowerCase().toString()
                        );
                    });
                }

                this.genieManagementList.forEach((obj) => {
                    this.orders.forEach((order) => {
                        if (order.genieId == obj.autoGenieId) {
                            order.genieName = obj.name
                        }
                    })
                })
                for (let i in this.orders) {
                    this.orders[i].formattedDateTime = formatDate(
                        this.orders[i].orderDateTime,
                        'dd-MM-YYYY HH:mm:ss',
                        this.locale
                    );
                    this.orders[i]['statusedit'] = true;
                    if (this.orders[i].paymentMode == 'cod')
                        this.orders[i].paymentMode = 'COD';
                    if (
                        this.orders[i].paymentMode == 'cashAtStall' ||
                        this.orders[i].paymentMode == 'paytmAtStall'
                    ) {
                        this.orders[i].paymentMode = 'PAYTMATCTR';
                    }
                    if (
                        this.orders[i].orderStatus != 'Delivered' &&
                        this.orders[i].orderStatus != 'Closed'
                    ) {
                        temp.push(this.orders[i]);
                    }
                    if (this.orders[i].dispenseStatus == "Dispense Completed") {
                        this.dispenseStatusCompleted = this.dispenseStatusCompleted + 1
                        this.ItemdispenseStatus = this.ItemdispenseStatus + this.orders[i].orderItemCount
                    }
                    else if(this.orders[i].dispenseStatus == "Dispense Failed"){
                        this.dispensefailedOrders = this.dispensefailedOrders + 1;
                        this.dispenseFailedItems = this.dispenseFailedItems + 1;
                    }
                    if (this.orders[i].orderStatus == "InProcess") {
                        this.reservedCount = this.reservedCount + 1;
                        this.reservedItemCount = this.reservedItemCount + this.orders[i].orderItemCount

                    }
                    
                }
                this.orders = temp;
                this.dispenseSuccessCount = 0;
        this.dispenseFailedCount = 0;
        this.totalMarginAmount =0;
        this.mfgwalletAmount = 0;
        this.onlineAmount = 0;
        this.orders.forEach((order)=>{
            this.totalMarginAmount += order?.totalOrderMargin  
            if(order.paymentMode=='online'){
                this.onlineAmount += order.amount
            } 
            if(order.paymentMode=='mfgwallet'){
                this.mfgwalletAmount += order.amount
            } 
            if(order.dispenseTransId != null){
                order.orderItems.forEach((item)=>{
               
                    if(item.quantity > 1){
                        // success case
                        this.dispenseSuccessCount+=this.countOccurrences(item.dispenseStatus,'SUCCESS');
                        this.dispenseFailedCount+=this.countOccurrences(item.dispenseStatus,'NON SUCCESS');
                    }
                    else{
                        if(item.dispenseStatus=='SUCCESS'){
                            this.dispenseSuccessCount += 1 
                        }
                        else if(item.dispenseStatus !='SUCCESS'){
                            this.dispenseFailedCount += 1 
                        }
                    }
                  
                })
            }
            // else if(order.dispenseStatus==null || order?.dispenseStatus=="Dispense Started"){
            //     order.orderItems.forEach((item)=>{
            //         if(item?.dispenseStatus==null){
            //             this.dispenseFailedCount = this.dispenseFailedCount + 1;
            //         }
            //     })
            // }
           })
                // this.orders.forEach((obj)=>{
                //     obj.orderItems?.forEach((item)=>{
                //         if(obj.orderId == item.orderId && item?.dispenseStatus !== undefined){
                //             // this.dispenseStatus.push(item?.dispenseStatus)
                //             this.dispenseStatus = item?.dispenseStatus
                //         }
                //      // this.dispenseStatus = []; });
                // });
                // console.log("DispenseArray",this.dispenseStatus)
                // // for only getting nfmpos orders
                // let finalTemp = [];
                // finalTemp = this.orders.filter((order) => {
                //     return this.operatorName.some((item) => {
                //         return item.mobile == order.mobileno;
                //     });
                // });
                // this.orders = finalTemp;

                for (let j = 0; j < this.orders.length; j++) {
                    this.total += this.orders[j].amount;

                    this.itemcount += this.orders[j].orderItemCount;
                    this.totaldelv += this.orders[j].deliverCharges;
                    this.totalpaym += this.orders[j].paymentAmount;
                  

                }
                // console.log("Amountarray",amount)
                console.log(
                    `Payment amount and delivery charges are ${this.totaldelv}, ${this.totalpaym}`
                );
                this.totalcount = this.orders.length;
                this.AveragePrice = parseFloat((this.total / this.itemcount).toFixed(2));
                console.log(this.total);
                const temparray = [];
                //  for(let k in this.orders){

                //    const sdate= formatDate(this.orderForm.controls['startDate'].value).format("DD-MM-YYYY");
                //    const edate=formatDate(this.orderForm.controls['endDate'].value).format("DD-MM-YYYY") ;
                //    if(sdate==this.orders[k].orderDateTime && edate==this.orders[k].deliveryDateTime){

                //      temparray.push(this.orders[k]);
                //    }
                //    this.orders= temparray;
                //  }

                //this.updateOrderSelectedIndex();
                // console.log("orders:", this.orders);
            });
        this.orders.forEach((order) => {

            if (
                order.orderStatus === 'ordered' &&
                order.partnerOrderId != null
            ) {
                this.audioService.playOrderAudio();
            }

        });
        
        // this.StartRefershingOrders();
    }
    protected filterusers() {
        if (!this.orders) {
            return;
        }
        // get the search keyword
        let search = this.itemControl.value;
        if (!search) {
            this.filteredorders = this.orders.slice();
            return;
        }
        else {
            search = search.toLowerCase()
        }

        // filter the banks
        this.filteredorders = this.orders.filter(
            (bank) =>

                bank.mobileno.toLowerCase().includes(search)
        );

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
    AcceptOrder(modal) {
        console.log(this.selectedOrder);
        this.modalReference = this.modalService.open(modal);
    }
    async ConfirmOrder() {
        this.audioService.stop();
        console.log(this.selectedOrder);
        console.log(this.prepTime.value);
        if (this.prepTime.value) {
            let payload = {
                order_id: this.selectedOrder.partnerOrderId,
                prep_time: this.prepTime.value,
            };
            console.log(payload);
            const confirmResp = await this.productItemsService.fetchRequestPost(
                'swiggy/acceptOrder',
                payload
            );
            console.log(confirmResp['statusMessage'].statusMessage);

            alert(confirmResp['statusMessage'].statusMessage);

            if (confirmResp['statusCode'] === 0) {
                this.isOrderAccepted = true;
                // this.updateOrderStatus('accepted');
                this.selectedOrder.orderStatus = 'placed';

                this.modalReference.close();
            }
        }
    }
    async OnPlay(order: Orders, event) {
        event.stopPropagation();
        const text = order.txtToSpeech;
        let payload = {
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.7,
                effectsProfileId: ['large-home-entertainment-class-device'],
            },
            input: {
                text: text,
            },
            voice: {
                languageCode: 'en-IN',
                name: 'en-IN-Standard-A',
            },
        };
        const respAudio = await this.productItemsService.fetchRequestPost(
            'swiggy/getSpeechFromText',
            payload
        );
        const base64String = respAudio['audioContent'];
        const audio = new Audio(
            'data:audio/mp3;base64,' + base64String.toString('base64')
        );

        audio.play();
    }
    async OrderReady() {
        console.log(this.selectedOrder.partnerOrderId);
        let payload = {
            order_id: this.selectedOrder.partnerOrderId,
        };
        const orderReadyResp = await this.productItemsService.fetchRequestPost(
            'swiggy/orderReady',
            payload
        );
        if (orderReadyResp['statusCode'] === 0.0) {
            this.audioService.stop();
            // this.updateOrderStatus('ready');
            this.isOrderAccepted = false;
        }
    }
    RejectOrder() {
        console.log(this.selectedOrder);
        let orderItems = this.selectedOrder.orderItems;
        orderItems.forEach(async (item) => {
            let payload = {
                item_id: item.itemId + '',
                orderId: item.orderId,
            };
            console.log(payload);
            const rejectOrder = await this.productItemsService.fetchRequestPost(
                'swiggy/outOfStock',
                payload
            );
        });
        this.audioService.stop();
        this.selectedOrder.orderStatus = 'cancelled';
        // this.updateOrderStatus('rejected');
        // call out of stock service in for loop of itemslist
    }
    async RejectItem(orderitem) {
        let payload = {
            item_id: orderitem.itemId + '',
            orderId: orderitem.orderId,
        };
        console.log(payload);
        const resp = await this.productItemsService.fetchRequestPost(
            'swiggy/outOfStock',
            payload
        );
        alert(resp['statusMessage']);
        console.log(orderitem);
        this.audioService.stop();
    }
    onView(row, content) {
        this.modalReference = this.modalService.open(content, {
            ariaLabelledBy: 'modal-basic-title',
        });
        this.accId = row.accountId;
        this.orderStatus = row.orderStatus;
      
        this.TablefieldsForm.patchValue({
            orderid: row.orderId,
            name: row.customerName,
            assignedTo: row?.assignedTo,
            paymethod: row.paymentMode,
            mobileno: row.mobileno,
            itemscount: row.orderItemCount,
            orderdate: row.orderDateTime,
            orderamount: row.amount,
            dispenseTime: row?.dispenseTime,
            devcharges: row.deliverCharges,
            payamount: row.paymentAmount,
            paystatus: row.paymentStatus,
            orderstatus: row.orderStatus,
            shipaddress: row.shippingAddressName,
        });

        this.TablefieldsForm.controls['dispenseTime'].disable();
        this.orders.forEach((obj)=>{
            if(row.orderId == obj.orderId){
                this.TablefieldsForm.patchValue({
                    dispenseTime: obj?.dispenseTime
                });
            }
        })
    }
    onSavePopup(order, i) {
        this.orders[i].statusedit = false;
        console.log(this.orders);
    }
    OnaccountIdClick(order: Orders) {
        console.log("order",order)
        
            let url = "WALLET"
          let jwtToken = localStorage.getItem('jwtToken');
          if (jwtToken) {
              this.router.navigate([`nfm/kitchen-tasks/${url}`], {
                  skipLocationChange: true,
                  queryParams: { accountId: order?.accountId }
              });
          }
        
    }
    OnOrderClick(order: Orders) {
        this.selectedOrder = order;
        this.dispenseStatus = order.dispenseStatus;
        this.dispenseTransId = order.dispenseTransId;
        this.isMatDrawerOpened = true;
        console.log(order);
        this.orderStatus = order.orderStatus;
        this.accId = order.accountId;
        this.orderStatus = order.orderStatus;
        this.TablefieldsForm.patchValue({
            orderid: order.orderId,
            name: order.customerName,
            assignedTo: order?.assignedTo,
            paymethod: order.paymentMode,
            mobileno: order.mobileno,
            itemscount: order.orderItemCount,
            orderdate: order.orderDateTime,
            orderamount: order.amount,
            devcharges: order.deliverCharges,
            payamount: order.paymentAmount,
            paystatus: order.paymentStatus,
            orderstatus: order.orderStatus,
            shipaddress: order.shippingAddressName,
        });
    }
    onLinkpress(row, items) {
        console.log(row);
        this.selectedOrder = row;
        this.orderId = row.orderId;
        this.totalitems = row.orderItemCount;
        this.modalReference = this.modalService.open(items, {
            size: 'lg',
            windowClass: 'modal-xl',
        });

        this.orderitems = [];
        this.totalitemsprice = 0;
        this.orderitems = row.orderItems;
        // this.totalitemsprice = row.amount;
        for (let i in this.orderitems) {
            this.totalitemsprice += this.orderitems[i].totalPrice;
        }
    }
    OnClose() {
        this.modalReference.close();
    }
    async GetOrdersOnly() {
        this.total = 0;
        this.totalcount = 0;
        this.itemcount = 0;
        this.totaldelv = 0;
        this.totalpaym = 0;
        this.dispenseStatusCompleted = 0;
        this.ItemdispenseStatus = 0;
        this.reservedCount = 0;
        this.reservedItemCount = 0;
        this.AveragePrice = 0;
        this.dispenseSuccessCount= 0;
        this.dispenseFailedCount = 0;
        this.totalMarginAmount = 0;
        this.dispensefailedOrders = 0;
        this.dispenseFailedItems = 0;
        let orderPayload: Orders = {
            totalOrderMargin: 0
        };
        let sdate = this.orderForm.controls['startDate'].value;
        let date = new Date(sdate);
        date.setHours(0, 0, 0, 0);

        let startDate = formatDate(date, 'YYYY-MM-dd HH:mm:ss', this.locale);

        let endDate = new Date(this.orderForm.controls['endDate'].value);
        endDate.setHours(23, 59, 59);
        let finalEndDate = formatDate(
            endDate,
            'YYYY-MM-dd HH:mm:ss',
            this.locale
        );
        orderPayload['startDate'] = startDate;
        orderPayload['endDate'] = finalEndDate;
        orderPayload['vendorId'] = this.vendorId;
        this.productItemsService
            .getOrderCollection(orderPayload)
            .subscribe(async (data) => {

                let temp = [];
                this.orders = data.orders;
                this.genieManagementList.forEach((obj) => {
                    this.orders.forEach((order) => {
                        if (order.genieId == obj.autoGenieId) {
                            order.genieName = obj.name
                        }
                    })
                })
                for (let i in this.orders) {
                    this.orders[i].formattedDateTime = formatDate(
                        this.orders[i].orderDateTime,
                        'dd-MM-YYYY HH:mm:ss',
                        this.locale
                    );
                    // this.orders[i].dispenseTime = formatDate(
                    //     this.orders[i].dispenseTime,
                    //     'dd-MM-YYYY HH:mm:ss',
                    //     this.locale
                    // )
                    this.orders[i]['statusedit'] = true;
                    if (this.orders[i].paymentMode == 'cod')
                        this.orders[i].paymentMode = 'COD';
                    if (
                        this.orders[i].paymentMode == 'cashAtStall' ||
                        this.orders[i].paymentMode == 'paytmAtStall'
                    ) {
                        this.orders[i].paymentMode = 'PAYTMATCTR';
                    }
                    if (
                        this.orders[i].orderStatus != 'Delivered' ||
                        this.orders[i].orderStatus != 'Closed'
                    ) {
                        temp.push(this.orders[i]);
                    }

                }
                this.orders = temp;
                this.orders.forEach((order)=>{
                    this.totalMarginAmount += order?.totalOrderMargin 
                    if(order.dispenseTransId != null){
                        order.orderItems.forEach((item)=>{
                       
                            if(item.quantity > 1){
                                // success case
                                this.dispenseSuccessCount+=this.countOccurrences(item.dispenseStatus,'SUCCESS');
                                this.dispenseFailedCount+=this.countOccurrences(item.dispenseStatus,'NON SUCCESS');
                            }
                            else{
                                if(item.dispenseStatus=='SUCCESS'){
                                    this.dispenseSuccessCount += 1 
                                }
                                else if(item.dispenseStatus !='SUCCESS' || item?.dispenseStatus==null){
                                    this.dispenseFailedCount += 1 
                                }
                            }
                          
                        })
                    }
                    // else if(order.dispenseStatus==null || order?.dispenseStatus=="Dispense Started"){
                    //     order.orderItems.forEach((item)=>{
                    //         if(item?.dispenseStatus==null){
                    //             this.dispenseFailedCount = this.dispenseFailedCount + 1;
                    //         }
                    //     })
                    // }
                   })
                // // for only getting nfmpos orders
                // let finalTemp = [];
                // finalTemp = this.orders.filter((order) => {
                //     return this.operatorName.some((item) => {
                //         return item.mobile == order.mobileno;
                //     });
                // });
                // this.orders = finalTemp;

                for (let j = 0; j < this.orders.length; j++) {
                    this.total += this.orders[j].amount;
                    this.itemcount += this.orders[j].orderItemCount;
                    this.totaldelv += this.orders[j].deliverCharges;
                    this.totalpaym += this.orders[j].paymentAmount;
                    if (this.orders[j].dispenseStatus == "Dispense Completed") {
                        this.dispenseStatusCompleted = this.dispenseStatusCompleted + 1;
                        this.ItemdispenseStatus = this.ItemdispenseStatus + this.orders[j].orderItemCount
                    }
                    else if(this.orders[j].dispenseStatus == "Dispense Failed"){
                        this.dispensefailedOrders = this.dispensefailedOrders + 1;
                        this.dispenseFailedItems = this.dispenseFailedItems + 1;
                    }
                    if (this.orders[j].orderStatus == "InProcess") {
                        this.reservedCount = this.reservedCount + 1;
                        this.reservedItemCount = this.reservedItemCount + this.orders[j].orderItemCount
                    }
                }
                console.log(
                    `Payment amount and delivery charges are ${this.totaldelv}, ${this.totalpaym}`
                );
                this.totalcount = this.orders.length;
                this.AveragePrice = parseFloat((this.total / this.itemcount).toFixed(2));
                console.log(this.total);
                const temparray = [];
                this.orders.forEach((order) => {
                    if (
                        order.orderStatus === 'ordered' &&
                        order.partnerOrderId != null
                    ) {
                        this.audioService.playOrderAudio();
                    }
                });
            });
            
    }
    async onCancelOrder(selectedOrder) {
        // this.loading = true;
        const userConfirmed = window.confirm("Are you sure you want to Cancel order ? ");
        if (userConfirmed) {
            selectedOrder.orderStatus = 'Cancelled';

            this.productItemsService.postOrder(selectedOrder).subscribe((data) => {
                console.log("Cancelled Order " + selectedOrder.orderId);
                let orderText = 'OrderId:' + data.orderId + ' Cancel Request Initiated. Our team will reach out to you soon for the confirmation and refund details.';
                alert('Order Cancelled!\n' + orderText);
            });
        }
    }
    async onSearchChange(event: Event){
        const value = (event.target as HTMLInputElement).value;
        this.total = 0;
        this.totalcount = 0;
        this.itemcount = 0;
        this.totaldelv = 0;
        this.totalpaym = 0;
        this.AveragePrice = 0;
        this.dispenseStatusCompleted = 0;
        this.reservedCount = 0;
        this.reservedItemCount = 0;
        this.ItemdispenseStatus = 0;
        this.dispenseSuccessCount = 0;
        this.dispenseFailedCount = 0;
        this.totalMarginAmount = 0;
        this.dispensefailedOrders = 0;
        this.dispenseFailedItems =  0;
        this.mfgwalletAmount = 0;
        this.onlineAmount = 0;
        // Clear any existing debounce timeout
        clearTimeout(this.debounceTimeout);
    let payload
        // Set a new debounce timeout
        this.debounceTimeout = setTimeout(async () => {
          if (value!=''){
          if(value.length >= 6){
                payload = {
                   "orderId": value.toString()
               }
           }
           else if(value.length >= 3 && value.length <=5){
                 payload = {
                    "orderId": value.toString()
                }
            }
          
            const resp = await this.productItemsService.fetchRequestPost(
                'rest/order/ByOrderId',
                payload
            );
            this.orders = resp['orders'];
            this.genieManagementList.forEach((obj) => {
                this.orders.forEach((order) => {
                    if (order.genieId == obj.autoGenieId) {
                        order.genieName = obj.name
                    }
                    order.formattedDateTime = formatDate(
                        order.orderDateTime,
                        'dd-MM-YYYY HH:mm:ss',
                        this.locale
                    );
                })
            })
            let amount = [];
            for (let j = 0; j < this.orders.length; j++) {
                this.total += this.orders[j].amount!;
                this.totaldelv += this.orders[j].deliverCharges!;
                this.totalpaym += this.orders[j].paymentAmount!;
                
                
                if(this.orders[j].paymentMode=='online'){
                    this.onlineAmount +=this.orders[j].amount;
                } 
                if(this.orders[j].paymentMode=='mfgwallet'){
                    this.mfgwalletAmount += this.orders[j].amount;
                } 
                if (this.orders[j].dispenseStatus == "Dispense Completed") {
                    this.dispenseStatusCompleted = this.dispenseStatusCompleted + 1
                    this.ItemdispenseStatus = this.ItemdispenseStatus + this.orders[j].orderItemCount
                }
                else if(this.orders[j].dispenseStatus == "Dispense Failed"){
                    this.dispensefailedOrders = this.dispensefailedOrders + 1;
                    this.dispenseFailedItems = this.dispenseFailedItems + 1;
                }
                if (this.orders[j].orderStatus == "InProcess") {
                    this.reservedCount = this.reservedCount + 1;
                    this.reservedItemCount = this.reservedItemCount + this.orders[j].orderItemCount
                }
                // if(this.orders[j].dispenseStatus == "SUCCESS"){
                //     this.dispenseSuccessCount = this.dispenseSuccessCount + 1
                // }
                // if(this.orders[j].dispenseStatus == "Dispense Failed"){
                //     this.dispenseFailedCount = this.dispenseFailedCount + 1
                // }
                amount.push(this.orders[j].amount)
                this.itemcount += this.orders[j].orderItemCount!;
            }
            this.totalcount = this.orders.length;
            this.AveragePrice = parseFloat((this.total / this.itemcount).toFixed(2));
            this.orders.forEach((order)=>{
                this.totalMarginAmount += order?.totalOrderMargin
                
                
                if(order.dispenseTransId != null){
                    order.orderItems.forEach((item)=>{
                   
                        if(item.quantity > 1){
                            // success case
                            this.dispenseSuccessCount+=this.countOccurrences(item.dispenseStatus,'SUCCESS');
                            this.dispenseFailedCount+=this.countOccurrences(item.dispenseStatus,'NON SUCCESS');
                        }
                        else{
                            if(item.dispenseStatus=='SUCCESS'){
                                this.dispenseSuccessCount += 1 
                            }
                            else if(item.dispenseStatus !='SUCCESS'){
                                this.dispenseFailedCount += 1 
                            }
                        }
                      
                    })
                }
                // else if(order.dispenseStatus==null || order?.dispenseStatus=="Dispense Started"){
                //     order.orderItems.forEach((item)=>{
                //         if(item?.dispenseStatus==null){
                //             this.dispenseFailedCount = this.dispenseFailedCount + 1;
                //         }
                //     })
                // }
               })
          }
          else if(value==''){
            this.onSearch();
          }
        }, 600);
       
    }
    // performSearch(value: string) {
    //     let searchvalue = value.toString();
       
    // }
    async onSearch() {
        this.total = 0;
        this.totalcount = 0;
        this.itemcount = 0;
        this.totaldelv = 0;
        this.totalpaym = 0;
        this.AveragePrice = 0;
        this.dispenseStatusCompleted = 0;
        this.reservedCount = 0;
        this.reservedItemCount = 0;
        this.ItemdispenseStatus = 0;
        this.dispenseSuccessCount = 0;
        this.dispenseFailedCount = 0;
        this.totalMarginAmount = 0;
        this.dispensefailedOrders = 0;
        this.dispenseFailedItems =  0;
        this.mfgwalletAmount = 0;
        this.onlineAmount = 0;
        // this.orders=this.allorders;
        let temparray = [];
        let tempfilter = [];
        let pay = this.orderForm.controls['dStatus'].value;
        // let pay = this.orderForm.controls['paymentMethod'].value;
        let mob = this.orderForm.controls['mobileno'].value;
        let pstatus = this.orderForm.controls['paymentStatus'].value;
        let orderstatus = this.orderForm.controls['orderstatus'].value;
        let stallid = this.orderForm.controls['stallid'].value;
        let category = this.orderForm.controls['category'].value;
        let ordermobileno = this.orderForm.controls['Ordermobileno'].value;
        let paymentMethod = this.orderForm.controls['paymentmethod'].value;
        let orderPayload: any = {};
        let sdate = this.orderForm.controls['startDate'].value;
        let date = new Date(sdate);
        date.setHours(0, 0, 0, 0);
        // let startDate = formatDate(date, 'YYYY-MM-dd HH:mm:ss', this.locale);

        // let endDate = new Date(this.orderForm.controls['endDate'].value);
        // endDate.setHours(23, 59, 59);
        // let finalEndDate = formatDate(
        //     endDate,
        //     'YYYY-MM-dd HH:mm:ss',
        //     this.locale
        // );

        const orderdate = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        let startDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        let finalEndDate = `${year}-${month}-${day} ${23}:${59}:${59}`;
        console.log("start date",startDate);
        console.log("final end date",finalEndDate); 

        orderPayload['startDate'] = startDate;
        orderPayload['endDate'] = finalEndDate;
        orderPayload['vendorId'] = this.vendorId;
        //  this.productItemsService.getOrderCollection(orderPayload).subscribe((data) => {

        //    this.orders=data.orders;

        // const temparray= [];

        //  });
        const resp = await this.productItemsService.fetchRequestPost(
            'rest/order/OrderCollection',
            orderPayload
        );
        this.orders = resp['orders'];
        this.filteredorders = this.orders;
        this.genieManagementList.forEach((obj) => {
            this.orders.forEach((order) => {
                if (order.genieId == obj.autoGenieId) {
                    order.genieName = obj.name
                }
            })
        })
        // for changing paymentmode types
        this.orders.forEach((item) => {
            if (item.paymentMode == 'cod') item.paymentMode = 'COD';
            if (
                item.paymentMode == 'cashAtStall' ||
                item.paymentMode == 'paytmAtStall'
            ) {
                item.paymentMode = 'PAYTMATCTR';
            }

        });
        let temp = [];
        if (orderstatus != 'Closed') {
            for (let i in this.orders) {
                if (
                    this.orders[i].orderStatus != 'Delivered' &&
                    this.orders[i].orderStatus != 'Closed'
                ) {
                    temp.push(this.orders[i]);
                }
            }
            this.orders = temp;
        }

        // // for only getting nfmpos orders

        // let finalTemp = [];
        // finalTemp = this.orders.filter((order) => {
        //     return this.operatorName.some((item: any) => {
        //         return item.mobile == order.mobileno;
        //     });
        // });
        // this.orders = finalTemp;
        this.orders.forEach((order) => {
            if (
                order.orderStatus === 'ordered' &&
                order.partnerOrderId != null
            ) {
                this.audioService.playOrderAudio();
            }

            // if (order.orderStatus === 'Submitted')
            //     this.audioService.playOrderAudio();
        });
        let array = [];
        // let array = [];
        // if (orderstatus.length > 0) {
        //   for (let i in orderstatus) {
        //     for (let j in this.orders) {
        //       if (orderstatus[i].name == this.orders[j].orderStatus) {
        //         array.push(this.orders[j]);
        //       }
        //     }
        //   }
        //   this.orders = array;
        //   array = [];
        // }

        console.log(this.total);

        for (let i in this.orders) {
            const datetime = new Date(this.orders[i].orderDateTime);
            const time = datetime.getHours();
            const minutes = datetime.getMinutes();
            this.orders[i]['orderTime'] = time + ':' + minutes;
            this.orders[i].formattedDateTime = formatDate(
                this.orders[i].orderDateTime,
                'dd-MM-YYYY HH:mm:ss',
                this.locale
            );
            // this.orders[i].dispenseTime = formatDate(
            //     this.orders[i].dispenseTime,
            //     'dd-MM-YYYY HH:mm:ss',
            //     this.locale
            // )
        }

        // if (pay.length > 0) {
        //     for (let i in pay) {
        //         for (let j in this.orders) {
        //             if (pay[i].name == this.orders[j].paymentMode) {
        //                 array.push(this.orders[j]);
        //             }
        //         }
        //     }
        //     this.orders = array;
        // }
        if (!this.orders || !this.orders.length) this.orders = this.orders;
        else if (pay!='') {
            this.orders = this.orders.filter((item: any) => {
                return (
                    item.dispenseStatus == pay

                );
            });

        }
        else if (pstatus == '' && mob == '' && stallid == '')
            this.orders = this.orders;
        // this.orders =  this.orders.filter(item => {
        //          return item.paymentMode.toString().toLowerCase().indexOf(pay.toLowerCase()) > -1
        //     || item.mobileno.toString().toLowerCase().indexOf(mob) > -1
        //    || item.paymentStatus.toString().toLowerCase()===pstatus.toLowerCase()
        // });
        else if (pstatus) {
            this.orders = this.orders.filter((item: any) => {
                return (
                    item.paymentStatus.toLowerCase().toString() ==
                    pstatus.toLowerCase().toString()
                );
            });
        }

        if (mob) {
            this.orders = this.orders.filter((item: any) => {
                return item.mobileno.toString() == mob.toString();
            });
        }
        if (stallid) {
            this.orders = this.orders.filter((order) => {
                return order?.stallId == parseInt(stallid);
            });
        }
        if (category) {
            this.orders = this.orders.filter((order) => {
                return order?.subCatId == parseInt(category);
            });
        }
        if (orderstatus) {
            this.orders = this.orders.filter((order) => {
                return order.orderStatus === orderstatus;
            });
        }
        if (ordermobileno) {
            this.orders = this.orders.filter((order) => {
                return order.mobileno === ordermobileno;
            });
        }
        if(paymentMethod) {
            this.orders = this.orders.filter((order) => {
                return order.paymentMode === paymentMethod;
            });
        }
        console.log(this.orders);
        this.total = 0;
        this.totaldelv = 0;
        this.totalpaym = 0;
        //                     Date Format
        // for(let i in this.orders){
        //   this.orders[i].orderDateTime = formatDate(this.orders[i].orderDateTime).format("DD-MM-YYYY");
        //   }
        // Total amount
        let amount = [];
        for (let j = 0; j < this.orders.length; j++) {
            this.total += this.orders[j].amount!;
            this.totaldelv += this.orders[j].deliverCharges!;
            this.totalpaym += this.orders[j].paymentAmount!;
            
            
            if(this.orders[j].paymentMode=='online'){
                this.onlineAmount +=this.orders[j].amount;
            } 
            if(this.orders[j].paymentMode=='mfgwallet'){
                this.mfgwalletAmount += this.orders[j].amount;
            } 
            if (this.orders[j].dispenseStatus == "Dispense Completed") {
                this.dispenseStatusCompleted = this.dispenseStatusCompleted + 1
                this.ItemdispenseStatus = this.ItemdispenseStatus + this.orders[j].orderItemCount
            }
            else if(this.orders[j].dispenseStatus == "Dispense Failed"){
                this.dispensefailedOrders = this.dispensefailedOrders + 1;
                this.dispenseFailedItems = this.dispenseFailedItems + 1;
            }
            if (this.orders[j].orderStatus == "InProcess") {
                this.reservedCount = this.reservedCount + 1;
                this.reservedItemCount = this.reservedItemCount + this.orders[j].orderItemCount
            }
            // if(this.orders[j].dispenseStatus == "SUCCESS"){
            //     this.dispenseSuccessCount = this.dispenseSuccessCount + 1
            // }
            // if(this.orders[j].dispenseStatus == "Dispense Failed"){
            //     this.dispenseFailedCount = this.dispenseFailedCount + 1
            // }
            amount.push(this.orders[j].amount)
        }
        console.log("1103orders",this.orders.length)
        console.log("amount", amount)
        const sum = amount.reduce((total, value) => total + value, 0);

        console.log("Sum of values:", sum);
        // Order ItemCount
        for (let k in this.orders) {
            this.itemcount += this.orders[k].orderItemCount!;
        }
        this.totalcount = this.orders.length;
        this.AveragePrice = parseFloat((this.total / this.itemcount).toFixed(2));
        console.log("AveragePrice", this.AveragePrice)
        console.log(this.total);
      console.log("orders",this.orders.length) 
       this.orders.forEach((order)=>{
        this.totalMarginAmount += order?.totalOrderMargin
        
        
        if(order.dispenseTransId != null){
            order.orderItems.forEach((item)=>{
           
                if(item.quantity > 1){
                    // success case
                    this.dispenseSuccessCount+=this.countOccurrences(item.dispenseStatus,'SUCCESS');
                    this.dispenseFailedCount+=this.countOccurrences(item.dispenseStatus,'NON SUCCESS');
                }
                else{
                    if(item.dispenseStatus=='SUCCESS'){
                        this.dispenseSuccessCount += 1 
                    }
                    else if(item.dispenseStatus !='SUCCESS'){
                        this.dispenseFailedCount += 1 
                    }
                }
              
            })
        }
        // else if(order.dispenseStatus==null || order?.dispenseStatus=="Dispense Started"){
        //     order.orderItems.forEach((item)=>{
        //         if(item?.dispenseStatus==null){
        //             this.dispenseFailedCount = this.dispenseFailedCount + 1;
        //         }
        //     })
        // }
       })
       
    }
    ngOnDestroy() {
        clearInterval(this.interval);
    }
    OnCancel() {
        this.modalReference.close();
    }
    countOccurrences(input: string, value: string): number {
        // Split the input string by commas
        const items = input.split(',');
    
        // Initialize a counter for the occurrences
        let count = 0;
    
        // Iterate through each item in the array
        for (const item of items) {
            // Trim the item to remove any leading or trailing whitespace
            const trimmedItem = item.trim();
            if(value!='SUCCESS'){
                if(trimmedItem!='SUCCESS'){
                    count++;
                }
            }

            else{
                if (trimmedItem === value) {
                    count++;
                }
            }
            // If the trimmed item matches the provided value, increment the counter
           
        }
    
        // Return the count of occurrences
        return count;
    }
}


