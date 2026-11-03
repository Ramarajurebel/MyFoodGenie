import { orderitem } from './orderitem';

export type vmspayloadType = {
   
    startdate?: number,
    enddate?: number,
    limit?: number,
    machineId?: string,
    isOrders: boolean;
    status?: string
}
export interface Orders {
    totalOrderMargin: number;
    dispenseTime?:any;
    formattedDateTime?: string;
    dispenseTransId?: any;
    dispenseStatus?: any;
    orderId?: number;
    accountId?: string;
    billingAddressName?: string;
    shippingAddressName?: string;
    amount?: number;
    totalDiscount?: number;
    mobileno?: string;
    orderDateTime?: any;
    orderTime?: any;
    deliveryDateTime?: any;
    paymentMode?: string;
    paymentStatus?: string;
    orderStatus?: string;
    paymentAmount?: number;
    subId?: string;
    deliverCharges?: number;
    orderItemCount?: number;
    mangodCat?: any;
    shopId?: number;
    vendorId?: number;
    orderItems?: orderitem[];
    selectedIndex?: number;
    customerName?: string;
    trackingId?: string;
    trackingUrl?: string;
    userRole?: string;
    statusedit?: boolean;
    assignedTo?: string;
    stallId?: number;
    stallName?: string;
    subCatId?: number;
    subCatName?: string;
    partnerName?: string;
    partnerOrderId?: string;
    partnerStatus?: string;
    txtToSpeech?: string;
    genieId?: number;
    genieName?: string;
    
}
