import { Component,  ElementRef,  Inject,
  LOCALE_ID,
  OnInit,
  TemplateRef,
  ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { productitems } from 'app/shared/classes/productitems';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDialog, MatDialogModule,} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { formatDate } from '@angular/common';



@Component({
  selector: 'app-genie-inventory',
  templateUrl: './genie-inventory.component.html',
  styleUrls: ['./genie-inventory.component.scss']
})
export class GenieInventoryComponent implements OnInit {
  @ViewChild('Showdetails') Showdetails!: TemplateRef<any>;
  @ViewChild('refillInput', { static: false }) refillInput: ElementRef;
  @ViewChild('quantityValue', { static: false }) quantityValue: ElementRef;
  @ViewChild('confirmRefill') confirmRefillTemplate: TemplateRef<any>;
  stallData: any;
  productItemPOobj:productitems;
producInvenobj:productitems;
  selectedProduct:any;
  selectedInvItem: any;
  totalAmount: number = 0;
  totalInvItems:number = 0;
  todaySaleAmount:number = 0;
  totalInvAvailableQuantity:number = 0;
  totalInvEmptyQuantity:number = 0;
  filteredSalesAmountData:any;
  genieId:any;
  selectedValue: number = 0;
  selectedProductId: any;
  selectedQuantity: number = 1;
  showQuantityError: boolean = false;
  showProductQuantityError: boolean = false;
  modalReference: any;
  productsList: productitems[] = [];
  Productsbygenie: any;
  machineData = [];
  counterData = [];
  GenieData = [];
  
  itemImgLoc = './assets/images/Food Menu/';
  selectedItem: any;
  selectedlist: any;
  vendorId: number;
  filteredProductItems: productitems[];
  filteredlist: productitems[];
  productsfilteredList: any[] = [];
  suppItems: any;
  suppliersList: any;
  prodfilterList: any;
  filtereditems: any;
  adhocItemformGroup: FormGroup;
  adhocPoData: any;
  Selectedadhocpoid:any;
  purchaserateCard: any;
  prAvailableStock: any;
  productDetails: any;
  quantity: any;
adhocPoItems = [];
isRefillOn:boolean = false;
  selectedInventoryItem: any;
  slotQuantity: number;
  refillQuantity: FormControl<any>;
  totalItems: productitems;
  totalAvailableQuantity: productitems;
  totalInvMaxQuantity: number = 0;
  orders: any;
  configDetails: any[] = [];
  totalInvSlots: any;
  uom: any;
  totalResvItems: number = 0;
  totalQtyAmount: number = 0;
  totalMarginAmount: number = 0;
  totalAvailableMarginAmount: number = 0;
  totalResvAmount: number = 0;
  totalSaleQty: number = 0;
  totalSaleMarginAmount: number = 0;
  isGenieChange:boolean=false;
  SelectedGenieId: any;
  Refillresp: any;
  selectedRefill: any;
  refillorderId: number = 0;
  user:any;
  username: any;
  mappingSlotResp: any;
  multipleSlotResp: any;
  dialogRef: any;
  Payload: { genieId: any; refillOrdId: number; createdBy: any; vendorId: number; };
  snackBarRef: any;
  constructor(
    private service: ProjectService,
    @Inject(LOCALE_ID) public locale: string,private dialog:MatDialog, private snackBar: MatSnackBar,private cdr: ChangeDetectorRef, 
  ) {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.username = this.user.userName 
  }

  async ngOnInit() {

    let vendorIdString = localStorage.getItem('vendorId');
    if (vendorIdString) {
        this.vendorId = parseInt(vendorIdString);
    }
  
    const counterresp = await this.service.fetchRequest('stall/getAllStalls');
        this.stallData = counterresp['supplierList'];

        this.counterData =   this.stallData.forEach((stall) => {
          this.GenieData.push(stall.stallid);
          // console.log(stall.stallid);
        });
        const payload = {
          catid: 112,
          prodid: 0,
          vendorId: this.vendorId,
      };
      const getproducts = await this.service.fetchRequestPost(
          '/rest/product/ProductsByVariants',
          payload
      );
      this.productsList = getproducts['productitems'];
      this.filteredProductItems = this.productsList;
      const adhocresp = await this.service.fetchRequest(
        'adhocpo/getAllAdhocpo'
    );

    this.adhocPoData = adhocresp['adhocpoList'];
    // po items
    const poitemResp = await this.service.fetchRequest('adhocpoitem/getAlladhocpoitem');
    this.adhocPoItems = poitemResp['adhocpoitemList'];

    this.adhocPoData = this.adhocPoData.filter((po) => {
      return po.status != 'Completed';
  });
  const purchaseRateCardResp = await this.service.fetchRequest(
    'purchaseratecard/getAllpurchaseratecard'
);
this.purchaserateCard = purchaseRateCardResp['purchaseratecardList'];
const Rfillresp = await this.service.fetchRequest(
  'refillOrder/getAllRefillOrder'
);

this.Refillresp = Rfillresp;
console.log("Refillresp",this.Refillresp)
      // this.machineData = Array.from(new Set(this.productsList.map(obj => obj.rackId)))
      //     .map(rackId => this.productsList.find(obj => obj.rackId === rackId));
      //     this.machineData.forEach((obj)=>{
      //       obj['productsList']= [];
      //     });
      //     this.machineData.forEach((headObj)=>{
      //       this.productsList.forEach((dataObj)=>{
      //         if(headObj.rackId === dataObj.rackId){
      //           headObj.productsList.push(dataObj);
      //         }
      //       })
      //     })
          console.log("machineData", this.machineData);
          const suppResp = await this.service.fetchRequest(
            'supplieritem/getAllSupplierItems'
          );
          this.suppItems = suppResp['supplierItemList'];

          const suppList = await this.service.fetchRequest(
            'supplier/getAllSuppliers'
          );
          this.suppliersList = suppList['supplierList'];
          const prodresp = await this.service.fetchRequest(
            'geniemapping/getAllGenieMapping'
          );
          this.productDetails = prodresp['genieMappingList'];
         
          // refillQuantity = new FormControl('', [Validators.required,Validators.min(1), // Ensure quantity is greater than or equal to 1
          // Validators.max(this.prAvailableStock.availableStock)]);
      }
      validateQuantity() {
       
        
        // const balance = this.selectedItem.allottedQuantity + this.selectedItem.balanceCount
        const inputValue = this.refillInput.nativeElement.value;

        // if (inputValue > this.prAvailableStock.availableStock) {
          
        //   this.showQuantityError = true;
          
        // }
         if(inputValue >  this.slotQuantity){
          
          this.showProductQuantityError = true;
        } else {
          this.showQuantityError = false;
          this.showProductQuantityError = false;
        }
      }
      onAddpo(modal, item:any){
        this. modalReference = this.dialog.open(modal);
        this.productItemPOobj = item;
        const matchingVariant = this.productItemPOobj.variants.find(variant => variant.prodId === this.productItemPOobj.prodId);
        console.log("matchingVariant",matchingVariant);
        this.uom = matchingVariant?.uom;
      }
      // onInventoryChange(){
      //   this.producInvenobj = this.productsList.find(product => product.prodId === Number(this.selectedProductId));
      // }
   async  onGenieInventorySave(){
        const inputValue = this.refillInput.nativeElement.value;
        const data =  this.suppItems.filter(obj=>{

          return obj.supid == this.selectedItem.supplier && obj.productId == this.selectedProductId && obj.endDate==null
        })
        console.log(data)

        const supplierItemData = data[0];
       
        console.log(supplierItemData)
        if(inputValue>supplierItemData.availableStock){
          const config: MatSnackBarConfig = {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['ok-button-white'],
        };
        this.snackBar.open('No available stock', 'OK', config);
        return
        }

        else{
        const AvailableStockData = supplierItemData.availableStock - inputValue;
        console.log(AvailableStockData);

        supplierItemData.availableStock = AvailableStockData
        const resp = await this.service.fetchRequestPost(
          'supplieritem/createSupplierItem',
          supplierItemData
      );
      const selectedSupplier = this.suppliersList.find(supplier => supplier.supId === this.selectedItem.supplier);
const supName = selectedSupplier ? selectedSupplier.name : '';
       const payload = {
          genieId: this.selectedItem.genieId,
          quantity: inputValue,
          itemId: parseInt(this.selectedProductId),
          supplierId: this.selectedItem.supplier,
          rackId: this.selectedItem.rackId,
          slotId: this.selectedItem.slotId,
          refilledBy: null,
          date:null,
          supName: supName,
          vendorId:this.vendorId
        }
        // payload.supName = this.suppliersList.name
        // console.log(payload)
      const saveResp = await this.service.fetchRequestPost(
        'genierefill/createGenieRefill',
        payload
      )
        }
        this.modalReference.close();
                this.onClose();

      }

      onSelectPO(value){
        console.log(value);
        //  = value;
        this.Selectedadhocpoid =  this.adhocPoData.find(product => product.adhocpoid ==value);


      console.log(this.Selectedadhocpoid);
      console.log(this.selectedItem)
      }
      async OnSavePO(item: any) {
        let updatepayload;
        let payload;
        const quantityValue = this.quantityValue.nativeElement.value;
        const relatedItems = this.adhocPoItems.filter((poitem)=>{
            return poitem.adhocpoid==this.Selectedadhocpoid.adhocpoid
            });
            console.log("poItems", relatedItems);

            if(relatedItems?.length>0){
            relatedItems.forEach((item)=>{
                if(item.productlist==this.productItemPOobj.prodId){
                    updatepayload = item;
                }
            })
            }
            if(updatepayload){
               payload = updatepayload;
               payload.quantity = payload.quantity + parseInt(quantityValue);
               payload.purchasedquantity = payload.purchasedquantity + parseInt(quantityValue);
               payload.uom = this.uom;
            }
            else{
          
const productToMatch = this.productItemPOobj.prodId;
let finalprice = this.productItemPOobj.purchasePrice * quantityValue;
console.log("finalprice",finalprice)


const matchingVariant = this.productItemPOobj.variants.find(variant => variant.prodId === productToMatch);
// const price = relatedItems.find(obj=> obj.adhocpoid === this.Selectedadhocpoid.adhocpoid);



  payload = {
    adhocpoid : this.Selectedadhocpoid.adhocpoid,
    quantity : parseInt(quantityValue),
    category : this.Selectedadhocpoid.category,
    productlist: this.productItemPOobj.prodId,
    uom: matchingVariant?.uom,
    
    price: this.productItemPOobj.purchasePrice,
    
      // available: this.selectedItem.balanceCountInStall,
      finalprice: finalprice,
      purchasedquantity: quantityValue,
      // lastpddate: null,
      // lastpdfrom: null,
      // lastpdprice: null,
      adhocpoitemid:0,
      available:false,
      ispacked: false,
      isreceived: false,
      taxAmount: this.Selectedadhocpoid.taxAmount,
      supplierId:null,

  }

            }

        console.log(payload)
        const updateresp = await this.service.fetchRequestPost(
          'adhocpoitem/createadhocpoitem',
          payload
      );
      this.quantityValue.nativeElement.value = '';
      this.modalReference.close();
      }

      onClose(){
        this.refillInput.nativeElement.value = '';
        this.selectedProductId = '';
        this.quantityValue.nativeElement.value = ''
        this.modalReference.close();
        this.showQuantityError = false;

      }
      addAlphabetToSubcatIds() {
        const alphabetMapping = new Map(); // Create a map to store the mapping of subcatId to alphabet
        let currentAlphabet = 'A';

        this.productsList.forEach((item) => {
          if (!alphabetMapping.has(item.subCatId)) {
            alphabetMapping.set(item.subCatId, currentAlphabet);
            currentAlphabet = String.fromCharCode(currentAlphabet.charCodeAt(0) + 1);
          }

          const alphabet = alphabetMapping.get(item.subCatId);
          item.subCatId = alphabet;
        });
      }
      onproductclick( item: any){
        this.selectedItem = item;
        this.isRefillOn = false;
       this. modalReference = this.dialog.open(this.Showdetails);

       const data =  this.suppItems.filter(obj=>{

        return obj.supid == this.selectedItem.supplier && obj.productId == this.selectedItem.prodId && obj.endDate==null
      })

      this.prAvailableStock =  data[0];

      // this.selectedItem['availableStock'] = this.prAvailableStock.availableStock
      console.log("prAvailable:",this.prAvailableStock);
      const selectedValue = this.filteredProductItems.find(item => item.prodId === this.selectedItem.prodId);
      if(selectedValue){
        this.selectedProductId = selectedValue.prodId;
      }
      const quantityStock = this.productDetails.filter(refill=>{
        return refill.itemId == this.selectedItem.prodId && refill.genieId == this.selectedItem.genieId

      })
      console.log("Quantity",);
      this.quantity = quantityStock;
     
      }
      OnRefillPress(item){
          this.selectedItem=item;
          this.modalReference = this.dialog.open(this.Showdetails);
          this.isRefillOn=true;
          this.refillQuantity = new FormControl(this.selectedItem?.allotedQuantity - this.selectedItem?.balanceCountInStall);
          const data =  this.suppItems.filter(obj=>{

            return obj.supid == this.selectedItem.supplier && obj.productId == this.selectedItem.prodId
          })

          this.prAvailableStock =  data[0];

          // this.selectedItem['availableStock'] = this.prAvailableStock.availableStock
          console.log(this.prAvailableStock);
          this.selectedProductId = this.selectedItem.prodId;
          const quantityStock = this.productDetails.filter(refill=>{
            return refill.itemId == this.selectedItem.prodId && refill.genieId == this.selectedItem.genieId

          })
          console.log("Quantity",);
          this.quantity = quantityStock;
         this.slotQuantity =   this.quantity[0].quantity-this.selectedItem.balanceCountInStall
      }
      async onCreateRefresh(){
       //this.refillorderId for this value is setting in onGenieChange() method
       console.log(this.user)
        this.Payload={
            "genieId": this.SelectedGenieId.autoGenieId,
          "refillOrdId" :this.refillorderId,
          "createdBy" : this.username,
          "vendorId": this.vendorId
          }
      console.log("payload",this.Payload);
      this.dialogRef = this.dialog.open(this.confirmRefillTemplate, {
        width: '300px', // Set the width as per your design
      });
             
        
    
            
          
      }
     async OnConfirmCreateRefillOrder(){
      const updateresp = await this.service.fetchRequestPost(
        'refillslots/getMappingInvData',
        this.Payload
    );
  
    this.mappingSlotResp = updateresp;
    
  console.log("MultipleSlotResp",this.multipleSlotResp);
  if(updateresp){
    this.snackBarRef = this.snackBar.open('Event Details Saved Successfully') ;
   
} 
else{
  this.snackBarRef = this.snackBar.open('Event Details not Saved')
}
setTimeout(() => {
  this.snackBarRef.dismiss();
}, 2000);
this.dialogRef.close();

     }
     decline() {
      this.dialogRef.close();
  }
    async  onGenieChange(selectedValue){
     
    this.isGenieChange= true;
      this.totalSaleQty = 0;
      this.totalSaleMarginAmount = 0;
        this.machineData = [];
      // alert(this.selectedValue);
        const payload = {  "stallid": this.selectedValue};
        const genieResp = await this.service.fetchRequestPost(
            '/genieinventory/getProductsByGenie',
            payload
        );
          this.Productsbygenie = genieResp['productitems']
          this.Productsbygenie.forEach((prod)=>{
         
            prod.prodImage = `${prod.prodId}.webp`;
          });
          this.productsfilteredList = this.Productsbygenie
          this.productsfilteredList.forEach(product => {
            product.emptyQty = product.allotedQuantity - product.balanceCountInStall;
          });

          // this.productsList[2].balanceCountInStall = 10;
        console.log(this.Productsbygenie );
        this.processProductItems();
        this.Productsbygenie.forEach((prod)=>{
          prod.offerPrice = prod.offerprice;
          prod.prodImage = `${prod.prodId}.webp`;
        });
        this.machineData = Array.from(new Set(this.Productsbygenie.map(obj => obj.rackId)))
        .map(rackId => this.Productsbygenie.find(obj => obj.rackId === rackId));
        this.machineData.forEach((obj)=>{
          obj['Productsbygenie']= [];
        });
        this.machineData.forEach((headObj)=>{
          this.Productsbygenie.forEach((dataObj)=>{
            if(headObj.rackId === dataObj.rackId){
              headObj.Productsbygenie.push(dataObj);
            }
          })
        });
        // sorting in ascending order
        this.machineData.sort((a, b) => a.rackId - b.rackId); // ascending order
        this.machineData.forEach((rack)=>{
            rack.Productsbygenie.sort((a,b)=> a.slotId - b.slotId);
        });
      
        this.addAlphabetToSubcatIds();
        this.calculateTotalAmount();
        this.calculateTotalItems();
        let orderPayload: any = {};
        const currentDate = new Date();


currentDate.setDate(currentDate.getDate());
currentDate.setHours(0, 0, 1, 0);
const startDate = formatDate(currentDate, 'YYYY-MM-dd HH:mm:ss', this.locale);

//         const startDate = formatDate(
//   new Date().setHours(0, 0, 0, 0),
//   'YYYY-MM-dd HH:mm:ss',
//   this.locale
// );

const finalEndDate = formatDate(
  new Date().setHours(23, 59, 59, 999),
  'YYYY-MM-dd HH:mm:ss',
  this.locale
);

        orderPayload['startDate'] = startDate;
        orderPayload['endDate'] = finalEndDate;
        orderPayload['vendorId'] = this.vendorId;
         const resp = await this.service.fetchRequestPost(
            'rest/order/OrderCollection',
            orderPayload
        );
        this.orders = resp['orders'];
       
        let value = Number(this.selectedValue)
        // console.log(this.configDetails,"ConfigDetails");
        const genieresp = await this.service.fetchRequest(
          'geniemanagement/getAllGenieManagement'
      );
      
      this.configDetails = genieresp['genieManagementList'];
      //   const genieId =  this.configDetails.find(sales => sales.stallId == value);
      //   console.log("genieId:", genieId);
  //       const filteredData = this.orders.filter(orders => {
  //         let orderDate = new Date(orders.orderDateTime); 
  // return orderDate = new Date(startDate);
  //       })
      
        // const filteredSalesAmountData = filteredData.filter(sales =>sales.stallId == this.selectedValue)
        // this.filteredSalesAmountData = filteredData.forEach(sales =>{
        //  this.configDetails.forEach(config =>{
        //   if(sales.stallId === config.stallId){
        //     sales.genieId == config.autoGenieId
        //   }
        //    });
         
        //   })
        
        //  this.todaySaleAmount = this.Productsbygenie.reduce((total, saleAmount) => {

        //   return total + saleAmount.amount;
        // }, 0);
        // this.totalSaleQty =  this.Productsbygenie.reduce((total, obj) => {
        //   return total + (obj.filledQuantity - obj.balanceCountInStall * obj.salePrice);
        // }, 0);
        
        // console.log(this.totalSaleQty);
        this.totalSaleQty = 0;


    this.Productsbygenie.forEach((product) => {
      
        // Match found, perform some action
        // For example, you can add the desired values to totalSaleQty
        this.todaySaleAmount += product.saleQuantity * product.salePrice;
        this.totalSaleQty += product.saleQuantity;
        this.totalSaleMarginAmount += product.saleQuantity*(product.salePrice-product.purchasePrice)
     
    });

this.totalSaleMarginAmount = parseFloat(this.totalSaleMarginAmount.toFixed(2));
console.log(this.totalSaleQty);
console.log(this.totalSaleMarginAmount);
this.SelectedGenieId = this.configDetails.find((obj)=>{
  if(obj.stallId==selectedValue) return obj.autoGenieId
})
console.log("SelectedGenieId",this.SelectedGenieId.autoGenieId);
this.refillorderId = 0;
//getting data from refillorder service
// this.selectedRefill = this.Refillresp.find((obj)=>{
// if(obj.genieId==this.SelectedGenieId.autoGenieId){
//   return this.refillorderId = obj.idRefillOrd
// } 
// else {
//   this.refillorderId = 0;
// }
// });
console.log("selectedRefill",this.refillorderId);
this.genieId = this.orders.filter(sales=>sales.stallId ==value)
console.log(this.genieId,"gefinaldata")
        //  this.totalSaleQty = this.genieId.reduce((total, saleAmount) => {
          
        //   return  total + saleAmount.filledQuantity - saleAmount.balanceCountInStall * saleAmount.salePrice ;
        // }, 0);
        // saleAmount.orderItems?.length
        // console.log('Todays Sale Amount:', this.todaySaleAmount);
        // this.subcategoryTabChange(this.selectedItem);
      }
      calculateTotalAmount() {
      this.totalAmount=0;
      this.totalQtyAmount=0;
      this.totalMarginAmount=0;
      this.totalAvailableMarginAmount=0;
      this.todaySaleAmount = 0;
        this.totalAmount = this.Productsbygenie.reduce(
          (total, product) => total + product.offerprice * product.balanceCountInStall,
          0
        );
        console.log(this.totalAmount);
        this.totalQtyAmount = this.Productsbygenie.reduce(
          (total, product) => total + product.offerprice * product.allotedQuantity,
          0
        );
       
        this.totalMarginAmount = this.Productsbygenie.reduce(
          (total, product) => total + product.allotedQuantity * (product.salePrice - product.purchasePrice),
          0
        );
        this.totalMarginAmount = parseFloat(this.totalMarginAmount.toFixed(2));
        console.log(this.totalMarginAmount);
        this.totalAvailableMarginAmount = this.Productsbygenie.reduce(
          (total, product) => total + product.balanceCountInStall * (product.salePrice - product.purchasePrice),
          0
        );
        this.totalAvailableMarginAmount = parseFloat(this.totalAvailableMarginAmount.toFixed(2));
        console.log(this.totalAvailableMarginAmount);
        // this.todaySaleAmount = this.Productsbygenie.reduce(
        //   (total, product) => total + (product.filledQuantity - product.balanceCountInStall )*(product.salePrice),
        //   0
        // );
        // console.log("todaySaleAmount",this.todaySaleAmount)
      }
      calculateTotalItems(){
       this.totalInvItems=0;
       this.totalInvAvailableQuantity=0;
        this.totalInvEmptyQuantity=0;
        this.totalInvMaxQuantity=0;
        this.totalInvSlots=0;
        this.totalResvItems=0;
        this.totalResvAmount=0;

        this.totalInvItems =  this.Productsbygenie.length;
        console.log(this.totalInvItems);
        this.totalInvAvailableQuantity = this.Productsbygenie.reduce(
          (total, product) => total+product.balanceCountInStall,0
        )
        console.log(this.totalInvAvailableQuantity)
        this.totalInvEmptyQuantity = this.Productsbygenie.reduce(
          (total, product) => total + product.allotedQuantity - product.balanceCountInStall - product.reservedQty,0
        )
        console.log(this.totalInvEmptyQuantity)
        this.totalInvMaxQuantity = this.Productsbygenie.reduce(
          (total, product) => total + product.allotedQuantity ,0
        )
        console.log(this.totalInvMaxQuantity)
        this.totalInvSlots = this.Productsbygenie.reduce(
          (total, product) => total + product.slotId ,0
        )
        console.log(this.totalInvSlots)
        this.totalResvItems = this.Productsbygenie.reduce(
          (total, product) => total + product.reservedQty ,0
        )
        console.log(this.totalResvItems)
        this.totalResvAmount = this.Productsbygenie.reduce(
          (total, product) => {
            if (product.reservedQty > 0) {
             return total + product.salePrice; 
            }
            return total;
          },
          0
        )
        console.log(this.totalResvAmount)
        
      }
      

      private processProductItems() {
        this.productsList.forEach((element, index) => {
          // console.log("element",element.variants);
          var variantsObjs = element?.variants;
          if (!Array.isArray(variantsObjs)) {
            element.variants = [variantsObjs];
          }

          if(element.productInCart.toString() == 'true'){
            element.isShown = true;
            var defualtObj = element.variants?.find((item) => (element.itemUomInCart == item.uom));
            if(defualtObj) {
              element.uom = defualtObj?.uom;
              element.mrpPrice = defualtObj?.mrpPrice;
              element.offerPrice = defualtObj?.offerPrice;
              element.itemCount = parseInt(element?.itemQuantityInCart);
              element.totalPrice = element.itemCount * element.offerPrice;
            }

          } else {
            element.isShown = false;
            var defualtObj = element.variants?.find((item) => item.default.toString() == 'true');
            if (defualtObj) {
              element.uom = defualtObj?.uom;
              element.mrpPrice = defualtObj?.mrpPrice;
              element.offerPrice = defualtObj?.offerPrice;
              element.itemCount = parseInt(element?.itemQuantityInCart);
              element.totalPrice = element.itemCount * element.offerPrice;
            }
          }

          // element.itemCount = 0;
        });

      }
      // subcategoryTabChange(selectedItem) {
      //   this.machineData.forEach((subcat)=>{
      //     subcat.active=false;
      //   })
      //   // selectedTab.active = !selectedTab.active;
      //   const subcategoryDiv = document.getElementById(`subcat-head-${selectedItem.rackId}`);
      //   const containerDiv = document.getElementById("subcat-products-id");

      //   const scrollPosition = subcategoryDiv.offsetTop - containerDiv.offsetTop;

      // // Scroll the container to the calculated scroll position
      // containerDiv.scrollTop = scrollPosition;
      // }
  }



