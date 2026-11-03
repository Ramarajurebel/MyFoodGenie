import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KitchenTasksComponent } from './kitchen-tasks/kitchen-tasks.component';
import { NfmRoutes } from './nfm.routing';
import { SharedModule } from './../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from "@angular/material/chips";




import {
    MatFormFieldModule,
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxQRCodeModule } from 'ngx-qrcode2';

import { TaskListComponent } from './task-list/task-list.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { MatDividerModule } from '@angular/material/divider';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PackagingComponent } from './packaging/packaging.component';
import { DailyPurchasesComponent } from './daily-purchases/daily-purchases.component';
import { MatSortModule } from '@angular/material/sort';
import { KitchenPreparationComponent } from './kitchen-preparation/kitchen-preparation.component';
import { KitchenNewPreparationComponent } from './kitchen-new-preparation/kitchen-new-preparation.component';
import { AdhocDetailsComponent } from './adhoc-details/adhoc-details.component';
import { AdhocItemDetailsComponent } from './adhoc-item-details/adhoc-item-details.component';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatMenuModule } from '@angular/material/menu';
import { SecondsMinutePipe } from './seconds-minute.pipe';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { EventsChildComponent } from './events-child/events-child.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';



import { ReactiveFormsModule } from '@angular/forms';
import { EnquiryEventsComponent } from './enquiry-events/enquiry-events.component';
import { MatRadioModule } from '@angular/material/radio';
import { PrepLunchDinnerComponent } from './prep-lunch-dinner/prep-lunch-dinner.component';
import { CookingLunchDinnerComponent } from './cooking-lunch-dinner/cooking-lunch-dinner.component';
import { KitchenInventoryComponent } from './kitchen-inventory/kitchen-inventory.component';
import { NfmOrdersComponent } from './nfm-orders/nfm-orders.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SaleOrderDetailsComponent } from './sale-order-details/sale-order-details.component';
import { NfmReportsComponent } from './nfm-reports/nfm-reports.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { RoleManagementComponent } from './role-management/role-management.component';
import { StallFoodInventoryComponent } from './stall-food-inventory/stall-food-inventory.component';
import { ModuleManagementComponent } from './module-management/module-management.component';
import { EmployeeAssignmentComponent } from './employee-assignment/employee-assignment.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { PurchaseRateCardComponent } from './purchase-rate-card/purchase-rate-card.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NfmTransactionsComponent } from './nfm-transactions/nfm-transactions.component';
import { NfmRecipesComponent } from './nfm-recipes/nfm-recipes.component';
import { CounterManagementComponent } from './counter-management/counter-management.component';
import { NfmSaleTransactionsComponent } from './nfm-sale-transactions/nfm-sale-transactions.component';
import { FoodMenuComponent } from './food-menu/food-menu.component';
import { VendorsComponent } from './vendors/vendors.component';
import { ProdsListComponent } from './prods-list/prods-list.component';
import { FoodInvComponent } from './food-inv/food-inv.component';
import { EmpPaymentsComponent } from './emp-payments/emp-payments.component';
import { EmpSalariesComponent } from './emp-salaries/emp-salaries.component';
import { VessInvComponent } from './vess-inv/vess-inv.component';
import { EventReportComponent } from './event-report/event-report.component';
import { EvtIngrReportComponent } from './evt-ingr-report/evt-ingr-report.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EmpAttendanceComponent } from './emp-attendance/emp-attendance.component';
import { EmpLeavesComponent } from './emp-leaves/emp-leaves.component';
import { PunchInOutComponent } from './punch-in-out/punch-in-out.component';
import { EmpGroupingComponent } from './emp-grouping/emp-grouping.component';
import { ComplaintManagementComponent } from './complaint-management/complaint-management.component';
import { RateCardComponent } from './rate-card/rate-card.component';
import { ContactManagementComponent } from './contact-management/contact-management.component';
import { TableManagementComponent } from './table-management/table-management.component';
import { GenieMachinesComponent } from './genie-machines/genie-machines.component';
import { GenieInventoryComponent } from './genie-inventory/genie-inventory.component';
import { GenieManagementComponent } from './genie-management/genie-management.component';
import { QrcodegeneratorComponent } from './qrcodegenerator/qrcodegenerator.component';
import { NewQrcodegeneratorComponent } from './new-qrcodegenerator/new-qrcodegenerator.component';
import { RefillordersComponent } from './refillorders/refillorders.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VmsTransComponent } from './vms-trans/vms-trans.component';
import { WalletComponent } from './wallet/wallet.component';
import { ProductInventoryComponent } from './product-inventory/product-inventory.component';
import { SchedulersComponent } from './schedulers/schedulers.component';
import { IteminventoryComponent } from './iteminventory/iteminventory.component';
import { PackingOrdersComponent } from './packing-orders/packing-orders.component';
import { MovementorderComponent } from './movementorder/movementorder.component';
import { StockReportsComponent } from './stock-reports/stock-reports.component';
import { EntityFrameworkComponent } from './entity-framework/entity-framework.component';
import { ScanToTextComponent } from './scan-to-text/scan-to-text.component';
import { HttpClientModule } from '@angular/common/http';
import { ProductqrComponent } from './productqr/productqr.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { CommonModule } from '@angular/common';


// import { RevComponent } from './rev/rev.component';


import { MatOptionModule } from '@angular/material/core';


@NgModule({
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { appearance: 'fill' },
        },
        

    ],
    declarations: [
        KitchenTasksComponent,
        TaskListComponent,
        TaskDetailsComponent,
        PackagingComponent,
        DailyPurchasesComponent,
        KitchenPreparationComponent,
        KitchenNewPreparationComponent,
        AdhocDetailsComponent,
        AdhocItemDetailsComponent,
        SecondsMinutePipe,
        EventsChildComponent,
        EnquiryEventsComponent,
        PrepLunchDinnerComponent,
        CookingLunchDinnerComponent,
        KitchenInventoryComponent,
        NfmOrdersComponent,
        SaleOrderDetailsComponent,
        NfmReportsComponent,
        RoleManagementComponent,
        StallFoodInventoryComponent,
        ModuleManagementComponent,
        EmployeeAssignmentComponent,
        EmployeeDetailsComponent,
        PurchaseRateCardComponent,
        NfmTransactionsComponent,
        NfmRecipesComponent,
        CounterManagementComponent,
        NfmSaleTransactionsComponent,
        FoodMenuComponent,
        VendorsComponent,
        ProdsListComponent,
        FoodInvComponent,
        EmpPaymentsComponent,
        EmpSalariesComponent,
        VessInvComponent,
        EventReportComponent,
        EvtIngrReportComponent,
        EmpAttendanceComponent,
        EmpLeavesComponent,
        PunchInOutComponent,
        EmpGroupingComponent,
        ComplaintManagementComponent,
        RateCardComponent,
        ContactManagementComponent,
        TableManagementComponent,
        GenieMachinesComponent,
        GenieInventoryComponent,
        GenieManagementComponent,
        QrcodegeneratorComponent,
        NewQrcodegeneratorComponent,
        RefillordersComponent,
        VmsTransComponent,
        WalletComponent,
        ProductInventoryComponent,
        SchedulersComponent,
        IteminventoryComponent,
        PackingOrdersComponent,
        MovementorderComponent,
        StockReportsComponent,
        EntityFrameworkComponent,
        ScanToTextComponent,
        ProductqrComponent,

            EventReportComponent,
    EvtIngrReportComponent,
    KitchenNewPreparationComponent,
    KitchenTasksComponent,
    ProductqrComponent,
    NewQrcodegeneratorComponent,
        // RevComponent,
    ],
    imports: [

          CommonModule,
    RouterModule.forChild(NfmRoutes),
    SharedModule,
         NgApexchartsModule,
    FormsModule,
    ReactiveFormsModule,

      MatDividerModule,
    MatSlideToggleModule,
     

    // ✅ Angular Material (REQUIRED HERE)
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
              NgMultiSelectDropDownModule.forRoot() , 
  


    // Only NON-shared external modules
 

    ],
})
export class NfmPortalModule { }
