import { Route } from '@angular/router';
import { ProjectComponent } from 'app/modules/admin/dashboards/project/project.component';
import { ProjectResolver } from 'app/modules/admin/dashboards/project/project.resolvers';
import { NfmDashboardComponent } from './nfm-dashboard/nfm-dashboard.component';

export const projectRoutes: Route[] = [
    {
        path: '',
        component: NfmDashboardComponent,
        resolve: {
            data: ProjectResolver,
        },
    },
    {
        path: 'user',
        component: NfmDashboardComponent,
    },
];
