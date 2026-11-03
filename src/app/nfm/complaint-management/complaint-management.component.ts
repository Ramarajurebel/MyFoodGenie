import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { fill } from 'lodash';
import { RecipeItems } from './../../shared/classes/recipeItems';

import { MatDrawer } from '@angular/material/sidenav';

import { MatFormFieldModule } from '@angular/material/form-field';
import { Complaints } from 'app/shared/classes/Complaints';
import { formatDate } from '@angular/common';

@Component({
    selector: 'app-complaint-management',
    templateUrl: './complaint-management.component.html',
    styleUrls: ['./complaint-management.component.scss'],
})
export class ComplaintManagementComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    appearnce: MatFormFieldModule = fill;

    complaintsData: Complaints[] = [];

    recipeItemFormgroup: FormGroup;
    productsList = [];
    modalReference: any;

    complaintId: number = 0;
    mobileRecipeItems: RecipeItems[];

    public status = ['Open', 'In-progress', 'Completed'];
    public priority = ['VeryHigh', 'High', 'Medium', 'Low'];

    delObj = {};
    isMatDrawerOpened: boolean = false;
    isRecipeItemDetails: boolean = false;
    isComplaintDetails: boolean = false;

    complaintsFormGroup: FormGroup;
    public filtereditems = [];
    employeesList = [];
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
        this.complaintsFormGroup = new FormGroup({
            title: new FormControl(''),

            description: new FormControl(''),
            priority: new FormControl(''),
            status: new FormControl(''),

            comments: new FormControl(),
            createdBy: new FormControl(),
            updatedBy: new FormControl(),
            createdDate: new FormControl(),
            updatedDate: new FormControl(),
            assignedTo: new FormControl(),
            dueDate: new FormControl(),
            vendorId: new FormControl(),
        });
        const getresp = await this.service.fetchRequest(
            'complaintsmanagement/getAllComplaintsManagement'
        );
        this.complaintsData = getresp['complaintsManagementList'];
        const resp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.employeesList = resp['stallOperatorList'];
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        this.employeesList = this.employeesList.filter((op) => {
            return op?.role === 'Employee';
        });
    }
    OnClose(value) {
        this.isComplaintDetails = false;

        this.isMatDrawerOpened = false;
        this.complaintsFormGroup.reset();

        this.editMode = false;

        if (value) {
            this.ngOnInit();
        }
        if (this.modalReference) {
            this.modalReference.close();
        }
    }
    OnComplaintClick(row, event) {
        this.complaintsFormGroup.controls['vendorId'].disable();
        this.complaintsFormGroup.controls['updatedBy'].disable();
        this.complaintsFormGroup.controls['updatedDate'].disable();
        this.complaintsFormGroup.controls['createdBy'].disable();
        this.complaintsFormGroup.controls['createdDate'].disable();
        console.log(row);
        event.stopPropagation();
        this.complaintId = row.complaintId;
        this.isMatDrawerOpened = true;
        this.isComplaintDetails = true;
        this.editMode = true;
        this.complaintsFormGroup.patchValue({
            title: row.title,
            description: row.description,
            priority: row.priority,
            status: row.status,
            comments: row.comments,
            createdBy: row?.createdBy,
            updatedBy: row?.updatedBy,
            createdDate: row?.createdDate,
            updatedDate: row?.updatedDate,
            assignedTo: row?.assignedTo,
            dueDate: row?.dueDate,
            vendorId: row?.vendorId,
        });
    }

    async OnSaveCompliant() {
        let user = JSON.parse(localStorage.getItem('user'));
        console.log(user);
        let data = this.complaintsFormGroup.getRawValue();
        if (data['dueDate']) {
            data['dueDate'] = formatDate(
                data['dueDate'],
                'YYYY-MM-dd',
                this.locale
            );
        }
        if (this.editMode) {
            data['complaintId'] = this.complaintId;
            data['updatedBy'] = user.userName;
        } else {
            data['createdBy'] = user.userName;
        }
        const saveResp = await this.service.fetchRequestPost(
            'complaintsmanagement/createComplaintsManagement',
            data
        );
        this.OnClose(true);
    }
    OnAddComplaint() {
        this.isMatDrawerOpened = true;
        this.isComplaintDetails = true;
        this.complaintsFormGroup.controls['updatedBy'].disable();
        this.complaintsFormGroup.controls['updatedDate'].disable();
        this.complaintsFormGroup.controls['vendorId'].setValue(this.vendorId);

        // this.isRecipeItemDetails = false;
    }

    OnDel(popup) {
        this.modalReference = this.dialog.open(popup);
        this.delObj = {};
        if (this.isComplaintDetails) {
            this.delObj['complaintId'] = this.complaintId;
        }
    }

    async confirm() {
        if (this.isComplaintDetails) {
            const delResp = await this.service.fetchRequestdel(
                'complaintsmanagement/deleteComplaintsManagement',
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
