import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VenodorsList } from 'app/shared/classes/vendors';

@Component({
    selector: 'app-counter-management',
    templateUrl: './counter-management.component.html',
    styleUrls: ['./counter-management.component.scss'],
})
export class CounterManagementComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    public stalldata = [];
    public temparray = [];
    public extradata = [];
    public SeachFormGroup: FormGroup;
    private searchTxt;
    public operatorData = [];

    public visibleRow = false;
    public validation = true;
    public filterLeads = true;
    public Status=["Active", "In Active"];
    // public Category=["Fruits","Sweets"];
    public isSearching = false;
    modalReference: any;
    public editMode = false;
    public supplierData;
    public delobj = {};
    public stallid: string;
    public closeResult: string;
    type = ['Counter','Genie','online store','offline store','Warehouse','Store'];
    dispensetype = ['auto','manual'];
    matDrawerOpened: boolean = false;
    imageData: any;
    imageFile: any;
    vendorData: VenodorsList[] = [];
    mobileNumber: string = '';

    allCounterData = [];
    vendorId=0;
    filteredRefillIds: any[];
    CounterType: boolean=false;
    row: any;
    constructor(private dialog: NgbModal, private service: ProjectService) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.mobileNumber = user.mobileNumber;
    }

    async ngOnInit() {
        const vendorStr = localStorage.getItem('vendorId');
        if(vendorStr){
            this.vendorId = parseInt(vendorStr);
        }
        this.TableFieldsForm = new FormGroup({
            name: new FormControl(''),
            stallCode: new FormControl(''),
            orgId: new FormControl(''),
            address: new FormControl(''),
            locationOwner: new FormControl(''),
            locationOwnerContact: new FormControl(''),
            stallSupervisor: new FormControl(''),
            tokenAmount: new FormControl(),
            commission: new FormControl(),
            printLabel: new FormControl(),
            startDate: new FormControl(),
            isPrintDefault: new FormControl(),
            isGstEnabled: new FormControl(),
            vendorId: new FormControl(),
            type: new FormControl(),
            dispenseType:new FormControl(),
            status:new FormControl(),
            refStallId :new FormControl(),
            //  stallOperator : new FormControl('', Validators.required),
        });
        this.SeachFormGroup = new FormGroup({
            filterText: new FormControl(''),
        });
        const resp = await this.service.fetchRequest('stall/getAllStalls');
        this.allCounterData = resp['supplierList'];

        const respoperator = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.operatorData = respoperator['stallOperatorList'];
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        this.stalldata = this.allCounterData;
        this.UserBasedData();
        this.allCounterData.forEach((stall) => {
            // if(stall?.type=='Genie' || stall?.type=='Store'){
            //     this.CounterType = true;
            // }
            // else {
            //     this.CounterType = false;
            // }
            this.operatorData.forEach((op) => {
                if (stall.stallSupervisor === op.stalloperatorid)
                    stall['opName'] = op.name;
            });
        });



        this.validation = false;
    }
    UserBasedData() {

        if (this.vendorId) {
            this.stalldata = this.allCounterData.filter((stall) => {
                return stall.vendorId ==this.vendorId;
            });

            this.extradata = this.stalldata;
        } else {
            this.stalldata = [];
            this.extradata = [];
        }
    }
    addRow() {
        this.visibleRow = true;
    }
    OnCounterType(value){
        // console.log("CounterValue",value)
        this.filteredRefillIds=[];
        this.CounterType = false; 
        if(value=="Genie"){
            this.CounterType = true;
            this.allCounterData.forEach((stall)=>{
                if(stall.type=='Store'){
                    this.filteredRefillIds.push(stall)
                }
            })
        }
       else if(value=="Store"){
        this.CounterType = true;
            this.allCounterData.forEach((stall)=>{
                if(stall.type=='Warehouse'){
                    this.filteredRefillIds.push(stall)
                }
            })
        }
        console.log('filteredRefillIds',this.filteredRefillIds)
    }
    searchEntries() {
        this.stalldata = this.extradata;
        this.isSearching = true;
        this.filterLeads = true;
        this.searchTxt = this.SeachFormGroup.controls['filterText'].value;

        if (!this.stalldata || !this.stalldata.length)
            this.supplierData = this.supplierData;
        else if (!this.searchTxt || !this.searchTxt.length)
            this.supplierData = this.supplierData;
        else
            this.stalldata = this.stalldata.filter((item) => {
                return (
                    item.name
                        .toString()
                        .toLowerCase()
                        .indexOf(this.searchTxt.toLowerCase()) > -1 ||
                    item.address
                        .toString()
                        .toLowerCase()
                        .indexOf(this.searchTxt.toLowerCase()) > -1 ||
                    item.locationOwner
                        .toString()
                        .toLowerCase()
                        .indexOf(this.searchTxt.toLowerCase()) > -1 ||
                    item.locationOwnerContact
                        .toString()
                        .toLowerCase()
                        .indexOf(this.searchTxt.toLowerCase()) > -1 ||
                    item.stallSupervisor
                        .toString()
                        .toLowerCase()
                        .indexOf(this.searchTxt.toLowerCase()) > -1 ||
                    item.stallOperator
                        .toString()
                        .toLowerCase()
                        .indexOf(this.searchTxt.toLowerCase()) > -1
                );
            });
        this.isSearching = false;
    }
    searchReset() {
        this.SeachFormGroup.reset();
        this.ngOnInit();
        this.filterLeads = false;
    }
    open() {
        this.TableFieldsForm.markAsUntouched();
        this.validation = false;
        this.editMode = false;
        this.matDrawerOpened = true;
        this.TableFieldsForm.controls['vendorId'].setValue(this.vendorId);
        // this.modalReference = this.dialog.open(content, {
        //     ariaLabelledBy: 'modal-basic-title',
        // });
        this.TableFieldsForm.markAsUntouched();
    }
    onDel(){
        this.delobj = {
            stallid: this.row.stallid + '',
        };
        this.modalReference = this.dialog.open( {
            ariaLabelledBy: 'modal-basic-title',
        });
    }
    onDelPopup(template, row) {
        this.delobj = {
            stallid: row.stallid + '',
        };
        this.modalReference = this.dialog.open(template, {
            ariaLabelledBy: 'modal-basic-title',
        });
    }
    async confirm() {
        const delresp = await this.service.fetchRequestdel(
            'stall/deleteStall',
            this.delobj
        );
        this.modalReference.close();
        this.getrecords();
    }
    decline() {
        this.modalReference.close();
    }
    onEdit(data) {
        this.row=data;
        this.imageFile = '';
        this.TableFieldsForm.markAsUntouched();
        // this.modalReference = this.dialog.open(content, {
        //     ariaLabelledBy: 'modal-basic-title',
        // });
        this.TableFieldsForm.markAsUntouched();
        console.log(data);
        this.matDrawerOpened = true;
        this.stallid = data.stallid;
        this.imageFile = `data:image/png;base64,${data.imageData}`;
        // if(data?.type=="Genie" || data?.type=="Store") this.CounterType = true;
        // else this.CounterType = false;
        this.filteredRefillIds=[];
        this.CounterType = false; 
        if(data?.type=="Genie"){
            this.CounterType = true;
            this.allCounterData.forEach((stall)=>{
                if(stall.type=='Store'){
                    this.filteredRefillIds.push(stall)
                }
            })
        }
       else if(data?.type=="Store"){
        this.CounterType = true;
            this.allCounterData.forEach((stall)=>{
                if(stall.type=='Warehouse'){
                    this.filteredRefillIds.push(stall)
                }
            })
        }
        console.log('filteredRefillIds',this.filteredRefillIds)
        this.TableFieldsForm.patchValue({
            name: data.name,
            stallCode: data.stallCode,
            orgId: data.orgId,
            address: data.address,
            locationOwner: data.locationOwner,
            locationOwnerContact: data.locationOwnerContact,
            stallSupervisor: data.stallSupervisor,
            tokenAmount: data.tokenAmount,
            commission: data.commission,
            printLabel: data.printLabel,
            startDate: data.startDate,
            isPrintDefault: data.isPrintDefault,
            isGstEnabled: data.isGstEnabled,
            vendorId: data?.vendorId,
            type: data?.type,
            dispenseType: data?.dispenseType,
            status:data?.status,
            refStallId:data?.refStallId
            // stallOperator: data.stallOperator
        });

        this.editMode = true;
        this.TableFieldsForm.controls['refStallId'].setValue(data?.refStallId)
    }
    OnPrintDefault(value) {
        this.TableFieldsForm.controls['isPrintDefault'].setValue(value);
        console.log('value ', value);
    }
    OnGstCheck(value) {
        this.TableFieldsForm.controls['isGstEnabled'].setValue(value);
    }
    OnImageSelect(event) {
        this.imageData = event.target.files[0];
    }
    OnClose() {
        this.matDrawerOpened = false;
        this.TableFieldsForm.reset();
    }
    async getrecords() {
        const resp = await this.service.fetchRequest('stall/getAllStalls');
        this.allCounterData = resp['supplierList'];
        this.allCounterData.forEach((stall) => {
            this.operatorData.forEach((op) => {
                if (stall.stallSupervisor === op.stalloperatorid)
                    stall['opName'] = op.name;
            });
        });
        this.stalldata = this.allCounterData;
        if(this.modalReference){
            this.modalReference.close();
        }
        this.TableFieldsForm.reset();

    }
    async onSavePopup() {
        this.TableFieldsForm.markAllAsTouched();
        if (this.TableFieldsForm.valid) {
            if (this.editMode) {
                const formdata = this.TableFieldsForm.getRawValue();
                if (formdata['isGstEnabled'] == null) {
                    formdata['isGstEnabled'] = false;
                    formdata['isPrintDefault'] = false;
                }
                formdata['isGstEnabled'] = false;
                formdata['stallid'] = this.stallid + '';
                formdata['stallOperator'] = 0;
                if(formdata?.type!="Store" && formdata?.type!="Genie") formdata.refStallId=null
                const ediresp = await this.service.fetchRequestPost(
                    'stall/createStall',
                    formdata
                );
                if (this.imageData) {
                    const imageData = new FormData();
                    imageData.append('imageData', this.imageData);
                    imageData.append('stallId', this.stallid);
                    const resp = await this.service.postImageData(
                        'stall/saveImage',
                        imageData
                    );
                }

                this.getrecords();
                console.log(ediresp);
                console.log('In Edit Mode');
                this.editMode = false;
                this.matDrawerOpened = false;
                this.TableFieldsForm.reset();
            } else {
                this.editMode = false;
                const data = this.TableFieldsForm.getRawValue();
                if (data['isGstEnabled'] == null) {
                    data['isGstEnabled'] = false;
                    data['isPrintDefault'] = false;
                }
                data['stallOperator'] = 0;
                if(data?.type!="Store"&& data?.type!="Genie") data.refStallId=null
                // data["stallid"]="200";
                const saveresp = await this.service.fetchRequestPost(
                    'stall/createStall',
                    data
                );
                console.log(saveresp);
                if (this.imageData) {
                    const imageData = new FormData();
                    imageData.append('imageData', this.imageData);
                    imageData.append('stallId', saveresp);
                    const resp = await this.service.postImageData(
                        'stall/saveImage',
                        imageData
                    );
                }
                this.imageData = '';
                this.getrecords();

                this.matDrawerOpened = false;
                this.TableFieldsForm.reset();
            }
        } else {
            this.validation = true;
        }
    }
}
