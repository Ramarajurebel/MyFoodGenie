import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';
@Component({
    selector: 'app-kitchen-preparation',
    templateUrl: './kitchen-preparation.component.html',
    styleUrls: ['./kitchen-preparation.component.scss'],
})
export class KitchenPreparationComponent implements OnInit {
    public path: string;
    public events = [];
    public recipes = [];
    public recipeIngredients = [];
    public tempRcpIngr = [];
    public keys = [];
    public headingArray = [];
    public tiffinRecipes = [];
    public lunchRecipes = [];
    public snacksRecipes = [];
    public dinnerRecipes = [];
    public tiffinsRcpIngr = [];
    public lunchRcpIngr = [];
    public snacksRcpIngr = [];
    public dinnerRcpIngr = [];
    public tiffinsVegetables = [];
    public tiffinsGroceries = [];
    public tiffinsNonVeg = [];
    public tiffinsOthers = [];
    public tiffinsPaste = [];
    public lunchVegetables = [];
    public lunchGroceries = [];
    public lunchNonVeg = [];
    public lunchOthers = [];
    public lunchPaste = [];
    public snacksVegetables = [];
    public snacksGroceries = [];
    public snacksNonVeg = [];
    public snacksOthers = [];
    public snacksPaste = [];

    public dinnerVegetables = [];
    public dinnerGroceries = [];
    public dinnerNonVeg = [];
    public dinnerOthers = [];
    public dinnerPaste = [];

    public teluguNameProducts = [];
    public eventDate: string;
    public eventName: string;
    public selectedRcpIngredients = [];
    modalReference: any;
    @ViewChild('modal') modal: TemplateRef<any>;

    public preparationid: number;
    public statusData = [
        'Open',
        'Ingredients Ready',
        'Cooking InProgress',
        'Cooking InProgress',
        'Cooking Completed',
        'Packing InProgress',
        'Packing Completed',
    ];

    public chefFormGroup: FormGroup;
    chefOperator = [];
    recipeInstructions: string;
    vendorId = 0;
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private naviService: ProjectService,
        private dialog: MatDialog
    ) {}

    async ngOnInit() {
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.path = this.activatedRoute.snapshot.params.id;
        console.log(this.path);
        if (this.path) {
            let eventResp = await this.naviService.fetchRequest(
                'keventheader/getAllkeventheader'
            );
            this.events = eventResp['keventheaderList'];

            // For Recipes
            let recpResp = await this.naviService.fetchRequest(
                'rcpheader/getAllrcpheader'
            );
            this.recipes = recpResp['rcpheaderList'];
            // getting eventids from url id
            let eventdate = this.activatedRoute.snapshot.params.date;
            this.eventDate = this.eventDate;
            let events = JSON.parse(this.path);
            let eventsObj = events.map((str, index) => ({ keventid: str }));
            console.log(events);
            this.events.forEach((evt) => {
                eventsObj.forEach((element) => {
                    if (evt.keventid == element.keventid) {
                        element['type'] = evt.type;
                    }
                });
            });
            let eventsArray = [];
            this.events.forEach((item) => {
                eventsObj.forEach((event) => {
                    if (item.keventid == event.keventid) {
                        eventsArray.push(item);
                    }
                });
            });

            let ingrResp = await this.naviService.fetchRequest(
                'rcpingr/getAllrcpingr'
            );
            this.recipeIngredients = ingrResp['rcpingrList'];
            let payload: any = {};
            (payload.catid = 112), (payload.prodid = 0);
            payload.vendorId = this.vendorId;
            let tnameResp = await this.naviService.fetchRequestPost(
                'rest/product/ProductsByVariants',
                payload
            );
            this.teluguNameProducts = tnameResp['productitems'];
            this.tempRcpIngr = JSON.parse(
                JSON.stringify(this.recipeIngredients)
            );
            // getting event types
            // let eventdate = [];
            // let eventname = [];

            // let eventdatestring = [...new Set(eventdate)];
            // let eventnamestring = [...new Set(eventname)];
            // this.eventDate = eventdatestring.toString();
            // this.eventName = eventnamestring.toString();

            let tiffinsEvents = eventsArray.filter((item) => {
                if (item.type == 'Tiffins') return item;
            });
            let lunchEvents = eventsArray.filter((item) => {
                if (item.type == 'Lunch') return item;
            });
            let snacksEvents = eventsArray.filter((item) => {
                if (item.type === 'Snacks') return item;
            });
            let dinnerEvents = eventsArray.filter((item) => {
                if (item.type === 'Dinner') return item;
            });
            if (tiffinsEvents.length > 0) {
                this.GetRecipesData(tiffinsEvents, 'Tiffins');
            }
            if (lunchEvents.length > 0) {
                this.GetRecipesData(lunchEvents, 'Lunch');
            }
            if (snacksEvents.length > 0) {
                this.GetRecipesData(snacksEvents, 'Snacks');
            }
            if (dinnerEvents.length > 0) {
                this.GetRecipesData(dinnerEvents, 'Dinner');
            }
        }
    }
    async GetRecipesData(eventids: any, type) {
        const tiffinsResp = await this.naviService.fetchRequestPost(
            'keventheaderitems/eventrecipeslist',
            eventids
        );
        let typeOneName = [];
        let eventdate = [];
        eventids.forEach((item) => {
            eventdate.push(item.eventdate);
            typeOneName.push(item?.type);
        });
        let typeOneEventType = [...new Set(typeOneName)];
        let eventdatestring = [...new Set(eventdate)];
        // this.eventDate = eventdatestring.toString();
        // this.typeOneName = typeOneEventType.toString();
        let rows = tiffinsResp['rows'];
        this.headingArray = tiffinsResp['cols'];
        this.keys = tiffinsResp['keys'];
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
        if (type == 'Tiffins') {
            this.tiffinRecipes = temp;
            this.GetRcpIngr('Tiffins', eventids);
        } else if (type === 'Lunch') {
            this.lunchRecipes = temp;
            this.GetRcpIngr('Lunch', eventids);
        } else if (type == 'Snacks') {
            this.snacksRecipes = temp;
            this.GetRcpIngr('Snacks', eventids);
        } else {
            this.dinnerRecipes = temp;
            this.GetRcpIngr('Dinner', eventids);
        }
    }
    OnClose() {
        this.modalReference.close();
    }
    async GetRcpIngr(type, eventids: any) {
        let getIngrRespTypeOne = await this.naviService.fetchRequestPost(
            'keventheader/getEventIngredientsByPlatters',
            eventids
        );

        let rcpIngr = getIngrRespTypeOne['eventDetailsList'];

        rcpIngr.forEach((row) => {
            this.teluguNameProducts.forEach((prod) => {
                if (row.itemid == prod.prodId) row['tname'] = prod?.tname;
            });
        });
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
        rcpIngr.forEach((row) => {
            if (row.uom == 'gms' || row.uom == 'ml') {
                if (row.balance >= 1000) {
                    row.balance = row.balance / 1000;
                    row.balance = row.balance.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.balance = row.balance.toFixed(2);
                }
            } else {
                row.balance = row.balance.toFixed(2);
            }
        });
        let pasteIngr = [];
        let getstyleingr = await this.naviService.fetchRequestPost(
            'keventheader/getEventRcpPreparation',
            eventids
        );
        pasteIngr = getstyleingr['eventDetailsList'];
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

        this.SortIngr(rcpIngr);
        pasteIngr = this.SortIngr(pasteIngr);
        if (type == 'Tiffins') {
            this.tiffinsVegetables = rcpIngr.filter((item) => {
                return item?.category == 'Vegetables';
            });
            this.tiffinsGroceries = rcpIngr.filter((item) => {
                return item?.category == 'Groceries';
            });
            this.tiffinsNonVeg = rcpIngr.filter((item) => {
                return item?.category == 'Non Veg';
            });
            this.tiffinsOthers = rcpIngr.filter((item) => {
                return item?.category == 'Others';
            });

            this.tiffinsPaste = pasteIngr.filter((item) => {
                return item?.style == 'Paste';
            });
            // for addding quantity of paste items to vegetables

            this.tiffinsRcpIngr = rcpIngr;
        } else if (type == 'Lunch') {
            this.lunchVegetables = rcpIngr.filter((item) => {
                return item?.category == 'Vegetables';
            });
            this.lunchGroceries = rcpIngr.filter((item) => {
                return item?.category == 'Groceries';
            });
            this.lunchNonVeg = rcpIngr.filter((item) => {
                return item?.category == 'Non Veg';
            });
            this.lunchOthers = rcpIngr.filter((item) => {
                return item?.category == 'Others';
            });
            this.lunchPaste = pasteIngr.filter((item) => {
                return item?.style == 'Paste';
            });
            // for addding quantity of paste items to vegetables

            this.lunchRcpIngr = rcpIngr;
        } else if (type == 'Snacks') {
            this.snacksVegetables = rcpIngr.filter((item) => {
                return item?.category == 'Vegetables';
            });
            this.snacksGroceries = rcpIngr.filter((item) => {
                return item?.category == 'Groceries';
            });
            this.snacksNonVeg = rcpIngr.filter((item) => {
                return item?.category == 'Non Veg';
            });
            this.snacksOthers = rcpIngr.filter((item) => {
                return item?.category == 'Others';
            });
            this.snacksPaste = pasteIngr.filter((item) => {
                return item?.style == 'Paste';
            });

            this.snacksRcpIngr = rcpIngr;
        } else {
            this.dinnerVegetables = rcpIngr.filter((item) => {
                return item?.category == 'Vegetables';
            });
            this.dinnerGroceries = rcpIngr.filter((item) => {
                return item?.category == 'Groceries';
            });
            this.dinnerNonVeg = rcpIngr.filter((item) => {
                return item?.category == 'Non Veg';
            });
            this.dinnerOthers = rcpIngr.filter((item) => {
                return item?.category == 'Others';
            });
            this.dinnerPaste = pasteIngr.filter((item) => {
                return item?.style == 'Paste';
            });

            this.dinnerRcpIngr = rcpIngr;
        }

        // this.tempAllEventRcpIngr = JSON.parse(
        //     JSON.stringify(this.allEventRcpIngr)
        // );
    }
    OnRowClick(row) {
        this.recipes.forEach((rcp) => {
            if (rcp.rcpid === row.Recipe)
                this.recipeInstructions = rcp.instructions;
        });
        this.tempRcpIngr = [];
        this.tempRcpIngr = JSON.parse(JSON.stringify(this.recipeIngredients));
        this.selectedRcpIngredients = [];

        let reqQuant: number;
        let calcReqQuant: number;
        let recipeUom: string;

        calcReqQuant = 0;
        reqQuant = 0;

        let recid = row.Recipe;
        let TotalReqQty: number = 0;

        recipeUom = row.uom;
        TotalReqQty = parseFloat(row.TotalReqQty);

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
        console.log(this.selectedRcpIngredients);
        let groupIdsList = newArray;
        groupIdsList = [
            ...new Map(
                groupIdsList.map((ingr) => [ingr['groupid'], ingr])
            ).values(),
        ];
        groupIdsList.forEach((ingr) => {
            ingr['groupData'] = [];
            ingr.childActive = true;
        });

        groupIdsList.forEach((ingr) => {
            newArray.forEach((ingrtemp) => {
                if (ingr.groupid === ingrtemp.groupid) {
                    ingr.groupData.push(ingrtemp);
                }
            });
        });
        groupIdsList = groupIdsList.sort((a, b) => {
            if (a?.groupid < b?.groupid) return -1;
            if (a?.groupid > b?.groupid) return 1;
            return 0;
        });
        console.log(groupIdsList);
        this.selectedRcpIngredients = groupIdsList;
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
