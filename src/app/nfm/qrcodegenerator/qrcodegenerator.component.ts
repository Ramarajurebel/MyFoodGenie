import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import { BarcodeFormat } from '@zxing/library';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';

@Component({
  selector: 'app-qrcodegenerator',
  templateUrl: './qrcodegenerator.component.html',
  styleUrls: ['./qrcodegenerator.component.scss']
})
export class QrcodegeneratorComponent implements OnInit {

  qrtypeData: any[] = [];
  qrCode: string = '';
  showQRCode: boolean = false;
  qrdataid: any[] = [
    {key:'ab12yz', url:'https://myfoodgenie.com/#/'},
    {key:'ab34yz', url:'https://myfoodgenie.com/#/shop/mfg/GEN_2VE0000062'},
    {key:'ab45yz', url:'https://myfoodgenie.com/#/shop/mfg/SLT_2VE0000062-1-2'},
    {key:'ab56yz', url:'https://myfoodgenie.com/#/shop/mfg/SLT_2VE0000062-3-4'},
    // {key:'ab78yz', url:'https://myfoodgenie.com/#/shop/mfg/SLT_<MachineId2>'},
    
];
qrresp: any;
  selectedQrType:any;
  allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX /*, ...*/ ];
  selectedOption:string = '';
  dynamicForm!: FormGroup;
  selectedFile: any;
  base64Data: any;
  modalReference: any;
  isContainerVisible: boolean=false;
  interval: any;
  linePosition: number=0;
  constructor(private http: HttpClient,private dialog: MatDialog,private fb: FormBuilder,private route: ActivatedRoute,private router:Router,private service: ProjectService) {
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
    const qrresp = this.service.fetchRequest(
      'qrcdetails/getAllQRCDetails'
    ) .then((qrresp) => {
      this.qrresp = qrresp?.qrcdetailsList;
      console.log('qrResp', this.qrresp);
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
  const qrCodeImage = document.querySelector('ngx-qrcode img');
  const qrimg = this.dynamicForm.get('linkName').value;
  if (qrCodeImage instanceof HTMLImageElement) {
    // Convert the data URL to a Blob
    fetch(qrCodeImage.src)
      .then((response) => response.blob())
      .then((blob) => {
        // Save the Blob as a file with a specific name
        const filename = qrimg + '.png';
        saveAs(blob, filename);
      })
      .catch((error) => {
        console.error('Error fetching or saving QR code:', error);
      });
  }
}
onSave(){
  let jsonData = {};
  this.showQRCode = false;
    if (this.selectedOption === 'Link/Url') {
      const url = this.dynamicForm.value.url;
      jsonData = {
        type: this.selectedOption,
        linkName: this.dynamicForm.value.linkName,  
        url: this.dynamicForm.value.url,
      };
      const jsonString = JSON.stringify(jsonData, null, 2);
      console.log("JsonData:",jsonString);
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

// reader.readAsDataURL(this.selectedFile);
 
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
  if(this.interval) clearInterval(this.interval);
}
extractQrCodeValue(qrCodeUrl: string): string | null {
  const parts = qrCodeUrl.split('nqrmgm/');
  return parts.length > 1 ? parts[1] : null;
}
onScanSuccess(qrresult: any){
  console.log(qrresult);
  const qrCodeValue = this.extractQrCodeValue(qrresult);
if(qrCodeValue){
 
  const matchedQr = this.qrresp.find(item => item.qrId === qrCodeValue);

  if (matchedQr) {
    // Open the URL associated with the matched QR 
    this.dialog.closeAll();
    window.open(matchedQr.url, '_blank');
    
  } else {
    // Handle the case where QR code is not recognized
    console.error('QR Code not recognized');
  }
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
}


