import { formatDate } from '@angular/common';
import {
    Component,
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
import { FormGroup, FormControl } from '@angular/forms';
@Component({
    selector: 'app-prep-lunch-dinner',
    templateUrl: './prep-lunch-dinner.component.html',
    styleUrls: ['./prep-lunch-dinner.component.scss'],
})
export class PrepLunchDinnerComponent implements OnInit {
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
    public typeOneEventName: string;
    typeTwoEventName: string;
    public eventNameArray = [];
    selectedSortIngredients = [];
    groupIdsList = [];
    recipeInstructions: string;
    ingredientsImagePath = './assets/images/ingredients/';
    @ViewChild('modal') modal: TemplateRef<any>;
    @ViewChild('rcpdetailsmodal') rcpmodal: TemplateRef<any>;
    private modalReference: MatDialogRef<TemplateRef<any>>;
    eventDateControl: FormControl = new FormControl('');

    constructor(
        private naviService: ProjectService,
        @Inject(LOCALE_ID) public locale: string,
        private dialog: MatDialog,
        private activatedRoute: ActivatedRoute
    ) {}

    async ngOnInit() {
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
        let tnameResp = await this.naviService.fetchRequestPost(
            'rest/product/ProductsByVariants',
            payload
        );
        this.teluguNameProducts = tnameResp['productitems'];
        const currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        console.log(currentDate);
        this.events = this.events.filter((item: any) => {
            if (item.eventdate == currentDate && item.category == 'Curry Point')
                return item;
        });
        // for getting events name

        // this.EventType = JSON.stringify(temp);
        let currentTime = formatDate(
            new Date().getTime(),
            'HH:mm:ss',
            this.locale
        );
        console.log(currentTime);
        if (currentTime > '18:00:00' && currentTime < '23:59:59') {
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
                    item.category == 'Curry Point'
                )
                    return item;
            });
            // for getting events name

            this.GetMorningOrEveningData('Lunch', 'Dinner', this.events);
        } else {
            console.log('Today Morning');
            this.GetMorningOrEveningData('Lunch', 'Dinner', this.events);
        }
    }
    async GetMorningOrEveningData(type1: String, type2: String, events) {
        this.headingArray = [];
        this.keys = [];
        this.eventReports = [];
        this.typeOneEvents = [];
        this.typeTwoEvents = [];
        this.typeOneRecipes = [];
        this.typeTwoRecipes = [];
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
    async GetRecipesData(events, type) {
        let rows = [];
        let recipesData = [];
        this.headingArray = [];
        this.keys = [];

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
                obj['uom'] = row.uom;
                temp.push(obj);
            } else if (row.Category == 'Others') {
                obj['Recipe'] = row.Recipe;
                obj['RecipeName'] = row.RecipeName;
                obj['TotalReqQty'] = row.TotalReqQty;
                obj['uom'] = row.uom;
                othersTemp.push(obj);
            }
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

        let eventType = [...new Set(name)];
        let eventdatestring = [...new Set(eventdate)];
        this.eventDate = eventdatestring.toString();
        console.log(this.eventDate);
        if (type === 'One') {
            this.typeOneName = eventType.toString();
            this.typeOneRecipes = temp;
            this.AllRcpIngredients(events, 'One');
            this.typeOneEventName = eventnamestring.toString();
        } else if (type === 'Two') {
            this.typeTwoName = eventType.toString();
            this.typeTwoRecipes = temp;
            this.AllRcpIngredients(events, 'Two');
            this.typeTwoEventName = eventnamestring.toString();
        }
    }
    async AllRcpIngredients(events, type) {
        let rcpIngr = [];
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
                    row.totalQuantity = row.totalQuantity / 1000;
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                }
            } else {
                row.totalQuantity = row.totalQuantity.toFixed(2);
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
                    row.totalQuantity = row.totalQuantity / 1000;
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.totalQuantity = row.totalQuantity.toFixed(2);
                }
            } else {
                row.totalQuantity = row.totalQuantity.toFixed(2);
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
            this.typeOnePaste = pasteIngr.filter((item) => {
                if (item?.style == 'Paste') return item;
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
            this.typeTwoPaste = pasteIngr.filter((item) => {
                if (item?.style == 'Paste') return item;
            });
            // for addding quantity of paste items to vegetables
        }

        console.log(this.typeTwoRcpIngr);
        console.log(this.typeTwoNonVeg);
    }
    OnSearch() {
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
        const formattedDate = formatDate(
            this.eventDateControl.value,
            'YYYY-MM-dd',
            this.locale
        );
        let events = this.tempEvents;
        events = events.filter((obj) => {
            return obj.eventdate === formattedDate;
        });
        console.log(events);
        this.GetMorningOrEveningData('Lunch', 'Dinner', events);
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
