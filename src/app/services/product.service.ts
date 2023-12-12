import { Injectable } from '@angular/core';
import { Observable, of, take } from 'rxjs';
import { Product } from '../models/product.model';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Observable<Product[]>;

  private productCollection: AngularFirestoreCollection<Product>;



  constructor(private firestore: AngularFirestore) {
    /*
    this.products.push({
      name: "Aguacate",
      price: 100,
      description: "Lorem ipsum dolor sit amet.",
      type: "Frutas y Verduras",
      photo: "https://picsum.photos/500/300?random",
    });
    this.products.push({
      name: "Coca Cola",
      price: 20,
      description: "Lorem ipsum dolor sit amet.",
      type: "Abarrotes",
      photo: "https://picsum.photos/500/300?random"
    });
    this.products.push({
      name: "Jabón Zote",
      price: 40,
      description: "Lorem ipsum dolor sit amet.",
      type: "Limpieza",
      photo: "https://picsum.photos/500/300?random"
    });
    this.products.push({
      name: "Aspirina",
      price: 50,
      description: "Lorem ipsum dolor sit amet.",
      type: "Farmacia",
      photo: "https://picsum.photos/500/300?random"
    });*/
    this.productCollection = this.firestore.collection<Product>('products'); 
    this.products = this.productCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Product;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );

  }

  saveProduct(product: Product): Promise<string> {
    /*
    this.products.push(product);
    return of(product);*/
    return this.productCollection.add(product)
    .then((doc)=>{
      console.log("Se agrego el producto: "+ doc.id);

      return "success";
    })
    .catch((error)=>{
      console.log("Error al agregar el producto: "+ error);
      return "error";
    })
  }



updateProduct( value: string, updatedData: Partial<Product>): Promise<string> {

  const fieldName = 'name';
  return this.productCollection.ref.where(fieldName, '==', value).get()
    .then((querySnapshot) => {

      if (querySnapshot.size === 0) {
        console.log('No se encontraron documentos con el campo y valor especificados.');
        return 'not_found';
      }

      const updatePromises: Promise<void>[] = [];
      querySnapshot.forEach((doc) => {
        updatePromises.push(doc.ref.update(updatedData));
      });


      return Promise.all(updatePromises)
        .then(() => {
          console.log('Productos actualizados con éxito.');
          return 'success';
        })
        .catch((error) => {
          console.error('Error al actualizar productos:', error);
          return 'error';
        });
    })
    .catch((error) => {
      console.error('Error al buscar documentos para actualizar:', error);
      return 'error';
    });
}


removeProduct(id: string | undefined): Promise<void> {
  return this.productCollection.doc(id).delete();
}


  getProducts(): Observable<Product[]> {
    //return of(this.products);
    return this.products;
  }
}
