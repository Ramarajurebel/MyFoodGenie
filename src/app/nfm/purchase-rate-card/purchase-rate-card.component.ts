import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { SupplierItemsList } from 'app/shared/classes/supplier-items';
import { Subject } from 'rxjs';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { PurchaseRateCardTable } from './../../shared/tables/purchase-rate-card';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'app-purchase-rate-card',
    templateUrl: './purchase-rate-card.component.html',
    styleUrls: ['./purchase-rate-card.component.scss'],
})
export class PurchaseRateCardComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public TableFieldsForm: FormGroup;
    public purchaseRateData = [];
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
    displayedColumns: string[] = PurchaseRateCardTable.map((col) => col.key);
    columnsSchema: any = PurchaseRateCardTable;
    private purchaseRateId: number;
    protected _onDestroy = new Subject<void>();
    groupingCategory = [
        {
            value: 'Vegetables',
            id: 133,
            childActive: false,
            table: new MatTableDataSource(),
            mobileData: [],
        },
        {
            value: 'Groceries',
            id: 134,
            childActive: false,
            table: new MatTableDataSource(),
            mobileData: [],
        },
        {
            value: 'Non Veg',
            id: 135,
            childActive: false,
            table: new MatTableDataSource(),
            mobileData: [],
        },
        {
            value: 'Others',
            childActive: false,
            id: 136,
            table: new MatTableDataSource(),
            mobileData: [],
        },
    ];
    modalReference: MatDialogRef<any>;
    public editMode = false;
    ingredientsImagePath = './assets/images/ingredients/';
    public delobj = {};
    isMatDrawerOpened = false;
    public uomData = ['gms', 'kgs', 'ml', 'l', 'pieces', 'packets', 'bunches'];
    selectedCategory = {};
    supplierFormGroup: FormGroup;
    supplierProductItemsList: SupplierItemsList[] = [];
    itemControl: FormControl = new FormControl('');
    productsList = [];
    filtereditems = [];
    supplierList = [];
    isPurchaseCardSelected: boolean = false;
    vendorId: number = 0;
    constructor(private service: ProjectService, private dialog: MatDialog) {}

    async ngOnInit() {
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.TableFieldsForm = new FormGroup({
            itemId: new FormControl(''),
            subCategory: new FormControl(''),
            price: new FormControl(''),
            salePercentage: new FormControl(''),
            quantity: new FormControl(''),
            uom: new FormControl(''),
            updatedBy: new FormControl(''),
        });
        this.supplierFormGroup = new FormGroup({
            supplierId: new FormControl(),
            prodId: new FormControl(),

            quantity: new FormControl(),

            uom: new FormControl(),
            price: new FormControl(),
        });
        const getRespEmp = await this.service.fetchRequest(
            'purchaseratecard/getAllpurchaseratecard'
        );
        this.purchaseRateData = getRespEmp['purchaseratecardList'];
        // const supplierItemsListResp = await this.service.fetchRequest(
        //     'supplierproducts/getAllSupplierProducts'
        // );
        // this.supplierProductItemsList =
        //     supplierItemsListResp['supplierProductsList'];
        const supplierResp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.supplierList = supplierResp['stallOperatorList'];
        this.purchaseRateData.forEach((item) => {
            item['itemImage'] = `${item.itemId}.webp`;
        });
        const payload = {
            catid: 112,
            prodid: 0,
            vendorId: this.vendorId,
        };
        const getproducts = await this.service.fetchRequestPost(
            '/rest/product/ProductsByVariants',
            payload
        );
        this.productsList = getproducts['productitems'];
        this.filtereditems = this.productsList;
        console.log(this.purchaseRateData);
        this.isMatDrawerOpened = false;
        this.itemControl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterproducts();
            });
    }
    protected filterproducts() {
        if (!this.productsList) {
            return;
        }
        // get the search keyword
        let search = this.itemControl.value;
        if (!search) {
            this.filtereditems = this.productsList.slice();
            return;
        } else {
            search = search.toLowerCase();
        }

        // filter the banks
        this.filtereditems = this.productsList.filter(
            (bank) =>
                bank.prodName.toLowerCase().indexOf(search.toString()) > -1
        );
    }
    OnEdit(row) {
        this.isMatDrawerOpened = true;
        this.isPurchaseCardSelected = true;
        this.editMode = true;
        this.purchaseRateId = row.purchaseRateId;
        this.TableFieldsForm.controls['subCategory'].disable();
        this.TableFieldsForm.patchValue({
            itemId: row.itemId,
            subCategory: row.subCategory + '' + '-' + row.subCategoryName,
            quantity: row.quantity,
            uom: row.uom,
            price: row.price,
            salePercentage: row.salePercentage,
            updatedBy: row.subCategory,
        });
    }
    OnEditPress(row) {
        this.columnsSchema.forEach((col) => {
            if (col.type == 'subcat') col.columnActive = true;
        });
        row.isEdit = !row.isEdit;
    }
    OnCancel(data) {
        this.columnsSchema.forEach((col) => {
            if (col.type == 'subcat') col.columnActive = false;
        });
        data.isEdit = !data.isEdit;
    }
    activatingChild(category) {
        this.columnsSchema.forEach((item) => {
            if (item.type == 'subcat') item.columnActive = false;
        });
        this.selectedCategory = category;
        category.childActive = !category.childActive;
        let childData = this.purchaseRateData.filter((obj) => {
            return obj.subCategory === category.id;
        });
        category.table = new MatTableDataSource(childData);
        category.mobileData = childData;
    }
    OnClose() {
        this.isMatDrawerOpened = false;
        this.isPurchaseCardSelected = false;

        this.editMode = false;
    }
    async OnSavePopup() {
        if (this.editMode) {
            const data = this.TableFieldsForm.getRawValue();
            data.price = parseFloat(data.price.toFixed(2));
            data.quantity = parseFloat(data.quantity.toFixed(2));
            data.subCategory = parseInt(data.subCategory);

            data['purchaseRateId'] = this.purchaseRateId;
            const saveResp = await this.service.fetchRequestPost(
                'purchaseratecard/createpurchaseratecard',
                data
            );
            this.TableFieldsForm.reset();
            this.ngOnInit();
            this.isMatDrawerOpened = false;
            this.editMode = false;
        } else {
            let data = this.TableFieldsForm.getRawValue();
            data.price = parseFloat(data.price.toFixed(2));
            data.quantity = parseFloat(data.quantity.toFixed(2));

            data['purchaseRateId'] = 0;
            const saveResp = await this.service.fetchRequestPost(
                'purchaseratecard/createpurchaseratecard',
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
            purchaseRateId: this.purchaseRateId,
        };
    }
    async rateCardSave(row) {
        row.isEdit = false;
        const payload = row;
        let price = parseFloat(parseFloat(row.price).toFixed(2));
        let salePercentage = parseFloat(
            parseFloat(row.salePercentage).toFixed(2)
        );
        payload.price = price;
        payload.salePercentage = salePercentage;

        const saveResp = await this.service.fetchRequestPost(
            'purchaseratecard/createpurchaseratecard',
            payload
        );
        this.columnsSchema.forEach((col) => {
            if (col.type == 'subcat') col.columnActive = false;
        });
        this.ngOnInit();
        this.activatingChild(this.selectedCategory);
        console.log(row);
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'purchaseratecard/deletepurchaseratecard',
            this.delobj
        );
        this.ngOnInit();
    }
    CloseDialog() {
        this.modalReference.close();
    }
    decline() {
        this.modalReference.close();
    }
}
