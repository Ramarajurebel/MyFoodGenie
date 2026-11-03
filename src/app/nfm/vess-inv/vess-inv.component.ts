import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VenodorsList } from 'app/shared/classes/vendors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
    selector: 'app-vess-inv',
    templateUrl: './vess-inv.component.html',
    styleUrls: ['./vess-inv.component.scss'],
})
export class VessInvComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    public vesselsData = [];
    cashObj: {};
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
    isToggleEdit: boolean = false;
    private vesselId: number;

    modalReference: MatDialogRef<any>;
    public editMode = false;
    protected _onDestroy = new Subject<void>();
    public delobj = {};
    isMatDrawerOpened = false;
    public Status = ['Active', 'In Active'];
    operationData = ['Display', 'Manage'];
    purpose = ['Advance', 'Salary'];

    empControl: FormControl = new FormControl();
    imageData: any;
    imageFile: any;
    vendorData = [];
    vendorId = 0;
    constructor(private service: ProjectService, private dialog: MatDialog) {}

    async ngOnInit() {
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        //userTiles list for editmode
        const userTiles = JSON.parse(localStorage.getItem('userTilesList'));

        this.TableFieldsForm = new FormGroup({
            name: new FormControl(),
            code: new FormControl(),
            quantity: new FormControl(),
            status: new FormControl(),
            vendorId: new FormControl(),
        });

        const getEmpSalaries = await this.service.fetchRequest(
            'vesselsinv/getAllVesselsInv'
        );
        this.vesselsData = getEmpSalaries['vesselsInvList'];
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];

        // employee details
    }

    OnEdit(row) {
        this.TableFieldsForm.controls['vendorId'].disable();
        this.imageFile = null;
        this.imageFile = `data:image/png;base64,${row?.imageData}`;
        this.vesselId = row.vesselId;
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.patchValue({
            name: row?.name,
            code: row?.code,
            quantity: row?.quantity,
            status: row?.status,
            vendorId: row?.vendorId,
        });
    }
    OnActiveChange(value) {
        this.TableFieldsForm.controls['active'].setValue(value);
    }
    onAddClick() {
        this.isMatDrawerOpened = true;
        this.imageData = null;
        this.imageFile = null;
        this.editMode = false;
        this.TableFieldsForm.controls['vendorId'].setValue(this.vendorId);
    }

    OnClose() {
        this.isMatDrawerOpened = false;
        this.TableFieldsForm.reset();
        this.editMode = false;
    }
    OnImageSelect(event) {
        this.imageData = event.target.files[0];
    }
    async OnSavePopup() {
        const data = this.TableFieldsForm.value;

        if (this.editMode) {
            data['vesselId'] = this.vesselId;
        } else {
            data['vesselId'] = 0;
        }
        const saveResp = await this.service.fetchRequestPost(
            'vesselsinv/createVesselsInv',
            data
        );
        if (this.imageData) {
            const imageData = new FormData();
            imageData.append('imageData', this.imageData);
            imageData.append('vesselId', saveResp);
            const resp = await this.service.postImageData(
                'vesselsinv/saveImage',
                imageData
            );
        }

        this.TableFieldsForm.reset();
        this.ngOnInit();
        this.isMatDrawerOpened = false;
        this.editMode = false;
        this.imageData = null;
    }
    onDelPopup(dialog) {
        this.modalReference = this.dialog.open(this.deleteDialog);
        this.delobj = {
            vesselId: this.vesselId,
        };
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'vesselsinv/deleteVesselsInv',
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
