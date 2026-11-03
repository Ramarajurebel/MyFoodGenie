import {
    Component,
    Inject,
    LOCALE_ID,
    OnInit,
    ViewChild,
    ChangeDetectorRef,
    ElementRef,
    TemplateRef,
} from '@angular/core';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { MatTableDataSource } from '@angular/material/table';
import * as pdfMakeConfig from 'pdfmake/build/pdfmake.js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdhocPoItems } from './../../shared/classes/adhocpo-items';
import { PoItemsColumns } from './../../shared/tables/adhocpoitems-columns';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import { fill } from 'lodash';
import { formatDate } from '@angular/common';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Suppliers } from 'app/shared/classes/supplier';
import { SupItems } from './../../shared/classes/sup-items';
import { products } from './../../mock-api/apps/ecommerce/inventory/data';


pdfMakeConfig.vfs = pdfFonts.pdfMake.vfs;
@Component({
    selector: 'app-adhoc-details',
    templateUrl: './adhoc-details.component.html',
    styleUrls: ['./adhoc-details.component.scss'],
})
export class AdhocDetailsComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    appearnce: MatFormFieldModule = fill;
    adhocPoData = [];
    adhocPoItems: AdhocPoItems[] = [];
    purchaseRateCardData = [];
    poItemsTable = new MatTableDataSource<AdhocPoItems>();
    displayedColumns: string[] = PoItemsColumns.map((col) => col.key);
    columnsSchema: any = PoItemsColumns;
    adhocItemformGroup: FormGroup;
    productsList = [];
    modalReference: any;
    public categories = ['Vegetables', 'Groceries', 'Non Veg', 'Others'];
    public paymentmode = ['Online','Cash'];
    public PaymentStatusData = ['Paid','Not Paid']
    purchaseorder: FormControl = new FormControl('');
    category: FormControl = new FormControl('');
    available: FormControl = new FormControl('');
    adhocpoitemid: number = 0;
    adhocpoid: number = 0;
    mobilePoItems: AdhocPoItems[];

    public uomData = [
        'gms',
        'ml',
        'pieces',
        'bunch',
        'Kgs',
        'Bag (50 Kgs)',
        'Tray (25 Kgs)',
        'Tin (15 Kgs)',
    ];
    public uom = [
        'ml',
        'gms',
        '1pc'
    ];
    public purchaseuom = [
        'Packets','Cartons','Pieces','Boxes'
    ];
    public taxTypes = [
        'Inclusive','Exclusive'
    ];
    stallOperator = [];
    selectedRow: AdhocPoItems;
    oldValueRow: AdhocPoItems;
    ingredientsImagePath = './assets/images/ingredients/';
    isQuantity: boolean = false;
    delObj = {};
    isMatDrawerOpened: boolean = false;
    isAdhocItemDetails: boolean = false;
    isAdhocPoItemEditMode: boolean = false;
    isAdhocDetails: boolean = false;
    adhocPoFormGroup: FormGroup;
    public filtereditems = [];
    itemControl: FormControl = new FormControl('');
    protected _onDestroy = new Subject<void>();
    statusData = ['Open', 'In Review', 'In Purchase', 'In Transit','Quality Check','Completed','Cancelled'];
    currentObj: any;
    searchFormGroup: FormGroup;
    updatePricePayload: any;
    salePriceControl: FormControl = new FormControl('');
    allAdhocPo = [];
    poCategory: string;
    dropdownSettings: IDropdownSettings;
    posList: FormControl = new FormControl();
    newPoName: FormControl = new FormControl();
    snackBarRef: any;
    @ViewChild('snackBar', { static: true }) snackBar: TemplateRef<any>;
    // @ViewChild('lastDivRef', { static: false }) lastDivRef!: ElementRef<HTMLElement>;

    responseMessage: string = '';
    suppliersList: Suppliers[] = [];
    supplierItemsList: SupItems[] = [];
    vendorData = [];
    vendorId: number = 0;
    stallData: any;
    CGST: any;
    SCGST: any;
    CESS: any;
    editmode: boolean = false;
    showGSTDetails: boolean;
    productsByVariantsList: any;
    lastPurchasedDate: any;
    lastPurchasedPrice: any;
    lastPurchasedQty: any;
    hsnCode: any;
    isHovered: boolean = false;
    isLastpurchasehovered: any;
    taxtype: any;
    searchMode: boolean= false;user: any;
    username: any;
    edititemMode: boolean = false;
    validation: boolean;
    refOrder: any;
    poback: boolean = false;
;

    constructor(
        private service: ProjectService,
        private router: Router,
        private dialog: MatDialog,
        private modalService: NgbModal,
        @Inject(LOCALE_ID) public locale: string,
        private _liveAnnouncer: LiveAnnouncer,
        private cdr: ChangeDetectorRef,
        private _snackBar: MatSnackBar,
        private route: ActivatedRoute
    ) {
        (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
        pdfMakeConfig.fonts = {
            telugu: {
                normal: 'TenaliRamakrishna-Regular.ttf',
            },
        };
        this.user = JSON.parse(localStorage.getItem('user'));
        this.username = this.user.userName;
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
        let vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }
        this.route.queryParams.subscribe(params => {
            this.refOrder = params['refOrder'];
          });
          console.log("refOrder",this.refOrder)
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'adhocpoid',
            textField: 'nameAndDate',

            allowSearchFilter: true,
        };
        this.searchFormGroup = new FormGroup({
            status: new FormControl(''),
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
            paymentStatus: new FormControl('All'),
        });
        // let startDate = this.searchFormGroup.controls['startDate'].value;
        // let endDate = this.searchFormGroup.controls['endDate'].value;
        let status = this.searchFormGroup.controls['status'].value;
        let paymentStatus = this.searchFormGroup.controls['paymentStatus'].value;
     
            let datePayload = {};
            datePayload['startDate'] ="",
            datePayload['endDate'] = ""
            datePayload['vendorId']=this.vendorId;
            if(this.refOrder==undefined){
                const resp = await this.service.fetchRequestPost(
                    'adhocpo/getAdhocpoByDate',
                    datePayload
                );
                this.adhocPoData = resp['adhocpoList'];
                this.adhocPoData = this.adhocPoData.filter((item) => {
                    return item.status != 'Completed';
                });
            }
        
        
        // const adhocresp = await this.service.fetchRequest(
        //     'adhocpo/getAllAdhocpo'
        // );
        // this.allAdhocPo = JSON.parse(JSON.stringify(adhocresp['adhocpoList']));
        // this.adhocPoData = adhocresp['adhocpoList'];
        // for not showing completed pos
       
        // creataing empty array for pushing adhocpoitems
        // this.adhocPoData.forEach((adhoc) => {
        //     adhoc['adhocItems'] = [];
        // });
        // this.adhocPoData.forEach((po) => {
        //     po['nameAndDate'] = po.description + '-' + po.date;
        // });
        // adhoc items
        // const adhocitemsresp = await this.service.fetchRequest(
        //     'adhocpoitem/getAlladhocpoitem'
        // );
        // this.adhocPoItems = adhocitemsresp['adhocpoitemList'];
        // // for balance Quantity
        // this.adhocPoItems.forEach((item) => {
        //     item['balanceQty'] = item.quantity - item.purchasedquantity;
        // });
        // suppliers
        const suppResp = await this.service.fetchRequest(
            'supplier/getAllSuppliers'
        );
        this.suppliersList = suppResp['supplierList'];
        this.adhocPoData.forEach((obj)=>{
            this.suppliersList.find((supp)=>{
                if(obj.purchasedat==supp.supId){
                    obj['supName']=supp.name
                }
            })
        })
        // supplier Items
        const supItemResp = await this.service.fetchRequest(
            'supplieritem/getAllSupplierItems'
        );
        this.supplierItemsList = supItemResp['supplierItemList'];
        const purchaseRateCardResp = await this.service.fetchRequest(
            'purchaseratecard/getAllpurchaseratecard'
        );
        this.purchaseRateCardData =
            purchaseRateCardResp['purchaseratecardList'];
        const stallOpResp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.stallOperator = stallOpResp['stallOperatorList'];
        const counterresp = await this.service.fetchRequest('stall/getAllStalls');
        this.stallData = counterresp['supplierList'];
        this.adhocPoData.forEach((po) => {
            this.stallOperator.forEach((op) => {
                if (parseInt(po.purchasedby) === op.stalloperatorid)
                    po['opName'] = op.name;
            });
        });
        this.itemControl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterproducts();
            });
        // for category in po header
        // this.adhocPoData.forEach((po) => {
        //     this.adhocPoItems.forEach((item) => {
        //         if (item.isStockAdded === true) {
        //             item.stockButton = 'Already Added';
        //         } else {
        //             item.stockButton = 'Add to Stock';
        //         }
        //     });
        // });
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        this.suppliersList.forEach((supp)=>{
            this.adhocPoData.forEach((obj)=>{
                if(obj.purchasedat==supp.supId){
                    obj['supplierName'] = supp.name
                }
            })
        })
        //
        // for changing true to available
        // this.adhocPoItems.forEach((item) => {
        //     if (item.available === true) {
        //         item.available = 'Available';
        //     } else {
        //         item.available = 'Not Available';
        //     }
        // });
        // for getting product name
       
        // // for uom setting to products
        // this.purchaseRateCardData.forEach((rateCard) => {
        //     this.productsList.forEach((item) => {
        //         if (item.prodId === rateCard.itemId) {
        //             item.uom = rateCard.uom;
        //         }
        //     });
        // });
// showing supplier Items only
        this.supplierItemsList = this.supplierItemsList.filter((supItem)=>{
            return this.suppliersList.some(sup=>sup.supId==supItem.supid);
        });
        this.productsList = this.supplierItemsList;

        this.productsList = this.productsList.filter((item)=>{
            return item?.enddate ==null;
        });
        // this.productsList.forEach((item) => {
        //     this.adhocPoData.forEach((element) => {
        //         element.poItemsList.forEach((obj)=>{
        //             if (obj.itemId == item.productId) {
                       
        //                 obj['prodName'] = item.productname;
        //                 obj['tname'] = item?.tname;
        //                 obj['itemName'] = item.productname + '-' + item.tname;
        //                 obj['quantityUom'] =
        //                 obj.quantity + ' ' + obj.uom;
        //             }
        //         })
        //         // element['prodImage'] = `${element.itemId}.webp`;
              
               
        //     });
        // });

        // sorting data

        // this.adhocPoItems = this.SortIngr(this.adhocPoItems);
        // let order = ['Groceries', 'Vegetables', 'Non Veg', 'Others'];
        // let newArray = [];
        // order.forEach((orderitem) => {
        //     return this.adhocPoItems.filter((ingr) => {
        //         if (ingr.category === orderitem) newArray.push(ingr);
        //     });
        // });
        // this.adhocPoItems = newArray;
        // this.adhocPoItems = this.adhocPoItems.sort((a, b) => {
        //     return b?.finalprice - a?.finalprice;
        // });
        // Sort the array based on the conditions
        // this.adhocPoItems.sort((a, b) => a.balanceQty - b.balanceQty);
        // this.adhocPoItems.forEach((item) => {
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

        // this.adhocPoItems.sort((a, b) => a.sortKey - b.sortKey);
        // status push
        // this.adhocPoData.forEach((po) => {
        //     this.adhocPoItems.forEach((item) => {
        //         if (item.adhocpoid === po.adhocpoid) {
        //             item['postatus'] = po.status;
        //         }
        //     });
        // });
        // pushing relational items to adhoc po
        // this.adhocPoData.forEach((adhoc) => {
        //     this.adhocPoItems.forEach((poitem) => {
        //         if (adhoc.adhocpoid === poitem.adhocpoid) {
        //             adhoc.adhocItems.push(poitem);
        //             adhoc.childActive = false;
        //             adhoc.isEdit = false;
        //         }
        //     });
        // });
        // this.adhocPoData.forEach((adhoc) => {
        //     let items = adhoc.adhocItems;
        //     let selectedPrice: number = 0;
        //     items.forEach((item: AdhocPoItems) => {
        //         if (item.available === true) {
        //             selectedPrice = parseFloat(
        //                 (selectedPrice + item.finalprice).toFixed(2)
        //             );
        //         }
        //         adhoc.availablePrice = selectedPrice;
        //     });
        // });
        this.adhocPoData.forEach((po) => {
            po.balance = parseFloat(
                (po.totalamount - po.paidamount).toFixed(2)
            );
            po.totalamount = parseFloat(po.totalamount.toFixed(2));
        });
        console.log(this.adhocPoData);

        this.adhocItemformGroup = new FormGroup({
            adhocpoid: new FormControl(''),
            category: new FormControl(''),
            itemId: new FormControl('',Validators.required),
            quantity: new FormControl(''),
            uom: new FormControl(''),
            
            available: new FormControl(''),
            finalprice: new FormControl(''),
           
            taxAmount:new FormControl(''),
            purchasedquantity: new FormControl(''),
            lastpddate: new FormControl(''),
            lastpdfrom: new FormControl(''),
            lastpdprice: new FormControl(''),
            ispacked: new FormControl(''),
            isreceived: new FormControl(''),
            supplierId: new FormControl(null),
            cgst: new FormControl(),
            scgst: new FormControl(),
            cess: new FormControl(),
            hsnCode: new FormControl(),
            uomsize: new FormControl(),
            totalAmt: new FormControl(),
            purPricePerUom: new FormControl(),
            mrpPerUom: new FormControl(),
            purchaseUom: new FormControl(''),
            qtyPerUom: new FormControl(),
            mfgDate: new FormControl(new Date()),
            batchCode: new FormControl(''),
            totalGrossWt: new FormControl()
        });
    
        this.adhocPoFormGroup = new FormGroup({
            date: new FormControl(new Date(),Validators.required),
            description: new FormControl('',Validators.required),
            purchasedby: new FormControl(''),
            status: new FormControl(''),
            totalamount: new FormControl(),
            taxAmount: new FormControl(),
            totalitems: new FormControl(),
            totalQuantity: new FormControl(),
            purchasedat: new FormControl(''),
            paidamount: new FormControl(''),
            balance: new FormControl(''),
            paymentStatus: new FormControl(''),
            category: new FormControl(''),
            vendorId: new FormControl(),
            stallId: new FormControl(''),
            paymentRef: new FormControl(''),
            paymentMode: new FormControl(''),
            taxType: new FormControl(''), 

        });
        this.ProductsByVariants();

      if(this.refOrder!=undefined){

        const adhocresp = await this.service.fetchRequest(
      'adhocpo/getAllAdhocpo'
  );
  // this.allAdhocPo = JSON.parse(JSON.stringify(adhocresp['adhocpoList']));
  let foundorder= adhocresp['adhocpoList'].find((pack)=>{
      return this.refOrder == pack.adhocpoid
       });
 if(foundorder){
  let datePayload = {};
  datePayload['startDate'] =foundorder.date,
  datePayload['endDate'] = foundorder.date
  datePayload['vendorId']=this.vendorId;
  const resp = await this.service.fetchRequestPost(
      'adhocpo/getAdhocpoByDate',
      datePayload
  );
  let po = resp['adhocpoList'].find((pack)=>{
      return this.refOrder == pack.adhocpoid
       });
       if(po){
          this.adhocPoData=[po]
          this.activatingChild(po)
       }
 
 }
 this.poback=true
     }
     else if(this.refOrder==undefined) this.poback=false;
        // this.adhocItemformGroup.controls['price'].disable();
    }
    async ProductsByVariants(){
        const payload = {
            catid: 112,
            prodid: 0,
            vendorId: this.vendorId,
        };
        const getproducts = await this.service.fetchRequestPost(
            '/rest/product/ProductsByVariants',
            payload
        );
        this.productsByVariantsList = getproducts['productitems'];
        this.filtereditems = this.productsByVariantsList;
    }
    protected filterproducts() {
        if (!this.productsByVariantsList) {
            return;
        }
        // get the search keyword
        let search = this.itemControl.value;
        if (!search) {
            this.filtereditems = this.productsByVariantsList.slice();
            return;
        } else {
            search = search.toLowerCase();
        }

        // filter the banks
        this.filtereditems = this.productsByVariantsList.filter(
            (bank) =>
                bank.prodName.toLowerCase().indexOf(search.toString()) > -1 ||
                bank.prodId.toString().indexOf(search) > -1
        );
    }
    onBackpo(){
        let url = "ITEMINV"
        let jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
            this.router.navigate([`nfm/kitchen-tasks/${url}`], {
                skipLocationChange: true,
              
            });
        }
    }
    OpenPriceModal(popup) {
        this.modalReference = this.dialog.open(popup);
    }
    OnSelectSupplier(value) {
        this.filtereditems = [];
        this.filtereditems = this.supplierItemsList.filter((data) => {
            return data.supid == parseInt(value);
        });
        this.productsList = this.filtereditems;
    }
    async CreateMergePO() {
        const poname = this.newPoName.value;
        const posList = this.posList.value;
        if (posList?.length > 0) {
            let listOfIds = [];
            posList.forEach((po) => {
                listOfIds.push(po.adhocpoid);
            });
            const payload = {
                poDescription: poname,
                poIdsList: listOfIds,
            };
            const resp = await this.service.fetchRequestPost(
                'adhocpoitem/mergePos',
                payload
            );
            this.modalReference.close();
            this.newPoName.reset();
            this.posList.reset();
            this.getAllDetails(0, 0, '');
        }
    }
    async OnSelectpurchaseUom(value){
        console.log(value)
        if(value=="Pieces"){
            this.adhocItemformGroup.controls['uomsize'].setValue(1)
        }
    }
   async onSelectProducts(value) {
        console.log(value);
        let quom = '';
        let uom = '';
        let purchaseUom = '';
        let mrpPerUom = '';
       this.hsnCode = '';
       this.CESS = '';
    this.CGST = '';
    this.SCGST ='';

       
        // logic from getting price from purchase rate card
        // this.filtereditems.forEach((item) => {
        //     if (item.prodId === value) {
        //         quom = item?.quom;
        //         uom = item?.muom;
        //         mrpPerUom = item?.mrpprice;
        //         this.CESS = item?.cess;
        //         this.CGST = item?.cgst;
        //         this.SCGST =item?.sgst;
        //         this.hsnCode = item?.hsnCode;
        //         console.log(this.hsnCode);
        //         this.adhocItemformGroup.controls['qtyPerUom'].setValue(quom);
        //         this.adhocItemformGroup.controls['uom'].setValue(uom);
        //         this.adhocItemformGroup.controls['mrpPerUom'].setValue(mrpPerUom);
        //         this.adhocItemformGroup.controls['cess'].setValue(this.CESS);
        //         this.adhocItemformGroup.controls['cgst'].setValue(this.CGST);
        //         this.adhocItemformGroup.controls['scgst'].setValue(this.SCGST);
        //         this.adhocItemformGroup.controls['hsnCode'].setValue(this.hsnCode);
        //         // this.adhocItemformGroup.controls['purchaseUom'].setValue(item?.purchaseUom);
        //         this.currentObj = item;
        //         this.currentObj['prodGrossWt'] = item.grossWeight;
        //         // rateCardPrice = item?.purchasePrice;
        //     }
           
        //     item?.variants.forEach((variant)=>{
        //         if(item.prodId==variant?.prodId){
                    
        //             if(this.edititemMode){
        //                 this.adhocItemformGroup.controls['purchaseUom'].setValue(variant?.purchaseUom);
        //                 this.adhocItemformGroup.controls['uomsize'].setValue(variant?.uomSize);
        //                 this.adhocItemformGroup.controls['purchaseUom'].setValue(item?.purchaseUom);
        //             // this.adhocItemformGroup.patchValue({
        //             //     purchaseUom : variant?.purchaseUom,
        //             //     uomsize: variant?.uomSize,
        //             //     hsnCode: item?.hsnCode,
        //             //     // purchaseUom: item?.purchaseUom
        //             // });
                   
        //         }
                    
        //             else if(!this.edititemMode){
        //                 this.adhocItemformGroup.controls['purchaseUom'].setValue(variant?.purchaseUom);
        //              this.adhocItemformGroup.controls['uomsize'].setValue(variant?.uomSize);
        //             }
                     
        //         }
        //     })
        // });
        const item = this.filtereditems.find(item => item.prodId === value);
if (item) {
    this.hsnCode = item.hsnCode;
    this.CESS = item?.cess;
    this.CGST = item?.cgst;
    this.SCGST =item?.sgst;
    console.log(this.hsnCode);
    this.adhocItemformGroup.controls['qtyPerUom'].setValue(item.quom);
    this.adhocItemformGroup.controls['uom'].setValue(item.muom);
    this.adhocItemformGroup.controls['mrpPerUom'].setValue(item.mrpprice);
    this.adhocItemformGroup.controls['cess'].setValue(item.cess);
    this.adhocItemformGroup.controls['cgst'].setValue(item.cgst);
    this.adhocItemformGroup.controls['scgst'].setValue(item.sgst);
    this.adhocItemformGroup.controls['hsnCode'].setValue(item.hsnCode);
    this.currentObj = item;
    this.currentObj['prodGrossWt'] = item.grossWeight;

    const variant = item.variants.find(variant => variant.prodId === item.prodId);
    if (variant) {
        if (this.edititemMode) {
            this.adhocItemformGroup.controls['purchaseUom'].setValue(variant.purchaseUom);
            this.adhocItemformGroup.controls['uomsize'].setValue(variant.uomSize);
        } else {
            this.adhocItemformGroup.controls['purchaseUom'].setValue(variant.purchaseUom);
            this.adhocItemformGroup.controls['uomsize'].setValue(variant.uomSize);
        }
    }
}

        this.adhocItemformGroup.get('quantity').reset();
        this.adhocItemformGroup.get('purPricePerUom').reset();
        this.adhocItemformGroup.get('totalAmt').reset();
     
        this.adhocItemformGroup.get('taxAmount').reset();
        const resp = await this.service.lastPurchasedRequest(
            `adhocpoitem/getLastItemData?itemId=${value}`,
            
        );
        console.log("lastpurchasedresp",resp)
        this.lastPurchasedDate = resp.lastPurchasedDate;
        this.lastPurchasedPrice = resp.lastPurchasedPrice;
        this.lastPurchasedQty = resp.lastPurchasedQty;
     
       
    }
    async OnUpdatePrice() {
        let salePrice = this.salePriceControl.value;
        if (salePrice) {
            let row = this.currentObj;
            let price = row.price;
            let uom = row.uom;
            let rateCardUOM = '';
            let payload = {};
            this.purchaseRateCardData.forEach((data) => {
                if (
                    data.itemId === parseInt(row.productlist) &&
                    uom === data.uom
                ) {
                    rateCardUOM = data.uom;
                    payload = data;
                    const finalPrice = row.finalprice;
                    const purcahsedQuantity = this.adhocItemformGroup.controls[
                        'purchasedquantity'
                    ].value;
                    let rateCardPrice = (finalPrice / purcahsedQuantity) * 1000;
                    payload['price'] = parseFloat(rateCardPrice.toFixed(3));
                    payload['salePercentage'] = salePrice;
                    console.log('rate card object:', payload);
                }
            });
            const resp = await this.service.fetchRequestPost(
                'purchaseratecard/createpurchaseratecard',
                payload
            );
            this.salePriceControl.reset();
            this.modalReference.close();
            // if (rateCardUOM === 'kgs' || rateCardUOM === 'l') {
            //     payload['price'] = price * 1000;
            // } else {
            //     payload['price'] = price;
            // }
        }
    }
    Cancel() {
        this.modalReference.close();
    }
    onhsnInfo(modal,element) {
      this.CGST = element.cgst;
      this.SCGST = element.scgst;
      this.CESS = element.cess;
      this.modalReference = this.dialog.open(modal)
    }
    toggleGSTDetails(modal,element): void {
       
       this.isHovered = true;
      }
      hideGSTDetails(event: MouseEvent,elementIndex: number): void{
        this.isHovered = false;
      }
      lastPurchasedDetails(modal,element){
       this.isLastpurchasehovered = true;
      }
      hidePurchasedDetails(){
        this.isLastpurchasehovered = false;
      }
    async onSearch() {
        this.searchMode = true;
        let startDate = this.searchFormGroup.controls['startDate'].value;
        let endDate = this.searchFormGroup.controls['endDate'].value;
        let status = this.searchFormGroup.controls['status'].value;
        let paymentStatus = this.searchFormGroup.controls['paymentStatus'].value;
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
            datePayload['vendorId']=this.vendorId;
            const resp = await this.service.fetchRequestPost(
                'adhocpo/getAdhocpoByDate',
                datePayload
            );
            this.adhocPoData = resp['adhocpoList'];
        }
        if (!status) {
            this.adhocPoData = this.adhocPoData.filter((event) => {
                return event.status != 'Completed';
            });
        }
        if (status) {
            this.adhocPoData = this.adhocPoData.filter((event) => {
                return event.status == status;
            });
        }
        if (paymentStatus) {
            this.adhocPoData = this.adhocPoData.filter((event) => {
                return event.paymentStatus === paymentStatus || event.paymentStatus ==null;
            });
        }
        console.log("adhoc", this.adhocPoData);
        
     
        // this.adhocPoData.forEach((saleorder) => {
        //     saleorder['adhocItems'] = [];
        // });
        // this.adhocPoData.forEach((po) => {
        //     this.adhocPoItems.forEach((poItem) => {
        //         if (po.adhocpoid === poItem.adhocpoid) {
        //             po.adhocItems.push(poItem);
        //             po.childActive = false;
        //             po.isEdit = false;
        //         }
        //     });
        // });
        // this.adhocPoItems.forEach((item) => {
        //     item['balanceQty'] = item.quantity - item.purchasedquantity;
        // });
        //
        this.adhocPoData.forEach((so) => {
            this.stallOperator.forEach((op) => {
                if (parseInt(so.purchasedby) === op.stalloperatorid)
                    so['opName'] = op.name;
            });
        });
        // for category in po header
        // this.adhocPoData.forEach((po) => {
        //     this.adhocPoItems.forEach((item) => {
        //         if (item.isStockAdded === true) {
        //             item.stockButton = 'Already Added';
        //         } else {
        //             item.stockButton = 'Add to Stock';
        //         }
        //     });
        // });
        // let items = po?.poItemsList
        this.suppliersList.forEach((supp)=>{
            this.adhocPoData.forEach((obj)=>{
                if(obj.purchasedat==supp.supId){
                    obj['supplierName'] = supp.name
                }
            })
        })
        // this.productsByVariantsList.forEach((item) => {
        //     this.adhocPoData.forEach((element) => {
        //         element.poItemsList.forEach((obj)=>{
        //             if (obj.itemId == item.prodId) {
                       
        //                 obj['prodName'] = item?.prodName;
                       
        //             }
        //         });
        //     });
        // });

        // for getting selected items list and selected items price
        this.adhocPoData.forEach((order) => {
            let items = order.poItemsList;
            let itemCount = 0;
            let itemPrice = 0;
            items.forEach((item: AdhocPoItems) => {
                if (item.available === true) {
                    itemCount += itemCount + 1;
                    itemPrice += item.finalprice;
                }
            });
            order['availablePrice'] = itemPrice;
            order['selectedItems'] = itemCount;
        });
    }
    OpenMergePop(modal) {
        this.modalReference = this.dialog.open(modal);
    }

    OnPricePerUOMChange(value) {
        console.log(value);
        let quantity = this.adhocItemformGroup.controls['quantity'].value;
        const finalValue = parseFloat(value.toFixed(2)) * quantity;
        console.log(finalValue);
        console.log(this.selectedRow);
        this.adhocItemformGroup.controls['finalprice'].setValue(
            parseFloat(finalValue.toFixed(2))
        );
    }
    async OnResetPress() {
        let data = this.poItemsTable.data;
        let adhocpoid: number = 0;
        data = data.filter((po) => {
            return po.available == true;
        });
        data.forEach((poitem) => {
            adhocpoid = poitem.adhocpoid;
        });
        console.log('data is ', data);

        let payload = {
            resetObjects: [],
        };
        data.forEach((obj) => {
            payload.resetObjects.push(obj.adhocpoitemid);
        });
        const saveResp = await this.service.fetchRequestPost(
            'adhocpoitem/resetavailable',
            payload
        );
        this.poItemsTable.data.forEach((item) => {
            item.available = false;
        });
        this.adhocPoData.forEach((po) => {
            if (po.adhocpoid === adhocpoid) po.availablePrice = 0;
        });
        console.log(saveResp);
    }
    OnFinalPriceChange(value) {
        let quantity = this.adhocItemformGroup.controls['quantity'].value;
        const pricePerUom = parseFloat(value.toFixed(2)) / quantity;
        this.adhocItemformGroup.controls['price'].setValue(
            parseFloat(pricePerUom.toFixed(2))
        );
    }
    OnPaidAmountEnter(value) {
        console.log(value);
        let paidAmount = value;
        let totalAmount = this.adhocPoFormGroup.controls['totalamount'].value;
        let balance = totalAmount - paidAmount;
        this.adhocPoFormGroup.controls['balance'].setValue(balance);
    }
    onPurchasePriceperUom(value){
        console.log(value);
        let PurchasePriceperUom = value;
        let UomQty = this.adhocItemformGroup.controls['quantity'].value;
        let totalAmount = UomQty*PurchasePriceperUom;
        this.adhocItemformGroup.controls['totalAmt'].setValue(totalAmount);
          if(this.hsnCode != undefined){
            let totaltaxrate = this.CGST+this.SCGST+this.CESS
            if(this.taxtype=="Inclusive"){
                // let totalAmount =  this.adhocItemformGroup.controls['totalAmt'].value;
               
                let taxAmount = totalAmount*totaltaxrate / (100+totaltaxrate);

                console.log("CalcTaxAmount",taxAmount);
                this.adhocItemformGroup.controls['taxAmount'].setValue(taxAmount);
            }
            else if(this.taxtype=='Exclusive'){
                // let totalAmount =  this.adhocItemformGroup.controls['totalAmt'].value;
                let taxAmount = (totalAmount * totaltaxrate)/100;
                console.log("CalcTaxAmount",taxAmount);
                this.adhocItemformGroup.controls['taxAmount'].setValue(taxAmount);
            }
        }
    }
    onTotalAmountChange(value){
        let totalAmount = value;
        let UomQty = this.adhocItemformGroup.controls['quantity'].value;
        let PurchasePriceperUom = totalAmount/UomQty;
        this.adhocItemformGroup.controls['purPricePerUom'].setValue(PurchasePriceperUom);
        if(this.hsnCode != undefined){
            let totaltaxrate = this.CGST+this.SCGST+this.CESS
            if(this.taxtype=="Inclusive"){
                // let totalAmount =  this.adhocItemformGroup.controls['totalAmt'].value;
               
                let taxAmount = totalAmount*totaltaxrate / (100+totaltaxrate);

                console.log("CalcTaxAmount",taxAmount);
                this.adhocItemformGroup.controls['taxAmount'].setValue(taxAmount);
            }
            else if(this.taxtype=='Exclusive'){
                // let totalAmount =  this.adhocItemformGroup.controls['totalAmt'].value;
                let taxAmount = (totalAmount * totaltaxrate)/100;
                console.log("CalcTaxAmount",taxAmount);
                this.adhocItemformGroup.controls['taxAmount'].setValue(taxAmount);
            }
        }
    }
    onTotalGrossAmount(value){
        let totalGrossAmount = value;
        let prodGrossWeight = this.currentObj?.prodGrossWt;
        let Quantity = totalGrossAmount/prodGrossWeight;
        let roundedQuantity = Number(Quantity.toFixed(0));
        this.adhocItemformGroup.controls['quantity'].setValue(roundedQuantity);
       
    }
    ontaxtypechange(value){
        // console.log(value);
        // if(this.hsnCode != undefined){
        //     let totaltaxrate = this.CGST+this.SCGST+this.CESS
        //     if(value=="Inclusive"){
        //         let totalAmount =  this.adhocItemformGroup.controls['totalAmt'].value;
        //         let taxAmount = totalAmount / (1+(totaltaxrate/100));
        //         console.log("CalcTaxAmount",taxAmount);
        //         this.adhocItemformGroup.controls['taxAmount'].setValue(taxAmount);
        //     }
        //     else if(value=='Exclusive'){
        //         let totalAmount =  this.adhocItemformGroup.controls['totalAmt'].value;
        //         let taxAmount = (totalAmount * totaltaxrate)/100;
        //         console.log("CalcTaxAmount",taxAmount);
        //         this.adhocItemformGroup.controls['taxAmount'].setValue(taxAmount);
        //     }
        // }
      
    }
    async OnAddToStock() {
        let row = this.currentObj;
        const date = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        const payload = {};
        payload['adhocpoitemid'] = row.adhocpoitemid;
        payload['itemid'] = parseInt(row.productlist);
        payload['itemname'] = row.prodName;
        payload['uom'] = row.uom;
        payload['availablequantity'] = parseFloat(
            row.purchasedquantity.toFixed(2)
        );
        payload['isStockAdded'] = true;
        payload['purchaseddate'] = date;
        payload['category'] = row.category;
        console.log(payload);
        const resp = await this.service.fetchRequestPost(
            'adhocpo/addtoinventory',
            payload
        );
        row.isStockAdded = true;
        row.stockButton = 'Already Added';
        this.isMatDrawerOpened = false;
        this.isAdhocDetails = false;
        this.isAdhocItemDetails = false;
    }
    OnQuantityEnter(value) {
        this.adhocItemformGroup.controls['purchasedquantity'].setValue(value);
        let quantity = value;
        let totalGrossWeight = quantity*this.currentObj?.prodGrossWt;
        this.adhocItemformGroup.controls['totalGrossWt'].setValue(totalGrossWeight);
    }
    CancelRow(row: AdhocPoItems) {
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
    OnEditAdhocPo(row, event) {
        this.taxtype = ""
       this.editmode = true;
       this.edititemMode = false;
       this.searchMode = false;
       console.log('searchmode',this.searchMode)
        this.poCategory = row?.category;
        event.stopPropagation();
        this.adhocpoid = row.adhocpoid;
        this.isAdhocItemDetails = false;
        this.isMatDrawerOpened = true;
        this.isAdhocDetails = true;
        this.adhocPoFormGroup.controls['vendorId'].disable();
        this.taxtype = row?.taxType
        this.adhocPoFormGroup.patchValue({
            date: row.date,
            description: row?.description,
            purchasedby: row?.purchasedby,
            status: row?.status,
            totalamount: row?.totalamount,
            taxAmount: row?.taxAmount,
            totalitems: row?.totalitems,
            totalQuantity: row?.totalQuantity,
            purchasedat: row?.purchasedat,
            paidamount: row?.paidamount,
            balance: row?.balance,
            paymentstatus: null,
            category: row?.category,
            vendorId: row?.vendorId,
            stallId: row?.stallId,
            paymentRef: row?.paymentRef,
            paymentMode: row?.paymentMode,
            paymentStatus: row?.paymentStatus,
            taxType: row?.taxType
        });
        

    }
    OnEditRow(row) {
        // this.editmode = true;
        this.hsnCode ='';
        this.CESS = '';
        this.CGST = '';
        this.SCGST ='';
        this.searchMode = false;
        this.edititemMode = true;
        this.editmode = false;
        console.log('searchmode',this.searchMode)
        let adhocpoitems : AdhocPoItems[] = JSON.parse(JSON.stringify(this.adhocPoItems));
        const adhocpo = JSON.parse(JSON.stringify(this.allAdhocPo));
        console.log(adhocpo);
        // for getting latest purchase date, latest purchase price, latest purchased at
        adhocpo.forEach((po) => {
            adhocpoitems.forEach((poitem: AdhocPoItems) => {
                if (poitem.adhocpoid === po.adhocpoid){
                    poitem.status= po.status;
                    poitem.adhocdate = po.date;
                    poitem['purchasedfrom'] = po.purchasedat;
                }

            });
        });
        // date filtering and ingredient
        adhocpoitems = adhocpoitems.filter((poitem) => {
            return poitem.productlist === row.productlist && poitem.status=="Completed";
        });
        adhocpoitems.forEach((po)=>{
            this.suppliersList.forEach((sup)=>{
                if(po.purchasedfrom){
                    if(parseInt(po.purchasedfrom)==sup.supId){
                        po.purchasedfrom = sup.name;
                    }
                }

            })
        })
        console.log(adhocpoitems);
        const result = adhocpoitems.sort(
            (a: any, b: any) =>
                new Date(b.adhocdate).getTime() -
                new Date(a.adhocdate).getTime()
        );
        console.log(result);

        let latestObj = result[0];
        this.currentObj = row;
        this.adhocpoid = row.adhocpoid;
        console.log('row', row);
        this.adhocpoitemid = row.adhocpoitemid;
        this.isMatDrawerOpened = true;
        this.isAdhocItemDetails = true;
        const item = this.filtereditems.find(item => item.prodId == row.itemId);
       if(item){
        this.hsnCode = item?.hsnCode
       }
        //for setting packing true or received true

        this.adhocItemformGroup.patchValue({
            adhocpoid: row?.adhocpoid,
            category: row?.category,
            itemId: row?.itemId,
            quantity: row?.quantity,
            uom: row?.uom,
            price: row?.price,
            available: row.available,
            finalprice: row?.finalprice,
          
            taxAmount: row?.taxAmount,
            purchasedquantity: row?.purchasedquantity,
            lastpddate: latestObj?.adhocdate,
            lastpdfrom: latestObj?.purchasedfrom,
            lastpdprice: latestObj?.price,
            ispacked: row?.ispacked,
            isreceived: row?.isreceived,
            supplierId: null,
            cgst: row?.cgst,
            scgst: row?.scgst,
            cess: row?.cess,
            hsnCode: this.hsnCode,
            uomsize: row?.uomsize,
          
            totalAmt: row?.totalAmt,
            purPricePerUom: row?.purPricePerUom,
            mrpPerUom:row?.mrpPerUom,
            purchaseUom: row?.purchaseUom,
            qtyPerUom: row?.qtyPerUom,
            mfgDate: row?.mfgDate,
            batchCode: row?.batchCode,
            // totalGrossWt: row?.prodGrossWt
        });
        // row?.variants.find((prod)=>{
        //     if(row.prodId==prod.prodId){
        //         this.adhocItemformGroup.controls['purchaseUom'].setValue(prod?.purchaseUom); 
        //     }
        // })
        this.adhocItemformGroup.controls['adhocpoid'].disable(); 
        // this.adhocItemformGroup.controls['category'].disable();
        // this.adhocItemformGroup.controls['productlist'].disable();
        // this.adhocItemformGroup.controls['quantity'].disable();
        this.adhocItemformGroup.controls['cgst'].disable();
        this.adhocItemformGroup.controls['scgst'].disable();
        this.adhocItemformGroup.controls['cess'].disable();
        this.adhocItemformGroup.controls['hsnCode'].disable();
        this.CESS = row?.cess;
        this.CGST = row?.cgst;
        this.SCGST = row?.scgst;
        // this.hsnCode = row?.hsnCode
        let totalGrossWeight = this.currentObj?.quantity*this.currentObj?.prodGrossWt;
        this.adhocItemformGroup.controls['totalGrossWt'].setValue(totalGrossWeight)
        // this.hsnCode = row?.hsnCode;
    }
    async SaveAdhocPoItemDetails(data, adhocpoItemId) {
        this.responseMessage = '';
        console.log(data);
        console.log("searchMode",this.searchMode)
        let form = this.adhocItemformGroup.getRawValue();
        if(form.taxAmount==null || form.taxAmount==''){
            form.taxAmount=0.0
        }
        if (form.supplierId) form.supplierId = parseInt(form.supplierId);
        form.ispacked = false;
        form.isreceived = false;
        if (form.available === null || form.available === '') {
            form.available = false;
        } else if (form.available === true) {
            if (this.currentObj['postatus'] === 'Packing') {
                form.ispacked = true;
                form.isreceived = false;
            } else if (this.currentObj['postatus'] === 'Received') {
                form.ispacked = false;
                form.isreceived = true;
            }
        }
        form['adhocpoitemid'] = adhocpoItemId;
        if(form.mrpPerUom==null){
            form.mrpPerUom = 0.0;
        }
        if(form.purPricePerUom==null){
            form.purPricePerUom = 0.0;
        }
        form.cess = this.CESS;
        form.cgst = this.CGST;
        form.scgst = this.SCGST;
        form.hsnCode = this.hsnCode;
        // if(this.editmode){
        //     form['qtyperuom'] = this.currentObj.mrpPerUom;
        //     form['purchaseUom'] = this.currentObj.purchaseUom;
        //     form['mrpPerUom'] = this.currentObj.mrpPerUom;
        //     form['purPricePerUom'] = this.currentObj.purPricePerUom;
        //     form['totalAmt'] = this.currentObj.totalAmt
        // }
        // else{
        //     form['qtyperuom'] = 0;
        //     form['purchaseUom'] = 0;
        //     form['mrpPerUom'] = 0.0;
        //     form['purPricePerUom'] = 0.0;
        //     form['totalAmt'] = this.currentObj.totalAmt
        // }
      

        // form['price'] = this.selectedData.price;

        const updateresp = await this.service.postResponseAsText(
            'adhocpoitem/createadhocpoitem',
            form
        );
        this.getAllDetails(data.adhocpoid, adhocpoItemId, 'notDelete');
        if (updateresp == 'adhocpoitem  Saved Successfully') {
            this.responseMessage = 'Data Saved Successfully';
            this.currentObj.available = form.available;
            this.currentObj.ispacked = form.ispacked;
            this.currentObj.isreceived = form.isreceived;
        } else {
            this.responseMessage = 'Data not saved';
        }
        this.snackBarRef = this._snackBar.openFromTemplate(this.snackBar, {
            duration: 2 * 1000,
        });
     
       
        // this.adhocItemformGroup.reset();
    }

    OnAdhocClick() {
        // this.edititemMode=false;
        this.lastPurchasedDate ='',
        this.lastPurchasedPrice = '';
        this.lastPurchasedQty = '';
        this.isMatDrawerOpened = true;
        this.isAdhocDetails = true;
        
        // this.adhocItemformGroup.enable();
        this.adhocPoFormGroup.controls['status'].setValue('Open');
        this.adhocPoFormGroup.controls['paymentStatus'].setValue('Not Paid');
        this.adhocPoFormGroup.controls['vendorId'].setValue(this.vendorId);
        this.adhocPoFormGroup
            .get('date')
            .setValue(new Date().toISOString().split('T')[0]);
            const loggedInUser = this.stallOperator.find(op => op.mobile == this.user.mobileNumber);
    if (loggedInUser) {
      this.adhocPoFormGroup.controls['purchasedby'].setValue(loggedInUser.stalloperatorid);
    }
            
    }
    async SaveAdhocPoDetails(adhocpoid) {
        // this.adhocPoFormGroup.markAllAsTouched();
        // if(this.adhocPoFormGroup.valid){
        //     this.validation = true;
        // }
        // else this.validation = false;
        
        let form = this.adhocPoFormGroup.getRawValue();
      
        if(form.taxAmount==null){
            form.taxAmount=0.0;
        }
        if(form.totalamount==null || form.totalAmount==''){
            form.totalamount=0.0
        }
        form['adhocpoid'] = adhocpoid;
        if (form.status != 'Completed') {
            const updateresp = await this.service.fetchRequestPost(
                'adhocpo/createAdhocpo',
                form
            );
            this.getAllDetails(adhocpoid, 0, 'notDelete');
        } else {
            let shouldUpdateAdhocpo = true;
            this.adhocPoItems.forEach((item) => {
                if (item.adhocpoid === adhocpoid) {
                    if (item.available === false) {
                        shouldUpdateAdhocpo = false;
                        return;
                    }
                }
            });
            if (shouldUpdateAdhocpo) {
                const resp = await this.service.fetchRequestPost(
                    'adhocpo/createAdhocpo',
                    form
                );

                this.getAllDetails(adhocpoid, 0, 'notDelete');
            } else alert('Some Items are not checked');
        }
        this.adhocPoFormGroup.reset();
    
        // this.validation = false;
        // this.ProductsByVariants()
        // form['price'] = this.selectedData.price;
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
        this.modalReference = this.modalService.open(modal);
    }
    OnExportByQuantity(modal) {
        this.modalReference = this.modalService.open(modal);
        this.isQuantity = true;
    }
    OnCloseItem() {
        this.isAdhocDetails = false;
        this.isAdhocItemDetails = false;
        this.adhocpoitemid = 0;
        this.adhocpoid = 0;
        this.isMatDrawerOpened = false;
        this.adhocItemformGroup.reset();
        this.adhocPoFormGroup.reset();
        this.currentObj = {};
        this.editmode=false;
    }
    OnClose(reason) {
        this.modalReference.close(reason);
        this.purchaseorder.reset();
        this.category.reset();
        this.available.reset();
        this.isQuantity = false;
    }
    onSavePopup() {
        this.columnsSchema.forEach((col) => {
            if (col.key === 'uom') {
                col.isColumnActive = false;
            }
        });
        let purchaseorder = this.purchaseorder.value;
        let category = this.category.value;
        let available = this.available.value;
        let items = [];
        if (available != 'All') {
            items = this.adhocPoItems.filter((item) => {
                return item.available + '' === available;
            });
        } else {
            items = this.adhocPoItems;
        }

        if (purchaseorder && category) {
            if (category === 'All') {
                items = items.filter((item) => {
                    return item.adhocpoid === parseInt(purchaseorder);
                });
            } else {
                let temp = [];
                for (let key in items) {
                    if (category != 'All') {
                        if (
                            items[key].adhocpoid === parseInt(purchaseorder) &&
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
                // items = this.SortItems(items);
                let adhocData = this.adhocPoData.filter((item) => {
                    return item.adhocpoid === parseInt(purchaseorder);
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
    OnAvailableChange(data) {
        this.currentObj = data;
        this.adhocpoitemid = data.adhocpoitemid;
        this.adhocItemformGroup.patchValue({
            adhocpoid: data?.adhocpoid,
            category: data?.category,
            productlist: parseInt(data?.productlist),
            quantity: data?.quantity,
            uom: data?.uom,
            price: data?.price,
            available: data.available,
            finalprice: data?.finalprice,
            purchasedquantity: data?.purchasedquantity,
            ispacked: data?.ispacked,
            isreceived: data?.isreceived,
        });
        let rowdata: any;
        this.SaveAdhocPoItemDetails(rowdata, this.adhocpoitemid);
        // this.getAllDetails(data.adhocpoid, this.adhocpoitemid, 'notDelete');
        this.adhocpoitemid = 0;
    }
    OnSaveAdhoc() {
        let form = this.adhocPoFormGroup.getRawValue();
        if(form.date!=""&&form.description!=''){
        this.SaveAdhocPoDetails(this.adhocpoid);
        this.isAdhocItemDetails = false;
        this.isMatDrawerOpened = false;
        this.isAdhocDetails = false;
        this.adhocpoitemid = 0;
        }
        
    }
    OnSaveItem() {
        const data = this.adhocItemformGroup.getRawValue();
        this.SaveAdhocPoItemDetails(data, this.adhocpoitemid);
        this.productsList = this.supplierItemsList;

        this.isAdhocItemDetails = false;
        this.isMatDrawerOpened = false;
        this.isAdhocDetails = false;
        this.adhocpoitemid = 0;
        this.currentObj = {};

        // get adhocpoitemonly, adhocpo also no front end push
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

        // let order = ['Groceries', 'Vegetables', 'Non Veg', 'Others'];
        // let newArray = [];
        // order.forEach((orderitem) => {
        //     return temp.filter((ingr) => {
        //         if (ingr.category === orderitem) newArray.push(ingr);
        //     });
        // });
        // data = newArray;
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
                if (row.purchasedquantity >= 1000) {
                    row.purchasedquantity = row.purchasedquantity / 1000;
                    row.purchasedquantity = row.purchasedquantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.purchasedquantity = row.purchasedquantity;
                }
            } else {
                row.purchasedquantity = row?.purchasedquantity;
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
                    text: `PO#: ${poData[0].adhocpoid}, Description: ${poData[0].description}`,
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
                                p.purchasedquantity + ' ' + p.uom,
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
                poData[0].adhocpoid.toString() +
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
                if (row.purchasedquantity >= 1000) {
                    row.purchasedquantity = row.purchasedquantity / 1000;
                    row.purchasedquantity = row.purchasedquantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.purchasedquantity = row.purchasedquantity;
                }
            } else {
                row.purchasedquantity = row?.purchasedquantity;
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
                    text: `PO#: ${poData[0].adhocpoid}, Description: ${poData[0].description}`,
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
                                p.purchasedquantity + ' ' + p.uom,
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
                poData[0].adhocpoid.toString() +
                    '-' +
                    poData[0].description +
                    '.pdf'
            );
    }

    OnAdhocItemClick() {
        // this.adhocItemformGroup.controls['available'].setValue(true)
        this.adhocItemformGroup.enable();
        this.adhocItemformGroup.reset();
        this.editmode = false;
        this.edititemMode = false;
        this.adhocItemformGroup.controls['adhocpoid'].disable();
        this.adhocItemformGroup
        .get('mfgDate')
        .setValue(new Date().toISOString().split('T')[0]);
        // this.adhocItemformGroup.controls['mfgDate'].setValue(new Date());
        // this.router.routeReuseStrategy.shouldReuseRoute = () => true;
        this.isMatDrawerOpened = true;
        this.isAdhocItemDetails = true;
        this.isAdhocDetails = false;
        if (this.adhocpoid != 0) {
            this.adhocItemformGroup.controls['adhocpoid'].setValue(
                this.adhocpoid
            );
            this.adhocItemformGroup.controls['category'].setValue(
                this.poCategory
            );
        }

        // .then(() => {
        //     this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        // });
    }
    async StatusChange(data, value) {
        let adhocpoid = data.adhocpoid;
        data.status = value;
        const saveresp = await this.service.fetchRequestPost(
            'adhocpo/createAdhocpo',
            data
        );
        this.ngOnInit();
        console.log(data);
    }
   async activatingChild(po) {
    if(this.refOrder!=undefined){
        const payload = {
            catid: 112,
            prodid: 0,
            vendorId: this.vendorId,
        };
        const getproducts = await this.service.fetchRequestPost(
            '/rest/product/ProductsByVariants',
            payload
        );
        this.productsByVariantsList = getproducts['productitems'];
        this.filtereditems = this.productsByVariantsList;
    }
      
        // divRef.scrollIntoView({
        //     behavior: 'smooth',
        //     block: 'start',
        //     inline: 'nearest',
        // });
        // const windowHeight = window.innerHeight;
        // const divRect = divRef.getBoundingClientRect();
        // if (divRect.bottom > windowHeight) {
        //     window.scrollBy(0, divRect.bottom - windowHeight);
        // }
        // const lastDivOnPage = document.body.lastElementChild;
        // if (lastDivOnPage !== divRef) {
        //     lastDivOnPage.scrollIntoView({
        //         behavior: 'smooth',
        //         block: 'end',
        //         inline: 'nearest',
        //     });
        // }
        this.columnsSchema.forEach((col) => {
            // default set to false for ispacekd and isreceived
            if (col.type === 'ispacked') col.isColumnActive = false;
            if (col.type === 'isreceived') col.isColumnActive = false;
        });
        let items = po?.poItemsList
        this.adhocPoData.forEach((item) => {
           
                if (item.adhocpoid === po.adhocpoid)
                po.childActive = !po.childActive;
            else item.childActive = false;
            
          
        });
        this.productsByVariantsList.forEach((item) => {
                this.adhocPoData.forEach((element) => {
                    element.poItemsList.forEach((obj)=>{
                        if (obj.itemId == item.prodId) {
                           
                            obj['prodName'] = item?.prodName;
                           obj.cess = item?.cess;
                           obj.cgst = item?.cgst;
                           obj.scgst = item?.sgst;
                           
                        }
                    });
                });
            });
        // console.log(po.adhocItems[0].postatus);
        this.columnsSchema.forEach((col) => {
            if (po.status === 'Packing') {
                if (col.type === 'ispacked') {
                    col.isColumnActive = true;
                }
            } else if (po.status === 'Received') {
                if (col.type === 'isreceived') {
                    col.isColumnActive = true;
                }
            }
        });
        this.poItemsTable = new MatTableDataSource(po?.poItemsList);
        this.mobilePoItems = po.poItemsList;
    }

    OnDelete(row, popup) {
        this.modalReference = this.dialog.open(popup);
        this.adhocpoitemid = row.adhocpoitemid;
        this.adhocpoid = row.adhocpoid;
        this.delObj = {
            adhocpoitemid: row.adhocpoitemid,
        };
        this.adhocpoid = row.adhocpoid;

    }
    OnDelAdhoc(popup) {
        this.modalReference = this.dialog.open(popup);
        this.delObj = {
            adhocpoid: this.adhocpoid,
        };
        console.log(this.delObj);
        this.adhocPoFormGroup.reset();
    }
    async OnConfirmAdhoc() {
        const delResp = await this.service.fetchRequestdel(
            'adhocpo/deleteAdhocpo',
            this.delObj
        );
        this.modalReference.close();
        this.adhocpoid = 0;
        this.adhocpoitemid = 0;
        this.isMatDrawerOpened = false;
        this.isAdhocDetails = false;
        this.isAdhocItemDetails = false;
        this.getAllDetails(0, 0, 'forDelete');
    }
    OnDel(modal) {
        this.modalReference = this.dialog.open(modal);
        this.delObj = {
            adhocpoitemid: this.adhocpoitemid,
        };
    }
    async getAllDetails(adhocpoid, adhocpoitemid, isDel: string) {
        let startDate = this.searchFormGroup.controls['startDate'].value;
        let endDate = this.searchFormGroup.controls['endDate'].value;
        let status = this.searchFormGroup.controls['status'].value;
        let paymentStatus = this.searchFormGroup.controls['paymentStatus'].value;
       console.log("searchMode",this.searchMode)
        if(this.searchMode==false){
            let datePayload = {}
            datePayload['startDate']="",
            datePayload['endDate']="",
            datePayload['vendorId']=this.vendorId;
            const resp = await this.service.fetchRequestPost(
                'adhocpo/getAdhocpoByDate',
                datePayload
            );
            this.adhocPoData = resp['adhocpoList'];
        }
       else if(this.searchMode==true){
       if(startDate && endDate) {
        let datePayload = {}
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
            datePayload['vendorId']=this.vendorId;
            const resp = await this.service.fetchRequestPost(
                'adhocpo/getAdhocpoByDate',
                datePayload
            );
            this.adhocPoData = resp['adhocpoList'];
       }
    }
       
      
        // for not showing completed pos
        this.adhocPoData = this.adhocPoData.filter((item) => {
            return item.status != 'Completed';
        });
        // creataing empty array for pushing adhocpoitems
        // this.adhocPoData.forEach((adhoc) => {
        //     adhoc['adhocItems'] = [];
        // });
        this.adhocPoData.forEach((po) => {
            po['nameAndDate'] = po.description + '-' + po.date;
        });
        // adhoc items
        // const adhocitemsresp = await this.service.fetchRequest(
        //     'adhocpoitem/getAlladhocpoitem'
        // );
        // this.adhocPoItems = adhocitemsresp['adhocpoitemList'];
        // for balance Qty
        // this.adhocPoItems.forEach((item) => {
        //     item['balanceQty'] = item.quantity - item.purchasedquantity;
        // });
        this.adhocPoData.forEach((po) => {
            this.stallOperator.forEach((op) => {
                if (parseInt(po.purchasedby) === op.stalloperatorid)
                    po['opName'] = op.name;
            });
        });
        this.productsList = this.supplierItemsList;
        // this.filtereditems = this.productsList;
        this.suppliersList.forEach((supp)=>{
            this.adhocPoData.forEach((obj)=>{
                if(obj.purchasedat==supp.supId){
                    obj['supplierName'] = supp.name
                }
            })
        })
        // for category in po header
        // this.adhocPoData.forEach((po) => {
        //     this.adhocPoItems.forEach((item) => {
        //         if (item.isStockAdded === true) {
        //             item.stockButton = 'Already Added';
        //         } else {
        //             item.stockButton = 'Add to Stock';
        //         }
        //     });
        // });

        // for getting product name

       
       
        // sorting data
        this.adhocPoData.forEach((po) => {
            this.adhocPoItems.forEach((item) => {
                if (item.adhocpoid === po.adhocpoid) {
                    item['postatus'] = po.status;
                }
            });
        });
        this.adhocPoData.forEach((po) => {
            po.balance = parseFloat(
                (po.totalamount - po.paidamount).toFixed(2)
            );
            po.totalamount = parseFloat(po.totalamount.toFixed(2));
        });

        // pushing relational items to adhoc po
        // this.adhocPoData.forEach((adhoc) => {
        //     this.adhocPoItems.forEach((poitem) => {
        //         if (adhoc.adhocpoid === poitem.adhocpoid) {
        //             adhoc.adhocItems.push(poitem);
        //             adhoc.childActive = false;
        //             adhoc.isEdit = false;
        //         }
        //     });
        // });
        // this.adhocPoData.forEach((adhoc) => {
        //     let items = adhoc?.poItemsList;
        //     let selectedPrice: number = 0;
        //     items.forEach((item: AdhocPoItems) => {
        //         if (item.available === true) {
        //             selectedPrice = parseFloat(
        //                 (selectedPrice + item.finalprice).toFixed(2)
        //             );
        //         }
        //         adhoc.availablePrice = selectedPrice;
        //     });
        // });
        // this.adhocPoItems.forEach((item) => {
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

        // this.adhocPoItems.sort((a, b) => a.sortKey - b.sortKey);
        // console.log('inside is delete');
        let currentPo = {};
        this.adhocPoData.forEach((po) => {
            if (po.adhocpoid == adhocpoid) currentPo = po;
        });
        if (currentPo) {
            this.columnsSchema.forEach((col) => {
                // default set to false for ispacekd and isreceived
                if (col.type === 'ispacked') col.isColumnActive = false;
                if (col.type === 'isreceived') col.isColumnActive = false;
            });
            this.columnsSchema.forEach((col) => {
                if (currentPo['status'] === 'Packing') {
                    if (col.type === 'ispacked') {
                        col.isColumnActive = true;
                    }
                } else if (currentPo['status'] === 'Received') {
                    if (col.type === 'isreceived') {
                        col.isColumnActive = true;
                    }
                }
            });
        }

        // for setting childActive to true
        this.adhocPoData.forEach((po) => {
            if (po.adhocpoid === adhocpoid) {
                this.poItemsTable = new MatTableDataSource(po?.poItemsList);
                this.mobilePoItems = po.poItemsList;
                po.childActive = true;
            }
        });
        this.productsByVariantsList.forEach((item) => {
            this.adhocPoData.forEach((element) => {
                element.poItemsList.forEach((obj)=>{
                    if (obj.itemId == item.prodId) {
                       
                        obj['prodName'] = item?.prodName;
                       obj.cess = item?.cess;
                       obj.cgst = item?.cgst;
                       obj.scgst = item?.sgst;
                       
                    }
                });
            });
        });
        // this.productsList.forEach((item) => {
        //     this.adhocPoData.forEach((element) => {
        //         element.poItemsList.forEach((obj)=>{
        //             if (obj.itemId == item.productId) {
                      
        //                 obj['prodName'] = item.productname;
        //                 obj['tname'] = item?.tname;
        //                 obj['itemName'] = item.productname + '-' + item.tname;
        //                 obj['quantityUom'] =
        //                 obj.quantity + ' ' + obj.uom;
        //             }
        //         })
        //         // element['prodImage'] = `${element.itemId}.webp`;
              
               
        //     });
        // });
    }
    CloseDialog() {
        this.modalReference.close();
        this.purchaseorder.reset();
        this.category.reset();
        this.available.reset();
        this.itemControl.reset();
        this.salePriceControl.reset();
    }
    decline() {
        this.modalReference.close();
    }
    async confirm() {
        const delResp = await this.service.fetchRequestdel(
            'adhocpoitem/deleteadhocpoitem',
            this.delObj
        );
        let adhocpoitemid = this.delObj['adhocpoitemid'];
        this.getAllDetails(this.adhocpoid, this.adhocpoitemid, 'forDelete');
        this.modalReference.close();
        this.adhocpoid = 0;
        this.adhocpoitemid = 0;
        this.isMatDrawerOpened = false;
        this.isAdhocDetails = false;
        this.isAdhocItemDetails = false;
    }
    async Delete() {
        const delObj = {
            adhocpoitemid: this.adhocpoitemid,
        };
        const delResp = await this.service.fetchRequestdel(
            'adhocpoitem/deleteadhocpoitem',
            delObj
        );
        this.adhocPoData.forEach((po) => {
            if (po.adhocpoid == this.adhocpoid) {
                const objWithIdIndex = po.adhocItems.findIndex(
                    (obj) => obj.adhocpoitemid === this.adhocpoitemid
                );
                po.adhocItems.splice(objWithIdIndex, 1);
            }
        });
    }
    CancelDel() {
        this.modalReference.close();
    }
}
