/* tslint:disable */
import { Injectable, Inject, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, ObservableLike } from 'rxjs';
import { map, startWith, delay } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/internal/operators';
import { productitems } from '../classes/productitems';
import { productImages } from '../classes/productImages';
import { category } from '../classes/category';
import { WINDOW } from './window.providers';
import { Router } from '@angular/router';

//const endpoint = '/api/';
const endpoint = '/nfmgenieapi';
let token = '';
let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
//token = "Bearer " + "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI5MTk2MTg1Nzc3NTciLCJpc3MiOiJmcmVzaG1hcnQuaW8iLCJpYXQiOjE2MzkwMDMwMzYsImV4cCI6MTYzOTA4OTQzNn0.shDK_P3Fypldig_f_iTt-0SAbhzomgYGKQlTRQB9HqPxiuuJ1i9FC0BAMDBf_7QsuIxH0XBz6FfBjpHwDvQYuQ";
//token = 'Bearer ' + jwtToken;
const contextRoot = '/nfmgenieapi';
// const endpoint = 'https://www.navifreshmart.com';
//const reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'No-Auth': 'True', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
//let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'No-Auth': 'True', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
import { throwError, concat, of } from 'rxjs';
import { cart } from '../classes/cart';
import { Orders } from '../classes/orders';
import { userprofile } from '../classes/userprofile';
import { address } from '../classes/address';
import { PaytmConstants } from '../classes/PaytmConstansts';
import { Shops } from '../classes/shops';
import { razorpayorder } from '../classes/razorpayorder';
import { signatureform } from '../classes/signatureform';
import { paymentdetails } from '../classes/paymentdetails';
import { deliveryCharges } from '../classes/deliverycharges';
import { Stall } from './../classes/stall';
import { Capacitor } from '@capacitor/core';
import { prepaymentcheck } from './../classes/prepaymentcheck';
@Injectable({
  providedIn: 'root',
})
export class NaviFreshMartService {
  hostName: string;
  private vendorConfigPath = "assets/vendor.json";
  private vendorFile: any;
  constructor(@Inject(WINDOW) private window: Window, private router: Router, private http: HttpClient, private toastrService: ToastrService) { }

  loadConfig() {
    return this.http.get(this.vendorConfigPath)
      .toPromise()
      .then((vendorConfig: any) => {
        console.log("venconfig", vendorConfig);
        this.vendorFile = vendorConfig;
      });
  }

  getConfig() {
    return this.vendorFile;
  }
  public getProductItems(paramProductitems: productitems): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/product/ProductsByShop';
    // console.log('urlSubmit productitems:', urlSubmit);

    // tslint:disable-next-line: max-line-length
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
    return this.http.post<productitems>(urlSubmit, paramProductitems, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public getMachines(vendorId: number): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + 'stall/getStallsWithGenie?vendorId=' + vendorId;
    let jwtToken = 'Bearer' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
    return this.http.get(urlSubmit, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public async fetchRequest<T = any>(f: string, vendorId: number) {
    // const url = `${environment.SECOND_URL}${f}`;
    let url;

    if (vendorId != 0 && vendorId != undefined) {
      url = `${this.getHostname()}${contextRoot}${f}?vendorId=${vendorId}`;
    }

    // const headers: HttpHeaders = await this.headerService.getHeader(true);

    return this.http
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
  public async fetchRequestPost<T = any>(endpoint: string, data = {}) {
    // const url = `${environment.SECOND_URL}${f}`;

    const url = `${this.getHostname()}${contextRoot}${endpoint}`;
    return this.http
      .post(url, data, { observe: 'response' })
      .toPromise()
      .then((res: any) => {
        console.log(res);
        if (res.status == 200) {
          console.log(200);
          return res.body;
        }
      })
      .catch((err) => this.handleError(err));
  }
  public getOrderById(orderPayload: Orders): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + 'rest/order/OrderById';

    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
    return this.http.post(urlSubmit, orderPayload, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public getFoodMenyByStallId(payload): Observable<any> {
    const urlSubmit =
      this.getHostname() + contextRoot + "/rest/productmappings/getProductsByGenie";
    let jwtToken = "Bearer " + JSON.parse(localStorage.getItem("jwtToken"));
    let reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
    });

    // console.log('urlSubmit Orders:', urlSubmit);
    // tslint:disable-next-line: max-line-length
    return this.http
      .post<productitems>(
        urlSubmit,
        payload,
        { headers: reqHeader }
      )
      .pipe(
        map((data) => data),
        catchError((err) => this.handleError(err))
      );
  }
  public getUsersByOperator(): Observable<any> {
    const urlSubmit =
      this.getHostname() + contextRoot + "/stalloperator/getAllStallOperator";

    let reqHeader = new HttpHeaders({
      "Content-Type": "application/json",
    });

    // console.log('urlSubmit Orders:', urlSubmit);
    // tslint:disable-next-line: max-line-length
    return this.http
      .get(
        urlSubmit,
        { headers: reqHeader }
      )
      .pipe(
        map((data) => data),
        catchError((err) => this.handleError(err))
      );
  }
  public getFoodMenu(): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + 'foodmenu/getAllFoodMenu';
    let jwtToken = 'Bearer' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
    return this.http.get(urlSubmit, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public getUsersList(request): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + 'user/getUsersList';
    // console.log('urlSubmit productitems:', urlSubmit);


    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json' });
    // tslint:disable-next-line: max-line-length
    return this.http.post<productitems>(urlSubmit, request, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public getProductItemsByShopAndVendor(paramProductitems: productitems): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/productmappings/ProductsByShopAndVendor';
    // console.log('urlSubmit productitems:', urlSubmit);

    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
    // tslint:disable-next-line: max-line-length
    return this.http.post<productitems>(urlSubmit, paramProductitems, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public getProductsByCounterId(stallData: any): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/genieinventory/getProductsByGenie';
    // console.log('urlSubmit productitems:', urlSubmit);

    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
    // tslint:disable-next-line: max-line-length
    return this.http.post<productitems>(urlSubmit, stallData, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public getProductItemsByShopVendorCatAndSubCat(paramProductitems: productitems): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/productmappings/ProductsBySubCatInShop';
    // console.log('urlSubmit productitems:', urlSubmit);
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<productitems>(urlSubmit, paramProductitems, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }

  public getCategoryByShopId(categoryObj: category): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/category/CategoryByShop';
    // console.log('urlSubmit categories:', urlSubmit);
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<category>(this.getHostname() + contextRoot + '/rest/category/CategoryByShop', categoryObj, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public postCartItem(cartObj: cart): Observable<any> {
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<cart>(this.getHostname() + contextRoot + '/rest/cart/CreateCart', cartObj, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public deleteCartItem(cartObj: cart): Observable<any> {
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<cart>(this.getHostname() + contextRoot + '/rest/cart/DeleteCart', cartObj, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public getCarts(cartItem: cart): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/cart/CartCollection';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // console.log('urlSubmit CartCollection:', urlSubmit);
    // tslint:disable-next-line: max-line-length
    return this.http.post<category>(this.getHostname() + contextRoot + '/rest/cart/CartCollection', cartItem, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public postCartItems(cartObj: cart): Observable<any> {
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<cart>(this.getHostname() + contextRoot + '/rest/cart/CreateCartItems', cartObj, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public postOrder(orders: Orders): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/order/CreateOrder';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // console.log('urlSubmit OrderCollection:', urlSubmit);
    // tslint:disable-next-line: max-line-length
    return this.http.post<Orders>(this.getHostname() + contextRoot + '/rest/order/CreateOrder', orders, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }

  public updateOrderStatus(orders: Orders): Observable<any> {
    const urlSubmit = this.getHostname() + + contextRoot + '/rest/order/updateOrderStatus';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // console.log('urlSubmit OrderCollection:', urlSubmit);
    // tslint:disable-next-line: max-line-length
    return this.http.post<Orders>(this.getHostname() + contextRoot + '/rest/order/updateOrderStatus', orders, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }

  public loginValidate(userdata: userprofile): Observable<any> {
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<userprofile>(this.getHostname() + contextRoot + '/rest/profile/validateUser', userdata, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }

  public getUserProfile(userdata: userprofile): Observable<any> {
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<userprofile>(this.getHostname() + contextRoot + '/rest/profile/getProfile', userdata, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }

  public getOTP(userdata: any): Observable<any> {
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<any>(this.getHostname() + contextRoot + '/smsIntegration/getOTP', userdata, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }

  public resendOTP(userdata: any): Observable<any> {
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<any>(this.getHostname() + contextRoot + '/smsIntegration/resendOTP', userdata, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }

  public verifyOTP(userdata: any): Observable<any> {
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<any>(this.getHostname() + contextRoot + '/smsIntegration/verifyOTP', userdata, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public registerUser(userdata: userprofile): Observable<any> {
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<userprofile>(this.getHostname() + contextRoot + '/rest/profile/CreateProfile', userdata, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public getAddress(addressitem: address): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/address/AddressCollection';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // console.log('urlSubmit CartCollection:', urlSubmit);
    // tslint:disable-next-line: max-line-length
    return this.http.post<category>(this.getHostname() + contextRoot + '/rest/address/AddressCollection', addressitem, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public postAddress(addressitem: address): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/address/CreateAddress';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // console.log('urlSubmit CartCollection:', urlSubmit);
    // tslint:disable-next-line: max-line-length
    return this.http.post<category>(this.getHostname() + contextRoot + '/rest/address/CreateAddress', addressitem, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public deleteAddress(addressitem: address): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/address/DeleteAddress';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // console.log('urlSubmit CartCollection:', urlSubmit);
    // tslint:disable-next-line: max-line-length
    return this.http.post<category>(this.getHostname() + contextRoot + '/rest/address/DeleteAddress', addressitem, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  getHostname(): string {
    // console.log(this.window.location.hostname, this.window.location.protocol);
    const loc = this.window.location.protocol;
    const host = this.window.location.hostname;
    const port = this.window.location.port
    // return 'https://navifoodmart.com';
    if (Capacitor.getPlatform() != "web") {
      return "https://myfoodgenie.com";
    }
    /**
     * commented on 31-12-2020
     * to solve cors issue in server
     */
    if (host.includes('localhost')) {
       return endpoint;
      // return "https://myfoodgenie.com";
    } else {
      return loc + '//' + host;
    }
    // console.log(loc+"//"+host);
    // return  loc + '//' + host+":8080" ;
    // return "http://192.168.0.126:8080";
  }

  private handleError(error: HttpErrorResponse): any {
    console.log(error);

    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      if (error.status === 401) {
        localStorage.removeItem('actcartItems');
        localStorage.removeItem('totalCartItems');
        localStorage.removeItem('payload');
        localStorage.removeItem('user');
        localStorage.removeItem('isProxyUser');
        localStorage.clear();
        this.router.navigate(['/'])
      }
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }

  public getOrders(orderObj: Orders): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/order/OrdersByAccountId';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // console.log('urlSubmit Orders:', urlSubmit);
    // tslint:disable-next-line: max-line-length
    return this.http.post<category>(this.getHostname() + contextRoot + '/rest/order/OrdersByAccountId', orderObj, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public QuantityValidationInCart(cart: cart): Observable<any> {
    const url = this.getHostname() + contextRoot + '/rest/cart/validateOthersCount';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
    return this.http.post(url, cart, { headers: reqHeader }).pipe(map((data) => data),
      catchError((err) => this.handleError(err)))
  }
  public GetVmsMachineSlots(payload: any): Observable<any> {
    const url = `/vmsapi/apiIntegration/getMachineSlotDetails`;
    let headers = new HttpHeaders({
      'authorization': "7f61f4515ac95125628106bd8ccd2a46d851c63d6b5ac64224e4cc10aebc1902",
    })
    return this.http.post(url, payload, { headers: headers }).pipe(map((data) => data),
      catchError((err) => this.handleError(err)))
  }
  public getCheckSum(checkObj: PaytmConstants): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/checksum/Generate';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // console.log('urlSubmit Orders:', urlSubmit);
    // tslint:disable-next-line: max-line-length
    return this.http.post<PaytmConstants>(urlSubmit, checkObj, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public getShopDetails(shopObj: Shops): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/shop/ShopCollection';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    return this.http.post<Shops>(urlSubmit, shopObj, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public createRazorPayOrder(razorObj: razorpayorder): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/Razorpay/CreateOrder';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    return this.http.post<razorpayorder>(urlSubmit, razorObj, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public getSignature(signObj: signatureform): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/Razorpay/ValidateSignature';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    return this.http.post<signatureform>(urlSubmit, signObj, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public savePaymentDetails(payObj: paymentdetails): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/paymentdetails/CreatePayment';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    return this.http.post<paymentdetails>(urlSubmit, payObj, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }

  public downloadInvoice(order: Orders): Observable<any> {
    // tslint:disable-next-line: max-line-length
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    const reqHeader1 = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'responseType': 'blob', 'Accept': 'application/pdf', 'No-Auth': 'True', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
    return this.http.post<any>(this.getHostname() + contextRoot + '/invoice/downloadInvoice', order, { headers: reqHeader1, responseType: 'blob' as 'json' }).pipe(map(data => {
      var file = new Blob([data], { type: 'application/pdf' })
      var fileURL = URL.createObjectURL(file);

      var a = document.createElement('a');
      a.href = fileURL;
      a.target = '_blank';
      a.download = "INV_" + order.orderId + ".pdf";
      document.body.appendChild(a);
      a.click();
    }),
      catchError(err => this.handleError(err))
    );
  }
  public getProductInfo(paramProductitems: productitems): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/product/GetProductInfo';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<productitems>(urlSubmit, paramProductitems, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }

  public getProductImages(paramProductImages: productImages): Observable<any> {
    const urlSubmit = this.getHostname() + contextRoot + '/rest/productimage/GetProductImages';
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<productImages>(urlSubmit, paramProductImages, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }

  public getDeliveryCharges(deliveryCharges: deliveryCharges): Observable<any> {
    let jwtToken = 'Bearer ' + JSON.parse(localStorage.getItem('jwtToken'));
    let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': jwtToken, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });

    // tslint:disable-next-line: max-line-length
    return this.http.post<deliveryCharges>(this.getHostname() + contextRoot + '/deliverycharges/delviryChargeByPin', deliveryCharges, { headers: reqHeader }).pipe(map(data => data),
      catchError(err => this.handleError(err))
    );
  }
  public checkPrePaymentValidation(products: prepaymentcheck): Observable<any> {
    const url = `${this.getHostname() + contextRoot}genieprodinventory/preStockValidation`;
    return this.http.post<prepaymentcheck>(url, products).pipe(map(data => data),
      catchError(err => this.handleError(err)));
  }
  public getRecentOrderItems(payload: any): Observable<any> {
    const url = `${this.getHostname() + contextRoot}rest/orderitem/GetOrderItemGroup`;
    return this.http.post<prepaymentcheck>(url, payload).pipe(map(data => data),
      catchError(err => this.handleError(err)));
  }
  public vmsDispense(payload: any): Observable<any> {
    const url = `${this.getHostname() + contextRoot}vmsapis/dispenseTrigger`;
    return this.http.post(url, payload).pipe(map(data => data),
      catchError((err) => {
        this.handleError(err);
        throw err;
      })
    );
  }
  public getMachineSales(payload: any): Observable<any> {
    const url = `${this.getHostname() + contextRoot}vmsapis/getSalesForMachine`;
    return this.http.post(url, payload).pipe(map(data => data),
      catchError(err => this.handleError(err)));
  }
  public getVmsMachines(): Observable<any> {
    const url = `${this.getHostname() + contextRoot}vmsapis/getMachines`;
    return this.http.post(url, {}).pipe(map(data => data),
      catchError(err => this.handleError(err)));
  }
  public getGenieManagement(): Observable<any> {
    const url = `${this.getHostname() + contextRoot}geniemanagement/getAllGenieManagement`;
    return this.http.get(url).pipe(map(data => data),
      catchError(err => this.handleError(err)));
  }
  public async postResponseAsText<T = any>(endpoint: string, data = {}) {
    // const url = ${environment.SECOND_URL}${f};

    const url = `${this.getHostname() + contextRoot}${endpoint}`;
    return this.http
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
  public getSelectedOrder(payload: any): Observable<any> {
    const url = `${this.getHostname() + contextRoot}rest/order/OrderById`;
    return this.http.get(url, payload).pipe(map(data => data),
      catchError(err => this.handleError(err)));
  }
}
