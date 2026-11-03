import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NfmSigninComponent } from 'app/modules/admin/dashboards/project/nfm-signin/nfm-signin.component';
import { EnquiryCategory } from 'app/shared/tables/enquiry-platters-category';
import { categories } from './../../mock-api/apps/ecommerce/inventory/data';
import { formatDate } from '@angular/common';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDrawer } from '@angular/material/sidenav';
@Component({
    selector: 'app-enquiry-events',
    templateUrl: './enquiry-events.component.html',
    styleUrls: ['./enquiry-events.component.scss'],
})
export class EnquiryEventsComponent implements OnInit {
    modalOption: NgbModalOptions;
    Comments: FormControl = new FormControl('');
    modalReference: any;
    enquiryForm: FormGroup;
    categoryControl: FormControl = new FormControl('');
    selectedItemsList = [];
    relatedItemsList = [];
    categoryData = EnquiryCategory;
    showAddButton: boolean = false;
    selectedCategories = [];
    isenquiryLocation: boolean = false;
    // statusData = [
    //     'Open',
    //     'In Progress',

    //     'Payment Pending',
    //     'On Hold',
    //     'Cancelled',

    //     'Completed',
    // ];
    plattersData = [
        {
            name: 'Gold',
        },
        {
            name: 'Silver',
        },
        {
            name: 'Platinum',
        },
        {
            name: 'Diamond',
        },
    ];
    platterTypeItems = [];
    selectedPlatterType: string;
    tableReference: any;
    recipes = [];
    public enquiryData = [];

    public filterTemp = [];
    public editmode = false;
    public idenquiry: number;
    public selecteditems = [];
    public delObj = {};
    filteredRcps = [];
    tempEnquiryData = [];
    public Status = [
        'Open',
        'InProgress',
        'Completed'
    ];
    // public Category = ['Tiffins', 'Lunch', 'Snacks', 'Dinner', 'Party'];
    public Category = ['Managed by us', 'Rental','Shop', 'Genie', 'Kitchen', 'Tea Stall', 'Bakery' , 'Juice Stall', 'Food Counter', 'Hostels', 'Restaurant'];
    public Type = ['MRP Items', 'Fruits & Vegetables', 'Frozen food', 'Hot & Sweets', 'FMCG Products', 'Vegetables', 'Fruits', 'Groceries', 'Diary','Pickles'];
    isMatDrawerOpened: boolean = false;
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    validation: boolean = false;
    stallOperator = [];
    vendorData = [];
    vendorId = 0;
    genieEnqId: any;
    selectedEnq:any;
    showCustomInput: boolean = false;
    constructor(
        private dialog: NgbModal,
        @Inject(LOCALE_ID) public locale: string,
        private naviService: ProjectService
    ) {}

    async ngOnInit() {
        let vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }
        this.enquiryForm = new FormGroup({
            enqDate: new FormControl(''),
            name: new FormControl(''),
            type: new FormControl(''),
            area: new FormControl(''),
            category: new FormControl(''),
            contactName: new FormControl(''),
            contactNumber: new FormControl(),
            location: new FormControl(''),
            noOfMachines: new FormControl(''),
            rentalAmount: new FormControl(),
            commission:new FormControl(),
            referenceBy: new FormControl(''),
            status: new FormControl(''),
            locationOwnerName: new FormControl(''),
            locationOwnerContact:new FormControl(''),
            customReference:new FormControl('')
            // vendorId: new FormControl(),
        });
        const recpresp = await this.naviService.fetchRequest(
            'rcpheader/getAllrcpheader'
        );
        this.recipes = recpresp['rcpheaderList'];

        const getenqresp = await this.naviService.fetchRequest(
            'genieenquiry/getAllGenieEnquiry'
        );
        this.enquiryData = getenqresp['genieEnquiryList'];
        const vendorResp = await this.naviService.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        const stallResp = await this.naviService.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        console.log(stallResp);
        this.stallOperator = stallResp['stallOperatorList'];
        let custom={"name":"Custom"}
        this.stallOperator.push(custom);
        this.tempEnquiryData = this.enquiryData;
        // this.enquiryData = this.enquiryData.filter((item) => {
        //     if (item.status != 'Completed' && item.status != 'Cancelled')
        //         return item;
        // });
        // this.enquiryData.forEach((enq) => {
        //     this.stallOperator.forEach((op) => {
        //         if (enq.refernceby === op.mobile) {
        //             enq['opName'] = op.name;
        //         }
        //     });
        // });
        // To seperate all recipe ids below is the code

        // for(let i in this.enquiryData){
        //   this.enquiryData[i].itemidname.split(',')
        // }
        console.log(this.enquiryData);
        // for (let i in this.recipes) {
        //     for (let j in this.enquiryData) {
        //         if (
        //             this.enquiryData[j].itemidname ==
        //             this.recipes[i].rcpid + ''
        //         ) {
        //             this.enquiryData[j]['productname'] = this.recipes[i].name;
        //         }
        //     }
        // }
        // this.enquiryData.map((obj) => {
        //   return { ...obj, eventdate: new Date(obj.eventdate) };
        // });
        // for (let i in this.enquiryData) {
        //     this.enquiryData[i].eventdate = new Date(
        //         this.enquiryData[i].eventdate
        //     );
        // }
        // console.log(`Before sorting ${this.enquiryData}`);
        // const sortedAsc = this.enquiryData.sort(
        //     (objA, objB) => objA.eventdate.getTime() - objB.eventdate.getTime()
        // );
        // console.log(sortedAsc);
        // for (let i in sortedAsc) {
        //     sortedAsc[i].eventdate = formatDate(
        //         sortedAsc[i].eventdate,
        //         'YYYY-MM-dd',
        //         this.locale
        //     );
        // }
        // this.enquiryData = sortedAsc;
        // this.enquiryData.forEach((item) => {
        //     item['balance'] = item.totalamount - item.advanceamount;
        // });
        // this.filterTemp = this.enquiryData;
        // this.filteredRcps = this.recipes;
        // this.userSpecificEnquiries();
    }
    onReferenceChange(){
        const selectedValue = this.enquiryForm.get('referenceBy')?.value;
        if(selectedValue=='Custom') this.showCustomInput = true
        else this.showCustomInput = false
        // this.showCustomInput = selectedValue === 'Custom';
      
    }
    OnStatusChange(value) {
        console.log(value);
        if (value === 'Cancelled') {
            this.enquiryForm.controls['comments'].setValidators([
                Validators.required,
            ]);
        } else {
            this.enquiryForm.controls['comments'].setValidators(null);
        }
        this.enquiryForm.controls['comments'].updateValueAndValidity();
    }
    onLocationPress(location){
        console.log(location);
        const [latitude, longitude] = location.split(",");
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        window.open(url, '_blank');
    
      }
    OnAddClick() {
        // const userData = JSON.parse(localStorage.getItem('user'));
        // console.log(userData);
        this.enquiryForm.reset();
        this.showAddButton = false;
        this.isenquiryLocation = true;
        const currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        console.log(currentDate);
        this.enquiryForm.controls['enqDate'].setValue(currentDate);
        this.isMatDrawerOpened = true;
        // this.selectedEnq = 0;
        this.selectedEnq.comments = []; 
       
      
        // this.enquiryForm.controls['vendorId'].setValue(this.vendorId);
        // this.TablefieldsForm.controls['contactnumber'].enable();
        // this.modalReference = this.dialog.open(content, {
        //     ariaLabelledBy: 'modal-basic-title',
        // });
        // this.enquiryForm.controls['enqDate'].setValue(
        //     new Date().toISOString().split('T')[0]
        // );
        // this.enquiryForm.controls['eventdate'].setValue(
        //     new Date().toISOString().split('T')[0]
        // );
        // this.enquiryForm.controls['createdby'].setValue(userData.userName);
        // this.enquiryForm.controls['serviceneeded'].setValue('false');
        // this.enquiryForm.controls['tablesneeded'].setValue('false');
        // this.enquiryForm.controls['waterneeded'].setValue('false');
        // this.enquiryForm.controls['transportcharges'].setValue('false');
        this.enquiryForm.controls['status'].setValue('Open');
        console.log(this.enquiryForm.value);
        this.showCustomInput=false;
        this.editmode=false;
    }
    // OnPlatterSelect(value) {
    //     this.selectedCategories = this.categoryData[value];
    // }
    OnCategoryChange(value) {
        this.relatedItemsList = this.categoryData[value];
    }
    OnCloseMatDrawer() {
        this.editmode = false;
        this.isMatDrawerOpened = false;
        this.enquiryForm.reset();
    }
    OnEnquiryClick(row) {
        this.editmode = true;
        this.showAddButton = true;
        this.isenquiryLocation = false;
        // this.enquiryForm.controls['vendorId'].disable();
        this.isMatDrawerOpened = true;
        this.genieEnqId = row.genieEnqId;
        this.selectedEnq=row;
        // this.TablefieldsForm.controls['contactnumber'].disable();

        // let userData = JSON.parse(localStorage.getItem('user'));
        // let items= row.itemidname.split("-").join(",").split(",");
        // this.enquiryForm.controls['createdby'].setValue(userData.userName);
        this.enquiryForm.patchValue({
            enqDate: row?.enqDate,
            name: row?.name,
            type: row?.type.split(',').map(item => item.trim()),
            area:row?.area,
            category:row?.category,
            contactName: row?.contactName,
            contactNumber: row?.contactNumber,
           
            location: row?.location,
            noOfMachines: row?.noOfMachines,
            rentalAmount: row?.rentalAmount,
            commission: row?.commission,
          
            referenceBy: row?.referenceBy,
            status: row?.status,
            locationOwnerName: row?.locationOwnerName,
            locationOwnerContact: row?.locationOwnerContact,
            customReference:row?.referenceBy
        });
        if (row?.referenceBy && !this.stallOperator.some(op => op.name === row.referenceBy)) {
            this.enquiryForm.patchValue({ referenceBy: 'Custom', customReference: row.referenceBy });
            this.showCustomInput = true;
        } else {
            this.showCustomInput = false;
        }
    }
    OnClose() {
        this.isMatDrawerOpened = false;
    }

    OpenTable(modal) {
        this.selectedPlatterType = this.enquiryForm.controls[
            'plattertype'
        ].value;
        if (this.selectedPlatterType) {
            this.tableReference = this.dialog.open(modal);
            this.platterTypeItems = this.categoryData[this.selectedPlatterType];
        }
    }
    OnAddCommentClick(commentpopup){
        this.tableReference = this.dialog.open(commentpopup);
    }
   async onSaveComment(){
        const comments = this.Comments.value;
        const data = this.enquiryForm.getRawValue();
        console.log("editdata",data);
        console.log(comments);
        // let EnqId = data.genieEnqId
        let payload ={
            comments: this.Comments.value,
            genieEnqId:this.genieEnqId
        }
        const saveresp = await this.naviService.fetchRequestPost(
            'genieenquiry/createGenieCmt',
            payload
        );
        this.Comments.reset();
        this.tableReference.close();
        this.getAllEnquiries();
        this.isMatDrawerOpened = false;
    }
    onDelPopup(deletepopup) {
        this.delObj = {
            genieEnqId: this.genieEnqId,
        };

        this.modalReference = this.dialog.open(deletepopup, {
            ariaLabelledBy: 'modal-basic-title',
        });
    }
    decline() {
        this.modalReference.close();
    }
    async confirm() {
        const delresp = await this.naviService.fetchRequestdel(
            'genieenquiry/deleteGenieEnquiry',
            this.delObj
        );
        this.getAllEnquiries();
        this.modalReference.close();
        this.isMatDrawerOpened = false;
    }
    async onSavePopup() {
        if (this.enquiryForm.valid) {
            if (this.editmode == true) {
                const editdata = this.enquiryForm.getRawValue();
                editdata['genieEnqId'] = this.genieEnqId;
                if(editdata.referenceBy=="Custom"){
                    editdata.referenceBy = editdata.customReference
                }
                // editdata.contactnumber = editdata.contactnumber + '';

                // if(editdata.itemidname.length>=1){
                //   for(let i=0; i<items.length;i++){
                //     rcpname+=items[i].rcpid+"-"+items[i].name+","
                //   }
                // }
                editdata.type = editdata.type.join(",")
                const editresp = await this.naviService.fetchRequestPost(
                    'genieenquiry/createGenieEnquiry',
                    editdata
                );
                // this.editmode = false;
               

                this.getAllEnquiries();
                // this.modalReference.close();
                this.enquiryForm.reset();
                // this.enquiryForm.controls['comments'].setValidators(null);
                // this.enquiryForm.controls['comments'].updateValueAndValidity();
                this.isMatDrawerOpened = false;
            } else {
                const data = this.enquiryForm.getRawValue();
                if(data.referenceBy=="Custom"){
                    data.referenceBy = data.customReference
                }
                const decimalPlaces = 2;
                // const commissson = parseFloat(data.commission.toFixed(2));
                // const rentalAmt = parseFloat(data.rentalAmount.toFixed(2));
                //   data['commission']  =commissson;
                //   data['rentalAmount'] = rentalAmt;
                // data.contactNumber = data.contactNumber + '';
                // data.itemidname= data.itemidname[0].prodId;
                // data['genieEnqId'] = 0;
                data.type = data.type.join(",")

                delete data.customReference;
               
                const saveresp = await this.naviService.fetchRequestPost(
                    'genieenquiry/createGenieEnquiry',
                    data
                );
                this.getAllEnquiries();
                // this.modalReference.close();
                // if (data.status === 'Confirmed') {
                //     this.createEvent(data);
                // }
                this.enquiryForm.reset();
                // this.enquiryForm.controls['comments'].setValidators(null);
                // this.enquiryForm.controls['comments'].updateValueAndValidity();
                this.isMatDrawerOpened = false;
            }
        }
       this.editmode = false;
        //  else {
        //     this.validation = true;
        //     console.log(this.enquiryForm.valid);
        // }
    }
    async createEvent(data) {
        const payload = {
            keventname: data.eventname,
            platterscount: data.noofplates,
            totalitems: data.noofitems,
            totalcost: 0,
            status: 'Open',
            eventdate: data.eventdate,
            assdto: null,
            type: data?.category,
            seq: null,
            category: 'Curry Point',
            stallid: 0,
            instructions: data?.comments,
        };
        const eventResp = await this.naviService.fetchRequestPost(
            'keventheader/createkeventheader',
            payload
        );
    }
    async getAllEnquiries() {
        // const recpresp = await this.naviService.fetchRequest(
        //     'rcpheader/getAllrcpheader'
        // );
        // this.recipes = recpresp['rcpheaderList'];

        const getenqresp = await this.naviService.fetchRequest(
            'genieenquiry/getAllGenieEnquiry'
        );
        this.enquiryData = getenqresp['genieEnquiryList'];
        // this.enquiryData = this.enquiryData.filter((item) => {
        //     if (item.status != 'Completed' && item.status != 'Cancelled')
        //         return item;
        // });
        // for (let i in this.enquiryData) {
        //     this.enquiryData[i].eventdate = new Date(
        //         this.enquiryData[i].eventdate
        //     );
        // }
        // console.log(`Before sorting ${this.enquiryData}`);
        // const sortedAsc = this.enquiryData.sort(
        //     (objA, objB) => objA.enqDate.getTime() - objB.enqDate.getTime()
        // );
        // console.log(sortedAsc);
        // for (let i in sortedAsc) {
        //     sortedAsc[i].enqDate = formatDate(
        //         sortedAsc[i].enqDate,
        //         'YYYY-MM-dd',
        //         this.locale
        //     );
        // }
        // this.enquiryData = sortedAsc;
        // this.enquiryData.forEach((item) => {
        //     item['balance'] = item.totalamount - item.advanceamount;
        // });
        // this.filterTemp = this.enquiryData;
        // this.filteredRcps = this.recipes;
        // this.enquiryData.forEach((enq) => {
        //     this.stallOperator.forEach((op) => {
        //         if (enq.refernceby === op.mobile) {
        //             enq['opName'] = op.name;
        //         }
        //     });
        // });
        // this.userSpecificEnquiries();
    }
    userSpecificEnquiries() {
        // filter user mobile number data only
        // 9618812143
        let user = JSON.parse(localStorage.getItem('user'));
        let mobileNo = user.mobileNumber;
        // if (mobileNo != '9618812143' && mobileNo != '9618312365') {
        //     this.enquiryData = this.enquiryData.filter((data) => {
        //         return data.referenceby === mobileNo;
        //     });
        //     console.log(this.enquiryData);
        // } else {
        //     this.enquiryData = this.enquiryData;
        // }
    }
    OnCloseTable() {
        this.tableReference.close();
    }
}
