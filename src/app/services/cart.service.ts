import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import { Cart, Product, CartItem } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private products: Observable<Product[]>;

  private cartCollection: AngularFirestoreCollection<Product>;


  private cart: Cart = {
    items: [],
    total: 0,
    itemCount: 0
  };

  constructor(private firestore: AngularFirestore) { 
    this.cartCollection = this.firestore.collection<Product>('cart'); 
    this.products = this.cartCollection.valueChanges(); 
  }

  public getCart(): Cart {
    return this.cart;
  }

  public addToCart(product: Product): Cart {
    const existingCartItem = this.cart.items.find((item) => item.product.name === product.name);

    if (existingCartItem) {
      // El producto ya existe en el carrito, actualiza la cantidad
      existingCartItem.quantity += 1;
    } else {
      // El producto no existe en el carrito, agrégalo como un nuevo elemento
      const newItem: CartItem = {
        product: product,
        quantity: 1,
      };
      this.cart.items.push(newItem);
    }

    // Actualiza el total y la cantidad de artículos
    this.cart.total = this.calculateTotal(this.cart);
    this.cart.itemCount = this.calculateItemCount(this.cart);

    // Agrega el producto al carrito en Firebase
    this.addToFirebaseCart(product);

    return this.cart;
  }

  private calculateTotal(cart: Cart): number {
    return cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  private calculateItemCount(cart: Cart): number {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  }

  private addToFirebaseCart(product: Product): void {
    this.cartCollection.add(product);
  }

  public removeItemFromCart(item: CartItem, quantityToRemove: number) {
    const index = this.cart.items.findIndex((cartItem) => cartItem === item);
    if (index !== -1) {
      if (item.quantity > quantityToRemove) {
        item.quantity -= quantityToRemove;
      } else {
        // Si la cantidad a eliminar es igual o mayor que la cantidad en el carrito, elimina el elemento por completo.
        this.cart.items.splice(index, 1);
        
        // Elimina el producto correspondiente de la colección en Firebase
        this.removeFromFirebaseCart(item);
      }
  
      // Actualiza el total y la cantidad de artículos
      this.cart.total = this.calculateTotal(this.cart);
      this.cart.itemCount = this.calculateItemCount(this.cart);
    }
  }

  private removeFromFirebaseCart(item: CartItem): void {
    this.firestore.collection('cart', ref => ref.where('product.name', '==', item.product.name))
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(doc => {
          doc.ref.delete();
        });
      });
  }
}
