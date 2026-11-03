import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VenodorsList } from 'app/shared/classes/vendors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'emp-salaries',
    templateUrl: './emp-salaries.component.html',
    styleUrls: ['./emp-salaries.component.scss'],
})
export class EmpSalariesComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    public empSalaries = [];
    cashObj: {};
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
    isToggleEdit: boolean = false;
    private empSalaryId: number;

    modalReference: MatDialogRef<any>;
    public editMode = false;
    protected _onDestroy = new Subject<void>();
    public delobj = {};
    isMatDrawerOpened = false;
    public Status = ['Active', 'In Active'];
    operationData = ['Display', 'Manage'];
    purpose = ['Advance', 'Salary'];
    empsData = [];
    allOperators = [];
    allCounterData = [];
    filteredEmps = [];
    empControl: FormControl = new FormControl();
    constructor(private service: ProjectService, private dialog: MatDialog) {}

    async ngOnInit() {
        //userTiles list for editmode
        const userTiles = JSON.parse(localStorage.getItem('userTilesList'));

        this.TableFieldsForm = new FormGroup({
            empId: new FormControl(),
            salary: new FormControl(),
            counterId: new FormControl(),
            active: new FormControl(),
        });
        const resp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.empsData = resp['stallOperatorList'];
        this.filteredEmps = this.empsData;
        const stresp = await this.service.fetchRequest('stall/getAllStalls');
        this.allCounterData = stresp['supplierList'];
        const getEmpSalaries = await this.service.fetchRequest(
            'employeesalaries/getAllEmployeeSalaries'
        );
        this.empSalaries = getEmpSalaries['employeeSalariesList'];
        this.empSalaries.forEach((data) => {
            this.allCounterData.forEach((counter) => {
                if (data.counterId == counter.stallid) {
                    data['counterName'] = counter.name;
                }
            });
        });
        this.empSalaries.forEach((data) => {
            this.empsData.forEach((emp) => {
                if (data.empId == emp.stalloperatorid) {
                    data['empName'] = emp.name;
                }
            });
        });
        this.empControl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterEmps();
            });

        // employee details
    }

    OnEdit(row) {
        this.empSalaryId = row.empSalaryId;
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.patchValue({
            empId: row?.empId,
            salary: row?.salary,
            counterId: row?.counterId,
            active: row?.active,
        });
    }
    OnActiveChange(value) {
        this.TableFieldsForm.controls['active'].setValue(value);
    }
    onAddClick() {
        this.isMatDrawerOpened = true;
    }
    protected filterEmps() {
        if (!this.empsData) {
            return;
        }
        // get the search keyword
        let search = this.empControl.value;
        if (!search) {
            this.filteredEmps = this.empsData.slice();
            return;
        } else {
            search = search.toLowerCase();
        }

        // filter the banks
        this.filteredEmps = this.empsData.filter(
            (bank) => bank.name.toLowerCase().indexOf(search.toString()) > -1
        );
    }
    OnClose() {
        this.isMatDrawerOpened = false;
        this.TableFieldsForm.reset();
        this.editMode = false;
    }
    async OnSavePopup() {
        const data = this.TableFieldsForm.value;

        if (data.active == null || data.active === '') {
            data.active = false;
        }
        if (this.editMode) {
            data['empSalaryId'] = this.empSalaryId;
        } else {
            data['empSalaryId'] = 0;
        }
        const saveResp = await this.service.fetchRequestPost(
            'employeesalaries/createEmployeeSalaries',
            data
        );
        this.TableFieldsForm.reset();
        this.ngOnInit();
        this.isMatDrawerOpened = false;
        this.editMode = false;
    }
    onDelPopup(dialog) {
        this.modalReference = this.dialog.open(this.deleteDialog);
        this.delobj = {
            empSalaryId: this.empSalaryId,
        };
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'employeesalaries/deleteEmployeeSalaries',
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
