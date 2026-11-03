import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
    ChangeDetectorRef,
    Component,
    Inject,
    LOCALE_ID,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { fill } from 'lodash';
import { RecipeItems } from './../../shared/classes/recipeItems';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as pdfMakeConfig from 'pdfmake/build/pdfmake.js';
import { MatDrawer } from '@angular/material/sidenav';
import { Recipes } from './../../shared/classes/rcpheader';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
@Component({
    selector: 'app-nfm-recipes',
    templateUrl: './nfm-recipes.component.html',
    styleUrls: ['./nfm-recipes.component.scss'],
})
export class NfmRecipesComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    appearnce: MatFormFieldModule = fill;
    recipesData: Recipes[] = [];
    recipeItems: RecipeItems[] = [];

    recipeItemsTable = new MatTableDataSource<RecipeItems>();
    // displayedColumns: string[] = PoItemsColumns.map((col) => col.key);
    // columnsSchema: any = PoItemsColumns;
    recipeItemFormgroup: FormGroup;
    productsList = [];
    modalReference: any;
    public categories = ['Vegetables', 'Groceries', 'Non Veg', 'Others'];
    purchaseorder: FormControl = new FormControl('');
    category: FormControl = new FormControl('');
    available: FormControl = new FormControl('');
    recipeitemid: number = 0;
    recipeid: number = 0;
    mobileRecipeItems: RecipeItems[];

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
    stallOperator = [];
    selectedRow: RecipeItems;
    oldValueRow: RecipeItems;
    ingredientsImagePath = './assets/images/ingredients/';
    isQuantity: boolean = false;
    delObj = {};
    isMatDrawerOpened: boolean = false;
    isRecipeItemDetails: boolean = false;
    isRecipeDetails: boolean = false;

    recipeFormgroup: FormGroup;
    public filtereditems = [];
    itemControl: FormControl = new FormControl('');
    protected _onDestroy = new Subject<void>();
    statusData = ['Open', 'In Progress', 'Completed'];
    currentObj: any;
    searchFormGroup: FormGroup;
    nonVegCount: number;
    vegCount: number;
    public recipesearch: FormControl = new FormControl();
    public readprice: FormControl = new FormControl();
    public readquom: FormControl = new FormControl();
    public ingrsearch: FormControl = new FormControl();
    public filteredingr = [];
    public filteredrecipe = [];
    public uom = ['gms', 'ml', 'pieces', 'bunch'];
    public rcpcat = ['Vegetables', 'Groceries', 'Non Veg', 'Others', 'Paste'];
    public ingrpayload = { catid: 112, prodid: 0 };
    items = [];
    public rcpcontrol: FormControl = new FormControl();
    itemName: string;
    onlyquom: number;
    onlymuom: string;
    public styleData = [
        'Paste',
        'Nice Cutting',
        'Rings',
        'Pieces',
        'Powder',
        'Cutting',
        'Soaking',
        'Boiling',
        'Marinate',
    ];
    editMode: boolean = false;
    validation: boolean = false;
    public rcpCategories = ['Curry Point', 'Catering', 'Both'];
    cookingType = ['Cooker', 'PAN', 'Kadhai', 'Vessel'];
    groupidData = [1, 2, 3, 4, 5, 6, 7];
    currycontrol: FormControl = new FormControl('');
    curries = [];
    filteredCurries = [];
    oldrcpid: FormControl = new FormControl();
    newrcpname: FormControl = new FormControl('');
    rcpCatList = [];
    vendorData = [];
    vendorId = 0;
    vendorIdControl: FormControl = new FormControl();
    constructor(
        private service: ProjectService,
        private router: Router,
        private dialog: MatDialog,
        private modalService: NgbModal,
        @Inject(LOCALE_ID) public locale: string,
        private _liveAnnouncer: LiveAnnouncer,
        private cdr: ChangeDetectorRef
    ) {
        (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
        pdfMakeConfig.fonts = {
            telugu: {
                normal: 'TenaliRamakrishna-Regular.ttf',
            },
        };
    }

    async ngOnInit() {
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.recipeFormgroup = new FormGroup({
            name: new FormControl(''),

            uom: new FormControl(''),
            minquantity: new FormControl(''),
            minduration: new FormControl(''),
            isnv: new FormControl('false'),
            platterscount: new FormControl(''),

            outputquantity: new FormControl(''),
            category: new FormControl(),
            instructions: new FormControl(''),
            cookertime: new FormControl(''),
            whistles: new FormControl(''),
            cookingtype: new FormControl(''),
            tname: new FormControl(''),
            menurcpid: new FormControl(''),
            groupid: new FormControl(''),
            noofpieces: new FormControl(''),
            pieceipqty: new FormControl(''),
            verified: new FormControl(false),
            verifiedby: new FormControl(''),
            vendorId: new FormControl(),
        });
        this.recipeItemFormgroup = new FormGroup({
            // stalloperatorid: new FormControl(''),
            rcpid: new FormControl(''),
            ingrname: new FormControl(''),
            quantity: new FormControl(''),
            category: new FormControl(''),
            price: new FormControl(''),
            mainingr: new FormControl(false),
            style: new FormControl(''),
            groupid: new FormControl(''),
            premium: new FormControl(false),
        });
        const getresp = await this.service.fetchRequest(
            'rcpheader/getAllrcpheader'
        );
        this.recipesData = getresp['rcpheaderList'];
        const catlist = await this.service.fetchRequest(
            'catdropdown/getAllRcpCategory'
        );
        this.rcpCatList = catlist;
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        // for asssigning name
        this.recipesData.forEach((rcp) => {
            this.rcpCatList.forEach((cat) => {
                if (parseInt(rcp.category) === cat.rcpCatId) {
                    rcp['catName'] = cat.rcpCatName;
                }
            });
        });
        console.log(this.rcpCatList);
        // curries
        const payload = {
            prodid: 0,
            catid: 118,
            vendorId: this.vendorId,
        };
        const curryresp = await this.service.fetchRequestPost(
            '/rest/product/ProductsByVariants',
            payload
        );
        this.curries = curryresp['productitems'];
        this.filteredCurries = this.curries;
        // for veg or NV
        for (let i in this.recipesData) {
            if (this.recipesData[i].isnv == true) {
                this.recipesData[i]['type'] = 'Non-Veg';
                this.nonVegCount = this.nonVegCount + 1;
            } else {
                this.recipesData[i]['type'] = 'Veg';
                this.vegCount = this.vegCount + 1;
            }
        }
        const stallresp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.stallOperator = stallresp['stallOperatorList'];
        this.stallOperator = this.stallOperator.filter((item) => {
            if (item?.role == 'Employee') return item;
        });
        // creataing empty array for pushing adhocpoitems
        this.recipesData.forEach((rcp) => {
            rcp.rcpItems = [];
        });
        const resp = await this.service.fetchRequest('rcpingr/getAllrcpingr');
        this.recipeItems = resp['rcpingrList'];
        // for getting name
        this.recipesData.forEach((rcp) => {
            this.recipeItems.forEach((item) => {
                if (rcp.rcpid === item.rcpid) item['rcpname'] = rcp.name;
            });
        });

        // pushing relational items to adhoc po
        this.recipesData.forEach((rcp) => {
            this.recipeItems.forEach((rcpItem) => {
                if (rcp.rcpid === rcpItem.rcpid) {
                    rcp.rcpItems.push(rcpItem);
                    rcp.childActive = false;
                    rcp.isEdit = false;
                }
            });
        });

        const itemsresp = await this.service.fetchRequest(
            'ingredient/getAllIngredient'
        );
        this.items = itemsresp['ingredientList'];
        // for telugu name
        this.recipeItems.forEach((rcpItem) => {
            this.items.forEach((item) => {
                if (rcpItem.itemid === item.itemid) {
                    rcpItem.tname = item.tname;
                }
            });
        });
        this.filtereditems = this.items;
        this.itemControl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filteritems();
            });
        this.filteredrecipe = this.recipesData;
        this.rcpcontrol.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterrcps();
            });
        this.currycontrol.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterCurries();
            });
        this.readprice.disable();
        this.readquom.disable();
    }
    protected filterCurries() {
        if (!this.curries) {
            return;
        }
        // get the search keyword
        let search = this.currycontrol.value;
        if (!search) {
            this.filteredCurries = this.curries.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredCurries = this.curries.filter(
            (bank) =>
                bank.prodName
                    .toString()
                    .toLowerCase()
                    .indexOf(search.toString().toLowerCase()) > -1
        );
    }
    protected filterrcps() {
        if (!this.recipesData) {
            return;
        }
        // get the search keyword
        let search = this.rcpcontrol.value;
        if (!search) {
            this.filteredrecipe = this.recipesData.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredrecipe = this.recipesData.filter(
            (bank) =>
                bank.name
                    .toLowerCase()
                    .indexOf(search.toString().toLowerCase()) > -1
        );
    }
    OnItemSelect(value) {
        this.items.forEach((item) => {
            if (item.itemid === value) {
                this.itemName = item.itemname;
                this.readprice.setValue(item.price);
                this.readquom.setValue(item.uom);
                this.onlyquom = item.quom;
                this.onlymuom = item.muom;
            }
        });
    }
    protected filteritems() {
        if (!this.items) {
            return;
        }
        // get the search keyword
        let search = this.itemControl.value;
        if (!search) {
            this.filtereditems = this.items.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        let nullarray = [];

        nullarray = this.items.filter((item) => item.itemname != null);
        // filter the banks
        this.filtereditems = nullarray.filter(
            (bank) =>
                bank.itemname.toLowerCase().indexOf(search.toString()) > -1
        );
    }
    activatingChild(obj, divRef: HTMLElement) {
        divRef.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
        });

        this.recipesData.forEach((rcp) => {
            if (rcp.rcpid === obj.rcpid) obj.childActive = !obj.childActive;
            else rcp.childActive = false;
        });

        this.recipeItemsTable = new MatTableDataSource(obj.rcpItems);
        console.log(this.recipeItemsTable);
        this.mobileRecipeItems = obj.rcpItems;
    }
    async OnNewRcpCreate() {
        let rcpid = this.oldrcpid.value;
        let rcpname = this.newrcpname.value;
        const vendorId = this.vendorIdControl.value;
        if (rcpid && rcpname && vendorId) {
            let payload = {};
            payload['rcpid'] = rcpid;
            payload['rcpname'] = rcpname;
            payload['vendorId'] = parseInt(vendorId);
            const resp = await this.service.fetchRequestPost(
                'rcpheader/copyrcpheader',
                payload
            );
            this.modalReference.close();
            this.oldrcpid.reset();
            this.newrcpname.reset();
            this.OnCloseItem(true);
        }
    }
    OnRcpItemClick(row: RecipeItems) {
        this.editMode = true;
        this.recipeitemid = row.ingrid;
        this.currentObj = row;
        this.itemName = row.ingrname;
        this.isMatDrawerOpened = true;
        this.isRecipeItemDetails = true;
        this.isRecipeDetails = false;
        this.recipeitemid = row.ingrid;
        // for price and uom
        let itemObj: any;
        this.items.forEach((item) => {
            if (item.itemid === row.itemid) {
                itemObj = item;
                console.log(item);
            }
        });
        this.readprice.setValue(itemObj.price);
        this.readquom.setValue(itemObj.uom);
        this.onlyquom = itemObj.quom;
        this.onlymuom = itemObj.muom;
        this.recipeItemFormgroup.patchValue({
            rcpid: row.rcpid,
            ingrname: row.itemid,
            quantity: row.quantity,
            category: row.category,
            mainingr: row.mainingr,
            style: row?.style,
            price: row.price,
            groupid: row?.groupid,
            premium: row?.premium,
        });
    }
    onQuantityEnter(value) {
        console.log(`Entered Value is :${value}`);
        let onenteredquant = value;
        let price = this.readprice.value;

        let quom = this.onlyquom;
        let totalprice = (onenteredquant / quom) * price;

        this.recipeItemFormgroup.controls['price'].setValue(
            totalprice.toFixed(2)
        );
    }
    CopyRecipeModal(modal) {
        this.modalReference = this.dialog.open(modal);
    }
    OnCloseItem(value) {
        this.isRecipeDetails = false;
        this.isRecipeItemDetails = false;
        this.recipeid = 0;
        this.recipeitemid = 0;
        this.isMatDrawerOpened = false;
        this.recipeFormgroup.reset();
        this.recipeItemFormgroup.reset();
        this.currentObj = {};
        this.editMode = false;
        this.oldrcpid.reset();
        this.newrcpname.reset();
        if (value) {
            this.ngOnInit();
        }
        this.modalReference.close();
    }
    OnRcpClick(row, event) {
        console.log(row);
        event.stopPropagation();
        this.recipeid = row.rcpid;
        this.isMatDrawerOpened = true;
        this.isRecipeDetails = true;
        this.isRecipeItemDetails = false;
        this.recipeFormgroup.controls['vendorId'].disable();
        this.recipeFormgroup.patchValue({
            name: row.name,
            // description: row.name,
            uom: row.uom,
            minduration: row.minduration,
            minquantity: row.minquantity,
            isnv: row.isnv + '',
            platterscount: row.platterscount,
            category: row.category,
            // mainingredientsquantity:row.mainingredientsquantity,
            outputquantity: row.outputquantity,
            instructions: row.instructions,
            cookingtype: row.cookingtype,
            whistles: row?.whistles,
            cookertime: row?.cookertime,
            tname: row?.tname,
            menurcpid: row?.menurcpid,
            groupid: row?.groupid,
            noofpieces: row?.noofpieces,
            pieceipqty: row?.pieceipqty,
            verified: row?.verified,
            verifiedby: row?.verifiedby,
            vendorId: row?.vendorId,
        });
    }
    async OnSaveRcpItem() {
        const data = this.recipeItemFormgroup.getRawValue();
        if (data.mainingr == null) {
            data.mainingr = false;
        }
        if (data.style == '') {
            data.style = null;
        }
        data['itemid'] = data.ingrname;
        data['ingrname'] = this.itemName;
        data['ingrid'] = 0;
        data.uom = this.onlymuom;
        if (this.editMode) {
            data['ingrid'] = this.recipeitemid;
        }
        const saveResp = await this.service.fetchRequestPost(
            'rcpingr/creatercpingr',
            data
        );
        console.log(data);
        this.OnCloseItem(true);
    }
    async OnSaveRcp() {
        let data = this.recipeFormgroup.getRawValue();
        data.groupid = parseInt(data.groupid);
        data.minduration = parseInt(data.minduration);
        data.minquantity = parseInt(data.minquantity);
        data.platterscount = parseInt(data.platterscount);
        data['mainingredientsquantity'] = 0;
        data['rcpid'] = this.recipeid;
        const saveResp = await this.service.fetchRequestPost(
            'rcpheader/creatercpheader',
            data
        );
        this.OnCloseItem(true);
    }
    OnAddRcp() {
        this.isMatDrawerOpened = true;
        this.isRecipeDetails = true;
        this.isRecipeItemDetails = false;
        this.recipeFormgroup.controls['vendorId'].setValue(this.vendorId);
    }
    OnAddRcpItem() {
        this.isMatDrawerOpened = true;
        this.isRecipeDetails = false;
        this.isRecipeItemDetails = true;
    }
    OnDel(popup) {
        this.modalReference = this.dialog.open(popup);
        this.delObj = {};
        if (this.isRecipeDetails) {
            this.delObj['rcpid'] = this.recipeid;
        }
        if (this.isRecipeItemDetails) {
            this.delObj['ingrid'] = this.recipeitemid;
        }
    }

    async confirm() {
        if (this.isRecipeDetails) {
            const delResp = await this.service.fetchRequestdel(
                'rcpheader/deletercpheader',
                this.delObj
            );
        }
        if (this.isRecipeItemDetails) {
            const delResp = await this.service.fetchRequestdel(
                'rcpingr/deletercpingr',
                this.delObj
            );
        }
        this.modalReference.close();
        this.OnCloseItem(true);
    }
    CloseDialog() {
        this.modalReference.close();
    }
    async getAllData(rcpid) {
        const getresp = await this.service.fetchRequest(
            'rcpheader/getAllrcpheader'
        );
        this.recipesData = getresp['rcpheaderList'];
        // curries
        const payload = {
            prodid: 0,
            catid: 118,
            vendorId: this.vendorId,
        };
        const curryresp = await this.service.fetchRequestPost(
            '/rest/product/ProductsByVariants',
            payload
        );
        this.curries = curryresp['productitems'];
        this.filteredCurries = this.curries;
        // for veg or NV
        for (let i in this.recipesData) {
            if (this.recipesData[i].isnv == true) {
                this.recipesData[i]['type'] = 'Non-Veg';
                this.nonVegCount = this.nonVegCount + 1;
            } else {
                this.recipesData[i]['type'] = 'Veg';
                this.vegCount = this.vegCount + 1;
            }
        }
        // creataing empty array for pushing adhocpoitems
        this.recipesData.forEach((rcp) => {
            rcp.rcpItems = [];
        });
        const resp = await this.service.fetchRequest('rcpingr/getAllrcpingr');
        this.recipeItems = resp['rcpingrList'];
        // for getting name
        this.recipesData.forEach((rcp) => {
            this.recipeItems.forEach((item) => {
                if (rcp.rcpid === item.rcpid) item['rcpname'] = rcp.name;
            });
        });

        // pushing relational items to adhoc po
        this.recipesData.forEach((rcp) => {
            this.recipeItems.forEach((rcpItem) => {
                if (rcp.rcpid === rcpItem.rcpid) {
                    rcp.rcpItems.push(rcpItem);
                    rcp.childActive = false;
                    rcp.isEdit = false;
                }
            });
        });

        // for telugu name
        this.recipeItems.forEach((rcpItem) => {
            this.items.forEach((item) => {
                if (rcpItem.itemid === item.itemid) {
                    rcpItem.tname = item.tname;
                }
            });
        });
        // for selecting same rcpid;
        this.recipesData.forEach((rcp) => {
            if (rcp.rcpid === rcpid) {
                rcp.childActive = !rcp.childActive;
                this.recipeItemsTable = new MatTableDataSource(rcp.rcpItems);
                console.log(this.recipeItemsTable);
                this.mobileRecipeItems = rcp.rcpItems;
            } else rcp.childActive = false;
        });
    }
}
