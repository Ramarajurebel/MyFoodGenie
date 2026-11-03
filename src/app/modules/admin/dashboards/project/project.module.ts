import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@ngneat/transloco';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from 'app/shared/shared.module';
import { ProjectComponent } from 'app/modules/admin/dashboards/project/project.component';
import { projectRoutes } from 'app/modules/admin/dashboards/project/project.routing';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatDialogModule } from '@angular/material/dialog';
import { NfmSigninComponent } from './nfm-signin/nfm-signin.component';
import { NfmSiginPageComponent } from './nfm-sigin-page/nfm-sigin-page.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NfmDashboardComponent } from './nfm-dashboard/nfm-dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
@NgModule({
    declarations: [
        ProjectComponent,
        NfmSigninComponent,
        NfmSiginPageComponent,
        NfmDashboardComponent,
    ],
    imports: [
        RouterModule.forChild(projectRoutes),
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSidenavModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        NgApexchartsModule,
        TranslocoModule,
        SharedModule,
        NgOtpInputModule,
        MatDialogModule,
        NgMultiSelectDropDownModule,
        NgbModule,
        MatSlideToggleModule,
    ],
})
export class ProjectModule {}
