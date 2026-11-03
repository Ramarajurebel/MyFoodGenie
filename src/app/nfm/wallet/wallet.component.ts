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
import { MatSort } from '@angular/material/sort';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

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
    totalWalletCount: number=0;
    addwallet: boolean=false;
    showOthersTextbox: boolean=false;
    wallaccountId: any;
    walletback: boolean=false;
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
       
        startDate: new FormControl(new Date()),
        endDate: new FormControl(new Date()),
        type: new FormControl(''),
        user: new FormControl('')
       
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
      const getresp = await this.service.fetchRequest(
          'wallet/getallwallets'
      );
      this.walletData = getresp;

      console.log("walletData", this.walletData)
     let startDate = this.searchFormGroup.controls['startDate'].value;
      let endDate = this.searchFormGroup.controls['endDate'].value;
    
        let startDateFormatted = formatDate(startDate, 'YYYY-MM-dd', this.locale);
        let endDateFormatted = formatDate(endDate, 'YYYY-MM-dd', this.locale);
        
        console.log("startDateFormatted:", startDateFormatted);
        console.log("endDateFormatted:", endDateFormatted);
    
        // Attempt to parse the formatted date strings to timestamps
         this.startDateTimestamp = new Date(startDateFormatted).setHours(0,0,1);
        this.endDateTimestamp = new Date(endDateFormatted).setHours(23,59,59);
    
        // Log the timestamps
        console.log("startDateTimestamp:", this.startDateTimestamp);
        console.log("endDateTimestamp:",  this.endDateTimestamp);
        // this.filteredWalletData=this.walletData
        if(this.wallaccountId!=undefined){
            this.filteredWalletData = this.walletData.filter((wal) => wal.accountId == this.wallaccountId);
            console.log("filteredWalletData",this.filteredWalletData);
            this.walletback=true;
    }
    else if(this.wallaccountId==undefined){
        this.filteredWalletData=this.walletData;
        this.walletback=false;
    }
    
        this.totalWalletBalance = 0;

this.filteredWalletData.forEach((wallet)=>{
    this.totalWalletBalance += wallet.balance
})

this.totalWalletCount = 0;
this.totalWalletCount = this.filteredWalletData.length;

            //     this.filteredWalletData=this.walletData.filter(wallet => {
            //         // Create a new Date object from walletCreatedTime string
            //         let walletstartDateFormatted = formatDate(wallet.walletCreatedTime, 'YYYY-MM-dd HH:mm:ss', this.locale);
            //         let walletendDateFormatted = formatDate(wallet.walletUpdatedTime, 'YYYY-MM-dd HH:mm:ss', this.locale);
                    
            //         const walletCreatedTimeDate = Date.parse(walletstartDateFormatted);
            //         const walletUpdatedTime = Date.parse(walletendDateFormatted);
            //         // Use walletCreatedTimeDate as needed
            //         console.log("walletCreatedTimeDate",walletCreatedTimeDate);
            //         console.log("walletUpdatedTime",walletUpdatedTime);
            //         return (
            //             walletCreatedTimeDate >= this.startDateTimestamp && 
            //             walletCreatedTimeDate <=  this.endDateTimestamp &&
            //             walletUpdatedTime >= this.startDateTimestamp &&
            //             walletUpdatedTime <=  this.endDateTimestamp
            //         );
            //     });
            // console.log("filteredwalletData",this.filteredWalletData)

      const vendorResp = await this.service.fetchRequest(
          'rest/vendor/GetAllVendors'
      );
      this.vendorData = vendorResp['vendorList'];
      const userspayload={
        startDate:"2021-01-01 00:00:00",
        endDate:"2024-12-31 00:00:00"
      }
    //   const userResp = await this.service.fetchRequestPost(
    //     'user/getUsersList',
    //     userspayload
    //   );
    //   this.walletusers = userResp;
    //   console.log("walletuser",this.walletusers)
      this.filteredusers = this.walletData;
      this.itemControl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
          this.filterusers();
      });
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
    protected filterusers() {
        if (!this.filteredusers) {
            return;
        }
        // get the search keyword
        let search = this.itemControl.value;
        if (!search) {
           this.filteredusers = this.walletData.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
  
        // filter the banks
        this.filteredusers = this.walletData.filter(
            (bank) =>
                bank.userName.toLowerCase().includes(search) || 
                bank.accountId.toLowerCase().includes(search)
        );
    }
    onBackwallet(){
        console.log("Back");
        let url = "ORDERS"
        let jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
            this.router.navigate([`nfm/kitchen-tasks/${url}`], {
                skipLocationChange: true,
              
            });
        }
      
    }
  async activatingChild(wallet){
    this.wallet = wallet;
    let type = this.searchFormGroup.controls['type'].value;
    // const payload = {
    //     accountId: wallet.accountId,
    //     startDate: this.startDateTimestamp,
    //     endDate: this.endDateTimestamp
    // }
    // console.log("Payload",payload);
    // const transresp = await this.service.fetchRequesttransactionPost(
    //     'transaction/txnListByDates',
    //     payload
    // );
    // this.transactionsData = transresp;
    // console.log("transactionsData", transresp);

    const payload = {
        accountId: wallet.accountId,
      
    }
    console.log("Payload",payload);
    const transresp = await this.service.fetchRequesttransactionPost(
        'transaction/txnListByUser',
        payload
    );
    this.transactionsData = transresp;
    console.log("transactionsData", transresp);
   
   this.walletData.forEach((obj)=>{
    if(obj.walletId == wallet.walletId){
        wallet.childActive = !wallet.childActive;
    }
    else{
        obj.childActive=false
    }
});

this.walletData.forEach((obj)=>{
    obj['transactions'] = [];
    this.transactionsData.forEach((trans) => {
        if(obj.walletId==trans.walletId){
            
            obj.transactions.push(trans);
            obj.transactions.forEach((trans) => {
                trans.transactionUpdatedTime = formatDate(trans.transactionUpdatedTime, 'yyyy-MM-dd HH:mm:ss', this.locale);
            });
            obj.transactions.sort((a, b) => new Date(b.transactionUpdatedTime).getTime() - new Date(a.transactionUpdatedTime).getTime()); 
            
        }   

    });
   
   });
   console.log("wallettransTable",this.walletData)
 
   this.walletData.forEach((obj)=>{
    if(obj.walletId == wallet.walletId){
       
        this.wallettransTable = new MatTableDataSource(obj?.transactions);
            this.mobilePoItems = obj?.transactions;
    }
   });
//    if(type!=""){
//     this.wallettransTable = this.wallettransTable.filteredData.filter((obj)=>{
//         return obj.transactionType==type
//     })
// }
  }
  onTransactionDescChange(event: any){
    const selectedValue = event.target.value;

    if (selectedValue === 'Others') {
        this.showOthersTextbox = true;
    }
    else this.showOthersTextbox = false;
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
  async OnSavetrans(){
    let form = this.walletTransFormGroup.getRawValue();
    if(form.transactionType=='credit'){
        this.walletTransFormGroup.controls['orderId'].setValue(null)
    }
    const Payload = {
"accountId" : form.accountId,
"walletId" : form.walletId,
"amount": form.amount,
"transactionType" : form.transactionType,
"transactionDesc" : form.transactionDesc,
"pgStatus" : 'completed',
"orderId": form.orderId
    }
    if(Payload?.transactionDesc=='Others'){
        Payload['transactionDesc']=form.otherTransactionDesc
    }
    const saveResp = await this.service.fetchRequestPost(
        'transaction/createTransaction',
        Payload
    );
    this.isMatDrawerOpened = false;
    this.isWalletItemDetails = false;
    this.isWalletDetails = false;
    this.onSearch();
  }
 async onRefund(table){
    this.buttonClicked=true;
    const Payload={
        "transactionId": table.transactionId,
        "walletId": table.walletId,
        "accountId": table.accountId,
        "orderId": table.orderId,
        "amount":table.amount
    }
    console.log("Refund Paylaod",Payload);
    const saveResp = await this.service.fetchRequestPost(
        'transaction/refundToBank',
        Payload
    );
    const payload = {
        accountId: this.wallet.accountId,
      
    }
    console.log("Payload",payload);
    const transresp = await this.service.fetchRequesttransactionPost(
        'transaction/txnListByUser',
        payload
    );
    this.transactionsData = transresp;
 }
 async onAddWallet(){
    this.addwallet =true
    this.isMatDrawerOpened = true;
    this.isWalletDetails = true;
    this.isWalletItemDetails = false;
    this.walletFormGroup.reset();
    this.walletFormGroup.controls['accountId'].enable();
this.walletFormGroup.controls['balance'].enable();
 }
 async OnSaveWallet(){
    let form = this.walletFormGroup.getRawValue();
    const payload = {
        "walletId": null,
        "accountId": form.accountId,
        "balance": 0
    }
    console.log("walletform",form);
    console.log("walletPayload",payload);
    const saveResp = await this.service.fetchRequestPost(
        'wallet/createWallet',
        payload
    );
    this.isMatDrawerOpened=false;
    this.walletFormGroup.reset();
    this.onSearch();
 }
  async onSearch(){
    this.filteredWalletData=[];
    let useraccountid = this.searchFormGroup.controls['user'].value;
    let type = this.searchFormGroup.controls['type'].value;
    let startDate = this.searchFormGroup.controls['startDate'].value;
      let endDate = this.searchFormGroup.controls['endDate'].value;
    
        let startDateFormatted = formatDate(startDate, 'YYYY-MM-dd', this.locale);
        let endDateFormatted = formatDate(endDate, 'YYYY-MM-dd', this.locale);
        
        console.log("startDateFormatted:", startDateFormatted);
        console.log("endDateFormatted:", endDateFormatted);
    
        // Attempt to parse the formatted date strings to timestamps
         this.startDateTimestamp = new Date(startDateFormatted).setHours(0,0,1);
        this.endDateTimestamp = new Date(endDateFormatted).setHours(23,59,59);
    
        // Log the timestamps
        console.log("startDateTimestamp:", this.startDateTimestamp);
        console.log("endDateTimestamp:",  this.endDateTimestamp);
        const getresp = await this.service.fetchRequest(
            'wallet/getallwallets'
        );
        this.walletData = getresp;
    // --------based on wallet filter---------
    this.filteredWalletData=this.walletData.filter(wallet => {
      
        let walletstartDateFormatted = formatDate(wallet.walletCreatedTime, 'YYYY-MM-dd HH:mm:ss', this.locale);
        let walletendDateFormatted = formatDate(wallet.walletUpdatedTime, 'YYYY-MM-dd HH:mm:ss', this.locale);
        
        const walletCreatedTimeDate = Date.parse(walletstartDateFormatted);
        const walletUpdatedTime = Date.parse(walletendDateFormatted);
       
        console.log("walletCreatedTimeDate",walletCreatedTimeDate);
        console.log("walletUpdatedTime",walletUpdatedTime);
        return (
            (walletCreatedTimeDate >= this.startDateTimestamp && 
            walletCreatedTimeDate <=  this.endDateTimestamp &&
            walletUpdatedTime >= this.startDateTimestamp &&
            walletUpdatedTime <=  this.endDateTimestamp) 
        );
    });
console.log("filteredwalletData",this.filteredWalletData)

    if(useraccountid !=''){
   this.filteredWalletData = this.walletData.filter((wallet)=>{
    return wallet.accountId==useraccountid
   });
  
}
else{
    this.filteredWalletData = this.walletData
}
this.totalWalletBalance = 0;

this.filteredWalletData.forEach((wallet)=>{
    this.totalWalletBalance += wallet.balance
})
if(type!=""){
    this.wallettransTable = this.wallettransTable.filteredData.filter((obj)=>{
        return obj.transactionType==type
    })
}
this.totalWalletCount = 0;
this.totalWalletCount = this.filteredWalletData.length;
    // --------based on transaction filter--------
//         if(useraccountid!=""){
//  const payload = {
//         accountId: useraccountid,
//         startDate: this.startDateTimestamp,
//         endDate: this.endDateTimestamp
//     }
//     console.log("Payload",payload);
//     const transresp = await this.service.fetchRequesttransactionPost(
//         'transaction/txnListByDates',
//         payload
//     );
//     this.transactionsData = transresp;
//     console.log("transactionsData", transresp);
    
//    if(type!=''){
//     this.transactionsData = this.transactionsData.filter((trans)=>{
//         return trans.transactionType == type
//     })
//    }
   
//     this.transactionsData.forEach((obj)=>{
//         this.walletData.forEach((wal)=>{
//             if(obj. walletId==wal.walletId && !this.filteredWalletData.includes(wal)){ //pushes when this.filteredWalletData returns false
//                 return this.filteredWalletData.push(wal)
//             }
//         })
//     });
//     console.log("filteredData",this.filteredWalletData);
// }
// else{
//     alert("pls select Username")
// }
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
