export interface Addon {
  id: string
  name: string
  price: number
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  ingredients: string[]
  allergens: string[]
  addons: Addon[]
  tags?: string[]
  isSpicy?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
}

export interface Category {
  id: string
  name: string
  items: MenuItem[]
}

export interface Restaurant {
  name: string
  logo: string
  description: string
  welcomeText: string
  subtitle: string
}

export interface MenuData {
  restaurant: Restaurant
  categories: Category[]
}

export interface OrderAddon extends Addon {
  quantity: number
}

export interface OrderLineItem {
  id: string
  menuItemId: string
  name: string
  basePrice: number
  addons: OrderAddon[]
  quantity: number
}

export interface Order {
  id: string
  items: OrderLineItem[]
  createdAt: string
}

export type Screen = 'menu' | 'detail' | 'cart' | 'waiting'
