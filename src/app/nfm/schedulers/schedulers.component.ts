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

@Component({
  selector: 'app-schedulers',
  templateUrl: './schedulers.component.html',
  styleUrls: ['./schedulers.component.scss']
})
export class SchedulersComponent implements OnInit {

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
  schdulers: any;
  constructor(
      private service: ProjectService,

      private dialog: MatDialog,
  
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
       
        startDate: new FormControl(new Date()),
        endDate: new FormControl(new Date()),
        // type: new FormControl(''),
        // user: new FormControl('')
       
    });
      // const getresp = await this.service.fetchRequest(
      //     'wallet/getallwallets'
      // );
      // this.walletData = getresp;

      // console.log("walletData", this.walletData)
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
           

      const vendorResp = await this.service.fetchRequest(
          'rest/vendor/GetAllVendors'
      );
      this.vendorData = vendorResp['vendorList'];
    
   
  
  }
 
 

  async onSearch(){
    // this.filteredWalletData=[];
    // let useraccountid = this.searchFormGroup.controls['user'].value;
    // let type = this.searchFormGroup.controls['type'].value;
    let startDate = this.searchFormGroup.controls['startDate'].value;
      let endDate = this.searchFormGroup.controls['endDate'].value;
      let startDateFormatted = formatDate(startDate, 'YYYY-MM-dd HH:mm:ss', this.locale);
      let endDateFormatted = formatDate(endDate, 'YYYY-MM-dd HH:mm:ss', this.locale);
      console.log("startDate",startDateFormatted);
      const payload = {
        "startDateTime": startDateFormatted,
        "endDateTime": endDateFormatted
      }
      console.log("payload",payload)
      const resp = await this.service.fetchRequestPost(
        'scheduler/getDataByDateRange',
        payload
      )  
      this.schdulers = resp;
  }
  OnClose(value) {
      this.isContactDetails = false;

      this.isMatDrawerOpened = false;
      this.contactFormGroup.reset();

      this.editMode = false;

      if (value) {
          this.ngOnInit();
      }
      this.modalReference.close();
  }
  OnContactClick(row, event) {
      console.log(row);
      event.stopPropagation();
      this.contactManagementId = row.contactManagementId;
      this.isMatDrawerOpened = true;
      this.isContactDetails = true;
      this.editMode = true;
      this.contactFormGroup.patchValue({
          name: row.name,
          description: row.description,
          mobileNo: row.mobileNo,
          altMobileNo: row.altMobileNo,
          address: row.address,
          vendorId: row?.vendorId,
      });
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
