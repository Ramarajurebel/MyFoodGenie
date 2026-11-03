export interface orderitem {
    dispenseStatus: any;
    itemId?: number;
    orderId?: number;
    itemName?: string;
    quantity?: number;
    itemPrice?: number;
    totalPrice?: number;
    discountAmount?: number;
    shopId?: number;
    vendorId?: number;
    uom?: string;
    itemImage?: string;
    itemLoc?: string;
    gst?: number;
    gstAmount?: number;
    itemImgLoc?: string;
    rackId?: number;
    slotId?: number;
    orderItemAutoId?: number;
}
