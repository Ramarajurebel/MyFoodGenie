import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventItems } from './../../shared/classes/event-items';
import { EventItemsColumns } from './../../shared/tables/eventitems-columns';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Recipes } from './../../shared/classes/rcpheader';
import { Subject } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { Events } from '../../shared/classes/events';
import { takeUntil } from 'rxjs/operators';
import { fill } from 'lodash';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-events-child',
    templateUrl: './events-child.component.html',
    styleUrls: ['./events-child.component.scss'],
})
export class EventsChildComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    appearnce: MatFormFieldModule = fill;
    eventsData: Events[];
    eventRcpItems: EventItems[];
    eventRcpItemsTable = new MatTableDataSource<EventItems>();
    displayedColumns: string[] = EventItemsColumns.map((col) => col.key);
    columnsSchema: any = EventItemsColumns;
    eventItemsFormGroup: FormGroup;
    public filteredrecipe = [];
    public TableFieldsForm: FormGroup;
    public EventReceipes: FormGroup;
    public rcpplatters: FormControl = new FormControl();
    loading = false;
    public editMode = false;
    public Status = ['Open', 'Completed', 'In Progress'];
    allOpenEvents = [];
    public evtStatus = [
        'Open',
        'Preparation',
        'Ready for Sale',
        'Sales InProgress',
        'Completed',
    ];
    public keventid: number;
    stallData = [];
    stallName: string;
    public Categories = ['Kitchen', 'Event', 'Catering'];
    public stalloperator = [];
    public type = ['Lunch', 'Dinner', 'Tiffins', 'Snacks'];
    public previousStatus: string;
    productsList = [];
    modalReference: any;
    public selectedDateEvents = [];
    public temparray = [];
    public eventitems = [];
    public eventsarray = [];
    protected _onDestroy = new Subject<void>();
    public eventitemsarray = [];
    public defaultarray = [];
    public events = [];
    public Recipes = [];
    allEvents = [];
    public categories = ['Vegetables', 'Groceries', 'Non Veg', 'Others'];
    public rcpcontrol: FormControl = new FormControl('');
    public recipesearch: FormControl = new FormControl();
    public copyEvent: FormGroup;
    public delobj = {};
    copydropdownSettings: IDropdownSettings;
    recipesettings: IDropdownSettings;
    purchaseorder: FormControl = new FormControl('');
    category: FormControl = new FormControl('');
    available: FormControl = new FormControl('');
    groupidData = [1, 2, 3, 4, 5, 6, 7];
    adhocpoitemid: number;
    adhocpoid: number;
    mobilePoItems: EventItems[];
    recipes: Recipes[];
    selectedRow: EventItems;
    isMatDrawerOpened: boolean = false;
    isEventDetails: boolean = false;
    isRecipeItemDetails: boolean = false;
    public outputqty: FormControl = new FormControl();
    public rcpprice: FormControl = new FormControl();
    public minQuant: FormControl = new FormControl();
    public eventitemsid: number;
    recStatusData = ['Open', 'Completed', 'In Progress'];
    eventStatus = [
        'Open',
        'Preparation',
        'Ready for Sale',
        'Sales InProgress',
        'Completed',
    ];
    searchFormGroup: FormGroup;
    menuId = 0;
    isEventItemsOpened: boolean = false;
    eventItemId: number = 0;
    vendorId = 0;
    vendorData = [];
    constructor(
        private service: ProjectService,
        private router: Router,
        private modalService: NgbModal,
        private _snackBar: MatSnackBar,
        private dialog: MatDialog,
        @Inject(LOCALE_ID) public locale: string
    ) {}

    async ngOnInit() {
        let vendorIdStr = localStorage.getItem('vendorId');
        if (vendorIdStr) {
            this.vendorId = parseInt(vendorIdStr);
        }
        this.eventItemsFormGroup = new FormGroup({
            // stalloperatorid: new FormControl(''),
            recid: new FormControl(''),
            recname: new FormControl(''),
            keventid: new FormControl(''),
            platterscount: new FormControl(''),
            outputqty: new FormControl(''),
            totalprice: new FormControl(''),
            recstatus: new FormControl(''),
            tname: new FormControl(''),
            groupid: new FormControl(''),
            category: new FormControl(''),
            starttime: new FormControl(''),
            stallid: new FormControl(''),
            // rcpprice: new FormControl(''),
        });
        this.copyEvent = new FormGroup({
            keventid: new FormControl(''),
            selectdate: new FormControl(''),
            neweventdate: new FormControl(''),
        });
        this.TableFieldsForm = new FormGroup({
            // stalloperatorid: new FormControl(''),
            keventname: new FormControl(''),
            platterscount: new FormControl(''),
            totalitems: new FormControl(''),
            totalcost: new FormControl(''),
            status: new FormControl(''),
            eventdate: new FormControl(''),
            assdto: new FormControl(''),
            category: new FormControl(''),
            seq: new FormControl(''),
            type: new FormControl(''),
            stallid: new FormControl(''),
            instructions: new FormControl(''),
            vendorId: new FormControl(),
        });
        this.searchFormGroup = new FormGroup({
            status: new FormControl(''),
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
        });

        this.copydropdownSettings = {
            singleSelection: false,
            idField: 'keventid',
            textField: 'keventnamewithtype',
        };
        this.recipesettings = {
            singleSelection: false,
            idField: 'rcpid',
            textField: 'name',

            allowSearchFilter: true,
        };
        // creataing empty array for pushing adhocpoitems

        // adhoc items

        const eventItemsResp = await this.service.fetchRequest(
            'keventheaderitems/getAllkeventheaderitems'
        );
        this.eventRcpItems = eventItemsResp['keventheaderitemsList'];
        // Recipes for main ingr quantity and outputquantity and required quantity
        const getrecpresp = await this.service.fetchRequest(
            'rcpheader/getAllrcpheader'
        );
        this.recipes = getrecpresp['rcpheaderList'];

        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        // for adding maing ingr quantty and required quanitty and outputquantity in to recipes
        this.recipes.forEach((rcp) => {
            this.eventRcpItems.forEach((rcpitem) => {
                if (rcpitem.recid === rcp.rcpid) {
                    rcpitem['tname'] = rcp.tname;
                    rcpitem['defaultMainIngrQty'] = rcp.minquantity;
                    rcpitem['defaultOutputQty'] = rcp.outputquantity;
                    rcpitem['defaultPrice'] = rcp.totalcost;
                }
            });
        });
        this.selectedDateEvents = [];
        let datePayload = {};
        datePayload['startDate'] = formatDate(
            new Date(),
            'YYYY-MM-dd',
            this.locale
        );
        datePayload['endDate'] = formatDate(
            new Date(),
            'YYYY-MM-dd',
            this.locale
        );
        datePayload['vendorId'] = this.vendorId;
        const resp = await this.service.fetchRequestPost(
            'keventheader/geteventbydate',
            datePayload
        );
        this.eventsData = resp['keventheaderList'];
        this.eventsData = this.eventsData.filter((event) => {
            return event.status != 'Completed';
        });

        const payload = {
            catid: 112,
            prodid: 0,
            vendorId: this.vendorId,
        };
        const getproducts = await this.service.fetchRequestPost(
            '/rest/product/ProductsByVariants',
            payload
        );
        this.productsList = getproducts['productitems'];
        this.eventsData.forEach((adhoc) => {
            adhoc['eventItems'] = [];
        });
        this.eventsData.forEach((evt) => {
            this.eventRcpItems.forEach((item) => {
                if (evt.keventid === item.keventid) {
                    item.eventName = evt.keventname;
                    item['eventDate'] = evt.eventdate;
                    item['eventType'] = evt.type;
                    item['plattersCount'] = evt.platterscount;
                    evt.eventItems.push(item);
                    evt.childActive = false;
                    evt.isEdit = false;
                }
            });
        });

        console.log(this.eventsData);

        //   this.selectedDateEvents = [];
        const stallresp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.stalloperator = stallresp['stallOperatorList'];
        const stallDataresp = await this.service.fetchRequest(
            'stall/getAllStalls'
        );
        this.stallData = stallDataresp['supplierList'];
        const getkevents = await this.service.fetchRequest(
            'keventheader/getAllkeventheader'
        );
        this.events = getkevents['keventheaderList'];
        this.allOpenEvents = this.events.filter((event) => {
            return event.status != 'Completed';
        });
        //   const getrecpresp = await this.service.fetchRequest(
        //     'rcpheader/getAllrcpheader'
        //   );
        this.Recipes = getrecpresp['rcpheaderList'];

        this.eventRcpItems.forEach((item) => {
            this.Recipes.forEach((elemt) => {
                if (item.recid == elemt.rcpid) item['tname'] = elemt.tname;
            });
        });
        // For Main Ingredient Quantity

        for (let i in this.events) {
            if (this.events[i].status != 'Completed') {
                this.eventsarray.push(this.events[i]);
            }
        }
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
    async PoItemRowSave(rowData: EventItems) {
        this.isMatDrawerOpened = true;
        this.isEventItemsOpened = true;
        // this.columnsSchema.forEach((col) => {
        //     if (col.key === 'outputqty') {
        //         col.columnActive = false;
        //     }
        // });
        // let totalPrice = 0;
        // this.eventRcpItems.forEach((item) => {
        //     if (item.keventid === rowData.keventid) {
        //         let price = +item.totalprice;
        //         totalPrice += price;
        //     }
        // });
        // console.log(totalPrice);
        // this.eventsData.forEach((event) => {
        //     if (event.keventid == rowData.keventid)
        //         event.totalcost = totalPrice;
        // });
        // console.log(rowData);

        this.eventItemsFormGroup.patchValue({
            recid: rowData.recid,
            recname: rowData.recname,
            tname: rowData?.tname,
            keventid: rowData.keventid,
            platterscount: rowData.platterscount,
            outputqty: rowData?.outputqty,
            totalprice: rowData?.totalprice,
            recstatus: rowData?.recstatus,
            groupid: rowData?.groupid,
            category: rowData?.category,
            starttime: rowData?.starttime,
        });
        console.log(this.eventItemsFormGroup.value);
        const data = this.eventItemsFormGroup.value;
        data['eventitemsid'] = rowData.eventitemsid;
        data.groupid = parseInt(data.groupid);
        data.platterscount = parseInt(data.platterscount);
        data.outputqty = parseInt(data.outputqty);
        data.totalprice = parseFloat(data.totalprice);
        const saveResp = await this.service.fetchRequestPost(
            'keventheaderitems/createkeventheaderitems',
            data
        );
        rowData.isEdit = false;
    }
    async onSearch() {
        let startDate = this.searchFormGroup.controls['startDate'].value;
        let endDate = this.searchFormGroup.controls['endDate'].value;
        let status = this.searchFormGroup.controls['status'].value;

        const eventItemsResp = await this.service.fetchRequest(
            'keventheaderitems/getAllkeventheaderitems'
        );
        this.eventRcpItems = eventItemsResp['keventheaderitemsList'];
        if (startDate && endDate) {
            let datePayload = {};
            datePayload['startDate'] = formatDate(
                startDate,
                'YYYY-MM-dd',
                this.locale
            );
            datePayload['endDate'] = formatDate(
                endDate,
                'YYYY-MM-dd',
                this.locale
            );
            datePayload['vendorId'] = this.vendorId;
            const resp = await this.service.fetchRequestPost(
                'keventheader/geteventbydate',
                datePayload
            );
            this.eventsData = resp['keventheaderList'];
        }
        if (!status) {
            this.eventsData = this.eventsData.filter((event) => {
                return event.status != 'Completed';
            });
        } else if (status) {
            this.eventsData = this.eventsData.filter((event) => {
                return event.status === status;
            });
        }
        this.eventsData.forEach((adhoc) => {
            adhoc['eventItems'] = [];
        });
        this.eventsData.forEach((evt) => {
            this.eventRcpItems.forEach((item) => {
                if (evt.keventid === item.keventid) {
                    item.eventName = evt.keventname;
                    item['eventDate'] = evt.eventdate;
                    item['eventType'] = evt.type;
                    item['plattersCount'] = evt.platterscount;
                    evt.eventItems.push(item);
                    evt.childActive = false;
                    evt.isEdit = false;
                }
            });
        });
        this.eventRcpItems.forEach((item) => {
            this.Recipes.forEach((elemt) => {
                if (item.recid == elemt.rcpid) item['tname'] = elemt.tname;
            });
        });
    }
    onStallChange(value) {
        console.log(value);
        this.stallData.forEach((stall) => {
            if (stall.stallid == value) this.stallName = stall.name;
        });
    }
    copyevent(modal) {
        this.modalReference = this.modalService.open(modal);
    }
   async ondateSelect(value) {
        console.log(value);
        this.selectedDateEvents = [];
        let date = value;

        const payload = {};
        payload['startDate'] = date;
        payload['endDate'] = date;
        payload['vendorId'] = this.vendorId;
        const eventsResp = await this.service.fetchRequestPost(
            'keventheader/geteventbydate',
            payload
        );

        this.selectedDateEvents = eventsResp['keventheaderList'];
        this.selectedDateEvents.forEach((obj) => {
            obj['keventnamewithtype'] = obj.keventname + ' ' + obj.type;
        });
    }
    async geteventmenuheader(data) {
        // const resp = await this.service.fetchRequest(
        //   'keventheader/getAllkeventheader'
        // );
        // this.events = resp['keventheaderList'];
        // const eventItemsResp = await this.service.fetchRequest(
        //     'keventheaderitems/getAllkeventheaderitems'
        // );
        // this.eventRcpItems = eventItemsResp['keventheaderitemsList'];
        this.temparray = this.events;
        this.allEvents = this.events;
        let rcpname = this.rcpcontrol.value;
        if (data != 0 && rcpname) {
            let recname: string;
            let recid: number;
            let keventid = 0;

            for (let i in rcpname) {
                for (let j in this.Recipes) {
                    if (rcpname[i].rcpid == this.Recipes[j].rcpid) {
                        rcpname[i]['platterscount'] = this.Recipes[
                            j
                        ].minquantity;
                        rcpname[i]['outputqty'] = this.Recipes[
                            j
                        ].outputquantity;
                        rcpname[i]['recname'] = this.Recipes[j].name;
                        rcpname[i]['recid'] = this.Recipes[j].rcpid;
                        rcpname[i]['totalprice'] = this.Recipes[i].totalcost;
                        rcpname[i]['tname'] = this.Recipes[i]?.tname;
                    }
                }
            }

            console.log(rcpname);
            // for(let i in this.events){
            //   if(data.keventid==this.events[i].keventname){
            //     keventid= this.events[i].keventid
            //   }
            // }
            console.log(keventid);

            for (let i in rcpname) {
                let payload = {
                    eventitemsid: 0,
                    keventid: data.keventid,
                    recid: rcpname[i].recid,
                    recname: rcpname[i].name,
                    platterscount: rcpname[i].platterscount,
                    outputqty: rcpname[i].outputqty,
                    totalprice: rcpname[i].totalprice,
                    recstatus: 'Open',
                    category: 'Kitchen',
                    seq: 0,
                    starttime: null,
                    tname: rcpname[i].tname,
                };
                const saveresp = await this.service.fetchRequestPost(
                    'keventheaderitems/createkeventheaderitems',
                    payload
                );
            }
        }
        this.defaultarray = [];
        this.rcpcontrol.reset();
        //  for default status open and in progress
        this.onSearch();
    }
    onAddEvents() {
        this.isMatDrawerOpened = true;
        this.isEventDetails = true;
        this.isEventItemsOpened = false;
        this.TableFieldsForm.controls['eventdate'].setValue(
            new Date().toISOString().split('T')[0]
        );
        this.TableFieldsForm.controls['vendorId'].setValue(this.vendorId);
    }
    async OnSaveEvent() {
        console.log('Click');
        this.loading = true;
        let data = this.TableFieldsForm.value;
        console.log(data);
        let saveBtn = document.getElementById('savebtnId') as HTMLInputElement;

        // this.TableFieldsForm.markAllAsTouched();

        saveBtn.disabled = true;
        if (this.editMode) {
            const editdata = this.TableFieldsForm.getRawValue();
            editdata['keventid'] = this.keventid;
            editdata.stallid = parseInt(editdata.stallid);
            editdata['stallname'] = this.stallName;
            let temparray = this.events;

            temparray.filter((item) => {
                if (item.keventid == this.keventid) {
                    editdata['createddatetime'] = item.createddatetime;
                    editdata['totalitems'] = item.totalitems;
                    editdata['totalcost'] = item.totalcost;
                    editdata['updateddatetime'] = item.updateddatetime;
                }
            });
            // editdata.eventdate = moment(editdata.eventdate).format('YYYY-MM-DD');
            // let datePayload = {};
            editdata['eventdate'] = formatDate(
                editdata.eventdate,
                'YYYY-MM-dd',
                this.locale
            );
            const editresp = await this.service.postResponseAsText(
                'keventheader/createkeventheader',
                editdata
            );
            let eventStatus = editdata.status;
            if (editresp) {
                this._snackBar.open(editresp, 'Close', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 5 * 1000,
                });
                saveBtn.disabled = false;
            } else {
                this._snackBar.open('Something Failed', 'Close', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 5 * 1000,
                });
            }
            if (
                eventStatus != this.previousStatus &&
                eventStatus === 'Preparation'
            ) {
                const payload = {};
                payload['eventdate'] = editdata.eventdate;
                payload['keventid'] = editdata.keventid;
                payload['eventtype'] = editdata.type;
                const preparationResp = await this.service.fetchRequestPost(
                    'recipepreparation/setpreparationdata',
                    payload
                );
            }
            console.log('In Edit Mode');
            this.editMode = false;
            saveBtn.disabled = false;
            this.geteventmenuheader(editdata);

            this.TableFieldsForm.reset();
            this.isMatDrawerOpened = false;
            this.isEventDetails = false;
        } else {
            this.editMode = false;
            const data = this.TableFieldsForm.getRawValue();
            data['keventid'] = 0;
            data.stallid = parseInt(data.stallid);
            data['stallname'] = this.stallName;
            data.eventdate = moment(data.eventdate).format('YYYY-MM-DD');
            // data.minduration = parseInt(data.minduration);
            // data.minquantity = parseInt(data.minquantity);
            data.totalitems = 0;
            data.totalcost = 0;
            data.platterscount = parseInt(data.platterscount);
            const saveresp = await this.service.postResponseAsText(
                'keventheader/createkeventheader',
                data
            );
            if (saveresp) {
                this._snackBar.open(saveresp, 'Close', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 5 * 1000,
                });
                saveBtn.disabled = false;
            } else {
                this._snackBar.open('Something Failed', 'Close', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 5 * 1000,
                });
            }
            let keventid = saveresp;
            // let menuid = this.menuId.value;
            // if (menuid) {
            //   this.menuRecipes(menuid, keventid);
            // }

            // for(let i in rcpname){
            //   let payload={
            //     recid=
            //   }
            // }

            // console.log(saveresp);

            this.geteventmenuheader(0);

            this.TableFieldsForm.reset();
            this.isMatDrawerOpened = false;
            this.isEventDetails = false;
            saveBtn.disabled = false;
        }
        saveBtn.disabled = false;

        this.loading = false;
    }
    oneditEvent(event) {
        this.isMatDrawerOpened = true;
        this.isEventDetails = true;
        this.isEventItemsOpened = false;
        this.keventid = event.keventid;
        this.TableFieldsForm.controls['vendorId'].disable();
        this.TableFieldsForm.patchValue({
            keventname: event.keventname,
            platterscount: event.platterscount,
            totalitems: event.totalitems,
            totalcost: event.totalcost,
            status: event.status,
            eventdate: event.eventdate,
            assdto: event.assdto,
            category: event?.category,
            seq: event?.seq,
            type: event.type,
            stallid: event?.stallid,
            instructions: event?.instructions,
            vendorId: event?.vendorId,
        });
        this.previousStatus = event.status;
        this.editMode = true;
    }
    OnAddReceipeItem() {
        this.isMatDrawerOpened = true;
        this.isEventDetails = false;
        this.isEventItemsOpened = true;
        // this.isRecipeItemDetails =true;
    }
    // async getEventitems() {
    //     this.temparray = [];
    //     this.eventitems = [];
    //     this.eventitemsarray = [];
    //     this.eventsarray = [];
    //     const getresp = await this.service.fetchRequest(
    //       'keventheaderitems/getAllkeventheaderitems'
    //     );
    //     this.eventitems = getresp['keventheaderitemsList'];
    //     this.temparray = this.eventitems;
    //     // for(let i in this.events){
    //     //   if(this.events[i].status=="Open"){
    //     //     this.eventsarray.push(this.events[i])
    //     //   }
    //     // }
    //     this.events = this.events.filter((item) => {
    //       if (item.status != 'Completed') {
    //         return item;
    //       }
    //     });
    //     for (let i in this.events) {
    //       for (let j in this.eventitems) {
    //         if (this.eventitems[j].keventid == this.events[i].keventid) {
    //           this.eventitems[j]['eventname'] = this.events[i].keventname;
    //           this.eventitems[j]['eventDate'] = this.events[i].eventdate;
    //         }
    //       }
    //     }
    //     for (let i in this.Recipes) {
    //       for (let j in this.eventitems) {
    //         if (this.eventitems[j].recid == this.Recipes[i].rcpid) {
    //           this.eventitems[j]['mainingrquant'] = this.Recipes[i].minquantity;
    //         }
    //       }
    //     }

    //     for (let i in this.eventitems) {
    //       for (let j in this.events) {
    //         if (this.events[j].keventid == this.eventitems[i].keventid) {
    //           this.eventitemsarray.push(this.eventitems[i]);
    //         }
    //       }
    //     }

    //     this.eventitems = this.eventitemsarray;

    //     for (let i in this.Recipes) {
    //       for (let j in this.eventitems) {
    //         if (this.eventitems[j].recid == this.Recipes[i].rcpid) {
    //           this.eventitems[j]['mainingrquant'] = this.Recipes[i].minquantity;
    //         }
    //       }
    //     }
    //     // tname
    //     this.eventitems.forEach((item) => {
    //       this.Recipes.forEach((elemt) => {
    //         if (item.recid == elemt.rcpid) item['tname'] = elemt.tname;
    //       });
    //     });
    //     let eventname = this.orderForm.controls['eventname'].value;
    //     let recipename = this.orderForm.controls['recipename'].value;
    //     if (eventname || recipename) {
    //       this.onSearch();
    //     }
    //   }
    async OnSaveRcpItem() {
        // this.TableFieldsForm.markAllAsTouched();

        if (this.editMode) {
            const editdata = this.eventItemsFormGroup.value;
            editdata['eventitemsid'] = this.eventItemId;
            editdata.groupid = parseInt(editdata.groupid);
            editdata.platterscount = parseInt(editdata.platterscount);
            editdata.eventdate = moment(editdata.eventdate).format(
                'YYYY-MM-DD'
            );
            const editresp = await this.service.fetchRequestPost(
                'keventheaderitems/createkeventheaderitems',
                editdata
            );
            console.log('In Edit Mode');
            this.editMode = false;

            this.isEventItemsOpened = false;
            this.isMatDrawerOpened = false;
            this.isEventDetails = false;
            this.eventItemsFormGroup.reset();
            this.onSearch();
        } else {
            this.editMode = false;
            const data = this.eventItemsFormGroup.value;
            data.groupid = parseInt(data.groupid);
            data.platterscount = parseInt(data.platterscount);
            data['eventitemsid'] = 0;
            // data.createdDate= moment(data.createdDate).format("YYYY-MM-DD");

            const saveresp = await this.service.fetchRequestPost(
                'keventheaderitems/createkeventheaderitems',
                data
            );

            console.log(saveresp);

            this.isEventItemsOpened = false;
            this.isMatDrawerOpened = false;
            this.isEventDetails = false;
            this.onSearch();
        }
    }
    onEnterPress() {
        let rcpoutputquantity = this.outputqty.value;
        let requiredqty = this.eventItemsFormGroup.controls['platterscount']
            .value;
        let mainingrqty = this.minQuant.value;
        let rcpprice = this.rcpprice.value;
        let finalprice = (requiredqty / mainingrqty) * rcpprice;

        let finaloptqty = (requiredqty / mainingrqty) * rcpoutputquantity;
        this.eventItemsFormGroup.controls['outputqty'].setValue(finaloptqty);
        this.eventItemsFormGroup.controls['totalprice'].setValue(finalprice);
    }
    onrecipechange(value) {
        const id = value;
        let recipename = '';
        let rcpplatters = 0;
        let minquantity = 0;
        let rcpoutput = 0;
        let rcpcost = 0;
        let tname = '';
        let groupid = 0;
        for (let i in this.Recipes) {
            if (id == this.Recipes[i].rcpid) {
                recipename = this.Recipes[i].name;
                rcpplatters = this.Recipes[i].platterscount;
                minquantity = this.Recipes[i].minquantity;
                rcpoutput = this.Recipes[i].outputquantity;
                rcpcost = this.Recipes[i].totalcost;
                tname = this.Recipes[i]?.tname;
                groupid = this.Recipes[i]?.groupid;
            }
            console.log(recipename);
        }
        this.eventItemsFormGroup.controls['recname'].setValue(recipename);
        this.eventItemsFormGroup.controls['tname'].setValue(tname);
        this.eventItemsFormGroup.controls['groupid'].setValue(groupid);
        this.rcpplatters.setValue(rcpplatters);
        this.minQuant.setValue(minquantity);
        this.outputqty.setValue(rcpoutput);
        this.rcpprice.setValue(rcpcost);
        this.eventItemsFormGroup.controls['outputqty'].setValue(rcpoutput);
        this.eventItemsFormGroup.controls['totalprice'].setValue(rcpcost);
    }
    async confirm() {
        this.modalReference.close();
        if (this.isEventDetails) {
            const delresp = await this.service.fetchRequestdel(
                'keventheader/deletekeventheader',
                this.delobj
            );
        }
        if (this.isEventItemsOpened) {
            const delresp = await this.service.fetchRequestdel(
                'keventheaderitems/deletekeventheaderitems',
                this.delobj
            );
        }
        this.geteventmenuheader(0);
        this.OnClose(true);
    }
    decline() {
        this.modalReference.close();
    }
    OnDel(popup) {
        this.modalReference = this.dialog.open(popup);
        this.delobj = {};
        if (this.isEventDetails) {
            this.delobj['keventid'] = this.keventid;
        }
        if (this.isEventItemsOpened) {
            this.delobj['eventitemsid'] = this.eventItemId;
        }
    }
    async OnNewEventCreate() {
        if (this.copyEvent.valid) {
            let data = this.copyEvent.value;
            console.log(data);
            let keventids = data.keventid;
            let payload = {};

            payload['eventdate'] = data.neweventdate;
            if (keventids.length != 0 && keventids.length > 1) {
                keventids.forEach(async (id) => {

                    payload['keventid'] = id.keventid;
                    this.selectedDateEvents.forEach(async (events) => {
                        if (events.keventid == id.keventid) {
                            payload['keventname'] = events.keventname;
                            const resp = await this.service.fetchRequestPost(
                                'keventheader/keventcopy',
                                payload
                            );
                        }
                    });
                });
                this.modalReference.close();
                this.copyEvent.reset();
                //   this.geteventmenuheader(0);
                this.onSearch();
            } else {
                payload['keventid'] = keventids[0].keventid;
                this.selectedDateEvents.forEach((event) => {
                    if (event.keventid === keventids[0].keventid)
                        payload['keventname'] = event.keventname;
                });

                const resp = await this.service.fetchRequestPost(
                    'keventheader/keventcopy',
                    payload
                );
                this.modalReference.close();
                this.copyEvent.reset();
                //   this.geteventmenuheader(0);
                this.onSearch();
            }
        } else {
            this.modalReference.close();
        }
    }
    OnRequiredQuantityEnter(value) {
        console.log(value);
        let requiredQuantity = value;
        let recipemaingrQuantity = this.selectedRow.defaultMainIngrQty;
        let recipeOutputQty = this.selectedRow.defaultOutputQty;
        let recipePrice = this.selectedRow.defaultPrice;
        let finalprice =
            (requiredQuantity / recipemaingrQuantity) * recipePrice;

        let finaloptqty =
            (requiredQuantity / recipemaingrQuantity) * recipeOutputQty;
        finaloptqty = parseFloat(finaloptqty.toFixed(2));
        this.selectedRow.outputqty = finaloptqty;
        this.selectedRow.totalprice = finalprice;
    }
    async OnEditPress(rowData: EventItems) {
        this.isMatDrawerOpened = true;
        this.isEventItemsOpened = true;
        this.editMode = true;
        this.eventItemId = rowData.eventitemsid;
        // this.columnsSchema.forEach((col) => {
        //     if (col.key === 'outputqty') {
        //         col.columnActive = false;
        //     }
        // });
        // let totalPrice = 0;
        // this.eventRcpItems.forEach((item) => {
        //     if (item.keventid === rowData.keventid) {
        //         let price = +item.totalprice;
        //         totalPrice += price;
        //     }
        // });
        // console.log(totalPrice);
        // this.eventsData.forEach((event) => {
        //     if (event.keventid == rowData.keventid)
        //         event.totalcost = totalPrice;
        // });
        // console.log(rowData);

        this.eventItemsFormGroup.patchValue({
            recid: rowData.recid,
            recname: rowData.recname,
            tname: rowData?.tname,
            keventid: rowData.keventid,
            platterscount: rowData.plattersCount,
            outputqty: rowData?.outputqty,
            totalprice: rowData?.totalprice,
            recstatus: rowData?.recstatus,
            groupid: rowData?.groupid,
            category: rowData?.category,
            starttime: rowData?.starttime,
        });
        let recipeplatters = '';
        let minquantity = 0;
        let rcpprice = 0;
        let rcpoutput = 0;
        for (let i in this.Recipes) {
            if (rowData.recid == this.Recipes[i].rcpid) {
                recipeplatters = this.Recipes[i].platterscount;
                minquantity = this.Recipes[i].minquantity;
                rcpprice = this.Recipes[i].totalcost;
                rcpoutput = this.Recipes[i].outputquantity;
            }
        }
        this.rcpplatters.setValue(recipeplatters);
        this.minQuant.setValue(minquantity);
        this.rcpprice.setValue(rcpprice);
        this.outputqty.setValue(rcpoutput);
    }
    CancelRow(row) {
        row.isEdit = false;
        this.columnsSchema.forEach((col) => {
            if (col.key === 'outputqty') {
                col.columnActive = false;
            }
        });
    }
    SortIngr(rcpIngr) {
        rcpIngr.sort((a, b) => {
            if (a?.prodName && b?.prodName) {
                const nameA = a.prodName.toUpperCase(); // ignore upper and lowercase
                const nameB = b.prodName.toUpperCase(); // ignore upper and lowercase

                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
            }
            // names must be equal
            return 0;
        });
        return rcpIngr;
    }
    OnExport(modal) {
        this.modalReference = this.modalService.open(modal);
    }
    OnClose(reason) {
        this.isMatDrawerOpened = false;
        this.isEventDetails = false;
        this.isEventItemsOpened = false;
        this.isRecipeItemDetails = false;
        this.purchaseorder.reset();
        this.category.reset();
        this.available.reset();
        this.rcpcontrol.reset();
        this.eventItemsFormGroup.reset();
        this.editMode = false;
        this.TableFieldsForm.reset();
        if (this.modalReference) this.modalReference.close(reason);
    }
    onSavePopup() {
        // let purchaseorder = this.purchaseorder.value;
        // let category = this.category.value;
        // let items = [];
        // let available = this.available.value;
        // if (purchaseorder && category && available) {
        //     if (category === 'All' && available === 'All') {
        //         items = this.eventRcpItems.filter((item) => {
        //             return item.adhocpoid === parseInt(purchaseorder);
        //         });
        //     } else {
        //         let temp = [];
        //         for (let key in this.eventRcpItems) {
        //             if (category != 'All') {
        //                 if (
        //                     this.eventRcpItems[key].adhocpoid ===
        //                         parseInt(purchaseorder) &&
        //                     this.eventRcpItems[key].category === category
        //                 ) {
        //                     temp.push(this.eventRcpItems[key]);
        //                 }
        //             } else if (available != 'All') {
        //                 if (
        //                     this.eventRcpItems[key].adhocpoid ===
        //                         parseInt(purchaseorder) &&
        //                     this.eventRcpItems[key].available + '' === available
        //                 ) {
        //                     temp.push(this.eventRcpItems[key]);
        //                 }
        //             }
        //         }
        //         items = temp;
        //     }
        //     if (items) {
        //         this.modalReference.close();
        //         items = this.SortItems(items);
        //         let adhocData = this.eventsData.filter((item) => {
        //             return item.adhocpoid === parseInt(purchaseorder);
        //         });
        //         this.OnPdfPress(items, adhocData);
        //     }
        // }
        // this.purchaseorder.reset();
        // this.category.reset();
        // this.available.reset();
    }
    SortItems(data) {
        let temp = data.sort((a, b) => {
            if (a.prodName && b.prodName) {
                const nameA = a?.prodName.toUpperCase(); // ignore upper and lowercase
                const nameB = b?.prodName.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
            }
        });

        let order = ['Groceries', 'Vegetables', 'Non Veg', 'Others'];
        let newArray = [];
        order.forEach((orderitem) => {
            return temp.filter((ingr) => {
                if (ingr.category === orderitem) newArray.push(ingr);
            });
        });
        data = newArray;
        return data;
    }
    playAudio() {
        let audio = new Audio();
        audio.src = '../../../assets/audio/Alarm.mp3';
        audio.load();
        audio.play();
    }

    OnPdfPress(data, poData) {
        // this.playAudio();
        let totalAmount = 0;
        data.forEach((item) => {
            totalAmount += item.price;
        });
        data.forEach((row) => {
            if (row.uom == 'gms' || row.uom == 'ml') {
                if (row.quantity >= 1000) {
                    row.quantity = row.quantity / 1000;
                    row.quantity = row.quantity.toFixed(2);
                    if (row.uom == 'gms') row.uom = 'kgs';
                    else if (row.uom == 'ml') row.uom = 'L';
                } else {
                    row.quantity = row.quantity;
                }
            } else {
                row.quantity = row?.quantity;
            }
        });
        console.log(poData.description);
        let docDefinition = {
            defaultStyle: {
                font: 'telugu', // use your font name here
            },
            content: [
                // Previous configuration
                {
                    text: `PO#: ${poData[0].adhocpoid}, Description: ${poData[0].description}`,
                    fontSize: 17,
                },
                {
                    text: `PO Date: ${poData[0].date}, Total Items: ${data.length}, Total Amount: ${totalAmount}`,
                    fontSize: 17,
                },
                {
                    table: {
                        headerRows: 1,
                        body: [
                            [
                                'SNo',
                                'Item ID/Name',
                                'Total Quantity',
                                'Category',
                            ],
                            ...data.map((p, i) => [
                                i + 1,
                                p.prodName + '-' + p.tname,
                                p.quantity + ' ' + p.uom,
                                p.category,
                            ]),
                        ],
                    },
                },
            ],
        };
        console.log(docDefinition);
        // pdfMake
        //     .createPdf(docDefinition)
        //     .download(
        //         poData[0].adhocpoid.toString() +
        //             '-' +
        //             poData[0].description +
        //             '.pdf'
        //     );
    }
    onAdhocItemClick(obj) {
        let adhocpoitemid = obj.adhocpoitemid;
        this.router.routeReuseStrategy.shouldReuseRoute = () => true;
        this.router
            .navigate([`nfm/kitchen-tasks/po-items/item/${adhocpoitemid}`], {
                skipLocationChange: false,
            })
            .then(() => {
                this.router.routeReuseStrategy.shouldReuseRoute = () => false;
            });
    }
    OnAdhocClick() {
        this.router.routeReuseStrategy.shouldReuseRoute = () => true;
        this.router
            .navigate(['nfm/kitchen-tasks/po-items/item'], {
                skipLocationChange: false,
            })
            .then(() => {
                this.router.routeReuseStrategy.shouldReuseRoute = () => false;
            });
    }
    async StatusChange(data: Events, value) {
        let keventid = data.keventid;
        data.status = value;
        const saveresp = await this.service.fetchRequestPost(
            'keventheader/createkeventheader',
            data
        );
        if (value === 'Preparation') {
            const payload = {};
            payload['eventdate'] = data.eventdate;
            payload['keventid'] = data.keventid;
            payload['eventtype'] = data.type;
            const preparationResp = await this.service.fetchRequestPost(
                'recipepreparation/setpreparationdata',
                payload
            );
        }
        // this.ngOnInit();
        console.log(data);
    }
    activatingChild(po) {
        this.eventsData.forEach((item) => {
            if (item.keventid === po.keventid) po.childActive = !po.childActive;
            else item.childActive = false;
        });

        this.eventRcpItemsTable = new MatTableDataSource(po.eventItems);
        this.mobilePoItems = po.eventItems;
    }
    OnDeletePoItem(row) {
        this.adhocpoitemid = row.adhocpoitemid;
        this.adhocpoid = row.adhocpoid;
        row.isDelete = true;
    }

    async Delete() {
        const delObj = {
            adhocpoitemid: this.adhocpoitemid,
        };
        const delResp = await this.service.fetchRequestdel(
            'adhocpoitem/deleteadhocpoitem',
            delObj
        );
        // this.eventsData.forEach((po) => {
        //     if (po.adhocpoid == this.adhocpoid) {
        //         const objWithIdIndex = po.eventItems.findIndex(
        //             (obj) => obj.adhocpoitemid === this.adhocpoitemid
        //         );
        //         po.eventItems.splice(objWithIdIndex, 1);
        //     }
        // });
    }
    CancelDel(row) {
        row.isDelete = false;
        row.isEdit = false;
    }
}
