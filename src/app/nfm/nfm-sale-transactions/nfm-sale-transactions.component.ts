import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';

@Component({
    selector: 'app-nfm-sale-transactions',
    templateUrl: './nfm-sale-transactions.component.html',
    styleUrls: ['./nfm-sale-transactions.component.scss'],
})
export class NfmSaleTransactionsComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    public saleTransactionsData = [];
    public roleManagementData = [];
    public moduleManagementData = [];
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
    isToggleEdit: boolean = false;
    private saleTransactionId: number;

    modalReference: MatDialogRef<any>;
    public editMode = false;

    public delobj = {};
    isMatDrawerOpened = false;
    public Status = ['Active', 'In Active'];
    operationData = ['Display', 'Manage'];
    empsData = [];
    allOperators = [];
    stallData = [];
    commissionNumber: number = 0;
    finalTokenAmount: number = 0;
    finalTotalAmount: number = 0;
    cashAmount: number = 0;
    vendorAmount: number = 0;
    vendorData = [];
    vendorId = 0;
    constructor(private service: ProjectService, private dialog: MatDialog) {}

    async ngOnInit() {
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.commissionNumber = 0;
        this.finalTokenAmount = 0;
        this.finalTotalAmount = 0;
        this.cashAmount = 0;
        this.vendorAmount = 0;
        //userTiles list for editmode
        const userTiles = JSON.parse(localStorage.getItem('userTilesList'));

        this.TableFieldsForm = new FormGroup({
            stallId: new FormControl(''),
            stallName: new FormControl(''),
            saleDate: new FormControl(''),
            vendorAmt: new FormControl(''),
            cashAmt: new FormControl(),
            tokens: new FormControl(),
            eachTokenAmt: new FormControl(),
            commission: new FormControl(),
            totalAmount: new FormControl(),
            vendorId: new FormControl(),
        });
        const stallResp = await this.service.fetchRequest('stall/getAllStalls');
        this.stallData = stallResp['supplierList'];
        console.log("stallData",this.stallData);
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        const getRespEmp = await this.service.fetchRequest(
            'saletransaction/getAllSaleTransaction'
        );
        this.saleTransactionsData = getRespEmp['saleTransactionList'];
        
        console.log(this.saleTransactionsData);
        // employee details
      
    }
    OnAdd() {
        this.isMatDrawerOpened = true;
        this.editMode = false;
        this.TableFieldsForm.controls['vendorId'].setValue(this.vendorId);
    }
    VendorEnter(value) {
        let commissionPerc = this.TableFieldsForm.controls['commission'].value;
        this.vendorAmount = value;
        let cashPlusVendor = this.vendorAmount + this.cashAmount;
        this.commissionNumber = (cashPlusVendor / 100) * commissionPerc;
    }
    CashEnter(value) {
        let commissionPerc = this.TableFieldsForm.controls['commission'].value;
        this.cashAmount = value;
        let cashPlusVendor = this.vendorAmount + this.cashAmount;
        this.commissionNumber = (cashPlusVendor / 100) * commissionPerc;
    }
    TokenEnter(value) {
        console.log(value);
        let eachTokenAmt = this.TableFieldsForm.controls['eachTokenAmt'].value;
        console.log('eachTkn', eachTokenAmt);
        this.finalTokenAmount = value * eachTokenAmt;
        let vendorAmount = this.TableFieldsForm.controls['vendorAmt'].value;
        let commissionPerc = this.TableFieldsForm.controls['commission'].value;
        let cashPlusVendor = this.vendorAmount + this.cashAmount;
        this.commissionNumber = (cashPlusVendor / 100) * commissionPerc;
        console.log(this.commissionNumber);
        this.finalTotalAmount =
            cashPlusVendor + this.finalTokenAmount - this.commissionNumber;
        console.log(this.finalTotalAmount);
        this.TableFieldsForm.controls['totalAmount'].setValue(
            this.finalTotalAmount
        );
    }
    OnModuleChange(value) {
        console.log(value);
        this.moduleManagementData.forEach((module) => {
            if (module.moduleId === parseInt(value))
                this.TableFieldsForm.controls['moduleName'].setValue(
                    module.moduleName
                );
        });
    }
    OnStallChange(value) {
        let stallName = '';
        let commission = 0;
        let tokenAmount = 0;
        this.stallData.forEach((stall) => {
            if (stall.stallid === parseInt(value)) {
                stallName = stall.name;
                tokenAmount = stall.tokenAmount;
                commission = stall.commission;
            }
        });
        this.TableFieldsForm.controls['stallName'].setValue(stallName);
        this.TableFieldsForm.controls['eachTokenAmt'].setValue(tokenAmount);
        this.TableFieldsForm.controls['commission'].setValue(commission);
    }

    OnEdit(row) {
        this.vendorAmount = row.vendorAmt;
        this.cashAmount = row.cashAmt;
        this.finalTokenAmount = row.tokens * row.eachTokenAmt;
        let cashPlusVendor = this.vendorAmount + this.cashAmount;
        this.commissionNumber = (cashPlusVendor / 100) * row.commission;
        this.saleTransactionId = row.saleTransactionId;
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.controls['vendorId'].disable();
        this.TableFieldsForm.patchValue({
            stallId: row.stallId,
            stallName: row.stallName,
            saleDate: row.saleDate,
            vendorAmt: row.vendorAmt,
            cashAmt: row.cashAmt,
            tokens: row.tokens,
            eachTokenAmt: row.eachTokenAmt,
            commission: row.commission,
            totalAmount: row.totalAmount,
            vendorId: row?.vendorId,
        });
    }
    OnClose() {
        this.isMatDrawerOpened = false;
        this.TableFieldsForm.reset();
        this.editMode = false;
        this.commissionNumber = 0;
        this.finalTokenAmount = 0;
        this.finalTotalAmount = 0;
        this.cashAmount = 0;
        this.vendorAmount = 0;
    }
    async OnSavePopup() {
        if (this.editMode) {
            const data = this.TableFieldsForm.getRawValue();
            data['totalAmount'] =
                this.cashAmount +
                this.vendorAmount +
                this.finalTokenAmount -
                this.commissionNumber;

            console.log(data);
            data['saleTransactionId'] = this.saleTransactionId;
            const saveResp = await this.service.fetchRequestPost(
                'saletransaction/createSaleTransaction',
                data
            );
            this.TableFieldsForm.reset();
            this.ngOnInit();
            this.isMatDrawerOpened = false;
            this.editMode = false;
        } else {
            let data = this.TableFieldsForm.getRawValue();
            console.log(data);
            data['saleTransactionId'] = 0;
            const saveResp = await this.service.fetchRequestPost(
                'saletransaction/createSaleTransaction',
                data
            );
            this.TableFieldsForm.reset();
            this.ngOnInit();
            this.isMatDrawerOpened = false;
            this.editMode = false;
        }
    }
    onDelPopup(dialog) {
        this.modalReference = this.dialog.open(dialog);
        this.delobj = {
            saleTransactionId: this.saleTransactionId,
        };
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'saletransaction/deleteSaleTransaction',
            this.delobj
        );
        this.isMatDrawerOpened = false;
        this.ngOnInit();
    }
    CloseDialog() {
        this.modalReference.close();
        this.editMode = false;
    }
    decline() {
        this.modalReference.close();
    }
}
