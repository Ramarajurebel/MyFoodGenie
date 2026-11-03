import { Route } from '@angular/router';
import { KitchenTasksComponent } from './kitchen-tasks/kitchen-tasks.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { TaskListComponent } from './task-list/task-list.component';
import { PackagingComponent } from './packaging/packaging.component';
import { DailyPurchasesComponent } from './daily-purchases/daily-purchases.component';
import { KitchenPreparationComponent } from './kitchen-preparation/kitchen-preparation.component';
import { KitchenNewPreparationComponent } from './kitchen-new-preparation/kitchen-new-preparation.component';
import { AdhocDetailsComponent } from './adhoc-details/adhoc-details.component';
import { AdhocItemDetailsComponent } from './adhoc-item-details/adhoc-item-details.component';
import { EventsChildComponent } from './events-child/events-child.component';
import { EnquiryEventsComponent } from './enquiry-events/enquiry-events.component';
import { PrepLunchDinnerComponent } from './prep-lunch-dinner/prep-lunch-dinner.component';
import { CookingLunchDinnerComponent } from './cooking-lunch-dinner/cooking-lunch-dinner.component';
import { KitchenInventoryComponent } from './kitchen-inventory/kitchen-inventory.component';
import { NfmOrdersComponent } from './nfm-orders/nfm-orders.component';
import { SaleOrderDetailsComponent } from './sale-order-details/sale-order-details.component';
import { NfmReportsComponent } from './nfm-reports/nfm-reports.component';
import { RoleManagementComponent } from './role-management/role-management.component';
import { StallFoodInventoryComponent } from './stall-food-inventory/stall-food-inventory.component';
import { ModuleManagementComponent } from './module-management/module-management.component';
import { EmployeeAssignmentComponent } from './employee-assignment/employee-assignment.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { PurchaseRateCardComponent } from './purchase-rate-card/purchase-rate-card.component';
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
import { ProductqrComponent } from './productqr/productqr.component';

export const NfmRoutes: Route[] = [
    {
        path: 'KITCOOK',
        component: KitchenTasksComponent,
    },
    {
        path: 'KITPREP',
        component: KitchenNewPreparationComponent,
    },
    {
        path: 'preparation/:id/:date',
        component: KitchenPreparationComponent,
    },
    {
        path: 'preparation',
        component: KitchenPreparationComponent,
    },
    {
        path: 'TASKMGM',
        component: TaskListComponent,
        children: [
            {
                path: 'task-details/:id',
                component: TaskDetailsComponent,
            },
            {
                path: 'task-details',
                component: TaskDetailsComponent,
            },
        ],
    },
    {
        path: 'KITPACK',
        component: PackagingComponent,
    },
    // {
    //     path: 'PO',
    //     component: DailyPurchasesComponent,
    // },
    {
        path: 'PO',
        component: AdhocDetailsComponent,
        children: [
            {
                path: 'item/:id',
                component: AdhocItemDetailsComponent,
            },
            {
                path: 'item',
                component: AdhocItemDetailsComponent,
            },
        ],
    },
    {
        path: 'EVENT',
        component: EventsChildComponent,
    },
    {
        path: 'ENQ',
        component: EnquiryEventsComponent,
    },
    {
        path: 'lunch-prep',
        component: PrepLunchDinnerComponent,
    },
    {
        path: 'lunch-cook',
        component: CookingLunchDinnerComponent,
    },
    {
        path: 'INVT',
        component: KitchenInventoryComponent,
    },
    {
        path: 'ORDERS',
        component: NfmOrdersComponent,
    },
    {
        path: 'SO',
        component: SaleOrderDetailsComponent,
    },
    {
        path: 'REPRT',
        component: NfmReportsComponent,
    },
    {
        path: 'ROLEMGM',
        component: RoleManagementComponent,
    },
    {
        path: 'food-inv',
        component: StallFoodInventoryComponent,
    },
    {
        path: 'MODMGM',
        component: ModuleManagementComponent,
    },
    {
        path: 'EMPASSIGN',
        component: EmployeeAssignmentComponent,
    },
    {
        path: 'EMPDET',
        component: EmployeeDetailsComponent,
    },
    {
        path: 'PURRATE',
        component: RateCardComponent,
    },
    {
        path: 'TRSCTION',
        component: NfmTransactionsComponent,
    },
    {
        path: 'RCPS',
        component: NfmRecipesComponent,
    },
    {
        path: 'CTRM',
        component: CounterManagementComponent,
    },
    {
        path: 'SALETRNSCTION',
        component: NfmSaleTransactionsComponent,
    },
    {
        path: 'FoodMenu',
        component: FoodMenuComponent,
    },
    {
        path: 'VENDORS',
        component: VendorsComponent,
    },
    {
        path: 'PRODS',
        component: ProdsListComponent,
    },
    {
        path: 'FOODINV',
        component: FoodInvComponent,
    },
    {
        path: 'EMPPMTS',
        component: EmpPaymentsComponent,
    },
    {
        path: 'EMPSLRY',
        component: EmpSalariesComponent,
    },
    {
        path: 'VSLINV',
        component: VessInvComponent,
    },

    {
        path: 'EVTRCPRPRT',
        component: EventReportComponent,
    },
    {
        path: 'EVTINGRRPRT',
        component: EvtIngrReportComponent,
    },
    {
        path: 'EMPATTD',
        component: EmpAttendanceComponent,
    },
    {
        path: 'EMPLVS',
        component: EmpLeavesComponent,
    },
    {
        path: 'PINOUT',
        component: PunchInOutComponent,
    },
    {
        path: 'EMPGRP',
        component: EmpGroupingComponent,
    },
    {
        path: 'COMPMGMT',
        component: ComplaintManagementComponent,
    },
    {
        path: 'CONTMGMT',
        component: ContactManagementComponent,
    },
    {
        path: 'TMGMT',
        component: TableManagementComponent,
    },
    {
        path: 'GEINV',
        component: GenieInventoryComponent,
    },
    {
        path: 'GEMECH',
        component: GenieMachinesComponent,
    },
    {
        path: 'GEMGMT',
        component: GenieManagementComponent,
    },
    {
        path: 'qrg',
        component: QrcodegeneratorComponent,
    },
    {
        path: 'NWQR',
        component: NewQrcodegeneratorComponent,
    },
    {
        path: 'REFILL',
        component: RefillordersComponent,
    },
    {
        path: 'VMSTRS',
        component: VmsTransComponent,
    },
    {
        path: 'WALLET',
        component: WalletComponent,
    },
    {
        path: 'PRODINVT',
        component: ProductInventoryComponent,
    },
    {
        path: 'SCHEDULERS',
        component: SchedulersComponent
    },
    {
        path: 'ITEMINV',
        component: IteminventoryComponent
    },
    {
        path: 'PORDERS',
        component: PackingOrdersComponent
    },
    {
        path: 'MOVORD',
        component: MovementorderComponent
    },
    {
        path: 'STOCK',
        component: StockReportsComponent
    },
    {
        path: 'ENTITYFRAMEWORK',
        component: EntityFrameworkComponent
    },
    {
        path: 'SCANTOTEXT',
        component: ScanToTextComponent
    },
    {
        path: 'PRODUCTQR',
        component: ProductqrComponent
    }
];
