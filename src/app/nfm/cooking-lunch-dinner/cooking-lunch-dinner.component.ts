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
import { FormControl, FormGroup } from '@angular/forms';
@Component({
    selector: 'app-cooking-lunch-dinner',
    templateUrl: './cooking-lunch-dinner.component.html',
    styleUrls: ['./cooking-lunch-dinner.component.scss'],
})
export class CookingLunchDinnerComponent implements OnInit {
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
    public recipeName: string;
    public chefOperator = [];
    public preparationid: number;
    rcpid: number;
    prevStatus: string;
    audio = new Audio();
    @ViewChild('modal') modal: TemplateRef<any>;
    @ViewChild('rcpdetailsmodal') rcpmodal: TemplateRef<any>;
    @ViewChild('timermodal') timermodal: TemplateRef<any>;
    private modalReference: MatDialogRef<TemplateRef<any>>;
    public statusData = [
        'Open',
        'Ingredients Ready',
        'Cooking InProgress',
        'Cooking Completed',
        'Packing InProgress',
        'Packing Completed',
    ];
    public chefFormGroup: FormGroup;
    type: string;
    timerrcp: number;
    whistletime: FormControl = new FormControl('');
    instructions = [];
    groupIdsList = [];
    selectedRow: any;
    chefsRecipesListTypeOne = [];
    chefsRecipesListTypeTwo = [];

    constructor(
        private naviService: ProjectService,
        @Inject(LOCALE_ID) public locale: string,
        private dialog: MatDialog,
        private activatedRoute: ActivatedRoute
    ) {}

    async ngOnInit() {
        this.chefFormGroup = new FormGroup({
            chef: new FormControl(''),
            sequence: new FormControl(''),
            status: new FormControl(''),
        });
        let eventResp = await this.naviService.fetchRequest(
            'keventheader/getAllkeventheader'
        );
        this.events = eventResp['keventheaderList'];
        // For Recipes
        let recpResp = await this.naviService.fetchRequest(
            'rcpheader/getAllrcpheader'
        );
        this.recipes = recpResp['rcpheaderList'];
        const stallresp = await this.naviService.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.chefOperator = stallresp['stallOperatorList'];
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
        this.eventDate = currentDate;
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
        if (currentTime >= '13:00:00' && currentTime < '18:00:00') {
            console.log('Evening');
            this.GetMorningOrEveningData('Snacks', 'Dinner', currentDate);
        } else if (currentTime > '18:00:00' && currentTime < '23:59:59') {
            console.log('Tommorrow Morning');
            let date = new Date();
            let todate = date.getDate() + 1;
            date.setDate(todate);
            console.log(date);
            let tommorrowdate = formatDate(date, 'YYYY-MM-dd', this.locale);
            console.log(tommorrowdate);
            this.eventDate = tommorrowdate;
            this.events = this.tempEvents;
            this.events = this.events.filter((item) => {
                if (
                    item.eventdate == tommorrowdate &&
                    item.category == 'Curry Point'
                )
                    return item;
            });
            // for getting events name

            this.GetMorningOrEveningData('Tiffins', 'Lunch', tommorrowdate);
        } else {
            console.log('Today Morning');
            this.GetMorningOrEveningData('Tiffins', 'Lunch', currentDate);
        }
    }
    async GetMorningOrEveningData(type1: string, type2: string, date) {
        const reportResp = await this.naviService.fetchRequest(
            'recipepreparation/getallpreparationdata'
        );
        let cookingData = reportResp['recipepreparationList'];
        this.typeOneName = type1;
        this.typeTwoName = type2;
        let todayData = cookingData.filter((rcp) => {
            return (rcp.eventate = date);
        });

        // below you can get direct reicpes data from preparation table
        this.typeOneRecipes = cookingData.filter((rcp) => {
            return rcp.eventtype === type1 && rcp.eventdate == date;
        });

        this.typeTwoRecipes = cookingData.filter((rcp) => {
            return rcp.eventtype === type2 && rcp.eventdate == date;
        });
        // setting 0 values as null
        this.typeOneRecipes.forEach((rcp) => {
            if (rcp.sequence === 0) rcp.sequence = null;
        });
        this.typeTwoRecipes.forEach((rcp) => {
            if (rcp.sequence === 0) rcp.sequence = null;
        });
        this.typeOneRecipes.sort((a, b) => {
            if (a.sequence === null) {
                return 1;
            }

            if (b.sequence === null) {
                return -1;
            }

            if (a.sequence === b.sequence) {
                return 0;
            }

            return a.sequence < b.sequence ? -1 : 1;
        });
        this.typeTwoRecipes.sort((a, b) => {
            if (a.sequence === null) {
                return 1;
            }

            if (b.sequence === null) {
                return -1;
            }

            if (a.sequence === b.sequence) {
                return 0;
            }

            return a.sequence < b.sequence ? -1 : 1;
        });
        // below is for getting events this is for getting recipe ingredients
        this.typeOneEvents = this.events.filter((evt) => {
            return evt.type === type1;
        });
        this.typeTwoEvents = this.events.filter((evt) => {
            return evt?.type === type2;
        });

        if (this.typeOneEvents.length > 0 && this.typeOneRecipes.length > 0) {
            this.AllRcpIngredients(this.typeOneEvents, 'typeOne');
            this.typeOneRecipes.forEach((rcp) => {
                this.chefOperator.forEach((op) => {
                    if (parseInt(rcp.chef) === op.stalloperatorid) {
                        rcp['chefname'] = op.name;
                    }
                });
            });
            this.typeOneRecipes = this.RecipesData(this.typeOneRecipes);
            this.chefsRecipesListTypeOne = this.ChefsData(this.typeOneRecipes);
            // for getting timer
            // this.typeOneRecipes.forEach((typrcp) => {
            //     this.recipes.forEach((rcp) => {
            //         if (typrcp.rcpid === rcp.rcpid) {
            //             typrcp['timer'] = rcp.minduration;
            //             typrcp['settimer'] = false;
            //         } else {
            //             typrcp['setTimer'] = false;
            //         }
            //     });
            // });
            // if set timer true
        }
        if (this.typeTwoEvents.length > 0 && this.typeTwoRecipes.length > 0) {
            this.AllRcpIngredients(this.typeTwoEvents, 'typeTwo');
            this.typeTwoRecipes = this.RecipesData(this.typeTwoRecipes);
            this.typeTwoRecipes.forEach((rcp) => {
                this.chefOperator.forEach((op) => {
                    if (parseInt(rcp.chef) === op.stalloperatorid)
                        rcp['chefname'] = op.name;
                });
            });
            this.chefsRecipesListTypeTwo = this.ChefsData(this.typeTwoRecipes);
        }
    }
    ChefsData(array: any) {
        let chefsNames = [];

        array.forEach((rcp) => {
            chefsNames.push(rcp?.chefname);
        });
        chefsNames = [...new Set(chefsNames)];
        chefsNames = chefsNames.map((str, index) => ({
            chefName: str,
            id: index + 1,
        }));
        console.log(chefsNames);
        // create an emtpy array
        chefsNames.forEach((chef) => {
            chef.assignedRecipes = [];
        });
        chefsNames.forEach((chef) => {
            array.forEach((rcp) => {
                if (rcp?.chefname === chef.chefName)
                    chef.assignedRecipes.push(rcp);
            });
        });
        return chefsNames;
    }
    transform(value: number): string {
        const minutes: number = Math.floor(value / 60);
        return minutes + ':' + (value - minutes * 60);
    }
    playAudio(recp) {
        this.audio.src = './assets/audio/Alarm.mp3';
        this.audio.play();
    }
    async instructionsCheckbox(checked, value) {
        console.log(checked);
        console.log(value);
        console.log(this.selectedRow);
        if (checked) {
            this.instructions.forEach((instr) => {
                if (instr.id == value.id) instr.value = 'C: ' + value.value;
            });
            let allInstructions = [];
            this.instructions.forEach((instr) => {
                allInstructions.push(instr.value);
            });
            this.selectedRow.instructions = allInstructions.join('\n');

            let payload = {};

            payload['settimer'] = false;
            payload['instructions'] = this.selectedRow.instructions;
            payload['preparationid'] = this.selectedRow.id;
            payload['status'] = this.selectedRow.status;
            const resp = await this.naviService.fetchRequestPost(
                'recipepreparation/updatechefpreparation',
                payload
            );
        } else {
            this.instructions.forEach((instr) => {
                if (instr.id === value.id)
                    instr.value = value.value.replace('C: ', '');
            });
            let allInstructions = [];
            this.instructions.forEach((instr) => {
                allInstructions.push(instr.value);
            });
            this.selectedRow.instructions = allInstructions.join('\n');
            let payload = {};

            payload['settimer'] = false;
            payload['instructions'] = this.selectedRow.instructions;
            payload['preparationid'] = this.selectedRow.id;
            payload['status'] = this.selectedRow.status;
            const resp = await this.naviService.fetchRequestPost(
                'recipepreparation/updatechefpreparation',
                payload
            );
        }
    }

    async AllRcpIngredients(events, type) {
        let getIngrRespTypeOne = await this.naviService.fetchRequestPost(
            'keventheader/getEventIngredientsByPlatters',
            events
        );
        let rcpIngr = getIngrRespTypeOne['eventDetailsList'];

        let typePasteIngr = [];
        let pasteingrOneresp = await this.naviService.fetchRequestPost(
            'keventheader/getEventRcpPreparation',
            events
        );
        let pasteIngr = pasteingrOneresp['eventDetailsList'];

        rcpIngr.forEach((row) => {
            this.teluguNameProducts.forEach((prod) => {
                if (row.itemid == prod.prodId) row['tname'] = prod?.tname;
            });
        });
        // sort by quantity desc
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
        if (type === 'typeOne') {
            // this.typeOneRcpIngr = this.SortIngr(rcpIngr);
            // typePasteIngr = this.SortIngr(pasteIngr);

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
        } else if (type === 'typeTwo') {
            // this.typeTwoRcpIngr = this.SortIngr(rcpIngr);
            // typePasteIngr = this.SortIngr(pasteIngr);

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
        }

        // this.tempAllEventRcpIngr = JSON.parse(
        //     JSON.stringify(this.allEventRcpIngr)
        // );
        // for addding quantity of paste items to vegetables
        // this.typeOneVegetables = this.AddPasteValues(
        //     this.typeOneVegetables,
        //     this.typeOnePaste
        // );
        // this.typeOneGroceries = this.AddPasteValues(
        //     this.typeOneGroceries,
        //     this.typeOnePaste
        // );
        // this.typeOneNonVeg = this.AddPasteValues(
        //     this.typeOneNonVeg,
        //     this.typeOnePaste
        // );
        // this.typeOneOthers = this.AddPasteValues(
        //     this.typeOneOthers,
        //     this.typeOnePaste
        // );
    }
    OnStartBtnPress(rcp, type) {
        // need to open popup
        this.modalReference = this.dialog.open(this.timermodal);

        this.type = type;
        this.timerrcp = rcp.rcpid;
    }
    OnSaveTimer() {
        if (this.whistletime.value) {
            if (this.type === 'One') {
                this.typeOneRecipes.forEach((rcp) => {
                    if (rcp.rcpid == this.timerrcp) {
                        rcp.settimer = true;
                        rcp.rcptime = this.whistletime.value;
                        rcp.clock = this.whistletime.value;
                    }
                });
            } else {
                this.typeTwoRecipes.forEach((rcp) => {
                    if (rcp.rcpid == this.timerrcp) {
                        rcp.settimer = true;
                        rcp.rcptime = this.whistletime.value;
                        rcp.clock = this.whistletime.value;
                    }
                });
            }

            this.modalReference.close();
            this.whistletime.reset();
            this.StartTimer();
        }
    }
    StartTimer() {
        if (this.type === 'One') {
            this.typeOneRecipes.forEach((recp) => {
                if (this.timerrcp == recp.rcpid) {
                    if (recp.settimer) {
                        let clock = recp.rcptime * 60; // must be in minutes;
                        recp.interval = setInterval(() => {
                            if (clock > 0) {
                                clock--;
                                recp.clock = this.transform(clock);
                                console.log(clock);
                            } else {
                                this.playAudio(recp);
                                recp.setTimer = false;
                            }
                        }, 1000);
                    }
                }
            });
        } else {
            this.typeTwoRecipes.forEach((recp) => {
                if (this.timerrcp == recp.rcpid) {
                    if (recp.settimer) {
                        let clock = recp.rcptime * 60; // must be in minutes;
                        recp.interval = setInterval(() => {
                            if (clock > 0) {
                                clock--;
                                recp.clock = this.transform(clock);
                                console.log(clock);
                            } else {
                                this.playAudio(recp);
                                recp.setTimer = false;
                            }
                        }, 1000);
                    }
                }
            });
        }
    }
    OnStopTimer(rcp, type) {
        rcp.settimer = false;
        console.log(rcp.audio);
        this.ngOnDestroy(rcp.interval);
        rcp.clock = rcp.rcptime;
        this.StopAudio();
    }
    StopAudio() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
    RecipesData(tempRcp) {
        for (let i in tempRcp) {
            if (tempRcp[i].uom == 'gms' || tempRcp[i].uom == 'ml') {
                if (tempRcp[i].inputquantity >= 1000) {
                    tempRcp[i]['newTotalReqQty'] =
                        tempRcp[i].inputquantity / 1000;
                    if (tempRcp[i].uom == 'gms') tempRcp[i].uom = 'Kgs';
                    else if (tempRcp[i].uom == 'ml') tempRcp[i].uom = 'L';
                } else {
                    tempRcp[i]['newTotalReqQty'] = tempRcp[i].inputquantity;
                }
            } else {
                tempRcp[i]['newTotalReqQty'] = tempRcp[i].inputquantity;
            }
        }
        return tempRcp;
    }
    OnRowClick(row: any, type: string) {
        // for checkboxes
        this.selectedRow = row;
        this.preparationid = row.id;
        this.rcpid = row.rcpid;
        this.prevStatus = row.status;
        this.chefFormGroup.patchValue({
            chef: row?.chef,
            sequence: row?.sequence,
            status: row?.status,
        });
        // for instructions and checbox
        if (row.instructions != null) {
            let result = row.instructions.split(/\r?\n/);
            result = result.filter(Boolean);
            console.log(result);
            this.instructions = result;
            this.instructions = this.instructions.map((str, index) => ({
                value: str,
                id: index + 1,
                checked: false,
            }));
            this.instructions.forEach((instr) => {
                if (instr.value[0] === 'C' && instr.value[1] === ':')
                    instr.checked = true;
            });
        }

        this.recipeName = row.rcpname + row.rcpteluguname;
        this.tempRcpIngr = [];
        this.tempRcpIngr = JSON.parse(JSON.stringify(this.recipeIngredients));
        this.selectedRcpIngredients = [];
        let reqQuant: number;
        let calcReqQuant: number;
        let recipeUom: string;

        calcReqQuant = 0;
        reqQuant = 0;

        let recid = row.rcpid;

        console.log();
        reqQuant = row.inputquantity;
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
        this.chefFormGroup.reset();
        this.whistletime.reset();
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
    // AddPasteValues(vegArray, pasteArray) {
    //     // for addding quantity of paste items to vegetables
    //     vegArray.forEach((veg) => {
    //         pasteArray.forEach((paste) => {
    //             if (paste.itemid === veg.itemid) {
    //                 if (veg.uom == paste.uom) {
    //                     veg.totalQuantity =
    //                         parseFloat(veg.totalQuantity) +
    //                         parseFloat(paste.totalQuantity);
    //                     veg.totalQuantity = veg.totalQuantity.toFixed(2);
    //                 } else {
    //                     if (veg.uom === 'kgs' && paste.uom == 'gms') {
    //                         veg.totalQuantity =
    //                             parseFloat(veg.totalQuantity) * 1000;
    //                         veg.totalQuantity =
    //                             parseFloat(veg.totalQuantity) +
    //                             parseFloat(paste.totalQuantity);
    //                         if (veg.totalQuantity >= 1000) {
    //                             veg.totalQuantity = veg.totalQuantity / 1000;
    //                             veg.totalQuantity = veg.totalQuantity.toFixed(
    //                                 2
    //                             );
    //                         }
    //                     }
    //                     if (veg.uom === 'gms' && paste.uom === 'kgs') {
    //                         paste.totalQuantity =
    //                             parseFloat(paste.totalQuantity) * 1000;
    //                         veg.totalQuantity =
    //                             parseFloat(veg.totalQuantity) +
    //                             parseFloat(paste.totalQuantity);
    //                         if (veg.totalQuantity >= 1000) {
    //                             veg.totalQuantity = veg.totalQuantity / 1000;
    //                             veg.totalQuantity = veg.totalQuantity.toFixed(
    //                                 2
    //                             );
    //                         }
    //                     }
    //                 }
    //             }
    //         });
    //     });
    //     return vegArray;
    // }
    async OnStatusUpdate() {
        let payload = {};
        let data = this.chefFormGroup.value;
        if (data.status) {
            payload['status'] = data.status;
            if (
                data.status == 'Cooking InProgress' &&
                data.status != this.prevStatus
            ) {
                payload['settimer'] = true;
            } else {
                payload['settimer'] = false;
            }

            payload['preparationid'] = this.preparationid;
            payload['instructions'] = this.selectedRow.instructions;

            const updateresp = await this.naviService.fetchRequestPost(
                'recipepreparation/updatechefpreparation',
                payload
            );
        }

        this.modalReference.close();
        this.chefFormGroup.reset();
        this.ngOnInit();
    }
    ngOnDestroy(interval) {
        if (interval) {
            clearInterval(interval);
        }
    }
}
