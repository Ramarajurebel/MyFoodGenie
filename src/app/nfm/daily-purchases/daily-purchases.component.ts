import { Component, OnInit } from '@angular/core';
import { JwtComponent } from './../../modules/admin/docs/guides/authentication/jwt/jwt';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-daily-purchases',
    templateUrl: './daily-purchases.component.html',
    styleUrls: ['./daily-purchases.component.scss'],
})
export class DailyPurchasesComponent implements OnInit {
    public dailyPurchases = [];
    public purchaseOrderForm: FormGroup;
    public isLoading: boolean = false;
    // for table

    constructor(private naviService: ProjectService) {}

    async ngOnInit() {
        this.isLoading = false;
        let jwttoken = localStorage.getItem('jwtToken');
        const resp = await this.naviService.fetchRequest(
            'poHeader/getAllpoHeaders'
        );
        this.dailyPurchases = resp['purchaseOrderHeaderList'];
        this.dailyPurchases.forEach((item) => {
            item['childActive'] = false;
        });
        console.log(this.dailyPurchases);
        this.purchaseOrderForm = new FormGroup({
            eventId: new FormControl('', Validators.required),
            category: new FormControl('', Validators.required),
            amount: new FormControl('', Validators.required),
            status: new FormControl('Paid', Validators.required),
            receiptImageId: new FormControl('/img21380'),
            paidBy: new FormControl(''),
            paidTo: new FormControl(''),
            purchasedDate: new FormControl(''),
            comments: new FormControl('', Validators.required),
            transactionType: new FormControl(''),
            transaction: new FormControl('Purchase'),
            amountCleared: new FormControl(''),
            referenceId: new FormControl(''),
        });
    }
    OnArrowPress(value) {
        value.childActive = !value.childActive;
    }
}
