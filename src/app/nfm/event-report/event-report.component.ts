import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import * as moment from 'moment';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import * as pdfMakeConfig from 'pdfmake/build/pdfmake.js';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-event-report',
    templateUrl: './event-report.component.html',
    styleUrls: ['./event-report.component.scss'],
})
export class EventReportComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    isMatDrawerOpened: boolean = false;
    public rcpcontrol: FormControl = new FormControl();
    public rcpplatters: FormControl = new FormControl();
    public isExport = false;
    public totalprice: number;
    public filteredingr = [];
    public isAdhocpoVisible = false;
    public dynamicEvents = [];
    public orderForm: FormGroup;
    public eventitems = [];
    public filteredrecipe = [];
    protected _onDestroy = new Subject<void>();
    @Input() placeholderLabel = 'Search';
    public defaultarray = [];
    public recipesearch: FormControl = new FormControl();
    public events = [];
    public totalitemscount = 0;
    dropdownSettings: IDropdownSettings;
    recipesettings: IDropdownSettings;
    eventsarray = [];
    public Keys = [];
    eventitemsarray = [];
    public Recipes = [];
    public headingArray = [];
    public rowsArray = [];
    public SeachFormGroup: FormGroup;
    public validation = true;
    public Status = ['Open', 'Completed', 'In Progress'];
    modalReference: any;
    public editMode = false;
    public supplierData;
    public delobj = {};
    public eventitemsid: number;
    public closeResult: string;
    public TempEventRecipes = [];
    vendorId = 0;
    constructor(
        private modalService: NgbModal,
        private service: ProjectService
    ) {
        (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
        pdfMakeConfig.fonts = {
            telugu: {
                normal: 'TenaliRamakrishna-Regular.ttf',
            },
        };
    }

    async ngOnInit() {
        let vendorId: number;
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'keventid',
            textField: 'eventwithdate',

            allowSearchFilter: true,
        };
        this.recipesettings = {
            singleSelection: false,
            idField: 'rcpid',
            textField: 'name',

            allowSearchFilter: true,
        };

        this.orderForm = new FormGroup({
            eventname: new FormControl(''),
            recipename: new FormControl(''),
            category: new FormControl(''),
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
        });

        //    const getresp = await this.service.fetchRequest("keventheaderitems/getAllkeventheaderitems");
        // this.eventitems= getresp['keventheaderitemsList'];

        // below is for event name dropdown
        // const getkevents = await this.service.fetchRequest(
        //   'keventheader/getAllkeventheader'
        // );
        // this.events = getkevents['keventheaderList'];
        let datePayload = {};
        datePayload['startDate'] = moment(
            this.orderForm.controls['startDate'].value
        ).format('YYYY-MM-DD');
        datePayload['endDate'] = moment(
            this.orderForm.controls['endDate'].value
        ).format('YYYY-MM-DD');
        datePayload['vendorId'] = this.vendorId;
        const dateresp = await this.service.fetchRequestPost(
            'keventheader/geteventbydate',
            datePayload
        );
        this.events = dateresp['keventheaderList'];
        for (let i in this.events) {
            this.events[i]['eventwithdate'] =
                this.events[i].keventname + '-' + this.events[i].eventdate;
        }

        // for (let i in this.events) {
        //   if (this.events[i].status != 'Completed') {
        //     this.eventsarray.push(this.events[i]);
        //   }
        // }
        this.events = this.events.filter((item) => {
            if (item.status != 'Completed') return item;
        });

        // for total price

        // below is for recipe drop down
        const getrecpresp = await this.service.fetchRequest(
            'rcpheader/getAllrcpheader'
        );
        this.Recipes = getrecpresp['rcpheaderList'];

        // For Main Ingredient Quantity

        this.filteredrecipe = this.Recipes;
        this.recipesearch.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterrecipes();
            });
        this.filteredrecipe = this.Recipes;
        this.rcpcontrol.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.searchrecipe();
            });
    }

    protected filterrecipes() {
        if (!this.Recipes) {
            return;
        }
        // get the search keyword
        let search = this.recipesearch.value;

        if (!search) {
            this.filteredrecipe = this.Recipes.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredrecipe = this.Recipes.filter(
            (bank) =>
                bank.name
                    .toString()
                    .toLowerCase()
                    .indexOf(search.toString().toLowerCase()) > -1
        );
    }
    protected searchrecipe() {
        if (!this.Recipes) {
            return;
        }
        let popupsearch = this.rcpcontrol.value;
        if (!popupsearch) {
            this.filteredrecipe = this.Recipes.slice();
            return;
        } else {
            popupsearch = popupsearch.toLowerCase();
        }
        // filter the banks
        this.filteredrecipe = this.Recipes.filter(
            (bank) =>
                bank.name
                    .toString()
                    .toLowerCase()
                    .indexOf(popupsearch.toString().toLowerCase()) > -1
        );
    }
    async getEventitems() {
        this.headingArray = [];
        this.eventitems = [];
        this.eventitemsarray = [];
        this.eventsarray = [];

        this.events = this.events.filter((item) => {
            if (item.status != 'Completed') {
                return item;
            }
        });

        // tname
        this.eventitems.forEach((item) => {
            this.Recipes.forEach((elemt) => {
                if (item.recid == elemt.rcpid) item['tname'] = elemt.tname;
            });
        });
        let eventname = this.orderForm.controls['eventname'].value;
        let recipename = this.orderForm.controls['recipename'].value;
        if (eventname || recipename) {
            this.onSearch();
        }
    }

    async onSearch() {
        this.isAdhocpoVisible = true;

        this.totalprice = 0;
        this.headingArray = [];
        let temp1 = [];
        let temp2 = [];
        const getrecpresp = await this.service.fetchRequest(
            'rcpheader/getAllrcpheader'
        );
        this.Recipes = getrecpresp['rcpheaderList'];
        this.events = this.events.filter((item) => {
            if (item.status != 'Completed') {
                return item;
            }
        });
        // this.eventitems=this.headingArray;
        let eventname = this.orderForm.controls['eventname'].value;
        let recipename = this.orderForm.controls['recipename'].value;
        let category = this.orderForm.controls['category'].value;
        let multipleevents = [];
        let multiplerecipes = [];
        this.headingArray = [];
        this.eventitems = [];
        this.rowsArray = [];
        if (eventname.length > 0) {
            eventname.forEach((element) => {
                this.dynamicEvents.push(element.keventid);
            });
            const searchresp = await this.service.fetchRequestPost(
                'keventheaderitems/eventrecipeslist',
                eventname
            );
            this.eventitems = searchresp['rows'];
            temp1 = searchresp['cols'];
            this.Keys = searchresp['keys'];

            temp2 = Object.assign({}, ...temp1);
            // this.headingArray =Object.values(temp2);
            this.headingArray = temp1;
            this.headingArray.splice(0, 0, 'SNo');
            this.headingArray.splice(-1);
            this.headingArray.splice(
                this.headingArray.indexOf('GroupId'),
                this.headingArray.indexOf('RcpCategory') -
                    this.headingArray.indexOf('GroupId') +
                    1
            );
            this.Keys.splice(
                this.Keys.indexOf('GroupId'),
                this.Keys.indexOf('RcpCategory') -
                    this.Keys.indexOf('GroupId') +
                    1
            );
            console.log(this.headingArray);
            for (let i = 0; i < this.eventitems.length; i++) {
                this.rowsArray.push(
                    Object.assign({}, ...this.eventitems[i].cols)
                );
            }
            this.TempEventRecipes = JSON.parse(JSON.stringify(this.rowsArray));
            if (recipename.length > 0) {
                let temprowsarray = [];

                temprowsarray = this.rowsArray.filter((obj) => {
                    return recipename.find((item) => {
                        return item.rcpid == parseInt(obj.Recipe);
                    });
                });
                this.rowsArray = temprowsarray;
            }
            if (category) {
                this.rowsArray = this.rowsArray.filter((item) => {
                    if (item?.Category == category) return item;
                });
            }
            this.rowsArray.find((item) => {
                this.Recipes.find((rcp) => {
                    if (item.Recipe == rcp.rcpid) {
                        item.Recipe =
                            item.Recipe + '-' + item.recname + '-' + rcp.tname;
                        this.totalprice += parseInt(item.TotalAmount);
                    }
                });
            });

            this.totalitemscount = this.rowsArray.length;
        }
        let allRecipesId = [];
        this.rowsArray.forEach((item) => {
            let id = item.Recipe.split('-');
            allRecipesId.push(id[0]);
            console.log(allRecipesId);
        });

        console.log(this.rowsArray);

        console.log(this.headingArray);
    }

    onExportPress() {
        let eventnames = [];
        let eventdates = [];
        this.events.forEach((item) => {
            this.dynamicEvents.forEach((id) => {
                if (item.keventid == id) {
                    eventnames.push(
                        item.keventname + ' (' + item.platterscount + ')'
                    );
                    eventdates.push(item.eventdate);
                }
            });
        });
        let uniqueEventDates = [...new Set(eventdates)];
        let printarray = this.TempEventRecipes;
        let tempkeys = this.Keys;
        let headarray = this.headingArray;
        console.log(tempkeys);
        console.log(headarray);
        let keyarr1 = tempkeys.slice(0, -1);
        let keyarr2 = keyarr1.slice(0, -1);
        let keyarr3 = keyarr2.slice(0, -1);
        let finalTempkeys = ['SNo'].concat(keyarr3);
        // tempkeys.splice(0, 0, 'SNo');
        // printarray = printarray.map((x) => {
        //   delete x.recname;
        //   return x;
        // });

        printarray.forEach((item, id) => {
            finalTempkeys.forEach((key) => {
                if (item[key] == undefined && key != 'SNo') item[key] = 0;
                if (key == 'SNo') item[key] = id + 1;
            });
        });
        printarray.find((item) => {
            this.Recipes.find((rcp) => {
                if (item.Recipe == rcp.rcpid) {
                    item['uom'] = rcp.uom;
                    item['Recipe'] =
                        item.Recipe + '-' + item.recname + '-' + rcp.tname;
                    // this.totalprice += parseInt(item.TotalAmount);
                }
            });
        });
        for (let i in printarray) {
            if (printarray[i].uom == 'gms' || printarray[i].uom == 'ml') {
                if (printarray[i].TotalReqQty >= 1000) {
                    printarray[i].TotalReqQty =
                        printarray[i].TotalReqQty / 1000;
                    if (printarray[i].uom == 'gms') printarray[i].uom = 'Kgs';
                    else if (printarray[i].uom == 'ml') printarray[i].uom = 'L';
                }
            }
        }
        console.log(printarray);
        console.log(tempkeys);
        let pusharray = [];
        let hdarray1 = headarray.slice(0, -1);

        let finaltablehead = hdarray1.slice(0, -1);
        console.log('h', finaltablehead);
        let finalheadarray = [];
        for (let i = 0; i < finaltablehead.length; i++) {
            let obj = {};
            obj['text'] = finaltablehead[i];
            obj['font'] = 'telugu';
            finalheadarray.push(obj);
        }
        pusharray.push(finalheadarray);

        for (let i = 0; i < printarray.length; i++) {
            let rowArr = [];
            for (let j = 0; j < finalTempkeys.length; j++) {
                // if(tempkeys[j]!="TotalAmount"){
                if (finalTempkeys[j] == 'TotalReqQty') {
                    printarray[i].TotalReqQty =
                        printarray[i].TotalReqQty + ' ' + printarray[i].uom;
                }
                rowArr.push(printarray[i][finalTempkeys[j]] + '');
                // }
            }
            pusharray.push(rowArr);
        }

        console.log(pusharray);
        let docDefinition = {
            defaultStyle: {
                font: 'telugu', // use your font name here
            },
            content: [
                // Previous configuration
                {
                    text: 'Event Recipes :' + ' ' + uniqueEventDates,
                },
                {
                    text: eventnames.toString(),
                },
                {
                    table: {
                        headerRows: 1,

                        // body: [
                        //   this.headingArray,
                        //   ...printarray.map((p, i) => {
                        //     for(let j = 0; j < tempkeys.length; j++) {
                        //       [p[tempkeys[j]] + ''];
                        //     }
                        //   }),
                        // ],
                        body: pusharray,
                    },
                },
            ],
        };
        console.log(docDefinition);
        let finalarray = [];

        console.log(finalarray);
        pdfMake.createPdf(docDefinition).download('new file.pdf');
    }
    async dateRangeChange(
        startDate: HTMLInputElement,
        endDate: HTMLInputElement
    ) {
        if (startDate.value && endDate.value) {
            let datePayload = {};
            datePayload['startDate'] = moment(startDate.value).format(
                'YYYY-MM-DD'
            );
            datePayload['endDate'] = moment(endDate.value).format('YYYY-MM-DD');
            datePayload['vendorId'] = this.vendorId;
            const resp = await this.service.fetchRequestPost(
                'keventheader/geteventbydate',
                datePayload
            );
            this.events = resp['keventheaderList'];
            this.events = this.events.filter((item) => {
                if (item.status != 'Completed') return item;
            });
            for (let i in this.events) {
                this.events[i]['eventwithdate'] =
                    this.events[i].keventname + '-' + this.events[i].eventdate;
            }
        }
    }
}
