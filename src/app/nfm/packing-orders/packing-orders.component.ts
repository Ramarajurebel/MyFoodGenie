import {
  Component,
  Inject,
  LOCALE_ID,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import * as pdfMake from 'pdfmake/build/pdfmake';

import { MatTableDataSource } from '@angular/material/table';
import * as pdfMakeConfig from 'pdfmake/build/pdfmake.js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdhocPoItems } from './../../shared/classes/adhocpo-items';
import { PoItemsColumns } from './../../shared/tables/adhocpoitems-columns';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import { fill } from 'lodash';
import { formatDate } from '@angular/common';
import { MatSort, MatSortable, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Suppliers } from 'app/shared/classes/supplier';
import { SupItems } from './../../shared/classes/sup-items';
import { products } from './../../mock-api/apps/ecommerce/inventory/data';
import { refillSlotItems } from 'app/shared/tables/refillslotitems-columns';
import { duration } from 'moment';
import { VoiceRecognitionService } from 'app/Services/voice-recognition.service';


@Component({
  selector: 'app-packing-orders',
  templateUrl: './packing-orders.component.html',
  styleUrls: ['./packing-orders.component.scss']
})
export class PackingOrdersComponent implements OnInit {

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  @ViewChild('confirmRefill') confirmRefillTemplate: TemplateRef<any>;
  drawerMode: 'side' | 'over';
  appearnce: MatFormFieldModule = fill;
  adhocPoData = [];
  adhocPoItems: AdhocPoItems[] = [];
  purchaseRateCardData = [];
  poItemsTable = new MatTableDataSource<AdhocPoItems>();
  
//   displayedColumns: string[] = refillSlotItems.map((col) => col.key);
  columnsSchema: any = refillSlotItems;
  adhocItemformGroup: FormGroup;
  productsList = [];
  modalReference: any;
  public categories = ['Vegetables', 'Groceries', 'Non Veg', 'Others'];

  checkData = [true,false];
  purchaseorder: FormControl = new FormControl('');
  category: FormControl = new FormControl('');
  available: FormControl = new FormControl('');
  adhocpoitemid: number = 0;
  adhocpoid: number = 0;
  idRefillOrd: number = 0;
  mobilePoItems: AdhocPoItems[];

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
  stallOperator = [];
  selectedRow: AdhocPoItems;
  oldValueRow: AdhocPoItems;
  ingredientsImagePath = './assets/images/ingredients/';
  isQuantity: boolean = false;
  delObj = {};
  isMatDrawerOpened: boolean = false;
  isAdhocItemDetails: boolean = false;
  isAdhocPoItemEditMode: boolean = false;
  isAdhocDetails: boolean = false;
  refillOrderFormGroup: FormGroup;
  public filtereditems = [];
  itemControl: FormControl = new FormControl('');
  genieControl: FormControl = new FormControl('');
  refillQtyControl: FormControl = new FormControl('');
  protected _onDestroy = new Subject<void>();
  RefillfilterstatusData = ['Open', 'Packing','Packing Completed', 'In Transit','Correction','Refill', 'Refill Completed','Return Validation','Return Completed','Closed','Cancelled'];
  statusData = ['Open', 'Packing','Packing Completed', 'In Transit','Correction','Refill', 'Refill Completed','Return Validation','Return Completed','Closed','Cancelled'];
  OrderTypeData = ['Packing','Refill'];
  OrderForData = ['Single','Multiple'];
  itemImgLoc = './assets/images/Food Menu/';
  currentObj: any;
  searchFormGroup: FormGroup;
  updatePricePayload: any;
  salePriceControl: FormControl = new FormControl('');
  allAdhocPo = [];
  poCategory: string;
  dropdownSettings: IDropdownSettings;
  posList: FormControl = new FormControl();
  newPoName: FormControl = new FormControl();
  snackBarRef: any;
  @ViewChild('snackBar', { static: true }) snackBar: TemplateRef<any>;
 
  responseMessage: string = '';
  suppliersList: Suppliers[] = [];
  supplierItemsList: SupItems[] = [];
  vendorData = [];
  vendorId: number = 0;
  stallData: any;
  genieMangresp: any;
  Refillresp: any;
  mappingSlotResp: any;
  multipleSlotResp: any;
  slotsresp: any;
  refillSlotTable: MatTableDataSource<unknown>;
  refillSlotItemformGroup: FormGroup;
  RefillCreateFormGroup: FormGroup;
  SingleSlotResp: any;
  refillSlotId: any;
    SelectedContact: number;
    Contact: string;
    Selectedgenie: any;
    selectedRefill: any;
    refillorderId: number = 0;
    user: any;
    username: any;
    editingMode: boolean = false;
    public sortedColumn: string | null = null;
public isAscending = true;
showSortingIndicators = false;
filteredStatusData: string[] = [];
// ,'refillQty','return'
displayedColumns: string[] = ['rackSlotId', 'prodId'];
    suppItems: any;
    headerStatus: any;
    filteredSuppItems: any;
    createRefillOrderPayload:any;
    dialogRef: any;
    prodImage: any;
    ItemLength: any;
    row: any;
    filteredSlots: any;
    loading: boolean = false;
    slotTableItem: any;
    selectedValue: any;
    packingref: any;
    packingStatusCheck1:boolean = false;
    packingStatusCheck2:boolean = false;
    packingStatusCheck3:boolean = false;
    packingStatusCheck4:boolean = false;
    data: any;
    value: any;
    packingDialogContent: boolean = false;
    refillStatusCheck1:boolean = false;
    refillStatusCheck2:boolean = false;
    refillStatusCheck3:boolean = false;
    refillStatusCheck4:boolean = false;
    refillStatusCheck5:boolean = false;
    IntransitStatusContent: boolean = false;
    IntransitStatusCheck1:boolean = false;
    IntranasitStatusCheck2:boolean = false;
    SlotId: any;
    totalquantities: any;
    SelectAllPayload: { refillOrdId: any; status: any; changeTo: boolean; };
    SelectallStatus: any;
    selectedData: any;
    prodsList: any;
    selectedRowIndex: number | null = null;
    maxHighlightedRows: number;
    isgenieLocation: boolean = false;
    editmode: boolean = false;
    mappingInvObj: any;
    slotItemPrice: any;
    itemChanged: boolean = false;
    productDetails: any;
    productmaxQty: any;
    filteredproductdetails: any;
    fitleredRacks: any;
  packingCompletedRefill: any;
  selectedValues:any[] = [];
  SinglegenieSelection: boolean;
  genieList: any;
  genieNamesList: any[];
 
  RefillMethod: boolean = false
  allRefillOrders: any;
  filteredstallData: any;
  refillPackorderslotsresp: any;
  Refillorders: any;
  refillPackObj: any;
  Payload: any;
  packingCompletedCheck: FormControl = new FormControl(false);
  diffQty: FormControl = new FormControl();
  packingQty: boolean = false;
  refillOrdersRefillresp: any;
  packorderData: any;
  packaudioresp: any;
  refillObj: any;
  RefillOrders: any;
  currentSlotIndex: any;
  currentSlot: any;
  command: string;
  previousCommand: any;
  currentProd: any;
  allItemsList: any;
  refOrder: any;
  filteredPackingorders: any;
  packingback: boolean=false;
  constructor(
      private service: ProjectService,
      private router: Router,
      private dialog: MatDialog,
      private modalService: NgbModal,
      @Inject(LOCALE_ID) public locale: string,
      private _liveAnnouncer: LiveAnnouncer,
      private cdr: ChangeDetectorRef,
      private _snackBar: MatSnackBar,
     public voiceservice: VoiceRecognitionService,
     private route: ActivatedRoute
  ) {
     
      this.user = JSON.parse(localStorage.getItem('user'));
      this.username = this.user.userName;
      this.voiceservice.init(this.handleVoiceCommand.bind(this));
  }
  @ViewChild(MatSort) sort: MatSort;
  ngAfterViewInit() {
 
   
    // this.sort.sort({}
    //     id: 'rackSlotId',
    //     start: 'desc',
    //     disableClear: false,
        

    //   });
  
      this.announceSortChange(this.sort);
      // this.refillSlotTable.sort = this.sort 
      this.poItemsTable.sort = this.sort;
  }
  announceSortChange(sort: Sort = { active: 'rackSlotId', direction: 'desc' }) {
    let data = this.refillSlotTable.data;

    if (!sort.active || sort.direction === '') {
      this.refillSlotTable.data = data;
    } else {
        if(sort.active=='rackSlotId'){
      data = data.sort((a: any, b: any) => {
    
        const rackIdA = a.rackId;
        const rackIdB = b.rackId;
    
        if (rackIdA !== rackIdB) {
          return (rackIdA < rackIdB ? -1 : 1) * (sort.direction === 'desc' ? 1 : -1);
        } else {
          const slotIdA = a.slotId;
          const slotIdB = b.slotId;
          return (slotIdA < slotIdB ? -1 : 1) * (sort.direction === 'desc' ? 1 : -1);
        }
      });
        }
      this.refillSlotTable.data = data;
      console.log(data);
    }
  }
  async ngOnInit() {
      let vendorIdStr = localStorage.getItem('vendorId');
      if (vendorIdStr) {
          this.vendorId = parseInt(vendorIdStr);
      }
      this.route.queryParams.subscribe(params => {
        this.refOrder = params['refOrder'];
      });
      console.log("refOrder",this.refOrder)
      // this.dropdownSettings = {
      //     singleSelection: false,
      //     idField: 'adhocpoid',
      //     textField: 'nameAndDate',

      //     allowSearchFilter: true,
      // };
      this.searchFormGroup = new FormGroup({
        status: new FormControl(),
        startDate: new FormControl(),
        endDate: new FormControl(),
     
    });
      this.RefillCreateFormGroup = new FormGroup({
        orderType: new FormControl('Packing'),
        orderFor: new FormControl('Single'),
        genieName: new FormControl(),
        geniesList: new FormControl(''),
        refillPackOrder: new FormControl(''),
        packedBy: new FormControl('')
      });
      this.refillOrderFormGroup = new FormGroup({
        genieId: new FormControl(),
        genieLocation: new FormControl(''),
        assignedTo: new FormControl(''),
        packedBy: new FormControl(''),
        createdBy: new FormControl(''),
        updatedBy: new FormControl(''),
       
        status: new FormControl(''),
        comments: new FormControl(''),
        contactPerson: new FormControl(''),
        orderType: new FormControl(''),
        orderFor: new FormControl('')
      });
      this.refillSlotItemformGroup = new FormGroup({
          refillOrderId: new FormControl(),
          refillSlotId: new FormControl(),
          prodId: new FormControl(),
          prodName: new FormControl(''),
            uom: new FormControl(''),
            maxQty: new FormControl({value: '', disabled: true}),
            refillQty: new FormControl(''),
            correctionQty: new FormControl(''),
            status: new FormControl(''),
            updatedDateTime:new FormControl(''),
            rackId: new FormControl(),
            slotId: new FormControl(),
            packingQty: new FormControl(),
            packingCheck: new FormControl(),
            refillCheck: new FormControl(), 
            corrected: new FormControl()
             
        });
    //   this.loading = true;
    // await this.getRefillOrders();
    const suppResp = await this.service.fetchRequest(
      'supplieritem/getAllSupplierItems'
    );
    this.suppItems = suppResp['supplierItemList'];
    this.Refillresp=[];
   
 
 
    let datePayload = {};
    datePayload['startDate'] = null;
    datePayload['endDate'] = null;
    datePayload['status']=null;
 console.log('datePayload',datePayload);
 const resp = await this.service.fetchRequestPost(
  'refillOrder/getRfOrdByDate',
  datePayload
);

if(this.refOrder==undefined){
  this.Refillresp = resp;
  this.refillOrdersRefillresp = this.Refillresp;
  this.filteredPackingorders=this.Refillresp;
  this.packingback=false;
}

else if(this.refOrder!=undefined){

  // const foundOrder = this.filteredPackingorders.find((pack) => this.refOrder === pack.idRefillOrd);
  const foundOrder = resp.find((pack)=>{
 return this.refOrder == pack.idRefillOrd
  });
if (foundOrder) {
  this.filteredPackingorders = foundOrder; // Use only the found order
  this.Refillresp = [foundOrder]; // Set Refillresp to an array containing only the found order
  this.refillOrdersRefillresp = this.Refillresp
  this.activatingChild(foundOrder); // Pass the found order to activatingChild
}
this.packingback=true;
}
console.log("Packorder",this.filteredPackingorders)

console.log("User",this.user)
if(this.user.role=="admin"){
  this.Refillresp = this.Refillresp.filter((ref)=>{
    return ref.orderType=="Packing" && ref.orderFor!=null && ref.status!="Refill" && ref.status!="Correction" && ref.status!="Refill Completed" && ref.status!="Closed" && ref.status != "Cancelled"
  });
}
else {
  this.Refillresp = this.Refillresp.filter((ref)=>{
    return ref.orderType=="Packing" && ref.createdBy==this.username && ref.orderFor!=null && ref.status!="Refill" && ref.status!="Correction" && ref.status!="Refill Completed" && ref.status!="Closed" && ref.status != "Cancelled"
  });
}

this.Refillresp.sort((a, b) => b.idRefillOrd - a.idRefillOrd);
     
     
      // this.service.GetVmsProducts().subscribe((data) => {
      //   this.prodsList = data;
      //   this.filteredSuppItems = [];
      //        this.suppItems.forEach((obj)=>{
      //            this.prodsList.forEach((prod)=>{
      //          if(obj.productname==prod.name) this.filteredSuppItems.push(obj);
      //       })
      //   })
      // });
    // this.filteredSuppItems = this.suppItems;
   
      
      this.genieControl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
          this.filtergenies();
      });
    //   this.getRefillSlots();
      const stallOpResp = await this.service.fetchRequest(
          'stalloperator/getAllStallOperator'
      );
      this.stallOperator = stallOpResp['stallOperatorList'];
    
      const counterresp = await this.service.fetchRequest('stall/getAllStalls');
      this.stallData = counterresp['supplierList'];
      this.stallData = this.stallData.filter((obj)=> {return obj.status=="Active" && obj.type=="Genie"} );
      this.filteredstallData = this.stallData;
    

 
    const prodresp = await this.service.fetchRequest(
        'geniemapping/getAllGenieMapping'
    );
    this.productDetails = prodresp['genieMappingList'];
 
   
     
      const vendorResp = await this.service.fetchRequest(
          'rest/vendor/GetAllVendors'
      );
      this.vendorData = vendorResp['vendorList'];
     
      //
      // for changing true to available
      // this.adhocPoItems.forEach((item) => {
      //     if (item.available === true) {
      //         item.available = 'Available';
      //     } else {
      //         item.available = 'Not Available';
      //     }
      // });
      // for getting product name
      const payload = {
          catid: 112,
          prodid: 0,
          vendorId: this.vendorId,
      };
      const getproducts = await this.service.fetchRequestPost(
          '/rest/product/ProductsByVariants',
          payload
      );
      this.productsList = getproducts['productitems'];
      this.allItemsList = this.productsList.filter((prod) => {
        return prod.vmsRefId != null;
    });
    this.suppItems.forEach((sup)=>{
      this.allItemsList.forEach((prod)=>{
        if(sup.productId==prod.prodId && sup.productname==prod.prodName){
          prod['salePrice']=sup.salePrice
        }
      })
    })
    this.filteredSuppItems = this.allItemsList.slice();
    this.itemControl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
          this.filterproducts();
      });
      // // for uom setting to products
      // this.purchaseRateCardData.forEach((rateCard) => {
      //     this.productsList.forEach((item) => {
      //         if (item.prodId === rateCard.itemId) {
      //             item.uom = rateCard.uom;
      //         }
      //     });
      // });
// showing supplier Items only
      this.supplierItemsList = this.supplierItemsList.filter((supItem)=>{
          return this.suppliersList.some(sup=>sup.supId==supItem.supid);
      });
      this.productsList = this.supplierItemsList;

      this.productsList = this.productsList.filter((item)=>{
          return item?.enddate ==null;
      });
      this.filtereditems = this.productsList;
                  const Rfillresp = await this.service.fetchRequest(
              'refillOrder/getAllRefillOrder'
              
          );
          
          // this.allRefillOrders = Rfillresp;
          this.RefillOrders=Rfillresp;
         
          const genieresp = await this.service.fetchRequest(
            'geniemanagement/getAllGenieManagement'
        );
        
        this.genieMangresp = genieresp['genieManagementList'];
        this.Refillresp.forEach((refill)=>{
          this.genieMangresp.forEach((genie)=>{
            if(refill?.orderFor=='Multiple'){
              let genieIdNames = refill?.geniesList.split(",");
              this.genieNamesList=[];
              this.genieNamesList=genieIdNames.map((num, index) => ({
                key:num,
                name:""// Or any other logic for generating names
            }));
       
        this.genieNamesList.forEach((obj)=>{
          this.genieMangresp.forEach((genie)=>{
            if(obj.key==genie.autoGenieId){
              obj.name = genie?.name;
              obj.keyname=`${genie.autoGenieId}-${genie.name}, `;
              
            }
          });
    
        })
        refill.genieNamesList = this.genieNamesList;
            }
          })
        });
       
    //   this.productsList.forEach((item) => {
    //       this.adhocPoItems.forEach((element) => {
    //           element.prodImage = `${element.productlist}.webp`;
    //           if (element.productlist == item.productId) {
    //               element['prodName'] = item.productname;
    //               element['tname'] = item?.tname;
    //               element['itemName'] = item.productname + '-' + item.tname;
    //               element['quantityUom'] =
    //                   element.quantity + ' ' + element.uom;
    //           }
    //       });
    //   });

      // sorting data

    //   this.adhocPoItems = this.SortIngr(this.adhocPoItems);
      // let order = ['Groceries', 'Vegetables', 'Non Veg', 'Others'];
      // let newArray = [];
      // order.forEach((orderitem) => {
      //     return this.adhocPoItems.filter((ingr) => {
      //         if (ingr.category === orderitem) newArray.push(ingr);
      //     });
      // });
      // this.adhocPoItems = newArray;
    //   this.adhocPoItems = this.adhocPoItems.sort((a, b) => {
    //       return b?.finalprice - a?.finalprice;
    //   });
      // Sort the array based on the conditions
    //   this.adhocPoItems.sort((a, b) => a.balanceQty - b.balanceQty);
    //   this.adhocPoItems.forEach((item) => {
    //       if (!item.available && item.balanceQty === 0) {
    //           item.sortKey = 1; // First condition: available false and balance == 0
    //       } else if (item.available && item.balanceQty === 0) {
    //           item.sortKey = 3; // Second condition: available true and balanceQty == 0
    //       } else if (!item.available && item.balanceQty > 0) {
    //           item.sortKey = 2; // Third condition: checked false and balance > 0
    //       } else {
    //           item.sortKey = 0; // Other items that don't meet the conditions
    //       }
    //   });

    //   this.adhocPoItems.sort((a, b) => a.sortKey - b.sortKey);
      // status push
    //   this.adhocPoData.forEach((po) => {
    //       this.adhocPoItems.forEach((item) => {
    //           if (item.adhocpoid === po.adhocpoid) {
    //               item['postatus'] = po.status;
    //           }
    //       });
    //   });
      // pushing relational items to adhoc po
     
     
      // this.adhocItemformGroup.controls['price'].disable();
  }
  async OnVoicerecStart(){
    event.stopPropagation();
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.register('/service-worker.js')
    //     .then(function(registration) {
    //       console.log('Service Worker registered with scope:', registration.scope);
    //     }).catch(function(error) {
    //       console.log('Service Worker registration failed:', error);
    //     });
    // }
    
   
      await this.voiceservice.start();
   
  }
  async handleVoiceCommand(command: string, value?: any) {
    if (command === 'done') {
      this.OnVoiceNext(this.refillSlotTable?.filteredData,event,command,value);
    }
    else if(command === 'next'){
     
      this.OnVoiceNext(this.refillSlotTable?.filteredData,event,command,value);
    }
    else if(command === 'change quantity to' && value !== undefined){
      console.log('Quantity changed to:', value);
      this.OnVoiceNext(this.refillSlotTable?.filteredData,event,command,value);
    }
    else if(command === 'change item name to' && value !== undefined){
      console.log('itemchanged to:', value);
      this.OnVoiceNext(this.refillSlotTable?.filteredData,event,command,value);
    }
    else if(command === 'read slot' && value !== undefined){
      console.log('read slot', value);
      this.OnVoiceNext(this.refillSlotTable?.filteredData,event,command,value);
    }
    else if(command === 'stop'){
      this.voiceservice.stop();
    }
    else if (command !== 'done' && command !== 'next' && command !== 'change quantity to' && command !== 'change item name to' && command !== 'read slot' && command !== 'stop') {
      // Handle invalid command
      this.voiceservice.stop();
      let payload = {
          audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: 1.1,
              effectsProfileId: ['large-home-entertainment-class-device'],
          },
          input: {
              text: "Invalid Command",
          },
          voice: {
              languageCode: 'en-US',
              name: 'en-US-Standard-A',
          },
      };

      const respAudio = await this.service.fetchRequestPost('swiggy/getSpeechFromText', payload);
      const base64String = respAudio['audioContent'];
      const audio = new Audio('data:audio/mp3;base64,' + base64String);
      audio.play();
      audio.onended = () => {
      
        this.voiceservice.start();
   
};
  }

// } catch (error) {
//   console.error('Error handling voice command:', error);
// }

    // Handle other commands as needed
  }
  async onCreateRefillOrder(modal){
    this.RefillCreateFormGroup.controls['orderFor'].setValue('Single')
    this.SinglegenieSelection = true;
    console.log("stallOperator",this.stallOperator)
    console.log("Username",this.user)
    const loggedInUser = this.stallOperator.find(op => op.mobile == this.user.mobileNumber);
    if (loggedInUser) {
      this.RefillCreateFormGroup.controls['packedBy'].setValue(loggedInUser.name);
    }
this.modalReference= this.dialog.open(modal);
this.selectedValue = '';
  }
  async onGenieChange(selectedValue){
    this.selectedValue = selectedValue;
    console.log("selectedValue",selectedValue);
  
   
  }
  onBackpacking(){
    console.log("packingBack");
    let url = "ITEMINV"
    let jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
        this.router.navigate([`nfm/kitchen-tasks/${url}`], {
            skipLocationChange: true,
          
        });
    }
  }
  onLocationPress(location){
    console.log(location);
    const [latitude, longitude] = location.split(",");
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');

  }

  async onCreate(){
    this.RefillCreateFormGroup.controls['orderType'].setValue('Packing');

    let form = this.RefillCreateFormGroup.getRawValue();

    this.refillorderId = 0;
    if(form?.orderType=='Packing'){
    if(form?.orderFor=='Single'){
    this.Selectedgenie = this.genieMangresp.find((obj)=>{
        if(obj.stallId==this.selectedValue) return obj.autoGenieId
    })
    console.log("SelectedGenieId",this.Selectedgenie.autoGenieId);
    this.createRefillOrderPayload={
      "genieId": this.Selectedgenie.autoGenieId,
    "idRefillOrd" :this.refillorderId,
    "status":  "Packing",
    "createdBy" : this.username,
    "assignedTo" : "",
      "packedBy" : form?.packedBy,
      "updatedBy": "",
      "comments": "",
      "genieLocation": "",
      "contactPerson": "",
      "keyInfo": "",
      "type" : 'auto',
      
    "orderType": "Packing",
    "orderFor": form?.orderFor,
    "geniesList": null,
    "refillPackOrder": null,
    "vendorId": this.vendorId
    }
console.log("payload",this.createRefillOrderPayload);
    }
    else if(form?.orderFor=='Multiple'){
      const geniesListValues = form?.geniesList;
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
      form.geniesList = geniesListString
      console.log("form",form);
      this.createRefillOrderPayload={
        "genieId": this.genieList[0],
      "idRefillOrd" :this.refillorderId,
      "status": form?.orderType,
      "createdBy" : this.username,
      "assignedTo" : "",
      "packedBy" : form?.packedBy,
      "updatedBy": "",
      "comments": "",
      "genieLocation": "",
      "contactPerson": "",
      "keyInfo": "",
      "type" : 'auto',
      
      "orderType": form?.orderType,
      "orderFor": form?.orderFor,
      "geniesList": form?.geniesList,
      "refillPackOrder": null,
  
      "vendorId": this.vendorId
      }
      console.log("payload",this.createRefillOrderPayload);

    }
  }
  //    else if(form?.orderType=='Refill'){
  //     this.Selectedgenie = this.genieMangresp.find((obj)=>{
  //       if(obj.stallId==this.selectedValue) return obj.autoGenieId
  //   })
  //   console.log("SelectedGenieId",this.Selectedgenie.autoGenieId);
  //     this.createRefillOrderPayload={
  //       "genieId": this.Selectedgenie.autoGenieId,
  //     "idRefillOrd" :this.refillorderId,
  //     "status":  form?.orderType,
  //     "createdBy" : this.username,
  //     "assignedTo" : "",
  //       "packedBy" : "",
  //       "updatedBy": "",
  //       "comments": "",
  //       "genieLocation": "",
  //       "contactPerson": "",
  //       "keyInfo": "",
  //       "type" : 'auto',
        
  //     "orderType": form?.orderType,
  //     "orderFor": null,
  //     "geniesList": null,
  //     "refillPackOrder": form?.refillPackOrder,
  //     "vendorId": this.vendorId
  //     }
  // console.log("payload",this.createRefillOrderPayload);

  //    }
   
  
       
      this.dialogRef = this.dialog.open(this.confirmRefillTemplate, {
        width: '300px', // Set the width as per your design
      });
    
    
  }
  onRadioOrderType(text){
    if(text=='Refill'){
      this.RefillMethod = true;
    }
    else if(text=='Packing'){
      this.RefillMethod = false;
    }
  }
  onRadio(text){
    if(text=='Single'){
      this.SinglegenieSelection = true;
    }
    else if(text=='Multiple'){
      this.SinglegenieSelection = false;
    }
  }
  async OnConfirmCreateRefillOrder(){
    console.log("createRefillOrder",this.createRefillOrderPayload);
    if(this.createRefillOrderPayload?.orderType=='Packing'){
    if(this.createRefillOrderPayload?.orderFor=='Single'){
      const updateresp = await this.service.fetchRequestPost(
        'refillslots/getMappingInvData',
        this.createRefillOrderPayload
      );
    
      this.mappingSlotResp = updateresp;
      if(updateresp){
        this.responseMessage = 'Packing Order Created Successfully';
       this.modalReference.close();
    }
    else{
        this.responseMessage = 'Packing Order Creation Failed'
    }
    }
    else if(this.createRefillOrderPayload?.orderFor=='Multiple'){
    const updateresp = await this.service.fetchRequestPost(
        'refillOrder/packingMultipleOrRefresh',
        this.createRefillOrderPayload
    );
  
    this.mappingSlotResp = updateresp;
    if(updateresp){
      this.responseMessage = 'Packing Order Created Successfully';
     this.modalReference.close();
  }
  else{
      this.responseMessage = 'Packing Order Creation Failed'
  }
  }
}
else if(this.createRefillOrderPayload?.orderType=='Refill'){
  const updateresp = await this.service.fetchRequestPost(
    'refillslots/getMappingInvData',
    this.createRefillOrderPayload
  );

  this.mappingSlotResp = updateresp;
  if(updateresp){
    this.responseMessage = 'Refill Order Created Successfully';
   this.modalReference.close();
}
else{
    this.responseMessage = 'Refill Order Creation Failed'
}

}

//     const updateSlotresp = await this.service.postResponseAsText(
//       'refillslots/createMultipleSlots',
//       this.mappingSlotResp
//   );
//   console.log(updateSlotresp,"updateSlotresp")
//   this.multipleSlotResp= updateSlotresp;
//   console.log("MultipleSlotResp",this.multipleSlotResp);
  
  this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
      duration: 2 * 1000,
  });
  await this.getRefillOrders();
  // this.getRefillSlots();
  this.dialogRef.close();
  this.Refillresp.forEach((refill)=>{
    this.genieMangresp.forEach((genie)=>{
      if(refill?.orderFor=='Multiple'){
        let genieIdNames = refill?.geniesList.split(",");
        this.genieNamesList=[];
        this.genieNamesList=genieIdNames.map((num, index) => ({
          key:num,
          name:""// Or any other logic for generating names
      }));
 
  this.genieNamesList.forEach((obj)=>{
    this.genieMangresp.forEach((genie)=>{
      if(obj.key==genie.autoGenieId){
        obj.name = genie?.name;
        obj.keyname=`${genie.autoGenieId}-${genie.name}, `;
        
      }
    });

  })
  refill.genieNamesList = this.genieNamesList;
      }
    })
  });
  //In order to load Packing Completed Refill Orders Data in Refill Packing Completed Drop dowm
  const Rfillresp = await this.service.fetchRequest(
    'refillOrder/getAllRefillOrder'
    
);

this.allRefillOrders = Rfillresp;

this.allRefillOrders = this.allRefillOrders.filter((order)=>{
  return order.status == "Packing Completed" && order.status != "Closed" && order.status != "Cancelled";
})
console.log("Rfillresp",this.allRefillOrders);
this.RefillCreateFormGroup.reset();
//   this.modalReference.close();
  
}
selectNextFiveRows(index:number) {
  console.log("index",index)
}
   
  async getRefillOrders(){
    return new Promise(async (res, rej)=>{
      
   
            this.Refillresp=[];
            let startDate = this.searchFormGroup.controls['startDate'].value;
            let endDate = this.searchFormGroup.controls['endDate'].value;
            let status = this.searchFormGroup.controls['status'].value;
         
           
                let datePayload = {};
                if(startDate !=null && endDate!=null){
                  datePayload['startDate'] = formatDate(
                      startDate,
                      'YYYY-MM-dd',
                      this.locale
                  );
                  datePayload['endDate'] = formatDate(
                      endDate,
                      'YYYY-MM-dd',
                      this.locale
                  );
                  }
                  else {
                  datePayload['startDate']=null;
                  datePayload['endDate']=null;
                  }
                datePayload['status']=status;
             console.log('datePayload',datePayload);
             const resp = await this.service.fetchRequestPost(
              'refillOrder/getRfOrdByDate',
              datePayload
          );
          this.Refillresp = resp;
          this.packingCompletedRefill = this.Refillresp;
          this.packingCompletedRefill = this.Refillresp.filter(ref => ref.status === 'Packing Completed');
          this.Refillresp = this.Refillresp.filter((ref)=>{
            return ref.orderType=="Packing" && ref.orderFor!=null && ref.status!="Refill" && ref.status!="Correction" && ref.status!="Refill Completed" && ref.status!="Closed" && ref.status != "Cancelled"
          });
          this.Refillresp.sort((a, b) => b.idRefillOrd - a.idRefillOrd);
        //     const Rfillresp = await this.service.fetchRequest(
        //       'refillOrder/getAllRefillOrder'
              
        //   );
          
        //   this.Refillresp = Rfillresp;
          console.log("Refillresp",this.Refillresp);
        
    
          res(this.Refillresp);   
         
          this.loading = false;
             
            });
   

  
  }
  protected filtergenies(){
    if(!this.stallData){
      return
    }
    let search = this.genieControl.value;
    if (!search) {
      this.filteredstallData = this.stallData.slice();
       return;
   } else {
       search = search.toLowerCase();
   }
   this.filteredstallData = this.stallData.filter(
    (bank) =>{
      return bank.stallid.toString().toLowerCase().includes(search) ||  bank.name.toLowerCase().indexOf(search.toString()) > -1 ;
    });
  }
  protected filterproducts() {
      // if (!this.filteredSuppItems) {
      //     return;
      // }
      // get the search keyword
      let search = this.itemControl.value;
      if (!search) {
         this.filteredSuppItems = this.allItemsList.slice();
        //  this.refillSlotItemformGroup.controls['prodId'].setValue(this.slotTableItem.prodId)
          return;
      } else {
          search = search.toLowerCase();
      }

      // filter the banks
      this.filteredSuppItems = this.allItemsList.filter(
          (bank) =>
              bank.prodName.toLowerCase().indexOf(search.toString()) > -1 || 
          bank.prodId.toString().indexOf(search) > -1
      );
  }
  OpenPriceModal(popup) {
      this.modalReference = this.dialog.open(popup);
  }
  OnSelectSupplier(value) {
      this.filtereditems = [];
      this.filtereditems = this.supplierItemsList.filter((data) => {
          return data.supid == parseInt(value);
      });
      this.productsList = this.filtereditems;
  }
  async CreateMergePO() {
      const poname = this.newPoName.value;
      const posList = this.posList.value;
      if (posList?.length > 0) {
          let listOfIds = [];
          posList.forEach((po) => {
              listOfIds.push(po.adhocpoid);
          });
          const payload = {
              poDescription: poname,
              poIdsList: listOfIds,
          };
          const resp = await this.service.fetchRequestPost(
              'adhocpoitem/mergePos',
              payload
          );
          this.modalReference.close();
          this.newPoName.reset();
          this.posList.reset();
          this.getAllDetails(0, 0, '');
      }
  }
  // onSelectProducts(value) {
  //     console.log(value);
  //     let uom = '';

  //     let rateCardPrice;
  //     // logic from getting price from purchase rate card
  //     this.filtereditems.forEach((supItem) => {
  //         if (supItem.productId === value) {
  //             uom = supItem.uom;
  //             this.adhocItemformGroup.controls['uom'].setValue(uom);

  //             rateCardPrice = supItem?.purchasePrice;
  //         }
  //     });
  //     let adhocpoitems = JSON.parse(JSON.stringify(this.adhocPoItems));
  //     const adhocpo = JSON.parse(JSON.stringify(this.allAdhocPo));
  //     console.log(adhocpo);
  //     // for getting latest purchase date, latest purchase price, latest purchased at
  //     adhocpo.forEach((po) => {
  //         adhocpoitems.forEach((poitem: AdhocPoItems) => {
  //             if (poitem.adhocpoid === po.adhocpoid){
  //                 poitem.status=po.status;
  //                 poitem.adhocdate = po.date;
  //                 poitem['purchasedfrom'] = po.purchasedat;
  //             }

  //         });
  //     });
  //     // date filtering and ingredient
  //     adhocpoitems = adhocpoitems.filter((poitem) => {
  //         return poitem.productlist === value + '' && poitem.status=="Completed";
  //     });
  //     adhocpoitems.forEach((po)=>{
  //         this.suppliersList.forEach((sup)=>{
  //             if(po.purchasedfrom){
  //                 if(parseInt(po.purchasedfrom)==sup.supId){
  //                     po.purchasedfrom = sup.name;
  //                 }
  //             }

  //         })
  //     })
  //     console.log(adhocpoitems);
  //     const result = adhocpoitems.sort(
  //         (a: any, b: any) =>
  //             new Date(b.adhocdate).getTime() -
  //             new Date(a.adhocdate).getTime()
  //     )[0];
  //     console.log(result);

  //     let latestObj = result;
  //     this.adhocItemformGroup.patchValue({
  //         lastpddate: latestObj?.adhocdate,
  //         lastpdfrom: latestObj?.purchasedfrom,
  //         lastpdprice: latestObj?.price,
  //     });

  //     this.adhocItemformGroup.controls['price'].setValue(rateCardPrice);
  // }
  async OnUpdatePrice() {
      let salePrice = this.salePriceControl.value;
      if (salePrice) {
          let row = this.currentObj;
          let price = row.price;
          let uom = row.uom;
          let rateCardUOM = '';
          let payload = {};
          this.purchaseRateCardData.forEach((data) => {
              if (
                  data.itemId === parseInt(row.productlist) &&
                  uom === data.uom
              ) {
                  rateCardUOM = data.uom;
                  payload = data;
                  const finalPrice = row.finalprice;
                  const purcahsedQuantity = this.adhocItemformGroup.controls[
                      'purchasedquantity'
                  ].value;
                  let rateCardPrice = (finalPrice / purcahsedQuantity) * 1000;
                  payload['price'] = parseFloat(rateCardPrice.toFixed(3));
                  payload['salePercentage'] = salePrice;
                  console.log('rate card object:', payload);
              }
          });
          const resp = await this.service.fetchRequestPost(
              'purchaseratecard/createpurchaseratecard',
              payload
          );
          this.salePriceControl.reset();
          this.modalReference.close();
          // if (rateCardUOM === 'kgs' || rateCardUOM === 'l') {
          //     payload['price'] = price * 1000;
          // } else {
          //     payload['price'] = price;
          // }
      }
  }
  Cancel() {
      this.modalReference.close();
  }

  async onSearch() {
      let startDate = this.searchFormGroup.controls['startDate'].value;
      let endDate = this.searchFormGroup.controls['endDate'].value;
      let status = this.searchFormGroup.controls['status'].value;

          let datePayload = {};
          if(startDate !=null && endDate!=null){
          datePayload['startDate'] = formatDate(
              startDate,
              'YYYY-MM-dd',
              this.locale
          );
          datePayload['endDate'] = formatDate(
              endDate,
              'YYYY-MM-dd',
              this.locale
          );
          }
          else {
          datePayload['startDate']=null;
          datePayload['endDate']=null;
          }
          datePayload['status']=status;
       console.log('datePayload',datePayload);
       const resp = await this.service.fetchRequestPost(
        'refillOrder/getRfOrdByDate',
        datePayload
    );
    this.Refillresp = resp;
   console.log("Refillresp",this.Refillresp)
   if(this.user.role=="admin"){
    this.Refillresp = this.Refillresp.filter((ref)=>{
      return ref.orderType=="Packing" && ref.orderFor!=null && ref.status!="Refill" && ref.status!="Correction" && ref.status!="Refill Completed" && ref.status!="Closed" && ref.status != "Cancelled"
    });
  }
  else {
    this.Refillresp = this.Refillresp.filter((ref)=>{
      return ref.orderType=="Packing" && ref.createdBy==this.username && ref.orderFor!=null && ref.status!="Refill" && ref.status!="Correction" && ref.status!="Refill Completed" && ref.status!="Closed" && ref.status != "Cancelled"
    });
  }
    this.Refillresp.sort((a, b) => b.idRefillOrd - a.idRefillOrd);
    this.Refillresp.forEach((refill)=>{
      this.genieMangresp.forEach((genie)=>{
        if(refill?.orderFor=='Multiple'){
          let genieIdNames = refill?.geniesList.split(",");
          this.genieNamesList=[];
          this.genieNamesList=genieIdNames.map((num, index) => ({
            key:num,
            name:""// Or any other logic for generating names
        }));
   
    this.genieNamesList.forEach((obj)=>{
      this.genieMangresp.forEach((genie)=>{
        if(obj.key==genie.autoGenieId){
          obj.name = genie?.name;
          obj.keyname=`${genie.autoGenieId}-${genie.name}, `;
          
        }
      });

    })
    refill.genieNamesList = this.genieNamesList;
        }
      })
    });
     
    //   if (!status) {
    //       this.adhocPoData = this.adhocPoData.filter((event) => {
    //           return event.status != 'Completed';
    //       });
    //   }
    //   if (status) {
    //       this.adhocPoData = this.adhocPoData.filter((event) => {
    //           return event.status == status;
    //       });
    //   }
    //   if (paymentStatus) {
    //       this.adhocPoData = this.adhocPoData.filter((event) => {
    //           return event.paymentstatus === paymentStatus || event.paymentstatus ==null;
    //       });
    //   }
    //   console.log("adhoc", this.adhocPoData);
    
  }
  // async onStart(){
  //   this.voiceservice.start();

  //   console.log("text",this.voiceservice.text)
   
  //   if(this.voiceservice.text=="Next" || this.voiceservice.text=="next"){
  //     console.log("voiceserviecetext",this.voiceservice.text);
  //     this.OnNext(this.refillSlotTable,event)
  //   }
  // }
  // async onStop(){
  //   this.voiceservice.stop();
  // }
  // OpenMergePop(modal) {
  //     this.modalReference = this.dialog.open(modal);
  // }

  OnPricePerUOMChange(value) {
      console.log(value);
      let quantity = this.adhocItemformGroup.controls['quantity'].value;
      const finalValue = parseFloat(value.toFixed(2)) * quantity;
      console.log(finalValue);
      console.log(this.selectedRow);
      this.adhocItemformGroup.controls['finalprice'].setValue(
          parseFloat(finalValue.toFixed(2))
      );
  }
  async OnResetPress() {
      let data = this.poItemsTable.data;
      let adhocpoid: number = 0;
      data = data.filter((po) => {
          return po.available == true;
      });
      data.forEach((poitem) => {
          adhocpoid = poitem.adhocpoid;
      });
      console.log('data is ', data);

      let payload = {
          resetObjects: [],
      };
      data.forEach((obj) => {
          payload.resetObjects.push(obj.adhocpoitemid);
      });
      const saveResp = await this.service.fetchRequestPost(
          'adhocpoitem/resetavailable',
          payload
      );
      this.poItemsTable.data.forEach((item) => {
          item.available = false;
      });
      this.adhocPoData.forEach((po) => {
          if (po.adhocpoid === adhocpoid) po.availablePrice = 0;
      });
      console.log(saveResp);
  }
  OnFinalPriceChange(value) {
      let quantity = this.adhocItemformGroup.controls['quantity'].value;
      const pricePerUom = parseFloat(value.toFixed(2)) / quantity;
      this.adhocItemformGroup.controls['price'].setValue(
          parseFloat(pricePerUom.toFixed(2))
      );
  }
  OnPaidAmountEnter(value) {
      console.log(value);
      let paidAmount = value;
      let totalAmount = this.refillOrderFormGroup.controls['totalamount'].value;
      let balance = totalAmount - paidAmount;
      this.refillOrderFormGroup.controls['balance'].setValue(balance);
  }
  async OnAddToStock() {
      let row = this.currentObj;
      const date = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
      const payload = {};
      payload['adhocpoitemid'] = row.adhocpoitemid;
      payload['itemid'] = parseInt(row.productlist);
      payload['itemname'] = row.prodName;
      payload['uom'] = row.uom;
      payload['availablequantity'] = parseFloat(
          row.purchasedquantity.toFixed(2)
      );
      payload['isStockAdded'] = true;
      payload['purchaseddate'] = date;
      payload['category'] = row.category;
      console.log(payload);
      const resp = await this.service.fetchRequestPost(
          'adhocpo/addtoinventory',
          payload
      );
      row.isStockAdded = true;
      row.stockButton = 'Already Added';
      this.isMatDrawerOpened = false;
      this.isAdhocDetails = false;
      this.isAdhocItemDetails = false;
  }
  OnQuantityEnter(value) {
      this.adhocItemformGroup.controls['purchasedquantity'].setValue(value);
  }
  // CancelRow(row: AdhocPoItems) {
  //     this.columnsSchema.forEach((col) => {
  //         if (col.key === 'uom') {
  //             col.isColumnActive = false;
  //         }
  //     });
  //     row.isEdit = false;
  //     row.quantity = this.oldValueRow.quantity;
  //     row.price = this.oldValueRow.price;
  //     row.finalprice = this.oldValueRow.finalprice;
  //     row.uom = this.oldValueRow.uom;
  // }
  OnEditRefill(row) {
      // this.poCategory = row?.category;
      this.isgenieLocation = false;
      this.editmode = true;
      this.row = row;
     event.stopPropagation();
      this.idRefillOrd = row.idRefillOrd;
      this.isAdhocItemDetails = false;
      this.isMatDrawerOpened = true;
      this.isAdhocDetails = true;
      this.SelectedContact = parseInt(row.contactPerson);
      this.stallOperator.find((obj)=>{
        if(this.SelectedContact == obj.stalloperatorid){
            return this.Contact = this.SelectedContact + '-' + obj.name;
        }
      });
      console.log("SelectedContact",this.Contact)
        this.refillOrderFormGroup.patchValue({
        genieId: row.genieId,
        genieLocation: row.genieLocation,
        assignedTo: row.assignedTo,
        packedBy: row.packedBy,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
       
        status: row.status,
        comments: row.comments,
        contactPerson: this.Contact,
        orderType: row?.orderType,
        orderFor: row?.orderFor
      });
      this.refillOrderFormGroup.controls['genieId'].disable();
      this.refillOrderFormGroup.controls['genieLocation'].disable();
      this.refillOrderFormGroup.controls['contactPerson'].disable();
      this.refillOrderFormGroup.controls['orderType'].disable();
      this.refillOrderFormGroup.controls['orderFor'].disable();
      this.headerStatus = row.status;
      this.totalquantities = row.totalPKQ+row.totalRefillQty+row.totalReturnQty;

      const rowStatus = row.status;

      if (rowStatus === 'Open') {
        this.filteredStatusData = ['Open','Packing'];
      } else if (rowStatus === 'Packing') {
        this.filteredStatusData = ['Packing','Packing Completed'];
      } else if (rowStatus === 'Packing Completed') {
        this.filteredStatusData = ['Packing Completed','In Transit'];
      } 
      else if (rowStatus === 'In Transit') {
        this.filteredStatusData = ['In Transit','Correction'];
      } 
      else if (rowStatus === 'Correction') {
        this.filteredStatusData = ['Correction','Refill'];
      } 
       else if (rowStatus === 'Refill') {
        this.filteredStatusData = ['Refill','Refill Completed'];
      }
      else if (rowStatus === 'Refill Completed') {
        this.filteredStatusData = ['Refill Completed','Return Validation'];
      }
      else if (rowStatus === 'Return Validation') {
        this.filteredStatusData = ['Return Validation','Return Completed'];
      }
      else if (rowStatus === 'Return Completed') {
        this.filteredStatusData = ['Return Completed','Closed'];
      }
      else if (rowStatus === 'Closed') {
        this.filteredStatusData = ['Closed','Cancelled'];
      }
      else {
        // Set the default options if no condition is met
        this.filteredStatusData = this.statusData.slice();
      }
    //   this.refillOrderFormGroup.controls['comments'].disable();

  }
  OnEditRow(row,index:number) {
    event.stopPropagation();
        this.slotTableItem = row;
      this.isMatDrawerOpened = true;
      this.isAdhocItemDetails = true;
      this.isAdhocDetails = false;
      this.refillSlotId = row.refillSlotId;

      // //for setting packing true or received true

      this.refillSlotItemformGroup.patchValue({
            refillOrderId: row.refillOrderId,
        refillSlotId: row.refillSlotId,
        prodId: row.prodId,
        prodName: row.prodName ,
          uom: row.uom,
          maxQty: row.maxQty, 
          refillQty: row.refillQty,
          correctionQty: row.correctionQty,
          status: row.status,
          updatedDateTime:row.updatedDateTime,
          rackId: row.rackId,
          slotId: row.slotId,
          packingQty: row.packingQty,
          packingCheck: row.packingCheck,
          refillCheck: row.refillCheck,
          corrected:row.corrected
      });
      
    //   this.refillSlotItemformGroup.controls['prodImage'].setValue(`${this.refillSlotItemformGroup.controls['prodId'].value}.webp`);
    //   console.log("refillSlotItemformGroup",this.refillSlotItemformGroup.controls['prodImage'])
    // 
      this.refillSlotItemformGroup.controls['refillOrderId'].disable();
      this.refillSlotItemformGroup.controls['maxQty'].disable();
      this.refillSlotItemformGroup.controls['rackId'].disable();
      this.refillSlotItemformGroup.controls['slotId'].disable();
      this.refillSlotItemformGroup.controls['packingCheck'].disable();
      this.refillSlotItemformGroup.controls['refillCheck'].disable();
      this.refillSlotItemformGroup.controls['correctionQty'].disable();
      this.refillSlotItemformGroup.controls['corrected'].disable();
      this.Refillresp.forEach((resp)=>{
        if(resp.idRefillOrd==row.refillOrderId){
            if(resp.status=='Packing'){
                this.refillSlotItemformGroup.controls['refillQty'].disable();
            }
            else if(resp.status=='Refill'){
                this.refillSlotItemformGroup.controls['packingQty'].disable();
            }
            else{
                this.refillSlotItemformGroup.controls['refillQty'].disable();
                this.refillSlotItemformGroup.controls['packingQty'].disable();
            }
        }
        
       
      });
      let form = this.refillSlotItemformGroup.getRawValue();
      form['prodImage'] = parseInt(form.prodId);
      form['prodImage'] = (`${form['prodImage']}.webp`);
      this.prodImage = form.prodImage
    this.SlotId = row.rackId+""+row.slotId
    this.selectedRowIndex = index;
    //   this.onRackChange();
    //   this.onSlotChange();
    //   this.refillSlotItemformGroup.controls['rackId'].setValue(row.rackId);
    //   this.refillSlotItemformGroup.controls['slotId'].setValue(row.slotId)
    // Recalculate maxHighlightedRows based on the new selected row
   
    //   this.suppItems.forEach((item)=>{
    //     item.prodImage = `${item.productId}.webp`;
    //   })
      // this.adhocItemformGroup.controls['category'].disable();
      // this.adhocItemformGroup.controls['productlist'].disable();
      // this.adhocItemformGroup.controls['quantity'].disable();
  }
  shouldHighlightRow(index: number, data,status) {
    // console.log("highloteData",data);
    return data.highliteindex <=5;
   
  }

  
  async onProductSelectionChange(selectedProductId: any){
    this.prodImage = `${selectedProductId}.webp`;
   
//    this.refillSlotItemformGroup.controls['prodId'].setValue(selectedProductId);
    
        
        
  }
  async OnRefresh(){
    let form = this.refillOrderFormGroup.getRawValue();
    if(form?.orderType=='Packing'){
    if(form.orderFor=='Single'){
      let Payload={
        "genieId": form.genieId,
      "idRefillOrd" : this.idRefillOrd,
      "status":  form?.orderType,
      "createdBy" : this.username,
      "assignedTo" : "",
        "packedBy" : "",
        "updatedBy": "",
        "comments": "",
        "genieLocation": "",
        "contactPerson": "",
        "keyInfo": "",
        "type" : 'auto',
        
      "orderType": form?.orderType,
      "orderFor": form?.orderFor,
      "geniesList": null,
      "refillPackOrder": null,
      "vendorId": this.vendorId
      }
  
      try {
        const updateresp = await this.service.fetchRequestPost(
          'refillslots/getMappingInvData',
          Payload
        );
      
        this.mappingSlotResp = updateresp;
      
        // Check if updateresp contains the expected data or if it's an error response
        if (updateresp) {
          // Handle the case where data has been refreshed successfully
          this.responseMessage = 'Data has been Refreshed';
        } 
      }
      catch (error) {
        // Handle the error
        console.error('An error occurred:', error);
        this.responseMessage = 'An error occurred while refreshing data';
      }
    }
   else if(form.orderFor=='Multiple'){
    let Payload={
      "genieId": form.genieId,
    "idRefillOrd" : this.idRefillOrd,
    "status":  form?.orderType,
    "createdBy" : this.username,
    "assignedTo" : "",
      "packedBy" : "",
      "updatedBy": "",
      "comments": "",
      "genieLocation": "",
      "contactPerson": "",
      "keyInfo": "",
      "type" : 'auto',
      
    "orderType": form?.orderType,
    "orderFor": form?.orderFor,
    "geniesList": form?.genieList,
    "refillPackOrder": null,
    "vendorId": this.vendorId
    }

    try {
      const updateresp = await this.service.fetchRequestPost(
        'refillOrder/packingMultipleOrRefresh',
        Payload
      );
    
      this.mappingSlotResp = updateresp;
    
      // Check if updateresp contains the expected data or if it's an error response
      if (updateresp) {
        // Handle the case where data has been refreshed successfully
        this.responseMessage = 'Data has been Refreshed';
      } 
    }
    catch (error) {
      // Handle the error
      console.error('An error occurred:', error);
      this.responseMessage = 'An error occurred while refreshing data';
    }
   }
  }
  else if(form?.orderType=='Refill'){
    let Payload={
      "genieId": form.genieId,
    "idRefillOrd" : this.idRefillOrd,
    "status":  form?.orderType,
    "createdBy" : this.username,
    "assignedTo" : "",
      "packedBy" : "",
      "updatedBy": "",
      "comments": "",
      "genieLocation": "",
      "contactPerson": "",
      "keyInfo": "",
      "type" : 'auto',
      
    "orderType": form?.orderType,
    "orderFor": null,
    "geniesList": null,
    "refillPackOrder": form?.idRefillOrd,
    "vendorId": this.vendorId
    }

    try {
      const updateresp = await this.service.fetchRequestPost(
        'refillslots/getMappingInvData',
        Payload
      );
    
      this.mappingSlotResp = updateresp;
    
      // Check if updateresp contains the expected data or if it's an error response
      if (updateresp) {
        // Handle the case where data has been refreshed successfully
        this.responseMessage = 'Data has been Refreshed';
      } 
    }
    catch (error) {
      // Handle the error
      console.error('An error occurred:', error);
      this.responseMessage = 'An error occurred while refreshing data';
    }
  }
       
      
        this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
            duration: 2 * 1000,
        });
       await this.getRefillOrders();
        this.Refillresp.forEach((refill)=>{
          this.genieMangresp.forEach((genie)=>{
            if(refill?.orderFor=='Multiple'){
              let genieIdNames = refill?.geniesList.split(",");
              this.genieNamesList=[];
              this.genieNamesList=genieIdNames.map((num, index) => ({
                key:num,
                name:""// Or any other logic for generating names
            }));
       
        this.genieNamesList.forEach((obj)=>{
          this.genieMangresp.forEach((genie)=>{
            if(obj.key==genie.autoGenieId){
              obj.name = genie?.name;
              obj.keyname=`${genie.autoGenieId}-${genie.name}, `;
              
            }
          });
    
        })
        refill.genieNamesList = this.genieNamesList;
            }
          })
        });

  }
  async SaveAdhocPoItemDetails(data, refillSlotId) {
      this.responseMessage = '';
      console.log(refillSlotId);
      let form = this.refillSlotItemformGroup.getRawValue();
    
    //   if(form.packingCheck
    //     === null || form.packingCheck === '') {
    //       form.packingCheck = false;
    //   }
    //   if(form.refillCheck
    //     === null || form.refillCheck === '') {
    //       form.refillCheck = false;
    //   }
     

    //   const updateresp = await this.service.postResponseAsText(
    //       'adhocpoitem/createadhocpoitem',
    //       form
    //   );
      
      this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
          duration: 2 * 1000,
      });

    //   this.refillSlotItemformGroup.reset();
  }

  OnAdhocClick() {
      this.isMatDrawerOpened = true;
      this.isAdhocDetails = true;
      this.editmode = false;
     this.refillOrderFormGroup.reset;
      this.refillOrderFormGroup.controls['genieId'].enable();
      this.refillOrderFormGroup.controls['genieLocation'].enable();
      this.refillOrderFormGroup.controls['contactPerson'].enable();
      // this.adhocItemformGroup.enable();
      this.refillOrderFormGroup.controls['status'].setValue('Open');
      this.isgenieLocation = true;
    //   this.refillOrderFormGroup.controls['paymentstatus'].setValue('Not Paid');
    //   this.refillOrderFormGroup.controls['vendorId'].setValue(this.vendorId);
    //   this.refillOrderFormGroup
    //       .get('date')
    //       .setValue(new Date().toISOString().split('T')[0]);
  }
  async SaveAdhocPoDetails(idRefillOrd) {
      let form = this.refillOrderFormGroup.getRawValue();
      
      form['idRefillOrd'] = idRefillOrd;
      form['vendorId'] = this.vendorId
        form['type'] = "manual"
     
      form.genieId = parseInt(form.genieId);
      console.log("Refill",form.genieId)
      if (form.status != 'Completed') {
          const updateresp = await this.service.postResponseAsText(
              'refillOrder/createRefillOrder',
              form
          );
          if(updateresp){
            this.responseMessage="Data Saved Successfully";
            this._snackBar.open(this.responseMessage, '', { duration: 2000 });
           
          }
          else{
            this.responseMessage="Error while Saving Data";
            this._snackBar.open(this.responseMessage, '', { duration: 2000 });
          }
         
        
      }
    
   await this.getRefillOrders();
    }
  SortIngr(rcpIngr) {
      rcpIngr.sort((a, b) => {
          if (a?.prodName && b?.prodName) {
              const nameA = a.prodName.toUpperCase(); // ignore upper and lowercase
              const nameB = b.prodName.toUpperCase(); // ignore upper and lowercase

              if (nameA < nameB) {
                  return -1;
              }
              if (nameA > nameB) {
                  return 1;
              }
          }
          // names must be equal
          return 0;
      });
      return rcpIngr;
  }
 async OnExport() {
    console.log("refill",this.row);
    // await this.getRefillSlots(this.row.idRefillOrd);

    this.filteredSlots = this.slotsresp.filter(slot => slot.refillOrderId == this.row.idRefillOrd).sort((a, b) => 
    { const rackIdA = a.rackId;
        const rackIdB = b.rackId;
    
        if (rackIdA !== rackIdB) {
          return ( rackIdA - rackIdB );
        } else {
          const slotIdA = a.slotId;
          const slotIdB = b.slotId;
          return (slotIdA - slotIdB);
        }});
   

    // console.log(poData);
      // this.playAudio();
    //   let totalAmount = 0;
    //   data.forEach((item) => {
    //       totalAmount += parseFloat(item.finalprice.toFixed(2));
    //   });

    //   data.forEach((row) => {
    //       if (row.uom == 'gms' || row.uom == 'ml') {
    //           if (row.purchasedquantity >= 1000) {
    //               row.purchasedquantity = row.purchasedquantity / 1000;
    //               row.purchasedquantity = row.purchasedquantity.toFixed(2);
    //               if (row.uom == 'gms') row.uom = 'kgs';
    //               else if (row.uom == 'ml') row.uom = 'L';
    //           } else {
    //               row.purchasedquantity = row.purchasedquantity;
    //           }
    //       } else {
    //           row.purchasedquantity = row?.purchasedquantity;
    //       }
    //   });
    //   console.log(poData.description);
    const createdDate = new Date(this.row.createdDateTime);
const formattedDate = `${createdDate.toLocaleDateString()} ${createdDate.toLocaleTimeString()}`;
const mappingPayload = {
    "genieId": this.row.genieId,
    "refillOrdId" :this.row.idRefillOrd,
    "createdBy" : this.row.createdBy,
   
    "vendorId": this.row.vendorId
}
const updateresp = await this.service.fetchRequestPost(
    'refillslots/getMappingInvData',
    mappingPayload
);
this.mappingSlotResp = updateresp;
      let docDefinition = {
         
          content: [
              // Previous configuration
              {
                  text: `Packing Order: ${this.row.idRefillOrd}, Description: ${this.row.genieName}`,
                  fontSize: 17,
              },
              {
                  text: `packing Order Date: ${formattedDate }`,
                  fontSize: 17,
              },
              {
                text: `Total Items: ${this.row.ItemLength}, Status: ${this.row.status}`,
                fontSize: 17,
            },
            {
                text: `Total Packing Qty: ${this.row.totalPKQ}`
                ,
                fontSize: 17,
            },
              {
                  table: {
                      headerRows: 1,
                      body: [
                          [
                              'SNo',
                              'Rack Id/SlotId',
                              'Product',
                              'Max Qty',
                              'Avbl/Resv Qty',
                              'Packing Qty',
                              
                          ],
                          ...(this.filteredSlots || []).map((p, i) => [
                            i + 1,
                            p?.rackId+""+p?.slotId,
                            p?.prodId + '-' + p?.prodName + '-' + p?.uom + '-' + p?.salePrice,
                            p?.maxQty,
                            p?.availableQty + '/' + p?.reservedQty,
                            p?.packingQty,
                          
                          ]),
                      ],
                  },
              },
          ],
      };
      console.log(docDefinition);
      pdfMake
          .createPdf(docDefinition)
          .download(
              this.row.idRefillOrd.toString() +
                  '-' +
                  this.row.genieName +
                  '.pdf'
          );
  }
  OnExportByQuantity(modal) {
      this.modalReference = this.modalService.open(modal);
      this.isQuantity = true;
  }
  OnCloseItem() {
    
      this.isAdhocDetails = false;
      this.isAdhocItemDetails = false;
      this.adhocpoitemid = 0;
      this.adhocpoid = 0;
      this.isMatDrawerOpened = false;
    
      this.refillOrderFormGroup.reset();
      this.refillSlotItemformGroup.reset();
      this.RefillCreateFormGroup.reset();
      // this.modalReference.close();
      this.currentObj = {};
      
      // this.packingref.close();
  
  }
  OnClose(reason) {
      this.modalReference.close(reason);
      this.purchaseorder.reset();
    
      this.category.reset();
      this.available.reset();
      this.isQuantity = false;
  }
  onSavePopup() {
      this.columnsSchema.forEach((col) => {
          if (col.key === 'uom') {
              col.isColumnActive = false;
          }
      });
      let purchaseorder = this.purchaseorder.value;
      let category = this.category.value;
      let available = this.available.value;
      let items = [];
      if (available != 'All') {
          items = this.adhocPoItems.filter((item) => {
              return item.available + '' === available;
          });
      } else {
          items = this.adhocPoItems;
      }

      if (purchaseorder && category) {
          if (category === 'All') {
              items = items.filter((item) => {
                  return item.adhocpoid === parseInt(purchaseorder);
              });
          } else {
              let temp = [];
              for (let key in items) {
                  if (category != 'All') {
                      if (
                          items[key].adhocpoid === parseInt(purchaseorder) &&
                          items[key].category === category
                      ) {
                          temp.push(items[key]);
                      }
                  }
              }
              items = temp;
          }

          if (items) {
              this.modalReference.close();
              // items = this.SortItems(items);
              let adhocData = this.adhocPoData.filter((item) => {
                  return item.adhocpoid === parseInt(purchaseorder);
              });

              if (this.isQuantity) {
                  items = items.sort((a, b) => {
                      return b?.quantity - a?.quantity;
                  });
                  this.OnPdfPressQuantity(items, adhocData);
              } else {
                  items = items.sort((a, b) => {
                      return b?.finalprice - a?.finalprice;
                  });
                  this.OnPdfPress(items, adhocData);
              }
          }
      }
      this.purchaseorder.reset();
      this.category.reset();
      this.available.reset();
      this.isQuantity = false;
  }
  async onSelectall(event){
    this.slotsresp.forEach((slot)=>{
        if(slot.refillOrderId==this.SelectallStatus.idRefillOrd){
            this.selectedData = slot.refillOrderId;
        }
    });
    this.SelectAllPayload = {
            
        "refillOrdId": this.selectedData,
        "status": this.SelectallStatus.status,
        "changeTo":event.checked
    
}
   
    const resp = await this.service.fetchRequestPost(
        'refillslots/updateChecklist',
        this.SelectAllPayload 
    );
   console.log("resp",resp);
  
   await this.getRefillSlots(this.SelectallStatus);
 
   this.Refillresp.forEach((refillobj) => {
    refillobj['slotItems'] = [];
   
    this.slotsresp.forEach((slotitem) => {
        if (refillobj.idRefillOrd === slotitem.refillOrderId) {
          refillobj.slotItems.push(slotitem);
          // refillobj.childActive = false;
          refillobj.isEdit = false;
        }
    });

});
this.slotsresp.forEach((slotitem)=>{
    this.suppItems.forEach((prod)=>{
          if(slotitem.prodId== prod.productId && prod.endDate==null){
              slotitem['salePrice'] =  prod.salePrice
          }
      });
  });

  this.Refillresp.forEach((obj) => {
    if (obj.idRefillOrd === this.selectedData) {
        const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
        this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
        this.mobilePoItems = obj.slotItems;
        obj.childActive = true;
    }
 
});

// if(this.SelectallStatus.status=="Correction"){
//     this.editingMode = false;
//     let Payload={
//       "genieId": this.SelectallStatus.genieId,
//     "refillOrdId" : this.selectedData,
//     "status" : this.SelectallStatus.status
//     }

  
//       const Refreshresp = await this.service.fetchRequestPost(
//         'refillslots/getMappingInvData',
//         Payload
//       );
    
//       this.mappingSlotResp = Refreshresp;
//       console.log("mappingSlotResp",this.mappingSlotResp);
//           this.slotsresp.forEach((obj)=>{
//               this.mappingSlotResp.forEach((map)=>{
//                   if(obj.refillOrderId == map.refillOrderId && obj.refillSlotId== map.refillSlotId){
//                       return this.mappingInvObj = map
//                   }
//               })
//           })
//    }
  }
  async OnCorrectionCheck(data,event){
    this.currentObj = data;
    this.refillSlotId
    = data.refillSlotId;
  data.corrected = event.checked    

const updateresp = await this.service.postResponseAsText(
        'refillslots/createRefillSlots',
        data
    );
    this.SingleSlotResp = updateresp;
  //  await this.getRefillOrders();
  
   await this.getRefillSlots(this.SelectallStatus);
  this.Refillresp.forEach((refillobj) => {
      refillobj['slotItems'] = [];
     
      this.slotsresp.forEach((slotitem) => {
          if (refillobj.idRefillOrd === slotitem.refillOrderId) {
            refillobj.slotItems.push(slotitem);
            // refillobj.childActive = false;
            refillobj.isEdit = false;
          }
      });
  
  });

  this.slotsresp.forEach((slotitem)=>{
    this.suppItems.forEach((prod)=>{
          if(slotitem.prodId== prod.productId && prod.endDate==null){
              slotitem['salePrice'] =  prod.salePrice
          }
      });
  });
    this.Refillresp.forEach((obj) => {
      if (obj.idRefillOrd === data.refillOrderId) {
          if(obj.status=='Correction'){
              let index=0;
              obj.slotItems.forEach((packobj)=>{
              if(packobj.corrected==false){
                  packobj.highliteindex = index+1;
                  index++;
              }
              else packobj.highliteindex=0;
              });
          }
          const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
          this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
          this.mobilePoItems = obj.slotItems;
          obj.childActive = true;
      }
   
  });


  
  }
  updateQuantities(table) {

  }
async OnPackingCompletedCheck(data,event) {
  // let diffQty = this.diffQty.getRawValue();
  
  if(event.checked===true){
    data.packingQty += data.diffQty;
    data['packingCompletedCheck']= true;
   
    const updateresp = await this.service.postResponseAsText(
      'refillslots/createRefillSlots',
      data
  );
  this.SingleSlotResp = updateresp;
//  await this.getRefillOrders();
 

  }
  else data['packingCompletedCheck'] = false;
  await this.getRefillSlots(this.SelectallStatus);

this.Refillresp.forEach((refillobj) => {
    refillobj['slotItems'] = [];
   
    this.slotsresp.forEach((slotitem) => {
        if (refillobj.idRefillOrd === slotitem.refillOrderId) {
          if(data.refillSlotId==slotitem.refillSlotId){
            slotitem['packingCompletedCheck']=event.checked
           
            // slotitem.diffduppQty = slotitem.emptyQty-slotitem.packingQty;

          }
          slotitem.diffQty = slotitem.emptyQty-slotitem.packingQty;
          refillobj.slotItems.push(slotitem);
          // refillobj.childActive = false;
          refillobj.isEdit = false;
        }
    });

});
this.slotsresp.forEach((slotitem)=>{
    this.suppItems.forEach((prod)=>{
          if(slotitem.prodId== prod.productId && prod.endDate==null){
              slotitem['salePrice'] =  prod.salePrice
          }
      });
  });

  this.Refillresp.forEach((obj) => {
    if (obj.idRefillOrd === data.refillOrderId) {
        if(obj.status=='Packing'){
            let index=0;
            obj.slotItems.forEach((packobj)=>{
            if(packobj.packingCheck==false){
                packobj.highliteindex = index+1;
                index++;
            }
            else packobj.highliteindex=0;
            });
        }
        const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
        this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
        this.mobilePoItems = obj.slotItems;
        obj.childActive = true;
    }
 
});
}
async OnPackingNextCheck(data,event) { //duplicate for command next
  this.currentObj = data;
  this.refillSlotId
  = data.refillSlotId;
 
  data.packingCheck = event.checked;
  if(this.command='next'){
    data.packingCheck = false
  }

// if(event.checked==true) {
  
// if(data.packingQty==0) data.packingQty = parseInt(data.diffQty);
// else if(data.packingQty != 0) data.packingQty += data.diffQty;
// data.returnQty = data.packingQty;
// } 
let maxPackingQty = data.maxQty;    
if (data.packingQty > maxPackingQty) {
  // If entered refill quantity is more than packing quantity, reset to packing quantity
  // table.refillQty = maxRefillQty;
  // You can also show a message or perform other actions to inform the user
 alert('Packing quantity cannot be more than Max quantity.');
 await this.getRefillSlots(this.SelectallStatus);
 this.Refillresp.forEach((refillobj) => {
     refillobj['slotItems'] = [];
    
     this.slotsresp.forEach((slotitem) => {
         if (refillobj.idRefillOrd === slotitem.refillOrderId) {
          slotitem.diffQty = slotitem.emptyQty-slotitem.packingQty;
           refillobj.slotItems.push(slotitem);
          
           // refillobj.childActive = false;
           refillobj.isEdit = false;
         }
     });
 
 });


   this.Refillresp.forEach((obj) => {
     if (obj.idRefillOrd === data.refillOrderId) {
       const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
         this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
         this.mobilePoItems = obj.slotItems;
         obj.childActive = true;
     }
  
 });
 return;
}
if(data.packingQty <= maxPackingQty) {
  const updateresp = await this.service.postResponseAsText(
    'refillslots/createRefillSlots',
    data
);
this.SingleSlotResp = updateresp;
}

  
//  await this.getRefillOrders();
 await this.getRefillSlots(this.SelectallStatus);
this.Refillresp.forEach((refillobj) => {
    refillobj['slotItems'] = [];
   
    this.slotsresp.forEach((slotitem) => {
        if (refillobj.idRefillOrd === slotitem.refillOrderId) {
          slotitem.diffQty = slotitem.emptyQty-slotitem.packingQty;
          refillobj.slotItems.push(slotitem);
          // refillobj.childActive = false;
          refillobj.isEdit = false;
        }
    });

});
this.slotsresp.forEach((slotitem)=>{
    this.suppItems.forEach((prod)=>{
          if(slotitem.prodId== prod.productId && prod.endDate==null){
              slotitem['salePrice'] =  prod.salePrice
          }
      });
  });

  this.Refillresp.forEach((obj) => {
    if (obj.idRefillOrd === data.refillOrderId) {
        if(obj.status=='Packing'){
            let index=0;
            obj.slotItems.forEach((packobj)=>{
            if(packobj.packingCheck==false){
                packobj.highliteindex = index+1;
                index++;
            }
            else packobj.highliteindex=0;
            });
        }
        const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
        this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
        this.mobilePoItems = obj.slotItems;
        obj.childActive = true;
    }
 
});

}
 async onDiffQtyChange(table){
  if (table.diffQty === 0) {
    // table.packingCheck = true;
    this.OnPackingCheck(table, { checked: true });
  }
 }
  async OnPackingCheck(data,event) {
      this.currentObj = data;
      this.refillSlotId
      = data.refillSlotId;
     
      data.packingCheck = event.checked;
   
    if(event.checked==true) {
      
    if(data.packingQty==0) data.packingQty = parseInt(data.diffQty);
    else if(data.packingQty != 0) data.packingQty += data.diffQty;
    data.returnQty = data.packingQty;
  } 
    let maxPackingQty = data.maxQty;    
    if (data.packingQty > maxPackingQty) {
      // If entered refill quantity is more than packing quantity, reset to packing quantity
      // table.refillQty = maxRefillQty;
      // You can also show a message or perform other actions to inform the user
     alert('Packing quantity cannot be more than Max quantity.');
     await this.getRefillSlots(this.SelectallStatus);
     this.Refillresp.forEach((refillobj) => {
         refillobj['slotItems'] = [];
        
         this.slotsresp.forEach((slotitem) => {
             if (refillobj.idRefillOrd === slotitem.refillOrderId) {
              slotitem.diffQty = slotitem.emptyQty-slotitem.packingQty;
               refillobj.slotItems.push(slotitem);
              
               // refillobj.childActive = false;
               refillobj.isEdit = false;
             }
         });
     
     });
   
   
       this.Refillresp.forEach((obj) => {
         if (obj.idRefillOrd === data.refillOrderId) {
           const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
             this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
             this.mobilePoItems = obj.slotItems;
             obj.childActive = true;
         }
      
     });
     return;
    }
    if(data.packingQty <= maxPackingQty) {
      const updateresp = await this.service.postResponseAsText(
        'refillslots/createRefillSlots',
        data
    );
    this.SingleSlotResp = updateresp;
    }
  
      
    //  await this.getRefillOrders();
     await this.getRefillSlots(this.SelectallStatus);
    this.Refillresp.forEach((refillobj) => {
        refillobj['slotItems'] = [];
       
        this.slotsresp.forEach((slotitem) => {
            if (refillobj.idRefillOrd === slotitem.refillOrderId) {
              slotitem.diffQty = slotitem.emptyQty-slotitem.packingQty;
              if(slotitem.diffQty==0) slotitem.packingCheck=true;
              refillobj.slotItems.push(slotitem);
              // refillobj.childActive = false;
              refillobj.isEdit = false;
            }
        });
    
    });
    this.slotsresp.forEach((slotitem)=>{
        this.suppItems.forEach((prod)=>{
              if(slotitem.prodId== prod.productId && prod.endDate==null){
                  slotitem['salePrice'] =  prod.salePrice
              }
          });
      });

      this.Refillresp.forEach((obj) => {
        if (obj.idRefillOrd === data.refillOrderId) {
            if(obj.status=='Packing'){
                let index=0;
                obj.slotItems.forEach((packobj)=>{
                if(packobj.packingCheck==false){
                    packobj.highliteindex = index+1;
                    index++;
                }
                else packobj.highliteindex=0;
                });
            }
            const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
            this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
            this.mobilePoItems = obj.slotItems;
            obj.childActive = true;
        }
     
    });
   
  }
  async OnRefillCheck(refilldata,data,event) {
    let refillQty = data.refillQty;
  
    this.currentObj = data;
    this.refillSlotId
    = data.refillSlotId;
   data.refillCheck = event.checked;
   data.corrected = event.checked;
   const Payload = {
    
      "refillSlotId": data.refillSlotId,
      "rackId": data.rackId,
      "slotId": data.slotId,
      "genieId": refilldata.genieId,
      "itemId": data.prodId,
      "refillOrdId":data.refillOrderId,
      "refillPackId": refilldata.refillPackOrder,
      "refillQty": data.refillQty,
      "correctionQty": data.correctionQty,
      "refillPackOrdType": this.refillPackObj.orderFor
  
   }
  //  if(event.checked){
  //  const Payload = {
  //   "genieId": refilldata.genieId,
  //   "rackId": data.rackId,
  //   "slotId":data.slotId,
  //   "refillOrdId": data.refillOrderId,
  //   "newAvblQty": data.refillQty
  //  }
//     this.refillSlotItemformGroup.patchValue({
//       refillOrderId: data.refillOrderId,
//   refillSlotId: data.refillSlotId,
//   prodId: data.prodId,
//   prodName: data.prodName,
//     uom: data.uom,
//     maxQty: data.maxQty,
//     refillQty: parseInt(data.refillQty),
//     status: data.status,
//     updatedDateTime:data.updatedDateTime,
//     rackId: data.rackId,
//     slotId: data.slotId,
//     packingQty: parseInt(data.packingQty),
//     packingCheck: data.packingCheck,
//     refillCheck: event.checked,
// });
// const updateresp = await this.service.fetchRequestPost(
//         'refillslots/refillInv',
//         Payload
//     );
//     this.SingleSlotResp = updateresp;
// }
    // await this.getRefillOrders();
    const updateresp = await this.service.postResponseAsText(
      'refillslots/refillInvUpdate',
      Payload
  );
  this.SingleSlotResp = updateresp;

    // await this.getRefillSlots(data.refillOrderId);
  //   this.Refillresp.forEach((refillobj) => {
  //       refillobj['slotItems'] = [];
       
  //       this.slotsresp.forEach((slotitem) => {
  //           if (refillobj.idRefillOrd === slotitem.refillOrderId) {
  //             refillobj.slotItems.push(slotitem);
  //             // refillobj.childActive = false;
  //             refillobj.isEdit = false;
  //           }
  //       });
    
  //   });
  //   this.slotsresp.forEach((slotitem)=>{
  //       this.suppItems.forEach((prod)=>{
  //             if(slotitem.prodId== prod.productId && prod.endDate==null){
  //                 slotitem['salePrice'] =  prod.salePrice
  //             }
  //         });
  //     });
  //   this.Refillresp.forEach((obj) => {
  //     if (obj.idRefillOrd === data.refillOrderId) {
     
  //           let index=0;
  //           obj.slotItems.forEach((refobj)=>{
  //           if(refobj.refillCheck==false){
  //               refobj.refhighliteindex = index+1;
  //               index++;
  //           }
  //           else refobj.refhighliteindex=0;
  //           });
  //             const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
  //         this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
  //         this.mobilePoItems = obj.slotItems;
  //         obj.childActive = true;
  //     }
   
  // });
 
}
async OnReturnCheck(data,event){
    this.currentObj = data;
    this.refillSlotId
    = data.refillSlotId;
   data.returnCheck = event.checked;
   const updateresp = await this.service.postResponseAsText(
        'refillslots/createRefillSlots',
        data
    );
    this.SingleSlotResp = updateresp;
    // await this.getRefillOrders();
    await this.getRefillSlots(this.SelectallStatus);
    this.Refillresp.forEach((refillobj) => {
        refillobj['slotItems'] = [];
       
        this.slotsresp.forEach((slotitem) => {
            if (refillobj.idRefillOrd === slotitem.refillOrderId) {
              refillobj.slotItems.push(slotitem);
              // refillobj.childActive = false;
              refillobj.isEdit = false;
            }
        });
    
    });
    this.slotsresp.forEach((slotitem)=>{
        this.suppItems.forEach((prod)=>{
              if(slotitem.prodId== prod.productId && prod.endDate==null){
                  slotitem['salePrice'] =  prod.salePrice
              }
          });
      });
    this.Refillresp.forEach((obj) => {
      if (obj.idRefillOrd === data.refillOrderId) {
       
        if(obj.status=='Retrun Validation'){
            let index=0;
            obj.slotItems.forEach((returnobj)=>{
            if(returnobj.returnCheck==false){
                returnobj.returnhighliteindex = index+1;
                index++;
            }
            else returnobj.returnhighliteindex=0;
            });
        }
        const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
          this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
          this.mobilePoItems = obj.slotItems;
          obj.childActive = true;
      }
   
  });
}
async saveCorrectionData(table){
   
      
          table.correctionQty=parseInt(table.correctionQty);
          const Correctionpayload = {
            "rackId":table.rackId,
            "slotId":table.slotId,
            "genieId":this.SelectallStatus.genieId,
            "itemId":table.prodId,
            "correctionQty":table.correctionQty
          }
          console.log("Correction",Correctionpayload)
        const updateresp = await this.service.postResponseAsText(
          'genieprodinventory/updateCorrecitonQty',
          Correctionpayload
      );
      this.SingleSlotResp = updateresp;
      await this.getRefillSlots(this.SelectallStatus);
      this.Refillresp.forEach((refillobj) => {
          refillobj['slotItems'] = [];
         
          this.slotsresp.forEach((slotitem) => {
              if (refillobj.idRefillOrd === slotitem.refillOrderId) {
                refillobj.slotItems.push(slotitem);
                // refillobj.childActive = false;
                refillobj.isEdit = false;
              }
          });
      
      });
      
      
        this.Refillresp.forEach((obj) => {
          if (obj.idRefillOrd === table.refillOrderId) {
              const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
              this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
              this.mobilePoItems = obj.slotItems;
              obj.childActive = true;
          }
       
      });
    //   this.editingMode = false;
    //   let Payload={
    //     "genieId": this.SelectallStatus.genieId,
    //   "refillOrdId" : table.refillOrderId,
    //   "status" : this.SelectallStatus.status
    //   }
  
    
    //     const Refreshresp = await this.service.fetchRequestPost(
    //       'refillslots/getMappingInvData',
    //       Payload
    //     );
      
    //     this.mappingSlotResp = Refreshresp;
    //     console.log("mappingSlotResp",this.mappingSlotResp);
    //         this.slotsresp.forEach((obj)=>{
    //             this.mappingSlotResp.forEach((map)=>{
    //                 if(obj.refillOrderId == map.refillOrderId && obj.refillSlotId== map.refillSlotId){
    //                     return this.mappingInvObj = map
    //                 }
    //             })
    //         })
    //  await this.getRefillOrders();
    //  await this.getRefillSlots();
    // this.Refillresp.forEach((refillobj) => {
    //     refillobj['slotItems'] = [];
       
    //     this.slotsresp.forEach((slotitem) => {
    //         if (refillobj.idRefillOrd === slotitem.refillOrderId) {
    //           refillobj.slotItems.push(slotitem);
    //           // refillobj.childActive = false;
    //           refillobj.isEdit = false;
    //         }
    //     });
    
    // });
    
    
    //   this.Refillresp.forEach((obj) => {
    //     if (obj.idRefillOrd === table.refillOrderId) {
    //         const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
    //         this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
    //         this.mobilePoItems = obj.slotItems;
    //         obj.childActive = true;
    //     }
     
    // });
   
}
async saveRefillData(table){
    const maxRefillQty = table.packingQty;
    
        table.refillQty=parseInt(table.refillQty);
        console.log(table); 
        if (table.refillQty > maxRefillQty) {
            // If entered refill quantity is more than packing quantity, reset to packing quantity
            // table.refillQty = maxRefillQty;
            // You can also show a message or perform other actions to inform the user
           alert('Refill quantity cannot be more than packing quantity.');
           await this.getRefillSlots(this.SelectallStatus);
           this.Refillresp.forEach((refillobj) => {
               refillobj['slotItems'] = [];
              
               this.slotsresp.forEach((slotitem) => {
                   if (refillobj.idRefillOrd === slotitem.refillOrderId) {
                     refillobj.slotItems.push(slotitem);
                     // refillobj.childActive = false;
                     refillobj.isEdit = false;
                   }
               });
           
           });
           
           
             this.Refillresp.forEach((obj) => {
               if (obj.idRefillOrd === table.refillOrderId) {
                   const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
                   this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
                   this.mobilePoItems = obj.slotItems;
                   obj.childActive = true;
               }
            
           });
           return;
          }
          table.refillQty=parseInt(table.refillQty);
        const updateresp = await this.service.postResponseAsText(
          'refillslots/createRefillSlots',
          table
      );
      this.SingleSlotResp = updateresp;
      this.editingMode = false;
    //  await this.getRefillOrders();
     await this.getRefillSlots(this.SelectallStatus);
    this.Refillresp.forEach((refillobj) => {
        refillobj['slotItems'] = [];
       
        this.slotsresp.forEach((slotitem) => {
            if (refillobj.idRefillOrd === slotitem.refillOrderId) {
              refillobj.slotItems.push(slotitem);
              // refillobj.childActive = false;
              refillobj.isEdit = false;
            }
        });
    
    });
    
    
      this.Refillresp.forEach((obj) => {
        if (obj.idRefillOrd === table.refillOrderId) {
            const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
            this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
            this.mobilePoItems = obj.slotItems;
            obj.childActive = true;
        }
     
    });
   
}
async saveData(table){
  this.packingQty = true;
    const maxPackingQty = table.maxQty;
   
     
      console.log(table); 
      if (table.packingQty > maxPackingQty) {
        // If entered refill quantity is more than packing quantity, reset to packing quantity
        // table.refillQty = maxRefillQty;
        // You can also show a message or perform other actions to inform the user
       alert('Packing quantity cannot be more than Max quantity.');
       await this.getRefillSlots(this.SelectallStatus);
       this.Refillresp.forEach((refillobj) => {
           refillobj['slotItems'] = [];
          
           this.slotsresp.forEach((slotitem) => {
               if (refillobj.idRefillOrd === slotitem.refillOrderId) {
                
                 refillobj.slotItems.push(slotitem);
                
                 // refillobj.childActive = false;
                 refillobj.isEdit = false;
               }
           });
       
       });
     
     
         this.Refillresp.forEach((obj) => {
           if (obj.idRefillOrd === table.refillOrderId) {
             const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
               this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
               this.mobilePoItems = obj.slotItems;
               obj.childActive = true;
           }
        
       });
       return;
      }
      table.packingQty=parseInt(table.emptyQty);
      table.returnQty = table.packingQty;
      // table['orderType'] = this.SelectallStatus?.orderType;
      // table['orderFor'] = this.SelectallStatus?.orderFor;
      // table['genieList'] = this.SelectallStatus?.geineList;
      // table['refillPackOrder'] = this.SelectallStatus?.refillPackOrder;
      const updateresp = await this.service.postResponseAsText(
        'refillslots/createRefillSlots',
        table
    );
    this.SingleSlotResp = updateresp;
    this.editingMode = false;
//    await this.getRefillOrders();
   await this.getRefillSlots(this.SelectallStatus);
  this.Refillresp.forEach((refillobj) => {
      refillobj['slotItems'] = [];
     
      this.slotsresp.forEach((slotitem) => {
          if (refillobj.idRefillOrd === slotitem.refillOrderId) {
           
            refillobj.slotItems.push(slotitem);
           
            // refillobj.childActive = false;
            refillobj.isEdit = false;
          }
      });
  
  });


    this.Refillresp.forEach((obj) => {
      if (obj.idRefillOrd === table.refillOrderId) {
        const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
          this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
          this.mobilePoItems = obj.slotItems;
          obj.childActive = true;
      }
   
  });


} 
async savePackingData(table){
  this.packingQty = true;
    const maxPackingQty = table.maxQty;
   
     
      console.log(table); 
      if (table.packingQty > maxPackingQty) {
        // If entered refill quantity is more than packing quantity, reset to packing quantity
        // table.refillQty = maxRefillQty;
        // You can also show a message or perform other actions to inform the user
       alert('Packing quantity cannot be more than Max quantity.');
       await this.getRefillSlots(this.SelectallStatus);
       this.Refillresp.forEach((refillobj) => {
           refillobj['slotItems'] = [];
          
           this.slotsresp.forEach((slotitem) => {
               if (refillobj.idRefillOrd === slotitem.refillOrderId) {
                
                 refillobj.slotItems.push(slotitem);
                
                 // refillobj.childActive = false;
                 refillobj.isEdit = false;
               }
           });
       
       });
     
     
         this.Refillresp.forEach((obj) => {
           if (obj.idRefillOrd === table.refillOrderId) {
             const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
               this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
               this.mobilePoItems = obj.slotItems;
               obj.childActive = true;
           }
        
       });
       return;
      }
      table.packingQty=parseInt(table.packingQty);
      table.returnQty = table.packingQty;
      // table['orderType'] = this.SelectallStatus?.orderType;
      // table['orderFor'] = this.SelectallStatus?.orderFor;
      // table['genieList'] = this.SelectallStatus?.geineList;
      // table['refillPackOrder'] = this.SelectallStatus?.refillPackOrder;
      const updateresp = await this.service.postResponseAsText(
        'refillslots/createRefillSlots',
        table
    );
    this.SingleSlotResp = updateresp;
    this.editingMode = false;
//    await this.getRefillOrders();
   await this.getRefillSlots(this.SelectallStatus);
  this.Refillresp.forEach((refillobj) => {
      refillobj['slotItems'] = [];
     
      this.slotsresp.forEach((slotitem) => {
          if (refillobj.idRefillOrd === slotitem.refillOrderId) {
           
            refillobj.slotItems.push(slotitem);
           
            // refillobj.childActive = false;
            refillobj.isEdit = false;
          }
      });
  
  });


    this.Refillresp.forEach((obj) => {
      if (obj.idRefillOrd === table.refillOrderId) {
        const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
          this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
          this.mobilePoItems = obj.slotItems;
          obj.childActive = true;
      }
   
  });


} 
  async onAddSlots(){
    let form = this.refillOrderFormGroup.getRawValue();

    form.genieId = parseInt(form.genieId);
    console.log("Refill",form.genieId)
    let Payload={
      "genieId": form.genieId,
    "refillOrdId" : this.idRefillOrd
    }

        const updateresp = await this.service.fetchRequestPost(
            'refillslots/getMappingInvData',
            Payload
        );
      
        this.mappingSlotResp = updateresp;
        console.log("MappingInvSlots",this.mappingSlotResp);
       //we need to pass this.mappingSlotResp to below service as response
    //     const updateSlotresp = await this.service.fetchRequestPost(
    //       'refillslots/createMultipleSlots',
    //       this.mappingSlotResp
    //   );
    //   this.multipleSlotResp= updateSlotresp;
    //   console.log("MultipleSlotResp",this.multipleSlotResp);
      this.isMatDrawerOpened=false;
      this.getRefillOrders();
    
  }
  async getRefillSlots(refill){ //updating getRefillSlots api call with Refresh api call due to empty quantity
    this.Payload={
      "genieId": refill.genieId,
    "idRefillOrd" : refill.idRefillOrd,
    "status": refill.status,
    "createdBy" : refill.createdBy,
    "assignedTo" : refill.assignedTo,
      "packedBy" : refill.packedBy,
      "updatedBy": refill.updatedBy,
      "comments": refill.comments,
      "genieLocation": refill.genieLocation,
      "contactPerson": refill.contactPerson,
      "keyInfo": refill.keyInfo,
      "type" : refill.auto,
      "orderType": refill.orderType,
    "orderFor": refill.orderFor,
    "geniesList": refill.geniesList,
    "refillPackOrder": refill.refillPackOrder,
    "vendorId": refill.vendorId
    }
    console.log("pay",this.Payload)
    return new Promise(async(res,rej)=>{
        this.slotsresp=[];
       
        const SlotRfillresp = await this.service.fetchRequestPost(
          'refillslots/getMappingInvData',
          this.Payload
          
      );
      this.slotsresp = SlotRfillresp;
      this.loading = false;
            res(this.slotsresp);
            this.Refillresp.forEach((obj)=>{
           
                const matchingSlots = this.slotsresp.filter(slot => slot.refillOrderId === obj.idRefillOrd);
                let totalPackingQty = 0;
                let totalRefillQty = 0;
                let totalReturnQty = 0;
                let PackageWeight =0;;
                // Assign the length of matching slots to the ItemLength property of the refill order
                obj['ItemLength'] = matchingSlots.length;
                   matchingSlots.forEach(slot => {
                    let uomsize = slot?.uom.match(/\d+/); //Extracting only number(ex:50gms 50 will be extracted);
                    const uomWt = uomsize ? parseInt(uomsize[0]) : null

                    totalPackingQty += slot.packingQty;
                    totalRefillQty += slot.refillQty;
                    totalReturnQty += (slot.packingQty - slot.refillQty)
                    PackageWeight += uomWt*slot.packingQty;
                    console.log("PackageWeight",PackageWeight)
                });
                obj['totalPKQ'] = totalPackingQty;
                obj['totalRefillQty'] = totalRefillQty;
                obj['totalReturnQty'] = totalReturnQty;
                obj['totalPackageWt'] = PackageWeight;
              })
          console.log("Refillresp",this.Refillresp)
    })
  
//   this.Refillresp.forEach((refillobj) => {
//     refillobj['slotItems'] = [];
   
//     this.slotsresp.forEach((slotitem) => {
//         if (refillobj.idRefillOrd === slotitem.refillOrderId) {
//           refillobj.slotItems.push(slotitem);
//           // refillobj.childActive = false;
//           refillobj.isEdit = false;
//         }
//     });

// });

  }
  async OnSaveSlotItem(){
    const data = this.refillSlotItemformGroup.getRawValue();
    const payload = {
      refillSlotId: data.refillSlotId,
    refillOrderId: data.refillOrderId,
    prodId: parseInt(data.prodId),
    maxQty : data.maxQty,
    refillQty:data.refillQty,
    status: data.status,
    rackId: data.rackId,
    slotId: data.slotId,
    packingQty: data.packingQty,
    correctionQty: data.correctionQty,
    packingCheck: data.packingCheck,
    refillCheck: data.refillCheck,
    corrected: data.corrected,
     returnQty: data.packingQty   
    }
    console.log("Slotpayload",payload);
    const updateSlotresp = await this.service.postResponseAsText(
      'refillslots/createRefillSlots',
      payload
  );
  this.SingleSlotResp= updateSlotresp;
  if(updateSlotresp == "Event Details Saved Successfully"){
    this.responseMessage = "Data Saved Successfully"
  }
  else{
    this.responseMessage = "Error while saving data"
  }
  this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
    duration: 2 * 1000,
});
    this.getRefillOrders();
  

    this.isAdhocItemDetails = false;
    this.isMatDrawerOpened = false;
    this.isAdhocDetails = false;
   
  }
  OnSaveRefillOrder() {
    if(!this.editmode){
        this.idRefillOrd = 0;
        this.SaveAdhocPoDetails(this.idRefillOrd);
    }
    else{
        this.SaveAdhocPoDetails(this.idRefillOrd);
    }
      
     
      this.isAdhocItemDetails = false;
      this.isMatDrawerOpened = false;
      this.isAdhocDetails = false;
    //   this.adhocpoitemid = 0;
  }
  OnSaveItem() {
      const data = this.adhocItemformGroup.getRawValue();
      this.SaveAdhocPoItemDetails(data, this.refillSlotId);
      this.productsList = this.supplierItemsList;

      this.isAdhocItemDetails = false;
      this.isMatDrawerOpened = false;
      this.isAdhocDetails = false;
      this.adhocpoitemid = 0;
      this.currentObj = {};

      // get adhocpoitemonly, adhocpo also no front end push
  }
  SortItems(data) {
      let temp = data.sort((a, b) => {
          if (a.prodName && b.prodName) {
              const nameA = a?.prodName.toUpperCase(); // ignore upper and lowercase
              const nameB = b?.prodName.toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                  return -1;
              }
              if (nameA > nameB) {
                  return 1;
              }

              // names must be equal
              return 0;
          }
      });

      // let order = ['Groceries', 'Vegetables', 'Non Veg', 'Others'];
      // let newArray = [];
      // order.forEach((orderitem) => {
      //     return temp.filter((ingr) => {
      //         if (ingr.category === orderitem) newArray.push(ingr);
      //     });
      // });
      // data = newArray;
      return data;
  }
  playAudio() {
      let audio = new Audio();
      audio.src = '../../../assets/audio/Alarm.mp3';
      audio.load();
      audio.play();
  }
  OnPdfPressQuantity(data, poData) {
      console.log(poData);
      // this.playAudio();
      let totalAmount = 0;
      data.forEach((item) => {
          totalAmount += parseFloat(item.finalprice.toFixed(2));
      });

      data.forEach((row) => {
          if (row.uom == 'gms' || row.uom == 'ml') {
              if (row.purchasedquantity >= 1000) {
                  row.purchasedquantity = row.purchasedquantity / 1000;
                  row.purchasedquantity = row.purchasedquantity.toFixed(2);
                  if (row.uom == 'gms') row.uom = 'kgs';
                  else if (row.uom == 'ml') row.uom = 'L';
              } else {
                  row.purchasedquantity = row.purchasedquantity;
              }
          } else {
              row.purchasedquantity = row?.purchasedquantity;
          }
      });
      console.log(poData.description);
      let docDefinition = {
          defaultStyle: {
              font: 'telugu', // use your font name here
          },
          content: [
              // Previous configuration
              {
                  text: `PO#: ${poData[0].adhocpoid}, Description: ${poData[0].description}`,
                  fontSize: 17,
              },
              {
                  text: `PO Date: ${poData[0].date}, Total Items: ${data.length}, Total Amount: ${totalAmount}`,
                  fontSize: 17,
              },
              {
                  table: {
                      headerRows: 1,
                      body: [
                          [
                              'SNo',
                              'Item ID/Name',
                              'Total Quantity',
                              'Category',
                          ],
                          ...data.map((p, i) => [
                              i + 1,
                              p.prodName + '-' + p.tname,
                              p.purchasedquantity + ' ' + p.uom,
                              p.category,
                          ]),
                      ],
                  },
              },
          ],
      };
      console.log(docDefinition);
      pdfMake
          .createPdf(docDefinition)
          .download(
              poData[0].adhocpoid.toString() +
                  '-' +
                  poData[0].description +
                  '.pdf'
          );
  }
  OnPdfPress(data, poData) {
      console.log(poData);
      // this.playAudio();
      let totalAmount = 0;
      data.forEach((item) => {
          totalAmount += parseFloat(item.finalprice.toFixed(2));
      });

      data.forEach((row) => {
          if (row.uom == 'gms' || row.uom == 'ml') {
              if (row.purchasedquantity >= 1000) {
                  row.purchasedquantity = row.purchasedquantity / 1000;
                  row.purchasedquantity = row.purchasedquantity.toFixed(2);
                  if (row.uom == 'gms') row.uom = 'kgs';
                  else if (row.uom == 'ml') row.uom = 'L';
              } else {
                  row.purchasedquantity = row.purchasedquantity;
              }
          } else {
              row.purchasedquantity = row?.purchasedquantity;
          }
      });
      console.log(poData.description);
      let docDefinition = {
          defaultStyle: {
              font: 'telugu', // use your font name here
          },
          content: [
              // Previous configuration
              {
                  text: `PO#: ${poData[0].adhocpoid}, Description: ${poData[0].description}`,
                  fontSize: 17,
              },
              {
                  text: `PO Date: ${poData[0].date}, Total Items: ${data.length}, Total Amount: ${totalAmount}`,
                  fontSize: 17,
              },
              {
                  table: {
                      headerRows: 1,
                      body: [
                          [
                              'SNo',
                              'Item ID/Name',
                              'Total Quantity',
                              'Category',
                              'Price per UOM',
                              'Final Price',
                          ],
                          ...data.map((p, i) => [
                              i + 1,
                              p.prodName + '-' + p.tname,
                              p.purchasedquantity + ' ' + p.uom,
                              p.category,
                              p.price,
                              p.finalprice,
                          ]),
                      ],
                  },
              },
          ],
      };
      console.log(docDefinition);
      pdfMake
          .createPdf(docDefinition)
          .download(
              poData[0].adhocpoid.toString() +
                  '-' +
                  poData[0].description +
                  '.pdf'
          );
  }

  async OnAdhocItemClick() {
    //   this.adhocItemformGroup.enable();
      // this.router.routeReuseStrategy.shouldReuseRoute = () => true;
      
      this.isMatDrawerOpened = true;
      this.isAdhocItemDetails = true;
      this.isAdhocDetails = false;
      this.refillSlotItemformGroup.reset;
   
  
    
      this.refillSlotItemformGroup.controls['refillOrderId'].enable();
    //   this.refillSlotItemformGroup.controls['maxQty'].enable();
      this.refillSlotItemformGroup.controls['rackId'].enable();
      this.refillSlotItemformGroup.controls['slotId'].enable();
      this.refillSlotItemformGroup.controls['packingCheck'].enable();
      this.refillSlotItemformGroup.controls['refillCheck'].enable();
    
      this.refillSlotItemformGroup.controls['refillQty'].enable();
      this.refillSlotItemformGroup.controls['packingQty'].enable();
      this.prodImage = "";
      this.filteredproductdetails = this.productDetails.filter((prod)=>{
        return prod.genieId == this.row.genieId && this.row.vendorId==this.vendorId
      });
      console.log("filteredproductdetails",this.filteredproductdetails)
      this.fitleredRacks = [];
      this.filteredproductdetails.forEach((rack)=>{
        this.fitleredRacks.push(rack.rackId);
      })
     
      this.fitleredRacks = [...new Set(this.fitleredRacks)];
      console.log("filteredReacks",this.fitleredRacks);
    //   this.refillSlotItemformGroup.controls['refillOrderId'].setValue(this.row.genieId)
  }
  async onRackChange(){
    const rackId = this.refillSlotItemformGroup.get('rackId').value;
    this.filteredSlots = [];
    this.filteredSlots= this.productDetails.filter(prodmap => {
        return prodmap.rackId == rackId && prodmap.genieId == this.row.genieId
    });
    console.log("filteredSlots",this.filteredSlots)
  }
  async onSlotChange(){
    const rackId = this.refillSlotItemformGroup.get('rackId').value;
    const slotId = this.refillSlotItemformGroup.get('slotId').value;
   
    this.productDetails.forEach((prod)=>{
        if(prod.genieId==this.row.genieId && prod.rackId == rackId && prod.slotId == slotId){
             this.refillSlotItemformGroup.controls['maxQty'].setValue(prod.quantity);
             let product = prod.itemId.toString();
             this.refillSlotItemformGroup.controls['prodId'].setValue(product)
        }
    });
   
  }
  async StatusChange(data, value,modal) {
      let idRefillOrd = data.idRefillOrd;
      let allItemsChecked = true;
      let allRefillItemsChecked = true;
      let allCorrectionItemsChecked = true;
      let allReturnItemsChecked = true;
      this.packingStatusCheck1 = false;
      this.packingStatusCheck2 = false;
      this.packingStatusCheck3 = false;
      this.packingStatusCheck4 = false;
          this.refillStatusCheck1 = false;
          this.refillStatusCheck2 = false;
          this.refillStatusCheck3 = false;
          this.refillStatusCheck4 = false;
          this.refillStatusCheck5 = false;
          this.IntransitStatusCheck1 = false;
          this.IntranasitStatusCheck2 = false;
    
  if (value === 'Packing Completed' && data.status === 'Packing') {
    // Check if all items in the Packing stage are checked
    data.slotItems.forEach(item => {
      if (!item.packingCheck) {
        allItemsChecked = false;
        
        return; 
      }
    });
    if (!allItemsChecked) {
        
        alert("All items in Packing stage must be checked to move to Packing Completed stage");
        return;
      }
    //   data.status = value;
      this.data = data;
      this.value = value;
      this.packingDialogContent = true;
      this.packingref = this.dialog.open(modal);
      return
    }
    else if(value==='Return Completed' && data.status==='Return Validation'){
        data.slotItems.forEach(item => {
            if (!item.returnCheck) {
              allReturnItemsChecked = false;
              return; 
            }
          });
          if (!allReturnItemsChecked) {
              
              alert("All items in Return Validation stage must be checked to move to Return Completed Stage");
              return;
            }
            this.data = data;
            this.value = value;
           
    }
   
  //  else if (value === 'Refill Completed' && data.status === 'Refill') {
  //       data.slotItems.forEach(item => {
  //           if (!item.refillCheck) {
  //             allRefillItemsChecked = false;
  //             return; 
  //           }
  //         });
  //         if (!allRefillItemsChecked) {
              
  //             alert("All items in Refill stage must be checked to move to Refill Completed stage");
  //             return;
  //           }
  //           this.data = data;
  //           this.value = value;
  //           // this.packingDialogContent = true;
            
  //           this.packingref = this.dialog.open(modal);  
  //           return   
  //   }
  //  else if(value === 'Correction' && data.status === 'In Transit'){
  //       this.data = data;
  //       this.value = value;
  //       this.IntransitStatusContent = true;
  //       this.packingref = this.dialog.open(modal);  
  //       return   
  //   }
    data.status = value;
      this.data = data;
      this.value = value;
      if(value=='Closed' || value=='Cancelled'){
        // this.refillOrdersRefillresp = this.Refillresp
  this.refillOrdersRefillresp = this.refillOrdersRefillresp.filter((ref)=>{
    return ref.orderType=="Refill"  && ref.refillPackOrder!=0 && ref.status!="Closed" && ref.status != "Cancelled"
  });
  let filteredOrder = this.refillOrdersRefillresp.find((ref) => {
    return data.idRefillOrd === ref.refillPackOrder;
  });

  if (filteredOrder) {
    filteredOrder.status = data.status;
    this.packorderData = filteredOrder;
  }

  console.log("this.packorderData", this.packorderData);
   const saveresp = await this.service.fetchRequestPost(
            'refillOrder/createRefillOrder',
            this.packorderData
        );
      }
      
        const saveresp = await this.service.fetchRequestPost(
            'refillOrder/createRefillOrder',
           data
        );
      
        // this.mappingSlotResp = saveresp;
      // const mappingPayload={
      //   "genieId": data.genieId,
      // "refillOrdId" :data.idRefillOrd,
      // "createdBy" : data.createdBy,
     
      // "vendorId": this.vendorId,
      
      // "status":  data?.status,
     
      // "assignedTo" : "",
      //   "packedBy" : "",
      //   "updatedBy": "",
      //   "comments": "",
      //   "genieLocation": "",
      //   "contactPerson": "",
      //   "keyInfo": "",
      //   "type" : 'auto',
        
      // "orderType": data.orderType,
      // "orderFor": data.orderFor,
      // "geniesList": null,
      // "refillPackOrder": null,
    
      // }
    //   console.log("mappingPayload",mappingPayload)
    //   const updateresp = await this.service.fetchRequestPost(
    //     'refillslots/getMappingInvData',
    //     mappingPayload
    // );
  
    // this.mappingSlotResp = updateresp;
      console.log(data);
      await this.getRefillOrders();
  }
  async onPackingStatusCheck(){
    if(this.value=='Packing Completed' && this.data.status === 'Packing'){
    let allCheckboxesChecked = this.packingStatusCheck1 && this.packingStatusCheck2 && this.packingStatusCheck3 && this.packingStatusCheck4;
    if(allCheckboxesChecked){
        this.data.status = this.value;
        const saveresp = await this.service.fetchRequestPost(
            'refillOrder/createRefillOrder',
            this.data
        );
        this.packingref.close();
        // this.ngOnInit();
     await this.getRefillOrders();
      this.packingDialogContent = false;
    }
    else if(!allCheckboxesChecked){
        alert("All Checkboxes to be checked");
       
    }
}
else if(this.value=='Refill Completed' && this.data.status === 'Refill'){
    let allCheckboxesChecked = this.refillStatusCheck1 && this.refillStatusCheck2 && this.refillStatusCheck3 && this.refillStatusCheck4 && this.refillStatusCheck1;
    if(allCheckboxesChecked){
        this.data.status = this.value;
        const saveresp = await this.service.fetchRequestPost(
            'refillOrder/createRefillOrder',
            this.data
        );
        this.packingref.close();
        // this.ngOnInit();
      this.getRefillOrders();
      this.packingDialogContent = false;
      this.IntransitStatusContent = false;
    }
    else if(!allCheckboxesChecked){
        alert("All Checkboxes to be checked");
       
    }
}
else if(this.value=='Correction' && this.data.status === 'In Transit'){
    let allCheckboxesChecked = this.IntransitStatusCheck1 && this.IntranasitStatusCheck2;
    if(allCheckboxesChecked){
        this.data.status = this.value;
        const saveresp = await this.service.fetchRequestPost(
            'refillOrder/createRefillOrder',
            this.data
        );
        this.packingref.close();
        // this.ngOnInit();
      this.getRefillOrders();
      this.IntransitStatusContent = false;
    }
    else if(!allCheckboxesChecked){
        alert("All Checkboxes to be checked");
       
    }
}

  }
  async onCancelPackingCheck(){
    this.packingref.close();
    if(this.value=='Packing Completed'){
        this.packingStatusCheck1 = false;
        this.packingStatusCheck2 = false;
        this.packingStatusCheck3 = false;
        this.packingStatusCheck4 = false;
        }
        else if(this.value == 'Refill Completed'){
            this.refillStatusCheck1 = false;
            this.refillStatusCheck2 = false;
            this.refillStatusCheck3 = false;
            this.refillStatusCheck4 = false;
            this.refillStatusCheck5 = false;
        }
        else if(this.value == 'Refill'){
            this.IntransitStatusCheck1 = false;
            this.IntranasitStatusCheck2 = false;
        }
  }
  async OnVoiceNext(table,event,command,value){
    this.command=command;
    event.checked = true;
    // this.OnPackingCheck(table,event);
    let packtable = table
    // let currentRackId = table.rackId;
    // let currentSlotId = table.slotId;
   
    table.sort((a: any, b: any) => {
      const rackIdA = a.rackId;
      const rackIdB = b.rackId;
  
      if (rackIdA !== rackIdB) {
        return rackIdB - rackIdA;
      } else {
        const slotIdA = a.slotId;
        const slotIdB = b.slotId;
        return slotIdB - slotIdA;
      }
    });
    if (!this.previousCommand) {
      this.previousCommand = ''; // Initialize previousCommand if it doesn't exist
    }
    if(command=='done'){
      this.voiceservice.stop();
      if (this.previousCommand !== 'done') {
      let foundNextSlot = false;
    table.forEach((table) => {
    
      if (!foundNextSlot) {
        this.currentSlot = this.slotsresp.find(slot => slot.rackId === table.rackId && slot.slotId === table.slotId);
        if (this.currentSlot && this.currentSlot.packingCheck !== true) {
          console.log('Next slot found:', this.currentSlot);
         // Assuming OnPackingCheck handles the logic for the slot
          
          this.OnPackingCheck(this.currentSlot, event);
         
          // this.OnPlay(this.currentSlot, event);
          foundNextSlot = true;
          
        }
      }
   
   
    });
    
    if (foundNextSlot) {
      console.log('Next slot found:', this.currentSlot);
     
      this.OnPackingPlay(this.currentSlot, event,command);
  } else {
      console.log('No next slot found');
  }
  
} else {
  console.log('Consecutive "done" command detected. Skipping execution.');
}
  }
  else if(command=='next'){
    // alert(command)
    let foundNextSlot = false; 
    
    table.forEach((table) => {
    
      if (!foundNextSlot) {
        this.currentSlot = this.slotsresp.find(slot => slot.rackId === table.rackId && slot.slotId === table.slotId);
        if (this.currentSlot && this.currentSlot.packingCheck !== true) {
        
          
          // this.OnPackingNextCheck(this.currentSlot, event); // Assuming OnPackingCheck handles the logic for the slot
          
          foundNextSlot = true;
          
        }
      }
   
   
    });

    if (foundNextSlot) {
      console.log('Next slot found:', this.currentSlot);
      this.voiceservice.stop();
      this.OnPlay(this.currentSlot, event);
      
  } else {
      console.log('No next slot found');
  }
   
    
  }
  else if(command=='change quantity to'){
    let foundNextSlot = false; // Initialize foundNextSlot outside the loop

    table.forEach((table) => {
      if (!foundNextSlot) {
        this.currentSlot = this.slotsresp.find(slot => slot.rackId === table.rackId && slot.slotId === table.slotId);
        if (this.currentSlot && this.currentSlot.packingCheck !== true) {
          console.log('Next slot found:', this.currentSlot);

          this.currentSlot.diffQty = value;
          this.voiceservice.stop();
          this.OnPackingPlay(this.currentSlot, event,command);
          // this.OnPlay(this.currentSlot, event);
          foundNextSlot = true; // Set foundNextSlot to true to prevent further updates
        }
      }
    });
  
    if (!foundNextSlot) {
      console.log('No next slot found');
    }
  
  }
  else if(command=='change item name to'){
    let foundNextSlot = false; // Initialize foundNextSlot outside the loop

    table.forEach((table) => {
      if (!foundNextSlot) {
        this.currentSlot = this.slotsresp.find(slot => slot.rackId === table.rackId && slot.slotId === table.slotId);
        if (this.currentSlot && this.currentSlot.packingCheck !== true) {
          console.log('Next slot found:', this.currentSlot);
          
          // this.currentSlot.diffQty = value;
          // this.OnPackingPlay(this.currentSlot, event,command);
          // this.OnPlay(this.currentSlot, event);
          foundNextSlot = true; // Set foundNextSlot to true to prevent further updates
        }
      }
    });
    this.currentProd=this.suppItems.find(prod=>prod.productname.toLowerCase() === value.toLowerCase());
  console.log("currentProd",this.currentProd);
  const payload = {
    refillSlotId: this.currentSlot.refillSlotId,
  refillOrderId: this.currentSlot.refillOrderId,
  prodId: parseInt(this.currentProd?.productId
  ),
  maxQty : this.currentSlot.maxQty,
  refillQty:this.currentSlot.refillQty,
  status: this.currentSlot.status,
  rackId: this.currentSlot.rackId,
  slotId: this.currentSlot.slotId,
  packingQty: this.currentSlot.packingQty,
  correctionQty: this.currentSlot.correctionQty,
  packingCheck: this.currentSlot.packingCheck,
  refillCheck: this.currentSlot.refillCheck,
  corrected: this.currentSlot.corrected,
   returnQty: this.currentSlot.packingQty   
  }
  console.log("Slotpayload",payload);
  const updateSlotresp = await this.service.postResponseAsText(
    'refillslots/createRefillSlots',
    payload
);
this.SingleSlotResp= updateSlotresp;
this.voiceservice.stop();
if(updateSlotresp == "Event Details Saved Successfully"){
this.OnPackingPlay(this.currentSlot, event,command);
}
await this.getRefillSlots(this.SelectallStatus);
this.Refillresp.forEach((refillobj) => {
  refillobj['slotItems'] = [];
 
  this.slotsresp.forEach((slotitem) => {
      if (refillobj.idRefillOrd === slotitem.refillOrderId) {
        slotitem.diffQty = slotitem.emptyQty-slotitem.packingQty;
        refillobj.slotItems.push(slotitem);
        // refillobj.childActive = false;
        refillobj.isEdit = false;
      }
  });

});
this.slotsresp.forEach((slotitem)=>{
  this.suppItems.forEach((prod)=>{
        if(slotitem.prodId== prod.productId && prod.endDate==null){
            slotitem['salePrice'] =  prod.salePrice
        }
    });
});

this.Refillresp.forEach((obj) => {
  if (obj.idRefillOrd === this.currentSlot.refillOrderId) {
      if(obj.status=='Packing'){
          let index=0;
          obj.slotItems.forEach((packobj)=>{
          if(packobj.packingCheck==false){
              packobj.highliteindex = index+1;
              index++;
          }
          else packobj.highliteindex=0;
          });
      }
      const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
      this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
      this.mobilePoItems = obj.slotItems;
      obj.childActive = true;
  }

});
    if (!foundNextSlot) {
      console.log('No next slot found');
    }
  
  }
  else if(command=='read slot'){
    console.log("readslotvalue",value);
    this.currentSlot = this.slotsresp.find(slot => slot.rackId === value.rackId && slot.slotId === value.slotId);
    console.log("readcurrentslotvalue", this.currentSlot);
    this.voiceservice.stop();
    this.OnPlay(this.currentSlot,event)
  }
  this.previousCommand = command;
  // this.voiceservice.stop();
    // console.log('Starting search from index:', this.currentSlotIndex);
    // for (let i = this.currentSlotIndex; i < this.slotsresp.length; i++) {
    //   const nextSlot = this.slotsresp[i];
    //   if (nextSlot.packingCheck !== true) {
    //     console.log('Next slot found:', nextSlot);
    //     // this.OnPackingCheck(nextSlot, event); // Assuming OnPackingCheck handles the logic for the slot
    //     this.OnPlay(nextSlot, event);
    //     foundNextSlot = true;
    //     break; // Exit the loop as we've found the next slot
    //   }
    // }

  
  //   while(!foundNextSlot && currentRackId!=1){
  //     currentRackId -= 1;
  //     const slotsInPrevRack = this.slotsresp.filter(slot => slot.rackId === currentRackId);
  //     if (slotsInPrevRack.length > 0) {
  //       const highestSlotId = Math.max(...slotsInPrevRack.map(slot => slot.slotId));
  //       currentSlotId = highestSlotId;
  //       while (!foundNextSlot && currentSlotId > 0) {
  //         const nextSlot = this.slotsresp.find(slot => slot.rackId === currentRackId && slot.slotId === currentSlotId && slot.packingCheck !== true);

  //         if (nextSlot) {
  //             this.OnPlay(nextSlot, event);
  //             foundNextSlot = true;
  //         } else {
  //             currentSlotId -= 1;
  //         }
  //     }
    
  // }
     
  //   }
  }
  async OnNext(table,event){
    event.checked = true;
    this.OnPackingCheck(table,event);
    let packtable = table
    let currentRackId = table.rackId;
    let currentSlotId = table.slotId;
    let foundNextSlot = false;

    while(!foundNextSlot && currentSlotId!=1){
      currentSlotId -= 1;
      const nextSlot = this.slotsresp.find(slot => slot.rackId === currentRackId && slot.slotId === currentSlotId && slot.packingCheck !== true);
      if (nextSlot) {
        this.OnPlay(nextSlot, event);
        foundNextSlot = true;
    }
     
    }
    while(!foundNextSlot && currentRackId!=1){
      currentRackId -= 1;
      const slotsInPrevRack = this.slotsresp.filter(slot => slot.rackId === currentRackId);
      if (slotsInPrevRack.length > 0) {
        const highestSlotId = Math.max(...slotsInPrevRack.map(slot => slot.slotId));
        currentSlotId = highestSlotId;
        while (!foundNextSlot && currentSlotId > 0) {
          const nextSlot = this.slotsresp.find(slot => slot.rackId === currentRackId && slot.slotId === currentSlotId && slot.packingCheck !== true);

          if (nextSlot) {
              this.OnPlay(nextSlot, event);
              foundNextSlot = true;
          } else {
              currentSlotId -= 1;
          }
      }
    
  }
     
    }
  }
  async OnPackingPlay(table,event,command){
    // event.stopPropagation();
    let text='';
    if(command=='done'){
     text = "Packing Quantity updated successfully";
    }
    else if(command=='change quantity to'){
    text = "Quantity changed";
    }
    else if(command=='change item name to'){
      text = "Item name changed";
      }
     
    let payload = {
        audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.1,
            effectsProfileId: ['large-home-entertainment-class-device'],
        },
        input: {
            text: text,
        },
        voice: {
            languageCode: 'en-US',
            name: 'en-US-Standard-A',
        },
    };
    const respAudio = await this.service.fetchRequestPost(
        'swiggy/getSpeechFromText',
        payload
    );
    const base64String = respAudio['audioContent'];
    const audio = new Audio(
        'data:audio/mp3;base64,' + base64String.toString('base64')
    );

   
      audio.play();
      audio.onended = () => {
      
        this.voiceservice.start();
   
};
  }
  async OnPlay(table,event){
    // event.stopPropagation();
    const text = `Slot: ${table.rackId},${table.slotId},Item Name: ${table.prodName},${table.uom}, Cost: ${table.salePrice}, Pack Quantity: ${table.emptyQty}`;
    let payload = {
        audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.1,
            effectsProfileId: ['large-home-entertainment-class-device'],
        },
        input: {
            text: text,
        },
        voice: {
            languageCode: 'en-US',
            name: 'en-US-Standard-A',
        },
    };
    const respAudio = await this.service.fetchRequestPost(
        'swiggy/getSpeechFromText',
        payload
    );
    const base64String = respAudio['audioContent'];
    const audio = new Audio(
        'data:audio/mp3;base64,' + base64String.toString('base64')
    );

   
      audio.play();
      audio.onended = () => {
      
            this.voiceservice.start();
       
    };
  }
  async activatingChild(refill) {
    this.packingQty = false;
    this.SelectallStatus = refill //will use this.SelectallStatus in onSelectall()
    this.displayedColumns=[];
      this.Refillresp.forEach((item) => {
        // pushing columns into mat-table based on condition
          if (item.idRefillOrd === refill.idRefillOrd){
          refill.childActive = !refill.childActive;
         
          if(item.status=='Packing'){
            this.displayedColumns.unshift('resetPacking');
          
            this.displayedColumns.push('rackSlotId','prodId','packingQty','packaudio','packnextaudio');

            // this.displayedColumns.push('packingQty');
           
          }
          else if(item.status=='Packing Completed'){
            this.displayedColumns.push('resetPackingCompleted','rackSlotId','prodId','difference')
          }
          else if(item.status=='Correction'){
            this.displayedColumns.unshift('resetCorrection');
            this.displayedColumns.push('rackSlotId','prodId','correctionQty');
            // this.displayedColumns.push('refillQty');
          }
          else if(item.status=='Refill'){
            this.displayedColumns.unshift('resetRefill');
            this.displayedColumns.push('rackSlotId','prodId','refillQty','correctionQty');
            // this.displayedColumns.push('refillQty');
          }
          else if(item.status=='Return Validation'){
            this.displayedColumns.unshift('resetReturn');
            this.displayedColumns.push('rackSlotId','prodId','return')
          }
          else if(item.status=='Return Completed'){
            this.displayedColumns.push('rackSlotId','prodId','return')
          }
          
          else if(item.status=='Open'|| item.status=='In Transit' || item.status=='Refill Completed' || item.status=='Closed'){
            this.displayedColumns.push('rackSlotId','prodId')
          }
        }
          
          else item.childActive = false;
          
      });

      // console.log(po.adhocItems[0].postatus);
      // this.columnsSchema.forEach((col) => {
      //     if (po.status === 'Packing') {
      //         if (col.type === 'ispacked') {
      //             col.isColumnActive = true;
      //         }
      //     } else if (po.status === 'Received') {
      //         if (col.type === 'isreceived') {
      //             col.isColumnActive = true;
      //         }
      //     }
      // });

      await this.getRefillSlots(refill);
     
       
     
  //     if(refill.status=='Refill'){
      const Rfillresp = await this.service.fetchRequest(
        'refillOrder/getAllRefillOrder'
        
    );
    
    this.Refillorders = Rfillresp;
    console.log("Refillorders",this.Refillorders);
    if(refill.status=='Return Validation'){
   this.refillObj =  this.Refillorders.find((obj)=>{
if(obj.refillPackOrder==refill.idRefillOrd){
  return obj
}
    }) 

    console.log("refillObj",this.refillObj);
    this.Payload={
      "genieId": this.refillObj.genieId,
    "idRefillOrd" : this.refillObj.idRefillOrd,
    "status": this.refillObj.status,
    "createdBy" : this.refillObj.createdBy,
    "assignedTo" : this.refillObj.assignedTo,
      "packedBy" : this.refillObj.packedBy,
      "updatedBy": this.refillObj.updatedBy,
      "comments": this.refillObj.comments,
      "genieLocation": this.refillObj.genieLocation,
      "contactPerson": this.refillObj.contactPerson,
      "keyInfo": this.refillObj.keyInfo,
      "type" : this.refillObj.auto,
      "orderType": this.refillObj.orderType,
    "orderFor": this.refillObj.orderFor,
    "geniesList": this.refillObj.geniesList,
    "refillPackOrder": this.refillObj.refillPackOrder,
    "vendorId": this.refillObj.vendorId
    }
      const SlotRfillresp = await this.service.fetchRequestPost(
        'refillslots/getMappingInvData',
          this.Payload
        
    );
    this.refillPackorderslotsresp = SlotRfillresp;
    console.log("refillPackorderslotsresp",this.refillPackorderslotsresp);
    this.slotsresp.forEach((slot)=>{
      this.refillPackorderslotsresp.forEach((refill)=>{
        if(slot.rackId==refill.rackId && slot.slotId==refill.slotId){
          slot.refillQty=refill.refillQty
        }
      })
    })
  }
    //   this.Payload={
  //     "genieId": refill.genieId,
  //   "idRefillOrd" : refill.refillPackOrder,
  //   "status": refill.status,
  //   "createdBy" : refill.createdBy,
  //   "assignedTo" : refill.assignedTo,
  //     "packedBy" : refill.packedBy,
  //     "updatedBy": refill.updatedBy,
  //     "comments": refill.comments,
  //     "genieLocation": refill.genieLocation,
  //     "contactPerson": refill.contactPerson,
  //     "keyInfo": refill.keyInfo,
  //     "type" : refill.auto,
  //     "orderType": refill.orderType,
  //   "orderFor": refill.orderFor,
  //   "geniesList": refill.geniesList,
  //   "refillPackOrder": refill.refillPackOrder,
  //   "vendorId": refill.vendorId
  //   }
  //     const SlotRfillresp = await this.service.fetchRequestPost(
  //       'refillslots/getMappingInvData',
  //         this.Payload
        
  //   );
  //   this.refillPackorderslotsresp = SlotRfillresp;
  //   // first get refill pack order
  //   this.refillPackObj  = this.Refillorders.find(obj=>obj.idRefillOrd==refill.refillPackOrder);
  //   if(this.refillPackObj ){
  //     this.refillPackorderslotsresp.forEach((packorder)=>{
  //       this.slotsresp.forEach((slot)=>{
  //         if(this.refillPackObj.orderFor=='Single'){
  //           if(packorder.prodId==slot.prodId && packorder.rackId==slot.rackId && packorder.slotId==slot.slotId){
  //             if(!slot.refillCheck) {
  //             slot.refillQty=packorder.packingQty;
  //             slot.returnQty = packorder.returnQty;
        
  //           }
  //           else{
  //             slot.returnQty = packorder.returnQty;
  //           }
  //         }
  //       }
  //         else if(this.refillPackObj.orderFor=='Multiple'){
  //           if(packorder.prodId==slot.prodId){
  //             if(!slot.refillCheck) {
  //             slot.returnQty = packorder.returnQty
  //           }
  //           else{
  //             slot.returnQty = packorder.returnQty;
  //           }
  //         }
  //         }
  //       });
  //     });
  //   }
  // }

      this.Refillresp.forEach((refillobj) => {
        refillobj['slotItems'] = [];
     
        this.slotsresp.forEach((slotitem) => {
            slotitem.rackSlotId= `${slotitem.rackId}${slotitem.slotId}`;
             slotitem.diffQty = slotitem.emptyQty-slotitem.packingQty;
             if(slotitem.diffQty==0) slotitem.packingCheck = true; 
             if(refill.status=="Return Validation" || refill.status=="Return Completed"){
              slotitem.returnQty = slotitem.packingQty-slotitem.refillQty;
             }
             else{
              slotitem.returnQty = slotitem.packingQty;
             }
             
            
            //  slotitem.diffduppQty = slotitem.emptyQty-slotitem.packingQty;

            // this.diffQty.setValue(slotitem.emptyQty-slotitem.packingQty)
          //   slotitem.returnQty=slotitem.packingQty;
            if (refillobj.idRefillOrd === slotitem.refillOrderId) {
              refillobj.slotItems.push(slotitem);
              // refillobj.childActive = false;
              refillobj.isEdit = false;
            }
        });
    
    });

    this.slotsresp.forEach((slotitem)=>{
     
      this.suppItems.forEach((prod)=>{
            if(slotitem.prodId== prod.productId && prod.endDate==null){
                slotitem['salePrice'] =  prod.salePrice
            }
        });
    });
   
    // if(refill.status=='Packing'){
    //     this.slotsresp = this.slotsresp.filter((slot)=>{
    //         return slot.status=='In Transit'
    //     });
    // }
    // this.refillSlotTable = new MatTableDataSource<any>();
    
    
      this.Refillresp.forEach((obj) => {
        if (obj.idRefillOrd === refill.idRefillOrd) {
            if(obj.status=='Packing'){
                let index=0;
                refill.slotItems.forEach((obj)=>{
                if(obj.packingCheck==false){
                    obj.highliteindex = index+1;
                    index++;
                }
                else obj.highliteindex=0;
                });
            }
            if(obj.status=='Correction'){
                let index=0;
                refill.slotItems.forEach((obj)=>{
                if(obj.corrected==false){
                    obj.highliteindex = index+1;
                    index++;
                }
                else obj.highliteindex=0;
                });
            }
            else if(obj.status=='Refill'){
                let index=0;
                refill.slotItems.forEach((obj)=>{
                if(obj.refillCheck==false){
                    obj.refhighliteindex = index+1;
                    index++;
                }
                else obj.refhighliteindex=0;
                });
            }
            else if(obj.status=='Return Validation'){
                let index=0;
                refill.slotItems.forEach((obj)=>{
                if(obj.returnCheck==false){
                    obj.returnhighliteindex = index+1;
                    index++;
                }
                else obj.returnhighliteindex=0;
                });
            }
        // console.log('refslot',refill.slotItems)
            const refillItems= this.defaultSorting(refill.status,refill.slotItems);
            this.refillSlotTable = new MatTableDataSource(refill?.slotItems);
            console.log("refillSLotTable",refill?.slotItems)
            this.mobilePoItems = obj.slotItems;
            // obj.childActive = true;
        }
     
    });
 
    // this.voiceservice.start();
//  this.onStart();
    // this.announceSortChange({ active: 'rackSlotId', direction: 'desc' });
    // this.sort.active = 'rackSlotId';
    // this.sort.direction = 'desc';

    // // Apply sorting to the table
    // this.announceSortChange({ active: 'rackSlotId', direction: 'desc' });
   
    // this.onSortDown('rackSlotId')
    // this.sort.sort({
    //     id: 'rackSlotId',
    //     start: 'desc',
    //     disableClear: false,
    //   });
    //   this.announceSortChange(this.sort)
// this.getRefillOrders();
// this.getRefillSlots();
      // this.refillSlotTable = new MatTableDataSource(refill?.slotItems);
      // this.mobilePoItems = refill.slotItems;
  }
  defaultSorting(status,sloitems){
    if(status=='Packing' || status=='Packing Completed'){
        sloitems.sort((a: any, b: any) => {
   
           const rackIdA = a.rackId;
           const rackIdB = b.rackId;
       
           if (rackIdA !== rackIdB) {
             return ( rackIdB - rackIdA );
           } else {
             const slotIdA = a.slotId;
             const slotIdB = b.slotId;
             return (slotIdB - slotIdA);
           }
         });
         let index=0;
         sloitems.forEach((packobj)=>{
               if(packobj.packingCheck==false){
                   packobj.highliteindex = index+1;
                   index++;
               }
               else packobj.highliteindex=0;
               });
               return sloitems;
   }
    else{
        sloitems.sort((a: any, b: any) => {
 
         const rackIdA = a.rackId;
         const rackIdB = b.rackId;
     
         if (rackIdA !== rackIdB) {
           return ( rackIdA - rackIdB );
         } else {
           const slotIdA = a.slotId;
           const slotIdB = b.slotId;
           return (slotIdA - slotIdB);
         }
       });
       if(status=='Refill'){
         let index=0;
       sloitems.forEach((packobj)=>{
             if(packobj.refillCheck==false){
                 packobj.highliteindex = index+1;
                 index++;
             }
             else packobj.highliteindex=0;
             });
             return sloitems;
       }
       else if(status=='Return Validation'){
         let index=0;
       sloitems.forEach((packobj)=>{
             if(packobj.returnCheck==false){
                 packobj.returnhighliteindex = index+1;
                 index++;
             }
             else packobj.returnhighliteindex=0;
             });
             return sloitems;
       }
 }
    
   
    
  }

  OnDelRefillOrder(popup) {
      this.modalReference = this.dialog.open(popup);
      this.delObj = {
        idRefillOrd: this.idRefillOrd,
      };
      console.log(this.delObj);
  }
  async OnConfirmRefill() {
      const delResp = await this.service.fetchRequestdel(
          'refillOrder/deleteRefillOrder',
          this.delObj
      );
      if(delResp){
        this.responseMessage = "Refill Order Successfully deleted"
      }
      else{
        this.responseMessage = "Refill Order deletion failed"
      }
      this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
        duration: 2 * 1000,
    });
      this.modalReference.close();
      this.idRefillOrd = 0;
      // this.adhocpoitemid = 0;
      this.isMatDrawerOpened = false;
      this.isAdhocDetails = false;
      this.isAdhocItemDetails = false;
      this.getRefillOrders();
      // this.getAllDetails(0, 0, 'forDelete');
  }
  OnDel(modal) {
      this.modalReference = this.dialog.open(modal);
      this.delObj = {
        refillSlotId :  this.refillSlotId ,
      };
  }
  async getAllDetails(adhocpoid, adhocpoitemid, isDel: string) {
      const adhocresp = await this.service.fetchRequest(
          'adhocpo/getAllAdhocpo'
      );
      this.adhocPoData = adhocresp['adhocpoList'];
      // for not showing completed pos
      this.adhocPoData = this.adhocPoData.filter((item) => {
          return item.status != 'Completed';
      });
      // creataing empty array for pushing adhocpoitems
      this.adhocPoData.forEach((adhoc) => {
          adhoc['adhocItems'] = [];
      });
      this.adhocPoData.forEach((po) => {
          po['nameAndDate'] = po.description + '-' + po.date;
      });
      // adhoc items
      const adhocitemsresp = await this.service.fetchRequest(
          'adhocpoitem/getAlladhocpoitem'
      );
      this.adhocPoItems = adhocitemsresp['adhocpoitemList'];
      // for balance Qty
      this.adhocPoItems.forEach((item) => {
          item['balanceQty'] = item.quantity - item.purchasedquantity;
      });
      this.adhocPoData.forEach((po) => {
          this.stallOperator.forEach((op) => {
              if (parseInt(po.purchasedby) === op.stalloperatorid)
                  po['opName'] = op.name;
          });
      });
      this.productsList = this.supplierItemsList;
      this.filtereditems = this.productsList;
      // for category in po header
      this.adhocPoData.forEach((po) => {
          this.adhocPoItems.forEach((item) => {
              if (item.isStockAdded === true) {
                  item.stockButton = 'Already Added';
              } else {
                  item.stockButton = 'Add to Stock';
              }
          });
      });

      // for getting product name

      this.productsList.forEach((item) => {
          this.adhocPoItems.forEach((element) => {
              element.prodImage = `${element.productlist}.webp`;
              if (element.productlist == item.productId) {
                  element['prodName'] = item.productname;
                  element['tname'] = item.tname;
                  element['itemName'] = item.productname + '-' + item.tname;
                  element['quantityUom'] =
                      element.quantity + ' ' + element.uom;
              }
          });
      });

      // sorting data
      this.adhocPoData.forEach((po) => {
          this.adhocPoItems.forEach((item) => {
              if (item.adhocpoid === po.adhocpoid) {
                  item['postatus'] = po.status;
              }
          });
      });
      this.adhocPoData.forEach((po) => {
          po.balance = parseFloat(
              (po.totalamount - po.paidamount).toFixed(2)
          );
          po.totalamount = parseFloat(po.totalamount.toFixed(2));
      });

      // pushing relational items to adhoc po
      this.adhocPoData.forEach((adhoc) => {
          this.adhocPoItems.forEach((poitem) => {
              if (adhoc.adhocpoid === poitem.adhocpoid) {
                  adhoc.adhocItems.push(poitem);
                  adhoc.childActive = false;
                  adhoc.isEdit = false;
              }
          });
      });
      this.adhocPoData.forEach((adhoc) => {
          let items = adhoc.adhocItems;
          let selectedPrice: number = 0;
          items.forEach((item: AdhocPoItems) => {
              if (item.available === true) {
                  selectedPrice = parseFloat(
                      (selectedPrice + item.finalprice).toFixed(2)
                  );
              }
              adhoc.availablePrice = selectedPrice;
          });
      });
      this.adhocPoItems.forEach((item) => {
          if (!item.available && item.balanceQty === 0) {
              item.sortKey = 1; // First condition: available false and balance == 0
          } else if (item.available && item.balanceQty === 0) {
              item.sortKey = 3; // Second condition: available true and balanceQty == 0
          } else if (!item.available && item.balanceQty > 0) {
              item.sortKey = 2; // Third condition: checked false and balance > 0
          } else {
              item.sortKey = 0; // Other items that don't meet the conditions
          }
      });

      this.adhocPoItems.sort((a, b) => a.sortKey - b.sortKey);
      console.log('inside is delete');
      let currentPo = {};
      this.adhocPoData.forEach((po) => {
          if (po.adhocpoid == adhocpoid) currentPo = po;
      });
      if (currentPo) {
          this.columnsSchema.forEach((col) => {
              // default set to false for ispacekd and isreceived
              if (col.type === 'ispacked') col.isColumnActive = false;
              if (col.type === 'isreceived') col.isColumnActive = false;
          });
          this.columnsSchema.forEach((col) => {
              if (currentPo['status'] === 'Packing') {
                  if (col.type === 'ispacked') {
                      col.isColumnActive = true;
                  }
              } else if (currentPo['status'] === 'Received') {
                  if (col.type === 'isreceived') {
                      col.isColumnActive = true;
                  }
              }
          });
      }

      // for setting childActive to true
      this.adhocPoData.forEach((po) => {
          if (po.adhocpoid === adhocpoid) {
              this.poItemsTable = new MatTableDataSource(po.adhocItems);
              this.mobilePoItems = po.adhocItems;
              po.childActive = true;
          }
      });
  }
  CloseDialog() {
    this.packingref.close();
    if(this.value=='Packing Completed'){
    this.packingStatusCheck1 = false;
    this.packingStatusCheck2 = false;
    this.packingStatusCheck3 = false;
    this.packingStatusCheck4 = false;
    }
    else if(this.value == 'Refill Completed'){
        this.refillStatusCheck1 = false;
        this.refillStatusCheck2 = false;
        this.refillStatusCheck3 = false;
        this.refillStatusCheck4 = false;
        this.refillStatusCheck5 = false;
    }
    else if(this.value == 'Refill'){
        this.IntransitStatusCheck1 = false;
        this.IntranasitStatusCheck2 = false;
    }
    
      this.modalReference.close();
      
      this.purchaseorder.reset();
      this.category.reset();
      this.available.reset();
      this.itemControl.reset();
      this.salePriceControl.reset();
  }
  decline() {
    this.dialogRef.close();
      this.modalReference.close();
  }
  async confirm() {
    console.log("deObj",this.delObj)
      const delResp = await this.service.fetchRequestdel(
          'refillslots/deleteRefillSlots',
          this.delObj
      );
      // let adhocpoitemid = this.delObj['adhocpoitemid'];
      // this.getAllDetails(this.adhocpoid, this.adhocpoitemid, 'forDelete');

      this.modalReference.close();
      await this.getRefillSlots(this.SelectallStatus);
      this.Refillresp.forEach((refillobj) => {
          refillobj['slotItems'] = [];
         
          this.slotsresp.forEach((slotitem) => {
              if (refillobj.idRefillOrd === slotitem.refillOrderId) {
               
                refillobj.slotItems.push(slotitem);
               
                // refillobj.childActive = false;
                refillobj.isEdit = false;
              }
          });
      
      });
    
    
        this.Refillresp.forEach((obj) => {
          if (obj.idRefillOrd === this.slotTableItem.refillOrderId) {
            const refillItems= this.defaultSorting(obj?.status,obj?.slotItems);
              this.refillSlotTable = new MatTableDataSource(obj?.slotItems);
              this.mobilePoItems = obj.slotItems;
              obj.childActive = true;
          }
       
      });
      this.refillSlotId = 0;
      this.isMatDrawerOpened = false;
      this.isAdhocDetails = false;
      this.isAdhocItemDetails = false;
  }
//   async Delete() {
//       const delObj = {
//         refillSlotId :  this.refillSlotId,
//       };
//       const delResp = await this.service.fetchRequestdel(
//           'refillslots/deleteRefillSlots',
//           delObj
//       );
//       this.Refillresp.forEach((refill) => {
//           if (refill.adhocpoid == this.adhocpoid) {
//               const objWithIdIndex = refill.slotItems.findIndex(
//                   (obj) => obj.refillSlotId === this.refillSlotId
//               );
//               refill.refillSlotId.splice(objWithIdIndex, 1);
//           }
//       });
//   }
  CancelDel() {
      this.modalReference.close();
  }


}
