import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { MatTableDataSource } from '@angular/material/table';
import * as pdfMakeConfig from 'pdfmake/build/pdfmake.js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import { fill } from 'lodash';
import { formatDate } from '@angular/common';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SaleOrderItems } from 'app/shared/classes/saleorder-items';
import { SaleOrdeItemColumns } from 'app/shared/tables/saleorderitems-columns';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AdhocPoItems } from './../../shared/classes/adhocpo-items';

@Component({
    selector: 'app-sale-order-details',
    templateUrl: './sale-order-details.component.html',
    styleUrls: ['./sale-order-details.component.scss'],
})
export class SaleOrderDetailsComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    appearnce: MatFormFieldModule = fill;
    saleorderData = [];
    saleOrderItems: SaleOrderItems[] = [];
    poItemsTable = new MatTableDataSource<SaleOrderItems>();
    displayedColumns: string[] = SaleOrdeItemColumns.map((col) => col.key);
    columnsSchema: any = SaleOrdeItemColumns;
    saleorderitemFormgroup: FormGroup;
    productsList = [];
    modalReference: any;
    public categories = ['Vegetables', 'Groceries', 'Non Veg', 'Others'];
    purchaseorder: FormControl = new FormControl('');
    category: FormControl = new FormControl('');
    available: FormControl = new FormControl('');
    saleorderitemid: number = 0;
    saleorderid: number;
    mobileSoItems: SaleOrderItems[];
    public uomData = [
        'Packets','Cartons','Pieces','Boxes'
    ];
    stallOperator = [];
    selectedRow: SaleOrderItems;
    oldValueRow: SaleOrderItems;
    ingredientsImagePath = './assets/images/ingredients/';
    isQuantity: boolean = false;
    isMatDrawerOpened: boolean = false;
    filtereditems = [];
    itemcontrol = new FormControl('');
    protected _onDestroy = new Subject<void>();
    isSaleOrderItemDetails: boolean = false;
    delObj = {};
    isSaleOrderDetails: boolean = false;
    saleorderFormGroup: FormGroup;
    statusData = ['Open', 'In Progress', 'Completed'];
    currentObj: any;
    purchaseRateCardData = [];
    rateCardQuantity: number = 0;
    rateCardPrice: number = 0;
    searchFormGroup: FormGroup;
    allSaleOrderData = [];
    vendorData = [];
    vendorId: number = 0;
    stallData: any;
    suppliersList: any;
    constructor(
        private service: ProjectService,
        private router: Router,
        private modalService: NgbModal,
        @Inject(LOCALE_ID) public locale: string,
        private _liveAnnouncer: LiveAnnouncer,
        private dialog: MatDialog
    ) {
        (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
        pdfMakeConfig.fonts = {
            telugu: {
                normal: 'TenaliRamakrishna-Regular.ttf',
            },
        };
    }
    @ViewChild(MatSort) sort: MatSort;
    ngAfterViewInit() {
        this.poItemsTable.sort = this.sort;
    }
    announceSortChange(sort: Sort) {
        let data = this.poItemsTable.data;

        if (!sort.active || sort.direction === '') {
            this.poItemsTable.data = data;
        } else {
            data = data.sort((a, b) => {
                const aValue = (a as any)[sort.active];
                const bValue = (b as any)[sort.active];
                return (
                    (aValue < bValue ? -1 : 1) *
                    (sort.direction === 'asc' ? 1 : -1)
                );
            });
            this.poItemsTable.data = data;
            console.log(data);
        }
    }
    async ngOnInit() {
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.searchFormGroup = new FormGroup({
            status: new FormControl(''),
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
        });
        this.saleorderitemFormgroup = new FormGroup({
            saleorderid: new FormControl(''),
            category: new FormControl(''),
            productlist: new FormControl(''),
            quantity: new FormControl(''),
            uom: new FormControl(''),
            price: new FormControl(''),
            available: new FormControl(''),
            finalprice: new FormControl(''),
            salequantity: new FormControl(''),
            rateCardQuantity: new FormControl(''),
            rateCardPrice: new FormControl(''),
            uomSize:new FormControl('')
        });
        this.saleorderFormGroup = new FormGroup({
            date: new FormControl(new Date()),
            description: new FormControl(''),
            purchasedby: new FormControl(''),
            status: new FormControl(''),
            totalamount: new FormControl(''),
            totalitems: new FormControl(''),
            purchasedat: new FormControl(''),
            vendorId: new FormControl(),
            stallId:new FormControl()
        });
        const saleorderResp = await this.service.fetchRequest(
            'saleorder/getAllSaleorder'
        );
        this.allSaleOrderData = saleorderResp['saleorderList'];

        this.saleorderData = this.allSaleOrderData;

        // for not showing completed pos
        this.saleorderData = this.saleorderData.filter((item) => {
            return item.status != 'Completed';
        });
        const counterresp = await this.service.fetchRequest('stall/getAllStalls');
        this.stallData = counterresp['supplierList'];
        this.stallData = this.stallData.filter((stall) => {
            return stall.type == "Store" || stall.type == "Warehouse";
          });
        // creataing empty array for pushing saleorderItems
        this.saleorderData.forEach((so) => {
            so['saleorderItems'] = [];
            this.stallData.find((stall)=>{
                if(stall.stallid==so.stallId) so['name']=stall.name
            }) 
        });
        // adhoc items
        const saleorderitemsresp = await this.service.fetchRequest(
            'saleorderitem/getAllSaleorderitem'
        );
        this.saleOrderItems = saleorderitemsresp['saleorderitemList'];
        // for balance Qty
        this.saleOrderItems.forEach((item) => {
            item['balanceQty'] = item.quantity - item.salequantity;
        });
        const stallOpResp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.stallOperator = stallOpResp['stallOperatorList'];
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        this.saleorderData.forEach((so) => {
            this.stallOperator.forEach((op) => {
                if (parseInt(so.purchasedby) === op.stalloperatorid)
                    so['opName'] = op.name;
            });
        });
        // for category in po header
        this.saleorderData.forEach((po) => {
            let categoryArray = [];
            let categoryString: string = '';
            this.saleOrderItems.forEach((item) => {
                if (item.isStockAdded === true) {
                    item.stockButton = 'Already Added';
                } else {
                    item.stockButton = 'Add to Stock';
                }
                if (po.saleorderid === item.saleorderid) {
                    categoryArray.push(item.category);
                    let categoryString = [...new Set(categoryArray)].toString();
                    po.category = categoryString;
                }
            });
        });
        // below is for purchase rate card
        const purchaseRateCardResp = await this.service.fetchRequest(
            'purchaseratecard/getAllpurchaseratecard'
        );
        this.purchaseRateCardData =
            purchaseRateCardResp['purchaseratecardList'];
        //
        // for changing true to available
        // this.saleOrderItems.forEach((item) => {
        //     if (item.available === true) {
        //         item.available = 'Available';
        //     } else {
        //         item.available = 'Not Available';
        //     }
        // });
        // for getting product name
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
        this.productsList.forEach((item) => {
            this.saleOrderItems.forEach((element) => {
                element.prodImage = `${element.productlist}.webp`;
                if (element.productlist == item.prodId) {
                    element['prodName'] = item.prodName;
                    element['tname'] = item.tname;
                    element['itemName'] = item.prodName + '-'+ item.mrpprice+'-'+item.quom+item.muom ;
                    element['quantityUom'] =
                        element.quantity + ' ' + element.uom;
                }
            });
        });

        // // sorting data

        // this.saleOrderItems = this.SortIngr(this.saleOrderItems);
        // let order = ['Groceries', 'Vegetables', 'Non Veg', 'Others'];
        // let newArray = [];
        // order.forEach((orderitem) => {
        //     return this.saleOrderItems.filter((ingr) => {
        //         if (ingr.category === orderitem) newArray.push(ingr);
        //     });
        // });
        // this.saleOrderItems = newArray;
        this.saleOrderItems = this.saleOrderItems.sort((a, b) => {
            return b?.finalprice - a?.finalprice;
        });

        this.saleOrderItems.forEach((item) => {
            if (!item.available && item.balanceQty === 0) {
                item.sortKey = 1; // First condition: available false and balance == 0
            } else if (item.available && item.balanceQty === 0) {
                item.sortKey = 3; // Second condition: available true and balanceQty == 0
            } else if (!item.available && item.balanceQty > 0) {
                item.sortKey = 2; // Third condition: checked false and balance > 0
            } else {
                item.sortKey = 0; // Other items that don't meet the conditions
            }
        });

        this.saleOrderItems.sort((a, b) => a.sortKey - b.sortKey);

        // status push
        // pushing relational items to adhoc po
        this.saleorderData.forEach((adhoc) => {
            this.saleOrderItems.forEach((poitem) => {
                if (adhoc.saleorderid === poitem.saleorderid) {
                    adhoc.saleorderItems.push(poitem);
                    adhoc.childActive = false;
                    adhoc.isEdit = false;
                }
            });
        });
        // for getting selected items list and selected items price
        this.saleorderData.forEach((order) => {
            let items = order.saleorderItems;
            let itemCount = 0;
            let itemPrice = 0;
            items.forEach((item: SaleOrderItems) => {
                if (item.available === true) {
                    itemCount += itemCount + 1;
                    itemPrice += itemPrice + item.finalprice;
                }
            });
            order['selectedAmount'] = itemPrice;
            order['selectedItems'] = itemCount;
        });
        console.log(this.saleorderData);
        this.itemcontrol.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterproducts();
            });
        this.saleorderitemFormgroup.controls['rateCardQuantity'].disable();
        this.saleorderitemFormgroup.controls['rateCardPrice'].disable();
        
        const suppResp = await this.service.fetchRequest(
            'supplier/getAllSuppliers'
        );
        this.suppliersList = suppResp['supplierList'];
    }
   
   async onSelectProducts(value) {
        console.log(value);
        let uom = '';
        let uomSize = '';
        let uomPrice;
        const foundProduct = this.productsList.find(item => item.prodId === value);

        if (foundProduct) {      
          uom = foundProduct.muom;
          uomPrice = foundProduct.mrpprice;
          this.saleorderitemFormgroup.controls['uom'].setValue(uom);
        this.saleorderitemFormgroup.controls['price'].setValue(uomPrice);
        
          // Find the variant within the found product where `prodId` matches
          const foundVariant = foundProduct.variants.find(variant => variant.prodId === foundProduct.prodId);
        
          if (foundVariant) {
            uomSize = foundVariant.uomSize;
            uom = foundVariant.purchaseUom || uom;
          }
        }
        this.saleorderitemFormgroup.controls['uom'].setValue(uom);
        this.saleorderitemFormgroup.controls['uomSize'].setValue(uomSize);
        this.saleorderitemFormgroup.controls['price'].setValue(uomPrice);
        // logic from getting price from purchase rate card
        // this.purchaseRateCardData.forEach((rateCard) => {
        //     if (rateCard.itemId === value && uom === rateCard.uom) {
        //         this.rateCardQuantity = rateCard?.quantity;
        //         this.rateCardPrice = rateCard?.salePercentage;
        //     }
        // });
        // this.saleorderitemFormgroup.controls['rateCardQuantity'].setValue(
        //     this.rateCardQuantity
        // );
        // this.saleorderitemFormgroup.controls['rateCardPrice'].setValue(
        //     this.rateCardPrice
        // );
        // let quantity = this.saleorderitemFormgroup.controls['salequantity']
        //     .value;
        // const pricePerUom =
        //     parseFloat(this.rateCardPrice.toFixed(2)) / quantity;
        // this.saleorderitemFormgroup.controls['price'].setValue(
        //     parseFloat(pricePerUom.toFixed(2))
        // );
        this.saleorderitemFormgroup.controls['price'].setValue(uomPrice);
    }
    async onSearch() {
        let startDate = this.searchFormGroup.controls['startDate'].value;
        let endDate = this.searchFormGroup.controls['endDate'].value;
        let status = this.searchFormGroup.controls['status'].value;

        if (startDate && endDate) {
            let datePayload = {};
            datePayload['startDate'] = formatDate(
                startDate,
                'YYYY-MM-dd',
                this.locale
            );
            datePayload['endDate'] = formatDate(
                endDate,
                'YYYY-MM-dd',
                this.locale
            );
            const resp = await this.service.fetchRequestPost(
                'saleorder/getSaleorderByDate',
                datePayload
            );
            this.saleorderData = resp['saleorderList'];
        }
        if (!status) {
            this.saleorderData = this.saleorderData.filter((event) => {
                return event.status != 'Completed';
            });
        } else if (status) {
            this.saleorderData = this.saleorderData.filter((event) => {
                return event.status === status;
            });
        }
        this.saleorderData.forEach((saleorder) => {
            saleorder['saleorderItems'] = [];
        });
        this.saleorderData.forEach((so) => {
            this.saleOrderItems.forEach((soItem) => {
                if (so.saleorderid === soItem.saleorderid) {
                    so.saleorderItems.push(soItem);
                    so.childActive = false;
                    so.isEdit = false;
                }
            });
        });
        //
        this.saleorderData.forEach((so) => {
            this.stallOperator.forEach((op) => {
                if (parseInt(so.purchasedby) === op.stalloperatorid)
                    so['opName'] = op.name;
            });
        });
        // for category in po header
        this.saleorderData.forEach((po) => {
            let categoryArray = [];
            let categoryString: string = '';
            this.saleOrderItems.forEach((item) => {
                if (item.isStockAdded === true) {
                    item.stockButton = 'Already Added';
                } else {
                    item.stockButton = 'Add to Stock';
                }
                if (po.saleorderid === item.saleorderid) {
                    categoryArray.push(item.category);
                    let categoryString = [...new Set(categoryArray)].toString();
                    po.category = categoryString;
                }
            });
        });
        // for getting selected items list and selected items price
        this.saleorderData.forEach((order) => {
            let items = order.saleorderItems;
            let itemCount = 0;
            let itemPrice = 0;
            items.forEach((item: SaleOrderItems) => {
                if (item.available === true) {
                    itemCount += itemCount + 1;
                    itemPrice += itemPrice + item.finalprice;
                }
            });
            order['selectedAmount'] = itemPrice;
            order['selectedItems'] = itemCount;
        });
    }
    async OnSaveSaleOrderItem() {
        const value = this.saleorderitemFormgroup.getRawValue();
        if (value.available === null || value.available === '')
            value.available = false;

        let saleOrderId = value.saleorderid;
        value['saleorderitemid'] = this.saleorderitemid;
        const resp = await this.service.fetchRequestPost(
            'saleorderitem/createSaleorderitem',
            value
        );
        this.getData(saleOrderId);
       
        this.saleorderid = 0;
        this.saleorderitemid = 0;
        this.isSaleOrderDetails = false;
        this.isSaleOrderItemDetails = false;
        this.isMatDrawerOpened = false;
        this.saleorderitemFormgroup.reset();
        this.currentObj = {};
    }
    OnSaleQuantityEnter(number) {
        console.log(number);
        let requiredQuantity = number;
        let saleQuantityPrice =
            (requiredQuantity * this.rateCardPrice) / this.rateCardQuantity;
        console.log(saleQuantityPrice);
        this.saleorderitemFormgroup.controls['finalprice'].setValue(
            saleQuantityPrice
        );
        let quantity = this.rateCardQuantity;
        const pricePerUom = this.rateCardPrice / quantity;
        this.saleorderitemFormgroup.controls['price'].setValue(
            parseFloat(pricePerUom.toFixed(2))
        );
    }
    OnSaveSO() {
        this.SaveSODetails(this.saleorderid);
        this.saleorderid = 0;
        this.saleorderitemid = 0;
        this.isSaleOrderDetails = false;
        this.isSaleOrderItemDetails = false;
        this.isMatDrawerOpened = false;
        this.saleorderFormGroup.reset();
    }
    async SaveSODetails(saleorderid) {
        let form = this.saleorderFormGroup.getRawValue();
        form['saleorderid'] = saleorderid;

        // form['price'] = this.selectedData.price;

        const updateresp = await this.service.fetchRequestPost(
            'saleorder/createSaleorder',
            form
        );
        this.getData(saleorderid);
        this.saleorderData.forEach((so) => {
            so['saleorderItems'] = [];
            this.stallData.find((stall)=>{
                if(stall.stallid==so.stallId) so['name']=stall.name
            }) 
        });
    }
    async getData(saleOrderId) {
        const saleorderResp = await this.service.fetchRequest(
            'saleorder/getAllSaleorder'
        );
        this.saleorderData = saleorderResp['saleorderList'];
        // for not showing completed pos
        this.saleorderData = this.saleorderData.filter((item) => {
            return item.status != 'Completed';
        });
        // creataing empty array for pushing adhocpoitems
        this.saleorderData.forEach((so) => {
            so['saleorderItems'] = [];
           
           
                this.stallData.find((stall)=>{
                    if(stall.stallid==so.stallId) so['name']=stall.name
                }) 
         
        });
        // adhoc items
        const saleorderitemsresp = await this.service.fetchRequest(
            'saleorderitem/getAllSaleorderitem'
        );
        this.saleOrderItems = saleorderitemsresp['saleorderitemList'];
        // for balance Qty
        this.saleOrderItems.forEach((item) => {
            item['balanceQty'] = item.quantity - item.salequantity;
        });
        this.saleorderData.forEach((so) => {
            this.stallOperator.forEach((op) => {
                if (parseInt(so.purchasedby) === op.stalloperatorid)
                    so['opName'] = op.name;
            });
        });
        // for category in po header
        this.saleorderData.forEach((po) => {
            let categoryArray = [];
            let categoryString: string = '';
            this.saleOrderItems.forEach((item) => {
                if (item.isStockAdded === true) {
                    item.stockButton = 'Already Added';
                } else {
                    item.stockButton = 'Add to Stock';
                }
                if (po.saleorderid === item.saleorderid) {
                    categoryArray.push(item.category);
                    let categoryString = [...new Set(categoryArray)].toString();
                    po.category = categoryString;
                }
            });
        });

        this.productsList.forEach((item) => {
            this.saleOrderItems.forEach((element) => {
                element.prodImage = `${element.productlist}.webp`;
                if (element.productlist == item.prodId) {
                    element['prodName'] = item.prodName;
                    element['tname'] = item.tname;
                    element['itemName'] = item.prodName + '-'+ item.mrpprice+'-'+item.quom+item.muom ;
                    element['quantityUom'] =
                        element.quantity + ' ' + element.uom;
                }
            });
        });

        // pushing relational items to adhoc po
        this.saleorderData.forEach((adhoc) => {
            this.saleOrderItems.forEach((poitem) => {
                if (adhoc.saleorderid === poitem.saleorderid) {
                    adhoc.saleorderItems.push(poitem);
                    adhoc.childActive = false;
                    adhoc.isEdit = false;
                }
            });
        });
        // for getting selected items list and selected items price
        this.saleorderData.forEach((order) => {
            let items = order.saleorderItems;
            let itemCount = 0;
            let itemPrice = 0;
            items.forEach((item: SaleOrderItems) => {
                if (item.available === true) {
                    itemCount += itemCount + 1;
                    itemPrice += itemPrice + item.finalprice;
                }
            });
            order['selectedAmount'] = itemPrice;
            order['selectedItems'] = itemCount;
        });
        this.saleOrderItems.forEach((item) => {
            if (!item.available && item.balanceQty === 0) {
                item.sortKey = 1; // First condition: available false and balance == 0
            } else if (item.available && item.balanceQty === 0) {
                item.sortKey = 3; // Second condition: available true and balanceQty == 0
            } else if (!item.available && item.balanceQty > 0) {
                item.sortKey = 2; // Third condition: checked false and balance > 0
            } else {
                item.sortKey = 0; // Other items that don't meet the conditions
            }
        });

        this.saleOrderItems.sort((a, b) => a.sortKey - b.sortKey);
        this.saleorderData.forEach((so) => {
            if (so.saleorderid === saleOrderId) {
                so.childActive = true;
                this.poItemsTable = new MatTableDataSource(so.saleorderItems);
                this.mobileSoItems = so.saleorderItems;
            }
        });
    }
    async OnAddToStock() {
        let row = this.currentObj;
        const date = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        const payload = {};
        payload['saleorderitemid'] = row.saleorderitemid;
        payload['itemid'] = parseInt(row.productlist);
        payload['itemname'] = row.prodName;
        payload['uom'] = row.uom;
        payload['salequantity'] = parseFloat(row.salequantity.toFixed(2));
        payload['isStockAdded'] = true;
        payload['purchaseddate'] = date;
        payload['category'] = row.category;
        console.log(payload);
        const resp = await this.service.fetchRequestPost(
            'saleorder/addtoinventory',
            payload
        );
        row.isStockAdded = true;
        row.stockButton = 'Already Added';
        this.isMatDrawerOpened = false;
        this.isSaleOrderItemDetails = false;
        this.isSaleOrderDetails = false;
    }
    OnPricePerUOMChange(value) {
        console.log(value);
        let quantity = this.saleorderitemFormgroup.controls['quantity'].value;

        const finalValue = parseFloat(value.toFixed(2)) * quantity;
        console.log(finalValue);
        console.log(this.selectedRow);
        this.saleorderitemFormgroup.controls['finalprice'].setValue(
            parseFloat(finalValue.toFixed(2))
        );
    }
    decline() {
        this.modalReference.close();
    }
    OnDelete(modal) {
        this.modalReference = this.dialog.open(modal);

        this.delObj = {
            saleorderitemid: this.saleorderitemid,
        };
    }
    OnDelSO(dialog) {
        this.modalReference = this.dialog.open(dialog);
    }
    async confirm() {
        if (this.isSaleOrderItemDetails) {
            const delResp = await this.service.fetchRequestdel(
                'saleorderitem/deleteSaleorderitem',
                this.delObj
            );
        }
        if (this.isSaleOrderDetails) {
            let payload = {
                saleorderid: this.saleorderid,
            };
            const delResp = await this.service.fetchRequestdel(
                'saleorder/deleteSaleorder',
                payload
            );
        }
        this.getData(this.saleorderid);
        this.modalReference.close();
        this.saleorderid = 0;
        this.saleorderitemid = 0;
        this.isMatDrawerOpened = false;
        this.isSaleOrderItemDetails = false;
        this.isSaleOrderDetails = false;
    }
    OnFinalPriceChange(value) {
        let quantity = this.saleorderitemFormgroup.controls['salequantity']
            .value;
        const pricePerUom = parseFloat(value.toFixed(2)) / quantity;
        this.saleorderitemFormgroup.controls['price'].setValue(
            parseFloat(pricePerUom.toFixed(2))
        );
    }

    async PoItemRowSave(rowData) {
        this.columnsSchema.forEach((col) => {
            if (col.key === 'uom') {
                col.isColumnActive = false;
            }
        });
        console.log(rowData);
        // for updating price locally
        let totalPrice = 0;
        this.saleOrderItems.forEach((item) => {
            if (item.saleorderid === rowData.saleorderid) {
                let price = +item.finalprice;
                totalPrice += price;
            }
        });
        console.log(totalPrice);
        this.saleorderData.forEach((po) => {
            if (po.saleorderid == rowData.saleorderid)
                po.totalamount = totalPrice;
        });
        this.saleorderitemFormgroup.patchValue({
            saleorderid: rowData.saleorderid,
            category: rowData.category,
            productlist: rowData.productlist,
            quantity: parseInt(rowData.quantity),
            uom: rowData.uom,
            price: parseFloat(rowData.price),
            available: rowData.available,
            finalprice: parseFloat(rowData?.finalprice.toFixed(2)),
            salequantity: rowData?.salequantity,
            uomSize:rowData?.uomSize
        });
        console.log(this.saleorderitemFormgroup.getRawValue);
        const data = this.saleorderitemFormgroup.getRawValue();
        data['saleorderitemid'] = rowData.saleorderitemid;
        const saveResp = await this.service.fetchRequestPost(
            'saleorderitem/createSaleorderitem',
            data
        );
        rowData.isEdit = false;
    }
    CancelRow(row: SaleOrderItems) {
        this.columnsSchema.forEach((col) => {
            if (col.key === 'uom') {
                col.isColumnActive = false;
            }
        });
        row.isEdit = false;
        row.quantity = this.oldValueRow.quantity;
        row.price = this.oldValueRow.price;
        row.finalprice = this.oldValueRow.finalprice;
        row.uom = this.oldValueRow.uom;
    }
    protected filterproducts() {
        if (!this.productsList) {
            return;
        }
        // get the search keyword
        let search = this.itemcontrol.value;
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
    OnEditRow(row) {
        this.currentObj = row;
        this.saleorderid = row.saleorderid;
        console.log('row', row);
        this.saleorderitemid = row.saleorderitemid;
        this.isMatDrawerOpened = true;
        this.isSaleOrderItemDetails = true;

        this.saleorderitemFormgroup.patchValue({
            saleorderid: row?.saleorderid,
            category: row?.category,
            productlist: parseInt(row?.productlist),
            quantity: row?.quantity,
            uom: row?.uom,
            price: row?.price,
            available: row.available,
            finalprice: row?.finalprice,
            salequantity: row?.salequantity,
            uomSize:row?.uomSize
        });
        this.purchaseRateCardData.forEach((rateCard) => {
            if (
                rateCard.itemId === parseInt(row.productlist) &&
                row.uom === rateCard.uom
            ) {
                this.rateCardQuantity = rateCard?.quantity;
                this.rateCardPrice = rateCard?.salePercentage;
            }
        });
        this.saleorderitemFormgroup.controls['saleorderid'].disable();
        this.saleorderitemFormgroup.controls['category'].disable();
        this.saleorderitemFormgroup.controls['productlist'].disable();
        this.saleorderitemFormgroup.controls['saleorderid'].disable();
        this.saleorderitemFormgroup.controls['rateCardQuantity'].setValue(
            this.rateCardQuantity
        );
        this.saleorderitemFormgroup.controls['rateCardPrice'].setValue(
            this.rateCardPrice
        );
        this.saleorderitemFormgroup.controls['uom'].disable();
        this.saleorderitemFormgroup.controls['price'].disable();
        // this.saleorderitemFormgroup.controls['finalprice'].disable();
    }
    OnEditSO(row, element) {
        element.stopPropagation();
        this.saleorderid = row.saleorderid;
        this.isMatDrawerOpened = true;
        this.isSaleOrderDetails = true;
        this.saleorderFormGroup.controls['vendorId'].disable();
        this.saleorderFormGroup.patchValue({
            date: row.date,
            description: row?.description,
            purchasedby: row?.purchasedby,
            status: row?.status,
            totalamount: row?.totalamount,
            totalitems: row?.totalitems,
            purchasedat: row?.purchasedat,
            vendorId: row?.vendorId,
            stallId: row?.stallId
        });
    }
    SortIngr(rcpIngr) {
        rcpIngr.sort((a, b) => {
            if (a?.prodName && b?.prodName) {
                const nameA = a.prodName.toUpperCase(); // ignore upper and lowercase
                const nameB = b.prodName.toUpperCase(); // ignore upper and lowercase

                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
            }
            // names must be equal
            return 0;
        });
        return rcpIngr;
    }
    OnExport(modal) {
        this.purchaseorder.disable();
        this.purchaseorder.setValue(this.saleorderid);
        this.modalReference = this.modalService.open(modal);
    }
    OnExportByQuantity(modal) {
        this.purchaseorder.disable();
        this.purchaseorder.setValue(this.saleorderid);
        this.modalReference = this.modalService.open(modal);
        this.isQuantity = true;
    }
    OnClose(reason) {
        this.purchaseorder.reset();
        this.category.reset();
        this.available.reset();
        this.isQuantity = false;
        this.isMatDrawerOpened = false;
        this.isSaleOrderDetails = false;
        this.isSaleOrderItemDetails = false;
        this.saleorderid = 0;
        this.saleorderitemid = 0;
        this.saleorderitemFormgroup.reset();
        this.currentObj = {};
    }
    OnClosePopup(reason) {
        this.modalReference.close();
    }
    onSavePopup() {
        this.columnsSchema.forEach((col) => {
            if (col.key === 'uom') {
                col.isColumnActive = false;
            }
        });

        let purchaseorder = this.purchaseorder.getRawValue();
        let category = this.category.value;
        let available = this.available.value;
        let items = [];
        if (available != 'All') {
            items = this.saleOrderItems.filter((item) => {
                return item.available + '' === available;
            });
        } else {
            items = this.saleOrderItems;
        }

        if (purchaseorder && category) {
            if (category === 'All') {
                items = items.filter((item) => {
                    return item.saleorderid === parseInt(purchaseorder);
                });
            } else {
                let temp = [];
                for (let key in items) {
                    if (category != 'All') {
                        if (
                            items[key].saleorderid ===
                                parseInt(purchaseorder) &&
                            items[key].category === category
                        ) {
                            temp.push(items[key]);
                        }
                    }
                }
                items = temp;
            }

            if (items) {
                this.modalReference.close();
                items = this.SortItems(items);
                let adhocData = this.saleorderData.filter((item) => {
                    return item.saleorderid === parseInt(purchaseorder);
                });

                if (this.isQuantity) {
                    items = items.sort((a, b) => {
                        return b?.quantity - a?.quantity;
                    });
                    this.OnPdfPressQuantity(items, adhocData);
                } else {
                    items = items.sort((a, b) => {
                        return b?.finalprice - a?.finalprice;
                    });
                    this.OnPdfPress(items, adhocData);
                }
            }
        }
        this.purchaseorder.reset();
        this.category.reset();
        this.available.reset();
        this.isQuantity = false;
    }
    SortItems(data) {
        let temp = data.sort((a, b) => {
            if (a.prodName && b.prodName) {
                const nameA = a?.prodName.toUpperCase(); // ignore upper and lowercase
                const nameB = b?.prodName.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
            }
        });

        let order = ['Groceries', 'Vegetables', 'Non Veg', 'Others'];
        let newArray = [];
        order.forEach((orderitem) => {
            return temp.filter((ingr) => {
                if (ingr.category === orderitem) newArray.push(ingr);
            });
        });
        data = newArray;
        return data;
    }
    playAudio() {
        let audio = new Audio();
        audio.src = '../../../assets/audio/Alarm.mp3';
        audio.load();
        audio.play();
    }
    OnPdfPressQuantity(data, poData) {
        console.log(poData);
        // this.playAudio();
        let totalAmount = 0;
        data.forEach((item) => {
            totalAmount += parseFloat(item.finalprice.toFixed(2));
        });

        data.forEach((row) => {
            if (row.uom == 'gms' || row.uom == 'ml') {
                if (row.quantity >= 1000) {
                    row.quantity = row.quantity / 1000;
                    row.quantity = row.quantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.quantity = row.quantity;
                }
            } else {
                row.quantity = row?.quantity;
            }
        });
        console.log(poData.description);
        let docDefinition = {
            defaultStyle: {
                font: 'telugu', // use your font name here
            },
            content: [
                // Previous configuration
                {
                    text: `PO#: ${poData[0].saleorderid}, Description: ${poData[0].description}`,
                    fontSize: 17,
                },
                {
                    text: `PO Date: ${poData[0].date}, Total Items: ${data.length}, Total Amount: ${totalAmount}`,
                    fontSize: 17,
                },
                {
                    table: {
                        headerRows: 1,
                        body: [
                            [
                                'SNo',
                                'Item ID/Name',
                                'Total Quantity',
                                'Category',
                            ],
                            ...data.map((p, i) => [
                                i + 1,
                                p.prodName + '-' + p.tname,
                                p.quantity + ' ' + p.uom,
                                p.category,
                            ]),
                        ],
                    },
                },
            ],
        };
        console.log(docDefinition);
        pdfMake
            .createPdf(docDefinition)
            .download(
                poData[0].saleorderid.toString() +
                    '-' +
                    poData[0].description +
                    '.pdf'
            );
    }
    OnPdfPress(data, poData) {
        console.log(poData);
        // this.playAudio();
        let totalAmount = 0;
        data.forEach((item) => {
            totalAmount += parseFloat(item.finalprice.toFixed(2));
        });

        data.forEach((row) => {
            if (row.uom == 'gms' || row.uom == 'ml') {
                if (row.quantity >= 1000) {
                    row.quantity = row.quantity / 1000;
                    row.quantity = row.quantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.quantity = row.quantity;
                }
            } else {
                row.quantity = row?.quantity;
            }
        });
        console.log(poData.description);
        let docDefinition = {
            defaultStyle: {
                font: 'telugu', // use your font name here
            },
            content: [
                // Previous configuration
                {
                    text: `PO#: ${poData[0].saleorderid}, Description: ${poData[0].description}`,
                    fontSize: 17,
                },
                {
                    text: `PO Date: ${poData[0].date}, Total Items: ${data.length}, Total Amount: ${totalAmount}`,
                    fontSize: 17,
                },
                {
                    table: {
                        headerRows: 1,
                        body: [
                            [
                                'SNo',
                                'Item ID/Name',
                                'Total Quantity',
                                'Category',
                                'Price per UOM',
                                'Final Price',
                            ],
                            ...data.map((p, i) => [
                                i + 1,
                                p.prodName + '-' + p.tname,
                                p.quantity + ' ' + p.uom,
                                p.category,
                                p.price,
                                p.finalprice,
                            ]),
                        ],
                    },
                },
            ],
        };
        console.log(docDefinition);
        pdfMake
            .createPdf(docDefinition)
            .download(
                poData[0].saleorderid.toString() +
                    '-' +
                    poData[0].description +
                    '.pdf'
            );
    }
    onAdhocItemClick(obj) {
        let saleorderitemid = obj.saleorderitemid;
        this.router.routeReuseStrategy.shouldReuseRoute = () => true;
        this.router
            .navigate([`nfm/kitchen-tasks/po-items/item/${saleorderitemid}`], {
                skipLocationChange: false,
            })
            .then(() => {
                this.router.routeReuseStrategy.shouldReuseRoute = () => false;
            });
    }
    OnSaleOrderClick() {
        this.saleorderFormGroup.reset();
        this.saleorderFormGroup
        .get('date')
        .setValue(new Date().toISOString().split('T')[0]);
        // this.saleorderFormGroup.controls['date'].setValue(new Date())
        this.itemcontrol.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterproducts();
            });
        this.isSaleOrderDetails = true;
        this.isSaleOrderItemDetails = false;
        this.isMatDrawerOpened = true;
        this.saleorderFormGroup.controls['vendorId'].setValue(this.vendorId);
        this.saleorderFormGroup.controls['status'].setValue(this.statusData[0]);
    }
    OnSaleOrderItemClick() {
        // this.saleorderitemFormgroup.controls['saleorderid'].disable();
        // this.saleorderitemFormgroup.controls['price'].disable();

        // // this.saleorderitemFormgroup.controls['finalprice'].disable();
        // this.saleorderitemFormgroup.controls['saleorderid'].setValue(
        //     this.saleorderid
        // );
        this.saleorderitemFormgroup.enable();
        this.saleorderitemFormgroup.controls['saleorderid'].disable();
        if (this.saleorderid != 0) {
            this.saleorderitemFormgroup.controls['saleorderid'].setValue(
                this.saleorderid
            );
        }
        this.isSaleOrderItemDetails = true;
        this.isSaleOrderDetails = false;
        this.isMatDrawerOpened = true;

        console.log(this.currentObj);
        if (this.currentObj) {
            this.saleorderFormGroup.patchValue({
                saleorderid: this.currentObj.saleorderid,
            });
        }
    }
    async StatusChange(so,value) {
        let saleorderid = so.saleorderid;
        so.status = value;
        const saveresp = await this.service.fetchRequestPost(
            'saleorder/createSaleorder',
            so
        );
        this.getData(saleorderid);
        this.saleorderData.forEach((so) => {
            so['saleorderItems'] = [];
            this.stallData.find((stall)=>{
                if(stall.stallid==so.stallId) so['name']=stall.name
            }) 
        });
    }
    onQuantityInput(event){
        let form = this.saleorderitemFormgroup.getRawValue();
        let Qty=form?.quantity
        let totalQty = Qty*form?.uomSize
        this.saleorderitemFormgroup.controls['finalprice'].setValue(totalQty)
      }
    activatingChild(po) {
        this.saleorderData.forEach((item) => {
            if (item.saleorderid === po.saleorderid)
                po.childActive = !po.childActive;
            else item.childActive = false;
        });
        // this.saleOrderItems.forEach((item) => {
        //     item['balanceQty'] = item.quantity - item.salequantity;
        // });
        // this.saleorderData.forEach((so) => {
        //     this.stallOperator.forEach((op) => {
        //         if (parseInt(so.purchasedby) === op.stalloperatorid)
        //             so['opName'] = op.name;
        //     });
        // });
        // this.productsList.forEach((item) => {
        //     this.saleOrderItems.forEach((element) => {
        //         element.prodImage = `${element.productlist}.webp`;
        //         if (element.productlist == item.prodId) {
        //             element['prodName'] = item.prodName;
        //             element['tname'] = item.tname;
        //             element['itemName'] = item.prodName + '-' + item.tname;
        //             element['quantityUom'] =
        //                 element.quantity + ' ' + element.uom;
        //         }
        //     });
        // });
        // this.saleorderData.forEach((adhoc) => {
        //     this.saleOrderItems.forEach((poitem) => {
        //         if (adhoc.saleorderid === poitem.saleorderid) {
        //             adhoc.saleorderItems.push(poitem);
        //             adhoc.childActive = false;
        //             adhoc.isEdit = false;
        //         }
        //     });
        // });
        // this.saleOrderItems.forEach((item) => {
        //     if (!item.available && item.balanceQty === 0) {
        //         item.sortKey = 1; // First condition: available false and balance == 0
        //     } else if (item.available && item.balanceQty === 0) {
        //         item.sortKey = 3; // Second condition: available true and balanceQty == 0
        //     } else if (!item.available && item.balanceQty > 0) {
        //         item.sortKey = 2; // Third condition: checked false and balance > 0
        //     } else {
        //         item.sortKey = 0; // Other items that don't meet the conditions
        //     }
        // });

        this.saleOrderItems.sort((a, b) => a.sortKey - b.sortKey);
        this.poItemsTable = new MatTableDataSource(po.saleorderItems);
        this.mobileSoItems = po.saleorderItems;
    }
    OnDeletePoItem(row) {
        this.saleorderitemid = row.saleorderitemid;
        this.saleorderid = row.saleorderid;
        row.isDelete = true;
    }
    async Delete() {
        const delObj = {
            saleorderitemid: this.saleorderitemid,
        };
        const delResp = await this.service.fetchRequestdel(
            'saleorderitem/deleteSaleorderitem',
            delObj
        );
        this.saleorderData.forEach((po) => {
            if (po.saleorderid == this.saleorderid) {
                const objWithIdIndex = po.saleorderItems.findIndex(
                    (obj) => obj.saleorderitemid === this.saleorderitemid
                );
                po.saleorderItems.splice(objWithIdIndex, 1);
            }
        });
    }
    CancelDel(row) {
        row.isDelete = false;
        row.isEdit = false;
    }
}
