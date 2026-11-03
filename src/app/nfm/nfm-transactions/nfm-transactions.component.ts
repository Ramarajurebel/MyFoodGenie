import { formatDate } from '@angular/common';
import {
    Component,
    Inject,
    LOCALE_ID,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { BarcodeFormat } from '@zxing/library';
import { Result } from '@zxing/library';

@Component({
    selector: 'app-nfm-transactions',
    templateUrl: './nfm-transactions.component.html',
    styleUrls: ['./nfm-transactions.component.scss'],
})
export class NfmTransactionsComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    @ViewChild('qrScannerDialog', { static: true }) qrScannerDialog: TemplateRef<any>;
    selectedvalue:string;
    drawerMode: 'side' | 'over';
    
    // QR Scanner properties
    isScannerEnabled = false;
    isLoading = false;
    scannerError = false;
    scannerErrorMessage = '';
    hasCamera = false;
    hasFlashlight = false;
    isFlashlightOn = false;
    availableDevices: MediaDeviceInfo[] = [];
    selectedDevice: MediaDeviceInfo;
    qrScannerDialogRef: any;
    scannedQrCodeData: string = '';
    categories = [
        'Vegetables',
        'Pulses',
        'Daily Proucts',
        'Dry Items',
        'Others',
    ];
    Asset = ['Asset','Liability'];
    stallData = [];

    public paymentmode = ['UPI', 'Account', 'Cash'];
    dailyPurchases = [];
    purchaseOrderForm: FormGroup;
    isMatDrawerOpened = false;
    catDropdown = [];
    catTypedata = [];
    editMode = false;
    transStallName: any;
    id: number = 0;
    modalReference: any;
    selectedTransValue: string='All';
    public orderForm: FormGroup;
    selectedCounterValue: number =0;
    delObj: any;
    @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
    operators = [];
    vendorData = [];
    vendorId = 0;
    typeCategoryDropdown: any[];
    TransFilteredData: any[];
    counterFilteredData: any[];
    filteredResults  = [];
    constructor(
        private service: ProjectService,
        @Inject(LOCALE_ID) public locale: string,
        private dialog: MatDialog
    ) {
       
    }

    async ngOnInit() {
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.purchaseOrderForm = new FormGroup({
            eventId: new FormControl(''),
            category: new FormControl(''),
            amount: new FormControl(''),
            status: new FormControl('Paid'),
            expenseType: new FormControl('Recurring'),
            receiptImageId: new FormControl('/img21380'),
            paidBy: new FormControl(''),
            paidTo: new FormControl(''),
            purchasedDate: new FormControl(),
            comments: new FormControl(''),
            transactionType: new FormControl(''),
            transaction: new FormControl('Purchase'),
            amountCleared: new FormControl(''),
            referenceId: new FormControl(''),
            vendorId: new FormControl(),
            stallId: new FormControl(''),
            type: new FormControl('Liability')
        });
        this.orderForm = new FormGroup({
            startDate: new FormControl(new Date()),
            endDate: new FormControl(new Date()),
            counter: new FormControl(''),
            type: new FormControl(''),
        });
        const currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        console.log(currentDate);
        this.purchaseOrderForm.controls['purchasedDate'].setValue(currentDate);
        const resp = await this.service.fetchRequest(
            'poHeader/getAllpoHeaders'
        );
        this.dailyPurchases = resp['purchaseOrderHeaderList'];
        const vendorResp = await this.service.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        // paid by
        const operesp = await this.service.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.operators = operesp['stallOperatorList'];
        this.operators = this.operators.filter((item) => {
            return item.role === 'Employee';
        });
        const catresp = await this.service.fetchRequest(
            'catdropdown/getAllcatdropdown'
        );
        this.catDropdown = catresp['cat_dropdownList'];
        
        const counterresp = await this.service.fetchRequest('stall/getAllStalls');
        this.stallData = counterresp['supplierList'];
        
        const extractedTypes = this.catDropdown.map(item => item.type);
        console.log(extractedTypes);
        this.typeCategoryDropdown = [...new Set(extractedTypes)];

console.log("Unique Array:",this.typeCategoryDropdown); 
this.selectedvalue = 'Liability';
if(this.selectedvalue = 'Liability'){
    this.catTypedata = this.catDropdown.filter(cat => cat.type === "Liability")
}

if (this.selectedTransValue == 'All') {
    this.TransFilteredData = this.dailyPurchases
   this.TransFilteredData.forEach(item=>{
    this.stallData.forEach(stall=>{
        if(item.stallId == stall.stallid){
            item.stallName = stall.name
        }
    })
   })
    
  } 
  const stallIdToNameMap = {};

  this.stallData.forEach((stall) => {
    stallIdToNameMap[stall.stallid] = stall.name;
  });
  


console.log(stallIdToNameMap)
// this.onTransCounter();
//  const stall = this.stallData.find(item => item.stallid == this.selectedCounterValue)  
//  this.transStallName = stall.name
//  console.log("stallName:",this.transStallName)
//  return  this.transStallName;

    }
    onTransCounter(){
        this.dailyPurchases.forEach(trans =>{
            this.stallData.forEach(stalls=>{
              if(trans.stallId==stalls.stallid){
                this.transStallName = stalls.name
                console.log("stallName:",this.transStallName)
                // productmap.productname = supplierItem.productname
              }
            })
          })
    }
    OnEdit(row) {
        this.purchaseOrderForm.controls['vendorId'].disable();
        this.editMode = true;
        this.id = row.id;
        this.isMatDrawerOpened = !this.isMatDrawerOpened;
        this.selectedvalue = row.type;
        this.catTypedata = this.catDropdown.filter(cat => cat.type ===  this.selectedvalue )
        this.purchaseOrderForm.patchValue({
            eventId: row.eventId,
            category: row.category,
            amount: row.amount,
            status: row.status,
            expenseType: row.expenseType,
            paidBy: row.paidBy,
            comments: row.comments,
            paidTo: row?.paidTo,
            purchasedDate: row?.purchasedDate,
            transactionType: row?.transactionType,
            transaction: row?.transaction,
            amountCleared: row?.amountCleared + '',
            referenceId: row.referenceId,
            vendorId: row.vendorId,
            stallId: row.stallId,
            type: row?.type,
        });
    }
    onSearch(){
        
        
        let sDate: Date = this.orderForm.controls['startDate'].value;
        let eDate: Date = this.orderForm.controls['endDate'].value;
        let startDate:string = formatDate(sDate, 'YYYY-MM-dd', this.locale);
        let endDate: string =  formatDate(eDate, 'yyyy-MM-dd', this.locale);
        let counter = this.orderForm.controls['counter'].value;
        let type = this.orderForm.controls['type'].value;
        let tFilters = [];
        let filter1,filter2,filter3,filter4;
        if (counter) {
            filter1 = this.TransFilteredData.filter(item => item.stallId == counter);
            tFilters.push(filter1)
            console.log("filter1",filter1)
          }
        if(type){
            filter2 = this.TransFilteredData.filter(item => item.type == type);
            tFilters.push(filter2)
            console.log("filter2",filter2)
        }
        // this.TransFilteredData = this.dailyPurchases.filter(item => {
        //     const purchaseDate = new Date(item.purchasedDate);
        //     return purchaseDate >= sDate && purchaseDate <= eDate;
        //   });
        if (startDate) {
           
            filter3 = this.TransFilteredData.filter(item => {
                
           // Replace 'date' with the actual date property in your data
              return item.purchasedDate >= startDate ;
            });
            tFilters.push(filter3);
            console.log("filter3",filter3)
          }
          if (endDate) {
           
            filter4 = this.TransFilteredData.filter(item => {
           // Replace 'date' with the actual date property in your data
              return item.purchasedDate <= endDate;
            });
            tFilters.push(filter4);
            console.log("filter4",filter4)
          }
          console.log("tFilters",tFilters)
          let combinedFilters = [];

          if (tFilters.length > 0) {
            combinedFilters = [].concat(...tFilters);
          }
          console.log("combinedFilters:",combinedFilters)
          let filteredData = this.TransFilteredData;
          if (combinedFilters.length > 0) {
            let filteredData = combinedFilters.filter(item=>item.purchasedDate >= startDate && item.purchasedDate <=endDate && item.stallId == counter  && item.type == type)
            // Combine the conditions in the combinedFilters using the '&&' operator
            // const combinedCondition = (item) =>
            //   combinedFilters.every((condition) => {
            //     // Replace 'property' with the actual property you want to filter on
            //     return item.purchasedDate == condition.purchasedDate ||item.createdDate == condition.createdDate ||item.stallId == condition.stallId || item.type == condition.type ;
            //   });
          
            // filteredData.filter(combinedCondition);
            console.log("filteredData:",filteredData)
            this.TransFilteredData = filteredData
          }
      
      
        //   console.log("filteredData", filteredData);
        }

    
    onTransactionChange(){
        if (this.selectedTransValue == 'All') {
            this.TransFilteredData = [...this.dailyPurchases]
          } 
          else if(this.selectedTransValue != 'All'){
            let data = this.dailyPurchases.filter(Trans => {
                return Trans.type == this.selectedTransValue;
              });
              this.TransFilteredData = [...data];
              console.log("TransTableData:",this.TransFilteredData);
          }
       
        //   this.onTransCounter();
    }
    onTransactionCounterChange(){
        let data = this.dailyPurchases.filter(Trans => {
            return Trans.stallId == this.selectedCounterValue;
          });
          this.TransFilteredData = [...data];
          console.log("counterTableData:",this.TransFilteredData);
        //   this.onTransCounter();
    }
    dateRangeChange(dateRangeStart: HTMLInputElement,
        dateRangeEnd: HTMLInputElement){
            const sDate = new Date(dateRangeStart.value);
            const eDate = new Date(dateRangeEnd.value);
            this.TransFilteredData = this.dailyPurchases.filter(item => {
                const purchaseDate = new Date(item.purchasedDate);
                return purchaseDate >= sDate && purchaseDate <= eDate;
              });
    }
    OnAddClick() {
        this.isMatDrawerOpened = true;
        this.purchaseOrderForm.controls['vendorId'].setValue(this.vendorId);
        let currentDate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);
        this.purchaseOrderForm.controls['purchasedDate'].setValue(currentDate);
        let user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            this.operators.forEach((op) => {
                if (op.mobile === user.mobileNumber) {
                    this.purchaseOrderForm.controls['paidBy'].setValue(op.name);
                }
            });
        }
    }
    onType(selectedType: string){
        this.selectedvalue = selectedType;
        console.log(this.selectedvalue);

        this.catTypedata = this.catDropdown.filter(cat => cat.type===this.selectedvalue )
        // this.selectedvalue = 'Liability';
// if(this.selectedvalue = 'Liability'){
//     this.catTypedata = this.catDropdown.filter(cat => cat.type == "Liability")
// }
// else if(this.selectedvalue = 'Asset'){
//     this.catTypedata = this.catDropdown.filter(cat => cat.type == "Asset")
// }
    }
    async OnSavePopup() {
        const data = this.purchaseOrderForm.getRawValue();

        if (this.editMode) {
            data['id'] = this.id;
            data['amountCleared'] = false;
        } else {
            data['id'] = 0;
            data['amountCleared'] = false;
        }
        const resp = await this.service.fetchRequestPost(
            'poHeader/createpoHeader',
            data
        );

        this.editMode = false;
        this.isMatDrawerOpened = false;
        this.ngOnInit();
    }
    onDelPopup(dialog, row) {
        this.modalReference = this.dialog.open(dialog);
        this.delObj = {
            id: this.id,
        };
    }
    OnClose() {
        this.isMatDrawerOpened = false;
        this.purchaseOrderForm.reset();
        this.editMode = false;
    }
    async confirm() {
        this.modalReference.close();
        this.editMode = false;
        const delresp = await this.service.fetchRequestdel(
            'poHeader/deletepoHeader',
            this.delObj
        );
        this.isMatDrawerOpened = false;
        this.ngOnInit();
    }
    CloseDialog() {
        this.modalReference.close();
        this.editMode = false;
    }
    decline() {
        this.modalReference.close();
    }

    // QR Scanner Methods
    onPay() {
        // Set default values in the form
        this.setPaymentDefaults();
        
        // Open the form drawer first
        this.isMatDrawerOpened = true;
        
        // Then open QR scanner
        this.openQrScanner();
    }

    setPaymentDefaults() {
        const currentDate = formatDate(new Date(), 'yyyy-MM-dd', this.locale);
        
        // Update the category dropdown based on Liability type first
        this.selectedvalue = 'Liability';
        this.catTypedata = this.catDropdown.filter(cat => cat.type === 'Liability');
        
        // Set default values as specified
        this.purchaseOrderForm.patchValue({
            vendorId: '1001', // 1001-navikarana
            type: 'Liability',
            category: 'Others', // Default category - will be selected in dropdown
            stallId: '23', // 23-snacks
            purchasedDate: currentDate,
            transactionType: 'UPI',
            expenseType: 'Onetime',
            status: 'Paid'
        });
    }

    openQrScanner() {
        this.resetScannerState();
        this.qrScannerDialogRef = this.dialog.open(this.qrScannerDialog, {
            width: '400px',
            height: '600px',
            disableClose: true,
            panelClass: 'qr-scanner-dialog'
        });
        
        // Enable scanner after dialog opens
        setTimeout(() => {
            this.isScannerEnabled = true;
            this.isLoading = true;
        }, 100);
    }

    closeQrScanner() {
        this.isScannerEnabled = false;
        if (this.qrScannerDialogRef) {
            this.qrScannerDialogRef.close();
        }
        this.resetScannerState();
    }

    resetScannerState() {
        this.isScannerEnabled = false;
        this.isLoading = false;
        this.scannerError = false;
        this.scannerErrorMessage = '';
        this.isFlashlightOn = false;
    }

    onScanSuccess(result: string | Result) {
        console.log('QR Code scanned successfully:', result);
        
        // Handle both string and Result type
        const qrText = typeof result === 'string' ? result : result.getText();
        
        // Process the payment with the scanned QR code
        this.processPayment(qrText);
        
        // Close the scanner
        this.closeQrScanner();
    }

    onScanError(error: any) {
        console.error('QR scan error:', error);
        this.scannerError = true;
        this.scannerErrorMessage = 'Failed to scan QR code. Please try again.';
    }

    onScanFailure(error: any) {
        console.warn('QR scan failure:', error);
        // Don't show error for scan failures as they're common when no QR code is visible
    }

    onCamerasFound(devices: MediaDeviceInfo[]) {
        console.log('Cameras found:', devices);
        this.availableDevices = devices;
        this.hasCamera = devices && devices.length > 0;
        this.isLoading = false;
        
        // Select the back camera if available, otherwise use the first camera
        if (devices && devices.length > 0) {
            const backCamera = devices.find(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('rear')
            );
            this.selectedDevice = backCamera || devices[0];
        }
    }

    onCamerasNotFound() {
        console.warn('No cameras found');
        this.hasCamera = false;
        this.isLoading = false;
        this.scannerError = true;
        this.scannerErrorMessage = 'No camera found on this device.';
    }

    onPermissionResponse(granted: boolean) {
        console.log('Camera permission:', granted);
        if (!granted) {
            this.scannerError = true;
            this.scannerErrorMessage = 'Camera permission denied. Please allow camera access to scan QR codes.';
        }
    }

    onHasDevices(hasDevices: boolean) {
        console.log('Has devices:', hasDevices);
        this.hasCamera = hasDevices;
        if (!hasDevices) {
            this.isLoading = false;
            this.scannerError = true;
            this.scannerErrorMessage = 'No camera devices available.';
        }
    }

    onDeviceChange() {
        console.log('Device changed to:', this.selectedDevice);
        // The scanner will automatically switch to the new device
    }

    retryScanner() {
        this.resetScannerState();
        this.isLoading = true;
        this.isScannerEnabled = true;
    }

    toggleFlashlight() {
        // Note: Flashlight control might not be available in all browsers/devices
        this.isFlashlightOn = !this.isFlashlightOn;
        console.log('Flashlight toggled:', this.isFlashlightOn);
        
        // Implementation would depend on the scanner library's flashlight support
        // This is a placeholder for the UI state
    }

    processPayment(qrCodeData: string) {
        console.log('Processing payment with QR code data:', qrCodeData);
        
        // Store the scanned QR code data for later use
        this.scannedQrCodeData = qrCodeData;
        
        // Parse QR code data if needed and update form
        // For example, you might extract amount or reference ID from QR code
        try {
            // If QR code contains JSON data, parse it
            const qrData = JSON.parse(qrCodeData);
            if (qrData.amount) {
                this.purchaseOrderForm.patchValue({ amount: qrData.amount });
            }
            if (qrData.referenceId) {
                this.purchaseOrderForm.patchValue({ referenceId: qrData.referenceId });
            }
        } catch (error) {
            // If not JSON, use the raw string as reference ID
            this.purchaseOrderForm.patchValue({ referenceId: qrCodeData });
        }
        
        // Show success message
        alert(`Payment QR code scanned successfully. Please verify the details and save the transaction.`);
        
        // The form is already open and populated with defaults
        // User can now verify and save the transaction
    }

    onPayNow() {
        const amount = this.purchaseOrderForm.get('amount')?.value;
        
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount before proceeding with payment.');
            return;
        }
        
        if (!this.scannedQrCodeData) {
            alert('Please scan a QR code first using the Pay button.');
            return;
        }
        
        // Construct the UPI payment URL with amount and currency
        const currencyCode = 'INR'; // Default currency code
        let paymentUrl = this.scannedQrCodeData;
        
        // Append amount and currency code to the QR code link
        if (paymentUrl.includes('?')) {
            paymentUrl += `&am=${amount}&cu=${currencyCode}`;
        } else {
            paymentUrl += `?am=${amount}&cu=${currencyCode}`;
        }
        
        console.log('Opening UPI app with URL:', paymentUrl);
        
        // Open UPI app
        this.openUpiApp(paymentUrl);
    }

    private openUpiApp(upiUrl: string) {
        try {
            // Try to open UPI app using window.location.href
            window.location.href = upiUrl;
            
            // Fallback: Try using a temporary anchor element
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = upiUrl;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 100);
            
        } catch (error) {
            console.error('Error opening UPI app:', error);
            
            // Show manual instructions if automatic opening fails
            const amount = this.purchaseOrderForm.get('amount')?.value;
            const message = `Unable to automatically open UPI app.\n\nPlease:\n1. Copy this UPI link: ${upiUrl}\n2. Open any UPI app manually\n3. Or scan the QR code again and enter amount: ₹${amount}`;
            
            alert(message);
            
            // Try to copy to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(upiUrl).catch(err => {
                    console.error('Failed to copy to clipboard:', err);
                });
            }
        }
    }
}
