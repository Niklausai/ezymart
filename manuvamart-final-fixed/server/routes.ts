import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertCategorySchema,
  insertProductSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // HTML pages are now served by express.static middleware in index.ts
  // These routes are just fallbacks for direct access
  app.get("/", (req, res) => {
    console.log("Root path requested");
    res.sendFile("index.html", { root: path.join(process.cwd(), "manuvamart/public") });
  });
  
  app.get("/login.html", (req, res) => {
    console.log("Login page requested");
    res.sendFile("login.html", { root: path.join(process.cwd(), "manuvamart/public") });
  });
  
  app.get("/home.html", (req, res) => {
    console.log("Home page requested");
    res.sendFile("home.html", { root: path.join(process.cwd(), "manuvamart/public") });
  });
  
  app.get("/cart.html", (req, res) => {
    console.log("Cart page requested");
    res.sendFile("cart.html", { root: path.join(process.cwd(), "manuvamart/public") });
  });
  
  app.get("/checkout.html", (req, res) => {
    console.log("Checkout page requested");
    res.sendFile("checkout.html", { root: path.join(process.cwd(), "manuvamart/public") });
  });
  
  app.get("/orders.html", (req, res) => {
    console.log("Orders page requested");
    res.sendFile("orders.html", { root: path.join(process.cwd(), "manuvamart/public") });
  });
  
  app.get("/product.html", (req, res) => {
    console.log("Product page requested");
    res.sendFile("product.html", { root: path.join(process.cwd(), "manuvamart/public") });
  });

  // Authentication Routes
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userInput.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userInput);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      res.json({ user, message: "Login successful" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.put("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const userInput = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(userId, userInput);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Category Routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const category = await storage.getCategory(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const categoryInput = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryInput);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/categories/:id", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    try {
      const categoryInput = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(categoryId, categoryInput);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const deleted = await storage.deleteCategory(categoryId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.status(204).end();
  });

  // Product Routes
  app.get("/api/products", async (req: Request, res: Response) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await storage.getProduct(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });

  app.get("/api/categories/:categoryId/products", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const products = await storage.getProductsByCategory(categoryId);
    res.json(products);
  });

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const productInput = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productInput);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/products/:id", async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    try {
      const productInput = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(productId, productInput);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const deleted = await storage.deleteProduct(productId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(204).end();
  });

  // Cart Routes
  app.get("/api/users/:userId/cart", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const cartItems = await storage.getCartItems(userId);
      
      // Fetch product details for each cart item
      const cartWithProducts = await Promise.all(cartItems.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cart/items", async (req: Request, res: Response) => {
    try {
      const cartItemInput = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addCartItem(cartItemInput);
      
      // Include product details in the response
      const product = await storage.getProduct(cartItem.productId);
      
      res.status(201).json({
        ...cartItem,
        product
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/cart/items/:id/quantity", async (req: Request, res: Response) => {
    const cartItemId = parseInt(req.params.id);
    
    if (isNaN(cartItemId)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }
    
    const { quantity } = req.body;
    
    if (quantity === undefined || isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    
    try {
      const updatedCartItem = await storage.updateCartItemQuantity(cartItemId, quantity);
      
      if (!updatedCartItem) {
        if (quantity === 0) {
          // Item was removed because quantity was set to 0
          return res.status(204).end();
        }
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Include product details in the response
      const product = await storage.getProduct(updatedCartItem.productId);
      
      res.json({
        ...updatedCartItem,
        product
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cart/items/:id", async (req: Request, res: Response) => {
    const cartItemId = parseInt(req.params.id);
    
    if (isNaN(cartItemId)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }
    
    const deleted = await storage.removeCartItem(cartItemId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.status(204).end();
  });

  app.delete("/api/users/:userId/cart", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const cleared = await storage.clearCart(userId);
    
    if (!cleared) {
      return res.status(500).json({ message: "Failed to clear cart" });
    }
    
    res.status(204).end();
  });

  // Order Routes
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      if (!order || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order details and items are required" });
      }
      
      const orderInput = insertOrderSchema.parse(order);
      const orderItemsInput = items.map((item: any) => insertOrderItemSchema.parse(item));
      
      const createdOrder = await storage.createOrder(orderInput, orderItemsInput);
      
      // Get order items for the newly created order
      const orderItems = await storage.getOrderItems(createdOrder.id);
      
      res.status(201).json({
        ...createdOrder,
        items: orderItems
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const order = await storage.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Get order items
    const orderItems = await storage.getOrderItems(orderId);
    
    res.json({
      ...order,
      items: orderItems
    });
  });

  app.get("/api/users/:userId/orders", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const orders = await storage.getUserOrders(userId);
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const orderItems = await storage.getOrderItems(order.id);
      return {
        ...order,
        items: orderItems
      };
    }));
    
    res.json(ordersWithItems);
  });

  app.patch("/api/orders/:id/status", async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const { status } = req.body;
    
    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const updatedOrder = await storage.updateOrderStatus(orderId, status);
    
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Get order items
    const orderItems = await storage.getOrderItems(orderId);
    
    res.json({
      ...updatedOrder,
      items: orderItems
    });
  });

  return httpServer;
}
