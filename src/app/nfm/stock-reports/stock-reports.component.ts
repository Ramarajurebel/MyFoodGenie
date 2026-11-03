import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
@Component({
  selector: 'app-stock-reports',
  templateUrl: './stock-reports.component.html',
  styleUrls: ['./stock-reports.component.scss']
})
export class StockReportsComponent implements OnInit {
  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  drawerMode: 'side' | 'over';
  appearnce: MatFormFieldModule = fill;

  contactsData: Contacts[] = [];

  recipeItemFormgroup: FormGroup;
  productsList = [];
  modalReference: any;

  contactManagementId: number = 0;
  mobileRecipeItems: RecipeItems[];
  itemControl: FormControl = new FormControl('');
  protected _onDestroy = new Subject<void>();
  public status = ['Open', 'In-progress', 'Completed'];
  public priority = ['VeryHigh', 'High', 'Medium', 'Low'];
 
  public typeData = ['credit','debit','refund'];
  public transactionType = ['credit','debit','refund'];
  public PgstatusData = ['initiated','completed'];
  public transaction_description = ['Item not dispensed','Amount credited to MFG Account','Item mismatch','Direct Credit to account','Others'];
  buttonClicked = false;
  delObj = {};
  isMatDrawerOpened: boolean = false;
  isRecipeItemDetails: boolean = false;
  isWalletDetails: boolean = false;

  walletFormGroup: FormGroup;
  walletTransFormGroup: FormGroup;
  public filtereditems = [];
  editMode: boolean;
  vendorData = [];
  vendorId: number = 0;
    walletData: any;
    selectedWallet: any;
    searchFormGroup: FormGroup;
    accountId: any;
    transactionsData: any;
    wallettransTable: any;
    mobilePoItems: any;
    userslist: any;
    filteredusers: any;
    walletusers:any;
    filteredWalletData: any[] = [];
    startDateTimestamp: number;
    endDateTimestamp: number;
    isbottomsheetOpened: boolean;
    totalWalletBalance: number =0;
    wallet: any;
    isWalletItemDetails: boolean;
    walletDetails: any;
    Payload: { accountId: any; walletId: any; orderId?: any; amount: any; transactionType: any; transactionDesc: any; };
    displayedColumns: string[] = ['products','balanceQuantity','button'];
    OutofStockDataColumns: string[] = ['products','balanceQuantity','button'];
    totalWalletCount: number=0;
    addwallet: boolean=false;
    showOthersTextbox: boolean=false;
    wallaccountId: any;
    walletback: boolean=false;
  StockReportData: MatTableDataSource<any>;
  poitem: any;
  poFormGroup: FormGroup;
  adhocPoData: any;
  productsByVariantsList: any;
  stallData: any;
  ReportData: any;
  itemsaleReportData: any;
  itemStockControl: FormControl = new FormControl('');
  OutofStockData: MatTableDataSource<any>;
  selectedTab: string;
  stockProdId: string;
  ItemStockData: any;
  ItemStockQty: number;
 
  StockitemCount: any;
  Stockbalance: number;
  totalSalePrice: number = 0; // Add new property
  filterStockReportData: any;
  constructor(
    private service: ProjectService,
      private router: Router,
      private dialog: MatDialog,
      private route: ActivatedRoute,
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
    this.route.queryParams.subscribe(params => {
      this.wallaccountId = params['accountId'];
    });
    console.log("accountId",this.wallaccountId)
    this.searchFormGroup = new FormGroup({
     
      stallid: new FormControl('all'),
      prods: new FormControl('all')
     
  });
  this.poFormGroup=new FormGroup({
    adhocpoid:new FormControl(''),
    Qty:new FormControl()
  });
  this.walletFormGroup = new FormGroup({
      walletId: new FormControl(''),
      accountId: new FormControl(''),
      balance: new FormControl(),
      walletCreatedTime: new FormControl(''),
      walletUpdatedTime: new FormControl('')   
  });
  this.walletTransFormGroup = new FormGroup({
      walletId: new FormControl(''),
      accountId: new FormControl(''),
      amount: new FormControl(),
      orderId: new FormControl(''),
      transactionType: new FormControl(''),
      transactionDesc: new FormControl(''),
      pgStatus: new FormControl(''),
      otherTransactionDesc:new FormControl('')
  });
  let OutofStockData = await this.service.fetchRequest(
    'report/getitemoutofstock'
  );
  this.OutofStockData = new MatTableDataSource(OutofStockData);
  let ReportData = await this.service.fetchRequest(
    'report/getitemstockavail'
);

this.StockReportData =  new MatTableDataSource(ReportData)
this.filterStockReportData = ReportData
this.StockitemCount=0;
this.StockitemCount=this.StockReportData.data.length;
this.Stockbalance = 0;
this.totalSalePrice = 0;
this.StockReportData.data.forEach((stock)=>{
    this.Stockbalance += stock?.balanceQuantity || 0;
    this.totalSalePrice += (stock?.balanceQuantity || 0) * (stock?.mrpPrice || 0);
})
console.log('ReportData',ReportData)
const adhocresp = await this.service.fetchRequest(
  'adhocpo/getAllAdhocpo'
);
// this.allAdhocPo = JSON.parse(JSON.stringify(adhocresp['adhocpoList']));
this.adhocPoData = adhocresp['adhocpoList'];
this.adhocPoData = this.adhocPoData.filter((item) => {
return item.status == 'Open';
});
console.log('adhocPoData',this.adhocPoData)
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

const stallresp = await this.service.fetchRequest('stall/getAllStalls');
this.stallData = stallresp['supplierList'];
this.ReportData = this.stallData;
this.itemsaleReportData = this.stallData.filter((obj) => {
    return obj.status == "Active"
});
console.log("itemsaleReportData", this.itemsaleReportData)

this.selectedTab = 'Available Items';
console.log('OutofStockData',this.OutofStockData)
this.StockReportData.sort = this.sort;
this.OutofStockData.sort = this.sort;
this.itemStockControl.valueChanges
.pipe(takeUntil(this._onDestroy))
.subscribe(() => {
    this.filterStockproducts();
});
      
    const vendorResp = await this.service.fetchRequest(
        'rest/vendor/GetAllVendors'
    );
    this.vendorData = vendorResp['vendorList'];
    const userspayload={
      startDate:"2021-01-01 00:00:00",
      endDate:"2024-12-31 00:00:00"
    }
  
    this.filteredusers = this.walletData;
    
  //     this.walletusers.users.filter((user)=>{
  //         this.walletData.forEach((wallet)=>{
  //         if(wallet.accountId==user.accountId){
  //             wallet.username = user.userName
  //             this.filteredusers.push(user)
  //         }
  //     })
  //   })
  //   console.log("walletData",this.walletData)
  //   console.log("filteredusers",this.filteredusers)
  
}

protected filterStockproducts() {
  if (!this.productsByVariantsList) {
      return;
  }
  // get the search keyword
  let search = this.itemStockControl.value;
  if (!search) {
      this.filtereditems = this.productsByVariantsList.slice();
      return;
  } else {
      search = search.toLowerCase();
  }

  // filter the banks
  this.filtereditems = this.productsByVariantsList.filter(
      (bank) =>
          bank.prodName.toLowerCase().indexOf(search.toString()) > -1 ||
          bank.prodId.toString().indexOf(search) > -1
  );
}
OutofStockDataSort(sort: Sort){
  let data = this.OutofStockData.data;
  if (!sort.active || sort.direction === '') {
    this.OutofStockData.data = data;
} else {
    data = data.sort((a, b) => {
        const aValue = (a as any)[sort.active];
        const bValue = (b as any)[sort.active];
        return (
            (aValue < bValue ? -1 : 1) *
            (sort.direction === 'asc' ? 1 : -1)
        );
    });
    this.OutofStockData.data = data;
    console.log(data);
}
}
announceSortChange(sort: Sort) {
  let data = this.StockReportData.data;
  if (!sort.active || sort.direction === '') {
    this.StockReportData.data = data;
} else {
    data = data.sort((a, b) => {
        const aValue = (a as any)[sort.active];
        const bValue = (b as any)[sort.active];
        return (
            (aValue < bValue ? -1 : 1) *
            (sort.direction === 'asc' ? 1 : -1)
        );
    });
    this.StockReportData.data = data;
    console.log(data);
}
}
onTabClick(event: MatTabChangeEvent) {
  // You can use event.index to get the index of the selected tab
  // Or you can use event.tab.textLabel to get the label of the selected tab
  if (event.index === 0) {
    this.selectedTab = 'Available Items';
    this.StockitemCount=0;
this.StockitemCount=this.StockReportData.data.length;
this.Stockbalance = 0;
this.totalSalePrice = 0;
this.StockReportData.data.forEach((stock)=>{
    this.Stockbalance += stock?.balanceQuantity || 0;
    this.totalSalePrice += (stock?.balanceQuantity || 0) * (stock?.mrpPrice || 0);
})
  } else if (event.index === 1) {
    this.selectedTab = 'Out of Stock';
    this.StockitemCount=0;
    this.Stockbalance = 0;
this.StockitemCount=this.OutofStockData.data.length;

this.OutofStockData.data.forEach((stock)=>{
    this.Stockbalance += stock?.balanceQuantity || 0;
})
  }
console.log("selectedTab",this.selectedTab)
}
  onAddPo(Stock,modal){
    console.log("item",modal);
    this.poitem=Stock;
    this.modalReference = this.dialog.open(modal);
  }
  async onSavepo(){
    let form = this.poFormGroup.getRawValue();
const item = this.filtereditems.find(item => item.prodId == this.poitem?.productId);
const variant = item.variants.find(variant => variant.prodId == item.prodId);
const poid = this.adhocPoData.find(po=> po.adhocpoid==form.adhocpoid)
const payload={
  "adhocpoid": parseInt(form?.adhocpoid),
"adhocpoitemid":0,
"available":false,
"batchCode":null,
"itemId": this.poitem?.productId,
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
"uomsize":variant?.uomSize,
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
onTransactionDescChange(event: any){
  const selectedValue = event.target.value;

  if (selectedValue === 'Others') {
      this.showOthersTextbox = true;
  }
  else this.showOthersTextbox = false;
}
  async onStockItemclick(Stock,modal){
  this.stockProdId = '';
  const resp = await this.service.fetchRequest(
      'report/getstockavailbyitem',{ itemId: Stock.productId }
    
  );
this.ItemStockData = resp;
console.log("ItemStockData",this.ItemStockData);
this.ItemStockQty = 0;
this.ItemStockData.forEach((obj)=>{
  this.ItemStockQty += obj?.availQuantity || 0;
})
this.modalReference = this.dialog.open(modal);
this.stockProdId = this.productsByVariantsList.find((obj) => obj?.prodId == Stock.productId);
console.log(this.stockProdId)
}
onWalletClick(row,event){
  this.walletDetails = row;
this.isMatDrawerOpened = true;
this.isWalletDetails = true;
this.isWalletItemDetails = false;
this.walletFormGroup.patchValue({
  walletId: row?.walletId,
  accountId: row?.accountId,
  balance: row?.balance,
  walletCreatedTime: row?.walletCreatedTime,
  walletUpdatedTime: row?.walletUpdatedTime   
});
let walletstartDateFormatted = formatDate(row.walletCreatedTime, 'YYYY-MM-dd HH:mm:ss', this.locale);
let walletendDateFormatted = formatDate(row.walletUpdatedTime, 'YYYY-MM-dd HH:mm:ss', this.locale);
this.walletFormGroup.controls['walletCreatedTime'].setValue(walletstartDateFormatted);
this.walletFormGroup.controls['walletUpdatedTime'].setValue(walletendDateFormatted);
this.walletFormGroup.controls['walletId'].disable();
this.walletFormGroup.controls['accountId'].disable();
this.walletFormGroup.controls['balance'].disable();
this.walletFormGroup.controls['walletCreatedTime'].disable();
this.walletFormGroup.controls['walletUpdatedTime'].disable();
this.walletFormGroup.controls['']
}
async OnWalletItemClick(){
  this.walletTransFormGroup.reset();
  this.isMatDrawerOpened = true;
  this.isWalletDetails = false;
  this.isWalletItemDetails = true;
  this.walletTransFormGroup.controls['walletId'].setValue(this.walletDetails.walletId)
  this.walletTransFormGroup.controls['accountId'].setValue(this.walletDetails.accountId)
  this.walletTransFormGroup.controls['walletId'].disable()
  this.walletTransFormGroup.controls['accountId'].disable()
  
}




async onSearch(){
  const prodId = this.searchFormGroup.controls['prods'].value;
        const stallId = this.searchFormGroup.controls['stallid'].value;
        console.log("prodId",prodId)
        console.log('stallId',stallId)
        if(this.selectedTab=="Available Items"){
          if(stallId!="all"){
          const resp = await this.service.fetchRequest(
            'report/getavailbystall',{ stallId: stallId }
        );
        this.StockReportData.data = resp;
        // this.StockReportData.data.forEach((stock) => {
        //   // Find the matching object in filterStockReportData based on productId
        //   const matchingProduct = this.filterStockReportData.find((obj) => stock.itemId == obj.productId);
        
        //   // If a match is found, update the properties
        //   if (matchingProduct) {
        //     stock.productId = stock.itemId;  // Update productId
        //     stock.balanceQuantity = stock.availQuantity;  // Update balanceQuantity
        //     stock.productName = stock.name;
        //     stock.mrpPrice=matchingProduct.mrpPrice;
        //     stock.uom=matchingProduct.uom
        //   }
        // });
        // if(stallId!=''&&prodId!='all'){
        //   this.StockReportData.data = this.StockReportData.data.filter((obj) => obj.productId == prodId);
        // }
        // else if(stallId==''&&prodId!='all'){
        //   this.StockReportData.data = this.StockReportData.data.filter((obj) => obj.productId == prodId);
        // }
        // else if(stallId!=''&&prodId==''){
        //   this.StockReportData.data = this.StockReportData.data.filter((obj) => obj.productId == prodId);
        // }
      }
       

if(stallId=='all'&&prodId!='all'){
  this.StockReportData.data = this.StockReportData.data.filter((obj) => obj.productId == prodId);
}
else if(stallId=='all'&&prodId=='all'){
  this.StockReportData.data=this.filterStockReportData
}

this.StockitemCount=this.StockReportData.data.length;
this.Stockbalance = 0;
this.totalSalePrice = 0;
this.StockReportData.data.forEach((stock)=>{
this.Stockbalance += stock?.balanceQuantity || 0;
this.totalSalePrice += (stock?.balanceQuantity || 0) * (stock?.mrpPrice || 0);
})
// else if(stallId=='all' && prodId=='all') this.StockReportData = this.filteredStockReportData
       
}

        
        
        
}
 
  
OnClose(value) {
  this.addwallet = false;
    this.isWalletDetails = false;
    this.isWalletItemDetails = false;
    this.isMatDrawerOpened = false;
    this.walletTransFormGroup.reset();

    this.editMode = false;

    if (value) {
        this.ngOnInit();
    }
    this.modalReference.close();
}



OnAddContact() {
    this.isMatDrawerOpened = true;
    this.isWalletDetails = true;
  //   this.contactFormGroup.controls['vendorId'].setValue(this.vendorId);
    // this.isRecipeItemDetails = false;
}

OnDel(popup) {
    this.modalReference = this.dialog.open(popup);
    this.delObj = {};
    if (this.isWalletDetails) {
        this.delObj['contactManagementId'] = this.contactManagementId;
    }
}

async confirm() {
    if (this.isWalletDetails) {
        const delResp = await this.service.fetchRequestdel(
            'contactmanagement/deleteContactManagement',
            this.delObj
        );
    }
    this.modalReference.close();
    this.OnClose(true);
}
CloseDialog() {
    this.modalReference.close();
   
}

}
