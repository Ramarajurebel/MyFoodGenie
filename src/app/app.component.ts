import { Component } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NfmSigninComponent } from './modules/admin/dashboards/project/nfm-signin/nfm-signin.component';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject } from 'rxjs';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
let push_key = {
    publicKey:
        'BKMGN2dgv1PqY19XZfO2Llu1iubVg7sL8BDgW2RbnOtUaLLaHIjTHs_q8nH1FIdbecLgP-aCGFlakRGzNYz74-A',
    privateKey: '8uJhNMwWsAFZ9Vtlq8LxQHjrhv-VJ0xrrIR7VGAdnXo',
};
// below is for afm public key
// let push_key = {
//     publicKey:
//         'AAAAKQKz5zg:APA91bFCNuth8iHJq1D3JtDXaXlmrHfT2Cg0MSy1dR_sp4jCcgP7PuHZeIwhizWpiwgYStHWbQRCdzkrBUmmw1AQqlMj5Z0XjuwYEQEjVw1LHzOevwgp-IntQn3p58MQcx-LbXVnAG8H',
// };
declare var window: any;
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    enableRouting: boolean;
    modalReference: any;
    modalOptions: NgbModalOptions;
    token: any;
    currentMessage = new BehaviorSubject<any>(null);
    deferredPrompt: any;
    isInstalled = false;
    /**
     * Constructor
     */
    constructor(
        private dialog: NgbModal,
        private router: Router,
        private swPush: SwPush,

        private afm: AngularFireMessaging,
        private service: ProjectService
    ) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            // The browser doesn't support getUserMedia()
            console.log('getUserMedia() is not supported');
            return;
        }
        if (!window.AudioContext) {
            // The browser doesn't support the Web Audio API
            console.log('Web Audio API is not supported');
            return;
        }
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                // User granted permission, do something with the audio stream
                console.log('User granted permission', stream);
            })
            .catch((err) => {
                // User denied permission or there was an error
                console.log('getUserMedia() error:', err);
            });

        this.router.navigate(['dashboards/project'], {
            skipLocationChange: true,
        });
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
    requestPushNotifications() {
        this.afm.requestToken.subscribe(
            (token) => {
                console.log('token', token);
                this.token = token;
                this.service.fetchRequestPost('');
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
            navigator.serviceWorker
                .getRegistration('/firebase-cloud-messaging-push-scope')
                .then((registration) => {
                    registration.showNotification(message.notification.title);
                });

            this.currentMessage.next(message);
        });
    }
    showNotification(notification) {
        console.log(notification);
        const title = notification.title;
        // Notification options

        new Notification(title);
    }
}
