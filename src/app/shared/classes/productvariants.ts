export interface ProductVariant {
    prodVariantsId?:number;
    prodId?: number;
    uom?: string;
    mrpPrice?: number;
    offerPrice?: number;
    gst?: number;
    default?: boolean;

}