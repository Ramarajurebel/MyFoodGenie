import { formatDate } from '@angular/common';
import {
    Component,
    ElementRef,
    Inject,
    LOCALE_ID,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { items } from 'app/mock-api/apps/file-manager/data';
import { stringify } from 'crypto-js/enc-utf8';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import {
    CdkDragDrop,
    CdkDragEnter,
    CdkDragMove,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { MatTableDataSource } from '@angular/material/table';
import * as pdfMakeConfig from 'pdfmake/build/pdfmake.js';
pdfMakeConfig.vfs = pdfFonts.pdfMake.vfs;
@Component({
    selector: 'app-kitchen-new-preparation',
    templateUrl: './kitchen-new-preparation.component.html',
    styleUrls: ['./kitchen-new-preparation.component.scss'],
})
export class KitchenNewPreparationComponent implements OnInit {
    public events = [];
    public recipes = [];
    public tempEvents = [];
    public recipeIngredients = [];
    public tempRcpIngr = [];
    public teluguNameProducts = [];
    public eventReports = [];
    public typeOneReports = [];
    public typeTwoReports = [];
    public keys = [];
    public headingArray = [];
    public tempEventRecipes = [];
    public eventType: string;
    public eventDate: string;
    public vegetables = [];
    public groceries = [];
    public nonVeg = [];
    public allEventRcpIngr = [];
    public tempAllEventRcpIngr = [];
    public others = [];
    public selectedRcpIngredients = [];
    public typeOneName: string;
    public typeTwoName: string;
    public typeOneEvents = [];
    public typeTwoEvents = [];
    public typeOneRecipes = [];
    public typeTwoRecipes = [];
    public typeOneVegetables = [];
    public typeTwoVegetables = [];
    public typeOneGroceries = [];
    public typeTwoGroceries = [];

    public typeOneNonVeg = [];
    public typeTwoNonVeg = [];
    public typeOneOthers = [];
    public typeTwoOthers = [];
    public typeOnePaste = [];
    public typeTwoPaste = [];

    public typeOneRcpIngr = [];
    public typeTwoRcpIngr = [];
    public recipeDetails = [];
    public eventName: string;
    public eventNameArray = [];
    selectedSortIngredients = [];
    groupIdsList = [];
    recipeInstructions: string;
    @ViewChild('modal') modal: TemplateRef<any>;
    @ViewChild('rcpdetailsmodal') rcpmodal: TemplateRef<any>;
    private modalReference: MatDialogRef<TemplateRef<any>>;
    public typeOneEventName: string;
    typeTwoEventName: string;
    ingredientsImagePath = './assets/images/ingredients/';
    eventDateControl: FormControl = new FormControl('');
    public categoryData = ['Lunch', 'Dinner', 'Tiffins', 'Snacks'];
    categoryControl = new FormControl('');
    @ViewChild('dropListContainer') dropListContainer?: ElementRef;
    @ViewChild('dropListContainerTwo') dropListContainerTwo?: ElementRef;
    dropListReceiverElement?: HTMLElement;
    dragDropInfo?: {
        dragIndex: number;
        dropIndex: number;
    };
    todayOrTomorrowControl = new FormControl('');
    prePrepTypeOne = [];
    prePrepTypeTwo = [];
    isTypeOne: boolean = false;
    isTypeTwo: boolean = false;
    groupingPastesDefaultList = [
        {
            id: 'Paste',
            name: 'Paste-(పేస్ట్)-(पेस्ट)',
        },
        {
            id: 'Nice Cutting',
            name: 'Nice Cutting-(చక్కగా కట్)-(साफ कट)',
        },
        {
            id: 'Rings',
            name: 'Rings-(రింగ్ రకం )-(अंगूठी की तरह)',
        },
        {
            id: 'Pieces',
            name: 'Pieces-(ముక్కలు)-(टुकड़े)',
        },
        {
            id: 'Powder',
            name: 'Powder-(పొడి)-(पाउडर)',
        },
        {
            id: 'Cutting',
            name: 'Cutting-(కోత)-(काट रहा है)',
        },
        {
            id: 'Soaking',
            name: 'Soaking-(నానబెట్టడం)-(भिगोने)',
        },
        {
            id: 'Boiling',
            name: 'Boiling-(ఉడకబెట్టడం)-(उबलना)',
        },
        {
            id: 'Marinate',
            name: 'Marinate-(నానబెట్టడం)-(खटाई में डालना)',
        },
    ];
    dropdownSettings: IDropdownSettings;
    selectedEvents = [];
    eventsList: FormControl = new FormControl();
    tomorrowEvents = [];
    todayEvents = [];
    isAllEvents: boolean = false;
    allArrayEvents = [];

    evtCatCtrl: FormControl = new FormControl();
    catCtrlData = ['Kitchen', 'Event', 'Catering'];
    avblQty: FormControl = new FormControl();
    selectedItemId: number = 0;
    selectedIngrObj: any;
    saleQty: FormControl = new FormControl();
    vendorId = 0;
    constructor(
        private naviService: ProjectService,
        @Inject(LOCALE_ID) public locale: string,
        private dialog: MatDialog,
        private activatedRoute: ActivatedRoute
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
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'keventid',
            textField: 'keventname',

            allowSearchFilter: true,
        };
        this.todayOrTomorrowControl.setValue('Today');
        const currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        let date = new Date();
        let todate = date.getDate() + 1;
        date.setDate(todate);
        console.log(date);
        let tommorrowdate = formatDate(date, 'YYYY-MM-dd', this.locale);
        const evtPayload = {
            startDate: currentDate,
            endDate: tommorrowdate,
            vendorId: this.vendorId,
        };
        let eventResp = await this.naviService.fetchRequestPost(
            'keventheader/geteventbydate',
            evtPayload
        );
        this.events = eventResp['keventheaderList'];
        this.todayEvents = this.events.filter((data) => {
            return data.status != 'Completed' && data.eventdate == currentDate;
        });
        this.tomorrowEvents = this.events.filter((data) => {
            return (
                data.status != 'Completed' && data.eventdate == tommorrowdate
            );
        });
        this.selectedEvents = this.events;
        // For Recipes
        let recpResp = await this.naviService.fetchRequest(
            'rcpheader/getAllrcpheader'
        );
        this.recipes = recpResp['rcpheaderList'];
        this.events = this.events.filter((item: any) => {
            if (item.status != 'Completed') return item;
        });
        this.tempEvents = JSON.parse(JSON.stringify(this.events));
        // for Recipe ingredients
        let ingrResp = await this.naviService.fetchRequest(
            'rcpingr/getAllrcpingr'
        );
        this.recipeIngredients = ingrResp['rcpingrList'];
        this.tempRcpIngr = JSON.parse(JSON.stringify(this.recipeIngredients));
        // Telugu product items names
        let payload: any = {};
        (payload.catid = 112), (payload.prodid = 0);
        payload.vendorId = this.vendorId;
        let tnameResp = await this.naviService.fetchRequestPost(
            'rest/product/ProductsByVariants',
            payload
        );
        this.teluguNameProducts = tnameResp['productitems'];

        console.log(currentDate);
        this.events = this.events.filter((item: any) => {
            if (
                item.eventdate == currentDate &&
                (item.category == 'Catering' || item.category == 'Kitchen')
            ) {
                return item;
            }
        });
        // for getting events name

        // this.EventType = JSON.stringify(temp);
        let currentTime = formatDate(
            new Date().getTime(),
            'HH:mm:ss',
            this.locale
        );
        console.log(currentTime);
        this.categoryControl.setValue('All');
        if (currentTime >= '13:00:00' && currentTime < '18:00:00') {
            console.log('Evening');
            this.categoryControl.setValue('Dinner');
            this.GetMorningOrEveningData('Dinner', 'Empty', this.todayEvents);
        } else if (currentTime > '18:00:00' && currentTime < '23:59:59') {
            this.todayOrTomorrowControl.setValue('Tomorrow');
            console.log('Tommorrow Morning');

            console.log(tommorrowdate);
            this.events = this.tempEvents;
            this.events = this.events.filter((item) => {
                if (
                    item.eventdate == tommorrowdate &&
                    (item.category == 'Catering' || item.category == 'Kitchen')
                )
                    return item;
            });
            // // for getting events name
            this.categoryControl.setValue('Lunch');
            this.GetMorningOrEveningData('Lunch', 'Empty', this.events);
        } else {
            console.log('Today Morning');
            this.categoryControl.setValue('Lunch');
            this.GetMorningOrEveningData('Lunch', 'Empty', this.todayEvents);
        }
    }
    async drop(dropListName: string, event: CdkDragDrop<string[]>) {
        console.log(event.previousIndex);
        console.log(event.currentIndex);
        console.log(event.container.data);
        moveItemInArray(
            event.container.data,
            event.previousIndex,
            event.currentIndex
        );
        let obj = event.container.data[event.currentIndex];
        console.log('Obj', obj);

        let payload = {
            eventItemsId: obj['EventItemsId'],
            groupId: event.currentIndex,
        };
        console.log(payload);
        const resp = await this.naviService.fetchRequestPost(
            'keventheaderitems/updategroupid',
            payload
        );
    }
    async GetMorningOrEveningData(type1: String, type2: String, events) {
        this.headingArray = [];
        this.keys = [];
        this.eventReports = [];
        this.typeOneEvents = [];
        this.typeTwoEvents = [];
        if (events.length > 0) {
            events.forEach((item: any) => {
                if (item?.type == type1) {
                    this.typeOneEvents.push(item);
                } else if (item?.type == type2) {
                    this.typeTwoEvents.push(item);
                }
            });
        }
        if (this.typeOneEvents.length > 0) {
            this.GetRecipesData(this.typeOneEvents, 'One');
        }
        if (this.typeTwoEvents.length > 0) {
            this.GetRecipesData(this.typeTwoEvents, 'Two');
        }
    }
    OpenInvPopup(modal, data) {
        this.selectedIngrObj = data;
        console.log('invObj', data);
        this.selectedItemId = data.itemid;

        this.modalReference = this.dialog.open(modal);
    }
    async OnUpdateInv() {
        const quantity = this.avblQty.value;
        const payload = {
            itemId: this.selectedItemId,
            availableQty: quantity,
        };
        const resp = await this.naviService.postResponseAsText(
            'kitcheninventory/updateAvblQty',
            payload
        );
        if (resp == 'SUCCESS') {
            let currentBalance = parseFloat(this.selectedIngrObj.balance);
            const postiveCurrentBalance = Math.abs(currentBalance);
            let finalResultValue = 0;
            if (postiveCurrentBalance >= 1000) {
                if (this.avblQty.value >= 1000) {
                    let formattedBal = this.avblQty.value;
                    finalResultValue = currentBalance + formattedBal;
                    finalResultValue = finalResultValue / 1000;
                } else {
                    finalResultValue = currentBalance + this.avblQty.value;
                    finalResultValue = finalResultValue / 1000;
                }
            } else {
                finalResultValue = currentBalance + this.avblQty.value;
            }
            this.selectedIngrObj.formattedBal = finalResultValue.toString();
            this.modalReference.close();
            this.avblQty.reset();
            this.selectedItemId = 0;
        } else {
            alert('data not saved..');
        }
    }
    async GetRecipesData(events, type) {
        let rows = [];
        let recipesData = [];
        this.headingArray = [];
        this.keys = [];
        this.typeOneRecipes = [];
        this.typeTwoRecipes = [];
        const reportResp = await this.naviService.fetchRequestPost(
            'keventheaderitems/eventrecipeslist',
            events
        );

        rows = reportResp['rows'];
        this.headingArray = reportResp['cols'];
        this.keys = reportResp['keys'];
        this.keys.splice(-1);

        this.headingArray.splice(0, 0, 'SNo');
        let length = this.headingArray.length - 3;
        this.headingArray.splice(length, 3);

        console.log(this.headingArray);

        for (let i = 0; i < rows.length; i++) {
            recipesData.push(Object.assign({}, ...rows[i].cols));
        }
        console.log('RecipesData', recipesData);
        recipesData.find((item) => {
            this.recipes.find((rcp) => {
                if (item.Recipe == rcp.rcpid) {
                    item['uom'] = rcp.uom;
                    item['RecipeName'] =
                        item.Recipe + '-' + item.recname + '-' + rcp.tname;
                }
            });
        });

        let temp: any[] = [];
        let othersTemp: any[] = [];
        recipesData.find((row) => {
            let obj: any = {};

            obj['Recipe'] = row.Recipe;
            obj['RecipeName'] = row.RecipeName;
            obj['TotalReqQty'] = row.TotalReqQty;
            obj['uom'] = row.uom;
            obj['GroupId'] = row.GroupId;
            obj['EventItemsId'] = row.EventItemsId;
            obj['isItemsReady'] = row.isItemsReady;
            obj['isRcpCooked'] = row.isRcpCooked;
            obj['isPacked'] = row.isPacked;
            temp.push(obj);
        });

        console.log(temp);
        for (let i in temp) {
            if (temp[i].uom == 'gms' || temp[i].uom == 'ml') {
                if (temp[i].TotalReqQty >= 1000) {
                    temp[i]['newTotalReqQty'] = temp[i].TotalReqQty / 1000;
                    if (temp[i].uom == 'gms') temp[i].uom = 'Kgs';
                    else if (temp[i].uom == 'ml') temp[i].uom = 'L';
                } else {
                    temp[i]['newTotalReqQty'] = temp[i].TotalReqQty;
                }
            } else {
                temp[i]['newTotalReqQty'] = temp[i].TotalReqQty;
            }
        }
        let name = [];
        let eventdate = [];
        this.eventNameArray = [];

        events.forEach((item) => {
            eventdate.push(item.eventdate);
            name.push(item?.type);
            this.eventNameArray.push(item?.keventname);
        });
        let eventnamestring = [...new Set(this.eventNameArray)];
        this.eventName = eventnamestring.toString();
        let eventType = [...new Set(name)];
        let eventdatestring = [...new Set(eventdate)];
        this.eventDate = eventdatestring.toString();

        if (type === 'One') {
            this.typeOneName = eventType.toString();
            this.typeOneRecipes = temp;
            // for update recipe stage
            this.typeOneRecipes.forEach((rcp) => {
                rcp['type'] = this.typeOneName;
            });
            console.log('oneRecipes', this.typeOneRecipes);
            this.AllRcpIngredients(events, 'One');
            this.typeOneEventName = eventnamestring.toString();
        } else if (type === 'Two') {
            this.typeTwoName = eventType.toString();
            this.typeTwoRecipes = temp;
            // for update recipe stage
            this.typeTwoRecipes.forEach((rcp) => {
                rcp['type'] = this.typeTwoName;
            });

            this.AllRcpIngredients(events, 'Two');
            this.typeTwoEventName = eventnamestring.toString();
        }
    }
    async AllRecipesData(events, type) {
        let rows = [];
        let headingArray = [];
        let keys = [];
        let recipesData = [];
        const reportResp = await this.naviService.fetchRequestPost(
            'keventheaderitems/eventrecipeslist',
            events
        );

        rows = reportResp['rows'];
        headingArray = reportResp['cols'];
        keys = reportResp['keys'];
        keys.splice(-1);

        headingArray.splice(0, 0, 'SNo');
        let length = headingArray.length - 3;
        headingArray.splice(length, 3);

        console.log(this.headingArray);

        for (let i = 0; i < rows.length; i++) {
            recipesData.push(Object.assign({}, ...rows[i].cols));
        }
        console.log('RecipesData', recipesData);
        recipesData.find((item) => {
            this.recipes.find((rcp) => {
                if (item.Recipe == rcp.rcpid) {
                    item['uom'] = rcp.uom;
                    item['RecipeName'] =
                        item.Recipe + '-' + item.recname + '-' + rcp.tname;
                }
            });
        });

        let temp: any[] = [];
        let othersTemp: any[] = [];

        recipesData.find((row) => {
            let obj: any = {};

            obj['Recipe'] = row.Recipe;
            obj['RecipeName'] = row.RecipeName;
            obj['TotalReqQty'] = row.TotalReqQty;
            obj['uom'] = row.uom;
            obj['GroupId'] = row.GroupId;
            obj['EventItemsId'] = row.EventItemsId;
            obj['isItemsReady'] = row.isItemsReady;
            obj['isRcpCooked'] = row.isRcpCooked;
            obj['isPacked'] = row.isPacked;
            temp.push(obj);
        });

        console.log(temp);
        for (let i in temp) {
            if (temp[i].uom == 'gms' || temp[i].uom == 'ml') {
                if (temp[i].TotalReqQty >= 1000) {
                    temp[i]['newTotalReqQty'] = temp[i].TotalReqQty / 1000;
                    if (temp[i].uom == 'gms') temp[i].uom = 'Kgs';
                    else if (temp[i].uom == 'ml') temp[i].uom = 'L';
                } else {
                    temp[i]['newTotalReqQty'] = temp[i].TotalReqQty;
                }
            } else {
                temp[i]['newTotalReqQty'] = temp[i].TotalReqQty;
            }
        }
        let name = [];
        let eventdate = [];
        this.eventNameArray = [];

        events.forEach((item) => {
            eventdate.push(item.eventdate);
            name.push(item?.type);
            this.eventNameArray.push(item?.keventname);
        });
        let eventnamestring = [...new Set(this.eventNameArray)];
        this.eventName = eventnamestring.toString();
        let eventType = [...new Set(name)];
        let eventdatestring = [...new Set(eventdate)];
        this.eventDate = eventdatestring.toString();
        this.allArrayEvents.forEach((data) => {
            if (data.type === type) {
                data.data = temp;
                data.eventNames = this.eventName;
                data.events = events;
            }
        });
        this.AllIngredients(events, type);
    }
    async AllIngredients(events, type) {
        let rcpIngr = [];
        this.prePrepTypeOne = [];
        this.prePrepTypeTwo = [];
        let getIngrRespTypeOne = await this.naviService.fetchRequestPost(
            'keventheader/getEventIngredientsByPlatters',
            events
        );
        rcpIngr = getIngrRespTypeOne['eventDetailsList'];

        let pasteIngr = [];
        let pasteingrOneresp = await this.naviService.fetchRequestPost(
            'keventheader/getEventRcpPreparation',
            events
        );
        pasteIngr = pasteingrOneresp['eventDetailsList'];

        rcpIngr.forEach((row) => {
            this.teluguNameProducts.forEach((prod) => {
                if (row.itemid == prod.prodId) row['tname'] = prod?.tname;
            });
        });
        rcpIngr = this.SortIngr(rcpIngr);
        // first show highest quantity
        rcpIngr = this.SortIngrByQuantity(rcpIngr);

        rcpIngr.forEach((row) => {
            if (row.uom == 'gms' || row.uom == 'ml') {
                if (row.totalQuantity >= 1000) {
                    if (Math.abs(row.balance) >= 1000) {
                        row.formattedBal = row.balance / 1000;
                        row.formattedBal = row.formattedBal.toFixed(2);
                    }
                    row.totalQuantity = row.totalQuantity / 1000;
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    row.formattedBal = row.balance.toFixed(2);
                }
            } else {
                row.totalQuantity = row.totalQuantity.toFixed(2);
                row.formattedBal = row.balance.toFixed(2);
            }
        });

        rcpIngr.forEach((ingr) => {
            ingr.prodImage = `${ingr.itemid}.webp`;
        });
        pasteIngr = this.SortIngr(pasteIngr);
        pasteIngr = this.SortIngrByQuantity(pasteIngr);
        pasteIngr.forEach((row) => {
            if (row.uom == 'gms' || row.uom == 'ml') {
                if (row.totalQuantity >= 1000) {
                    if (Math.abs(row.balance) >= 1000) {
                        row.formattedBal = row.balance / 1000;
                        row.formattedBal = row.formattedBal.toFixed(2);
                    }
                    row.totalQuantity = row.totalQuantity / 1000;
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    row.formattedBal = row.balance.toFixed(2);
                }
            } else {
                row.totalQuantity = row.totalQuantity.toFixed(2);
                row.formattedBal = row.balance.toFixed(2);
            }
        });
        pasteIngr.forEach((ingr) => {
            ingr.prodImage = `${ingr.itemid}.webp`;
        });

        this.allArrayEvents.forEach((item) => {
            if (item.type == type) {
                item.ingredients.forEach((ingrtype) => {
                    ingrtype.ingredientsArray = rcpIngr.filter((data) => {
                        return data.category === ingrtype.type;
                    });
                });
            }
        });
    }
    async AllRcpIngredients(events, type) {
        let rcpIngr = [];
        this.prePrepTypeOne = [];
        this.prePrepTypeTwo = [];
        let getIngrRespTypeOne = await this.naviService.fetchRequestPost(
            'keventheader/getEventIngredientsByPlatters',
            events
        );
        rcpIngr = getIngrRespTypeOne['eventDetailsList'];

        let pasteIngr = [];
        let pasteingrOneresp = await this.naviService.fetchRequestPost(
            'keventheader/getEventRcpPreparation',
            events
        );
        pasteIngr = pasteingrOneresp['eventDetailsList'];

        rcpIngr.forEach((row) => {
            this.teluguNameProducts.forEach((prod) => {
                if (row.itemid == prod.prodId) row['tname'] = prod?.tname;
            });
        });
        rcpIngr = this.SortIngr(rcpIngr);
        // first show highest quantity
        rcpIngr = this.SortIngrByQuantity(rcpIngr);

        rcpIngr.forEach((row) => {
            if (row.uom == 'gms' || row.uom == 'ml') {
                if (row.totalQuantity >= 1000) {
                    if (Math.abs(row.balance) >= 1000) {
                        row.formattedBal = row.balance / 1000;
                        row.formattedBal = row.formattedBal.toFixed(2);
                    }
                    row.totalQuantity = row.totalQuantity / 1000;
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    row.formattedBal = row.balance.toFixed(2);
                }
            } else {
                row.totalQuantity = row.totalQuantity.toFixed(2);
                row.formattedBal = row.balance.toFixed(2);
            }
        });

        rcpIngr.forEach((ingr) => {
            ingr.prodImage = `${ingr.itemid}.webp`;
        });
        pasteIngr = this.SortIngr(pasteIngr);
        pasteIngr = this.SortIngrByQuantity(pasteIngr);
        pasteIngr.forEach((row) => {
            if (row.uom == 'gms' || row.uom == 'ml') {
                if (row.totalQuantity >= 1000) {
                    if (Math.abs(row.balance) >= 1000) {
                        row.formattedBal = row.balance / 1000;
                        row.formattedBal = row.formattedBal.toFixed(2);
                    }
                    row.totalQuantity = row.totalQuantity / 1000;
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    row.formattedBal = row.balance.toFixed(2);
                }
            } else {
                row.totalQuantity = row.totalQuantity.toFixed(2);
                row.formattedBal = row.balance.toFixed(2);
            }
        });
        pasteIngr.forEach((ingr) => {
            ingr.prodImage = `${ingr.itemid}.webp`;
        });
        if (type === 'One') {
            this.typeOneVegetables = rcpIngr.filter((item) => {
                if (item?.category == 'Vegetables') return item;
            });

            this.typeOneGroceries = rcpIngr.filter((item) => {
                if (item?.category == 'Groceries') return item;
            });

            this.typeOneNonVeg = rcpIngr.filter((item) => {
                if (item?.category == 'Non Veg') return item;
            });

            this.typeOneOthers = rcpIngr.filter((item) => {
                if (item?.category == 'Others') return item;
            });
            // this.typeOnePaste = pasteIngr.filter((item) => {
            //     if (item?.style == 'Paste') return item;
            // });
            this.typeOnePaste = pasteIngr;
            let object = {
                paste: this.typeOneName + ' Pre preparation',
            };
            // for adding paste to the recipes list
            this.typeOneRecipes.unshift(object);
            console.log('Type one Paste:', this.typeOnePaste);
            this.typeOnePaste.forEach((pasteItem) => {
                this.teluguNameProducts.forEach((prod) => {
                    if (pasteItem.itemid == prod.prodId) {
                        pasteItem['tname'] = prod.tname;
                    }
                });
            });
            let tempArray = [];
            this.typeOnePaste.forEach((paste) => {
                if (paste.style != null) tempArray.push(paste.style);
            });
            let finalArrayPrepNames = [...new Set(tempArray)];
            let prepGroupDefNames = this.groupingPastesDefaultList;
            // for telugu and hindi grouping names
            let finalNameWithAllLang = [];
            prepGroupDefNames.forEach((maingroup) => {
                finalArrayPrepNames.forEach((group) => {
                    if (maingroup.id == group) {
                        finalNameWithAllLang.push(maingroup);
                    }
                });
            });
            console.log('names list ', finalArrayPrepNames);
            finalNameWithAllLang.forEach((obj) => {
                let newobj = {
                    itemsList: [],
                    name: obj.name,
                    id: obj.id,
                    isChildActive: true,
                };

                this.prePrepTypeOne.push(newobj);
            });
            this.prePrepTypeOne.forEach((obj) => {
                this.typeOnePaste.forEach((type) => {
                    if (obj.id === type.style) {
                        obj.itemsList.push(type);
                    }
                });
            });
            // this.tempAllEventRcpIngr = JSON.parse(
            //     JSON.stringify(this.allEventRcpIngr)
            // );
            // for addding quantity of paste items to vegetables
        } else if (type === 'Two') {
            this.typeTwoVegetables = rcpIngr.filter((item) => {
                if (item?.category == 'Vegetables') return item;
            });
            this.typeTwoGroceries = rcpIngr.filter((item) => {
                if (item?.category == 'Groceries') return item;
            });
            this.typeTwoNonVeg = rcpIngr.filter((item) => {
                if (item?.category == 'Non Veg') return item;
            });
            this.typeTwoOthers = rcpIngr.filter((item) => {
                if (item?.category == 'Others') return item;
            });
            // this.typeTwoPaste = pasteIngr.filter((item) => {
            //     if (item?.style == 'Paste') return item;
            // });
            this.typeTwoPaste = pasteIngr;
            let object = {
                paste: this.typeTwoName + ' Pre preparation',
            };
            // for adding paste to the recipes list
            this.typeTwoRecipes.unshift(object);
            this.typeTwoPaste.forEach((pasteItem) => {
                this.teluguNameProducts.forEach((prod) => {
                    if (pasteItem.itemid == prod.prodId) {
                        pasteItem['tname'] = prod.tname;
                    }
                });
            });
            let tempArray = [];
            this.typeTwoPaste.forEach((paste) => {
                if (paste.style != null) tempArray.push(paste.style);
            });
            let finalArrayPrepNames = [...new Set(tempArray)];
            let prepGroupDefNames = this.groupingPastesDefaultList;
            // for telugu and hindi grouping names
            let finalNameWithAllLang = [];
            prepGroupDefNames.forEach((maingroup) => {
                finalArrayPrepNames.forEach((group) => {
                    if (maingroup.id == group) {
                        finalNameWithAllLang.push(maingroup);
                    }
                });
            });
            console.log('names list ', finalArrayPrepNames);
            finalNameWithAllLang.forEach((obj) => {
                let newobj = {
                    itemsList: [],
                    name: obj.name,
                    id: obj.id,
                    isChildActive: true,
                };

                this.prePrepTypeTwo.push(newobj);
            });

            this.prePrepTypeTwo.forEach((obj) => {
                this.typeTwoPaste.forEach((type) => {
                    if (obj.id === type.style) {
                        obj.itemsList.push(type);
                    }
                });
            });
            // for addding quantity of paste items to vegetables
        }

        console.log(this.typeTwoRcpIngr);
        console.log(this.typeTwoNonVeg);
    }
    async OnStatusChange(value, rcp) {
        rcp.isItemsReady = value.target.checked;
        console.log(value);
        const payload = {
            rcpid: rcp.Recipe,
            eventdate: this.eventDate,
            type: rcp.type,
            isitemready: value.target.checked,
            isrcpcooked: null,
            isrcppacked: null,
        };
        console.log('Payload', payload);
        const resp = await this.naviService.fetchRequestPost(
            'keventheaderitems/updatercpstage',
            payload
        );
    }
    OnPastePress(modal, type) {
        this.isTypeOne = false;
        this.isTypeTwo = false;
        this.modalReference = this.dialog.open(modal);
        if (type === 'One') this.isTypeOne = true;
        if (type === 'Two') this.isTypeTwo = true;
    }
    async OnSearch() {
        this.allArrayEvents = [
            {
                type: 'Tiffins',
                data: [],
                ingredients: [],
                eventNames: '',
                events: [],
            },
            {
                type: 'Lunch',
                data: [],
                ingredients: [],
                eventNames: '',
                events: [],
            },
            {
                type: 'Snacks',
                data: [],
                ingredients: [],
                eventNames: '',
                events: [],
            },
            {
                type: 'Dinner',
                data: [],
                ingredients: [],
                eventNames: '',
                events: [],
            },
        ];
        this.isAllEvents = false;
        this.typeOneVegetables = [];
        this.typeOneGroceries = [];
        this.typeOneNonVeg = [];
        this.typeOnePaste = [];
        this.typeOneOthers = [];
        this.typeTwoVegetables = [];
        this.typeTwoGroceries = [];
        this.typeTwoNonVeg = [];
        this.typeTwoPaste = [];
        this.typeTwoOthers = [];
        this.typeOneRecipes = [];
        this.typeTwoRecipes = [];
        let allEvents = [];
        let todayEvents = [];
        let tomorrowEvents = [];
        todayEvents = this.todayEvents;
        tomorrowEvents = this.tomorrowEvents;
        // if tomorrow events and today events
        if (this.evtCatCtrl.value != '' && this.evtCatCtrl.value != null) {
            console.log('inside');
            todayEvents = this.todayEvents.filter((data) => {
                return data.category === this.evtCatCtrl.value;
            });
            tomorrowEvents = this.tomorrowEvents.filter((data) => {
                return data.category === this.evtCatCtrl.value;
            });
        }

        if (this.eventsList.value?.length > 0) {
            console.log('events', this.eventsList.value);
            let events = this.eventsList.value;
            let selectedEvents = this.selectedEvents.filter((data) =>
                events.some((obj) => data.keventid === obj.keventid)
            );
            if (this.evtCatCtrl.value != '' && this.evtCatCtrl.value != null) {
                selectedEvents = selectedEvents.filter((data) => {
                    return data.category == this.evtCatCtrl.value;
                });
            }
            // const formattedDate = formatDate(
            //     this.eventDateControl.value,
            //     'YYYY-MM-dd',
            //     this.locale
            // );
            // const evtPayload = {
            //     startDate: formattedDate,
            //     endDate: formattedDate,
            // };
            // let getResp = await this.naviService.fetchRequestPost(
            //     'keventheader/geteventbydate',
            //     evtPayload
            // );
            // allEvents = getResp['keventheaderList'];
            // let events = allEvents;
            // events = events.filter((obj) => {
            //     return (
            //         obj.eventdate === formattedDate &&
            //         obj.category === 'Catering'
            //     );
            // });
            // console.log(events);
            if (this.categoryControl.value) {
                if (this.categoryControl.value === 'All') {
                    this.isAllEvents = true;
                    const ingrArray = [
                        {
                            type: 'Vegetables',
                            ingredientsArray: [],
                        },
                        {
                            type: 'Groceries',
                            ingredientsArray: [],
                        },
                        {
                            type: 'Non Veg',
                            ingredientsArray: [],
                        },
                        {
                            type: 'Others',
                            ingredientsArray: [],
                        },
                    ];
                    this.allArrayEvents.forEach((item) => {
                        item.ingredients = ingrArray;
                    });
                    selectedEvents.forEach((eventdata) => {
                        this.allArrayEvents.forEach((event) => {
                            if (eventdata.type == event.type) {
                                event.events.push(eventdata);
                            }
                        });
                    });
                    this.allArrayEvents.forEach((event) => {
                        if (event.events?.length > 0) {
                            this.AllRecipesData(event.events, event.type);
                        }
                    });
                } else {
                    let type = this.categoryControl.value;
                    this.GetMorningOrEveningData(type, 'empty', selectedEvents);
                }
            } else {
                // this.EventType = JSON.stringify(temp);
                this.TimeLogic(selectedEvents);
            }
            return;
        } else {
            if (this.todayOrTomorrowControl.value === 'Today') {
                if (this.categoryControl.value) {
                    let type = this.categoryControl.value;
                    this.GetMorningOrEveningData(type, 'empty', todayEvents);
                } else {
                    this.TimeLogic(todayEvents);
                }
            } else {
                if (this.categoryControl.value) {
                    let type = this.categoryControl.value;
                    this.GetMorningOrEveningData(type, 'empty', tomorrowEvents);
                } else {
                    this.TimeLogic(tomorrowEvents);
                }
            }
        }
        // for category filter in events
        if (this.evtCatCtrl.value != '') {
        }
    }
    async TodayTomorrowEventsList() {
        let allEvents = [];
        let currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);

        let tomorrowDate = formatDate(
            new Date().setDate(new Date().getDate() + 1),
            'YYYY-MM-dd',
            this.locale
        );
        console.log(tomorrowDate);
        const evtPayload = {
            startDate: currentDate,
            endDate: tomorrowDate,
            vendorId: this.vendorId,
        };
        let getResp = await this.naviService.fetchRequestPost(
            'keventheader/geteventbydate',
            evtPayload
        );
        allEvents = getResp['keventheaderList'];
        allEvents = allEvents.filter((evt) => {
            return evt.category === 'Catering' || evt.category === 'Kitchen';
        });
        // today EVents
        this.todayEvents = allEvents.filter((event) => {
            return (
                event.status != 'Completed' && event.eventdate === currentDate
            );
        });
        // tomorrow Events
        this.tomorrowEvents = allEvents.filter((event) => {
            return (
                event.status != 'Completed' && event.eventdate === tomorrowDate
            );
        });
    }
    async dateRangeChangeEvents(
        dateRangeStart: HTMLInputElement,
        dateRangeEnd: HTMLInputElement
    ) {
        const sDate = new Date(dateRangeStart.value);
        const eDate = new Date(dateRangeEnd.value);
        let startDate = formatDate(sDate, 'YYYY-MM-dd', this.locale);
        let endDate = formatDate(eDate, 'YYYY-MM-dd', this.locale);
        const payload = {
            startDate,
            endDate,
            vendorId: this.vendorId,
        };
        const resp = await this.naviService.fetchRequestPost(
            'keventheader/geteventbydate',
            payload
        );
        this.selectedEvents = resp['keventheaderList'];
        this.selectedEvents = this.selectedEvents.filter((data) => {
            return data.status != 'Completed';
        });
    }
    TimeLogic(events) {
        // this.EventType = JSON.stringify(temp);
        let currentTime = formatDate(
            new Date().getTime(),
            'HH:mm:ss',
            this.locale
        );
        console.log(currentTime);
        if (currentTime >= '13:00:00' && currentTime < '18:00:00') {
            console.log('Evening');
            this.GetMorningOrEveningData('Snacks', 'Dinner', events);
        } else if (currentTime > '18:00:00' && currentTime < '23:59:59') {
            // for getting events name
            this.GetMorningOrEveningData('Empty', 'Lunch', events);
        } else {
            console.log('Today Morning');
            this.GetMorningOrEveningData('Empty', 'Lunch', events);
        }
    }
    OnShareAll(data) {
        console.log('share all', data);
    }
    OnShare(type: string) {
        let data = [];
        let eventdate: string;
        let eventsName: string;
        let eventsType: string;
        if (type === 'One') {
            data = JSON.parse(JSON.stringify(this.typeOneRecipes));
            eventdate = this.eventDate;
            eventsType = this.typeOneName;
            eventsName = this.typeOneEventName;
        } else {
            data = JSON.parse(JSON.stringify(this.typeTwoRecipes));
            eventdate = this.eventDate;
            eventsName = this.typeTwoEventName;
            eventsType = this.typeTwoName;
        }
        console.log('Type', type);
        console.log('types data to pdf', data);
        data.splice(0, 1);
        let docDefinition = {
            defaultStyle: {
                font: 'telugu', // use your font name here
            },
            content: [
                // Previous configuration
                {
                    text: `Events#: ${eventsName}, Type: ${eventsType}`,
                    fontSize: 17,
                },
                {
                    text: `Event Date: ${eventdate}, Total Items: ${data.length}`,
                    fontSize: 17,
                },
                {
                    table: {
                        headerRows: 1,
                        body: [
                            ['SNo', 'Rcp ID/Name', 'Total Quantity'],
                            ...data.map((p, i) => [
                                i + 1,
                                p.RecipeName,
                                p.newTotalReqQty + ' ' + p.uom,
                            ]),
                        ],
                    },
                },
            ],
        };
        let eventNamesTrim = eventsName.substring(0, 10);
        pdfMake
            .createPdf(docDefinition)
            .download(
                eventdate + '-' + eventsType + '-' + eventNamesTrim + '.pdf'
            );
        console.log(data);
    }
    OnRowClick(row: any, type: string) {
        this.recipes.forEach((rcp) => {
            if (rcp.rcpid === row.Recipe)
                this.recipeInstructions = rcp.instructions;
        });

        this.tempRcpIngr = [];
        this.tempRcpIngr = JSON.parse(JSON.stringify(this.recipeIngredients));
        this.selectedRcpIngredients = [];
        console.log(row);
        let reqQuant: number;
        let calcReqQuant: number;
        let recipeUom: string;

        calcReqQuant = 0;
        reqQuant = 0;

        let recid = row.Recipe;

        let TotalReqQty: number = 0;
        TotalReqQty = parseFloat(row.TotalReqQty);
        this.recipes.find((item) => {
            if (item.Recipe == recid) {
                recipeUom = item.uom;
            }
        });
        console.log();
        reqQuant = TotalReqQty;
        let mainIngrQuant: number | undefined;
        mainIngrQuant = 0;

        console.log(recid);
        // this.modalReference = this.modalService.open(modal);
        this.modalReference = this.dialog.open(this.modal);
        // for getting main ingr quantity
        this.recipes.find((item: any) => {
            if (item.rcpid == recid) {
                mainIngrQuant = item.minquantity;
            }
        });

        for (let i in this.recipes) {
            for (let j in this.tempRcpIngr) {
                if (this.tempRcpIngr[j].rcpid == this.recipes[i].rcpid) {
                    this.tempRcpIngr[j]['rcpname'] = this.recipes[i].name;
                }
            }
        }
        console.log(this.tempRcpIngr);

        this.selectedRcpIngredients = this.tempRcpIngr.filter((item: any) => {
            if (item.rcpid == recid) return item;
        });

        console.log(this.selectedRcpIngredients);
        for (let i in this.teluguNameProducts) {
            for (let j in this.selectedRcpIngredients) {
                if (
                    this.selectedRcpIngredients[j].itemid ==
                    this.teluguNameProducts[i].prodId
                ) {
                    if (this.teluguNameProducts[i]?.tname)
                        this.selectedRcpIngredients[j][
                            'telname'
                        ] = this.teluguNameProducts[i].tname;
                    else this.selectedRcpIngredients[j]['telname'] = null;
                }
            }
        }
        // for changin required quantity to each item

        calcReqQuant = reqQuant / mainIngrQuant;

        let temp = this.selectedRcpIngredients.map((obj) => {
            return { ...obj, quantity: calcReqQuant * obj.quantity };
        });
        this.selectedRcpIngredients = temp;
        this.selectedRcpIngredients.forEach((eachRow) => {
            if (eachRow.uom == 'gms') {
                if (eachRow.quantity >= 1000) {
                    eachRow.uom = 'Kgs';
                }
            } else if (eachRow.uom == 'ml') {
                if (eachRow.quantity >= 1000) {
                    eachRow.uom = 'L';
                }
            } else return eachRow;
        });

        // let temp3 = this.selectedRcpIngredients.map((item) => {
        //     if (item.uom == 'KG' || item.uom == 'L') {
        //         if (item.quantity >= 1000) {
        //             let no = item.quantity / 1000;

        //             return { ...item, quantity: no.toFixed(2) };
        //         } else {
        //             return { ...item, quantity: item.quantity.toFixed(2) };
        //         }
        //     } else {
        //         return { ...item, quantity: item.quantity.toFixed(2) };
        //     }
        // });
        // this.selectedRcpIngredients = temp3;
        this.selectedRcpIngredients.forEach((item) => {
            if (item.uom == 'Kgs' || item.uom == 'L') {
                if (item.quantity >= 1000) {
                    item.quantity = (item.quantity / 1000).toFixed(2);
                } else {
                    item.quantity = item.quantity.toFixed(2);
                }
            } else {
                item.quantity = item.quantity.toFixed(2);
            }
        });
        this.SortRcpIngredients();
    }
    OnClose() {
        this.modalReference.close();
    }
    async OnPack(recipe, type: string) {
        console.log(recipe);
        const payload = {};
        payload['rcpid'] = recipe.Recipe;
        payload['type'] = type;
        const resp = await this.naviService.fetchRequestPost(
            'keventheaderitems/keventrcpdetails',
            payload
        );

        this.recipeDetails = resp['eventDetailsList'];
        this.modalReference = this.dialog.open(this.rcpmodal);
    }
    openQtyModal() {}
    SortRcpIngredients() {
        // first sorting by ascending order
        this.selectedRcpIngredients = this.selectedRcpIngredients.sort(
            (a, b) => {
                const nameA = a.ingrname.toUpperCase(); // ignore upper and lowercase
                const nameB = b.ingrname.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
            }
        );
        let order = ['Groceries', 'Vegetables', 'Non Veg', 'Others'];
        let newArray = [];
        order.forEach((orderitem) => {
            return this.selectedRcpIngredients.filter((ingr) => {
                if (ingr.category === orderitem) newArray.push(ingr);
            });
        });
        this.selectedRcpIngredients = newArray;
        console.log(this.selectedRcpIngredients);
        this.groupIdsList = newArray;
        this.groupIdsList = [
            ...new Map(
                this.groupIdsList.map((ingr) => [ingr['groupid'], ingr])
            ).values(),
        ];
        this.groupIdsList.forEach((ingr) => {
            ingr['groupData'] = [];
            ingr.childActive = true;
        });

        this.groupIdsList.forEach((ingr) => {
            newArray.forEach((ingrtemp) => {
                if (ingr.groupid === ingrtemp.groupid) {
                    ingr.groupData.push(ingrtemp);
                }
            });
        });
        this.groupIdsList = this.groupIdsList.sort((a, b) => {
            if (a?.groupid < b?.groupid) return -1;
            if (a?.groupid > b?.groupid) return 1;
            return 0;
        });
        console.log(this.groupIdsList);
    }

    SortIngr(rcpIngr) {
        rcpIngr.sort((a, b) => {
            const nameA = a.ingrname.toUpperCase(); // ignore upper and lowercase
            const nameB = b.ingrname.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            // names must be equal
            return 0;
        });
        return rcpIngr;
    }
    SortIngrByQuantity(ingr) {
        ingr.sort((a, b) => {
            return b.totalQuantity - a.totalQuantity;
        });
        return ingr;
    }
    AddPasteValues(vegArray, pasteArray) {
        // for addding quantity of paste items to vegetables
        vegArray.forEach((veg) => {
            pasteArray.forEach((paste) => {
                if (paste.itemid === veg.itemid) {
                    if (veg.uom == paste.uom) {
                        veg.totalQuantity =
                            parseFloat(veg.totalQuantity) +
                            parseFloat(paste.totalQuantity);
                        veg.totalQuantity = veg.totalQuantity.toFixed(2);
                    } else {
                        if (veg.uom === 'kgs' && paste.uom == 'gms') {
                            veg.totalQuantity =
                                parseFloat(veg.totalQuantity) * 1000;
                            veg.totalQuantity =
                                parseFloat(veg.totalQuantity) +
                                parseFloat(paste.totalQuantity);
                            if (veg.totalQuantity >= 1000) {
                                veg.totalQuantity = veg.totalQuantity / 1000;
                                veg.totalQuantity = veg.totalQuantity.toFixed(
                                    2
                                );
                            }
                        }
                        if (veg.uom === 'gms' && paste.uom === 'kgs') {
                            paste.totalQuantity =
                                parseFloat(paste.totalQuantity) * 1000;
                            veg.totalQuantity =
                                parseFloat(veg.totalQuantity) +
                                parseFloat(paste.totalQuantity);
                            if (veg.totalQuantity >= 1000) {
                                veg.totalQuantity = veg.totalQuantity / 1000;
                                veg.totalQuantity = veg.totalQuantity.toFixed(
                                    2
                                );
                            }
                        }
                    }
                }
            });
        });
        return vegArray;
    }
}
