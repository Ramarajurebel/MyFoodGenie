import {
    Component,
    ElementRef,
    Inject,
    LOCALE_ID,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { formatDate } from '@angular/common';
import { FormControl, FormControlDirective, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { SupplierItemsList } from 'app/shared/classes/supplier-items';
import { Subject } from 'rxjs';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { PurchaseRateCardTable } from './../../shared/tables/purchase-rate-card';
import { takeUntil } from 'rxjs/operators';
import { Suppliers } from 'app/shared/classes/supplier';
import { SupItems } from './../../shared/classes/sup-items';

@Component({
    selector: 'app-rate-card',
    templateUrl: './rate-card.component.html',
    styleUrls: ['./rate-card.component.scss'],
})
export class RateCardComponent implements OnInit {
    suppliersList: Suppliers[] = [];
    supplierItemsList: SupItems[] = [];
    uniqueSupplierItemsList: SupItems[] = [];
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    supplierFormGroup: FormGroup;
    public supplierItemFormGroup: FormGroup;
    public purchaseRateData = [];
    public tempArray = [];
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;

    private supplierId: number;
    private supplierItemId: number;
    protected _onDestroy = new Subject<void>();

    modalReference: MatDialogRef<any>;
    public editMode = false;
    ingredientsImagePath = './assets/images/ingredients/';
    public delobj = {};
    isMatDrawerOpened = false;
    public uomData = ['gms', 'kgs', 'ml', 'l', 'pieces', 'packets', 'bunches'];
    selectedCategory = {};
    public Status = ['Active', 'In Active'];
    category = ['Vegetables', 'Groceries', 'Non Veg', 'Others'];
    itemControl: FormControl = new FormControl('');
    productsList = [];
    filtereditems = [];
    filteredProductItems = [];
    productItemsList = [];
    public sup: Suppliers;
    isShowSuppliers: boolean = false;
    isShowSupItems: boolean = false;
    filteredSupplier: Suppliers[] = [];
    public productsearch: FormControl = new FormControl();
    public suppliersearch: FormControl = new FormControl();
    @ViewChild('lastDivRef', { read: ElementRef }) divContainer: ElementRef;
    vendorId = 0;
    SelectedSupplier: number;
    constructor(private service: ProjectService, private dialog: MatDialog, @Inject(LOCALE_ID) public locale: string,) {}

    async ngOnInit() {
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.supplierFormGroup = new FormGroup({
            name: new FormControl(''),
            email: new FormControl(''),
            // mobile: new FormControl('),
            gstn: new FormControl(''),
            address: new FormControl(''),
            category: new FormControl(''),
            status: new FormControl(''),
        });
        this.supplierItemFormGroup = new FormGroup({
            supid: new FormControl(''),
            supname: new FormControl(''),
            productId: new FormControl(''),
            productname: new FormControl(''),
            tname: new FormControl(''),
            quantity: new FormControl(''),
            uom: new FormControl(''),

            gst: new FormControl(''),
            // quom: new FormControl(200),
            // muom: new FormControl('gms'),

            salePrice: new FormControl(''),
            purchasePrice: new FormControl(),
            // purchaseTax: new FormControl(2),
            // saleTax: new FormControl(3),
            cess: new FormControl(''),
            margin: new FormControl(''),
            startDate: new FormControl(''),
            endDate: new FormControl(''),
            availableStock: new FormControl(''),
            packedDate: new FormControl(''),
            expiryInDays: new FormControl('')
        });
        const currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        console.log(currentDate);
        this.supplierItemFormGroup.controls['startDate'].setValue(currentDate);
        this.supplierItemFormGroup.controls['packedDate'].setValue(currentDate);

        // pushing matched supItems to the items

        console.log('all', this.supplierItemsList);
        const suppResp = await this.service.fetchRequest(
            'supplier/getAllSuppliers'
        );
        this.suppliersList = suppResp['supplierList'];

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
        this.filteredProductItems = this.productsList;
        console.log("filteredproducts:",this.filteredProductItems)
        this.filteredSupplier = JSON.parse(JSON.stringify(this.suppliersList));
        this.suppliersList.forEach((sup) => {
            sup.itemsList = [];
        });
        // here create new array for supplier items to push suppliers

        this.suppliersearch.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterSupplier();
            });
        this.productsearch.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterproducts();
            });
        console.log('items list', this.supplierItemsList);
        console.log('suppliers', this.suppliersList);
        const supItemResp = await this.service.fetchRequest(
            'supplieritem/getAllSupplierItems'
        );
        this.supplierItemsList = supItemResp['supplierItemList'];
        this.supplierItemsList = this.supplierItemsList.filter((obj)=>{
            return this.suppliersList.some(sup=> obj.supid==sup.supId)
        });
        this.suppliersList.forEach((sup) => {
            this.supplierItemsList.forEach((supItem) => {
                if (sup.supId == supItem.supid) {
                    sup.itemsList.push(supItem);
                }
                sup.childActive = false;
            });
        });
        // here for unique items list
        this.uniqueSupplierItemsList = JSON.parse(
            JSON.stringify(this.supplierItemsList)
        );
        this.uniqueSupplierItemsList = this.uniqueSupplierItemsList.filter(
            (obj, index, arr) => {
                return (
                    index === arr.findIndex((i) => i.productId == obj.productId)
                );
            }
        );
        console.log('unique', this.uniqueSupplierItemsList);
        this.uniqueSupplierItemsList.forEach((obj) => {
            obj['supItems'] = [];
            obj.childArrayActive = false;
        });
        this.uniqueSupplierItemsList.forEach((uniq) => {
            this.supplierItemsList.forEach((supitem) => {
                if (uniq.productId == supitem.productId) {
                    uniq.supItems.push(supitem);
                }
            });
        });

    }
    protected filterproducts() {
        if (!this.filteredProductItems) {
            return;
        }
        // get the search keyword
        let search = this.productsearch.value;
        if (!search) {
            this.filteredProductItems = this.productsList.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredProductItems = this.productsList.filter((bank) => {
            return bank.prodName.toLowerCase().indexOf(search.toString()) > -1;
        });
    }

    OnAddSupItem() {
        this.isMatDrawerOpened = true;
        const currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        console.log(currentDate);
        this.supplierItemFormGroup.controls['startDate'].setValue(currentDate);
        this.supplierItemFormGroup.controls['packedDate'].setValue(currentDate);
        this.SelectedSupplier = 52;
        this.supplierItemFormGroup.controls['supid'].setValue(this.SelectedSupplier)
        this.isShowSupItems = true;
        this.isShowSuppliers = false;
        this.editMode = false;
    }
    onChange(){
        let supTest =  this.supplierItemFormGroup.get('supid').value;
         this.filteredSupplier.forEach(supfilterItem=>{
            if(supfilterItem.supId==supTest){
                this.supplierItemFormGroup.get('supname').setValue(supfilterItem.name);
            }
         });
     }
     onProductChange(){
        let prodTest = this.supplierItemFormGroup.get('productId').value;
        this.filteredProductItems.forEach(prodfilterItem=>{
            if(prodfilterItem.prodId==prodTest){
                this.supplierItemFormGroup.get('productname').setValue(prodfilterItem.prodName);
            }
        })
        this.filteredProductItems.forEach(prodfilterItem=>{
            if(prodfilterItem.prodId==prodTest){
                this.supplierItemFormGroup.get('tname').setValue(prodfilterItem.tname);
            }
        })
     }
    protected filterSupplier() {
        if (!this.suppliersList) {
            return;
        }
        // get the search keyword
        let search = this.suppliersearch.value;
        if (!search) {
            this.filteredSupplier = this.suppliersList.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredSupplier = this.suppliersList.filter((bank) => {
            return bank.name.toLowerCase() == search.toLowerCase();
        });
    }
    AddSup() {
        this.isMatDrawerOpened = true;
        this.isShowSupItems = false;
        this.isShowSuppliers = true;
        this.editMode = false;
    }
    activatingSupChild(data: Suppliers) {
        const tableElement = document.getElementById(data.supId + '');

        if (tableElement) {
            const container = this.divContainer.nativeElement;
            const tableOffset = tableElement.offsetTop;
            const containerOffset = container.scrollTop;
            const scrollPosition = tableOffset - containerOffset;

            container.scrollTo({
                top: scrollPosition,
                behavior: 'smooth',
            });
        }
        this.suppliersList.forEach((sup) => {
            if (sup.supId != data.supId) sup.childActive = false;
        });
        data.childActive = !data.childActive;
    }
    activatingSupItemChild(data) {
        this.uniqueSupplierItemsList.forEach((supItem) => {
            if (supItem.productId != data.productId)
                supItem.childArrayActive = false;
        });
        data.childArrayActive = !data.childArrayActive;
    }
    OnEditSupItem(data: SupItems) {
        this.editMode = true;
        this.supplierItemId = data.supItemId;
        this.isMatDrawerOpened = true;
        this.isShowSuppliers = false;
        this.isShowSupItems = true;
        // this.supplierFormGroup.patchValue({
        //     name: data['name'],
        //     email: data['email'],
        //     gstn: data['gstn'],
        //     mobile: data['mobile'],
        //     address: data['address'],
        //     category: data['category'],
        //     status: data['status'],
        // });
        console.log('supid', data.supid);
        console.log('prodid', data.productId);
        this.supplierItemFormGroup.patchValue({
            supid: data.supid,
            supname: data.supname,
            quantity: data.quantity,
            uom: data.uom,
            productId: parseInt(data?.productId),
            productname: data.productname,
            tname: data.tname,
            gst: data.gst,
            salePrice: data?.salePrice,
            // quom: null,
            // muom: null,
            purchasePrice: data?.purchasePrice,
            // purchaseTax: null,
            // saleTax: null,
            cess: data?.cess,
            margin: data?.margin,
            startDate: data?.startDate,
            endDate: data?.endDate,
            availableStock: data?.availableStock,
            packedDate: data?.packedDate,
            expiryInDays: data?.expiryInDays,
        });
        let supTest =  this.supplierItemFormGroup.get('supid').value;
         this.filteredSupplier.forEach(supfilterItem=>{
            if(supfilterItem.supId==supTest){
                this.supplierItemFormGroup.get('supname').setValue(supfilterItem.name);
            }
         });
         let prodTest = this.supplierItemFormGroup.get('productId').value;
         this.filteredProductItems.forEach(prodfilterItem=>{
             if(prodfilterItem.prodId==prodTest){
                 this.supplierItemFormGroup.get('productname').setValue(prodfilterItem.prodName);
             }
         })
         this.filteredProductItems.forEach(prodfilterItem=>{
            if(prodfilterItem.prodId==prodTest){
                this.supplierItemFormGroup.get('tname').setValue(prodfilterItem.tname);
            }
        })
    }
    OnEditSup(data: Suppliers) {
        this.editMode = true;
        this.supplierId = data.supId;
        this.isMatDrawerOpened = true;
        this.isShowSuppliers = true;
        this.isShowSupItems = false;
        this.supplierFormGroup.patchValue({
            name: data['name'],
            email: data['email'],
            gstn: data['gstn'],
            mobile: data['mobile'],
            address: data['address'],
            category: data['category'],
            status: data['status'],
        });
    }
    OnCloseDrawer() {
        this.isShowSupItems = false;
        this.isShowSuppliers = false;
        this.supplierId = 0;
        this.supplierItemId = 0;
        this.editMode = false;
        this.isMatDrawerOpened = false;
        this.supplierFormGroup.reset();
        this.supplierItemFormGroup.reset();
    }
    async OnSaveSupItem() {
        const editData = this.supplierItemFormGroup.value;
        if (this.editMode) {
            console.log('In Edit Mode');

            editData['supItemId'] = this.supplierItemId;
        } else {
            editData['supItemId'] = 0;
        }
        editData['supid'] = parseInt(editData['supid']);
        editData.productId = parseInt(editData.productId);
        editData['quantity'] = parseInt(editData['quantity']);
        editData['gst'] = parseInt(editData['gst']);
        const resp = await this.service.fetchRequestPost(
            'supplieritem/createSupplierItem',
            editData
        );
        console.log(resp);
        this.editMode = false;
        this.OnCloseDrawer();
        this.ngOnInit();
    }
    async OnSaveSup() {
        const Payload = this.supplierFormGroup.value;
        Payload.vendorId = this.vendorId;
        if (this.editMode) {
            Payload['supId'] = this.supplierId;
        } else {
            Payload['supId'] = this.supplierId;
        }
        const editresp = await this.service.fetchRequestPost(
            'supplier/createSupplier',
            Payload
        );
        console.log(editresp);
        this.editMode = false;
        this.OnCloseDrawer();
        this.supplierFormGroup.reset();
        this.ngOnInit();
    }
    OnClose(reason) {
        this.modalReference.close(reason);
        this.supplierFormGroup.reset();
    }
    async onDelPopup(dialog, type) {
        this.modalReference = this.dialog.open(dialog);
        if (type == 'sup') {
            this.delobj = {
                supId: this.supplierId,
            };
        } else {
            this.delobj = {
                supItemId: this.supplierItemId,
            };
        }
    }
    async confirmDel() {
        if (this.isShowSuppliers) {
            const delResp = await this.service.fetchRequestdel(
                'supplier/deleteSupplier',
                this.delobj
            );
        }
        if (this.isShowSupItems) {
            const delResp = await this.service.fetchRequestdel(
                'supplieritem/deleteSupplierItem',
                this.delobj
            );
        }
        this.modalReference.close();
        this.OnCloseDrawer();
        this.ngOnInit();
    }
    decline() {
        this.modalReference.close();
    }
}
