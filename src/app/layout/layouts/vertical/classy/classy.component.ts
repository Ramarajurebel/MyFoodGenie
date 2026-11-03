import {
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import {
    FuseNavigationService,
    FuseVerticalNavigationComponent,
} from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: Navigation;
    user: User;
    isMenuOpened: boolean;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    modalReference: any;
    usersList = [];
    notificationForm: FormGroup;
    moduleManagementData = [];
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private dialog: NgbModal,
        private service: ProjectService
    ) {
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
                console.log(this.navigation);
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    async ngOnInit() {
        this.notificationForm = new FormGroup({
            target: new FormControl(''),
            message: new FormControl(''),
            body: new FormControl(''),
            url: new FormControl(''),
            image: new FormControl(''),
            route: new FormControl(''),
        });
        // getting users List
        const usersResp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.usersList = usersResp['stallOperatorList'];
        const getResp = await this.service.fetchRequest(
            'modulemanagement/getAllmodulemanagement'
        );
        console.log(getResp);
        this.moduleManagementData = getResp['modulemanagementList'];
        this.usersList = this.usersList.filter((item) => {
            return item.role === 'Employee';
        });
        console.log(this.usersList);
        // Subscribe to navigation data

        // Subscribe to the user service
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Check if the screen is small
                console.log(matchingAliases.includes('md'));
                this.isScreenSmall = !matchingAliases.includes('md');
                this.isMenuOpened = !matchingAliases.includes('md');
                // console.log(this.isScreenSmall);
            });
        // for desktops also hide it
        const query = window.matchMedia('(min-width: 769px)');
        this.doCheck(query); // Call listener function at run time
        query.addEventListener('change', () => {
            this.doCheck(query);
        });
    }

    // ngAfterViewInit() {
    //     const googleTranslateElement = this.googleTranslateElement
    //         .nativeElement;
    //     googleTranslateElement.innerHTML = `
    //       <div id="google_translate_element"></div>
    //       <script type="text/javascript">
    //         function googleTranslateElementInit() {
    //           new google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
    //           const script = document.createElement('script');
    //           script.type = 'text/javascript';
    //           script.src = '/translate/translate_a/element.js?cb=googleTranslateElementInit';
    //           document.body.appendChild(script);
    //         }
    //       </script>
    //     `;
    // }

    doCheck(query) {
        if (query.matches) {
            // If media query matches
            this.isMenuOpened = true;
        }
    }

    // Attach listener function on state changes
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
            name
        );

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }
    SendMessageToUser(modal) {
        this.modalReference = this.dialog.open(modal);
    }
    async onSendClick() {
        const data = this.notificationForm.value;
        data.url = 'https://myfoodgenie.com';
        data.image = '';
        console.log(data);
        const resp = this.service.fetchRequestPost(
            'pushnotification/sendwebnotification',
            data
        );
        this.modalReference.close();
    }
    OnClose() {
        this.modalReference.close();
    }
}
