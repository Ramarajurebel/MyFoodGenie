import { Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild,Renderer2 } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import { BarcodeFormat } from '@zxing/library';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { Share } from '@capacitor/share';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import html2canvas from 'html2canvas';
//import { NgxQrcodeStylingModule, Options, NgxQrcodeStylingService } from 'ngx-qrcode-styling';

@Component({
  selector: 'app-new-qrcodegenerator',
  templateUrl: './new-qrcodegenerator.component.html',
  styleUrls: ['./new-qrcodegenerator.component.scss']
})
export class NewQrcodegeneratorComponent implements OnInit {
  @ViewChild('qrCodeTemplate', { static: false }) qrCodeTemplate: ElementRef;
  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';
  @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
  @ViewChild('qrcode') qrcode: ElementRef;
  // @ViewChild('qrCodeTemplate') qrCodeTemplate: TemplateRef<any>;
  qrtypeData: any[] = [];
  qrCode: string = '';
  showQRCode: boolean = false;
  qrcodeOptions: any;
//   qrdataid: any[] = [
//     {key:'ab12yz', url:'https://myfoodgenie.com/#/'},
//     {key:'ab34yz', url:'https://myfoodgenie.com/#/shop/mfg/GEN_2VE0000062'},
//     {key:'ab45yz', url:'https://myfoodgenie.com/#/shop/mfg/SLT_2VE0000062-1-2'},
//     {key:'ab56yz', url:'https://myfoodgenie.com/#/shop/mfg/SLT_2VE0000062-3-4'},
//     // {key:'ab78yz', url:'https://myfoodgenie.com/#/shop/mfg/SLT_<MachineId2>'},
    
// ];
qrdataid: Promise<any>;
  selectedQrType:any;
  allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX /*, ...*/ ];
  selectedOption:string = '';
  dynamicForm!: FormGroup;
  selectedFile: any;
  base64Data: any;
  isMatDrawerOpened = false;
  modalReference: MatDialogRef<any>;
  isContainerVisible: boolean=false;
  viewqr:boolean = false;
  interval: any;
  linePosition: number=0;
  qrresp: Promise<any>;
  public AddUrlForm: FormGroup;
  public editMode = false;
  delobj: { qrAutoId: any; };
  qrAutoId: any;
  genurl: string;
  dataUrl: string;
 
  constructor(private http: HttpClient,private dialog: MatDialog,private fb: FormBuilder,private route: ActivatedRoute,private router:Router, private service: ProjectService,private sanitizer: DomSanitizer,private renderer: Renderer2) {
    // this.qrcodeOptions = data.qrcodeOptions;
    this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe(() => {
      this.onScanSuccess(this.router.url)
    console.log(this.router.url);
    });
    
    // this.route.params.subscribe(params => {
    //   const qrId = params['id'];
    //   this.qrCodeUrl = `https://myfoodgenie.com/nqrmgm/${qrId}`;
    // });
   }

  ngOnInit() {
    this.http.get<any[]>('./assets/qrtype.json').subscribe(data => {
      this.qrtypeData = data;
      console.log(this.qrtypeData); // Optional: Log the data to verify
    });
    this.dynamicForm = this.fb.group({});
    this.AddUrlForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      value: new FormControl(''),
      folderName: new FormControl(''),
    
    });

  this.qrcodeOptions = {
    width: 150,
    height: 150,
    colorDark: '#000000',
    colorLight: '#ffffff'
  };

     const qrresp = this.service.fetchRequest(
        'qrcdetails/getAllQRCDetails'
      ) .then((qrresp) => {
        this.qrdataid = qrresp?.qrcdetailsList;
        console.log('qrResp', this.qrdataid);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  //  this.qrresp = qrresp
  //  console.log("qrResp",this.qrresp)
  }
  async getqrlist(){
    const qrresp = await this.service.fetchRequest(
      'qrcdetails/getAllQRCDetails'
    ) .then((qrresp) => {
      this.qrdataid = qrresp?.qrcdetailsList;
      console.log('qrResp', this.qrdataid);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }
  onChange(){
    const selectedOption = this.selectedOption;
    this.dynamicForm.reset();
    this.showQRCode = false;
    if (selectedOption === 'Link/Url') {
      this.dynamicForm.addControl('linkName', this.fb.control(''));
      this.dynamicForm.addControl('url', this.fb.control(''));
    }
    else if (selectedOption === 'Wi-fi') {
      this.dynamicForm.addControl('wifiName', this.fb.control(''));
      this.dynamicForm.addControl('wifiKey', this.fb.control(''));
    } 
    else if (selectedOption === 'PDF') {
      this.dynamicForm.addControl('pdffile', this.fb.control(''));
    
    } 
    else if (selectedOption === 'Application') {
      this.dynamicForm.addControl('LinkAppStore', this.fb.control(''));
      this.dynamicForm.addControl('LinkGpay', this.fb.control(''));
      this.dynamicForm.addControl('LinkOther', this.fb.control(''));
    } 
    else if (selectedOption === 'E-mail') {
      this.dynamicForm.addControl('emailto', this.fb.control(''));
      this.dynamicForm.addControl('subject', this.fb.control(''));
      this.dynamicForm.addControl('body', this.fb.control(''));
    } 
    else if (selectedOption === 'WhatsApp') {
      this.dynamicForm.addControl('phn', this.fb.control(''));
      this.dynamicForm.addControl('message', this.fb.control(''));
    
    } 
  }
  onEdit(row){
    this.isMatDrawerOpened = true;
    this.editMode = true;
    this.qrAutoId = row.qrAutoId;
    this.AddUrlForm.patchValue({
      name: row.name,
      description: row.description,
      value:row.value,
      folderName: row.folderName,
      
    });
  }
  onFileChange(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;
    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        // The result property contains the data URL in base64 format
        this.base64Data = e.target.result;
        console.log(this.base64Data);
        // You can assign base64Data to your form control or use it as needed
        // this.pdfForm.controls['pdffile'].setValue(base64Data);
        // this.dynamicForm.controls['pdffile'].setValue(base64Data);
      };
      reader.readAsDataURL(file);
  }
}
async onshowQRCode(modal:  TemplateRef<any>){
  const dialogRef = this.dialog.open(modal, {
    width: '400px', // Set the desired width
    disableClose: true, // Optional: Prevent closing by clicking outside the modal
  });
}
async OnScanPress(modal:  TemplateRef<any>){
  const dialogRef = this.dialog.open(modal, {
    width: '400px', // Set the desired width
    disableClose: true, // Optional: Prevent closing by clicking outside the modal
  });
  // if(Capacitor.getPlatform()!="web"){
  //   this.isMobileOrDesktop=true;
  //   const result = await Camera.requestPermissions();
  //   if (result.camera === 'granted') {
  //     console.log('Camera permissions granted.');
  //     // Proceed with camera operations
  //   } else {
  //     console.log('Camera permissions denied.');
  //     return 
  //     // Handle the denied permissions
  //   }
  //  }
  //  if(window.innerWidth<=700) this.isMobileOrDesktop=true;
  //  else this.isMobileOrDesktop=false;  
   this.animateLine();
  
  
 
}
animateLine() {
  this.isContainerVisible = true;
  this.interval =  setInterval(() => {
     this.linePosition +=1;
    
     if (this.linePosition >= 100) {
       this.linePosition = 0;
     }
   }, 10); // Adjust the interval as needed
 }
downloadQRCode(){
  const fileNameToDownload = 'image_qrcode';
 
   const qrcodeElement = document.getElementById('qrcode');
   if (qrcodeElement instanceof HTMLImageElement) {
   
    
      const base64Img = qrcodeElement.src;
   fetch(base64Img)
      .then(res => res.blob())
      .then((blob) => {
         // IE
        // Chrome
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileNameToDownload;
            link.click();
       
      })    
   
    }

 
}
downloadQR(qrcode: any): void{
  qrcode.download().subscribe((res: any) => {
    // TO DO something!
    console.log('download:', res);
  });

 
}
onView(row,modal){
  // this.getqrlist();
  this.viewqr = true;
  const qrId = row.qrId;
  this.genurl = `https://myfoodgenie.com/#/nqrmgm/${qrId}`;
  console.log("genurl",this.genurl)
  // const qrcodeOptions: Options = {
  //   data: this.genurl, 
  //   image:'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'// Set the data property to the value of genurl
  //   // Add other options as needed
  // };
  // Pass data object with genurl to the dialog
  this.modalReference = this.dialog.open(modal);
   //console.log(this.genurl)

}
async captureQRCode() {
  const qrCodeElement = document.getElementById('qrcode'); // Assuming 'qrcode' is the ID of your QR code element
  const canvas = await html2canvas(qrCodeElement);
  this.dataUrl = canvas.toDataURL('image/png');
  console.log("canvas",canvas)
  console.log('Base64 Image Data:', this.dataUrl);
  return this.dataUrl;
  // const dataUrl = canvas.toDataURL('image/png');
  
}

async shareQrCodeImage(){
  const qrCodeDataURL = await this.captureQRCode();
    const byteCharacters = atob( this.dataUrl.split(',')[1]);
const byteNumbers = new Array(byteCharacters.length);
for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
}
const byteArray = new Uint8Array(byteNumbers);
const blob = new Blob([byteArray], { type: 'image/jpeg' });

// Create a File object from the Blob
const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

// Use navigator.share if it's supported
if (navigator.share) {
    navigator.share({
        title: 'Share Image via WhatsApp',
        text: 'Check out this image!',
        files: [file],
    })
    .then(() => console.log('Shared successfully'))
    .catch((error) => console.error('Error sharing:', error));
} else {
    // Fallback if navigator.share is not supported
    console.log('navigator.share is not supported');
    // Provide alternative sharing options or UI
}
  // try {

  //   // Select the QR code element
  //   const qrCodeElement = this.qrCodeTemplate.nativeElement;

  //   // Sanitize the HTML of the QR code element
  //   const sanitizedHtml: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(qrCodeElement.innerHTML);

  //   // Create a data URL from the sanitized HTML
  //   const imageDataUrl = `data:image/svg+xml,${encodeURIComponent(sanitizedHtml.toString())}`;

  //   // Convert the data URL to a SafeUrl
  //   const safeImageUrl: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(imageDataUrl);

  //   // Extract the URL from the SafeUrl
  //   const imageUrl: string = safeImageUrl.toString();

  //   // Share the image URL
  //   await Share.share({
  //     title: 'Share QR Code',
  //     text: 'Check out this QR code!',
  //     files: [imageUrl],
  //     dialogTitle: 'Share via'
  //   });
  // } catch (error) {
  //   console.error('Error sharing QR code image:', error);
  // }
}
Add(){
  this.isMatDrawerOpened = true;
        this.editMode = false;
}
onDel(row, template) {
  this.delobj = {
    qrAutoId: row.qrAutoId,
  };
  console.log(this.delobj);
  this.modalReference = this.dialog.open(template);
}
async confirm() {
  const resp = await this.service.fetchRequestdel(
      'qrcdetails/deleteQRCDetails',
      this.delobj
  );
  // this.onSearch();
  this.getqrlist();
  this.onClose();
}
async OnSaveUrl(){
  const data = this.AddUrlForm.getRawValue();
  if (this.editMode) {
    data['qrAutoId'] = this.qrAutoId;
}
  const resp = await this.service.fetchRequestPost(
    'qrcdetails/createQRCDetails',
    data
);
console.log(resp);

this.getqrlist();
this.onClose();
// const qrresp = this.service.fetchRequest(
//   'qrcdetails/getAllQRCDetails'
// ) .then((qrresp) => {
//   this.qrdataid = qrresp?.qrcdetailsList;
//   console.log('qrResp', this.qrdataid);
// })
// .catch((error) => {
//   console.error('Error fetching data:', error);
// });
}
onSave(){
  let jsonData = {};
  this.showQRCode = false;
    if (this.selectedOption === 'Link/Url') {
      const url = this.dynamicForm.value.url;
      let payload = {
        name: this.dynamicForm.value.linkName,
        description: this.selectedOption,
        value: this.dynamicForm.value.url,
        folderName: "Testing"
      }
     
      console.log(this.qrdataid,"qrdataid")
      const resp = this.service.fetchRequestPost(
        'qrcdetails/createQRCDetails',
        payload
    );
    console.log(resp);
   
    
      this.qrCode = url;
      this.showQRCode = true;
  } else if (this.selectedOption === 'Wi-fi') {
    const wifiName = this.dynamicForm.value.wifiName;
const wifiKey = this.dynamicForm.value.wifiKey;
    jsonData = {
      type: this.selectedOption,
      wifiName: this.dynamicForm.value.wifiName,
      wifiKey: this.dynamicForm.value.wifiKey,
    };
    const wifiData = `Wi-Fi Name: ${wifiName}\nWi-Fi Key: ${wifiKey}`;
     const jsonString = JSON.stringify(jsonData, null, 2);
console.log("JsonData:",jsonString);
this.qrCode = wifiData;
this.showQRCode = true;
}
else if (this.selectedOption === 'PDF' && this.selectedFile) {
  const reader = new FileReader();
  
  jsonData = {
    type: this.selectedOption,
    pdfData: this.base64Data,
  };


 
}
else if (this.selectedOption === 'Application') {
  jsonData = {
    type: this.selectedOption,
    LinkAppStore: this.dynamicForm.value.LinkAppStore,
    LinkGpay: this.dynamicForm.value.LinkGpay,
    LinkOther: this.dynamicForm.value.LinkOther
  };
}
else if (this.selectedOption === 'E-mail') {
jsonData = {
  type: this.selectedOption,
  emailto: this.dynamicForm.value.emailto,
  subject: this.dynamicForm.value.subject,
  body: this.dynamicForm.value.body
};
}
else if (this.selectedOption === 'WhatsApp') {
jsonData = {
  type: this.selectedOption,
  phn: this.dynamicForm.value.phn,
  message: this.dynamicForm.value.message,
 
};
}
// const jsonString = JSON.stringify(jsonData, null, 2);
// console.log("JsonData:",jsonString);
// this.qrCode = jsonString;
// this.showQRCode = true;
}
onClose(){
  this.dialog.closeAll();
  this.isMatDrawerOpened = false;
  this.AddUrlForm.reset();
  this.getqrlist();
  if(this.interval) clearInterval(this.interval);
}
extractQrCodeValue(qrCodeUrl: string): string | null {
  const parts = qrCodeUrl.split('nqrmgm/');
  return parts.length > 1 ? parts[1] : null;
}
onScanSuccess(qrresult: any){
  console.log(qrresult);
//   const qrCodeValue = this.extractQrCodeValue(qrresult);
// if(qrCodeValue){
 
//   const matchedQr = this.qrdataid.find(item => item.key === qrCodeValue);

//   if (matchedQr) {
//     // Open the URL associated with the matched QR 
//     this.dialog.closeAll();
//     window.open(matchedQr.url, '_blank');
    
//   } else {
//     // Handle the case where QR code is not recognized
//     console.error('QR Code not recognized');
//   }
}
 // this.modalReference.close();
  // let lastSegment="";
  // if(qrresult.includes("GEN_")){
  //   const parts = qrresult.split("#");
  //   if(parts.length>1){
  //     console.log(parts[1]);
  //     this.router.routeReuseStrategy.shouldReuseRoute = function () {
  //       return false;
  //   }
  //   this.router.onSameUrlNavigation = 'reload';
  //     this.router.navigate([`${parts[1]}`],{replaceUrl:true});
  //   }
  // }
  // if(qrresult.includes("SLT_")){
  //   const parts = qrresult.split("#");
  //   if(parts.length>1){
  //     console.log(parts[1]);
  //     this.router.routeReuseStrategy.shouldReuseRoute = function () {
  //       return false;
  //   }
  //   this.router.onSameUrlNavigation = 'reload';
  //     this.router.navigate([`${parts[1]}`],{replaceUrl:true});
  //   }
  // }
  // if(!qrresult.includes("GEN_") && !qrresult.includes("SLT_")){
  //   const machIdOrDisplayId= qrresult;
  //   const machineObj = this.machinesList.find(obj=> obj.stallid==parseInt(machIdOrDisplayId) || obj.vmsMachId==machIdOrDisplayId);
  //   if(machineObj){
  //    this.dataService.setMachineId(machineObj.stallid);
  //    localStorage.setItem("genieName", machineObj.name);
  //    localStorage.setItem('genieId', machineObj.stallid+"");
  //    this.dataService.UpdateGenieName(machineObj.name);
  //    // temporary
  //    //  this.dataService.setIsSearchDisable(true);
    
  //   }
   
  // }
  
}