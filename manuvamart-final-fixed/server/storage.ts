import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem
} from "@shared/schema";

// Interface for storage methods
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart Items
  getCartItems(userId: number): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private productIdCounter: number;
  private cartItemIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    
    // Add some initial data
    this.initializeData();
  }
  
  private initializeData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "password",
      fullName: "Admin User",
      email: "admin@example.com",
      role: "admin",
      avatar: undefined,
      balance: 1000
    });

    // Create demo user
    this.createUser({
      username: "user",
      password: "password",
      fullName: "Regular User",
      email: "user@example.com",
      role: "user",
      avatar: undefined,
      balance: 500
    });
    
    // Create categories
    const categories = [
      {
        name: "Credit Cards",
        description: "Various credit card options",
        image: "/images/credit-cards.jpg"
      },
      {
        name: "Bank Accounts",
        description: "Bank account services",
        image: "/images/bank-accounts.jpg"
      },
      {
        name: "PayPal",
        description: "PayPal related services",
        image: "/images/paypal.jpg"
      },
      {
        name: "Gift Cards",
        description: "Various gift card options",
        image: "/images/gift-cards.jpg"
      },
      {
        name: "Crypto",
        description: "Cryptocurrency services",
        image: "/images/crypto.jpg"
      }
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
    
    // Create products
    const products = [
      {
        name: "US Credit Card",
        description: "High quality USA credit card with verified balance",
        price: 100.00,
        stock: 50,
        image: "/images/us-credit-card.jpg",
        categoryId: 1,
        isActive: true
      },
      {
        name: "EU Credit Card",
        description: "Premium European credit card with verified balance",
        price: 120.00,
        stock: 30,
        image: "/images/eu-credit-card.jpg",
        categoryId: 1,
        isActive: true
      },
      {
        name: "US Bank Account",
        description: "Verified US bank account with online access",
        price: 200.00,
        stock: 15,
        image: "/images/us-bank.jpg",
        categoryId: 2,
        isActive: true
      },
      {
        name: "EU Bank Account",
        description: "Verified European bank account with online access",
        price: 250.00,
        stock: 10,
        image: "/images/eu-bank.jpg",
        categoryId: 2,
        isActive: true
      },
      {
        name: "Verified PayPal",
        description: "Fully verified PayPal account with balance",
        price: 150.00,
        stock: 20,
        image: "/images/paypal-verified.jpg",
        categoryId: 3,
        isActive: true
      },
      {
        name: "Amazon Gift Card",
        description: "$100 Amazon gift card, digital delivery",
        price: 80.00,
        stock: 100,
        image: "/images/amazon-gift.jpg",
        categoryId: 4,
        isActive: true
      },
      {
        name: "iTunes Gift Card",
        description: "$50 iTunes gift card, digital delivery",
        price: 40.00,
        stock: 75,
        image: "/images/itunes-gift.jpg",
        categoryId: 4,
        isActive: true
      },
      {
        name: "Bitcoin Wallet",
        description: "Bitcoin wallet with balance, full access",
        price: 300.00,
        stock: 5,
        image: "/images/bitcoin-wallet.jpg",
        categoryId: 5,
        isActive: true
      }
    ];
    
    products.forEach(product => {
      this.createProduct(product);
    });
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "user",
      balance: insertUser.balance || 0,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.isActive);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.categoryId === categoryId && product.isActive);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const newProduct: Product = { 
      ...product, 
      id, 
      isActive: product.isActive !== undefined ? product.isActive : true,
      createdAt: now,
      updatedAt: now
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const now = new Date();
    const updatedProduct = { 
      ...existingProduct, 
      ...product, 
      updatedAt: now 
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return false;
    
    // Soft delete (make inactive)
    existingProduct.isActive = false;
    this.products.set(id, existingProduct);
    return true;
  }
  
  // Cart Items
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
  }
  
  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if the product is already in the cart
    const existingCartItem = Array.from(this.cartItems.values())
      .find(item => item.userId === cartItem.userId && item.productId === cartItem.productId);
    
    if (existingCartItem) {
      // Update quantity
      return this.updateCartItemQuantity(
        existingCartItem.id,
        existingCartItem.quantity + (cartItem.quantity || 1)
      ) as Promise<CartItem>;
    }
    
    // Create new cart item
    const id = this.cartItemIdCounter++;
    const now = new Date();
    const newCartItem: CartItem = {
      ...cartItem,
      id,
      quantity: cartItem.quantity || 1,
      createdAt: now
    };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    // Remove if quantity becomes 0
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const cartItemIds = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.userId === userId)
      .map(([id, _]) => id);
    
    cartItemIds.forEach(id => this.cartItems.delete(id));
    return true;
  }
  
  // Orders
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const newOrder: Order = {
      ...order,
      id,
      status: order.status || "pending",
      createdAt: now,
      updatedAt: now
    };
    
    this.orders.set(id, newOrder);
    
    // Create order items
    items.forEach(item => {
      const orderItemId = this.orderItemIdCounter++;
      const orderItem: OrderItem = {
        ...item,
        id: orderItemId,
        orderId: id
      };
      this.orderItems.set(orderItemId, orderItem);
      
      // Update product stock
      const product = this.products.get(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        this.products.set(product.id, product);
      }
    });
    
    // Clear user's cart
    this.clearCart(order.userId);
    
    return newOrder;
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const now = new Date();
    const updatedOrder = { 
      ...order, 
      status, 
      updatedAt: now 
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }
}

export const storage = new MemStorage();
