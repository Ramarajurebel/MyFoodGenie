import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { KitchenInventoryTable } from '../../shared/tables/kitchen-inventory';
import { KitchenInventoryClass } from './../../shared/classes/kitchen-inventory';
import { FormGroup, FormControl } from '@angular/forms';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { formatDate } from '@angular/common';
import { StallFoodInvTable } from './../../shared/tables/stall-food-inv.table';
import { StallFoodInvClass } from './../../shared/classes/stall-food-inv';

@Component({
    selector: 'app-stall-food-inventory',
    templateUrl: './stall-food-inventory.component.html',
    styleUrls: ['./stall-food-inventory.component.scss'],
})
export class StallFoodInventoryComponent implements OnInit {
    inventoryTableData = new MatTableDataSource<StallFoodInvClass>();
    inventoryJson: StallFoodInvClass[];
    displayedColumns: string[] = StallFoodInvTable.map((col) => col.key);
    columnsSchema: any = StallFoodInvTable;

    mobileInvItems: StallFoodInvClass[];
    searchFormGroup: FormGroup;
    mobileInventoryData: StallFoodInvClass[];
    ingredientsImagePath = './assets/images/ingredients/';
    stalls = [];
    constructor(
        private service: ProjectService,
        @Inject(LOCALE_ID) public locale: string
    ) {}

    async ngOnInit() {
        this.searchFormGroup = new FormGroup({
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
            category: new FormControl(''),
        });
        const resp = await this.service.fetchRequest('stall/getAllStalls');
        this.stalls = resp['supplierList'];

        const datePayload = {};
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
        const dateResp = await this.service.fetchRequestPost(
            'stallinventory/getStallInventoryByDate',
            datePayload
        );
        this.inventoryJson = dateResp['stallInventoryList'];

        this.inventoryJson.forEach((element) => {
            element['balance'] = element.packedCount - element.saleCount;
        });
        for (let i in this.stalls) {
            for (let j in this.inventoryJson) {
                if (this.inventoryJson[j].stallid == this.stalls[i].stallid) {
                    this.inventoryJson[j]['stallName'] = this.stalls[i].name;
                }
            }
        }
        this.inventoryJson = this.inventoryJson.sort((a, b) => {
            if (a.balance < b.balance) return -1;
            if (a.balance > b.balance) return 1;
            return 0;
        });
        // this.inventoryJson.forEach((item) => {
        //     item['itemImage'] = `${item.itemId}.webp`;
        // });
        this.inventoryTableData = new MatTableDataSource(this.inventoryJson);
        this.mobileInvItems = this.inventoryJson;
    }
    // activatingChild(po) {
    //     po.childActive = !po.childActive;
    //     let childData = this.inventoryJson.filter((obj) => {
    //         return obj.category === po.value;
    //     });
    //     po.table = new MatTableDataSource(childData);
    //     po.mobileData = childData;
    // }
    async OnSearch() {
        let startDate = this.searchFormGroup.controls['startDate'].value;
        let endDate = this.searchFormGroup.controls['endDate'].value;

        if (startDate && endDate) {
            startDate = formatDate(startDate, 'YYYY-MM-dd', this.locale);
            endDate = formatDate(endDate, 'YYYY-MM-dd', this.locale);
            let payload = {
                startDate,
                endDate,
            };
            const dateresp = await this.service.fetchRequestPost(
                'stallinventory/getStallInventoryByDate',
                payload
            );
            this.inventoryJson = dateresp['stallInventoryList'];

            this.inventoryJson.forEach((element) => {
                element['balance'] = element.packedCount - element.saleCount;
            });
            this.inventoryJson = this.inventoryJson.sort((a, b) => {
                if (a.balance < b.balance) return -1;
                if (a.balance > b.balance) return 1;
                return 0;
            });
            for (let i in this.stalls) {
                for (let j in this.inventoryJson) {
                    if (
                        this.inventoryJson[j].stallid == this.stalls[i].stallid
                    ) {
                        this.inventoryJson[j]['stallName'] = this.stalls[
                            i
                        ].name;
                    }
                }
            }
            // this.inventoryJson.forEach((item) => {
            //     item['itemImage'] = `${item.itemId}.webp`;
            // });
            this.inventoryTableData = new MatTableDataSource(
                this.inventoryJson
            );
            this.mobileInvItems = this.inventoryJson;
        }
    }
    async InventorySave(row: StallFoodInvClass) {
        row.isEdit = false;
        const payload = row;
        payload.balance = row.packedCount - row.saleCount;
        const saveResp = await this.service.fetchRequestPost(
            'stallinventory/createStallInventory',
            payload
        );
        console.log(row);
    }
}
