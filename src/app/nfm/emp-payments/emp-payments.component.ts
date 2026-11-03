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
import { VenodorsList } from 'app/shared/classes/vendors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { formatDate } from '@angular/common';
@Component({
    selector: 'emp-payments',
    templateUrl: './emp-payments.component.html',
    styleUrls: ['./emp-payments.component.scss'],
})
export class EmpPaymentsComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    public cashManagementData = [];
    cashObj: {};
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
    isToggleEdit: boolean = false;
    private cashManagementId: number;

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
    empSearchControl: FormControl = new FormControl();
    startDateCtrl: FormControl = new FormControl();
    endDateCtrl: FormControl = new FormControl();
    totalAmount: number = 0;
    vendorData = [];
    constructor(
        private service: ProjectService,
        private dialog: MatDialog,
        @Inject(LOCALE_ID) public locale: string
    ) {}

    async ngOnInit() {
        //userTiles list for editmode
        const userTiles = JSON.parse(localStorage.getItem('userTilesList'));

        this.TableFieldsForm = new FormGroup({
            date: new FormControl(''),
            stallId: new FormControl(new Date()),
            name: new FormControl(''),
            employeeId: new FormControl(''),
            status: new FormControl(''),
            purpose: new FormControl(''),
            advance: new FormControl(''),
            salary: new FormControl(''),
            amountCleared: new FormControl(''),
            paymentAmount: new FormControl(''),
            vendorId: new FormControl(),
        });
        const resp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.empsData = resp['stallOperatorList'];
        this.filteredEmps = this.empsData;
        const stresp = await this.service.fetchRequest('stall/getAllStalls');
        this.allCounterData = stresp['supplierList'];
        const getVendorsList = await this.service.fetchRequest(
            'cashmanagement/getAllCashManagement'
        );
        this.cashManagementData = getVendorsList['cashManagementList'];
        this.cashManagementData.forEach((data) => {
            this.allCounterData.forEach((counter) => {
                if (data.stallId == counter.stallid) {
                    data['stallName'] = counter.name;
                }
            });
        });
        this.cashManagementData.forEach((data) => {
            this.empsData.forEach((emp) => {
                if (data.employeeId == emp.stalloperatorid) {
                    data['empName'] = emp.name;
                }
            });
        });
        this.cashManagementData.forEach((data) => {
            this.totalAmount += data.paymentAmount;
        });
        this.empControl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterEmps();
            });
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        this.TableFieldsForm.get('date').setValue(
            new Date().toISOString().split('T')[0]
        );
        // employee details
    }
    async OnSearch() {
        let vendorId = localStorage.getItem('vendorId');
        this.totalAmount = 0;
        let startDate = this.startDateCtrl.value;
        let endDate = this.endDateCtrl.value;
        let employeeId = this.empSearchControl.value;
        startDate = formatDate(startDate, 'YYYY-MM-dd', this.locale);
        endDate = formatDate(endDate, 'YYYY-MM-dd', this.locale);
        const payload = {
            startDate,
            endDate,
            vendorId: parseInt(vendorId),
        };
        const searchResp = await this.service.fetchRequestPost(
            'cashmanagement/getPaymentsByDate',
            payload
        );
        let data = searchResp['cashManagementList'];
        this.cashManagementData = data;
        if (
            this.empSearchControl.value != '' &&
            this.empSearchControl.value != null
        ) {
            let empId = this.empSearchControl.value;
            this.cashManagementData = this.cashManagementData.filter((data) => {
                return data.employeeId == empId;
            });
        }
        this.cashManagementData.forEach((data) => {
            this.totalAmount += data.paymentAmount;
        });
        this.cashManagementData.forEach((data) => {
            this.allCounterData.forEach((counter) => {
                if (data.stallId == counter.stallid) {
                    data['stallName'] = counter.name;
                }
            });
        });
        this.cashManagementData.forEach((data) => {
            this.empsData.forEach((emp) => {
                if (data.employeeId == emp.stalloperatorid) {
                    data['empName'] = emp.name;
                }
            });
        });
    }
    OnEdit(row) {
        this.cashManagementId = row.cashManagementId;
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.patchValue({
            date: row?.date,
            stallId: row?.stallId,
            name: row?.name,
            employeeId: parseInt(row?.employeeId),
            status: row?.status,
            purpose: row?.purpose,
            advance: row?.advance,
            salary: row?.salary,
            amountCleared: row?.amountCleared,

            paymentAmount: row?.paymentAmount,
            vendorId: row?.vendorId,
        });
    }
    OnAmountClearedChange(value) {
        this.TableFieldsForm.controls['amountCleared'].setValue(value);
    }
    onAddClick() {
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.get('date').setValue(
            new Date().toISOString().split('T')[0]
        );
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
        data.advance = 0;
        data.salary = 0;
        data.stallId = 0;
        if (data.amountCleared == null || data.amountCleared === '') {
            data.amountCleared = false;
        }
        if (this.editMode) {
            data['cashManagementId'] = this.cashManagementId;
        } else {
            data['cashManagementId'] = 0;
        }
        const saveResp = await this.service.fetchRequestPost(
            'cashmanagement/createCashManagement',
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
            cashManagementId: this.cashManagementId,
        };
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'cashmanagement/deleteCashManagement',
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
