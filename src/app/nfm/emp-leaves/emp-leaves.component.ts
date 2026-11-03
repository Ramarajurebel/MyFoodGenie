import {
    Component,
    Inject,
    LOCALE_ID,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { formatDate } from '@angular/common';

@Component({
    selector: 'emp-leaves',
    templateUrl: './emp-leaves.component.html',
    styleUrls: ['./emp-leaves.component.scss'],
})
export class EmpLeavesComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    public empLeavesData = [];
    public roleManagementData = [];
    public moduleManagementData = [];
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
    isToggleEdit: boolean = false;
    private empLeaveId: number;

    modalReference: MatDialogRef<any>;
    public editMode = false;

    public delobj = {};
    isMatDrawerOpened = false;
    public statusData = ['Open', 'Approved', 'Declined'];

    empsData = [];
    allOperators = [];
    typeData = ['Personal', 'Health', 'Other'];
    constructor(
        private service: ProjectService,
        private dialog: MatDialog,
        @Inject(LOCALE_ID) public locale: string
    ) {}

    async ngOnInit() {
        //userTiles list for editmode
        const userTiles = JSON.parse(localStorage.getItem('userTilesList'));

        this.TableFieldsForm = new FormGroup({
            empId: new FormControl(),
            startDate: new FormControl(),
            endDate: new FormControl(),
            type: new FormControl(),
            comments: new FormControl(),
            status: new FormControl(),
        });
        const getRespEmp = await this.service.fetchRequest(
            'employeeleaves/getAllEmployeeLeaves'
        );
        this.empLeavesData = getRespEmp['employeeLeavesList'];

        console.log(this.empLeavesData);
        // employee details
        const resp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.allOperators = resp['stallOperatorList'];
        this.empsData = this.allOperators.filter((op) => {
            return op?.role === 'Employee';
        });
        this.empLeavesData.forEach((leave) => {
            this.empsData.forEach((emp) => {
                if (emp.stalloperatorid == leave.empId) {
                    leave['empName'] = emp.name;
                }
            });
        });
        console.log(this.empsData);
    }

    OnEdit(row) {
        this.empLeaveId = row.empLeaveId;
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.patchValue({
            empId: row.empId,
            startDate: row.startDate,
            endDate: row.endDate,
            type: row.type,
            comments: row.comments,
            status: row.status,
        });
    }
    OnClose() {
        this.isMatDrawerOpened = false;
        this.TableFieldsForm.reset();
        this.editMode = false;
    }
    OnAddClick() {
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.get('startDate').setValue(
            new Date().toISOString().split('T')[0]
        );
        this.TableFieldsForm.get('endDate').setValue(
            new Date().toISOString().split('T')[0]
        );
    }
    async OnSavePopup() {
        if (this.editMode) {
            const data = this.TableFieldsForm.value;
            if (data.startDate) {
                data.startDate = formatDate(
                    data.startDate,
                    'YYYY-MM-dd',
                    this.locale
                );
            }
            if (data.endDate) {
                data.endDate = formatDate(
                    data.endDate,
                    'YYYY-MM-dd',
                    this.locale
                );
            }

            data['empLeaveId'] = this.empLeaveId;
            const saveResp = await this.service.fetchRequestPost(
                'employeeleaves/createEmployeeLeaves',
                data
            );
            this.TableFieldsForm.reset();
            this.ngOnInit();
            this.isMatDrawerOpened = false;
            this.editMode = false;
        } else {
            let data = this.TableFieldsForm.value;
            data['empLeaveId'] = 0;
            const saveResp = await this.service.fetchRequestPost(
                'employeeleaves/createEmployeeLeaves',
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
            empLeaveId: this.empLeaveId,
        };
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'employeeleaves/deleteEmployeeLeaves',
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
