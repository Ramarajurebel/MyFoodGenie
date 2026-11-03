import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
@Component({
    selector: 'employee-assignment',
    templateUrl: './employee-assignment.component.html',
    styleUrls: ['./employee-assignment.component.scss'],
})
export class EmployeeAssignmentComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    public empAssignmentData = [];
    public roleManagementData = [];
    public moduleManagementData = [];
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
    isToggleEdit: boolean = false;
    private empAssignmentId: number;

    modalReference: MatDialogRef<any>;
    public editMode = false;

    public delobj = {};
    isMatDrawerOpened = false;
    public Status = ['Active', 'In Active'];
    operationData = ['Display', 'Manage'];
    empsData = [];
    allOperators = [];
    vendorId:number;
    mobileNumber:string;
    constructor(private service: ProjectService, private dialog: MatDialog) {}

    async ngOnInit() {
        this.vendorId = parseInt(localStorage.getItem('vendorId'));
        const user = JSON.parse(localStorage.getItem('user'));
        this.mobileNumber = user.mobileNumber;
        //userTiles list for editmode
        const userTiles = JSON.parse(localStorage.getItem('userTilesList'));

        this.TableFieldsForm = new FormGroup({
            employeeId: new FormControl(''),
            empName: new FormControl(''),
            moduleId: new FormControl(''),
            moduleName: new FormControl(''),
            manage: new FormControl(),
            active: new FormControl(),
        });
        const getRespEmp = await this.service.fetchRequest(
            'employeeassignment/getAllemployeeassignment'
        );
        this.empAssignmentData = getRespEmp['employee_assignmentList'];
        console.log(this.empAssignmentData);
        // employee details
        if(this.mobileNumber=="9618812143"){
            const resp = await this.service.fetchRequest(
                'allOperators'
            );
            this.allOperators = resp['stallOperatorList'];
        }
        else{
            const resp = await this.service.fetchRequest(
                'stalloperator/getAllStallOperator'
            );
            this.allOperators = resp['stallOperatorList'];
        }

        this.empsData = this.allOperators.filter((op) => {
            return op?.role === 'Employee' || op.role=='Vendor';
        });
        console.log(this.empsData);
        const getRespModule = await this.service.fetchRequest(
            'modulemanagement/getAllmodulemanagement'
        );

        this.moduleManagementData = getRespModule['modulemanagementList'];
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
    OnEmployeeChange(value) {
        console.log(value);
        this.empsData.forEach((emp) => {
            if (emp.stalloperatorid === parseInt(value))
                this.TableFieldsForm.controls['empName'].setValue(emp.name);
        });
    }
    OnEdit(row) {
        this.empAssignmentId = row.empAssignmentId;
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.patchValue({
            employeeId: row.employeeId,
            empName: row.empName,
            moduleId: row.moduleId,
            moduleName: row.moduleName,
            manage: row.manage,
            active: row.active,
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
            data['empAssignmentId'] = this.empAssignmentId;
            const saveResp = await this.service.fetchRequestPost(
                'employeeassignment/createemployeeassignment',
                data
            );
            this.TableFieldsForm.reset();
            this.ngOnInit();
            this.isMatDrawerOpened = false;
            this.editMode = false;
        } else {
            let data = this.TableFieldsForm.value;
            data['empAssignmentId'] = 0;
            const saveResp = await this.service.fetchRequestPost(
                'employeeassignment/createemployeeassignment',
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
            empAssignmentId: this.empAssignmentId,
        };
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'employeeassignment/deleteemployeeassignment',
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
