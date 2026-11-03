import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import * as moment from 'moment';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import * as pdfMakeConfig from 'pdfmake/build/pdfmake.js';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDrawer } from '@angular/material/sidenav';
import { TitleStrategy } from '@angular/router';
@Component({
    selector: 'app-evt-ingr-report',
    templateUrl: './evt-ingr-report.component.html',
    styleUrls: ['./evt-ingr-report.component.scss'],
})
export class EvtIngrReportComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
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
    isMatDrawerOpened: boolean = false;
    public orderForm: FormGroup;
    public prodcount = 0;
    public tprice = 0;
    public categories = ['Vegetables', 'Groceries', 'Non Veg', 'Others'];
    public events = [];
    public geteventitems = [];
    private selectedEvents: any;
    public description: FormControl = new FormControl('');
    public items = [];
    public ingrpayload = { catid: 112, prodid: 0, vendorId: 0 };
    public dropdownSettings: IDropdownSettings;
    public isAdhocpoVisible = false;
    public exportButtonVisible = false;
    modalReference: any;
    createSo: boolean = false;
    createPo: boolean = false;
    catDropdownSettings: IDropdownSettings;
    evtCatArray = [
        {
            value: 'Kitchen',
        },
        {
            value: 'Event',
        },
        {
            value: 'Catering',
        },
    ];
    copyEvents = [];
    vendorId: number = 0;
    async ngOnInit() {
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
        this.catDropdownSettings = {
            singleSelection: false,
            idField: 'value',
            textField: 'value',
            allowSearchFilter: true,
        };
        this.orderForm = new FormGroup({
            keventname: new FormControl(''),
            category: new FormControl(''),
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
            evtCatCtrl: new FormControl(),
        });

        // const eventresp = await this.service.fetchRequest(
        //   'keventheader/getAllkeventheader'
        // );

        // this.events = eventresp['keventheaderList'];
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
        this.events = this.events.filter((item) => {
            if (item.status != 'Completed') return item;
        });
        console.log(this.events);
        for (let i in this.events) {
            this.events[i]['eventwithdate'] =
                this.events[i].keventname +
                '/' +
                this.events[i].platterscount +
                '/' +
                this.events[i].type +
                '/' +
                this.events[i].eventdate;
        }
        this.copyEvents = this.events;
    }
    async onAdhocPOPress(modal) {
        this.createPo = true;
        this.createSo = false;
        this.modalReference = this.modalService.open(modal);
    }
    onCreateSOPress(modal) {
        this.createSo = true;
        this.createPo = false;
        this.modalReference = this.modalService.open(modal);
    }
    onSavePopup() {
        let description = this.description.value;
        if (this.createPo) this.createAdhocData(description);
        if (this.createSo) this.createSoData(description);
    }
    async createAdhocData(description) {
        let payload = {};
        payload['description'] = description;
        let date = new Date();
        let dateformat = moment(date).format('YYYY-MM-DD');
        payload['totalamont'] = 0;
        payload['totalitems'] = 0;
        payload['date'] = dateformat;
        payload['purchasedby'] = '';
        payload['purchasedat'] = '';
        payload['status'] = 'Open';
        payload['paidamount'] = 0;
        payload['category'] = '';
        payload['balance'] = 0;
        payload['paymentstatus'] = 'Not Paid';
        const createadhoc = await this.service.fetchRequestPost(
            'adhocpo/createAdhocpo',
            payload
        );
        console.log(createadhoc);
        this.modalReference.close();
        let adhocpoid = createadhoc;
        let items = this.geteventitems;
        let adhocpoitempayload = {};
        this.geteventitems.forEach(async (item) => {
            let adhocpoitempayload = {};
            let price =
                parseFloat(item.totalPrice.toFixed(2)) / item.totalQuantity;
            adhocpoitempayload['adhocpoid'] = adhocpoid;
            adhocpoitempayload['category'] = item.category;
            adhocpoitempayload['productlist'] = item.itemid;
            adhocpoitempayload['quantity'] = item.totalQuantity;
            adhocpoitempayload['purchasedquantity'] = item.totalQuantity;
            adhocpoitempayload['uom'] = item.uom;
            adhocpoitempayload['finalprice'] = parseFloat(
                item.totalPrice.toFixed(2)
            );
            adhocpoitempayload['available'] = false;
            adhocpoitempayload['price'] = price;
            adhocpoitempayload['lastpddate'] = null;
            adhocpoitempayload['lastpdfrom'] = null;
            adhocpoitempayload['lastpdprice'] = null;
            adhocpoitempayload['ispacked'] = false;
            adhocpoitempayload['isreceived'] = false;

            const adhocpoitem = await this.service.fetchRequestPost(
                'adhocpoitem/createadhocpoitem',
                adhocpoitempayload
            );
        });
        this.description.reset();
        this.createPo = false;
        this.createSo = false;
    }
    async createSoData(description) {
        let payload = {};
        payload['saleorderid'] = 0;
        payload['description'] = description;
        let date = new Date();
        let dateformat = moment(date).format('YYYY-MM-DD');
        payload['totalamont'] = 0;
        payload['totalitems'] = 0;
        payload['date'] = dateformat;
        payload['purchasedby'] = '';
        payload['purchasedat'] = '';
        payload['status'] = 'Open';
        const createSaleorder = await this.service.fetchRequestPost(
            'saleorder/createSaleorder',
            payload
        );
        console.log(createSaleorder);
        let saleorderid = createSaleorder;
        this.modalReference.close();
        let items = this.geteventitems;
        let adhocpoitempayload = {};
        this.geteventitems.forEach(async (item) => {
            let saleorderItemPayload = {};
            let price =
                parseFloat(item.totalPrice.toFixed(2)) / item.totalQuantity;
            saleorderItemPayload['saleorderitemid'] = 0;
            saleorderItemPayload['saleorderid'] = saleorderid;
            saleorderItemPayload['category'] = item.category;
            saleorderItemPayload['productlist'] = item.itemid;
            saleorderItemPayload['quantity'] = item.totalQuantity;
            saleorderItemPayload['salequantity'] = item.totalQuantity;
            saleorderItemPayload['uom'] = item.uom;
            saleorderItemPayload['finalprice'] = parseFloat(
                item.totalPrice.toFixed(2)
            );
            saleorderItemPayload['available'] = false;
            saleorderItemPayload['price'] = price;
            saleorderItemPayload['rateCardQuantity'] = 0;
            saleorderItemPayload['rateCardPrice'] = 0;
            const adhocpoitem = await this.service.fetchRequestPost(
                'saleorderitem/createSaleorderitem',
                saleorderItemPayload
            );
        });
        this.createPo = false;
        this.createSo = false;
        this.description.reset();
    }
    OnClose() {
        this.modalReference.close();
        this.createPo = false;
        this.createSo = false;
        this.description.reset();
    }
    async onSearch() {
        this.isAdhocpoVisible = true;
        this.exportButtonVisible = false;

        let value = this.orderForm.value;
        this.selectedEvents = value.keventname;

        const resp = await this.service.fetchRequestPost(
            'keventheader/getEventIngredientsByPlatters',
            value.keventname
        );
        this.geteventitems = resp['eventDetailsList'];

        const catvalue = this.orderForm.controls['category'].value;
        if (catvalue != 'All' && catvalue != '') {
            this.geteventitems = this.geteventitems.filter((item) => {
                return item.category == catvalue;
            });
            console.log(this.geteventitems);
        }
        this.prodcount = 0;
        this.tprice = 0;
        this.prodcount = this.geteventitems.length;

        // for getting telugu name below is the code
        const data = this.ingrpayload;
        data.vendorId = this.vendorId;
        const prodresp = await this.service.fetchRequestPost(
            'rest/product/ProductsByVariants',
            data
        );
        this.items = prodresp['productitems'];
        // for(let i in this.geteventitems){
        //   this.tprice+= this.geteventitems[i].totalPrice;
        // }
        this.geteventitems.forEach((item) => {
            this.tprice += item.totalPrice;
            this.items.forEach((element) => {
                if (item.itemid == element.prodId) {
                    if (element?.tname) item['tname'] = element.tname;
                    else item['tname'] = null;
                }
            });
        });
        // sorting
        // this.geteventitems = this.geteventitems.sort((a, b) => {
        //     return b.totalQuantity - a.totalQuantity;
        // });
        this.exportButtonVisible = true;
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

            console.log(this.events);
            for (let i in this.events) {
                this.events[i]['eventwithdate'] =
                    this.events[i].keventname +
                    '/' +
                    this.events[i].platterscount +
                    '/' +
                    this.events[i].type +
                    '/' +
                    this.events[i].eventdate;
            }
            this.copyEvents = this.events;
            if (this.orderForm.controls['evtCatCtrl'].value?.length > 0) {
                let catList = this.orderForm.controls['evtCatCtrl'].value;
                console.log(catList);
                this.events = this.events.filter((evt) =>
                    catList.some(
                        (catValues) => catValues.value === evt.category
                    )
                );
            }
        }
    }
    OnEvtCatSelect(event) {
        let values = event.value;
        console.log(values);
        let list = this.orderForm.controls['evtCatCtrl'].value;
        this.events = this.copyEvents;
        if (list.length > 0) {
            this.events = this.events.filter((data) => {
                return list.some((obj) => data.category == obj.value);
            });
        }
    }
    OnDeSelect(event) {
        let list = this.orderForm.controls['evtCatCtrl'].value;
        console.log(list);
        this.events = this.copyEvents;
        if (list.length > 0) {
            this.events = this.events.filter((data) => {
                return list.some((obj) => data.category == obj.value);
            });
        }
    }
    onExportPress() {
        console.log(this.geteventitems);
        let eventnames = [];
        let eventdates = [];
        this.events.forEach((item) => {
            this.selectedEvents.forEach((id) => {
                if (item.keventid == id.keventid) {
                    eventnames.push(
                        item.keventname + ' (' + item.platterscount + ')'
                    );
                    eventdates.push(item.eventdate);
                }
            });
        });
        this.geteventitems.forEach((row) => {
            if (row.uom == 'gms' || row.uom == 'ml') {
                row.totalQuantity = row.totalQuantity / 1000;
                row.totalQuantity = row.totalQuantity.toFixed(2);
                if (row.uom == 'gms') row.uom = 'kgs';
                else if (row.uom == 'ml') row.uom = 'L';
            } else {
                row.totalQuantity = row.totalQuantity.toFixed(2);
            }
        });
        let uniqueEventDates = [...new Set(eventdates)];
        let docDefinition = {
            defaultStyle: {
                font: 'telugu', // use your font name here
            },
            content: [
                // Previous configuration
                {
                    text:
                        'Event Recipe Items: ' +
                        ' ' +
                        uniqueEventDates.toString(),
                },
                {
                    text: eventnames.toString(),
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
                            ...this.geteventitems.map((p, i) => [
                                i + 1,
                                p.itemid + '-' + p.ingrname + '-' + p.tname,
                                p.totalQuantity + ' ' + p.uom,
                                p.category,
                            ]),
                        ],
                    },
                },
            ],
        };
        console.log(docDefinition);
        pdfMake.createPdf(docDefinition).download('new file.pdf');
    }
}
