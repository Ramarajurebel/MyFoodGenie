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
  selector: 'app-movementorder',
  templateUrl: './movementorder.component.html',
  styleUrls: ['./movementorder.component.scss']
})
export class MovementorderComponent implements OnInit {
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
  movementordFormGroup: FormGroup;
  public filtereditems = [];
  itemControl: FormControl = new FormControl('');
  genieControl: FormControl = new FormControl('');
  refillQtyControl: FormControl = new FormControl('');
  protected _onDestroy = new Subject<void>();
  RefillfilterstatusData = ['Open','InProgress','Completed'];
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
displayedColumns: string[] = ['item', 'quantity','totalQty'];
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
  MovResp: any;
  movstatus= ['Open','InProgress','Completed']
  movHeaderId: number;
  movOrdItems: any;
  movOrdItemTable: MatTableDataSource<unknown>;
  public uom = ['gms', 'ml', 'pieces', 'bunch'];
  movItemId: any;
  Selectedobj: any;
  editmovOrder: boolean=false;
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
      
  }
  @ViewChild(MatSort) sort: MatSort;
  ngAfterViewInit() {
 
  }
 
  async ngOnInit() {
      let vendorIdStr = localStorage.getItem('vendorId');
      if (vendorIdStr) {
          this.vendorId = parseInt(vendorIdStr);
      }
    
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
      this.movementordFormGroup = new FormGroup({
        description: new FormControl(''),
        fromStallId: new FormControl(),
        toStallId: new FormControl(),
        status: new FormControl(''),
      });
      this.refillSlotItemformGroup = new FormGroup({
        movHeaderId: new FormControl(),
        itemId: new FormControl(),
        quantity: new FormControl(),
          uom: new FormControl(''),
          uomSize: new FormControl(),
           
          totalQty: new FormControl(''),
            
             
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

console.log("User",this.user)

              const resp = await this.service.fetchRequest(
              'movementorderheader/getAllMovementOrderHeader'
              
          );
          this.MovResp = resp['movementOrderHeaderList']
      
     
      const stallOpResp = await this.service.fetchRequest(
          'stalloperator/getAllStallOperator'
      );
      this.stallOperator = stallOpResp['stallOperatorList'];
    
      const counterresp = await this.service.fetchRequest('stall/getAllStalls');
      this.stallData = counterresp['supplierList'];
      // this.stallData = this.stallData.filter((obj)=> {return obj.status=="Active" && obj.type=="Genie"} );
      this.stallData = this.stallData.filter((stall) => {
        return stall.status == "Active" && (stall.type == "Store" || stall.type == "Warehouse");
       });
      
      this.filteredstallData = this.stallData;
      this.MovResp.forEach(mov => {
        const Fromstall = this.stallData.find(stall => mov.fromStallId == stall.stallid);
        if (Fromstall) {
          mov['fromStallName'] = Fromstall.name;
    mov['fromStallType'] = Fromstall.type;
        }
       
      });
 
    const prodresp = await this.service.fetchRequest(
        'geniemapping/getAllGenieMapping'
    );
    this.productDetails = prodresp['genieMappingList'];
    this.MovResp.forEach(mov => {
      // Find 'toStall' in stallData
      this.stallData.find((stall)=>{
        if(mov.toStallId == stall.stallid){
          mov['toStallName'] = stall.name;
          mov['toStallType'] = stall.type;
        }
      })
   
    });
   
     
      const vendorResp = await this.service.fetchRequest(
          'rest/vendor/GetAllVendors'
      );
      this.vendorData = vendorResp['vendorList'];
    
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
      
      this.supplierItemsList = this.supplierItemsList.filter((supItem)=>{
          return this.suppliersList.some(sup=>sup.supId==supItem.supid);
      });
      this.productsList = this.supplierItemsList;

      this.productsList = this.productsList.filter((item)=>{
          return item?.enddate ==null;
      });
      this.filtereditems = this.productsList;
     
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
       
   
   
  }

selectNextFiveRows(index:number) {
  console.log("index",index)
}
   
  // async getRefillOrders(){
  //   return new Promise(async (res, rej)=>{
      
   
  //           this.Refillresp=[];
  //           let startDate = this.searchFormGroup.controls['startDate'].value;
  //           let endDate = this.searchFormGroup.controls['endDate'].value;
  //           let status = this.searchFormGroup.controls['status'].value;
         
           
  //               let datePayload = {};
  //               if(startDate !=null && endDate!=null){
  //                 datePayload['startDate'] = formatDate(
  //                     startDate,
  //                     'YYYY-MM-dd',
  //                     this.locale
  //                 );
  //                 datePayload['endDate'] = formatDate(
  //                     endDate,
  //                     'YYYY-MM-dd',
  //                     this.locale
  //                 );
  //                 }
  //                 else {
  //                 datePayload['startDate']=null;
  //                 datePayload['endDate']=null;
  //                 }
  //               datePayload['status']=status;
  //            console.log('datePayload',datePayload);
  //            const resp = await this.service.fetchRequestPost(
  //             'refillOrder/getRfOrdByDate',
  //             datePayload
  //         );
  //         this.Refillresp = resp;
  //         this.packingCompletedRefill = this.Refillresp;
  //         this.packingCompletedRefill = this.Refillresp.filter(ref => ref.status === 'Packing Completed');
  //         this.Refillresp = this.Refillresp.filter((ref)=>{
  //           return ref.orderType=="Packing" && ref.orderFor!=null && ref.status!="Refill" && ref.status!="Correction" && ref.status!="Refill Completed" && ref.status!="Closed" && ref.status != "Cancelled"
  //         });
  //         this.Refillresp.sort((a, b) => b.idRefillOrd - a.idRefillOrd);
  //       //     const Rfillresp = await this.service.fetchRequest(
  //       //       'refillOrder/getAllRefillOrder'
              
  //       //   );
          
  //       //   this.Refillresp = Rfillresp;
  //         console.log("Refillresp",this.Refillresp);
        
    
  //         res(this.Refillresp);   
         
  //         this.loading = false;
             
  //           });
   

  
  // }
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

  Cancel() {
      this.modalReference.close();
  }

  // async onSearch() {
  //     // let startDate = this.searchFormGroup.controls['startDate'].value;
  //     // let endDate = this.searchFormGroup.controls['endDate'].value;
  //     let status = this.searchFormGroup.controls['status'].value;

    
       
  // }

  OnEditRefill(row) {
      // this.poCategory = row?.category;
      this.isgenieLocation = false;
      
      this.row = row;
      this.editmovOrder = true;
     event.stopPropagation();
      this.idRefillOrd = row.movHeaderId;
      this.isAdhocItemDetails = false;
      this.isMatDrawerOpened = true;
      this.isAdhocDetails = true;
      // this.SelectedContact = parseInt(row.contactPerson);
   
      console.log("SelectedContact",this.Contact)
        this.movementordFormGroup.patchValue({
          description: row.description,
          fromStallId: row.fromStallId,
          toStallId: row.toStallId,
          status: row.status,
       
      });
     
      this.headerStatus = row.status;
      this.totalquantities = row.totalPKQ+row.totalRefillQty+row.totalReturnQty;

      const rowStatus = row.status;

      

  }
  OnEditMovOrdItemClick(row,index:number) {
    event.stopPropagation();
        this.slotTableItem = row;
        this.editmode = true;
      this.isMatDrawerOpened = true;
      this.isAdhocItemDetails = true;
      this.isAdhocDetails = false;
      this.movItemId = row.movItemId;
    
          
      // //for setting packing true or received true

      this.refillSlotItemformGroup.patchValue({
        movHeaderId: row.movHeaderId,
        itemId: row.itemId,
        quantity: row.quantity,
       
          uom: row.uom,
          uomSize: row.uomSize, 
          totalQty: row.totalQty,
          
      });
      
this.refillSlotItemformGroup.controls['movHeaderId'].disable();
     
     
  }
  shouldHighlightRow(index: number, data,status) {
    // console.log("highloteData",data);
    return data.highliteindex <=5;
   
  }

  
  async onProductSelectionChange(selectedProductId: any){
    this.prodImage = `${selectedProductId}.webp`;
   
//    this.refillSlotItemformGroup.controls['prodId'].setValue(selectedProductId);
    
        
        
  }
 
  async SaveAdhocPoItemDetails(data, refillSlotId) {
      this.responseMessage = '';
      console.log(refillSlotId);
      let form = this.refillSlotItemformGroup.getRawValue();
  
      this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
          duration: 2 * 1000,
      });
     }

  OnAdhocClick() {
      this.isMatDrawerOpened = true;
      this.isAdhocDetails = true;
      this.editmode = false;
      this.editmovOrder = false;
     this.movementordFormGroup.reset;
     this.movementordFormGroup.controls['status'].setValue(this.movstatus[0])
      this.isgenieLocation = true;
  
  }
  async StatusChange(mov,value) {
    // let saleorderid = mov.saleorderid;
    mov.status = value;
    const updateresp = await this.service.postResponseAsText(
      'movementorderheader/createMovementOrderHeader',
      mov
  );
  if(updateresp){
    this.responseMessage="Data Saved Successfully";
    this._snackBar.open(this.responseMessage, '', { duration: 2000 });
   
  }
  else{
    this.responseMessage="Error while Saving Data";
    this._snackBar.open(this.responseMessage, '', { duration: 2000 });
  }
  const resp = await this.service.fetchRequest(
    'movementorderheader/getAllMovementOrderHeader'
    
);
  this.MovResp = resp['movementOrderHeaderList']
  this.MovResp.forEach(mov => {
    const Fromstall = this.stallData.find(stall => mov.fromStallId == stall.stallid);
    if (Fromstall) {
      mov['fromStallName'] = Fromstall.name;
mov['fromStallType'] = Fromstall.type;
    }
   
  });


this.MovResp.forEach(mov => {
  // Find 'toStall' in stallData
  this.stallData.find((stall)=>{
    if(mov.toStallId == stall.stallid){
      mov['toStallName'] = stall.name;
      mov['toStallType'] = stall.type;
    }
  })

});
  }
  onQuantityInput(event){
    let form = this.refillSlotItemformGroup.getRawValue();
    let Qty=form?.quantity
    let totalQty = Qty*form?.uomSize
    this.refillSlotItemformGroup.controls['totalQty'].setValue(totalQty)
  }
  async SaveAdhocPoDetails(movHeaderId) {
      let form = this.movementordFormGroup.getRawValue();
        form['movHeaderId'] = movHeaderId;
     
      if (form.status != 'Completed') {
          const updateresp = await this.service.postResponseAsText(
              'movementorderheader/createMovementOrderHeader',
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
      const resp = await this.service.fetchRequest(
        'movementorderheader/getAllMovementOrderHeader'
        
    );
    this.MovResp = resp['movementOrderHeaderList']
    this.MovResp.forEach(mov => {
      const Fromstall = this.stallData.find(stall => mov.fromStallId == stall.stallid);
      if (Fromstall) {
        mov['fromStallName'] = Fromstall.name;
  mov['fromStallType'] = Fromstall.type;
      }
     
    });

 
  this.MovResp.forEach(mov => {
    // Find 'toStall' in stallData
    this.stallData.find((stall)=>{
      if(mov.toStallId == stall.stallid){
        mov['toStallName'] = stall.name;
        mov['toStallType'] = stall.type;
      }
    })
 
  });
  //  await this.getRefillOrders();
    }
 
  OnCloseItem() {
    
      this.isAdhocDetails = false;
      this.isAdhocItemDetails = false;
      this.adhocpoitemid = 0;
      this.adhocpoid = 0;
      this.isMatDrawerOpened = false;
    
      this.movementordFormGroup.reset();
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
 
  OnSavemovementOrder() {
    if(!this.editmovOrder){
        this.movHeaderId = 0;
        this.SaveAdhocPoDetails(this.movHeaderId);
    }
    else{
        this.SaveAdhocPoDetails(this.row.movHeaderId);
    }
      
     
      this.isAdhocItemDetails = false;
      this.isMatDrawerOpened = false;
      this.isAdhocDetails = false;
    //   this.adhocpoitemid = 0;
  }

  async OnMovOrdItemClick() {
    //   this.adhocItemformGroup.enable();
      // this.router.routeReuseStrategy.shouldReuseRoute = () => true;
    this.editmode=false;
      if(this.editmovOrder){
        this.isMatDrawerOpened = true;
      this.isAdhocItemDetails = true;
      this.isAdhocDetails = false;
      this.refillSlotItemformGroup.reset;
      this.refillSlotItemformGroup.controls['movHeaderId'].setValue(this.row.movHeaderId)
      this.refillSlotItemformGroup.controls['movHeaderId'].disable()
      }
      else {
        this.isMatDrawerOpened = true;
        this.isAdhocItemDetails = true;
        this.isAdhocDetails = false;
        this.refillSlotItemformGroup.reset;
      }
 
  }
  async OnSaveMovItem(){
    let form = this.refillSlotItemformGroup.getRawValue();
   if(this.editmode) form['movItemId'] = this.movItemId 
   else form['movItemId']=0
    const resp =  await this.service.postResponseAsText(
      'movementorderitems/createMovementOrderItems',
      form
  );
  if(resp){
    this.responseMessage="Data Saved Successfully";
    this._snackBar.open(this.responseMessage, '', { duration: 2000 });
   
  }
  else{
    this.responseMessage="Error while Saving Data";
    this._snackBar.open(this.responseMessage, '', { duration: 2000 });
  }
  this.isMatDrawerOpened = false;
  const movresp = await this.service.fetchRequest(
    'movementorderitems/getAllMovementOrderItems'
    
);

this.movOrdItems = movresp['movementOrderItemsList'];
console.log("Refillorders",this.movOrdItems);
this.movOrdItems.forEach(item => {
  const prod = this.allItemsList.find(prod => item.itemId == prod.prodId);
  if (prod) {
    item['prodName'] = prod.prodName;
  }
});
this.MovResp.forEach((movOrd)=>{
movOrd['movorderItems']=[];
this.movOrdItems.forEach((item)=>{
  if(movOrd.movHeaderId==item.movHeaderId){
    movOrd.movorderItems.push(item)
  }
})
})

this.movOrdItemTable = new MatTableDataSource(this.Selectedobj?.movorderItems);
console.log("movOrdItemTable",this.Selectedobj?.movorderItems)
this.mobilePoItems = this.Selectedobj?.movorderItems;
  }
  onSelectProducts(value){ 
  console.log(value);
  let uom = '';
  let uomSize = '';
 
  const foundItem = this.filteredSuppItems.find(item => item.prodId == value);

  if (foundItem) {
    uom = foundItem.muom;
  
    // Find the variant within the found item where `prodId` matches
    const foundVariant = foundItem.variants.find(variant => variant.prodId == foundItem.prodId);
  
    if (foundVariant) {
      uomSize = foundVariant.uomSize;
    }
  }
  
  this.refillSlotItemformGroup.controls['uom'].setValue(uom);
  this.refillSlotItemformGroup.controls['uomSize'].setValue(uomSize);
  // this.saleorderitemFormgroup.controls['price'].setValue(uomPrice);
}

  async activatingChild(mov) {
   
   this.Selectedobj=mov
      this.MovResp.forEach((item) => {
        // pushing columns into mat-table based on condition
          if (item.movHeaderId == mov.movHeaderId){
          mov.childActive = !mov.childActive;
         
       
         
        }
          
          else item.childActive = false;
          
      });

     
  
      const resp = await this.service.fetchRequest(
        'movementorderitems/getAllMovementOrderItems'
        
    );
    
    this.movOrdItems = resp['movementOrderItemsList'];
    console.log("Refillorders",this.movOrdItems);
    this.movOrdItems.forEach(item => {
      const prod = this.allItemsList.find(prod => item.itemId == prod.prodId);
      if (prod) {
        item['prodName'] = prod.prodName,
        item['mrpprice'] = prod.mrpprice,
        item['uom'] = prod.muom
      }
    });
  this.MovResp.forEach((movOrd)=>{
    movOrd['movorderItems']=[];
    this.movOrdItems.forEach((item)=>{
      if(movOrd.movHeaderId==item.movHeaderId){
        movOrd.movorderItems.push(item)
      }
    })
  })
  this.movOrdItemTable = new MatTableDataSource(mov?.movorderItems);
  console.log("movOrdItemTable",mov?.movorderItems)
  this.mobilePoItems = mov?.movorderItems;
  
  }
  

  OnDelRefillOrder(popup) {
      this.modalReference = this.dialog.open(popup);
      this.delObj = {
        movHeaderId: this.row.movHeaderId,
      };
      console.log(this.delObj);
  }
  async OnConfirmMovOrd() {
      const delResp = await this.service.fetchRequestdel(
          'movementorderheader/deleteMovementOrderHeader',
          this.delObj
      );
      if(delResp){
        this.responseMessage = "Movement Order Successfully deleted"
      }
      else{
        this.responseMessage = "Movement Order deletion failed"
      }
      this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
        duration: 2 * 1000,
    });
      this.modalReference.close();
      this.movHeaderId = 0;
      // this.adhocpoitemid = 0;
      this.isMatDrawerOpened = false;
      this.isAdhocDetails = false;
      this.isAdhocItemDetails = false;
      const resp = await this.service.fetchRequest(
        'movementorderheader/getAllMovementOrderHeader'
        
    );
    this.MovResp = resp['movementOrderHeaderList']
    this.MovResp.forEach(mov => {
      const Fromstall = this.stallData.find(stall => mov.fromStallId == stall.stallid);
      if (Fromstall) {
        mov['fromStallName'] = Fromstall.name;
  mov['fromStallType'] = Fromstall.type;
      }
     
    });

 
  this.MovResp.forEach(mov => {
    // Find 'toStall' in stallData
    this.stallData.find((stall)=>{
      if(mov.toStallId == stall.stallid){
        mov['toStallName'] = stall.name;
        mov['toStallType'] = stall.type;
      }
    })
 
  });
      // this.getRefillOrders();
      // this.getAllDetails(0, 0, 'forDelete');
  }
  OnDel(modal) {
      this.modalReference = this.dialog.open(modal);
      this.delObj = {
        movItemId :  this.movItemId ,
      };
  }

 
  decline() {
    this.dialogRef.close();
      this.modalReference.close();
  }
  async confirm() {
    console.log("deObj",this.delObj)
      const delResp = await this.service.fetchRequestdel(
          'movementorderitems/deleteMovementOrderItems',
          this.delObj
      );
      // let adhocpoitemid = this.delObj['adhocpoitemid'];
      // this.getAllDetails(this.adhocpoid, this.adhocpoitemid, 'forDelete');

      this.modalReference.close();
      const resp = await this.service.fetchRequest(
        'movementorderitems/getAllMovementOrderItems'
        
    );
    
    this.movOrdItems = resp['movementOrderItemsList'];
    // console.log("Refillorders",this.movOrdItems);
    this.movOrdItems.forEach(item => {
      const prod = this.allItemsList.find(prod => item.itemId == prod.prodId);
      if (prod) {
        item['prodName'] = prod.prodName;
      }
    });
  this.MovResp.forEach((movOrd)=>{
    movOrd['movorderItems']=[];
    this.movOrdItems.forEach((item)=>{
      if(movOrd.movHeaderId==item.movHeaderId){
        movOrd.movorderItems.push(item)
      }
    })
  })
  this.movOrdItemTable = new MatTableDataSource(this.Selectedobj?.movorderItems);
  console.log("movOrdItemTable",this.Selectedobj?.movorderItems)
  this.mobilePoItems = this.Selectedobj?.movorderItems;
      this.movItemId = 0;
      this.isMatDrawerOpened = false;
      this.isAdhocDetails = false;
      this.isAdhocItemDetails = false;
  }

  CancelDel() {
      this.modalReference.close();
  }

}
