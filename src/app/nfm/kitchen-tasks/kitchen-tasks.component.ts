import { formatDate } from '@angular/common';
import {
    Component,
    Inject,
    LOCALE_ID,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
    selector: 'app-kitchen-tasks',
    templateUrl: './kitchen-tasks.component.html',
    styleUrls: ['./kitchen-tasks.component.scss'],
})
export class KitchenTasksComponent implements OnInit {
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
    public typeOneRcpIngr = [];
    public typeTwoRcpIngr = [];
    public recipeDetails = [];
    public eventName: string;
    public eventNameArray = [];
    eventItems = [];
    @ViewChild('modal') modal: TemplateRef<any>;
    @ViewChild('rcpdetailsmodal') rcpmodal: TemplateRef<any>;
    @ViewChild('pasteDetails') pasteDetails: TemplateRef<any>;
    @ViewChild('nvDetails') nvDetails: TemplateRef<any>;
    @ViewChild('eventdetailsModal') eventdetailsModal: TemplateRef<any>;
    private modalReference: MatDialogRef<TemplateRef<any>>;
    private eventModalRef: MatDialogRef<TemplateRef<any>>;
    categoryControl = new FormControl('');
    public categoryData = ['Lunch', 'Dinner', 'Tiffins', 'Snacks'];
    public statusData = ['Open', 'Completed', 'In Progress'];
    public reqQuantity = new FormControl('');
    public opQuantity = new FormControl('');
    public recStatus = new FormControl('');
    eventitemsid: number = 0;
    eventDateControl: FormControl = new FormControl('');
    todayOrTomorrowControl = new FormControl('');
    groupIdsList = [];
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
    ingredientsImagePath = './assets/images/ingredients/';
    rcpSortArray = [];
    globalGrouping = [
        {
            heading: 'KITCHEN',
            array: [],
            active: true,
        },
        {
            heading: 'PURCHASE',
            array: [],
            active: true,
        },
        {
            heading: 'TIFFINS',
            array: [],
            active: true,
        },
        {
            heading: 'SNACKS',
            array: [],
            active: true,
        },
    ];
    globalGroupingOne = [];
    globalGroupingTwo = [];
    recipeInstructions: string = '';
    eventsList: FormControl = new FormControl();
    evtCatCtrl: FormControl = new FormControl();
    catCtrlData = ['Kitchen', 'Event', 'Catering'];
    selectedEvents = [];
    dropdownSettings: IDropdownSettings;
    vendorId = 0;
    constructor(
        private naviService: ProjectService,
        @Inject(LOCALE_ID) public locale: string,
        private dialog: MatDialog
    ) {}

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
        this.categoryControl.setValue('All');
        let todayDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        let tomorrowDate = formatDate(
            new Date().setDate(new Date().getDate() + 1),
            'YYYY-MM-dd',
            this.locale
        );
        const eventPayload = {
            startDate: todayDate,
            endDate: tomorrowDate,
            vendorId: this.vendorId,
        };
        const getResp = await this.naviService.fetchRequestPost(
            'keventheader/geteventbydate',
            eventPayload
        );
        this.events = getResp['keventheaderList'];
        this.tempEvents = this.events;
        // For Recipes
        let recpResp = await this.naviService.fetchRequest(
            'rcpheader/getAllrcpheader'
        );
        this.recipes = recpResp['rcpheaderList'];
        // sort array and grouping
        const sortRcpResp = await this.naviService.fetchRequest(
            'catdropdown/getAllRcpCategory'
        );
        this.rcpSortArray = sortRcpResp;
        this.rcpSortArray.forEach((rcp) => {
            rcp['disabled'] = true;
            rcp['childArrayActive'] = true;
            rcp['relatedKitchenData'] = [];
            rcp['relatedOthersData'] = [];
        });
        // for pushing matched id rcps to this array
        this.globalGrouping.forEach((obj) => {
            this.rcpSortArray.forEach((sortObj) => {
                if (obj.heading === sortObj.rcpPrepName) {
                    obj.array.push(sortObj);
                }
            });
        });

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
        const currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        console.log(currentDate);
        this.events = this.events.filter((item: any) => {
            if (
                item.eventdate == currentDate &&
                (item.category == 'Catering' || item.category === 'Kitchen')
            )
                return item;
        });
        // for getting events name
        let eventname = [];
        this.events.forEach((evt) => {
            eventname.push(evt.keventname);
        });
        let eventnamestring = [...new Set(eventname)];
        this.eventName = eventnamestring.toString();

        // this.EventType = JSON.stringify(temp);
        let currentTime = formatDate(
            new Date().getTime(),
            'HH:mm:ss',
            this.locale
        );
        console.log(currentTime);
        if (currentTime >= '13:00:00' && currentTime < '18:00:00') {
            console.log('Evening');
            this.GetMorningOrEveningData('Empty', 'Dinner');
        } else if (currentTime > '18:00:00' && currentTime < '23:59:59') {
            console.log('Tommorrow Morning');
            let date = new Date();
            let todate = date.getDate() + 1;
            date.setDate(todate);
            console.log(date);
            let tommorrowdate = formatDate(date, 'YYYY-MM-dd', this.locale);
            console.log(tommorrowdate);
            this.events = this.tempEvents;
            this.events = this.events.filter((item) => {
                if (
                    item.eventdate == tommorrowdate &&
                    (item.category == 'Catering' || item.category == 'Kitchen')
                )
                    return item;
            });
            // for getting events name
            let eventname = [];
            this.events.forEach((evt) => {
                eventname.push(evt.keventname);
            });
            let eventnamestring = [...new Set(eventname)];
            this.eventName = eventnamestring.toString();
            this.GetMorningOrEveningData('Lunch', 'Empty');
        } else {
            console.log('Today Morning');
            this.GetMorningOrEveningData('Lunch', 'Empty');
        }
    }
    async GetMorningOrEveningData(type1: String, type2: String) {
        this.headingArray = [];
        this.keys = [];
        this.eventReports = [];
        this.typeOneNonVeg = [];
        this.typeTwoNonVeg = [];
        this.prePrepTypeOne = [];
        this.prePrepTypeTwo = [];
        let eventItemsPayload = [];
        if (this.events.length > 0) {
            this.events.forEach((item: any) => {
                eventItemsPayload.push(item.keventid);
                if (item?.type == type1) {
                    this.typeOneEvents.push(item);
                } else if (item?.type == type2) {
                    this.typeTwoEvents.push(item);
                }
            });
            const eventItems = await this.naviService.fetchRequestPost(
                'keventheaderitems/getSelectedEventItems',
                eventItemsPayload
            );
            this.eventItems = eventItems['keventheaderitemsList'];
            this.eventItems.forEach((item) => {
                this.recipes.forEach((rcp) => {
                    if (item.recid === rcp.rcpid) item.recipeName = rcp.name;
                });
            });
        }
        if (this.typeOneEvents.length > 0) {
            let pasteIngr = await this.EventBasedRcpData(
                'One',
                this.typeOneEvents
            );
            // for type
            this.typeOneRecipes.forEach((rcp) => {
                rcp['type'] = this.typeOneName;
            });

            let tempArray = [];
            pasteIngr.forEach((ingr) => {
                ingr['prodImage'] = `${ingr.itemid}.webp`;
                if (ingr.style != null) tempArray.push(ingr.style);
            });

            let finalArrayPrepNames = [...new Set(tempArray)];
            let prepGroupDefNames = this.groupingPastesDefaultList;
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
                pasteIngr.forEach((type) => {
                    if (obj.id === type.style) {
                        obj.itemsList.push(type);
                    }
                });
            });
            let object = {
                rcpCatId: -1,
                rcpCatName: finalArrayPrepNames.toString(),
                rcpPrepName: 'KITCHEN',
                sequence: -2,
                disabled: false,
            };

            let nvObj = {
                rcpCatId: -2,
                rcpCatName: 'Non Veg Items',
                rcpPrepName: 'KITCHEN',
                sequence: -1,
                disabled: false,
            };

            // for adding paste to the recipes list
            this.globalGroupingOne.forEach((group) => {
                if (group.heading == 'KITCHEN') {
                    group.array.unshift(object, nvObj);
                }
            });

            console.log(this.typeOneRecipes);
            console.log(this.events);
            this.typeOneEvents = this.EachEventsData(
                this.typeOneEvents,
                this.eventItems
            );
        }
        if (this.typeTwoEvents.length > 0) {
            let pasteIngr = await this.EventBasedRcpData(
                'Two',
                this.typeTwoEvents
            );
            this.typeTwoRecipes.forEach((rcp) => {
                rcp['type'] = this.typeTwoName;
            });
            let tempArray = [];

            pasteIngr.forEach((paste) => {
                if (paste.style != null) tempArray.push(paste.style);
            });
            let finalArrayPrepNames = [...new Set(tempArray)];
            let prepGroupDefNames = this.groupingPastesDefaultList;
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
                pasteIngr.forEach((type) => {
                    if (obj.id === type.style) {
                        obj.itemsList.push(type);
                    }
                });
            });
            let object = {
                rcpCatId: -1,
                rcpCatName: finalArrayPrepNames.toString(),
                rcpPrepName: 'KITCHEN',
                sequence: -2,
                disabled: false,
            };
            let nvObj = {
                rcpCatId: -2,
                rcpCatName: 'Non Veg Items',
                rcpPrepName: 'KITCHEN',
                sequence: -2,
                disabled: false,
            };
            // for adding paste to the recipes list
            // for adding paste to the recipes list
            this.globalGroupingTwo.forEach((group) => {
                if (group.heading == 'KITCHEN') {
                    group.array.unshift(object, nvObj);
                }
            });

            console.log(this.typeTwoRecipes);
            console.log(this.events);
        }
        this.typeTwoEvents = this.EachEventsData(
            this.typeTwoEvents,
            this.eventItems
        );
    }
    evtCatChange(event) {
        let value = event.target.value;
        let allEvents = (this.selectedEvents = this.selectedEvents.filter(
            (event) => {
                return event.category === value;
            }
        ));
        this.selectedEvents = allEvents;
    }
    OnRowClick(row: any, type: string) {
        if (
            row?.rcpCatId == undefined &&
            row?.rcpCatId != -1 &&
            row?.rcpCatId != -2
        ) {
            this.recipes.forEach((rcp) => {
                if (rcp.rcpid === row.Recipe)
                    this.recipeInstructions = rcp.instructions;
            });

            this.tempRcpIngr = [];
            this.tempRcpIngr = JSON.parse(
                JSON.stringify(this.recipeIngredients)
            );
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

            this.selectedRcpIngredients = this.tempRcpIngr.filter(
                (item: any) => {
                    if (item.rcpid == recid) return item;
                }
            );

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
        } else {
            if (row?.rcpCatId === -1) {
                this.isTypeOne = false;
                this.isTypeTwo = false;
                this.modalReference = this.dialog.open(this.pasteDetails);
                if (type === 'One') this.isTypeOne = true;
                if (type === 'Two') this.isTypeTwo = true;
            } else if (row?.rcpCatId === -2) {
                this.modalReference = this.dialog.open(this.nvDetails);
            }
        }
    }
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
    async EventBasedRcpData(type, events) {
        let rcpIngr = [];
        let getIngrRespTypeOne = await this.naviService.fetchRequestPost(
            'keventheader/getEventIngredientsByPlatters',
            events
        );
        rcpIngr = getIngrRespTypeOne['eventDetailsList'];
        rcpIngr.forEach((row) => {
            this.teluguNameProducts.forEach((prod) => {
                if (row.itemid == prod.prodId) row['tname'] = prod?.tname;
            });
            row['prodImage'] = `${row.itemid}.webp`;
        });
        rcpIngr.forEach((row) => {
            if (row.uom == 'gms' || row.uom == 'ml') {
                if (row.totalQuantity >= 1000) {
                    if (row.balance >= 1000 || row.balance <= 0) {
                        row.balance = row.balance / 1000;
                        row.balance = row.balance.toFixed(2);
                    }
                    row.totalQuantity = row.totalQuantity / 1000;
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    row.balance = row.balance.toFixed(2);
                }
            } else {
                row.totalQuantity = row.totalQuantity.toFixed(2);
                row.balance = row.balance.toFixed(2);
            }
        });

        const reportResp = await this.naviService.fetchRequestPost(
            'keventheaderitems/eventrecipeslist',
            events
        );
        let pasteIngr = [];
        let pasteingrOneresp = await this.naviService.fetchRequestPost(
            'keventheader/getEventRcpPreparation',
            events
        );
        pasteIngr = pasteingrOneresp['eventDetailsList'];
        pasteIngr.forEach((pasteItem) => {
            this.teluguNameProducts.forEach((prod) => {
                if (pasteItem.itemid == prod.prodId) {
                    pasteItem['tname'] = prod.tname;
                }
            });
        });
        pasteIngr.forEach((row) => {
            if (row.uom == 'gms' || row.uom == 'ml') {
                if (row.totalQuantity >= 1000) {
                    if (row.balance >= 1000 || row.balance <= 0) {
                        row.balance = row.balance / 1000;
                        row.balance = row.balance.toFixed(2);
                    }
                    row.totalQuantity = row.totalQuantity / 1000;
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    row.balance = row.balance.toFixed(2);
                }
            } else {
                row.totalQuantity = row.totalQuantity.toFixed(2);
                row.balance = row.balance.toFixed(2);
            }
        });
        this.EventNameAndDateMethod('One', events);
        let rows = reportResp['rows'];
        this.headingArray = reportResp['cols'];
        this.keys = reportResp['keys'];
        this.keys.splice(-1);

        this.headingArray.splice(0, 0, 'SNo');
        let length = this.headingArray.length - 3;
        this.headingArray.splice(length, 3);

        console.log(this.headingArray);
        let recipesData = [];
        for (let i = 0; i < rows.length; i++) {
            recipesData.push(Object.assign({}, ...rows[i].cols));
        }
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
            // if (row.Category == 'Kitchen') {
            obj['Recipe'] = row.Recipe;
            obj['RecipeName'] = row.RecipeName;
            obj['TotalReqQty'] = row.TotalReqQty;
            obj['TotalOutputQty'] = row.TotalOutputQty;
            obj['uom'] = row.uom;
            obj['isItemsReady'] = row.isItemsReady;
            obj['isRcpCooked'] = row.isRcpCooked;
            obj['isPacked'] = row.isPacked;
            obj['prepCat'] = row.PrepCategory;
            obj['groupName'] = row.RcpCategory;
            temp.push(obj);
            // } else if (row.Category == 'Others') {
            //     obj['Recipe'] = row.Recipe;
            //     obj['RecipeName'] = row.RecipeName;
            //     obj['TotalReqQty'] = row.TotalReqQty;
            //     obj['TotalOutputQty'] = row.TotalOutputQty;
            //     obj['uom'] = row.uom;
            //     obj['isItemsReady'] = row.isItemsReady;
            //     obj['isRcpCooked'] = row.isRcpCooked;
            //     obj['isPacked'] = row.isPacked;
            //     obj['prepCat'] = row.PrepCategory;
            //     obj['groupName'] = row.RcpCategory;
            //     othersTemp.push(obj);
            // }
        });
        if (type == 'One') {
            this.typeOneNonVeg = rcpIngr.filter((item) => {
                if (item?.category == 'Non Veg') return item;
            });
            this.typeOneRecipes = temp;
            this.AllGroupingByCategory('One', this.typeOneRecipes);
        } else {
            this.typeTwoNonVeg = rcpIngr.filter((item) => {
                if (item?.category == 'Non Veg') return item;
            });
            this.typeTwoRecipes = temp;
            this.AllGroupingByCategory('Two', this.typeTwoRecipes);
        }
        return pasteIngr;
    }
    AllGroupingByCategory(type, array) {
        this.globalGrouping.forEach((group) => {
            group.array.forEach((subgroup) => {
                subgroup.relatedKitchenData = [];
            });
        });
        console.log('group', array);
        array.forEach((rcpObj) => {
            this.globalGrouping.forEach((globalObj) => {
                if (rcpObj.prepCat === globalObj.heading) {
                    globalObj.array.forEach((subGroupObj) => {
                        if (subGroupObj.rcpCatName === rcpObj.groupName) {
                            subGroupObj.relatedKitchenData.push(rcpObj);
                        }
                    });
                }
            });
        });
        this.globalGrouping.forEach((group) => {
            group.array.forEach((subgroup) => {
                if (subgroup.relatedKitchenData.length == 0) {
                    subgroup.disabled = true;
                } else if (subgroup.relatedKitchenData.length > 0) {
                    subgroup.disabled = false;
                }
            });
        });
        if (type == 'One') {
            this.typeOneRecipes = array;
            this.globalGroupingOne = this.globalGrouping;
            console.log(this.globalGroupingOne[0].array[0]);
        } else {
            this.typeTwoRecipes = array;
            this.globalGroupingTwo = this.globalGrouping;
        }
        // disabling the objects
        console.log(this.globalGrouping);
    }
    async OnStatusChange(value, rcp) {
        rcp.isItemsReady = value.target.checked;
        console.log(value);
        const payload = {
            rcpid: rcp.Recipe,
            eventdate: this.eventDate,
            type: rcp.type,
            isitemready: null,
            isrcpcooked: value.target.checked,
            isrcppacked: null,
        };
        console.log('Payload', payload);
        const resp = await this.naviService.fetchRequestPost(
            'keventheaderitems/updatercpstage',
            payload
        );
    }
    EventNameAndDateMethod(type: string, eventsArray) {
        let typeOneName = [];
        let eventdate = [];
        this.eventNameArray = [];
        eventsArray.forEach((item) => {
            eventdate.push(item.eventdate);
            typeOneName.push(item?.type);
            this.eventNameArray.push(item?.keventname);
        });
        let eventnamestring = [...new Set(this.eventNameArray)];
        this.eventName = eventnamestring.toString();
        let typeOneEventType = [...new Set(typeOneName)];
        let eventdatestring = [...new Set(eventdate)];
        if (type == 'One') {
            this.eventDate = eventdatestring.toString();
            this.typeOneName = typeOneEventType.toString();
        } else {
            this.eventDate = eventdatestring.toString();
            this.typeTwoName = typeOneEventType.toString();
        }
    }
    async OnStatusClick(row, statusValue) {
        console.log(row);
        console.log(statusValue);
        if (statusValue != row.status) {
            const payload = row;
            payload.status = statusValue;
            const saveResp = await this.naviService.fetchRequestPost(
                'keventheader/createkeventheader',
                payload
            );
            if (statusValue === 'Preparation') {
                const prepPayload = {};
                prepPayload['eventdate'] = row.eventdate;
                prepPayload['keventid'] = row.keventid;
                prepPayload['eventtype'] = row.type;
                const preparationResp = await this.naviService.fetchRequestPost(
                    'recipepreparation/setpreparationdata',
                    prepPayload
                );
            }
            this.OnSearch();
        }
    }
    // OnSearch() {
    //     let value = this.categoryControl.value;
    //     console.log(value);
    //     let events = this.tempEvents;
    //     this.typeOneRecipes = [];
    //     this.typeTwoRecipes = [];
    //     this.typeOneVegetables = [];
    //     this.typeOneGroceries = [];
    //     this.typeOneNonVeg = [];
    //     this.typeOneOthers = [];
    //     this.typeTwoVegetables = [];
    //     this.typeTwoGroceries = [];
    //     this.typeTwoNonVeg = [];
    //     this.typeTwoOthers = [];
    //     this.typeOneEvents = [];
    //     this.typeTwoEvents = [];
    //     if (value != 'All') {
    //         this.TimeLogic(value, events);
    //     } else {
    //         this.ngOnInit();
    //     }
    // }
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
    async OnSearch() {
        let allEvents = [];
        let todayEvents = [];
        let tomorrowEvents = [];
        this.typeOneEvents = [];
        this.typeTwoEvents = [];
        this.typeOneRecipes = [];
        this.typeTwoRecipes = [];
        let currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        let tomorrowDate = formatDate(
            new Date().setDate(new Date().getDate() + 1),
            'YYYY-MM-dd',
            this.locale
        );
        const payload = {
            startDate: currentDate,
            endDate: tomorrowDate,
            vendorId: this.vendorId,
        };
        const getResp = await this.naviService.fetchRequestPost(
            'keventheader/geteventbydate',
            payload
        );
        allEvents = getResp['keventheaderList'];
        this.tempEvents = allEvents;
        allEvents = allEvents.filter((evt) => {
            return evt.category === 'Catering' || evt.category === 'Kitchen';
        });
        todayEvents = allEvents.filter((event) => {
            return (
                event.status != 'Completed' && event.eventdate === currentDate
            );
        });
        tomorrowEvents = allEvents.filter((event) => {
            return (
                event.status != 'Completed' && event.eventdate === tomorrowDate
            );
        });
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
                this.events = selectedEvents;
                let type = this.categoryControl.value;
                this.GetMorningOrEveningData(type, 'empty');
            } else {
                this.events = selectedEvents;
                // this.EventType = JSON.stringify(temp);
                this.TimeLogic();
            }
            return;
        }
        if (this.todayOrTomorrowControl.value === 'Today') {
            this.events = todayEvents;
            if (this.categoryControl.value) {
                let type = this.categoryControl.value;
                this.GetMorningOrEveningData(type, 'empty');
            } else {
                this.TimeLogic();
            }
        } else {
            this.events = tomorrowEvents;
            if (this.categoryControl.value) {
                let type = this.categoryControl.value;
                this.GetMorningOrEveningData(type, 'empty');
            } else {
                this.TimeLogic();
            }
        }
    }
    OnEventItemPress(eventdetailsModal, row) {
        this.eventitemsid = row.eventitemsid;
        this.eventModalRef = this.dialog.open(eventdetailsModal);
        this.reqQuantity.setValue(row.platterscount);
        this.opQuantity.setValue(row.outputqty);
        this.recStatus.setValue(row.recstatus);
    }
    async OnSave() {
        let payload = {};
        let eventItems = [];
        this.eventItems.forEach((obj) => {
            if (obj.eventitemsid === this.eventitemsid) {
                payload = obj;
                if (this.recStatus.value === 'Completed') obj.checked = true;
                else obj.checked = false;
            }
        });
        payload['platterscount'] = this.reqQuantity.value;
        payload['outputqty'] = this.opQuantity.value;
        payload['recstatus'] = this.recStatus.value;

        const saveResp = await this.naviService.fetchRequestPost(
            'keventheaderitems/createkeventheaderitems',
            payload
        );
        this.eventItems.forEach((item) => {
            if (item.eventitemsid === payload['eventitemsid']) {
                item.platterscount = this.reqQuantity.value;
                item.outputqty = this.opQuantity.value;
                item.recstatus = this.recStatus.value;
            }
        });
        this.reqQuantity.reset();
        this.opQuantity.reset();
        this.recStatus.reset();
        this.eventModalRef.close();

        // this.OnSearch();
    }
    async OnCheckBoxSelect(row, value) {
        if (value) {
            const payload = row;
            payload.recstatus = 'Completed';
            row.recstatus = 'Completed';
            const saveResp = await this.naviService.fetchRequestPost(
                'keventheaderitems/createkeventheaderitems',
                payload
            );
            row.checked = true;
        } else {
            const payload = row;
            payload.recstatus = 'Open';
            row.recstatus = 'Open';
            const saveResp = await this.naviService.fetchRequestPost(
                'keventheaderitems/createkeventheaderitems',
                payload
            );
            row.checked = false;
        }
        // this.OnSearch();
    }
    TimeLogic() {
        // this.EventType = JSON.stringify(temp);
        let currentTime = formatDate(
            new Date().getTime(),
            'HH:mm:ss',
            this.locale
        );
        console.log(currentTime);
        if (currentTime >= '13:00:00' && currentTime < '18:00:00') {
            console.log('Evening');
            this.GetMorningOrEveningData('Snacks', 'Dinner');
        } else if (currentTime > '18:00:00' && currentTime < '23:59:59') {
            // for getting events name
            this.GetMorningOrEveningData('Empty', 'Lunch');
        } else {
            console.log('Today Morning');
            this.GetMorningOrEveningData('Empty', 'Lunch');
        }
    }
    EachEventsData(events: any, eventItems) {
        // for each event details
        events.forEach((event) => {
            event.assignedEventItems = [];
        });
        // teluguname
        this.recipes.forEach((rcp) => {
            eventItems.forEach((item) => {
                if (item.recid === rcp.rcpid) item['tname'] = rcp?.tname;
            });
        });
        events.forEach((event) => {
            eventItems.forEach((item) => {
                if (item.keventid === event.keventid) {
                    if (item.recstatus === 'Completed') item['checked'] = true;
                    else item['checked'] = false;
                    console.log(item);
                    event.assignedEventItems.push(item);
                }
            });
        });
        return events;
    }
    async OnPack(recipe, type: string, pasteOrnv, modal, nvModal) {
        if (
            recipe?.RecipeId != null &&
            recipe?.RecipeId != -1 &&
            recipe?.RecipeId != -2
        ) {
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
        } else {
            if (recipe?.RecipeId === -1) {
                this.isTypeOne = false;
                this.isTypeTwo = false;
                this.modalReference = this.dialog.open(modal);
                if (pasteOrnv === 'One') this.isTypeOne = true;
                if (pasteOrnv === 'Two') this.isTypeTwo = true;
            } else if (recipe?.RecipeId === -2) {
                this.modalReference = this.dialog.open(nvModal);
            }
        }
    }
}
