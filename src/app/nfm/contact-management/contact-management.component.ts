import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { fill } from 'lodash';
import { RecipeItems } from './../../shared/classes/recipeItems';

import { MatDrawer } from '@angular/material/sidenav';

import { MatFormFieldModule } from '@angular/material/form-field';

import { Contacts } from 'app/shared/classes/contact';
@Component({
    selector: 'app-contact-management',
    templateUrl: './contact-management.component.html',
    styleUrls: ['./contact-management.component.scss'],
})
export class ContactManagementComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    appearnce: MatFormFieldModule = fill;

    contactsData: Contacts[] = [];

    recipeItemFormgroup: FormGroup;
    productsList = [];
    modalReference: any;

    contactManagementId: number = 0;
    mobileRecipeItems: RecipeItems[];

    public status = ['Open', 'In-progress', 'Completed'];
    public priority = ['VeryHigh', 'High', 'Medium', 'Low'];

    delObj = {};
    isMatDrawerOpened: boolean = false;
    isRecipeItemDetails: boolean = false;
    isContactDetails: boolean = false;

    contactFormGroup: FormGroup;

    public filtereditems = [];
    editMode: boolean;
    vendorData = [];
    vendorId: number = 0;
    constructor(
        private service: ProjectService,

        private dialog: MatDialog,

        @Inject(LOCALE_ID) public locale: string
    ) {}

    async ngOnInit() {
        let vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }
        this.contactFormGroup = new FormGroup({
            name: new FormControl(''),

            description: new FormControl(''),
            mobileNo: new FormControl(''),
            altMobileNo: new FormControl(''),

            address: new FormControl(),
            vendorId: new FormControl(),
        });
        const getresp = await this.service.fetchRequest(
            'contactmanagement/getAllContactManagement'
        );
        this.contactsData = getresp['contactManagementList'];
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
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
