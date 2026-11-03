export interface KitchenInventoryClass {
    kitchenInventoryId?: number;
    itemId?: string;
    category?: string;
    itemName?: string;
    purchasedDate?: string;
    uom?: string;
    availableQuantity?: number;
    saleQuantity?: number;
    saleDate?: any;
    balance?: number;
    isEdit?: boolean;
    checked?: boolean;
}
