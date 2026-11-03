import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.scss'],
})
export class LoginComponentComponent implements OnInit {
  public loginForm: any;
  public isLoginValid: boolean = false;
  public isSubmitted: boolean = false;
  private modalReference: any;
  constructor(private modalService: NgbModal) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
    });
  }
  OnLoginPress(modal: any) {
    this.modalReference = this.modalService.open(modal);
  }
  OnClose() {
    this.modalReference.close();
    this.isLoginValid = false;
    this.isSubmitted = false;
  }
  OnSubmit() {
    this.isSubmitted = true;

    if (this.loginForm.valid) {
      let mobileno = this.loginForm.controls['username'].value;
      this.isLoginValid = true;
      localStorage.setItem('userId', mobileno);
    } else {
      this.isLoginValid = false;
    }
  }
}
