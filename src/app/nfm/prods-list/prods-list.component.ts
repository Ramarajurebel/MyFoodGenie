import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { Product } from './../../shared/classes/products';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { VenodorsList } from 'app/shared/classes/vendors';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';


@Component({
    selector: 'app-prods-list',
    templateUrl: './prods-list.component.html',
    styleUrls: ['./prods-list.component.scss'],
})
export class ProdsListComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public AddItemForm: FormGroup;
    public hsncodeform: FormGroup;
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;

    private prodid: number;
    itemControl: FormControl = new FormControl('');
    protected _onDestroy = new Subject<void>();
    modalReference: MatDialogRef<any>;
    public editMode = false;
    prodsList: Product[] = [];
    public delobj = {};
    isMatDrawerOpened = false;
    mobileNumber: string = '';
    userRole: string = '';
    vendorData: VenodorsList[] = [];
    categoryControl: FormControl = new FormControl('');
    categories = [];
    SubcategoryID = [];
    public uom = ['gms', 'ml', 'pieces', 'bunch'];
    public purchaseuom = [
        'Packet','Carton','Piece','Case'
    ]
    vendorId: number;
    productsCount: number = 0;
    hsnCodes: any;
    filtereditems: any;
    constructor(private service: ProjectService, private dialog: MatDialog, private http: HttpClient) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.mobileNumber = user.mobileNumber;
        this.userRole = user.role;
    }

    async ngOnInit() {
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.AddItemForm = new FormGroup({
            itemname: new FormControl(''),
            catIdList: new FormControl(),
            subcatid: new FormControl(),
            quom: new FormControl(''),
            muom: new FormControl(''),
            purchaseUom: new FormControl(''),
            uomSize:new FormControl(),
            price: new FormControl(''),
            uomPrice:new FormControl(),
            shelflife: new FormControl(''),
            tname: new FormControl(''),
            saleprice: new FormControl(''),
            location: new FormControl(''),
            hsnCode: new FormControl(''),
            preorder: new FormControl(false),
            packsize: new FormControl(),
            vendorid: new FormControl(),
            reservation: new FormControl(),
            expirydate: new FormControl(),
            grossWeight: new FormControl(),
            vmsRefId: new FormControl({ disabled: true })
            // variants: this.fb.array([this.createItem()]),
        });
        this.hsncodeform = new FormGroup({
            hsnCode: new FormControl(''),
            cgst: new FormControl(),
            scgst: new FormControl(),
            cess: new FormControl()
        });
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        const data = {};
        data['shopId'] = 11;
        data['vendorId'] = 1001;
        const catresp = await this.service.fetchRequestPost(
            'rest/category/SupplierCategoryCollection',
            data
        );
        this.categories = catresp['categories'];
       this.getHsnCodes();
       this.itemControl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterhsnCodes();
            });
        const vendorCatObj = this.vendorData.find(vendor => vendor.vendorId == this.vendorId);
        if (this.vendorId != 1001) {
            if (vendorCatObj) {
                let vendorCatArray = [];
                if (vendorCatObj?.prodCategory) {
                    vendorCatArray = vendorCatObj.prodCategory.split(',').map(Number);
                    const catArray = vendorCatArray.map(item => ({ catId: item }));
                    this.categories = this.categories.filter(cat =>
                        catArray.some(assCat => cat.catId == assCat.catId));

                }

            }
        }

        this.categoryControl.setValue(112);
        const event: MatSelectChange = {
            source: null, // source can be null as we are manually triggering it
            value: [112]
          };
      
        this.OnCatSelect(event);
        this.onSearch();
        this.productsCount = this.prodsList?.length;
        if (this.userRole != 'admin') {
            this.UserBasedData();
        }
    }
    filterhsnCodes(){
        if (!this.hsnCodes) {
            return;
        }
        // get the search keyword
        let search = this.itemControl.value;
        if (!search) {
            this.filtereditems = this.hsnCodes.slice();
            return;
        } else {
            search = search.toLowerCase();
        }

        // filter the banks
        this.filtereditems = this.hsnCodes.filter(
            (bank) =>
                bank.hsnCode.toLowerCase().indexOf(search.toString()) > -1 
               
        );
    }
    async getHsnCodes(){
        const hsnresp = await this.service.lastPurchasedRequest(
            'hsncode/getAllHsnCode'
        );
        this.hsnCodes = hsnresp['hsnCodeList'];
        this.filtereditems = this.hsnCodes;
    }
    onAddHsnCode(modal,event){
        event.stopPropagation();
       this.modalReference = this.dialog.open(modal);
    }
    onCancelhsnCode(){
        this.modalReference.close();
    }
    async onSavehsnCode(){
       const formData = this.hsncodeform.getRawValue();
        console.log("HSNFormData",formData);
        const hsnResp = await this.service.fetchRequestPost(
            'hsncode/createHsnCode',
            formData
        );
        console.log("CreateHsn",hsnResp);
        this.getHsnCodes();
        this.modalReference.close();
    }
    OnVMSSyncPress() {
        const formData = this.AddItemForm.getRawValue();
        const vmsRefId = this.AddItemForm.controls['vmsRefId'].value;
        let productPayload: any = {};
        const cost = formData.price * 100;
        productPayload.name = this.prodid+"-"+formData.itemname;
        console.log('name'+ ' ' + productPayload.name)
        productPayload.cost = cost; //0 + "";
        console.log("cost"+ ' ' + productPayload.cost);
        productPayload.brandName = "NaviKarana";
        productPayload.categoryName = "MFG Category";
        productPayload.subCategoryName = "MFG subcat";
        productPayload.fileName = "splash.png";
        if (vmsRefId != null && vmsRefId != "") productPayload.productId = vmsRefId;

        const payload = new FormData();
        const imagePath = "assets/icons/splash.png";

        this.service.getImageBlob(imagePath).subscribe((blob) => {
            // not needed image file every time, store in global variable do later....
            const imageFile = this.blobToFile(blob, 'splash.png');
            let array = [];
            array.push(productPayload);
            payload.append("products", JSON.stringify(array));
            payload.append("images", imageFile, 'splash.png');
            this.service.AddUpdateProductVMS(payload).subscribe((data) => {
                if (data?.msg == "Products added/updated") {
                    this.GetVmsProductId(productPayload.name);
                }

            })
        })


    }
    blobToFile(blob: Blob, fileName: string): File {
        const b: any = blob;
        b.lastModifiedDate = new Date();
        b.name = fileName;
        return <File>blob;
    }
    GetVmsProductId(name) {
        this.service.GetVmsProducts().subscribe((data) => {
            if (data) {
                const prodObj = data.find(obj => obj.name == name);
                if (prodObj) {
                    this.AddItemForm.controls['vmsRefId'].setValue(prodObj.productId);
                }
            }
        })
    }
    OnCatSelect(event: MatSelectChange) {
        this.SubcategoryID = [];
        console.log("selectedOptions",event);
        const selectedValues = event.value;
        selectedValues.forEach(value => {
            const catObj = this.categories.find(cat => cat.catId == value);
            if (catObj && catObj.subCategories) {
              this.SubcategoryID.push(...catObj.subCategories);
            }
          });
      
          if (this.SubcategoryID.length > 0) {
            this.AddItemForm.controls['subcatid'].setValue(this.SubcategoryID[0].subCatId);
          }
        // const selectedValues = Array.from(selectedOptions).map((option: HTMLOptionElement) => option.value);
        
        // selectedValues.forEach(value => {
        //     const catObj = this.categories.find(cat => cat.catId == value);
        //     if (catObj && catObj.subCategories) {
        //         this.SubcategoryID.push(...catObj.subCategories);
        //     }
        // });
    
        // if (this.SubcategoryID.length > 0) {
        //     this.AddItemForm.controls['subcatid'].setValue(this.SubcategoryID[0].subCatId);
        // }
        // this.SubcategoryID = [];
        // const catObj = this.categories.find(cat => cat.catId == value);
        // if (catObj) {
        //     this.SubcategoryID = catObj.subCategories;
        //     if (this.SubcategoryID.length > 0) {
        //         this.AddItemForm.controls['subcatid'].setValue(this.SubcategoryID[0].subCatId);
        //     }

        // }
    }
    async onSearch() {
        this.productsCount = 0;
        let catId = this.categoryControl.value;

        let Payload = {
            prodId: 0,
            catid: parseInt(catId),
            vendorId: this.vendorId,
        };

        const productresp = await this.service.fetchRequestPost(
            '/rest/product/ProductsByVariants',
            Payload
        );
        this.prodsList = productresp['productitems'];
        this.productsCount = this.prodsList?.length;
    }
    async UserBasedData() {
        const payload = {
            prodId: 0,
            catid: 112,
            vendorId: this.vendorId,
        };

        if (this.vendorId) {
            const resp = await this.service.fetchRequestPost(
                '/rest/product/ProductsByVariants',
                payload
            );
            this.prodsList = resp['productitems'];
            console.log('proditem', this.prodsList);
            console.log('ven', this.vendorId);
            this.prodsList = this.prodsList.filter((prod) => {
                return prod.vendorId == this.vendorId;
            });
        }
    }
    Add() {
        this.isMatDrawerOpened = true;
        this.editMode = false;
        this.AddItemForm.controls['packsize'].setValue(1);
        if (this.userRole != 'admin') {
            this.AddItemForm.controls['vendorid'].disable();
            this.AddItemForm.controls['vendorid'].setValue(this.vendorId);

            this.AddItemForm.controls['catIdList'].setValue([112]);
            const event: MatSelectChange = {
                source: null, // source can be null as we are manually triggering it
                value: [112]
              };
            this.OnCatSelect(event);
        } else {
            this.AddItemForm.controls['vendorid'].enable();
            this.AddItemForm.controls['catIdList'].enable();
        }

    }
    onEdit(row) {
        if (this.userRole != 'admin') {
            this.AddItemForm.controls['vendorid'].disable();
            this.AddItemForm.controls['vendorid'].setValue(this.vendorId);

            this.AddItemForm.controls['catIdList'].setValue([112]);
        } else {
            this.AddItemForm.controls['vendorid'].enable();
            this.AddItemForm.controls['catIdList'].enable();
        }
        const catIdArray = Array.isArray(row.catid) ? row.catid : [row.catid];
    this.AddItemForm.controls['catIdList'].setValue(catIdArray);
        const event: MatSelectChange = {
            source: null, // source can be null as we are manually triggering it
            value: [112]
          };
        this.OnCatSelect(event);
        console.log("Row",row)
        this.isMatDrawerOpened = true;
        this.editMode = true;
        this.AddItemForm.patchValue({
            itemname: row.prodName,
            
            subcatid: row.subCatId,
            price: row.mrpprice,
            quom: row.quom,
            muom: row.muom,
            purchaseUom: row?.variants[0]?.purchaseUom,
            shelflife: row?.shelflife,
            tname: row?.tname,
            saleprice: row?.saleprice,
            location: row?.location,
            hsnCode: row?.hsnCode,
            preorder: row.preOrder,
            packsize: row?.packSize,
            vendorid: row?.vendorId,
            vmsRefId: row?.vmsRefId,
            grossWeight: row?.grossWeight,
            uomSize:row?.variants[0]?.uomSize,
            uomPrice:row?.uomPrice
            // reservation: row?.reservation,
            // expirydate: row?.expirydate
        });
        this.AddItemForm.controls['subcatid'].setValue(row.subCatId);
        this.GetVmsProductId(row.prodName);
        this.prodid = row.prodId;
        // this.AddItemForm.controls['catIdList'].setValue([row?.catIdList]);
    }
    onDel(row, template) {
        this.delobj = {
            prodId: row.prodId,
        };
        console.log(this.delobj);
        this.modalReference = this.dialog.open(template);
    }
    async confirm() {
        const resp = await this.service.fetchRequestPost(
            'rest/product/DeleteProduct',
            this.delobj
        );
        this.onSearch();
        this.OnCloseItem(true);
    }

    OnCloseItem(isModalOpened: boolean) {
        this.AddItemForm.reset();
        this.editMode = false;
        this.isMatDrawerOpened = false;
        this.prodid = 0;
        if (isModalOpened) this.modalReference.close();
    }
    async OnSaveProd() {
        const data = this.AddItemForm.getRawValue();
        if (data.preorder === null) data.preorder = false;
        data['itemid'] = this.prodid;
        data['uom'] = data.quom + data.muom;
        data['shopid'] = 11;
        data.vendorid = parseInt(data.vendorid);
        data.subcatid = parseInt(data.subcatid);
        data.price = parseInt(data.price);
        data.catIdList = data.catIdList.join(',');
        const saveitemresp = await this.service.fetchRequestPost(
            'ingredient/createIngredient',
            data
        );

        this.onSearch();

        this.OnCloseItem(false);
    }
}
