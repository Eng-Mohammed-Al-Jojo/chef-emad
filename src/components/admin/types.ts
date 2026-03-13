// types.ts
export type PopupType =
  | "logout"
  | "addCategory"
  | "deleteCategory"
  | "editItem"
  | "deleteItem"
  | null;

export interface PopupState {
  type: PopupType;
  id?: string;
  editItemValues?: {
    itemName: string;
    itemPrice: string;
    selectedCategory: string;
    itemIngredients: string;
  };
}

export interface Category {
  id: string;
  order?: number;
  name: string;
  createdAt: number;
  available?: boolean;
}

export interface Item {
  id: string;
  image?: string;
  name: string;
  price: string;
  priceTw?: string;
  ingredients?: string;
  categoryId: string;
  visible: boolean;
  createdAt: number;
  star?: boolean;
}

export interface OrderSettings {
  inRestaurant: boolean;
  takeaway: boolean;
  inPhone: string;
  outPhone: string;
}

export interface FooterInfo {
  address: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
}

export interface Settings {
  orderSystem: boolean;
  orderSettings: OrderSettings;
  complaintsWhatsapp: string;
  footerInfo: FooterInfo;
}
