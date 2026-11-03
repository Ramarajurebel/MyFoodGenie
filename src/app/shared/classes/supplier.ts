import { SupItems } from './sup-items';

export interface Suppliers {
    supId: number;
    name: string;
    email: string;
    gstn: string;
    address: string;
    category: string;
    catname: string;
    status: string;
    itemsList: SupItems[];
    childActive: boolean;
}
