import {
    Component,
    ElementRef,
    Inject,
    LOCALE_ID,
    OnInit,
    ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MenuInventory } from 'app/shared/classes/menuInventory';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-food-inv',
    templateUrl: './food-inv.component.html',
    styleUrls: ['./food-inv.component.scss'],
})
export class FoodInvComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    isMatDrawerOpened: boolean = false;
    stallControl: FormControl = new FormControl();
    subCatControl: FormControl = new FormControl();
    stallData = [];
    foodInventory: MenuInventory[] = [];
    public stallsearch: FormControl = new FormControl();
    public TableFieldsForm: FormGroup;
    stallOperator = [];
    mobileNumber: string;
    vendorId: number = 0;
    public itemfilter: FormControl = new FormControl();
    protected _onDestroy = new Subject<void>();
    productIngrList = [];
    filteredIngrs = [];
    modalReference: any;
    editMode: boolean = false;
    stallinventoryid: number = 0;
    subCatData = [];
    saleCount: number = 0;
    delobj = {};
    @ViewChild('invStartDate') invStartDate: ElementRef;
    @ViewChild('invEndDate') invEndDate: ElementRef;

    constructor(
        private service: ProjectService,
        private dialog: NgbModal,
        @Inject(LOCALE_ID) public locale: string
    ) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.mobileNumber = user.mobileNumber;
    }

    async ngOnInit() {
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.TableFieldsForm = new FormGroup({
            date: new FormControl(''),
            itemName: new FormControl(''),
            saleCount: new FormControl(''),
            packedCount: new FormControl(''),
            stallid: new FormControl(''),
            itemUOM: new FormControl(''),
            itemID: new FormControl(''),
            balance: new FormControl(''),
            subCategory: new FormControl(''),
            reserveQuantity: new FormControl(''),
            packedDate: new FormControl(''),
            expiryInDays: new FormControl('')
        });
        const todayDateInv = formatDate(new Date(), 'YYYY-MM-dd', this.locale);

        let stallId = this.stallControl.value;
        let subCategory = this.subCatControl.value;
        const payload = {
            startDate: todayDateInv,
            endDate: todayDateInv,
            vendorId: this.vendorId
        };
        const resp = await this.service.fetchRequestPost(
            'stallinventory/getStallInventoryByDate',
            payload
        );
        this.foodInventory = resp['stallInventoryList'];
        const opResp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.stallOperator = opResp['stallOperatorList'];
        let subcatpayload = {
            shopId: 11,
            vendorId: 1001,
            catId: 118,
        };
        const subcatresp = await this.service.fetchRequestPost(
            'rest/subcategory/SubcategoryByCategory',
            subcatpayload
        );
        this.subCatData = subcatresp['subcategories'];
        const ingrPayload = { catid: 118, prodid: 0, vendorId: this.vendorId };
        const ingrResp = await this.service.fetchRequestPost(
            'rest/product/ProductsByVariants',
            ingrPayload
        );
        this.productIngrList = ingrResp['productitems'];
        this.filteredIngrs = this.productIngrList;
        // for vendorid
        if (this.mobileNumber != '9618812143') {
            this.stallOperator.forEach((op) => {
                if (op.mobile == this.mobileNumber) {
                    this.vendorId = op.vendorId;
                }
            });
        }
        const stallresp = await this.service.fetchRequest('stall/getAllStalls');
        this.stallData = stallresp['supplierList'];
        this.foodInventory.forEach((menu) => {
            this.stallData.forEach((stall) => {
                if (menu.stallid === stall.stallid) {
                    menu['stallName'] = stall.name;
                }
            });
        });
        // if (this.vendorId != 0) {
        //     this.stallData = this.stallData.filter((item) => {
        //         return item.vendorId == this.vendorId;
        //     });
        // }
        this.itemfilter.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filteritems();
            });
        this.invStartDate.nativeElement.value = todayDateInv;
        this.invEndDate.nativeElement.value = todayDateInv;
    }
    async confirm() {
        const delresp = await this.service.fetchRequestdel(
            'stallinventory/deleteStallInventory',
            this.delobj
        );

        this.modalReference.close();
        this.OnGoPress();
    }
    decline() {
        this.modalReference.close();
    }
    onEdit(data) {
        this.isMatDrawerOpened = !this.isMatDrawerOpened;
        this.itemfilter.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filteritems();
            });

        this.TableFieldsForm.markAsUntouched();

        this.TableFieldsForm.controls['stallid'].disable();
        this.TableFieldsForm.controls['itemUOM'].disable();
        this.TableFieldsForm.controls['date'].disable();

        this.stallinventoryid = data.stallinventoryid;
        this.TableFieldsForm.patchValue({
            date: data?.date,
            itemName: data?.itemName,
            saleCount: data.saleCount,
            packedCount: data.packedCount,
            stallid: data.stallid,
            itemUOM: data.itemUOM,
            itemID: data.itemID,
            balance: data.balance,
            subCategory: data?.subCategory,
            reserveQuantity: data?.reserveQuantity,
            packedDate: data?.packedDate,
            expiryInDays:data?.expiryInDays,
        });
        this.saleCount = data.saleCount;

        this.editMode = true;
    }
    onDelPopup(template, row) {
        this.delobj = {
            stallinventoryid: row.stallinventoryid,
        };
        this.modalReference = this.dialog.open(template);
    }
    open() {
        this.isMatDrawerOpened = true;
        this.TableFieldsForm.controls['itemUOM'].disable();
        this.editMode = false;
    }
    OnGoPress() {
        const invSDate = this.invStartDate.nativeElement.value;
        const invEDate = this.invEndDate.nativeElement.value;
        if (invSDate && invEDate) {
            const sDate = new Date(Date.parse(invSDate));
            const eDate = new Date(Date.parse(invEDate));
            let startDate = formatDate(sDate, 'YYYY-MM-dd', this.locale);
            let endDate = formatDate(eDate, 'YYYY-MM-dd', this.locale);
            this.MenuInventoryData(startDate, endDate);
        }
    }
    async MenuInventoryData(startDate, endDate) {
        let stallId = this.stallControl.value;
        let subCategory = this.subCatControl.value;
        const payload = {
            startDate,
            endDate,
            vendorId: this.vendorId
        };
        const resp = await this.service.fetchRequestPost(
            'stallinventory/getStallInventoryByDate',
            payload
        );
        this.foodInventory = resp['stallInventoryList'];
        this.foodInventory.forEach((menu) => {
            this.stallData.forEach((stall) => {
                if (menu.stallid === stall.stallid) {
                    menu['stallName'] = stall.name;
                }
            });
        });
        if (stallId != 'All' && stallId != null) {
            this.foodInventory = this.foodInventory.filter((item) => {
                return item.stallid === parseInt(stallId);
            });
        }
        if (subCategory != 'All' && subCategory != null) {
            this.foodInventory = this.foodInventory.filter((item) => {
                return item.subCategory === parseInt(subCategory);
            });
        }
        //
        // if (this.mobileNumber != '9618812143') {
        //     this.stallOperator.forEach((op) => {
        //         if (op.mobile === this.mobileNumber) {
        //             this.vendorId = op?.vendorId;
        //         }
        //     });
        //     this.foodInventory = this.foodInventory.filter((data) => {
        //         return data?.vendorId === this.vendorId;
        //     });
        // }
    }
    protected filteritems() {
        if (!this.productIngrList) {
            return;
        }
        // get the search keyword
        let search = this.itemfilter.value;
        if (!search) {
            this.filteredIngrs = this.productIngrList.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredIngrs = this.productIngrList.filter(
            (bank) =>
                bank.prodName.toLowerCase().indexOf(search.toLowerCase()) > -1
        );
    }
    OnClose() {
        this.isMatDrawerOpened = false;
        this.editMode = false;
        this.TableFieldsForm.reset();
        this.stallinventoryid = 0;
    }
    OnItemSelect(selectedItem) {
        const prodid = parseInt(selectedItem.source.value);
        this.productIngrList.forEach((item) => {
            item.variants.forEach((object) => {
                if (prodid == object.prodId) {
                    // console.log(`all objects are ${JSON.stringify(object)}`);
                    this.TableFieldsForm.controls['itemName'].setValue(
                        item.prodName
                    );
                    this.TableFieldsForm.controls['itemUOM'].setValue(
                        object.uom
                    );
                }
            });
        });
    }
    async onSavePopup() {
        const data = this.TableFieldsForm.getRawValue();
        data.subCategory = parseInt(data.subCategory);
        if (this.editMode) {
            data['saleCount'] = this.saleCount;
            data['stallinventoryid'] = this.stallinventoryid;

            data['balance'] = data.balance;
            data.vendorId=this.vendorId;
            this.TableFieldsForm.controls['stallid'].enable();
        } else {
            data['stallinventoryid'] = 0;
            data['saleCount'] = 0;
            data['balance'] = 0;
            data.vendorId= this.vendorId;
        }
        const saveresp = await this.service.fetchRequestPost(
            'stallinventory/createStallInventory',
            data
        );
        this.isMatDrawerOpened = false;
        this.editMode = false;
        this.TableFieldsForm.reset();
        this.stallinventoryid = 0;

        this.OnGoPress();
    }
}
