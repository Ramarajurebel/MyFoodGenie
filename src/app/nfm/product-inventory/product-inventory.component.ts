import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';

import { fill } from 'lodash';
import { RecipeItems } from './../../shared/classes/recipeItems';

import { MatDrawer } from '@angular/material/sidenav';

import { MatFormFieldModule } from '@angular/material/form-field';

import { Contacts } from 'app/shared/classes/contact';
import { formatDate } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-product-inventory',
  templateUrl: './product-inventory.component.html',
  styleUrls: ['./product-inventory.component.scss']
})
export class ProductInventoryComponent implements OnInit {

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
  displayedColumns: string[] = ['transId','transcreatedDate','transendDate','type', 'amount','pgStatus','button'];
  public typeData = ['credit','debit','refund'];
  buttonClicked = false;
  delObj = {};
  isMatDrawerOpened: boolean = false;
  isRecipeItemDetails: boolean = false;
  isContactDetails: boolean = false;

  contactFormGroup: FormGroup;
  productFormGroup: FormGroup;
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
  VMSMachineDetails: any;
  genieDetails: any;
    Productsbygenie: any;
    isProductDetails: boolean;
    row: any;
    productsByVariantsList: any;
    itemChecked: boolean = false;
    refillQty: FormControl= new FormControl()
    form: any;
  constructor(
      private service: ProjectService,

      private dialog: MatDialog,
      private fb: FormBuilder,
  
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
    
      this.productFormGroup =  new FormGroup({
        prodId: new FormControl(''),
        descriptionrackId: new FormControl(''),
        rackId:  new FormControl(''),
        slotId: new FormControl(''),
        allotedQuantity: new FormControl(''),
        balanceCountInStall:new FormControl(''),
        reservedQty: new FormControl(''),
        refillQty:  new FormControl(''),
        correctionQty:  new FormControl('')
    });
    this.form = this.fb.group({
        rows: this.fb.array([])
      });
      const VMSresp = await this.service.fetchRequest(
        'geniemanagement/getAllGenieManagement'
    );
    console.log("VMSResp", VMSresp)
    this.genieDetails = VMSresp['genieManagementList'];
    console.log('Machinedetails', this.genieDetails);
   
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
    this.filtereditems = this.productsByVariantsList.filter(
        (bank) =>
            bank.prodName.toLowerCase().indexOf(search.toString()) > -1 ||
            bank.prodId.toString().indexOf(search) > -1
    );
}
  OnEditRow(row){
    console.log("table",row);
    this.row = row;
    this.isProductDetails = true;
    this.isMatDrawerOpened = true;
    this.productFormGroup.patchValue({
        prodId: row.prodId,
        rackId: row.rackId,
        slotId: row.slotId,
        allotedQuantity: row.allotedQuantity,
        balanceCountInStall: row.balanceCountInStall,
        reservedQty: row?.reservedQty,
        refillQty: row?.refillQty,
        correctionQty: row?.correctionQty 
    });
    // this.productFormGroup.controls['prodId'].disable();
    this.productFormGroup.controls['rackId'].disable();
    this.productFormGroup.controls['slotId'].disable();
    this.productFormGroup.controls['allotedQuantity'].disable();
    this.productFormGroup.controls['balanceCountInStall'].disable();
    this.productFormGroup.controls['reservedQty'].disable();
  }
async OnSave(){
    let form = this.productFormGroup.getRawValue();
    const payload = {
        "genieId": this.row.genieId,
        "rackId": form.rackId,
        "slotId": form.slotId,
        "itemId": form.prodId,
        "refillQty": parseInt(form.refillQty),
        "correctionQty":form.correctionQty
    }
    console.log('payload',payload)
    const saveResp = await this.service.fetchRequestPost(
        'genieprodinventory/updateInvCols',
        payload
    );
    this.onGenieChange(this.row.stallId);
    this.isMatDrawerOpened = false;
  }
  //   async activatingChild(wallet){
  //     this.wallet = wallet;
  //     let type = this.searchFormGroup.controls['type'].value;
      

  //     const payload = {
  //         accountId: wallet.accountId,
        
  //     }
  //     console.log("Payload",payload);
  //     const transresp = await this.service.fetchRequesttransactionPost(
  //         'transaction/txnListByUser',
  //         payload
  //     );
  //     this.transactionsData = transresp;
  //     console.log("transactionsData", transresp);
    
  //    this.walletData.forEach((obj)=>{
  //     if(obj.walletId == wallet.walletId){
  //         wallet.childActive = !wallet.childActive;
  //     }
  //     else{
  //         obj.childActive=false
  //     }
  // });

  // this.walletData.forEach((obj)=>{
  //     obj['transactions'] = [];
  //     this.transactionsData.forEach((trans) => {
  //         if(obj.walletId==trans.walletId){
              
  //             obj.transactions.push(trans);
  //             obj.transactions.forEach((trans) => {
  //                 trans.transactionUpdatedTime = formatDate(trans.transactionUpdatedTime, 'yyyy-MM-dd HH:mm:ss', this.locale);
  //             });
  //             obj.transactions.sort((a, b) => new Date(b.transactionUpdatedTime).getTime() - new Date(a.transactionUpdatedTime).getTime()); 
              
  //         }   

  //     });
    
  //    });
  //    console.log("wallettransTable",this.walletData)
  
  //    this.walletData.forEach((obj)=>{
  //     if(obj.walletId == wallet.walletId){
        
  //         this.wallettransTable = new MatTableDataSource(obj?.transactions);
  //             this.mobilePoItems = obj?.transactions;
  //     }
  //    });

  //   }
async onGenieChange(value){
    const payload = {  "stallid": value};
    const genieResp = await this.service.fetchRequestPost(
        '/genieinventory/getProductsByGenie',
        payload
    );

      this.Productsbygenie = genieResp['productitems']
      console.log("ProductsByGenie",this.Productsbygenie);
      const rowsArray = this.form.get('rows') as FormArray;
  rowsArray.clear();
      this.Productsbygenie.forEach(item => {
        const row = this.fb.group({
            refillQtyfield: [item.refillQty], // Initialize with the value from dataArray
            correctionQtyfield: [item.correctionQty]
        });
        (this.form.get('rows') as FormArray).push(row);
      });
}
 async OnCheck(table,event,i){
    console.log("table",table)
    const row = (this.form.get('rows') as FormArray).at(i);
  console.log(row.get('refillQtyfield').value);

    let tablerefillQty = parseInt(table.refillQty);
    this.itemChecked = false;
    if(table.refillQty>0) {
        this.itemChecked = true;
    }
    const payload = {
        "genieId": table.genieId,
        "rackId": table.rackId,
        "slotId": table.slotId,
        "itemId": table.prodId,
        "refillQty": row.get('refillQtyfield').value,
        "correctionQty":row.get('correctionQtyfield').value
    }
    console.log('payload',payload)
    const saveResp = await this.service.fetchRequestPost(
        'genieprodinventory/updateInvCols',
        payload
    );
    this.onGenieChange(table.stallId)
 }
  OnClose(value) {
      this.isContactDetails = false;
      this.isProductDetails = false;
      this.isMatDrawerOpened = false;
    //   this.contactFormGroup.reset();

      this.editMode = false;

      if (value) {
          this.ngOnInit();
      }
      this.modalReference.close();
  }
 

  async OnSaveContact() {
      let data = this.contactFormGroup.getRawValue();
      if (this.editMode) {
          data['contactManagementId'] = this.contactManagementId;
      }
      const saveResp = await this.service.fetchRequestPost(
          'contactmanagement/createContactManagement',
          data
      );
      this.OnClose(true);
  }
  OnAddContact() {
      this.isMatDrawerOpened = true;
      this.isContactDetails = true;
      this.contactFormGroup.controls['vendorId'].setValue(this.vendorId);
      // this.isRecipeItemDetails = false;
  }

  OnDel(popup) {
      this.modalReference = this.dialog.open(popup);
      this.delObj = {};
      if (this.isContactDetails) {
          this.delObj['contactManagementId'] = this.contactManagementId;
      }
  }

  async confirm() {
      if (this.isContactDetails) {
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
