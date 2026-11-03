import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
// import { OtpComponent } from '../../pages/otp/otp.component';
// import { NaviFreshMartService } from '../../shared/services/navi-fresh-mart.service';
// import { SuccessModalComponent } from '../../shared/components/modal/success-modal/success-modal.component';
// import { cart } from '../../../app/shared/classes/cart';
// import { userprofile } from '../../../app/shared/classes/userprofile';
import { timer } from 'rxjs';
import { UserProfile } from './../userprofiel';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { Router } from '@angular/router';
// import { TermsAndConditionsComponent } from '../terms-conditons/terms-conditions.component';
@Component({
    selector: 'nfm-signin',
    templateUrl: './nfm-signin.component.html',
    styleUrls: ['./nfm-signin.component.scss'],
})
export class NfmSigninComponent implements OnInit {
    @Input() actionEvent: string;
    submitted: boolean = false;
    otpSent: boolean = false;
    isRegistered: boolean = false;
    isMobile: boolean = false;
    isMobileError: boolean = false;
    isMobValid: boolean = false;
    timeLeft: number = 60;
    interval;
    subscribeTimer: any;

    /** for new registration */
    isRegisterPressed: boolean = false;
    isRegNameValid: boolean = false;
    //isRegPassword: boolean = false;
    isRegEmailOrMobile: boolean = false;
    isRegOTP: boolean = false;

    /** for login validation */
    isLoginPassword: boolean = false;
    @ViewChild('ngOtpInput') ngOtpInputRef: any;
    otpconfig: any = {
        length: '4',
        width: '39px',
        height: '39px',
        border: '1px solid  #c5c5c5',
    };

    isOtpVerified: boolean = true;
    user: any = {
        mobileNumber: undefined,
        password: undefined,
        name: undefined,
        email: undefined,
        otp: undefined,
        password1: undefined,
        mobileemail: undefined,
        accountId: undefined,
        role: undefined,
    };
    //otp: number;
    profileData: any;
    showResendOTP = false;
    showRegisterBtn = false;
    showVerifySuccess = false;
    isProxyUser: Boolean = false;
    checked;
    constructor(
        private modalService: NgbModal,
        public activeModal: NgbActiveModal,
        public naviService: ProjectService,
        private router: Router
    ) {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.isProxyUser = JSON.parse(localStorage.getItem('isProxyUser'));
        if (this.isProxyUser) {
            this.otpSent = true;
            this.checked = true;
        }
    }
    verifyMobileNumber(form: any) {
        const userData: UserProfile = {};
        this.isMobValid = true;
        // userData.accountId = "";
        // userData.email = this.user.email;
        // userData.mobile = this.user.mobile;
        // userData.password = this.user.password;
        // userData.profileid = 0;
        userData.userName = this.user.mobileNumber;
        userData.password = '';
        if (
            !this.validateEmail(this.user.mobileNumber) &&
            !this.validatePhone(this.user.mobileNumber)
        ) {
            console.log('not a valid mail or phone');
            this.isMobileError = true;
        } else {
            console.log('valid');
            this.isMobileError = false;
        }
        if (this.isMobileError) {
            return false;
        }
        if (this.validateEmail(this.user.mobileNumber)) {
            this.isMobile = false;
        } else if (this.validatePhone(this.user.mobileNumber)) {
            this.isMobileError = false;
            this.isMobile = true;
        }
        this.naviService.loginValidate(userData).subscribe((data) => {
            console.log(data, typeof data.password);

            this.submitted = true;

            if (data?.validUser) {
                this.isRegistered = true;
                this.user.accountId = data?.accountId;
                this.user.name = data?.userName;
                this.user.email = data?.email;
                this.user.role = data?.role;
                if (!this.isProxyUser) {
                    this.getOTP();
                    this.startTimer();
                } else {
                    this.otpSent = true;
                }
                console.log('Valid User.. Signing in...');
            } else if (!data?.validUser) {
                this.isRegistered = false;
                console.log('Not a Valid User');
            }
        });

        // this.isRegistered = false;
        // if (form.invalid) {
        //   return;
        // }
        /**
         * check mobile or email
         */

        // this.closeModal();
        // localStorage.setItem(
        //   "user",
        //   JSON.stringify({ mobileNumber: this.user.mobileNumber })
        // );

        // const otpModal =  this.modalService.open(OtpComponent, {ariaLabelledBy: 'modal-basic-title'});
        // let successModal = this.modalService.open(SuccessModalComponent, {
        //   ariaLabelledBy: 'modal-basic-title',
        // });
        // const that = this;
        // setTimeout(function () {
        //   successModal.close();

        // }, 1000);
        /*
    otpModal.componentInstance.mobileNumber = this.user.mobileNumber;
    otpModal.componentInstance.actionEvent = this.actionEvent;
    */

        // let cartItem: cart = {};
        // cartItem = JSON.parse(localStorage.getItem("payload"));
        // console.log("cart item:", cartItem);
        // if (cartItem) {
        //   this.naviService.postCartItem(cartItem).subscribe((data) => {
        //     cartItem.cartId = data.cartId;
        //     localStorage.setItem("payload", JSON.stringify(cartItem));
        //     window.location.reload();
        //   });
        // } else {
        //   window.location.reload();
        // }

        // if(obj.actionEvent=='cart'){
        //   obj.router.navigate(['/shop/cart']);
        // }else{
        //   obj.router.navigate(['/pages/useraccount']);
        // }
        // this.submitted = false;
    }
    closeModal() {
        let isProxyUser = JSON.parse(localStorage.getItem('isProxyUser'));
        if (isProxyUser) {
            localStorage.removeItem('isProxyUser');
        }
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.router.onSameUrlNavigation = 'reload';
        this.activeModal.close('close');
        this.router.navigate(['dashboards/project/user'], {
            skipLocationChange: true,
        });
    }

    ngOnInit(): void {}
    registerUser() {
        this.isRegisterPressed = true;

        const userData: UserProfile = {};
        userData.accountId = '0';
        userData.email = this.isMobile
            ? this.user.mobileemail
            : this.user.mobileemail; //this.user.email;
        userData.mobile = this.isMobile
            ? this.user.mobileNumber
            : this.user.mobileemail;
        userData.userName = this.user.name;
        userData.password = 'dummy';
        userData.mobileImei = '';
        userData.role = 'user';
        if (!this.user.name || this.user.name.length === 0) {
            this.isRegNameValid = true;
            return false;
        } else {
            this.isRegNameValid = false;
        }
        /*if(!this.user.password1 || this.user.password1.length === 0){
      this.isRegPassword = true;
      return false;
    }else{
      this.isRegPassword = false;
    }*/
        /**
         * if isMobile true it is mail  in registration form
         */
        if (this.isMobile) {
            //validate email
            if (!this.validateEmail(this.user.mobileemail)) {
                this.isRegEmailOrMobile = true;
                return false;
            } else {
                this.isRegEmailOrMobile = false;
            }
        } else {
            if (!this.validatePhone(this.user.mobileemail)) {
                this.isRegEmailOrMobile = true;
                return false;
            } else {
                this.isRegEmailOrMobile = false;
            }
        }

        // console.log("userData: ", userData);
        this.naviService.registerUser(userData).subscribe((data) => {
            this.closeModal();
            console.log(data);
            accountId: undefined;
            localStorage.setItem('jwtToken', JSON.stringify(data.jwtToken));
            localStorage.setItem(
                'user',
                JSON.stringify({
                    mobileNumber: data.mobile,
                    accountId: data?.accountId,
                    email: data?.email,
                    userName: data?.userName,
                    role: data?.role,
                })
            );
        });
    }
    getOTP() {
        const userData = {
            action: 'getOTP',
            receivedOTP: '',
            mobiles: '91' + this.user.mobileNumber,
            message: '',
        };
        this.naviService.getOTP(userData).subscribe((data) => {
            if (data.type === 'success') {
                //this.showGetOTPBtn = false;
                //this.showVerifyOTPBtn = true;
                this.otpSent = true;
                this.startTimer();
            }
        });
    }

    resendOTP() {
        const userData = {
            action: 'resendOTP',
            receivedOTP: '',
            mobiles: '91' + this.user.mobileNumber,
            message: '',
        };
        this.naviService.resendOTP(userData).subscribe((data) => {
            if (data.otp) {
                //this.showGetOTPBtn = false;
                //this.showVerifyOTPBtn = true;
            }
        });
    }

    verifyOTPandRegister() {
        const userData = {
            action: 'verifyOTP',
            receivedOTP: this.user.otp,
            mobiles: '91' + this.user.mobileNumber,
        };
        if (this.isProxyUser) {
            this.showRegisterBtn = true;
            this.showVerifySuccess = true;
            this.isOtpVerified = true;
            this.registerUser();
        } else {
            this.naviService.verifyOTP(userData).subscribe((data) => {
                if (data.type === 'success') {
                    this.showRegisterBtn = true;
                    this.showVerifySuccess = true;
                    this.isOtpVerified = true;
                    this.registerUser();
                } else {
                    this.isOtpVerified = false;
                }
            });
        }
    }

    async verifyOTP() {
        // const userData: userprofile = {};
        //userData.userName = this.user.mobileNumber;
        //userData.otp = this.user.otp;
        //userData.password = this.user.password;
        const userData = {
            action: 'verifyOTP',
            receivedOTP: this.user.otp,
            mobiles: '91' + this.user.mobileNumber,
        };

        /*if(!this.user.password || this.user.password.length === 0){
      this.isLoginPassword = true;
      return;
    }else{
      this.isLoginPassword = false;
    }*/
        if (this.isProxyUser) {
            this.loginSuccess();
            return;
        }
        this.naviService.verifyOTP(userData).subscribe(async (data) => {
            if (data.type === 'success') {
                console.log('login success', data);
                localStorage.setItem('jwtToken', JSON.stringify(data.jwtToken));
                const empResp = await this.naviService.fetchRequest(
                    'stalloperator/getAllStallOperator'
                );
                let employeesList = empResp['stallOperatorList'];
                let vendorId;
                employeesList.forEach((data) => {
                    if (data.mobile == this.user?.mobileNumber)
                        vendorId = data.vendorId;
                });
                if (vendorId) {
                    localStorage.setItem('vendorId', vendorId + '');
                }
                this.loginSuccess();
                //window.location.reload();
            } else {
                console.log('login failure', this.isOtpVerified);
                this.isOtpVerified = false;
            }
        });
    }
    loginSuccess() {
        this.isOtpVerified = true;
        localStorage.setItem(
            'user',
            JSON.stringify({
                mobileNumber: this.user?.mobileNumber,
                accountId: this.user?.accountId,
                email: this.user?.email,
                userName: this.user?.name,
                role: this.user?.role,
            })
        );
        this.closeModal();
    }
    onOtpChange(event: any) {
        this.user.otp = event;
    }
    //returns true if valid, false if not valid
    validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    validatePhone(phoneno) {
        var re = /^((\\+91-?)|0)?[0-9]{10}$/;
        return re.test(phoneno);
    }

    startTimer() {
        this.interval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
            } else if (this.timeLeft == 0) {
                this.showResendOTP == true;
            } else {
                this.timeLeft = 60;
            }
        }, 1000);
    }

    oberserableTimer() {
        const source = timer(1000, 2000);
        const abc = source.subscribe((val) => {
            console.log(val, '-');
            this.subscribeTimer = this.timeLeft - val;
        });
    }
}
