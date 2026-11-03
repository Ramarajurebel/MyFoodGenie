import { Inject, Injectable, Pipe } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from './../../../../../environments/environment.prod';
import { UserProfile } from './userprofiel';
import { throwError, concat, of } from 'rxjs';
import { map, startWith, delay } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Orders } from 'app/shared/classes/orders';
import { category } from 'app/shared/classes/category';
import { productitems } from 'app/shared/classes/productitems';
const endpoint = '/api/';
let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
//token = "Bearer " + "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI5MTk2MTg1Nzc3NTciLCJpc3MiOiJmcmVzaG1hcnQuaW8iLCJpYXQiOjE2MzkwMDMwMzYsImV4cCI6MTYzOTA4OTQzNn0.shDK_P3Fypldig_f_iTt-0SAbhzomgYGKQlTRQB9HqPxiuuJ1i9FC0BAMDBf_7QsuIxH0XBz6FfBjpHwDvQYuQ";
//token = 'Bearer ' + jwtToken;
const contextRoot = '/nfmapi/';
const reqHeader = new HttpHeaders({
    'Content-Type': 'application/json',
    'No-Auth': 'True',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT',
});
const reqSpeechHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
});
const vmsApiHeaders = new HttpHeaders({
    'authorization': "7f61f4515ac95125628106bd8ccd2a46d851c63d6b5ac64224e4cc10aebc1902"

})
@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    hostName: string;

    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    // private apiUrl = 'https://cloud-test.vendomaticindia.com/api/';
    private apiUrl = '/vendomatic/';
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private router: Router) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */

    getData(): Observable<any> {
        return this._httpClient.get('api/dashboards/project').pipe(
            tap((response: any) => {
                this._data.next(response);
            })
        );
    }
    getHostname(): string {
        let hostname = window.location.hostname;
        if (hostname.includes('localhost')) {
            return endpoint;
            // return 'https://myfoodgenie.com/nfmgenieapi/'
            // return 'https://navifoodmart.com/nfmgenieapi/';
            // return 'http://localhost:8080/nfmgenieapi/';
        } else {
            return (
                window.location.protocol +
                '//' +
                window.location.hostname +
                '/nfmgenieapi'
            );
        }
    }
    public async lastPurchasedRequest<T = any>(f: string, data = {}) {
        // const url = `${environment.SECOND_URL}${f}`;
        let url = `${this.getHostname()}${f}`;
        let vendorId: number = 0;
        const vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            vendorId = parseInt(vendorIdString);
        }

       
        if (f == "refillOrder/getAllRefillOrder") {
            url = `${this.getHostname()}${f}`
        }
        
        if (f == "modulemanagement/getAllmodulemanagement") {
            url = `${this.getHostname()}${f}`
        }
        if (f == 'allOperators') {
            url = `${this.getHostname()}stalloperator/getAllStallOperator`
        }
        // const headers: HttpHeaders = await this.headerService.getHeader(true);

        return this._httpClient
            .get(url, { observe: 'response' })
            .toPromise()
            .then((res: any) => {
                console.log('events', res);
                if (res.status == 200) {
                    return res.body;
                }
            })
            .catch((err) => console.error(err));
    }
    public async fetchRequest<T = any>(f: string, data = {}) {
        // const url = `${environment.SECOND_URL}${f}`;
        let url = `${this.getHostname()}${f}`;
        let vendorId: number = 0;
        const vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            vendorId = parseInt(vendorIdString);
        }

        if (vendorId != null && vendorId != 0 && vendorId != undefined) {
            url = `${this.getHostname()}${f}?vendorId=${vendorId}`;
        }
        if (f == "refillOrder/getAllRefillOrder") {
            url = `${this.getHostname()}${f}`
        }
        
        if (f == "modulemanagement/getAllmodulemanagement") {
            url = `${this.getHostname()}${f}`
        }
        if (f == 'allOperators') {
            url = `${this.getHostname()}stalloperator/getAllStallOperator`
        }
        if (f == "report/getstockavailbyitem" && data['itemId']) {
            url = `${this.getHostname()}${f}?itemId=${data['itemId']}`;
        }
        if (f == "report/getavailbystall" && data['stallId']) {
            url = `${this.getHostname()}${f}?stallId=${data['stallId']}`;
        }
        // const headers: HttpHeaders = await this.headerService.getHeader(true);

        return this._httpClient
            .get(url, { observe: 'response' })
            .toPromise()
            .then((res: any) => {
                console.log('events', res);
                if (res.status == 200) {
                    return res.body;
                }
            })
            .catch((err) => console.error(err));
    }
    public async refillSlotRequest<T = any>(f: string,refillOrdId:number) {
        // const url = `${environment.SECOND_URL}${f}`;
        let url = `${this.getHostname()}${f}`;
        let vendorId: number = 0;
        const vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            vendorId = parseInt(vendorIdString);
        }

        if (vendorId != null && vendorId != 0 && vendorId != undefined) {
            url = `${this.getHostname()}${f}?vendorId=${vendorId}`;
        }
      
            url = `${this.getHostname()}${f}?refillOrdId=${refillOrdId}`
        
        
        // if (f == "modulemanagement/getAllmodulemanagement") {
        //     url = `${this.getHostname()}${f}`
        // }
        // if (f == 'allOperators') {
        //     url = `${this.getHostname()}stalloperator/getAllStallOperator`
        // }
        // const headers: HttpHeaders = await this.headerService.getHeader(true);

        return this._httpClient
            .get(url, { observe: 'response' })
            .toPromise()
            .then((res: any) => {
                console.log('events', res);
                if (res.status == 200) {
                    return res.body;
                }
            })
            .catch((err) => console.error(err));
    }
    public postOrder(orders: Orders): Observable<any> {
        const urlSubmit = this.getHostname() + 'rest/order/CreateOrder';
        let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
        let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

        // console.log('urlSubmit OrderCollection:', urlSubmit);
        // tslint:disable-next-line: max-line-length
        return this._httpClient.post<Orders>(this.getHostname() + 'rest/order/CreateOrder', orders, { headers: reqHeader }).pipe(map(data => data),
            catchError(err => this.handleError(err))
        );
    }
    //get VendingMachines
    //  public async getVendingMachines<T = any>(f: string, data = {}) {


    //     const url = `${this.getHostname()}${f}`;
    //     return this._httpClient
    //         .post(url, data, { observe: 'response' })
    //         .toPromise()
    //         .then((res: any) => {
    //             console.log(res);
    //             if (res.status == 200) {
    //                 console.log(200);
    //                 return res.data;
    //             }
    //         })
    //         .catch((err) => console.error(err));
    // }
    public async getVendingMachines<T = any>(f: string): Promise<T> {
        const url = `${this.getHostname()}${f}`;

        return this._httpClient
            .post(url, null, { observe: 'response' })
            .toPromise()
            .then((res: any) => {
                console.log(res);
                if (res.status == 200) {
                    console.log(200);
                    return res.body;
                }
            })
            .catch((err) => console.error(err));
    }

    public async getVMSProducts<T = any>(f: string, data = {}): Promise<T> {
        const url = `${this.apiUrl}${f}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'authorization': '7f61f4515ac95125628106bd8ccd2a46d851c63d6b5ac64224e4cc10aebc1902'
        });


        const res: any = await this._httpClient.post(url, data, { headers }).toPromise();
        console.log('Vending Machines Response:', res);
        return res;


    }

    //  public async getVendingMachines<T = any>(f: string, data = {}) {
    //     const url = `${this.apiUrl}${f}`;
    //     return this._httpClient.post(url, data,{observe: 'response'})
    //     .toPromise()
    //     .then((res: any) => {
    //         console.log(res);
    //         if (res.status == 200) {
    //             console.log(200);
    //             return res.body;
    //         }
    //     })
    //     .catch((err) => console.error(err));

    //   }
    public async fetchRequestPost<T = any>(f: string, data = {}) {
        // const url = `${environment.SECOND_URL}${f}`;

        const url = `${this.getHostname()}${f}`;
        return this._httpClient
            .post(url, data, { observe: 'response' })
            .toPromise()
            .then((res: any) => {
                console.log(res);
                if (res.status == 200) {
                    console.log(200);
                    return res.body;
                }
            })
            .catch((err) => console.error(err));
    }
    public async fetchRequesttransactionPost<T = any>(f: string, data = {}) {
        // const url = `${environment.SECOND_URL}${f}`;

        const url = `${this.getHostname()}${f}`;
        return this._httpClient
            .post(url, data, { observe: 'response' })
            .toPromise()
            .then((res: any) => {
                console.log(res);
                if (res.status == 200 || res.status == 202) {
                    console.log(200);
                    return res.body;
                }
            })
            .catch((err) => console.error(err));
    }
    public async postResponseAsText<T = any>(f: string, data = {}) {
        // const url = `${environment.SECOND_URL}${f}`;

        const url = `${this.getHostname()}${f}`;
        return this._httpClient
            .post(url, data, { observe: 'response', responseType: 'text' })
            .toPromise()
            .then((res: any) => {
                console.log(res);
                if (res.status == 200) {
                    console.log(200);
                    return res.body;
                }
            })
            .catch((err) => console.error(err));
    }
    public async postImageData<T = any>(f: string, data: any) {
        // const url = `${environment.SECOND_URL}${f}`;

        const url = `${this.getHostname()}${f}`;

        return this._httpClient
            .post(url, data, { observe: 'response' })
            .toPromise()
            .then((res: any) => {
                console.log(res);
                if (res.status == 200) {
                    console.log(200);
                    return res.body;
                }
            })
            .catch((err) => console.error(err));
    }
    public AddUpdateProductVMS(formData: FormData): Observable<any> {
        const url = `${this.getHostname()}vmsapis/addOrUpdateProds`;

        return this._httpClient.post(url, formData, { headers: vmsApiHeaders }).pipe(map((data) => data),
            catchError((err) => this.handleError(err)))
    }
    public GetVmsProducts(): Observable<any> {
        const url = `${this.getHostname()}vmsapis/getProductInfo`;
        let headers = new HttpHeaders({
            'authorization': "7f61f4515ac95125628106bd8ccd2a46d851c63d6b5ac64224e4cc10aebc1902",


        })
        return this._httpClient.post(url, null, { headers: headers }).pipe(map((data) => data),
            catchError((err) => this.handleError(err)))
    }
    public getImageBlob(path): Observable<Blob> {

        return this._httpClient.get(path, { responseType: 'blob' });
    }
    public async fetchRequestdel(f: string, data = {}): Promise<string> {
        // const url= `${environment.API_URL}${f}`;
        const url = `${this.getHostname()}/${f}`;
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
            body: data,
        };

        return this._httpClient
            .delete(url, options)
            .toPromise()
            .then(
                (res: string) => {
                    console.log(res);
                    console.log('result to delete :', res);
                    return res;
                },
                (error: any) => {
                    // if (res.status== 200) {
                    //   return res.body;

                    // }
                    console.log('error :', error);
                    return error;
                }
            );
        // .catch((err) => console.error(err));
    }
    // login and other http calls

    public loginValidate(userdata: UserProfile): Observable<any> {
        let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: jwtToken,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers':
                'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT',
        });

        // tslint:disable-next-line: max-line-length
        return this._httpClient
            .post<UserProfile>(
                this.getHostname() + '/rest/profile/validateUser',
                userdata,
                { headers: reqHeader }
            )
            .pipe(
                map((data) => data),
                catchError((err) => this.handleError(err))
            );
    }
    private handleError(error: HttpErrorResponse): any {
        console.log(error);
        if (error.error instanceof ErrorEvent) {
            console.error('An error occurred:', error.error.message);
        } else {
            if (error.status === 401) {
                // localStorage.clear();
                // this.router.navigate(['/']);
            }
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`
            );
        }
        return throwError('Something bad happened; please try again later.');
    }
    public registerUser(userdata: UserProfile): Observable<any> {
        let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: jwtToken,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers':
                'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT',
        });

        // tslint:disable-next-line: max-line-length
        return this._httpClient
            .post<UserProfile>(
                this.getHostname() +
                contextRoot +
                '/rest/profile/CreateProfile',
                userdata,
                { headers: reqHeader }
            )
            .pipe(
                map((data) => data),
                catchError((err) => this.handleError(err))
            );
    }
    public getOTP(userdata: any): Observable<any> {
        let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: jwtToken,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers':
                'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT',
        });

        // tslint:disable-next-line: max-line-length
        return this._httpClient
            .post<any>(
                this.getHostname() + '/smsIntegration/getOTP',
                userdata,
                { headers: reqHeader }
            )
            .pipe(
                map((data) => data),
                catchError((err) => this.handleError(err))
            );
    }
    public resendOTP(userdata: any): Observable<any> {
        let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: jwtToken,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers':
                'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT',
        });

        // tslint:disable-next-line: max-line-length
        return this._httpClient
            .post<any>(
                this.getHostname() + '/smsIntegration/resendOTP',
                userdata,
                { headers: reqHeader }
            )
            .pipe(
                map((data) => data),
                catchError((err) => this.handleError(err))
            );
    }

    public verifyOTP(userdata: any): Observable<any> {
        let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: jwtToken,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers':
                'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT',
        });

        // tslint:disable-next-line: max-line-length
        return this._httpClient
            .post<any>(
                this.getHostname() + '/smsIntegration/verifyOTP',
                userdata,
                { headers: reqHeader }
            )
            .pipe(
                map((data) => data),
                catchError((err) => this.handleError(err))
            );
    }
    public getOrderCollection(orderObj): Observable<any> {
        const urlSubmit = this.getHostname() + '/rest/order/OrderCollection';
        // console.log('urlSubmit Orders:', urlSubmit);
        // tslint:disable-next-line: max-line-length
        return this._httpClient
            .post<category>(
                this.getHostname() + '/rest/order/OrderCollection',
                orderObj,
                { headers: reqHeader }
            )
            .pipe(
                map((data) => data),
                catchError((err) => this.handleError(err))
            );
    }
    public getGroupSaleOrders(orderObj): Observable<any> {
        const urlSubmit =
            this.getHostname() + '/rest/orderitem/GetOrderItemGroup';
        // console.log('urlSubmit Orders:', urlSubmit);
        // tslint:disable-next-line: max-line-length
        return this._httpClient
            .post(
                this.getHostname() + 'rest/orderitem/GetOrderItemGroup',
                orderObj,
                { headers: reqHeader }
            )
            .pipe(
                map((data) => data),
                catchError((err) => this.handleError(err))
            );
    }
    public initiateRefundForItem(payload): Observable<any> {
        const url = `${this.getHostname()}/rest/orderitem/RefundItemAndUpdateStock`;

        return this._httpClient.post(url, payload, { headers: reqHeader }).pipe(map((data) => data),
            catchError((err) => this.handleError(err)))
    }
    public getVmsSalesReport(payload): Observable<any> {
        const url = `${this.getHostname()}/vmsapis/getSalesForMachine`;

        return this._httpClient.post(url, payload, { headers: reqHeader }).pipe(map((data) => data),
            catchError((err) => this.handleError(err)))
    }
    public getVmsSaleByItemGroup(payload): Observable<any> {
        const url = `${this.getHostname()}/vmsapis/groupSalesByItem`;

        return this._httpClient.post(url, payload, { headers: reqHeader }).pipe(map((data) => data),
            catchError((err) => this.handleError(err)))
    }
    HostTextToSpeech() {
        let hostEndPoint = 'google';
        let hostname = window.location.hostname;
        return hostEndPoint;
    }
    public TextToSpeech(data: any) {
        const urlSubmit = `google/v1beta1/text:synthesize?key=${environment.googleTextToSpeechAPIKey}`;
        return this._httpClient
            .post(urlSubmit, data, { headers: reqSpeechHeaders })
            .toPromise()
            .then((res: any) => {
                console.log(res);

                return res;
            })
            .catch((err) => console.error(err));
    }

}
