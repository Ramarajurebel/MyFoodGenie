import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdhocDetailsComponent } from '../adhoc-details/adhoc-details.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { formatDate } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';

@Component({
    selector: 'app-adhoc-item-details',
    templateUrl: './adhoc-item-details.component.html',
    styleUrls: ['./adhoc-item-details.component.scss'],
})
export class AdhocItemDetailsComponent implements OnInit {
    adhocData = [];
    adhocPoItemsData = [];
    products = [];
    adhocItemForm: FormGroup;
    adhocpoitemid: number;
    selectedData: any;
    public categories = ['Vegetables', 'Groceries', 'Non Veg', 'Others'];
    public UOM = [
        'gms',
        'ml',
        'pieces',
        'bunch',
        'Kgs',
        'Bag (50 Kgs)',
        'Tray (25 Kgs)',
        'Tin (15 Kgs)',
    ];
    public filtereditems = [];
    itemcontrol: FormControl = new FormControl('');
    protected _onDestroy = new Subject<void>();
    editMode = false;
    delObj = {};
    vendorId = 0;
    constructor(
        private adhocDetailsComponent: AdhocDetailsComponent,
        private activatedRoute: ActivatedRoute,
        private _naviService: ProjectService,
        private router: Router,
        @Inject(LOCALE_ID) public locale: string,
        private location: Location
    ) {}

    async ngOnInit() {
        let vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }
        this.adhocItemForm = new FormGroup({
            adhocpoid: new FormControl(''),
            category: new FormControl(''),
            productlist: new FormControl(''),
            quantity: new FormControl(''),
            uom: new FormControl(''),
            finalprice: new FormControl(''),
            available: new FormControl(''),
            price: new FormControl(''),
        });
        const adhocResp = await this._naviService.fetchRequest(
            'adhocpo/getAllAdhocpo'
        );
        this.adhocData = adhocResp['adhocpoList'];
        this.adhocData = this.adhocData.filter((item) => {
            return item.status != 'Completed';
        });
        const adhocItemResp = await this._naviService.fetchRequest(
            'adhocpoitem/getAlladhocpoitem'
        );
        this.adhocPoItemsData = adhocItemResp['adhocpoitemList'];
        const payload = {
            catid: 112,
            prodid: 0,
            vendorId: this.vendorId,
        };
        const prodResp = await this._naviService.fetchRequestPost(
            '/rest/product/ProductsByVariants',
            payload
        );
        this.products = prodResp['productitems'];
        // for name
        this.adhocData.forEach((po) => {
            this.adhocPoItemsData.forEach((item) => {
                if (po.adhocpoid === item.adhocpoid) {
                    item.poName = po.description;
                }
            });
        });
        // for product name
        this.adhocPoItemsData.forEach((item) => {
            this.products.forEach((prod) => {
                if (item.productlist === prod.prodId) {
                    item.prodName = prod.prodName;
                }
            });
        });
        this.filtereditems = this.products;
        this.itemcontrol.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterproducts();
            });
        let adhocPoItemId = this.activatedRoute.snapshot.params.id;
        this.adhocpoitemid = parseInt(adhocPoItemId);
        if (adhocPoItemId) {
            this.editMode = true;
            this.adhocDetailsComponent.matDrawer.open();
            this.adhocItemForm.controls['adhocpoid'].disable();
            this.adhocItemForm.controls['category'].disable();
            this.adhocItemForm.controls['productlist'].disable();
            // this.adhocItemForm.controls['quantity'].disable();
            // this.adhocItemForm.controls['uom'].disable();
            // this.adhocItemForm.controls['price'].disable();
            this.adhocPoItemsData.forEach((item) => {
                if (item.adhocpoitemid === parseInt(adhocPoItemId)) {
                    this.selectedData = item;
                }
            });
            let available = this.selectedData?.available;
            if (available === 'Available') available = true;
            if (available === 'Not Available') available = false;
            this.adhocItemForm.patchValue({
                adhocpoid: this.selectedData?.adhocpoid,
                category: this.selectedData?.category,
                productlist: parseInt(this.selectedData?.productlist),
                quantity: this.selectedData?.quantity,
                uom: this.selectedData?.uom,
                price: this.selectedData?.price,
                available: available,
                finalprice: this.selectedData?.finalprice,
            });

            // if id match show data
        } else {
            this.editMode = false;
            this.adhocDetailsComponent.matDrawer.open();
            this.adhocItemForm.controls['adhocpoid'].enable();
            this.adhocItemForm.controls['category'].enable();
            this.adhocItemForm.controls['productlist'].enable();
            this.adhocItemForm.controls['quantity'].enable();
            this.adhocItemForm.controls['uom'].enable();
            // this.adhocItemForm.controls['price'].enable();
        }
    }
    OnPricePerUOMChange(value) {
        console.log(value);
        let quantity = this.adhocItemForm.controls['quantity'].value;
        const finalValue = parseFloat(value.toFixed(2)) * quantity;
        console.log(finalValue);

        this.adhocItemForm.controls['finalprice'].setValue(
            parseFloat(finalValue.toFixed(2))
        );
    }
    OnFinalPriceChange(value) {
        let quantity = this.adhocItemForm.controls['quantity'].value;
        const pricePerUom = parseFloat(value.toFixed(2)) / quantity;
        this.adhocItemForm.controls['price'].setValue(
            parseFloat(pricePerUom.toFixed(2))
        );
    }
    protected filterproducts() {
        if (!this.products) {
            return;
        }
        // get the search keyword
        let search = this.itemcontrol.value;
        if (!search) {
            this.filtereditems = this.products.slice();
            return;
        } else {
            search = search.toLowerCase();
        }

        // filter the banks
        this.filtereditems = this.products.filter(
            (bank) =>
                bank.prodName.toLowerCase().indexOf(search.toString()) > -1
        );
    }
    onSelectProducts(value) {
        console.log(value);
        let uom = '';
        this.products.forEach((item) => {
            if (item.prodId === value) uom = item.muom;
        });
        this.adhocItemForm.controls['uom'].setValue(uom);
    }
    async OnSave() {
        if (this.editMode) {
            let form = this.adhocItemForm.getRawValue();
            form['adhocpoitemid'] = this.adhocpoitemid;

            // form['price'] = this.selectedData.price;
            form.adhocpoid = parseInt(this.selectedData.adhocpoid);
            const updateresp = await this._naviService.fetchRequestPost(
                'adhocpoitem/createadhocpoitem',
                form
            );
            this.adhocDetailsComponent.matDrawer.close();
            this.editMode = false;
            this.location.back();
            // this.router.navigate(['nfm/kitchen-tasks/PO'], {
            //     skipLocationChange: true,
            // });
        } else {
            this.editMode = false;
            let data = this.adhocItemForm.getRawValue();
            data['adhocpoitemid'] = 0;

            // data['price'] = null;
            const updateresp = await this._naviService.fetchRequestPost(
                'adhocpoitem/createadhocpoitem',
                data
            );
            // this.adhocDetailsComponent.matDrawer.close();
            // this.location.back();
            // setTimeout(() => {
            //     this.location.forward();
            // }, 0);

            this.router.navigate(['/nfm/kitchen-tasks/PO'], {
                skipLocationChange: true,
            });
        }
    }
    async OnDel() {
        // this.adhocpoitemid = parseInt(this.adhocpoitemid);
        this.delObj = {
            adhocpoitemid: this.adhocpoitemid,
        };
        const delresp = await this._naviService.fetchRequestdel(
            'adhocpoitem/deleteadhocpoitem',
            this.delObj
        );
        this.adhocDetailsComponent.matDrawer.close();
        this.router.navigate(['/nfm/kitchen-tasks/PO'], {
            skipLocationChange: true,
        });
    }
    OnClose() {
        this.adhocItemForm.reset();

        this.adhocDetailsComponent.matDrawer.close();
        this.router.navigate(['/nfm/kitchen-tasks/PO'], {
            skipLocationChange: true,
        });
    }
}
