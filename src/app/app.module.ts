import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

// 3rd party
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { MarkdownModule } from 'ngx-markdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';

// Fuse
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { FuseMockApiModule } from '@fuse/lib/mock-api';

// App
import { CoreModule } from 'app/core/core.module';
import { LayoutModule } from 'app/layout/layout.module';
import { appConfig } from 'app/core/config/app.config';
import { mockApiServices } from 'app/mock-api';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routing';
import { environment } from '../environments/environment';
import { NfmPortalModule } from './nfm/nfm.module';


// Components
import { EventReportComponent } from './nfm/event-report/event-report.component';
import { EvtIngrReportComponent } from './nfm/evt-ingr-report/evt-ingr-report.component';
import { KitchenNewPreparationComponent } from './nfm/kitchen-new-preparation/kitchen-new-preparation.component';
import { KitchenTasksComponent } from './nfm/kitchen-tasks/kitchen-tasks.component';
import { ProductqrComponent } from './nfm/productqr/productqr.component';
import { NewQrcodegeneratorComponent } from './nfm/new-qrcodegenerator/new-qrcodegenerator.component';
import { SharedModule } from './shared/shared.module';

const routerConfig: ExtraOptions = {
  preloadingStrategy: PreloadAllModules,
  scrollPositionRestoration: 'enabled',
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes, routerConfig),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
      ZXingScannerModule,

    // Angular Material
    MatDividerModule,
    MatSlideToggleModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule,
    MatTabsModule,
    MatSidenavModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,

    

    // 3rd party
    NgMultiSelectDropDownModule.forRoot(),
    NgApexchartsModule,
    ZXingScannerModule,
    NgxQRCodeModule,

    // Fuse
    FuseModule,
    FuseConfigModule.forRoot(appConfig),
    FuseMockApiModule.forRoot(mockApiServices),
    CoreModule,
    LayoutModule,
    MarkdownModule.forRoot({}),
    NgbModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    AngularFireModule.initializeApp(environment.FirebaseConfig),
    AngularFireMessagingModule,
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA], // Fixes unknown elements/bindings temporarily
})
export class AppModule {}