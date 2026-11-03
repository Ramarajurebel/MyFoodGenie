import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { Inject, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApexOptions } from 'ng-apexcharts';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { formatDate } from '@angular/common';
import { Input } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NfmSigninComponent } from './nfm-signin/nfm-signin.component';
import { FormControl } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
    selector: 'project',
    templateUrl: './project.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectComponent implements OnInit, OnDestroy {
    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    data: any;
    selectedProject: string = 'ACME Corp. Backend App';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    //Below is for nfm
    public events = [];
    public recipes = [];
    public tempEvents = [];
    public recipeIngredients = [];
    public tempRcpIngr = [];
    public teluguNameProducts = [];
    public eventReports = [];
    public keys = [];
    public headingArray = [];
    public tempEventRecipes = [];
    public stallOperator = [];
    public typeOneEvents = [];
    public typeTwoEvents = [];
    public typeOneEventName = [];
    public typeTwoEventName = [];
    public typeOneRecipes = [];
    public typeTwoRecipes = [];
    public recipesCount: number;
    public tasksCount: number;
    public eventdate: FormControl = new FormControl('');
    public category: FormControl = new FormControl('');
    private modalReference: any;
    modalOption: NgbModalOptions = {};
    dropdownSettings: IDropdownSettings;
    public categoryData = [{ category: 'Curry Point' }, { category: 'Event' }];
    public cookingCount: number;
    public preparationCount: number;
    poOrdersCount: number;
    /**
     * Constructor
     */
    constructor(
        private _projectService: ProjectService,
        private _router: Router,
        @Inject(LOCALE_ID) public locale: string,
        private dialog: NgbModal
    ) {
        //below is for nfm
        let jwtToken = localStorage.getItem('jwtToken');
        this._router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this._router.onSameUrlNavigation = 'reload';
        if (!jwtToken) {
            this.modalOption.backdrop = 'static';
            this.modalOption.keyboard = false;
            this.modalReference = this.dialog.open(
                NfmSigninComponent,
                this.modalOption
            );
        } else {
            console.log('constructor');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    async ngOnInit() {
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'category',
            textField: 'category',
            allowSearchFilter: true,
        };

        let jwtToken = localStorage.getItem('jwtToken');
        console.log(jwtToken);
        if (jwtToken) {
            this.recipesCount = 0;
            console.log('when it is working');
            // po orders
            let poResp = await this._projectService.fetchRequest(
                'adhocpo/getAllAdhocpo'
            );
            let poData = poResp['adhocpoList'];
            let finalpoData = poData.filter((item) => {
                if (item?.status != 'Completed') return item;
            });
            this.poOrdersCount = finalpoData.length;
            let eventResp = await this._projectService.fetchRequest(
                'keventheader/getAllkeventheader'
            );
            this.events = eventResp['keventheaderList'];
            const getresp = await this._projectService.fetchRequest(
                'tasklist/getAlltasklist'
            );
            let tasks = getresp['tasklistList'];
            // getting mobile number from stalloperator service for filtering based on user
            let finaltasks = tasks.filter((item) => {
                return item?.status !== 'Completed';
            });
            let user = JSON.parse(localStorage.getItem('user'));
            console.log(user.mobilenumber);
            if (user.role != 'admin') {
                finaltasks = finaltasks.filter((item) => {
                    if (item.mobileno == user.mobileNumber) return item;
                });
            }

            this.tasksCount = finaltasks.length;
            // For Recipes
            this.events = this.events.filter((item: any) => {
                if (item.status != 'Completed') return item;
            });
            this.tempEvents = JSON.parse(JSON.stringify(this.events));
            const currentDate = formatDate(
                new Date(),
                'YYYY-MM-dd',
                this.locale
            );
            console.log(currentDate);
            this.events = this.events.filter((item: any) => {
                if (item.eventdate == currentDate) return item;
            });
            // this.EventType = JSON.stringify(temp);
            let currentTime = formatDate(
                new Date().getTime(),
                'HH:mm:ss',
                this.locale
            );
            console.log(currentTime);
            if (currentTime >= '13:00:00' && currentTime < '18:00:00') {
                console.log('Evening');
                this.recipesCount = 0;
                const resp = await this.GetMorningOrEveningData(
                    'Snacks',
                    'Dinner',
                    currentDate,
                    this.events
                );

                console.log(this.recipesCount);
            } else if (currentTime > '18:00:00' && currentTime < '23:59:59') {
                console.log('Tommorrow Morning');
                let date = new Date();
                let todate = date.getDate() + 1;
                date.setDate(todate);
                console.log(date);
                let tommorrowdate = formatDate(date, 'YYYY-MM-dd', this.locale);
                this.events = this.tempEvents;
                this.events = this.events.filter((item) => {
                    return item.eventdate == tommorrowdate;
                });
                this.recipesCount = 0;
                const Lunchresp = await this.GetMorningOrEveningData(
                    'Tiffins',
                    'Lunch',
                    tommorrowdate,
                    this.events
                );

                console.log(this.recipesCount);
            } else {
                console.log('Today Morning');
                this.recipesCount = 0;
                const tomorrowresp = await this.GetMorningOrEveningData(
                    'Tiffins',
                    'Lunch',
                    currentDate,
                    this.events
                );
            }
        }
        console.log(this.recipesCount);
        // Get the data
        this._projectService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                // Store the data
                this.data = data;
                console.log(this.data);
                // Prepare the chart data
                this._prepareChartData();
            });

        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                },
            },
        };
    }

    async GetMorningOrEveningData(type1: String, type2: String, date, events) {
        const reportResp = await this._projectService.fetchRequest(
            'recipepreparation/getallpreparationdata'
        );
        let preparationData = reportResp['recipepreparationList'];
        preparationData = preparationData.filter((data) => {
            if (data.eventtype === type1 || data.eventtype === type2) {
                if (data.eventdate === date) {
                    return data;
                }
            }
        });
        this.cookingCount = preparationData.length;
        let rows = [];
        let recipesData = [];
        events = events.filter((evt) => {
            return evt.type == type1 || evt.type == type2;
        });
        const Resp = await this._projectService.fetchRequestPost(
            'keventheaderitems/eventrecipeslist',
            events
        );

        rows = Resp['rows'];
        this.headingArray = Resp['cols'];
        this.keys = Resp['keys'];
        this.keys.splice(-1);

        this.headingArray.splice(0, 0, 'SNo');
        let length = this.headingArray.length - 3;
        this.headingArray.splice(length, 3);

        console.log(this.headingArray);

        for (let i = 0; i < rows.length; i++) {
            recipesData.push(Object.assign({}, ...rows[i].cols));
        }
        recipesData = recipesData.filter((rcp) => {
            return rcp.Category === 'Kitchen';
        });

        this.preparationCount = recipesData.length;
    }

    OnNavigate(url: string) {
        let jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
            this._router.navigate([url]);
        }
    }
    OpenModal(modal) {
        this.modalReference = this.dialog.open(NfmSigninComponent);
        // this.modalReference.componentInstance.actionEvent = 'signin';
    }
    OnDotsPress(modal) {
        this.modalReference = this.dialog.open(modal);
    }
    OnClose() {
        this.modalReference.close();
        this.eventdate.reset();
    }
    async OnGo() {
        let payload = {};
        payload['eventdate'] = this.eventdate.value;
        let category = this.category.value;
        let catpayload = [];

        if (category.length > 0) {
            category.forEach((cat) => {
                catpayload.push(cat.category);
            });
        }
        payload['category'] = catpayload;
        const resp = await this._projectService.fetchRequestPost(
            'keventheaderitems/keventwithdate',
            payload
        );
        this.modalReference.close();
        console.log(resp);
        let id = JSON.stringify(resp);
        let date = JSON.stringify(this.eventdate.value);
        if (resp) {
            this._router.navigate([
                `nfm/kitchen-tasks/preparation/${id}/${date}`,
            ]);
        } else {
            this._router.navigate([`nfm/kitchen-tasks/preparation`]);
        }
    }
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
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter((el) => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute(
                    'fill',
                    `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`
                );
            });
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void {
        // Github issues
        this.chartGithubIssues = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#64748B', '#94A3B8'],
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0],
                background: {
                    borderWidth: 0,
                },
            },
            grid: {
                borderColor: 'var(--fuse-border)',
            },
            labels: this.data.githubIssues.labels,
            legend: {
                show: false,
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%',
                },
            },
            series: this.data.githubIssues.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.75,
                    },
                },
            },
            stroke: {
                width: [3, 0],
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
            },
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    color: 'var(--fuse-border)',
                },
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
                tooltip: {
                    enabled: false,
                },
            },
            yaxis: {
                labels: {
                    offsetX: -16,
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };

        // Task distribution
        this.chartTaskDistribution = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'polarArea',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            labels: this.data.taskDistribution.labels,
            legend: {
                position: 'bottom',
            },
            plotOptions: {
                polarArea: {
                    spokes: {
                        connectorColors: 'var(--fuse-border)',
                    },
                    rings: {
                        strokeColor: 'var(--fuse-border)',
                    },
                },
            },
            series: this.data.taskDistribution.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.75,
                    },
                },
            },
            stroke: {
                width: 2,
            },
            theme: {
                monochrome: {
                    enabled: true,
                    color: '#93C5FD',
                    shadeIntensity: 0.75,
                    shadeTo: 'dark',
                },
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
            },
            yaxis: {
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };

        // Budget distribution
        this.chartBudgetDistribution = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'radar',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#818CF8'],
            dataLabels: {
                enabled: true,
                formatter: (val: number): string | number => `${val}%`,
                textAnchor: 'start',
                style: {
                    fontSize: '13px',
                    fontWeight: 500,
                },
                background: {
                    borderWidth: 0,
                    padding: 4,
                },
                offsetY: -15,
            },
            markers: {
                strokeColors: '#818CF8',
                strokeWidth: 4,
            },
            plotOptions: {
                radar: {
                    polygons: {
                        strokeColors: 'var(--fuse-border)',
                        connectorColors: 'var(--fuse-border)',
                    },
                },
            },
            series: this.data.budgetDistribution.series,
            stroke: {
                width: 2,
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: (val: number): string => `${val}%`,
                },
            },
            xaxis: {
                labels: {
                    show: true,
                    style: {
                        fontSize: '12px',
                        fontWeight: '500',
                    },
                },
                categories: this.data.budgetDistribution.categories,
            },
            yaxis: {
                max: (max: number): number =>
                    parseInt((max + 10).toFixed(0), 10),
                tickAmount: 7,
            },
        };

        // Weekly expenses
        this.chartWeeklyExpenses = {
            chart: {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#22D3EE'],
            series: this.data.weeklyExpenses.series,
            stroke: {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis: {
                type: 'category',
                categories: this.data.weeklyExpenses.labels,
            },
            yaxis: {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };

        // Monthly expenses
        this.chartMonthlyExpenses = {
            chart: {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#4ADE80'],
            series: this.data.monthlyExpenses.series,
            stroke: {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis: {
                type: 'category',
                categories: this.data.monthlyExpenses.labels,
            },
            yaxis: {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };

        // Yearly expenses
        this.chartYearlyExpenses = {
            chart: {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#FB7185'],
            series: this.data.yearlyExpenses.series,
            stroke: {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis: {
                type: 'category',
                categories: this.data.yearlyExpenses.labels,
            },
            yaxis: {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };
    }
}
