import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VenodorsList } from 'app/shared/classes/vendors';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
@Component({
    selector: 'app-vendors',
    templateUrl: './vendors.component.html',
    styleUrls: ['./vendors.component.scss'],
})
export class VendorsComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    public vendorsData: VenodorsList[] = [];
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
    isToggleEdit: boolean = false;
    private vendorId: number;

    modalReference: MatDialogRef<any>;
    public editMode = false;

    public delobj = {};
    isMatDrawerOpened = false;
    public Status = ['Active', 'In Active'];
    public category = ['Restaurant','Catering','Groceries','Bakery']
    operationData = ['Display', 'Manage'];
    empsData = [];
    allOperators = [];
    dropdownSettings: IDropdownSettings;
    categories=[];
    catList:FormControl= new FormControl('');
    constructor(private service: ProjectService, private dialog: MatDialog) {}

    async ngOnInit() {
        //userTiles list for editmode
        const userTiles = JSON.parse(localStorage.getItem('userTilesList'));
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'catId',
            textField: 'catName',

            allowSearchFilter: true,
        };
        this.TableFieldsForm = new FormGroup({
            vendorName: new FormControl(''),
            vendorAddress: new FormControl(''),
            vendorMobile: new FormControl(''),
            category: new FormControl(''),
            prodCategory: new FormControl(''),
        });
        const getVendorsList = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorsData = getVendorsList['vendorList'];
        const data = {};
        data['shopId'] = 11;
        data['vendorId'] = 1001;
        const catresp = await this.service.fetchRequestPost(
            'rest/category/SupplierCategoryCollection',
            data
        );
        this.categories = catresp['categories'];


        // employee details
    }

    OnEdit(row) {
        if(row.prodCategory){
            const stringArray = row.prodCategory.split(",").map(Number);

            const catArray = stringArray.map(item=>({catId: item}));
            console.log("cat",catArray);
            const filteredCats = this.categories.filter(cat=>
                catArray.some(data=>data.catId==cat.catId));
                this.catList.setValue(filteredCats);
        }

        this.vendorId = row.vendorId;
        this.editMode = true;
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.patchValue({
            vendorName: row.vendorName,
            vendorAddress: row.vendorAddress,
            vendorMobile: row.vendorMobile,
            category: row.category,
            prodCategory: row?.prodCategory
        });
    }
    OnClose() {
        this.isMatDrawerOpened = false;
        this.TableFieldsForm.reset();
        this.editMode = false;
    }
    async OnSavePopup() {


        const data = this.TableFieldsForm.value;

        if(this.catList.value?.length>0){
            const prodCatArr = [];
            this.catList.value.forEach(obj=>prodCatArr.push(obj.catId+""));
            const prodCatString:string = prodCatArr.join(',');
            data.prodCategory = prodCatString;
        }
        console.log(data);
        if (this.editMode) {
            data['vendorId'] = this.vendorId;
        } else {
            data['empAssignmentId'] = 0;
        }
        const saveResp = await this.service.fetchRequestPost(
            'rest/vendor/CreateVendor',
            data
        );
        this.TableFieldsForm.reset();
        this.ngOnInit();
        this.isMatDrawerOpened = false;
        this.editMode = false;
        this.catList.reset();
    }
    onDelPopup(dialog, row) {
        this.modalReference = this.dialog.open(dialog);
        this.delobj = {
            vendorId: this.vendorId,
        };
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestPost(
            'rest/vendor/DeleteVendor',
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
