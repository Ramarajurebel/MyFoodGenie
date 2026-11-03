import {ProductVariant} from './productvariants';
export interface productitems{
    purchasePrice: any;
    
    itemId: any;
    supname: string;
    rackId:number;
    emptyQty: number;
    allotedQuantity: number;
    catId?: number;
    subCatId?: string;
    description?: string;
    discount?: number;
    offerPrice?: number;
    mrpPrice?: number;
    prodId?: number;
    prodImage?: string;
    prodName?: string;
    rating?: number;
    shopId?: number;
    vendorId?: number;
    subscription?: boolean;
    uom?: string;
    isShown?: boolean;
    itemCount?: number;
    totalPrice?: number;
    cartId?: number;
    gst?: number,
    variants?: ProductVariant[];
    itemImgLoc?: string;
    accountId?: string;
    productInCart?: boolean;
    itemQuantityInCart?: string;
    itemUomInCart?: string;
    balanceCountInStall?: number;
}