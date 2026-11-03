import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { NfmSigninComponent } from './../nfm-signin/nfm-signin.component';
@Component({
    selector: 'app-nfm-sigin-page',
    templateUrl: './nfm-sigin-page.component.html',
    styleUrls: ['./nfm-sigin-page.component.scss'],
})
export class NfmSiginPageComponent implements OnInit {
    modalReference: any;
    constructor(private modalService: NgbModal) {}

    ngOnInit(): void {}
    OnLoginPress() {
        this.modalReference = this.modalService.open(NfmSiginPageComponent);
    }
}
