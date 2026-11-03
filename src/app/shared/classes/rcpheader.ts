import { RecipeItems } from './recipeItems';

export interface Recipes {
    rcpItems: RecipeItems[];
    rcpid: number;
    name: string;
    description: any;
    uom: string;
    minduration: number;
    minquantity: number;
    isnv: boolean;
    platterscount: number;
    category: string;
    mainingredientsquantity: number;
    outputquantity: number;
    bowlsize: any;
    cookingtype: string;
    instructions: string;
    totalingr: number;
    totalcost: number;
    tname: string;
    cookertime: number;
    whistles: number;
    menurcpid: number;
    groupid: number;
    childActive?: boolean;
    isEdit?: boolean;
    noofpieces?: number;
    piecesipqty?: number;
    verified?: boolean;
    verifiedby?: string;
    catName?: string;
}
