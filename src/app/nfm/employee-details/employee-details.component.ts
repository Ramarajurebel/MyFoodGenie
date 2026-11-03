import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VenodorsList } from '../../shared/classes/vendors';
@Component({
    selector: 'employee-details',
    templateUrl: './employee-details.component.html',
    styleUrls: ['./employee-details.component.scss'],
})
export class EmployeeDetailsComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    allOperators = [];
    public empDetails = [];
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;

    private stalloperatorid: number;

    modalReference: MatDialogRef<any>;
    public editMode = false;

    public delobj = {};
    isMatDrawerOpened = false;
    public Status = ['Active', 'In Active'];
    public Role = ['Employee', 'Vendor', 'Supplier', 'Company', 'Customers'];
    public paymentMode = ['Bank', 'UPI'];
    public shift = [
        'Shift-1 10:00 AM to 2:00PM',
        'Shift-2 5:00 PM to 9:00 PM',
        'Full Day 11:00 AM to 8:00 PM',
    ];
    public paymenttype = [
        'Daily',
        'Weekly',
        'By Weekly',
        'Monthly',
        'Daily+Item Price',
        'Weekly +Item Prce',
        'Monthly+ Item Price',
    ];
    filedata: any;
    vendorData: VenodorsList[] = [];
    imageData: any;
    imageFile: any;
    vendorId: number = 0;
    constructor(private service: ProjectService, private dialog: MatDialog) {}

    async ngOnInit() {
        let vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }
        this.TableFieldsForm = new FormGroup({
            stalloperatorid: new FormControl(''),
            name: new FormControl(''),
            address: new FormControl(''),
            aadharno: new FormControl(''),
            mobile: new FormControl(''),
            mobile1: new FormControl(''),
            parentmobile: new FormControl(''),
            shift: new FormControl(''),
            paymentmode: new FormControl(''),
            paymenttype: new FormControl(''),
            role: new FormControl(''),
            dateofjoin: new FormControl(''),
            defaultLanguage: new FormControl(''),
            vendorId: new FormControl(),
            startTime: new FormControl(),
            endTime: new FormControl(),
            status: new FormControl(''),
        });
        const resp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.allOperators = resp['stallOperatorList'];
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        this.empDetails = this.allOperators.filter((op) => {
            return op?.role === 'Employee' || op?.role === 'Vendor';
        });
    }

    OnImageSelect(e) {
        this.imageData = e.target.files[0];
        console.log(this.filedata);
    }
    OnEdit(row) {
        this.TableFieldsForm.controls['vendorId'].disable();
        this.imageFile = '';
        this.stalloperatorid = row.stalloperatorid;
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.imageFile = `data:image/png;base64,${row.imageData}`;
        this.TableFieldsForm.patchValue({
            name: row.name,
            address: row.address,
            aadharno: row.aadharno,
            mobile: row.mobile,
            mobile1: row.mobile1,
            parentmobile: row.parentmobile,
            shift: row.shift,
            paymentmode: row.paymentmode,
            paymenttype: row.paymenttype,
            role: row?.role,
            dateofjoin: row?.dateofjoin,
            defaultLanguage: row?.defaultLanguage,
            vendorId: row?.vendorId,
            startTime: row?.startTime,
            endTime: row?.endTime,
            status: row?.status,
        });
    }
    open() {
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.controls['vendorId'].setValue(this.vendorId);
        this.editMode = false;
        this.imageFile = null;
    }
    OnClose() {
        this.isMatDrawerOpened = false;
        this.TableFieldsForm.reset();
        this.editMode = false;
    }
    async OnSavePopup() {
        if (this.editMode) {
            const data = this.TableFieldsForm.value;
            data['stalloperatorid'] = this.stalloperatorid;
            const stallOperatorId = await this.service.postResponseAsText(
                'stalloperator/createStallOperator',
                data
            );
            if (this.imageData) {
                const imageData = new FormData();
                imageData.append('imageData', this.imageData);
                imageData.append('stallOperatorId', stallOperatorId);
                const resp = await this.service.postImageData(
                    'stalloperator/saveImage',
                    imageData
                );
            }
            this.TableFieldsForm.reset();
            this.ngOnInit();
            this.isMatDrawerOpened = false;
            this.editMode = false;
            this.imageData = '';
        } else {
            let data = this.TableFieldsForm.value;
            data['stalloperatorid'] = 0;
            const stallOperatorId = await this.service.fetchRequestPost(
                'stalloperator/createStallOperator',
                data
            );
            if (this.imageData) {
                const imageData = new FormData();
                imageData.append('imageData', this.imageData);
                imageData.append('stallOperatorId', stallOperatorId);
                const resp = await this.service.postImageData(
                    'stalloperator/saveImage',
                    imageData
                );
            }
            this.TableFieldsForm.reset();
            this.ngOnInit();
            this.imageData = '';
            this.isMatDrawerOpened = false;
        }
    }

    onDelPopup(dialog, row) {
        this.modalReference = this.dialog.open(this.deleteDialog);
        this.delobj = {
            stalloperatorid: row.stalloperatorid,
        };
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'stalloperator/deleteStallOperator',
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
