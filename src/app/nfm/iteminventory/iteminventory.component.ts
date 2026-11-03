import { Component, Inject, LOCALE_ID, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';

import { fill } from 'lodash';
import { RecipeItems } from './../../shared/classes/recipeItems';

import { MatDrawer } from '@angular/material/sidenav';

import { MatFormFieldModule } from '@angular/material/form-field';

import { Contacts } from 'app/shared/classes/contact';
import { formatDate } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-iteminventory',
  templateUrl: './iteminventory.component.html',
  styleUrls: ['./iteminventory.component.scss']
})
export class IteminventoryComponent implements OnInit {

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('snackBar', { static: true }) snackBar: TemplateRef<any>;
  drawerMode: 'side' | 'over';
  appearnce: MatFormFieldModule = fill;
  productsList = [];
  modalReference: any;
  contactManagementId: number = 0;
  mobileRecipeItems: RecipeItems[];
  itemControl: FormControl = new FormControl('');
  protected _onDestroy = new Subject<void>();
  public status = ['Open', 'In-progress', 'Completed'];
  public priority = ['VeryHigh', 'High', 'Medium', 'Low'];
  displayedColumns: string[] = ['transId','supId','uom','quantity','stall','expDate','type'];
  public transtype = ['credit','debit','refund']
public ItemInventory = ['Sort balance in DESC order','Sort balance in ASC order','Sort ExpDate in DESC order','Sort ExpDate in ASC order']
  public PgstatusData = ['initiated','completed']
  buttonClicked = false;
  delObj = {};
  isMatDrawerOpened: boolean = false;
  isRecipeItemDetails: boolean = false;
  isItemAdd: boolean = false;

  ItemInventoryFormGroup: FormGroup;
  ItemInventoryTransFormGroup: FormGroup;
  poFormGroup:FormGroup;
  public filtereditems = [];
  editMode: boolean;
  vendorData = [];
  vendorId: number = 0;
    InventoryData: any;
    selectedWallet: any;
    searchFormGroup: FormGroup;
    accountId: any;
    transactionsData: any;
   
    mobilePoItems: any;
    userslist: any;
    filteredusers: any;
    walletusers:any;
    filteredInventoryData: any[] = [];
    startDateTimestamp: number;
    endDateTimestamp: number;
    isbottomsheetOpened: boolean;
 
  
    itemdetails: any;

    totalWalletCount: number=0;
  productsByVariantsList: any;
  responseMessage: string;
  snackBarRef: any;
  itemstocktrans: any;
  itemStocktranstable: MatTableDataSource<unknown>;
  suppliersList: any;
  isItemdetails: boolean;
  item: any;
  ItemTransDetails: any;
  edittransaction: boolean=false;
  totalItemsCount: number = 0;
  totalBalance: number;
  allCounterData: any;
  stocktrans: any;
  adhocPoData: any;
  poitem: any;
 
  constructor(
      private service: ProjectService,
      private _router: Router,
      private dialog: MatDialog,
      private _snackBar: MatSnackBar,
      @Inject(LOCALE_ID) public locale: string,
      
  ) {
    const user = JSON.parse(localStorage.getItem('user'));
    this.accountId = user.accountId
  }

  async ngOnInit() {
      let vendorIdStr = localStorage.getItem('vendorId');
     
    //   console.log("user",user);
      if (vendorIdStr) {
          this.vendorId = parseInt(vendorIdStr);
      }
      this.searchFormGroup = new FormGroup({
       
     
        itemId: new FormControl('')
       
    });
    this.poFormGroup=new FormGroup({
      adhocpoid:new FormControl(''),
      Qty:new FormControl()
    });
    this.ItemInventoryFormGroup = new FormGroup({
      itemId: new FormControl(''),
      balanceQty: new FormControl(),
      minExpDate: new FormControl('')   
    });

    this.ItemInventoryTransFormGroup = new FormGroup({
      itemId: new FormControl(''),
      supId: new FormControl(''),
      purchasePrice: new FormControl(''),
      quantity: new FormControl(''),
      mfgDate: new FormControl(new Date()),
      expDate: new FormControl(new Date()),
      batch: new FormControl(''),
      type: new FormControl(''),
      refOrdId: new FormControl(),
      refTransId: new FormControl(),
      avblQty: new FormControl()
    });

      const getresp = await this.service.fetchRequest(
          'itemsinventory/getAllItemsInventory'
      );
      this.InventoryData = getresp['itemsInventoryList'];

      console.log("InventoryData", this.InventoryData);
      const resp = await this.service.fetchRequest('stall/getAllStalls');
      this.allCounterData = resp['supplierList'];
      this.totalItemsCount = 0;
      this.totalItemsCount = this.InventoryData.length
      this.totalBalance = 0;
      this.InventoryData.forEach((obj)=>{
        this.totalBalance += obj?.balanceQty
        console.log("obj",obj)
      })
        this.ProductsByVariants()
        this.itemControl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
            this.filterproducts();
        });
       
      const vendorResp = await this.service.fetchRequest(
          'rest/vendor/GetAllVendors'
      );
      this.vendorData = vendorResp['vendorList'];
      const suppResp = await this.service.fetchRequest(
        'supplier/getAllSuppliers'
    );
    this.suppliersList = suppResp['supplierList'];
    const transresp = await this.service.fetchRequest(
      'itemstocktrans/getAllItemStockTrans',
      
  );
  this.itemstocktrans = transresp['itemStockTransList'];
 
    const adhocresp = await this.service.fetchRequest(
            'adhocpo/getAllAdhocpo'
        );
        // this.allAdhocPo = JSON.parse(JSON.stringify(adhocresp['adhocpoList']));
        this.adhocPoData = adhocresp['adhocpoList'];
        this.adhocPoData = this.adhocPoData.filter((item) => {
          return item.status == 'Open';
      });
      console.log('adhocPoData',this.adhocPoData)
  }
  announceSortChange(sort: Sort) {
    let data = this.itemStocktranstable.data;

    if (!sort.active || sort.direction === '') {
        this.itemStocktranstable.data = data;
    } else {
        data = data.sort((a, b) => {
            const aValue = (a as any)[sort.active];
            const bValue = (b as any)[sort.active];
            
            // Compare aValue and bValue for sorting
            let compareValue = 0;
            if (aValue < bValue) {
                compareValue = -1;
            } else if (aValue > bValue) {
                compareValue = 1;
            }

            // Multiply by -1 if descending
            return compareValue * (sort.direction === 'asc' ? 1 : -1);
        });

        this.itemStocktranstable.data = data;
        console.log(data);
    }
}
  async ProductsByVariants(){
    const payload = {
        catid: 112,
        prodid: 0,
        vendorId: this.vendorId,
    };
    const getproducts = await this.service.fetchRequestPost(
        '/rest/product/ProductsByVariants',
        payload
    );
    this.productsByVariantsList = getproducts['productitems'];
    this.filtereditems = this.productsByVariantsList;
    this.InventoryData.forEach((obj)=>{
      this.productsByVariantsList.forEach((prod)=>{
        if(obj.itemId==prod.prodId){
          obj['itemName'] = prod.prodName,
          obj['quom'] = prod?.quom,
          obj['muom'] = prod?.muom,
          obj['mrpprice'] = prod?.mrpprice
        }
      })
    })
    
     
}
protected filterproducts() {
    if (!this.productsByVariantsList) {
        return;
    }
    // get the search keyword
    let search = this.itemControl.value;
    if (!search) {
        this.filtereditems = this.productsByVariantsList.slice();
        return;
    } else {
        search = search.toLowerCase();
    }

    // filter the banks
    // bank.prodName.toLowerCase().indexOf(search.toString()) > -1 ||
    this.filtereditems = this.productsByVariantsList.filter(
        (bank) =>
          bank.prodName.toLowerCase().indexOf(search.toString()) > -1 ||
            bank.prodId.toString().indexOf(search) > -1
    );
}
  async activatingChild(item){
    this.item = item;

    // console.log("transactionsData", transresp);
    this.InventoryData.forEach((obj)=>{
      if(obj.itemId == item.itemId){
        item.childActive = !item.childActive;
      }
      else{
          obj.childActive=false
      }
  });
    this.itemstocktrans.forEach((item)=>{
      if(item.orderType=='PURO'){
      this.suppliersList.forEach((supp)=>{
        if(item.supId==supp.supId){
          item.suppname=supp?.name
          
        }

      })
    }
   
      this.allCounterData.forEach((stall)=>{
if(item.stallId==stall.stallid){
  item.name = stall?.name;
  item.stalltype = stall?.type
}
      })
    })
   
  
       
            this.suppliersList.forEach((supp)=>{
              this.itemstocktrans.forEach((obj)=>{
                if(supp.supId==obj.supId){
                    obj['supName']=supp.name
                }
            })
        })

this.InventoryData.forEach((obj)=>{
    obj['itemstocktrans'] = [];
    this.itemstocktrans.forEach((trans) => {
        if(obj.itemId==trans.itemId){
            
            obj.itemstocktrans.push(trans);
           
            // obj.itemstocktrans.sort((a, b) => new Date(b.transactionUpdatedTime).getTime() - new Date(a.transactionUpdatedTime).getTime()); 
            
        }   

    });
   
   });
   console.log("inventorytranstable",this.InventoryData)
   this.itemstocktrans.forEach((item) => {
    if (item.orderType === 'PACO') {
      const parent = this.allCounterData.find(parent => item.supId == parent.stallid);
  
      if (parent) {
        item.paconame = parent.name;
        item.pacoType = parent.type;
      }
    }
  });
  
   this.InventoryData.forEach((obj)=>{
    
    if(obj.itemId == item.itemId){
      this.stocktrans = obj?.itemstocktrans;
      let minExpDate = null;
      obj.itemstocktrans.forEach((stockItem) => {
          const currentExpDate = stockItem.expDate ? new Date(stockItem.expDate) : null;

          if (currentExpDate) {
              if (!minExpDate || currentExpDate < minExpDate) {
                  minExpDate = currentExpDate;
              }
          }
      });

      // Assign the minimum expiry date to obj.expDate
      obj.expDate = minExpDate ? minExpDate.toISOString().split('T')[0] : null;
        this.itemStocktranstable = new MatTableDataSource(obj?.itemstocktrans);
            this.mobilePoItems = obj?.itemstocktrans;
    }

   });
console.log("stocktrans",this.stocktrans)
//    if(type!=""){
//     this.itemStocktranstable = this.itemStocktranstable.filteredData.filter((obj)=>{
//         return obj.transactionType==type
//     })
// }
  }
  onItemClick(row,event){
    this.itemdetails = row;
this.isMatDrawerOpened = true;
this.isItemAdd = true;
this.editMode = true;
this.ItemInventoryFormGroup.patchValue({
  itemId: row?.itemId,
      balanceQty: row?.balanceQty,
      minExpDate: row?.minExpDate   
   });

 }
 onSortSelectionChange(event){
  let selectedValue = event.value;  // Get the selected value from the event
  console.log('Selected Sort Option:', selectedValue);
  if (selectedValue === "Sort balance in DESC order") {
    this.InventoryData.sort((a, b) => {
      if (a.balanceQty > b.balanceQty) return -1;  // Descending order
      if (a.balanceQty < b.balanceQty) return 1;
      return 0;  // Equal values
    });
  } 
  else if (selectedValue === "Sort balance in ASC order") {
    this.InventoryData.sort((a, b) => {
      if (a.balanceQty < b.balanceQty) return -1;  // Ascending order
      if (a.balanceQty > b.balanceQty) return 1;
      return 0;  // Equal values
    });
  }
  else if(selectedValue === "Sort ExpDate in DESC order"){
    this.InventoryData.sort((a, b) => {
      if (a.minExpDate > b.minExpDate) return -1;  // Descending order
      if (a.minExpDate < b.minExpDate) return 1;
      return 0;  // Equal values
    });
  }
  else if (selectedValue === "Sort ExpDate in ASC order") {
    this.InventoryData.sort((a, b) => {
      if (a.minExpDate < b.minExpDate) return -1;  // Ascending order
      if (a.minExpDate > b.minExpDate) return 1;
      return 0;  // Equal values
    });
  }
 }
 onSort(){
  this.InventoryData.forEach((obj)=>{
    this.itemstocktrans.forEach((trans)=>{
      if(obj.itemId==trans.itemId) 
        obj['expDate']=trans.expDate
      return;
    })
  })
  console.log("InvenData",this.InventoryData);
  this.InventoryData.sort((a, b) => {
    // Compare expDate in descending order
    const dateA = new Date(a.expDate);
    const dateB = new Date(b.expDate);
    
    if (dateA > dateB) return -1;
    if (dateA < dateB) return 1;
    
    // If expDate is the same, compare balanceQty in descending order
    if (a.balanceQty > b.balanceQty) return -1;
    if (a.balanceQty < b.balanceQty) return 1;
    
    return 0; // If both expDate and balanceQty are the same
  });
 }
 onAddpo(item,modal){
  console.log("item",modal);
  this.poitem=item;
  this.modalReference = this.dialog.open(modal);
 }
 async onSavepo(){
let form = this.poFormGroup.getRawValue();

const item = this.filtereditems.find(item => item.prodId == this.poitem?.itemId);
const variant = item.variants.find(variant => variant.prodId == item.prodId);
const poid = this.adhocPoData.find(po=> po.adhocpoid==form.adhocpoid)
const payload={
  "adhocpoid": parseInt(form?.adhocpoid),
"adhocpoitemid":0,
"available":false,
"batchCode":null,
"itemId": this.poitem?.itemId,
"mfgDate":poid.date,
"mrpPerUom":item?.mrpprice,
"purPricePerUom":0.0,
 "purchaseUom":"",
"purchasedquantity":null,
"qtyPerUom":item?.quom,
"quantity":form?.Qty,
"supplierId":item?.supplier,
"taxAmount":0,
"totalAmt":0,
"totalGrossWt":0,
"uom":item?.muom,
"uomSize":variant?.uomSize,
"ispacked":false,
"isreceived":false
}
console.log("payload",payload)
const updateresp = await this.service.postResponseAsText(
  'adhocpoitem/createadhocpoitem',
  payload
);
this.modalReference.close()
 }
 async onAddItem(){
    this.isMatDrawerOpened = true;
    this.isItemAdd = true;
    this.isItemdetails = false;
    this.ItemInventoryFormGroup.reset();
    this.editMode = false;
    this.edittransaction = false; 
 }
 OnAddItemransClick(){
  this.ItemInventoryTransFormGroup.reset();
  this.isMatDrawerOpened = true;
  this.isItemAdd = false;
  this.isItemdetails = true;
 this.edittransaction = false;
  this.ItemInventoryTransFormGroup.controls['itemId'].setValue(this.itemdetails.itemId);
  this.ItemInventoryTransFormGroup.controls['itemId'].disable();
  this.ItemInventoryTransFormGroup.controls['supId'].enable();
  this.ItemInventoryTransFormGroup.controls['purchasePrice'].enable();
  this.ItemInventoryTransFormGroup.controls['mfgDate'].enable();
  this.ItemInventoryTransFormGroup.controls['expDate'].enable();
  this.ItemInventoryTransFormGroup.controls['batch'].enable();
 }
 onEdittransItem(row){
  console.log("row",row);
  this.edittransaction = true;
  this.ItemTransDetails = row;
  this.isMatDrawerOpened = true;
  this.isItemAdd = false;
  this.isItemdetails = true;
  this.ItemInventoryTransFormGroup.patchValue({
    itemId: row?.itemId,
    supId: row?.supId,
    purchasePrice: row?.purchasePrice,
    quantity: row?.quantity,
    mfgDate: row?.mfgDate,
    expDate: row?.expDate,
    batch: row?.batch,
    type: row?.type,
    refOrdId: row?.refOrdId,
    refTransId: row?.refTransId,
    avblQty:row?.avblQty
  });
  this.ItemInventoryTransFormGroup.controls['itemId'].disable();
  this.ItemInventoryTransFormGroup.controls['supId'].disable();
if(row.type=='debit'){
  this.ItemInventoryTransFormGroup.controls['type'].disable();
  this.ItemInventoryTransFormGroup.controls['batch'].disable();
  this.ItemInventoryTransFormGroup.controls['mfgDate'].disable();
  this.ItemInventoryTransFormGroup.controls['expDate'].disable();
  this.ItemInventoryTransFormGroup.controls['purchasePrice'].disable();
}
else if(row.type=='credit'){
  this.ItemInventoryTransFormGroup.controls['type'].disable();
  this.ItemInventoryTransFormGroup.controls['batch'].disable();
  this.ItemInventoryTransFormGroup.controls['mfgDate'].enable();
  this.ItemInventoryTransFormGroup.controls['expDate'].enable();
  this.ItemInventoryTransFormGroup.controls['purchasePrice'].disable();
}
 }
 onReford(table){

  if(table.orderType=="PACO"){
    let url = "PORDERS"
  let jwtToken = localStorage.getItem('jwtToken');
  if (jwtToken) {
      this._router.navigate([`nfm/kitchen-tasks/${url}`], {
          skipLocationChange: true,
          queryParams: { refOrder: table.refOrdId }
      });
  }
}
else if(table.orderType=="PURO"){
  let url = "PO"
let jwtToken = localStorage.getItem('jwtToken');
if (jwtToken) {
    this._router.navigate([`nfm/kitchen-tasks/${url}`], {
        skipLocationChange: true,
        queryParams: { refOrder: table.refOrdId }
    });
}
}
}
 async onSaveItem(){
  let form = this.ItemInventoryFormGroup.getRawValue();
  if(this.editMode){
    form['itemInventoryAutoId'] = this.itemdetails.itemInventoryAutoId; //itemdetails is global variable in onitemclick()
  }
  const itemresp = this.service.postResponseAsText(
    'itemsinventory/createItemsInventory',
    form
  );
  if(itemresp){
    this.responseMessage = 'Item Inventory Saved Successfully';
 
}
else{
    this.responseMessage = 'Item Invenory Save Failed'
}
this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
    duration: 2 * 1000,
});
const getresp = await this.service.fetchRequest(
  'itemsinventory/getAllItemsInventory'
);
this.InventoryData = getresp['itemsInventoryList'];
this.InventoryData.forEach((obj)=>{
  this.productsByVariantsList.forEach((prod)=>{
    if(obj.itemId==prod.prodId){
      obj['itemName'] = prod.prodName,
      obj['quom'] = prod?.quom,
      obj['muom'] = prod?.muom,
      obj['mrpprice'] = prod?.mrpprice
    }
  })
})
this.isMatDrawerOpened = false;
this.isItemAdd = false;
 }
 async onSaveTransItem(){
  let form = this.ItemInventoryTransFormGroup.getRawValue();
  console.log("form",form);
  form.refOrdId = parseInt(form?.refOrdId);
  form.refTransId = parseInt(form?.refTransId);
  if(this.edittransaction){
    form['itemStockAutoId'] = this.ItemTransDetails?.itemStockAutoId;
    console.log(this.ItemTransDetails);
    // form.avblQty = this.ItemTransDetails?.avblQty;
    form.createdDateTime = this.ItemTransDetails?.createdDateTime;
    form.orderType = this.ItemTransDetails?.orderType;
    form.purchaseUom  = this.ItemTransDetails?.purchaseUom;
    form.refundQty = this.ItemTransDetails?.refundQty;
    form.stallId = this.ItemTransDetails?.stallId;
    form.uomSize = this.ItemTransDetails?.uomSize;
    form.updatedDateTime = this.ItemTransDetails?.updatedDateTime
  }
  const resp = await this.service.postResponseAsText(
    'itemstocktrans/createItemStockTrans',
    form
  );
  if(resp){
    this.responseMessage = 'Item Stock Transaction Saved Successfully';
 
}
else{
    this.responseMessage = 'Item Stock Transaction Save Failed'
}
this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
    duration: 2 * 1000,
});
  const getresp = await this.service.fetchRequest(
    'itemsinventory/getAllItemsInventory'
);
this.InventoryData = getresp['itemsInventoryList'];

this.ProductsByVariants();
const transresp = await this.service.fetchRequest(
  'itemstocktrans/getAllItemStockTrans',
  
);
this.itemstocktrans = transresp['itemStockTransList'];

this.isMatDrawerOpened = false;

this.isItemdetails = false;
 }
  async onSearch(){
    this.filteredInventoryData=[];
    let itemId = this.searchFormGroup.controls['itemId'].value;
    this.totalBalance = 0;
    this.totalItemsCount = 0;

    if(itemId==''){
      const getresp = await this.service.fetchRequest(
        'itemsinventory/getAllItemsInventory'
    );
    this.InventoryData = getresp['itemsInventoryList'];
    
    this.totalItemsCount = this.InventoryData.length
  
    this.InventoryData.forEach((obj)=>{
      this.totalBalance += obj?.balanceQty
    });
    this.ProductsByVariants()
    }
    else{
      this.InventoryData = this.InventoryData.filter((obj)=>{
        this.totalBalance = obj?.balanceQty
        if(obj.itemId == itemId) return obj;
      })
      
      this.totalItemsCount = this.InventoryData.length
    }
 
   
  }
  OnClose(value) {
      this.isItemAdd = false;
      this.isItemdetails = false;
      this.isMatDrawerOpened = false;
     
    this.edittransaction = false; 
      this.editMode = false;

      if (value) {
          this.ngOnInit();
      }
      this.modalReference.close();
  }


 
  OnAddContact() {
      this.isMatDrawerOpened = true;
      this.isItemAdd = true;
    //   this.contactFormGroup.controls['vendorId'].setValue(this.vendorId);
      // this.isRecipeItemDetails = false;
  }

  
  onDeleteItem(popup){
    this.modalReference = this.dialog.open(popup);
    this.delObj = {
      itemInventoryAutoId: this.itemdetails.itemInventoryAutoId,
    };
    console.log(this.delObj);
   }
   onDeleteTransItem(popup){
    this.modalReference = this.dialog.open(popup);
    this.delObj = {
      itemStockAutoId: this.ItemTransDetails.itemStockAutoId,
    };
    console.log(this.delObj);
   }

   async onStockTransconfirm(){
    console.log("delObj",)
    const delResp = await this.service.fetchRequestdel(
        'itemstocktrans/deleteItemStockTrans',
        this.delObj
    );
    if(delResp){
      this.responseMessage = 'Item Tran Stock Deleted Successfully';
   
  }
  else{
      this.responseMessage = 'Delete Trans Stock Failed'
  }
  this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
      duration: 2 * 1000,
  });
  const getresp = await this.service.fetchRequest(
    'itemsinventory/getAllItemsInventory'
);
this.InventoryData = getresp['itemsInventoryList'];

this.ProductsByVariants();
this.modalReference.close();
this.isMatDrawerOpened = false;

   }
  async confirm() {
      console.log("delObj",)
          const delResp = await this.service.fetchRequestdel(
              'itemsinventory/deleteItemsInventory',
              this.delObj
          );
          if(delResp){
            this.responseMessage = 'Item Inventory Object Deleted Successfully';
         
        }
        else{
            this.responseMessage = 'Item Invenory Object Deletion Failed'
        }
        this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
            duration: 2 * 1000,
        });
        const getresp = await this.service.fetchRequest(
          'itemsinventory/getAllItemsInventory'
        );
        this.InventoryData = getresp['itemsInventoryList'];
        this.ProductsByVariants();
      this.modalReference.close();
      this.isMatDrawerOpened = false;
      this.isItemAdd = false;
  }
  CloseDialog() {
      this.modalReference.close();
     
  }

}
