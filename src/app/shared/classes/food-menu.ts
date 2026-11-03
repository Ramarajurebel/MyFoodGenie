import { FoodMenuRcps } from './food-menu-rcps';

export interface FoodMenu {
    menuId?: number;
    menuName?: string;
    category?: string;
    frequency?: string;
    day?: string;
    date?: string;
    status?: string;
    totalNoOfRecipes?: number;
    type?: string;
    childItems?: FoodMenuRcps[];
    childActive?: boolean;
    vendorId?: number;
}
