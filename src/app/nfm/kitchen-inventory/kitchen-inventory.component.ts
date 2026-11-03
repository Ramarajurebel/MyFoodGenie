import {
    Component,
    ElementRef,
    HostListener,
    Inject,
    LOCALE_ID,
    OnInit,
    ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { KitchenInventoryTable } from '../../shared/tables/kitchen-inventory';
import { KitchenInventoryClass } from './../../shared/classes/kitchen-inventory';
import { FormGroup, FormControl } from '@angular/forms';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { formatDate } from '@angular/common';
import { MatDrawer } from '@angular/material/sidenav';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
@Component({
    selector: 'app-kitchen-inventory',
    templateUrl: './kitchen-inventory.component.html',
    styleUrls: ['./kitchen-inventory.component.scss'],
})
export class KitchenInventoryComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    itemControl: FormControl = new FormControl('');
    drawerMode: 'side' | 'over';
    inventoryTableData = new MatTableDataSource<KitchenInventoryClass>();
    inventoryJson: KitchenInventoryClass[];
    displayedColumns: string[] = KitchenInventoryTable.map((col) => col.key);
    columnsSchema: any = KitchenInventoryTable;
    public categories = ['Vegetables', 'Groceries', 'Non Veg', 'Others'];
    mobilePoItems: any;
    searchFormGroup: FormGroup;
    mobileInventoryData: KitchenInventoryClass[];
    ingredientsImagePath = './assets/images/ingredients/';
    @ViewChild('imageElement', { static: false }) imageElement;
    groupingCategory = [
        {
            value: 'Vegetables',
            childActive: false,

            mobileData: [],
        },
        {
            value: 'Groceries',
            childActive: false,

            mobileData: [],
        },
        {
            value: 'Non Veg',
            childActive: false,

            mobileData: [],
        },
        {
            value: 'Others',
            childActive: false,

            mobileData: [],
        },
    ];
    vegCategories = [];
    groceriesCategories = [];
    nonVegCategories = [];
    othersCategories = [];
    isMatDrawerOpened: boolean = false;
    tableFieldsForm: FormGroup;
    editMode: boolean = false;
    isActive: boolean = false;
    currentObj: any;
    protected _onDestroy = new Subject<void>();
    filteredProductsList = [];
    productsList = [];
    public rcpcat = ['Vegetables', 'Groceries', 'Non Veg', 'Others'];
    public uom = ['gms', 'ml', 'pieces', 'bunch'];
    modalReference: any;
    vendorData = [];
    vendorId = 0;
    constructor(
        private service: ProjectService,
        @Inject(LOCALE_ID) public locale: string,
        private dialog: MatDialog
    ) {}

    async ngOnInit() {
        let vendorId: number = 0;
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.searchFormGroup = new FormGroup({
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
            category: new FormControl(''),
        });
        this.tableFieldsForm = new FormGroup({
            itemId: new FormControl(''),
            itemName: new FormControl(''),
            category: new FormControl(''),
            availableQuantity: new FormControl(''),
            purchasedDate: new FormControl(''),
            saleDate: new FormControl(''),
            saleQuantity: new FormControl(''),
            uom: new FormControl(''),
            checked: new FormControl(''),
            balance: new FormControl(''),
            vendorId: new FormControl(),
        });
        const datePayload = {};
        datePayload['startDate'] = formatDate(
            new Date(),
            'YYYY-MM-dd',
            this.locale
        );
        datePayload['endDate'] = formatDate(
            new Date(),
            'YYYY-MM-dd',
            this.locale
        );
        datePayload['vendorId'] = this.vendorId;
        const dateResp = await this.service.fetchRequestPost(
            'kitcheninventory/getkitcheninventory',
            datePayload
        );
        this.inventoryJson = dateResp['kitcheninventoryList'];
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        this.inventoryJson.forEach((element) => {
            let balance = (
                element.availableQuantity - element.saleQuantity
            ).toFixed(2);
            element['balance'] = parseFloat(balance);
        });
        this.inventoryJson = this.inventoryJson.sort((a, b) => {
            if (a.balance < b.balance) return -1;
            if (a.balance > b.balance) return 1;
            return 0;
        });
        this.inventoryJson.forEach((item) => {
            item['itemImage'] = `${item.itemId}.webp`;
        });
        this.inventoryTableData = new MatTableDataSource(this.inventoryJson);
        this.mobilePoItems = this.inventoryJson;
        this.groupingCategory.forEach((obj) => {
            obj.childActive = true;
            let data = [];
            data = this.inventoryJson.filter((cat) => {
                return cat.category === obj.value;
            });

            obj.mobileData = data;
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
        this.filteredProductsList = this.productsList;
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
            this.filteredProductsList = this.productsList.slice();
            return;
        } else {
            search = search.toLowerCase();
        }

        // filter the banks
        this.filteredProductsList = this.productsList.filter(
            (bank) =>
                bank.prodName.toLowerCase().indexOf(search.toString()) > -1
        );
    }
    onSelectProducts(value) {
        let obj: any;
        this.filteredProductsList.forEach((item) => {
            if (item.prodId === value) obj = item;
        });
        console.log(obj);

        this.tableFieldsForm.controls['itemName'].setValue(obj.prodName + '');
        this.tableFieldsForm.controls['uom'].setValue(obj.muom);
    }
    activatingChild(po) {
        po.childActive = !po.childActive;
        let childData = this.inventoryJson.filter((obj) => {
            return obj.category === po.value;
        });
        po.mobileData = childData;
    }

    // OnImageClick(event) {
    //     event.stopPropagation();
    //     if (this.imageElement.nativeElement.classList.contains('active')) {
    //         this.imageElement.nativeElement.classList.remove('active');
    //     } else {
    //         this.imageElement.nativeElement.classList.add('active');
    //     }
    // }
    onEdit(row) {
        this.tableFieldsForm.controls['itemId'].disable();
        this.tableFieldsForm.controls['category'].disable();

        this.tableFieldsForm.controls['purchasedDate'].disable();
        this.tableFieldsForm.controls['uom'].disable();
        this.tableFieldsForm.controls['balance'].disable();
        this.tableFieldsForm.controls['vendorId'].disable();
        this.currentObj = row;
        this.isMatDrawerOpened = true;
        this.editMode = true;
        this.tableFieldsForm.patchValue({
            itemId: parseInt(row.itemId),
            itemName: row.itemName,
            category: row.category,
            availableQuantity: row.availableQuantity,
            saleQuantity: row.saleQuantity,
            purchasedDate: row.purchasedDate,
            uom: row?.uom,
            balance: row?.balance,
            checked: row?.checked,
            vendorId: row?.vendorId,
        });
    }

    OnAvailableQuantityEnter(value) {
        console.log(value);
        let saleQuantity = this.tableFieldsForm.controls['saleQuantity'].value;
        saleQuantity = parseFloat(saleQuantity.toFixed(2));
        let balance = parseFloat(value.toFixed(2)) - saleQuantity;
        this.tableFieldsForm.controls['balance'].setValue(balance);
    }
    OnSaleQuantityEnter(value) {
        console.log(value);
        let availableQty = this.tableFieldsForm.controls['availableQuantity']
            .value;
        availableQty = parseFloat(availableQty.toFixed(2));
        let balance = availableQty - parseFloat(value.toFixed(2));
        this.tableFieldsForm.controls['balance'].setValue(balance);
    }
    async OnSearch() {
        let vendorId: number = 0;
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            vendorId = parseInt(vendorIdString);
        }
        let startDate = this.searchFormGroup.controls['startDate'].value;
        let endDate = this.searchFormGroup.controls['endDate'].value;
        let category = this.searchFormGroup.controls['category'].value;

        if (startDate && endDate) {
            startDate = formatDate(startDate, 'YYYY-MM-dd', this.locale);
            endDate = formatDate(endDate, 'YYYY-MM-dd', this.locale);
            let payload = {
                startDate,
                endDate,
                vendorId,
            };
            const dateresp = await this.service.fetchRequestPost(
                'kitcheninventory/getkitcheninventory',
                payload
            );
            this.inventoryJson = dateresp['kitcheninventoryList'];

            if (category) {
                this.inventoryJson = this.inventoryJson.filter((item) => {
                    if (item.category == category) return item;
                });
            }
            this.inventoryJson.forEach((element) => {
                let balance = (
                    element.availableQuantity - element.saleQuantity
                ).toFixed(2);
                element['balance'] = parseFloat(balance);
            });
            this.inventoryJson = this.inventoryJson.sort((a, b) => {
                if (a.balance < b.balance) return -1;
                if (a.balance > b.balance) return 1;
                return 0;
            });
            this.inventoryJson.forEach((item) => {
                item['itemImage'] = `${item.itemId}.webp`;
            });
            this.inventoryTableData = new MatTableDataSource(
                this.inventoryJson
            );
            this.mobilePoItems = this.inventoryJson;
        } else {
            if (category) {
                this.inventoryJson.forEach((element) => {
                    let balance = (
                        element.availableQuantity - element.saleQuantity
                    ).toFixed(2);
                    element['balance'] = parseFloat(balance);
                });
                this.inventoryJson.forEach((item) => {
                    item['itemImage'] = `${item.itemId}.webp`;
                });
                this.inventoryJson = this.inventoryJson.filter((item) => {
                    if (item.category == category) return item;
                });
            }
            this.inventoryJson = this.inventoryJson.sort((a, b) => {
                if (a.balance < b.balance) return -1;
                if (a.balance > b.balance) return 1;
                return 0;
            });
            this.inventoryTableData = new MatTableDataSource(
                this.inventoryJson
            );
            this.mobilePoItems = this.inventoryJson;
        }
        this.groupingCategory.forEach((obj) => {
            let data = [];
            data = this.inventoryJson.filter((cat) => {
                return cat.category === obj.value;
            });

            obj.mobileData = data;
        });
    }
    OnDelete(dialog) {
        this.modalReference = this.dialog.open(dialog);
    }
    CloseDialog() {
        this.modalReference.close();
    }
    async confirm() {
        if (this.editMode) {
            const payload = {
                kitchenInventoryId: this.currentObj.kitchenInventoryId,
            };
            const delResp = await this.service.fetchRequestdel(
                'kitcheninventory/deletekitcheninventory',
                payload
            );
            this.modalReference.close();
            this.isMatDrawerOpened = false;
            this.editMode = false;
            this.currentObj = {};

            this.OnSearch();
        }
    }
    OnAdd() {
        this.tableFieldsForm.reset();
        this.isMatDrawerOpened = true;
        this.editMode = false;
        this.tableFieldsForm.enable();
        this.tableFieldsForm.controls['vendorId'].setValue(this.vendorId);
    }
    OnCheckedClick(event, row) {
        // hostlistener, event.stopPropogation for stopping the trigger for main div
        event.stopPropagation();
        row.checked = event.target.checked;
        console.log(event.checked);
        this.InventorySave();
    }
    async InventorySave() {
        let payload: any;
        if (this.editMode) {
            payload = this.tableFieldsForm.getRawValue();
            payload['kitchenInventoryId'] = this.currentObj.kitchenInventoryId;
        } else {
            payload = this.tableFieldsForm.getRawValue();
            payload['kitchenInventoryId'] = 0;
        }
        let row = this.tableFieldsForm.getRawValue();

        payload.checked = false;
        const saveResp = await this.service.fetchRequestPost(
            'kitcheninventory/createkitcheninventory',
            payload
        );
        let balance = (row.availableQuantity - row.saleQuantity).toFixed(2);
        row.balance = parseFloat(balance);
        console.log(row);
        this.isMatDrawerOpened = false;
        this.editMode = false;
        this.currentObj = {};
        this.tableFieldsForm.reset();
        this.OnSearch();
    }
    OnClose() {
        this.editMode = false;
        this.isMatDrawerOpened = false;
        this.currentObj = {};
        this.tableFieldsForm.reset();
    }
}
