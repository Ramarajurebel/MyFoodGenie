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
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as pdfMakeConfig from 'pdfmake/build/pdfmake.js';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FoodMenu } from './../../shared/classes/food-menu';
import { FoodMenuRcps } from './../../shared/classes/food-menu-rcps';
import { formatDate } from '@angular/common';
import { Recipes } from './../../shared/classes/rcpheader';
import { StallFoodInvClass } from './../../shared/classes/stall-food-inv';
import { VenodorsList } from './../../shared/classes/vendors';
import { Product } from 'app/shared/classes/products';

@Component({
    selector: 'app-food-menu',
    templateUrl: './food-menu.component.html',
    styleUrls: ['./food-menu.component.scss'],
})
export class FoodMenuComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    appearnce: MatFormFieldModule = fill;
    foodMenuData: FoodMenu[] = [];
    foodMenuRcps: FoodMenuRcps[] = [];
    filteredFoodMenuData: FoodMenu[] = [];
    foodMenuRcpsTable = new MatTableDataSource<FoodMenuRcps>();
    // displayedColumns: string[] = PoItemsColumns.map((col) => col.key);
    // columnsSchema: any = PoItemsColumns;
    foodMenuRcpsFormGroup: FormGroup;
    productsList = [];
    modalReference: any;
    public days = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ];
    public type = [
        'Tiffins',
        'Lunch',
        'Snacks',
        'Dinner',
        'Hot',
        'Sweets',
        'Veg Pickles',
        'Non Veg Pickles',
    ];
    public uom = ['gms', 'ml', 'pieces', 'bunch'];
    public status = ['Active', 'In Active'];
    public evtCategory = ['Sale', 'Event'];

    foodMenuId: number = 0;
    foodMenuRecipeId: number = 0;
    delMenuObj: any;
    delMenuRcpObj: any;

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
    selectedRow: FoodMenuRcps;
    oldValueRow: FoodMenuRcps;
    ingredientsImagePath = './assets/images/ingredients/';

    isMatDrawerOpened: boolean = false;
    isFoodMenuRcp: boolean = false;
    isFoodMenu: boolean = false;

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
    editMode: boolean = false;
    foodMenuFormGroup: FormGroup;
    copyForm: FormGroup;
    CategoryData = [];
    categoryControl: FormControl = new FormControl('');
    menuControl: FormControl = new FormControl('');
    public subCategoryData = [
        { subCatId: 129, subCatName: 'Tiffins' },
        { subCatId: 130, subCatName: 'Lunch' },
        { subCatId: 131, subCatName: 'Snacks' },
        { subCatId: 132, subCatName: 'Dinner' },
    ];
    prodRecipes = [];
    filteredRecipes = [];
    filteredMenu: FoodMenu[] = [];
    tempFoodData = [];
    foodMenuPayload = { catid: 118, prodid: 0, vendorId: 0 };
    recipeFilter: FormControl = new FormControl('');
    public menuSearch: FormControl = new FormControl('');
    isTypeEvent: boolean = false;
    normalRecipesList: Recipes[] = [];
    tempNormalRecipesList: Recipes[] = [];
    stallData = [];
    startDate: FormControl = new FormControl('');
    endDate: FormControl = new FormControl('');
    menuIdControl: FormControl = new FormControl('');
    dateControl: FormControl = new FormControl('');
    vendorData: VenodorsList[] = [];
    loggedMobileNumber: string = '';
    assignedVendorId: number = 0;
    loggedUserRole: string = '';
    allProdRecipes: Product[] = [];
    vendorId: number = 0;
    menuId: number = 0;
    sequence: any;
    constructor(
        private service: ProjectService,
        private router: Router,
        private dialog: MatDialog,
        private modalService: NgbModal,
        @Inject(LOCALE_ID) public locale: string
    ) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.loggedMobileNumber = user.mobileNumber;
        this.loggedUserRole = user.role;
        console.log('role', this.loggedUserRole);
        (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
        pdfMakeConfig.fonts = {
            telugu: {
                normal: 'TenaliRamakrishna-Regular.ttf',
            },
        };
    }

    async ngOnInit() {
        let vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }
        this.foodMenuFormGroup = new FormGroup({
            menuName: new FormControl(''),
            category: new FormControl(''),
            frequency: new FormControl(''),
            day: new FormControl(''),
            date: new FormControl(''),
            status: new FormControl(''),
            totalNoOfRecipes: new FormControl(),
            stallId: new FormControl(),
            vendorId: new FormControl(),
        });
        this.foodMenuRcpsFormGroup = new FormGroup({
            menuId: new FormControl(''),
            // category kitchen or others
            itemId: new FormControl(''),
            subCategory: new FormControl(''),
            sequence: new FormControl(''),
            requiredQuantity: new FormControl(),
            category: new FormControl(),
            shortName: new FormControl(),
        });
        this.copyForm = new FormGroup({
            menuName: new FormControl(),
            frequency: new FormControl(),
            day: new FormControl(),
            date: new FormControl(''),
            menuid: new FormControl(),
            vendorId: new FormControl(),
        });
        // vendor
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        // operator
        const operator = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.stallOperator = operator['stallOperatorList'];
        // food menu
        const dataresp = await this.service.fetchRequest(
            'foodmenu/getAllFoodMenu'
        );
        this.foodMenuData = dataresp['foodMenuList'];
        // food menu recipes
        const menurcpresp = await this.service.fetchRequest(
            'foodmenurcps/getAllFoodMenuRcps'
        );
        this.foodMenuRcps = menurcpresp['foodMenuRcpsList'];

        // recipe data
        const recipes = await this.service.fetchRequest(
            'rcpheader/getAllrcpheader'
        );
        this.normalRecipesList = recipes['rcpheaderList'];
        // stall data
        const resp = await this.service.fetchRequest('stall/getAllStalls');
        this.stallData = resp['supplierList'];

        this.tempNormalRecipesList = this.normalRecipesList;
        // category data
        const data = {};
        data['shopId'] = 11;
        data['vendorId'] = 1001;
        const catresp = await this.service.fetchRequestPost(
            'rest/category/CategoryByShop',
            data
        );
        this.CategoryData = catresp['categories'];
        this.foodMenuData.find((item) => {
            this.CategoryData.find((row) => {
                if (item.category == row.catId) item['catName'] = row.catName;
            });
        });
        this.subCategoryData = [];
        this.CategoryData.forEach((cat) => {
            if (cat.catId === 118) {
                this.subCategoryData = cat.subCategories;
            }
        });
        this.filteredFoodMenuData = this.foodMenuData;

        this.foodMenuRcps.forEach((item) => {
            this.foodMenuData.forEach((menu) => {
                if (item.menuId == menu.menuId) {
                    item['menuName'] = menu.menuName;
                    item['day'] = menu.day;
                    item['type'] = menu.type;
                }
            });
        });
        // for getting subcat name
        this.foodMenuRcps.forEach((rcp) => {
            this.subCategoryData.forEach((sub) => {
                if (sub.subCatId === rcp.subCategory) {
                    rcp['subCatName'] = sub.subCatName;
                }
            });
        });
        this.foodMenuPayload.vendorId = this.vendorId;
        const getresp = await this.service.fetchRequestPost(
            'rest/product/ProductsByVariants',
            this.foodMenuPayload
        );
        this.prodRecipes = getresp['productitems'];
        this.allProdRecipes = getresp['productitems'];
        // for showing prodName in table and subCategory name also
        this.foodMenuRcps.forEach((item) => {
            this.prodRecipes.forEach((rcp) => {
                if (item.itemId === rcp.prodId) {
                    item['itemName'] = rcp.prodName;
                }
            });
        });
        this.foodMenuRcps.forEach((item) => {
            this.tempNormalRecipesList.forEach((rcp) => {
                if (rcp.rcpid === item.itemId) item['itemName'] = rcp.name;
            });
        });
        this.filteredRecipes = this.prodRecipes;

        this.filteredMenu = this.foodMenuData;
        this.tempFoodData = JSON.parse(JSON.stringify(this.foodMenuRcps));
        // main logic
        this.foodMenuData.forEach((menu) => {
            menu['childItems'] = [];
            menu.childActive = false;
        });
        this.foodMenuData.forEach((menu) => {
            this.foodMenuRcps.forEach((menuRcp) => {
                if (menu.menuId === menuRcp.menuId) {
                    menu.childItems.push(menuRcp);
                }
            });
        });
        this.menuControl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterMenu();
            });

        this.menuSearch.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterMenu();
            });
        this.foodMenuFormGroup
            .get('date')
            .setValue(new Date().toISOString().split('T')[0]);
    }
    OnFoodMenuChange(menuId) {
        this.prodRecipes = this.allProdRecipes;
        this.filteredRecipes = this.allProdRecipes;
        let vendorId = 0;
        this.filteredFoodMenuData.forEach((menu) => {
            if (menu.menuId == menuId) {
                vendorId = menu.vendorId;
            }
        });
        if (vendorId != 0) {
            this.filteredRecipes = this.prodRecipes;
            this.filteredRecipes = this.filteredRecipes.filter((prods) => {
                return prods.vendorId === vendorId;
            });
            this.prodRecipes = this.filteredRecipes;
        }
    }
    protected filteritems() {
        if (!this.prodRecipes) {
            return;
        }
        // get the search keyword
        let search = this.recipeFilter.value;
        if (!search) {
            this.filteredRecipes = this.prodRecipes.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredRecipes = this.filteredRecipes.filter(
            (bank) =>
                bank.prodName.toLowerCase().indexOf(search.toLowerCase()) > -1
        );
    }
    protected filterRecipes() {
        if (!this.normalRecipesList) {
            return;
        }
        // get the search keyword
        let search = this.recipeFilter.value;
        if (!search) {
            this.tempNormalRecipesList = this.normalRecipesList.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.tempNormalRecipesList = this.normalRecipesList.filter(
            (bank) => bank.name.toLowerCase().indexOf(search.toLowerCase()) > -1
        );
    }
    protected filterMenu() {
        if (!this.foodMenuData) {
            return;
        }
        // get the search keyword
        let search = this.menuSearch.value;
        if (!search) {
            this.filteredFoodMenuData = this.foodMenuData.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredFoodMenuData = this.foodMenuData.filter(
            (bank) =>
                bank.menuName.toLowerCase().indexOf(search.toLowerCase()) > -1
        );
    }
    OpenEvent(modal) {
        this.modalReference = this.modalService.open(modal);
    }
    OpenInv(modal) {
        this.modalReference = this.modalService.open(modal);
        this.dateControl.setValue(new Date().toISOString().split('T')[0]);
    }
    async OnSaveInv() {
        const date = formatDate(
            this.dateControl.value,
            'YYYY-MM-dd',
            this.locale
        );
        const payload = {
            menuId: this.menuIdControl.value,
            date: date,
            vendorId: this.vendorId
        };
        const resp = await this.service.fetchRequestPost(
            'foodmenu/insertToInv',
            payload
        );
        this.modalReference.close();
    }
    OnClose(click) {
        this.modalReference.close();
    }
    onDelFoodMenu(template) {
        this.delMenuObj = {
            menuId: this.foodMenuId,
        };
        this.delMenuRcpObj = {
            menuRecipeId: this.foodMenuRecipeId,
        };
        this.modalReference = this.modalService.open(template, {
            ariaLabelledBy: 'modal-basic-title',
        });
    }
    async DelConfirmFoodMenu() {
        const delresp = await this.service.fetchRequestdel(
            'foodmenu/deleteFoodMenu',
            this.delMenuObj
        );

        this.modalReference.close();
        this.OnCloseItem(true, true);
        // this.GetFoodMenuData();
    }
    activatingChild(menu: FoodMenu) {
        menu.childActive = !menu.childActive;
        this.foodMenuRcpsTable = new MatTableDataSource(menu.childItems);
      
    }
    AddFoodMenu() {
        this.foodMenuFormGroup.reset();
        
        this.isMatDrawerOpened = true;
        this.isFoodMenu = true;
        this.isFoodMenuRcp = false;
        this.foodMenuId = 0;
        this.foodMenuRecipeId = 0;
        this.foodMenuFormGroup.controls['vendorId'].setValue(this.vendorId);
    }
    AddFoodMenuRcp() {
       
        let foodMenuObj: FoodMenu = {};
        this.foodMenuData.forEach((menu) => {
            if (menu.menuId === this.foodMenuId) {
                foodMenuObj = menu;
            }
        });
        if (foodMenuObj.category === 'Event') this.isTypeEvent = true;
        else this.isTypeEvent = false;
        if (!this.isTypeEvent) {
            this.recipeFilter.valueChanges
                .pipe(takeUntil(this._onDestroy))
                .subscribe(() => {
                    this.filteritems();
                });
        } else {
            this.recipeFilter.valueChanges
                .pipe(takeUntil(this._onDestroy))
                .subscribe(() => {
                    this.filterRecipes();
                });
        }

        // this.foodMenuRcpsFormGroup.reset();
        this.isMatDrawerOpened = true;
        this.isFoodMenu = false;
        this.isFoodMenuRcp = true;

        this.foodMenuRecipeId = 0;
        if (this.foodMenuId != 0) {
            this.foodMenuRcpsFormGroup.controls['menuId'].setValue(
                this.foodMenuId
            );
         
        }
        else{
            this.foodMenuRcpsFormGroup.controls['menuId'].reset();
        }
        // this.foodMenuRcpsFormGroup.controls['menuId'].reset();
       
      
       
    }
    async OnEditFoodMenu(data) {
        // this.productsarray();
        // this.TableFieldsForm.controls['category'].setValue(parseInt(data.category));
        this.isMatDrawerOpened = true;
        this.isFoodMenuRcp = false;
        this.isFoodMenu = true;
        this.foodMenuFormGroup.controls['vendorId'].disable();

        console.log(data);
        this.menuId = data.menuId;
        this.foodMenuId = data.menuId;
        this.foodMenuRecipeId = 0;
        this.foodMenuFormGroup.patchValue({
            menuName: data.menuName,
            category: data?.category,
            frequency: data.frequency,
            day: data.day,
            date: data.date,
            status: data?.status,
            totalNoOfRecipes: data?.totalNoOfRecipes,
            stallId: data?.stallId,
            vendorId: data?.vendorId,
        });

        this.editMode = true;
       
    }
    OnFrequencyChange(value) {
        console.log(value);
    }
    OpenCopyModal(modal) {
        this.modalReference = this.modalService.open(modal);
    }
    async onSaveCopy() {
        const data = this.copyForm.value;

        if (data) {
            if (data.date != '' && data.date != null) {
                data.date = formatDate(data.date, 'YYYY-MM-dd', this.locale);
            }
            data.vendorId = parseInt(data.vendorId);
            const resp = await this.service.fetchRequestPost(
                'foodmenurcps/copyfoodmenu',
                data
            );
            this.modalReference.close();
            this.copyForm.reset();

            this.ngOnInit();
        }
    }
    async OnEditFoodMenuRcp(data) {
        this.foodMenuId = data.menuId;
        let foodMenuObj: FoodMenu = {};
        this.foodMenuData.forEach((menu) => {
            if (menu.menuId === this.foodMenuId) {
                foodMenuObj = menu;
                this.isTypeEvent = true;
            }
        });
        if (foodMenuObj.category === 'Event') this.isTypeEvent = true;
        else this.isTypeEvent = false;
        if (!this.isTypeEvent) {
            this.recipeFilter.valueChanges
                .pipe(takeUntil(this._onDestroy))
                .subscribe(() => {
                    this.filteritems();
                });
        } else {
            this.recipeFilter.valueChanges
                .pipe(takeUntil(this._onDestroy))
                .subscribe(() => {
                    this.filterRecipes();
                });
        }
        this.isMatDrawerOpened = true;
        this.isFoodMenuRcp = true;
        this.isFoodMenu = false;
        this.foodMenuRecipeId = data.menuRecipeId;

        this.foodMenuRcpsFormGroup.patchValue({
            menuId: data.menuId,
            itemId: data.itemId,
            subCategory: data.subCategory,
            sequence: data.sequence,
            requiredQuantity: data.requiredQuantity,
            category: data?.category,
            shortName: data?.shortName,
        });
        this.editMode = true;
    }
    async OnSaveFoodMenu() {
        const data = this.foodMenuFormGroup.getRawValue();
        data['date'] = formatDate(data.date, 'YYYY-MM-dd', this.locale);
        data['stallId'] = parseInt(data['stallId']);
        if (this.editMode) {
            data['menuId'] = this.foodMenuId;
        } else data['menuId'] = 0;
        const saveresp = await this.service.fetchRequestPost(
            'foodmenu/createFoodMenu',
            data
        );
        this.OnCloseItem(true, false);
    }
    decline() {
        this.modalReference.close();
    }
    async OnSaveCreateEvents() {
        if (this.startDate.value && this.endDate.value) {
            const startDate = formatDate(
                this.startDate.value,
                'YYYY-MM-dd',
                this.locale
            );
            const endDate = formatDate(
                this.endDate.value,
                'YYYY-MM-dd',
                this.locale
            );
            const payload = {
                startDate,
                endDate,
            };
            const resp = await this.service.fetchRequestPost(
                'foodmenu/createEvtFromMenu',
                payload
            );
            this.modalReference.close();
        }
    }
    async OnSaveFoodMenuRcp() {
        const data = this.foodMenuRcpsFormGroup.value;

        if (this.editMode) {
            data['menuRecipeId'] = this.foodMenuRecipeId;
        } else data['menuRecipeId'] = 0;

        const editresp = await this.service.fetchRequestPost(
            'foodmenurcps/createFoodMenuRcps',
            data
        );

        this.OnCloseItem(true, false);
    }
    async DelConfirmMenuRcp() {
        const delresp = await this.service.fetchRequestdel(
            'foodmenurcps/deleteFoodMenuRcps',
            this.delMenuRcpObj
        );
        this.OnCloseItem(true, true);
    }
    OnCloseItem(isGetData: boolean, isModalReference: boolean) {
        
        this.isFoodMenu = false;
        this.isFoodMenuRcp = false;
        this.foodMenuId = 0;
        this.foodMenuRecipeId = 0;
        this.editMode = false;
        this.isMatDrawerOpened = false;
        this.isTypeEvent = false;
        if (isGetData) {
            this.ngOnInit();
        }
        if (isModalReference) {
            this.modalReference.close();
        }
    }
}
