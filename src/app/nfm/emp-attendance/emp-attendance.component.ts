import {
    Component,
    Inject,
    LOCALE_ID,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDrawer } from '@angular/material/sidenav';
import { TitleStrategy } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { formatDate } from '@angular/common';
@Component({
    selector: 'emp-attendance',
    templateUrl: './emp-attendance.component.html',
    styleUrls: ['./emp-attendance.component.scss'],
})
export class EmpAttendanceComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    employeeAttendanceId: number = 0;
    public TableFieldsForm: FormGroup;
    public empAttendance = [];

    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;

    modalReference: MatDialogRef<any>;
    public editMode = false;
    protected _onDestroy = new Subject<void>();
    public delobj = {};
    isMatDrawerOpened = false;
    empsData = [];
    allOperators = [];
    allCounterData = [];
    filteredEmps = [];
    empControl: FormControl = new FormControl();
    orderForm: FormGroup;
    totalHoursWorked: string;
    constructor(
        private service: ProjectService,
        private dialog: MatDialog,
        @Inject(LOCALE_ID) public locale: string
    ) {}

    async ngOnInit() {
        //userTiles list for editmode
        const userTiles = JSON.parse(localStorage.getItem('userTilesList'));

        this.TableFieldsForm = new FormGroup({
            employeeId: new FormControl(),
            employeeName: new FormControl(),
            date: new FormControl(),
            startTime: new FormControl(),
            endTime: new FormControl(),
        });
        this.orderForm = new FormGroup({
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
            empfilter: new FormControl(),
        });
        const resp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.empsData = resp['stallOperatorList'];
        this.filteredEmps = this.empsData;
        const stresp = await this.service.fetchRequest('stall/getAllStalls');
        this.allCounterData = stresp['supplierList'];
        const currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        console.log(currentDate);
        const payload = {
            startDate: currentDate,
            endDate: currentDate,
        };
        const getempAttendance = await this.service.fetchRequestPost(
            'employeeattendance/dateRangeAttendance',
            payload
        );
        this.empAttendance = getempAttendance['employeeAttendanceList'];
        this.empAttendance.forEach((data) => {
            this.allCounterData.forEach((counter) => {
                if (data.counterId == counter.stallid) {
                    data['counterName'] = counter.name;
                }
            });
        });
        // for hours worked

        this.empControl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterEmps();
            });
        this.calculateTotalHoursWorked();

        // employee details
    }
    formatTime(event: any, type: string) {
        // Format the time value to hh:mm:ss
        const timeParts = event.split(':');
        const hours = timeParts[0];
        const minutes = timeParts[1];
        const seconds = timeParts[2] || '00';
        if (type == 'Start') {
            this.TableFieldsForm.controls['startTime'].setValue(
                `${hours}:${minutes}:${seconds}`
            );
        } else {
            this.TableFieldsForm.controls['endTime'].setValue(
                `${hours}:${minutes}:${seconds}`
            );
        }
    }
    async onSearch() {
        let startDate = this.orderForm.controls['startDate'].value;
        let endDate = this.orderForm.controls['endDate'].value;
        startDate = formatDate(startDate, 'YYYY-MM-dd', this.locale);
        endDate = formatDate(endDate, 'YYYY-MM-dd', this.locale);
        const empFilter = this.orderForm.controls['empfilter'].value;
        const payload = {
            startDate,
            endDate,
        };
        const getempAttendance = await this.service.fetchRequestPost(
            'employeeattendance/dateRangeAttendance',
            payload
        );
        this.empAttendance = getempAttendance['employeeAttendanceList'];
        if (empFilter != '' && empFilter != null) {
            this.empAttendance = this.empAttendance.filter((data) => {
                return data.employeeId == parseInt(empFilter);
            });
        }
        this.calculateTotalHoursWorked();
    }
    OnEdit(row) {
        this.employeeAttendanceId = row.employeeAttendanceId;
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.patchValue({
            employeeId: row?.employeeId,
            employeeName: row?.employeeName,
            date: row?.date,
            startTime: row?.startTime,
            endTime: row?.endTime,
        });
    }
    OnEmployeeChange(value) {
        let empName = '';
        this.empsData.forEach((emp) => {
            if (emp.stalloperatorid == value) {
                empName = emp.name;
            }
        });
        this.TableFieldsForm.controls['employeeName'].setValue(empName);
        console.log(value);
    }
    onAddClick() {
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.get('date').setValue(
            new Date().toISOString().split('T')[0]
        );
    }
    calculateTotalHoursWorked() {
        this.totalHoursWorked = '';
        this.empAttendance.forEach((obj) => {
            if (
                obj.startTime != null &&
                obj.startTime != '00:00:00' &&
                obj.endTime != null &&
                obj.endTime != '00:00:00'
            ) {
                const startDateTime = new Date(`01/01/2000 ${obj.startTime}`);
                const endDateTime = new Date(`01/01/2000 ${obj.endTime}`);

                const timeDifference = Math.abs(
                    endDateTime.getTime() - startDateTime.getTime()
                );
                const hours = Math.floor(timeDifference / (1000 * 60 * 60));
                const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
                obj['hoursWorked'] = `${hours}:${minutes}`;
            }
        });

        const totalHours = this.empAttendance.reduce((acc, obj) => {
            const hoursWorked = obj.hoursWorked || '00:00';
            const [hours, minutes] = hoursWorked.split(':');
            return acc + Number(hours);
        }, 0);

        const totalMinutes = this.empAttendance.reduce((acc, obj) => {
            const hoursWorked = obj.hoursWorked || '00:00';
            const [hours, minutes] = hoursWorked.split(':');
            return acc + Number(minutes);
        }, 0);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        this.totalHoursWorked = `${
            totalHours + hours
        }:${minutes.toString().padStart(2, '0')}`;
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
        console.log(data);
        if (data.active == null || data.active === '') {
            data.active = false;
        }
        if (this.editMode) {
            data['employeeAttendanceId'] = this.employeeAttendanceId;
        } else {
            data['employeeAttendanceId'] = 0;
        }
        const saveResp = await this.service.fetchRequestPost(
            'employeeattendance/createEmployeeAttendance',
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
            employeeAttendanceId: this.employeeAttendanceId,
        };
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'employeeattendance/deleteEmployeeAttendance',
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
