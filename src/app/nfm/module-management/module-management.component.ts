import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModuleManagementClass } from './../../shared/classes/module-management';
@Component({
    selector: 'app-module-management',
    templateUrl: './module-management.component.html',
    styleUrls: ['./module-management.component.scss'],
})
export class ModuleManagementComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    public moduleManagementData = [];
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;

    private moduleId: number;

    modalReference: MatDialogRef<any>;
    public editMode = false;

    public delobj = {};
    isMatDrawerOpened = false;
    public Status = ['Active', 'In Active'];
    vendorData = [];
    vendorId = 0;
    constructor(private service: ProjectService, private dialog: MatDialog) {}

    async ngOnInit() {
        let vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }
        this.TableFieldsForm = new FormGroup({
            moduleName: new FormControl(''),
            description: new FormControl(''),
            status: new FormControl(''),
            vendorId: new FormControl(),
        });
        const getResp = await this.service.fetchRequest(
            'modulemanagement/getAllmodulemanagement'
        );
        console.log(getResp);
        this.moduleManagementData = getResp['modulemanagementList'];
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
    }
    OnEdit(row) {
        this.TableFieldsForm.controls['vendorId'].disable();
        this.moduleId = row.moduleId;
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.patchValue({
            moduleName: row.moduleName,
            description: row.description,

            status: row.status,
            vendorId: row?.vendorId,
        });
    }
    OnClose() {
        this.isMatDrawerOpened = false;
        this.TableFieldsForm.reset();
        this.editMode = false;
    }
    OnAdd() {
        this.isMatDrawerOpened = true;
        this.editMode = false;
        this.TableFieldsForm.controls['vendorId'].setValue(this.vendorId);
    }
    async OnSavePopup() {
        if (this.editMode) {
            const data = this.TableFieldsForm.getRawValue();
            data['moduleId'] = this.moduleId;
            const saveResp = await this.service.fetchRequestPost(
                'modulemanagement/createmodulemanagement',
                data
            );
            this.TableFieldsForm.reset();
            this.ngOnInit();
            this.isMatDrawerOpened = false;
            this.editMode = false;
        } else {
            let data = this.TableFieldsForm.getRawValue();
            data['roleid'] = 0;
            const saveResp = await this.service.fetchRequestPost(
                'modulemanagement/createmodulemanagement',
                data
            );
            this.TableFieldsForm.reset();
            this.ngOnInit();
            this.isMatDrawerOpened = false;
            this.editMode = false;
        }
    }
    onDelPopup(dialog, row) {
        this.modalReference = this.dialog.open(dialog);
        this.delobj = {
            moduleId: row.moduleId,
        };
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'modulemanagement/deletemodulemanagement',
            this.delobj
        );
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
