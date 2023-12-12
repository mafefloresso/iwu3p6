import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { iEdit } from '../tab1/tab1.page';
import { productEdit } from '../tab1/tab1.page';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.page.html',
  styleUrls: ['./update-product.page.scss'],
})
export class UpdateProductPage {

  public productForm: FormGroup;

  public productEdit = productEdit;
  public iEdit = iEdit;

  constructor(
    private fomBuilder: FormBuilder,
    private productService: ProductService,
    private toastController: ToastController,
    private router: Router
  ) {

    this.productForm = this.fomBuilder.group({
      name: [productEdit.name, Validators.required],
      price: [productEdit.price, Validators.required],
      description: [productEdit.description],
      photo: [productEdit.photo, Validators.required],
      type: [productEdit.type, Validators.required],
    });
  } 

  public async updateProduct() {
    const product = this.productForm.value;
  
    try {
      await this.productService.updateProduct(product.name, product);
      const toast = await this.toastController.create({
        message: 'Producto actualizado',
        duration: 2000,
        position: 'bottom'
      });
  
      toast.present();
      this.router.navigate(['/tabs/tab1']);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      // Manejar el error de actualización aquí
    }
  }
}
