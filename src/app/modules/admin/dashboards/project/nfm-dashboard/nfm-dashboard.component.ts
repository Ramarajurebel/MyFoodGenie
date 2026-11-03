import {
    Component,
    ElementRef,
    Inject,
    LOCALE_ID,
    OnInit,
    ViewChild,
} from '@angular/core';
import { UserProfile } from './../userprofiel';
import { Router } from '@angular/router';
import {
    NgbModal,
    NgbModalOptions,
    NgbActiveModal,
} from '@ng-bootstrap/ng-bootstrap';
import { NfmSigninComponent } from '../nfm-signin/nfm-signin.component';
import { FormControl } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

import { formatDate } from '@angular/common';
import { SwPush, SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject } from 'rxjs';
import { Howl, Howler } from 'howler';
import { AudioService } from './../../../../../nfm/audio.service';
import { ProjectService } from './../project.service';
import { folders } from './../../../../../mock-api/apps/mailbox/data';
let push_key = {
    publicKey:
        'BKMGN2dgv1PqY19XZfO2Llu1iubVg7sL8BDgW2RbnOtUaLLaHIjTHs_q8nH1FIdbecLgP-aCGFlakRGzNYz74-A',
    privateKey: '8uJhNMwWsAFZ9Vtlq8LxQHjrhv-VJ0xrrIR7VGAdnXo',
};
@Component({
    selector: 'app-nfm-dashboard',
    templateUrl: './nfm-dashboard.component.html',
    styleUrls: ['./nfm-dashboard.component.scss'],
})
export class NfmDashboardComponent implements OnInit {
    user: UserProfile;
    modalOption: NgbModalOptions = {};
    modalReference: any;
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
    public recipesCount: number = 0;
    public KITPREP: number = 0;
    public TASKMGM: number = 0;
    public eventdate: FormControl = new FormControl('');
    public category: FormControl = new FormControl('');
    public categoryData = [{ category: 'Curry Point' }, { category: 'Event' }];
    public tiffins_SnacksKITCOOK: number = 0;
    public lunch_DinnerKITCOOK: number = 0;

    public tiffins_SnacksPrepCount: number = 0;
    public lunch_DinnerPrepCount: number = 0;
    public KITPACK: number = 0;
    PO: number = 0;
    dropdownSettings: IDropdownSettings;
    EVENT: number = 0;
    INVT: number = 0;
    ORDERS: number = 0;
    enquiryData = [];
    ENQ: number = 0;
    KITCOOK: number = 0;
    EMPDET: number = 0;
    EMPASSIGN: number = 0;
    MODMGM: number = 0;
    ROLEMGM: number = 0;
    empAssignmentData = [];
    moduleManagementData = [];
    assignedTiles = [];
    roleManagementData = [];
    globalVariables: any;
    PURRATE: number = 0;
    ordersData = [];
    private deferredPrompt: any;
    isInstalled = false;
    currentMessage = new BehaviorSubject<any>(null);
    SO: number = 0;
    SOData = [];
    tasks = [];
    assignedTasks = [];
    audio;
    objectInitalised: boolean = false;
    initialized = false;
    TRSCTION: number = 0;
    @ViewChild('google_translate')
    googleTranslateElement!: ElementRef;
    RCPS: number = 0;
    CTRM: number = 0;
    SALETRNSCTION: number = 0;
    FoodMenu: number = 0;
    VENDORS: number = 0;
    langSelect: FormControl = new FormControl();
    EMPPMTS: number = 0;
    EMPSLRY: number = 0;
    VSLINV: number = 0;
    EVTINGRRPRT: number = 0;
    EVTRCPRPRT: number = 0;
    loginState: boolean = false;
    employeeId: number = 0;
    employeeName: string = '';
    employeeAttendanceList = [];
    EMPATTD: number = 0;
    usrImg: string = '';
    EMPLVS: number = 0;
    PINOUT: number = 0;
    EMPGRP: number = 0;
    COMPMGMT: number = 0;
    CONTMGMT: number = 0;
    constructor(
        private _router: Router,
        private dialog: NgbModal,
        private _projectService: ProjectService,
        @Inject(LOCALE_ID) public locale: string,
        private swUpdate: SwUpdate,
        private swPush: SwPush,

        private afm: AngularFireMessaging,
        private audioService: AudioService
    ) {
        // document.addEventListener('click', () => {
        //     Notification.requestPermission((perm) => {
        //         if (perm === 'granted') {
        //             new Notification('message.notification.title', {
        //                 body: 'Testing',
        //             });
        //         }
        //     });
        // });

        let jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            this.modalOption.backdrop = 'static';
            this.modalOption.keyboard = false;
            this.modalReference = this.dialog.open(
                NfmSigninComponent,
                this.modalOption
            );
        } else {
            this.dialog.dismissAll();
            this.subscribeToNotifications();
            // this.getWebPushNotifications();
            this.requestPushNotifications();
            this.getMessages();

            console.log('before suwpdate');
            this.swUpdate.versionUpdates
                .pipe(
                    filter(
                        (evt: VersionReadyEvent): evt is VersionReadyEvent =>
                            evt.type === 'VERSION_READY'
                    )
                )
                .subscribe((evt) => {
                    console.log('is update inside filter');
                    if (
                        confirm('Do you want to update to latest code?') ===
                        true
                    ) {
                        // Reload the page to update to the latest version.
                        document.location.reload();
                    }
                });

            // setInterval(() => {
            //     console.log('1');
            //     this.CheckTasksForAlarm();
            // }, 1000);
        }
    }
    handleMessage(event: MessageEvent) {
        if (event.data && event.data.type === 'notification-click') {
            console.log('route', event.data.route);
            const route = event.data.route;
            if (route != '' && route != null) {
                this._router.navigateByUrl(`nfm/kitchen-tasks/${route}`, {
                    skipLocationChange: true,
                });
            }
            // Play audio

            // Display alert
        }
    }
    subscribeToNotifications() {
        this.swPush
            .requestSubscription({
                serverPublicKey: push_key.publicKey,
            })
            .then((sub) => {
                console.log('Subscribed to push', sub);
            })

            .catch((err) =>
                console.error('Could not subscribe to notifications', err)
            );
    }
    getWebPushNotifications() {
        this.swPush.messages.subscribe((message) => {
            console.log(message);
        });
        // this.swPush.notificationClicks.subscribe(
        //     ({ action, notfication }) => {}
        // );
    }
    ngAfterViewInit() {
        setTimeout(() => {
            const gooleTranslateElement = document.getElementById(
                'google_translate'
            );
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.src =
                'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            gooleTranslateElement.appendChild(s);
            const v = document.createElement('script');
            v.type = 'text/javascript';
            v.innerHTML = `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false,
                layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
                targetLanguage: 'en' // Set the default language to Hindi
              }, 'google_translate');
            }
          `;
            gooleTranslateElement.appendChild(v);
            setTimeout(() => {
                let defaultLanguage = 'en';
                let user = JSON.parse(localStorage.getItem('user'));
                this.stallOperator.forEach((item) => {
                    if (user.mobileNumber === item.mobile) {
                        console.log(item);
                        if (item.defaultLanguage) {
                            defaultLanguage = item.defaultLanguage;
                        }
                    }
                });
                const select = document.querySelector(
                    '.goog-te-combo'
                ) as HTMLSelectElement;
                console.log('lan', defaultLanguage);
                select.value = defaultLanguage;
                this.langSelect.setValue(defaultLanguage);
                console.log(select);
                select.dispatchEvent(new Event('change'));
                const googleBody = document.getElementsByClassName(
                    'goog-te-gadget'
                );
                for (let i = 0; i < googleBody.length; i++) {
                    const element = googleBody[i] as HTMLElement;

                    element.style.display = 'none';
                    console.log(element);
                }
            }, 1000);
        }, 5000);
    }
    OnLangChange(value) {
        const select = document.querySelector(
            '.goog-te-combo'
        ) as HTMLSelectElement;
        console.log('lan', value);
        select.value = value;
        console.log(select);
        select.dispatchEvent(new Event('change'));
    }
    // ngAfterViewInit() {
    //     // Create a div element with the ID 'google_translate'
    //     const gooleTranslateElement = document.createElement('div');
    //     gooleTranslateElement.id = 'google_translate';

    //     // Append the div to the body
    //     document.body.appendChild(gooleTranslateElement);

    //     const s = document.createElement('script');
    //     s.type = 'text/javascript';
    //     s.src =
    //         'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    //     gooleTranslateElement.appendChild(s);

    //     const v = document.createElement('script');
    //     v.type = 'text/javascript';
    //     v.innerHTML = `
    //       function googleTranslateElementInit() {
    //         new google.translate.TranslateElement({
    //           pageLanguage: 'en',
    //           autoDisplay: false,
    //           layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
    //           targetLanguage: 'hi' // Set the default language to Hindi
    //         }, 'google_translate');

    //       }
    //     `;
    //     gooleTranslateElement.appendChild(v);

    //     setTimeout(() => {
    //         const select = document.querySelector(
    //             '.goog-te-combo'
    //         ) as HTMLSelectElement;
    //         select.value = 'te';
    //         console.log('select ', select);
    //         select.dispatchEvent(new Event('change'));
    //         const googleBody = document.getElementsByClassName('skiptranslate');
    //         for (let i = 0; i < googleBody.length; i++) {
    //             const element = googleBody[i] as HTMLElement;

    //             element.style.display = 'none';
    //         }
    //     }, 1000);
    // }

    requestPushNotifications() {
        this.afm.requestToken.subscribe(
            async (token) => {
                console.log('token', token);
                token;
                let user = JSON.parse(localStorage.getItem('user'));
                let payload = {
                    mobile: user.mobileNumber,
                    token: token,
                };
                const tokeResp = await this._projectService.fetchRequestPost(
                    'pushnotification/createtoken',
                    payload
                );
            },
            (err) => {
                console.log('unable to get permission', err);
            }
        );
    }
    getMessages() {
        this.afm.messages.subscribe((message) => {
            console.log('new Message', message);
            console.log(message.notification);
            alert(message.notification.title);
            // navigator.serviceWorker
            //     .getRegistration('/firebase-cloud-messaging-push-scope')
            //     .then((registration) => {
            //         registration.showNotification(message.notification.title);
            //     });

            this.currentMessage.next(message);
        });
        //
        this.afm.onBackgroundMessage((payload: any) => {
            console.log('payload in total closed state', payload);
            const clickAction = payload.data.url;

            // Handle notification click event
            // Navigate to a specific page in your PWA or perform other actions as necessary
            console.log('Notification clicked:', clickAction);
            window.open(clickAction, '_blank');
        });
    }
    showNotification(notification) {
        console.log(notification);
        const title = notification.title;
        // Notification options

        new Notification(title);
    }

    async ngOnInit() {
        navigator.serviceWorker.addEventListener(
            'message',
            this.handleMessage.bind(this)
        );
        // PURRATE lenght

        // const rateCardResp = await this._projectService.fetchRequest(
        //     'purchaseratecard/getAllpurchaseratecard'
        // );
        // this.PURRATE = rateCardResp['purchaseratecardList'].length;

        // logic for tiles for specific user
        let user = JSON.parse(localStorage.getItem('user'));
        let userMobileNumber = user.mobileNumber;
        const resp = await this._projectService.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        let allOperators = resp['stallOperatorList'];
        allOperators.forEach((obj) => {
            if (obj.mobile === userMobileNumber) {
                if (obj.imageData) {
                    this.usrImg = `data:image/png;base64,${obj.imageData}`;
                }

                this.employeeId = obj.stalloperatorid;
                this.employeeName = obj.name;
            }
        });
        this.stallOperator = allOperators.filter((op) => {
            return op?.role === 'Employee' || op?.role == 'Vendor';
        });
        const getRespEmp = await this._projectService.fetchRequest(
            'employeeassignment/getAllemployeeassignment'
        );
        this.empAssignmentData = getRespEmp['employee_assignmentList'];
        const getResp = await this._projectService.fetchRequest(
            'modulemanagement/getAllmodulemanagement'
        );
        console.log(getResp);
        this.moduleManagementData = getResp['modulemanagementList'];
        // const getSOResp = await this._projectService.fetchRequest(
        //     'saleorder/getAllSaleorder'
        // );
        // this.SOData = getSOResp['saleorderList'];
        // const getresp = await this._projectService.fetchRequest(
        //     'rcpheader/getAllrcpheader'
        // );
        // this.RCPS = getresp['rcpheaderList'].length;
        const attendanceResp = await this._projectService.fetchRequest(
            'employeeattendance/getTodayEmployeeAttendance'
        );
        this.employeeAttendanceList = attendanceResp['employeeAttendanceList'];
        // for punch in punch out
        this.employeeAttendanceList.forEach((emp) => {
            if (emp.employeeId == this.employeeId) {
                console.log('End Time', emp.endTime);
                if (emp.endTime == '00:00:00' || emp.endTime == null) {
                    if (emp.startTime != null && emp.startTime != '00:00:00') {
                        this.loginState = true;
                    }
                } else this.loginState = false;
            }
        });
        // getting only active employee Assignment status && modules data
        this.moduleManagementData = this.moduleManagementData.filter(
            (modules) => {
                return modules.status === 'Active';
            }
        );
        this.moduleManagementData = this.moduleManagementData.sort((a, b) => {
            return a?.moduleId - b?.moduleId;
        });
        this.empAssignmentData = this.empAssignmentData.filter((emp) => {
            return emp.active === true;
        });

        this.dropdownSettings = {
            singleSelection: false,
            idField: 'category',
            textField: 'category',
            allowSearchFilter: true,
        };
        let orderPayload = {};
        let startDate = formatDate(
            new Date().setHours(0, 0, 0, 0),
            'YYYY-MM-dd HH:MM:ss',
            this.locale
        );

        let endDate = new Date();
        endDate.setHours(23, 59, 59);
        let finalEndDate = formatDate(
            endDate,
            'YYYY-MM-dd HH:MM:ss',
            this.locale
        );
        orderPayload['startDate'] = startDate;
        orderPayload['endDate'] = finalEndDate;
        const ordersResp = await this._projectService.fetchRequestPost(
            'rest/order/OrderCollection',
            orderPayload
        );
        if (ordersResp['orders']) this.ordersData = ordersResp['orders'];
        this.ORDERS = this.ordersData.length;
        console.log(this.ORDERS);
        // this._projectService
        //     .getOrderCollection(orderPayload)
        //     .subscribe((data) => {
        //         let orders = data;
        //         this.ORDERS = orders.length;
        //         console.log(this.ORDERS);
        //     });
        let jwtToken = localStorage.getItem('jwtToken');
        // console.log(jwtToken);
        if (jwtToken) {
            this.user = JSON.parse(localStorage.getItem('user'));
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
            this.PO = finalpoData.length;
            // let eventResp = await this._projectService.fetchRequest(
            //     'keventheader/getAllkeventheader'
            // );
            // this.events = eventResp['keventheaderList'];
            // const getenqresp = await this._projectService.fetchRequest(
            //     'enquiry/getAllEnquiry'
            // );
            // this.enquiryData = getenqresp['enquiryList'];
            // this.enquiryData = this.enquiryData.filter((item) => {
            //     if (item.status == 'Open') return item;
            // });
            // this.ENQ = this.enquiryData.length;
            // count for events
            let date = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
            // let todayEvents = this.events.filter((event) => {
            //     return event.eventdate === date;
            // });
            // this.EVENT = todayEvents.length;
            const getresp = await this._projectService.fetchRequest(
                'tasklist/getAlltasklist'
            );
            this.tasks = getresp['tasklistList'];
            console.log('Tasks list', this.tasks);

            // getting mobile number from stalloperator service for filtering based on user
            let finaltasks = this.tasks.filter((item) => {
                return item?.status !== 'Completed';
            });
            let user = JSON.parse(localStorage.getItem('user'));
            console.log(user.mobilenumber);
            if (user.role != 'admin') {
                finaltasks = finaltasks.filter((item) => {
                    if (item.mobileno == user.mobileNumber) return item;
                });
            }
            const getResp = await this._projectService.fetchRequest(
                'rolemanagement/getAllrolemanagement'
            );
            console.log(getResp);
            this.roleManagementData = getResp['rolemanagementList'];
            this.TASKMGM = finaltasks.length;
            // For Recipes
            // this.events = this.events.filter((item: any) => {
            //     if (item.status != 'Completed') return item;
            // });
            // this.tempEvents = JSON.parse(JSON.stringify(this.events));
            // const currentDate = formatDate(
            //     new Date(),
            //     'YYYY-MM-dd',
            //     this.locale
            // );
            // console.log(currentDate);
            // this.events = this.events.filter((item: any) => {
            //     if (item.eventdate == currentDate) return item;
            // });
            // this.EventType = JSON.stringify(temp);
            //     let currentTime = formatDate(
            //         new Date().getTime(),
            //         'HH:mm:ss',
            //         this.locale
            //     );
            //     console.log(currentTime);
            //     if (currentTime >= '13:00:00' && currentTime < '18:00:00') {
            //         console.log('Evening');

            //         this.GetMorningOrEveningData(
            //             'Snacks',
            //             'Dinner',
            //             currentDate,
            //             this.events
            //         );
            //     } else if (currentTime > '18:00:00' && currentTime < '23:59:59') {
            //         console.log('Tommorrow Morning');
            //         let date = new Date();
            //         let todate = date.getDate() + 1;
            //         date.setDate(todate);
            //         console.log(date);
            //         let tommorrowdate = formatDate(date, 'YYYY-MM-dd', this.locale);
            //         this.events = this.tempEvents;
            //         this.events = this.events.filter((item) => {
            //             return item.eventdate == tommorrowdate;
            //         });
            //         this.recipesCount = 0;
            //         let events = await this.GetMorningOrEveningData(
            //             'Tiffins',
            //             'Lunch',
            //             tommorrowdate,
            //             this.events
            //         );

            //         console.log(this.recipesCount);
            //     } else {
            //         console.log('Today Morning');

            //         let events = await this.GetMorningOrEveningData(
            //             'Tiffins',
            //             'Lunch',
            //             currentDate,
            //             this.events
            //         );
            //     }
            // }
        }
        // function alarmForAssignedTasks
        // this.AlarmForAssignedTasks();
        if (this.swUpdate.isEnabled) {
            // Listen for updates to the service worker
            // setInterval(() => {
            //     console.log('1');
            //     this.CheckTasksForAlarm();
            // }, 1000);
        }
        console.log(this.recipesCount);
        this.TilesList();
    }
    async OnTxttoSpeech() {
        let payload = {
            audioConfig: { audioEncoding: 'MP3' },
            input: {
                text:
                    'Swiggy Order Recieved,2 pieces One Plate poori ,4 pieces one plate bajji ',
            },
            voice: {
                languageCode: 'te-IN',
                name: 'te-IN-Standard-A',
            },
        };
        const respAudio = await this._projectService.TextToSpeech(payload);
        const base64String = respAudio['audioContent'];
        const audio = new Audio(
            'data:audio/mp3;base64,' + base64String.toString('base64')
        );

        audio.play();
    }
    AlarmForAssignedTasks() {
        let currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        this.assignedTasks = this.tasks.filter((task) => {
            return task.mobileno == this.user.mobileNumber;
        });
        console.log('Assigned Taskssssssssss....', this.assignedTasks);
        this.assignedTasks = this.assignedTasks.filter((task) => {
            return task.status != 'Completed' && task.duedate === currentDate;
        });
        if (this.assignedTasks.length > 0) {
            this.assignedTasks.forEach((data) => {
                let dateObj: Date = new Date(Date.parse(data.duedate));
                const [hours, minutes, seconds] = data.starttime
                    .split(':')
                    .map(Number);
                dateObj.setHours(hours);
                dateObj.setMinutes(minutes);
                dateObj.setSeconds(seconds);
                console.log('Alarm Date Object is --->', dateObj);
                data['alarmDate'] = dateObj;
                data['isTimeReached'] = false;
            });
        }
    }
    CheckTasksForAlarm() {
        this.objectInitalised = true;
        let currentDate = new Date();
        this.assignedTasks.forEach((task) => {
            if (task.alarmDate.getDate() === currentDate.getDate()) {
                let taskTime =
                    task.alarmDate.getHours() * 60 +
                    task.alarmDate.getMinutes();
                let currentTime =
                    currentDate.getHours() * 60 + currentDate.getMinutes();
                let taskidDb = localStorage.getItem(task.taskid + '');
                if (taskTime === currentTime && taskidDb != task.taskid) {
                    if (taskidDb == null || taskidDb == undefined) {
                        localStorage.setItem(task.taskid + '', task.taskid);
                    }
                    this.audioService.play();
                    let array = [];
                    let obj = {
                        taskid: task.taskid,
                        status: task.status,
                    };
                    console.log('Obj', obj);
                    let tasksList = JSON.parse(localStorage.getItem('tasks'));
                    if (tasksList === null || tasksList === undefined) {
                        array.push(obj);
                        let tasksList = JSON.stringify(array);
                        localStorage.setItem('tasks', tasksList);
                        console.log('inside..');
                    } else {
                        if (tasksList.length > 0) {
                            tasksList.push(obj);
                            let tasksData = JSON.stringify(tasksList);
                            localStorage.setItem('tasks', tasksData);
                        }
                    }
                    // this.audio.pause();
                    // this.audio.currentTime = 0;
                    // this._router.navigate([`nfm/kitchen-tasks/TASKMGM`], {
                    //     skipLocationChange: true,
                    // });
                }
            }
        });
    }
    async OnNotification() {
        let payload = {
            subject: 'some subject',
            content: 'Some long content',
            image: 'https://somedomain.com/example.jpg',
            data: {
                key1: 'Value 1',
                key2: 'Value 2',
                key3: 'Value 3',
                key4: 'Value 4',
            },
        };
        const resp = await this._projectService.fetchRequestPost(
            'pushnotification',
            payload
        );
        console.log(resp);
    }
    async GetMorningOrEveningData(type1: String, type2: String, date, events) {
        const reportResp = await this._projectService.fetchRequest(
            'recipepreparation/getallpreparationdata'
        );
        let cookingData = reportResp['recipepreparationList'];
        cookingData = cookingData.filter((data) => {
            if (data.eventtype === type1 || data.eventtype === type2) {
                if (data.eventdate === date) {
                    return data;
                }
            }
        });
        // this.KITCOOK = cookingData.length;

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
        this.KITPACK = recipesData.length;
        this.KITPREP = recipesData.length;
        // for temporaray
        this.KITCOOK = recipesData.length;
        let inventoryJson = [];
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
        const dateResp = await this._projectService.fetchRequestPost(
            'kitcheninventory/getkitcheninventory',
            datePayload
        );
        inventoryJson = dateResp['kitcheninventoryList'];

        inventoryJson.forEach((element) => {
            element['balance'] =
                element.availableQuantity - element.saleQuantity;
        });
        inventoryJson = inventoryJson.sort((a, b) => {
            if (a.balance < b.balance) return -1;
            if (a.balance > b.balance) return 1;
            return 0;
        });
        this.INVT = inventoryJson.length;
        // others count

    }
    TilesList() {
        this.EMPDET = this.stallOperator.length;
        this.EMPASSIGN = this.empAssignmentData.length;
        this.MODMGM = this.moduleManagementData.length;
        this.ROLEMGM = this.roleManagementData.length;
        this.SO = this.SOData.length;
        // this.recipesCount = recipesData.length;
        // below is for tiles logic
        // below is empModuleAssigmentdata
        this.empAssignmentData.forEach((emp) => {
            this.stallOperator.forEach((operator) => {
                if (operator.stalloperatorid === emp.employeeId)
                    emp['mobileNumber'] = operator.mobile;
            });
        });
        this.empAssignmentData = this.empAssignmentData.filter((emp) => {
            return emp.mobileNumber === this.user.mobileNumber;
        });
        console.log(this.empAssignmentData);
        // adding module names to empAssignementData;
        this.empAssignmentData.forEach((emp) => {
            this.moduleManagementData.forEach((mod) => {
                if (emp.moduleId === mod.moduleId) {
                    emp['moduleName'] = mod.moduleName;
                }
            });
        });
        console.log(this.moduleManagementData);
        console.log("emp", this.empAssignmentData);
        // adding count key
        this.moduleManagementData.forEach((mod) => {
            mod['count'] = 0;
        });
        // creating gloabal variables object
        this.globalVariables = {
            KITPREP: {
                count: this.KITPREP,
                icon: 'heroicons_solid:beaker',
                class: 'font-bold text-4xl text-purple-500',
                iconClass: 'w-15 h-14 text-purple-500',
            },
            KITCOOK: {
                count: this.KITCOOK,
                icon: 'heroicons_solid:cake',
                class: 'font-bold text-4xl text-blue-500',
                iconClass: 'w-15 h-14 text-blue-500',
            },
            KITPACK: {
                count: this.KITPACK,
                icon: 'heroicons_solid:truck',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            TASKMGM: {
                count: this.TASKMGM,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            },
            PO: {
                count: this.PO,
                icon: 'heroicons_solid:currency-rupee',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            INVT: {
                count: this.INVT,
                icon: 'heroicons_solid:beaker',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            },
            EVENT: {
                count: this.EVENT,
                icon: 'heroicons_solid:calendar',
                class: 'font-bold text-4xl text-orange-500',
                iconClass: 'w-15 h-14 text-orange-500',
            },
            ENQ: {
                count: this.ENQ,
                icon: 'heroicons_solid:calendar',
                class: 'font-bold text-4xl text-yellow-500',
                iconClass: 'w-15 h-14 text-yellow-500',
            },
            SO: {
                count: this.SO,
                icon: 'heroicons_solid:currency-rupee',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            REPRT: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            },
            ROLEMGM: {
                count: this.ROLEMGM,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-blue-500',
                iconClass: 'w-15 h-14 text-blue-500',
            },
            MODMGM: {
                count: this.MODMGM,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-yellow-500',
                iconClass: 'w-15 h-14 text-yellow-500',
            },
            // EMPASSIGN: {
            //     count: this.EMPASSIGN,
            //     icon: 'heroicons_solid:clipboard-list',
            //     class: 'font-bold text-4xl text-orange-500',
            //     iconClass: 'w-15 h-14 text-orange-500',
            // },
            // EMPDET: {
            //     count: this.EMPDET,
            //     icon: 'heroicons_solid:beaker',
            //     class: 'font-bold text-4xl text-red-500',
            //     iconClass: 'w-15 h-14 text-red-500',
            // },
            ORDERS: {
                count: this.ORDERS,
                icon: 'heroicons_solid:currency-rupee',
                class: 'font-bold text-4xl text-blue-500',
                iconClass: 'w-15 h-14 text-blue-500',
            },
            PURRATE: {
                count: this.PURRATE,
                icon: 'heroicons_solid:currency-rupee',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            TRSCTION: {
                count: this.TRSCTION,
                icon: 'heroicons_solid:calendar',
                class: 'font-bold text-4xl text-yellow-500',
                iconClass: 'w-15 h-14 text-yellow-500',
            },
            RCPS: {
                count: this.RCPS,
                icon: 'heroicons_solid:cake',
                class: 'font-bold text-4xl text-blue-500',
                iconClass: 'w-15 h-14 text-blue-500',
            },
            CTRM: {
                count: this.CTRM,
                icon: 'heroicons_solid:cake',
                class: 'font-bold text-4xl text-blue-500',
                iconClass: 'w-15 h-14 text-blue-500',
            },
            SALETRNSCTION: {
                count: this.SALETRNSCTION,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-orange-500',
                iconClass: 'w-15 h-14 text-orange-500',
            },
            FoodMenu: {
                count: this.CTRM,
                icon: 'heroicons_solid:cake',
                class: 'font-bold text-4xl text-blue-500',
                iconClass: 'w-15 h-14 text-blue-500',
            },
            VENDORS: {
                count: this.VENDORS,
                icon: 'heroicons_solid:calendar',
                class: 'font-bold text-4xl text-yellow-500',
                iconClass: 'w-15 h-14 text-yellow-500',
            },
            PRODS: {
                count: 0,
                icon: 'heroicons_solid:beaker',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            },
            FOODINV: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            },
            // EMPPMTS: {
            //     count: this.EMPPMTS,
            //     icon: 'heroicons_solid:clipboard-list',
            //     class: 'font-bold text-4xl text-red-500',
            //     iconClass: 'w-15 h-14 text-red-500',
            // },
            // EMPSLRY: {
            //     count: this.EMPSLRY,
            //     icon: 'heroicons_solid:currency-rupee',
            //     class: 'font-bold text-4xl text-blue-500',
            //     iconClass: 'w-15 h-14 text-blue-500',
            // },
            VSLINV: {
                count: this.VSLINV,
                icon: 'heroicons_solid:truck',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            EVTINGRRPRT: {
                count: this.EVTINGRRPRT,
                icon: 'heroicons_solid:truck',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            EVTRCPRPRT: {
                count: this.EVTRCPRPRT,
                icon: 'heroicons_solid:truck',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            // EMPATTD: {
            //     count: this.EMPATTD,
            //     icon: 'heroicons_solid:truck',
            //     class: 'font-bold text-4xl text-green-500',
            //     iconClass: 'w-15 h-14 text-green-500',
            // },
            // EMPLVS: {
            //     count: this.EMPLVS,
            //     icon: 'heroicons_solid:beaker',
            //     class: 'font-bold text-4xl text-red-500',
            //     iconClass: 'w-15 h-14 text-red-500',
            // },
            // PINOUT: {
            //     count: this.PINOUT,
            //     icon: 'heroicons_solid:calendar',
            //     class: 'font-bold text-4xl text-orange-500',
            //     iconClass: 'w-15 h-14 text-orange-500',
            // },
            EMPGRP: {
                count: this.EMPGRP,
                icon: 'heroicons_solid:currency-rupee',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            COMPMGMT: {
                count: this.COMPMGMT,
                icon: 'heroicons_solid:currency-rupee',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            CONTMGMT: {
                count: this.CONTMGMT,
                icon: 'heroicons_solid:currency-rupee',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            TMGMT: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            },
            GEINV: {
                count: 0,
                icon: 'heroicons_solid:truck',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            },
            GEMECH: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            GEMGMT: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            qrg: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            NWQR: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            VMSTRS: {
                count: 0,
                icon: 'heroicons_solid:currency-rupee',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            WALLET: {
                count: 0,
                icon: 'heroicons_solid:currency-rupee',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            PRODINVT: {
                count: 0,
                icon: 'heroicons_solid:currency-rupee',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            SCHEDULERS: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            },
            ITEMINV: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            PORDERS: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            REFILL: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            MOVORD: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-green-500',
                iconClass: 'w-15 h-14 text-green-500',
            },
            STOCK: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            },
            ENTITYFRAMEWORK: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            },
            SCANTOTEXT: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            },
            PRODUCTQR: {
                count: 0,
                icon: 'heroicons_solid:clipboard-list',
                class: 'font-bold text-4xl text-red-500',
                iconClass: 'w-15 h-14 text-red-500',
            }
        };
        // logic for tiles is below
        // the number is Venkat Admin 9618812143 // mine 7995885506
        if (this.user.mobileNumber != '9618812143') {
            console.log(this.moduleManagementData);
            console.log(this.empAssignmentData);
            this.assignedTiles = this.moduleManagementData.filter((modules) => {
                return this.empAssignmentData.find(
                    (employ) => employ.moduleName === modules.moduleName
                );
            });
            // for active or not
            this.assignedTiles.forEach((tile) => {
                this.empAssignmentData.forEach((assign) => {
                    if (tile.moduleName === assign.moduleName) {
                        tile['isEdit'] = assign.manage;
                    }
                });
            });
            if (localStorage.getItem('userTilesList')) {
                localStorage.setItem(
                    'userTilesList',
                    JSON.stringify(this.assignedTiles)
                );
            } else {
                localStorage.setItem(
                    'userTilesList',
                    JSON.stringify(this.assignedTiles)
                );
            }
        } else {
            this.assignedTiles = this.moduleManagementData;
            this.assignedTiles.forEach((tile) => {
                this.empAssignmentData.forEach((assign) => {
                    if (tile.moduleName === assign.moduleName) {
                        tile['isEdit'] = true;
                    }
                });
            });
            if (localStorage.getItem('userTilesList')) {
                localStorage.setItem(
                    'userTilesList',
                    JSON.stringify(this.assignedTiles)
                );
            } else {
                localStorage.setItem(
                    'userTilesList',
                    JSON.stringify(this.assignedTiles)
                );
            }
        }
        // default false;
        this.assignedTiles.forEach((tile) => {
            tile['hidden'] = true;
        });
        console.log('gloabla', this.globalVariables);
        this.assignedTiles.forEach((tile) => {
            Object.keys(this.globalVariables).forEach((key) => {
                if (key === tile.moduleName) {
                    tile['count'] = this.globalVariables[key].count;
                    tile['icon'] = this.globalVariables[key].icon;
                    tile['class'] = this.globalVariables[key].class;
                    tile['iconClass'] = this.globalVariables[key].iconClass;
                    tile['hidden'] = false;
                }
            });
        });
        console.log('tileslist', this.assignedTiles);
    }
    LoginLogout(value) {
        console.log(value);
        const currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        const currentTime = formatDate(new Date(), 'HH:mm:ss', 'en-US');
        const payload = {
            employeeAttendanceId: 0,
            employeeId: this.employeeId,
            date: currentDate,
            startTime: currentTime,
            endTime: '',
            employeeName: this.employeeName,
        };
        if (value) {
            this.InsertAttendance(payload);
        } else {
            const updatePayload = {
                employeeId: this.employeeId,
            };
            this.UpdateEndTime(updatePayload);
        }
    }
    async UpdateEndTime(payload) {
        const resp = await this._projectService.fetchRequestPost(
            'employeeattendance/updateEndTime',
            payload
        );
    }
    async InsertAttendance(payload) {
        const resp = await this._projectService.fetchRequestPost(
            'employeeattendance/createEmployeeAttendance',
            payload
        );
    }
    GetUserLocation() {
        navigator.geolocation.getCurrentPosition((location) => {
            console.log(location.coords.latitude);
            console.log(location.coords.longitude);
        });
        navigator.geolocation.watchPosition((position) => {
            console.log('Watch', position);
        });
    }
    OnNavigate(url: string) {
        let jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
            this._router.navigate([`nfm/kitchen-tasks/${url}`], {
                skipLocationChange: true,
            });
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
}
