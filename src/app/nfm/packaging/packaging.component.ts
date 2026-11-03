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

@Component({
    selector: 'app-packaging',
    templateUrl: './packaging.component.html',
    styleUrls: ['./packaging.component.scss'],
})
export class PackagingComponent implements OnInit {
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
    evtCatCtrl: FormControl = new FormControl();
    catCtrlData = ['Kitchen', 'Event', 'Catering'];
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
        this.categoryControl.setValue('All');
        let eventResp = await this.naviService.fetchRequest(
            'keventheader/getAllkeventheader'
        );
        this.events = eventResp['keventheaderList'];
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
        const currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
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
            this.GetMorningOrEveningData('Snacks', 'Dinner');
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
            this.GetMorningOrEveningData('Empty', 'Lunch');
        } else {
            console.log('Today Morning');
            this.GetMorningOrEveningData('Empty', 'Lunch');
        }
    }
    async GetMorningOrEveningData(type1: String, type2: String) {
        this.headingArray = [];
        this.keys = [];
        this.eventReports = [];

        if (this.events.length > 0) {
            this.events.forEach((item: any) => {
                if (item?.type == type1) {
                    this.typeOneEvents.push(item);
                } else if (item?.type == type2) {
                    this.typeTwoEvents.push(item);
                }
            });
            const eventItems = await this.naviService.fetchRequest(
                'keventheaderitems/getAllkeventheaderitems'
            );
            this.eventItems = eventItems['keventheaderitemsList'];
            this.eventItems.forEach((item) => {
                this.recipes.forEach((rcp) => {
                    if (item.recid === rcp.rcpid) item.recipeName = rcp.name;
                });
            });
        }
        if (this.typeOneEvents.length > 0) {
            const reportResp = await this.naviService.fetchRequestPost(
                'keventheaderitems/eventrecipeslist',
                this.typeOneEvents
            );
            let typeOneName = [];
            let eventdate = [];
            this.eventNameArray = [];
            this.typeOneEvents.forEach((item) => {
                eventdate.push(item.eventdate);
                typeOneName.push(item?.type);
                this.eventNameArray.push(item?.keventname);
            });
            let eventnamestring = [...new Set(this.eventNameArray)];
            this.eventName = eventnamestring.toString();
            let typeOneEventType = [...new Set(typeOneName)];
            let eventdatestring = [...new Set(eventdate)];
            this.eventDate = eventdatestring.toString();
            this.typeOneName = typeOneEventType.toString();
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
                if (row.Category == 'Kitchen') {
                    obj['Recipe'] = row.Recipe;
                    obj['RecipeName'] = row.RecipeName;
                    obj['TotalReqQty'] = row.TotalReqQty;
                    obj['TotalOutputQty'] = row.TotalOutputQty;
                    obj['uom'] = row.uom;
                    obj['isItemsReady'] = row.isItemsReady;
                    obj['isRcpCooked'] = row.isRcpCooked;
                    obj['isPacked'] = row.isPacked;
                    temp.push(obj);
                } else if (row.Category == 'Others') {
                    obj['Recipe'] = row.Recipe;
                    obj['RecipeName'] = row.RecipeName;
                    obj['TotalReqQty'] = row.TotalReqQty;
                    obj['TotalOutputQty'] = row.TotalOutputQty;
                    obj['uom'] = row.uom;
                    obj['isItemsReady'] = row.isItemsReady;
                    obj['isRcpCooked'] = row.isRcpCooked;
                    obj['isPacked'] = row.isPacked;
                    othersTemp.push(obj);
                }
            });

            console.log(temp);
            // for (let i in temp) {
            //     if (temp[i].uom == 'gms' || temp[i].uom == 'ml') {
            //         if (temp[i].TotalReqQty >= 1000) {
            //             temp[i]['newTotalReqQty'] = temp[i].TotalReqQty / 1000;
            //             if (temp[i].uom == 'gms') temp[i].uom = 'Kgs';
            //             else if (temp[i].uom == 'ml') temp[i].uom = 'L';
            //         } else {
            //             temp[i]['newTotalReqQty'] = temp[i].TotalReqQty;
            //         }
            //     } else {
            //         temp[i]['newTotalReqQty'] = temp[i].TotalReqQty;
            //     }
            // }
            this.typeOneRecipes = temp;
            this.typeOneRecipes.forEach((rcp) => {
                rcp['type'] = this.typeOneName;
            });
            console.log(this.typeOneRecipes);
            console.log(this.events);
            this.typeOneEvents = this.EachEventsData(
                this.typeOneEvents,
                this.eventItems
            );
        }
        if (this.typeTwoEvents.length > 0) {
            const reportResp = await this.naviService.fetchRequestPost(
                'keventheaderitems/eventrecipeslist',
                this.typeTwoEvents
            );
            let typeTwoName = [];
            let eventdate = [];
            this.eventNameArray = [];
            this.typeTwoEvents.forEach((item) => {
                eventdate.push(item.eventdate);
                typeTwoName.push(item?.type);
                this.eventNameArray.push(item?.keventname);
            });
            let eventnamestring = [...new Set(this.eventNameArray)];
            this.eventName = eventnamestring.toString();
            let typeTwoEventName = [...new Set(typeTwoName)];
            let eventdatestring = [...new Set(eventdate)];
            this.eventDate = eventdatestring.toString();
            this.typeTwoName = typeTwoEventName.toString();
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
                if (row.Category == 'Kitchen') {
                    obj['Recipe'] = row.Recipe;
                    obj['RecipeName'] = row.RecipeName;
                    obj['TotalReqQty'] = row.TotalReqQty;
                    obj['TotalOutputQty'] = row.TotalOutputQty;
                    obj['uom'] = row.uom;
                    obj['isItemsReady'] = row.isItemsReady;
                    obj['isRcpCooked'] = row.isRcpCooked;
                    obj['isPacked'] = row.isPacked;
                    temp.push(obj);
                } else if (row.Category == 'Others') {
                    obj['Recipe'] = row.Recipe;
                    obj['RecipeName'] = row.RecipeName;
                    obj['TotalReqQty'] = row.TotalReqQty;
                    obj['TotalOutputQty'] = row.TotalOutputQty;
                    obj['uom'] = row.uom;
                    obj['isItemsReady'] = row.isItemsReady;
                    obj['isRcpCooked'] = row.isRcpCooked;
                    obj['isPacked'] = row.isPacked;
                    othersTemp.push(obj);
                }
            });

            console.log(temp);
            // for (let i in temp) {
            //     if (temp[i].uom == 'gms' || temp[i].uom == 'ml') {
            //         if (temp[i].TotalReqQty >= 1000) {
            //             temp[i]['newTotalReqQty'] = temp[i].TotalReqQty / 1000;
            //             if (temp[i].uom == 'gms') temp[i].uom = 'Kgs';
            //             else if (temp[i].uom == 'ml') temp[i].uom = 'L';
            //         } else {
            //             temp[i]['newTotalReqQty'] = temp[i].TotalReqQty;
            //         }
            //     } else {
            //         temp[i]['newTotalReqQty'] = temp[i].TotalReqQty;
            //     }
            // }
            this.typeTwoRecipes = temp;
            this.typeTwoRecipes.forEach((rcp) => {
                rcp['type'] = this.typeTwoName;
            });
            console.log(this.typeTwoRecipes);
            console.log(this.events);
        }
        this.typeTwoEvents = this.EachEventsData(
            this.typeTwoEvents,
            this.eventItems
        );
    }
    async OnStatusChange(value, rcp) {
        rcp.isItemsReady = value.target.checked;
        console.log(value);
        const payload = {
            rcpid: rcp.Recipe,
            eventdate: this.eventDate,
            type: rcp.type,
            isitemready: null,
            isrcpcooked: null,
            isrcppacked: value.target.checked,
        };
        console.log('Payload', payload);
        const resp = await this.naviService.fetchRequestPost(
            'keventheaderitems/updatercpstage',
            payload
        );
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
        const getResp = await this.naviService.fetchRequest(
            'keventheader/getAllkeventheader'
        );
        allEvents = getResp['keventheaderList'];
        this.tempEvents = allEvents;
        allEvents = allEvents.filter((evt) => {
            return evt.category === 'Catering' || evt.category == 'Kitchen';
        });
        if (this.evtCatCtrl.value != '' && this.evtCatCtrl.value != null) {
            allEvents = this.tempEvents;
            allEvents = this.tempEvents.filter((data) => {
                return data.category == this.evtCatCtrl.value;
            });
            console.log('inside');
            todayEvents = this.tempEvents.filter((data) => {
                return data.category === this.evtCatCtrl.value;
            });
            tomorrowEvents = this.tempEvents.filter((data) => {
                return data.category === this.evtCatCtrl.value;
            });
        }
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
        if (this.eventDateControl.value) {
            const formattedDate = formatDate(
                this.eventDateControl.value,
                'YYYY-MM-dd',
                this.locale
            );
            let events = allEvents;
            this.events = events.filter((obj) => {
                return (
                    obj.eventdate === formattedDate &&
                    (obj.category === 'Catering' || obj.category == 'Kitchen')
                );
            });
            console.log(events);
            if (this.categoryControl.value) {
                let type = this.categoryControl.value;
                this.GetMorningOrEveningData(type, 'empty');
            } else {
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
}
