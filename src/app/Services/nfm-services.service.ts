import { Injectable, Inject, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, ObservableLike } from 'rxjs';
import { map, startWith, delay } from 'rxjs/operators';
import { catchError } from 'rxjs/internal/operators';

import { Router } from '@angular/router';
//token = "Bearer " + "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI5MTk2MTg1Nzc3NTciLCJpc3MiOiJmcmVzaG1hcnQuaW8iLCJpYXQiOjE2MzkwMDMwMzYsImV4cCI6MTYzOTA4OTQzNn0.shDK_P3Fypldig_f_iTt-0SAbhzomgYGKQlTRQB9HqPxiuuJ1i9FC0BAMDBf_7QsuIxH0XBz6FfBjpHwDvQYuQ";
//token = 'Bearer ' + jwtToken;
const contextRoot = '/nfmapi/';
const endpoint = '/nfmapi/';
// const endpoint = 'https://www.navifreshmart.com';
//const reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'No-Auth': 'True', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
//let reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'No-Auth': 'True', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT' });
import { throwError, concat, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NaviFreshMartService {
  constructor(private router: Router, private http: HttpClient) {}

  getHostname(): string {
    // console.log(this.window.location.hostname, this.window.location.protocol);
    const loc = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;
    /**
     * commented on 31-12-2020
     * to solve cors issue in server
     */
    if (host.includes('localhost')) {
      return endpoint;
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
        // localStorage.removeItem('actcartItems');
        // localStorage.removeItem('totalCartItems');
        // localStorage.removeItem('payload');
        // localStorage.removeItem('user');
        // localStorage.removeItem('isProxyUser');
        // localStorage.clear();
        // this.router.navigate(['/'])
      }
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }

  public loginValidate(userdata: any): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    let jwtToken = 'Bearer ' + JSON.parse(token || '{}');
    let reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: jwtToken,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':
        'Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Access-Control-Allow-Methods,Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS,PUT',
    });

    // tslint:disable-next-line: max-line-length
    return this.http
      .post<any>(
        this.getHostname() + contextRoot + '/rest/profile/validateUser',
        userdata,
        { headers: reqHeader }
      )
      .pipe(
        map((data) => data),
        catchError((err) => this.handleError(err))
      );
  }
}
