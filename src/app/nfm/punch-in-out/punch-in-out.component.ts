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
    selector: 'punch-in-out',
    templateUrl: './punch-in-out.component.html',
    styleUrls: ['./punch-in-out.component.scss'],
})
export class PunchInOutComponent implements OnInit {
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
    empSearchControl: FormControl = new FormControl();
    isToggleOnOff: FormControl = new FormControl();
    attePayload;
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
        this.empsData = this.empsData.filter((emps) => {
            return emps?.role == 'Employee' && emps.status == 'Active';
        });
        this.empsData.forEach((obj) => {
            obj['checked'] = false;
        });
        this.filteredEmps = this.empsData;
        const stresp = await this.service.fetchRequest('stall/getAllStalls');
        this.allCounterData = stresp['supplierList'];
        const currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        console.log(currentDate);
        const payload = {
            startDate: currentDate,
            endDate: currentDate,
        };
        const getempAttendance = await this.service.fetchRequest(
            'employeeattendance/getTodayEmployeeAttendance'
        );
        this.empAttendance = getempAttendance['employeeAttendanceList'];
        this.empAttendance.forEach((data) => {
            this.allCounterData.forEach((counter) => {
                if (data.counterId == counter.stallid) {
                    data['counterName'] = counter.name;
                }
            });
        });
        this.empsData.forEach((employee) => {
            this.empAttendance.forEach((attd) => {
                if (attd.employeeId == employee.stalloperatorid) {
                    employee['startTime'] = attd.startTime;
                    employee['endTime'] = attd.endTime;
                    employee['employeeAttendanceId'] =
                        attd.employeeAttendanceId;
                }
            });
        });
        this.empsData.forEach((empObj) => {
            if (empObj.startTime != null && empObj.startTime != '00:00:00') {
                // means value existed
                if (empObj.endTime != null && empObj.endTime != '00:00:00') {
                    // means end Time also existed so create new row toggle off
                    // this.isToggleOnOff.setValue(false);
                    empObj.checked = false;
                    // create new row
                    this.attePayload = payload;
                    empObj.employeeAttendanceId = 0;
                } else {
                    // means end Time is null, so update end Time toggle default on
                    // this.isToggleOnOff.setValue(true);
                    empObj.checked = true;
                    this.attePayload = payload;
                    this.attePayload.startTime = empObj.startTime;
                    // update end Time
                }
            } else {
                // if startTime is null, generally startTime is from scheduler so update that row with start time
                empObj.checked = false;
                this.attePayload = payload;

                // update start time
            }
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
    OnEmployeeSelect(event) {
        this.GetCurrentStatusOfEmployee(event.source.value);
    }
    GetCurrentStatusOfEmployee(empId) {
        let empObj;
        let matchFound = false;
        this.empAttendance.forEach((obj) => {
            if (obj.employeeId == empId && !matchFound) {
                empObj = obj;
                matchFound = true;
            }
        });
        const currentTime = formatDate(new Date(), 'HH:mm:ss', 'en-US');
        let payload = {
            employeeAttendanceId: empObj.employeeAttendanceId,
            employeeId: empObj.employeeId,
            employeeName: empObj.employeeName,
            date: formatDate(new Date(), 'YYYY-MM-dd', this.locale),
            startTime: '',
            endTime: '',
        };
        if (empObj.startTime != null && empObj.startTime != '00:00:00') {
            // means value existed
            if (empObj.endTime != null && empObj.endTime != '00:00:00') {
                // means end Time also existed so create new row toggle off
                this.isToggleOnOff.setValue(false);
                // create new row
                this.attePayload = payload;
                this.attePayload.employeeAttendanceId = 0;
            } else {
                // means end Time is null, so update end Time toggle default on
                this.isToggleOnOff.setValue(true);
                this.attePayload = payload;
                this.attePayload.startTime = empObj.startTime;
                // update end Time
            }
        } else {
            // if startTime is null, generally startTime is from scheduler so update that row with start time
            this.isToggleOnOff.setValue(false);
            this.attePayload = payload;

            // update start time
        }
    }
    async ToggleChange(event, obj) {
        this.attePayload = {
            employeeAttendanceId: obj.employeeAttendanceId,
            employeeId: obj.stalloperatorid,
            employeeName: obj.name,
            date: formatDate(new Date(), 'YYYY-MM-dd', this.locale),
            startTime: obj.startTime,
            endTime: '',
        };
        console.log(event);
        if (event.checked) {
            this.attePayload.startTime = formatDate(
                new Date(),
                'HH:mm:ss',
                'en-US'
            );
        } else {
            this.attePayload.endTime = formatDate(
                new Date(),
                'HH:mm:ss',
                'en-US'
            );
        }
        const saveResp = await this.service.fetchRequestPost(
            'employeeattendance/createEmployeeAttendance',
            this.attePayload
        );
        this.TableFieldsForm.reset();
        this.ngOnInit();
        this.isMatDrawerOpened = false;
        this.attePayload = null;
        this.editMode = false;
        this.isToggleOnOff.reset();
        console.log(this.attePayload);
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
    async onSearch() {}
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
        this.GetCurrentStatusOfEmployee(row?.employeeId);
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
        this.isToggleOnOff.reset();
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
