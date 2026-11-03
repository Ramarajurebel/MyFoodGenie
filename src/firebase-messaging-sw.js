importScripts("https://www.gstatic.com/firebasejs/8.0.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.0.0/firebase-messaging.js");

// The object we pass as an argument is the same object we copied into the environment files
firebase.initializeApp({
    apiKey: "AIzaSyAXpXvV4AYMQyJhq5HRVS45cTkpdbUK8_k",
    authDomain: "fir-messaging-3cb87.firebaseapp.com",
    projectId: "fir-messaging-3cb87",
    storageBucket: "fir-messaging-3cb87.appspot.com",
    messagingSenderId: "176139003704",
    appId: "1:176139003704:web:74910c4ecf6021631243cd",
    measurementId: "G-RWBBHM16G9",
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
    console.log("onBackgroundMessage", payload);

    var notificationTitle = payload.data.title;
    var notificationOptions = {
        body: payload.data.body,
        vibrate: [200, 100, 200],
        data: {
            url: payload.data.click_action,
            body: payload.data.body,
            route: payload.data.route,
        },
        tag: "unique-notification-tag",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

////Code for adding event on click of notification
self.addEventListener("notificationclick", function (event) {
    console.log("notificationclick", event);
    var urlToRedirect = event.notification.data.url;
    var route = event.notification.data.route;
    event.notification.close();
    var focusApp = false;

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then(function (windowClients) {
                for (var i = 0; i < windowClients.length; i++) {
                    var client = windowClients[i];
                    client.postMessage({
                        type: "notification-click",
                        route: route,
                    });
                    if (client.visibilityState === "hidden") {
                        focusApp = true;
                        client.focus();
                        break;
                    }
                }

                if (!focusApp) {
                    for (var i = 0; i < windowClients.length; i++) {
                        client = windowClients[i];
                        client.postMessage({
                            type: "notification-click",
                            route: route,
                        });
                    }
                    return clients.openWindow(urlToRedirect);
                }
            })
    );
});
