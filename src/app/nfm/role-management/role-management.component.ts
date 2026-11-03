import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-role-management',
    templateUrl: './role-management.component.html',
    styleUrls: ['./role-management.component.scss'],
})
export class RoleManagementComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    public roleManagementData = [];
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;

    private roleid: number;

    modalReference: MatDialogRef<any>;
    public editMode = false;

    public delobj = {};
    isMatDrawerOpened = false;
    public Status = ['Active', 'In Active'];
    constructor(private service: ProjectService, private dialog: MatDialog) {}

    async ngOnInit() {
        this.TableFieldsForm = new FormGroup({
            roleName: new FormControl(''),
            description: new FormControl(''),
            startTime: new FormControl(''),
            endTime: new FormControl(''),
            status: new FormControl(''),
            duration: new FormControl(''),
        });
        const getResp = await this.service.fetchRequest(
            'rolemanagement/getAllrolemanagement'
        );
        console.log(getResp);
        this.roleManagementData = getResp['rolemanagementList'];
    }
    OnEdit(row) {
        this.roleid = row.roleId;
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.patchValue({
            roleName: row.roleName,
            description: row.description,
            startTime: row.startTime,
            endTime: row.endTime,
            status: row.status,
            duration: row.duration,
        });
    }
    OnClose() {
        this.isMatDrawerOpened = false;
        this.TableFieldsForm.reset();
        this.editMode = false;
    }
    async OnSavePopup() {
        if (this.editMode) {
            const data = this.TableFieldsForm.value;
            data['roleId'] = this.roleid;
            const saveResp = await this.service.fetchRequestPost(
                'rolemanagement/createrolemanagement',
                data
            );
            this.TableFieldsForm.reset();
            this.ngOnInit();
            this.isMatDrawerOpened = false;
            this.editMode = false;
        } else {
            let data = this.TableFieldsForm.value;
            data['roleid'] = 0;
            const saveResp = await this.service.fetchRequestPost(
                'rolemanagement/createrolemanagement',
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
            roleId: row.roleId,
        };
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'rolemanagement/deleterolemanagement',
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
