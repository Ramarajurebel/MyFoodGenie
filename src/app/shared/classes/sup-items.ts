export interface SupItems {
    // gst: any;
    supItemId: number;
    quantity: number;
    uom: string;
    productId: string;
    productname: string;
    gst: number;
    supid: number;
    supname: string;
    tname: any;
    quom: number;
    muom: string;
    supItems: SupItems[];
    childArrayActive: boolean;
    salePrice: number;
    
    purchasePrice: number,
    purchaseTax: number,
    saleTax: number,
    cess: number,
    margin: number,
    startDate: string,
    endDate: string,
    availableStock: number,
    packedDate: string,
    expiryInDays: number,
}
