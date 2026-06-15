import { Injectable } from '@nestjs/common';
import { ProductDto } from './product.dto';

@Injectable()
export class AppService {
  private products: ProductDto[]=[
    {
      id: 1,
      name: 'Laptop HP',
      price: 850,
      stock: 15
    },
    {
      id: 2,
      name: 'Laptop DELL',
      price: 950,
      stock: 20
    },

  ]

  getHealth(): any {
    return {
      "status": "Online",
      "service": "Blog service api",
      "version": "0.0.1",
      "date": new Date()
    };
  }

  CreteProducto(product: ProductDto): ProductDto {
    const newProduct: ProductDto={
      id: Math.random(),
      ...product
    }
    this.products.push(newProduct);
    return {
      "id": product.id,
      "name": product.name,
      "price": product.price,
      "stock":product.stock
    };
  }

  findAll(): ProductDto[]{
    return this.products
  }

  findById(id: string): ProductDto{
    return this.products!
      .find(product=>product.id===Number(id))!;
  }

  update(id: string, updatedProductDto: ProductDto): any{
    const product : ProductDto = this.products!
      .find(product=>product.id===Number(id))!;
    if (!product){
      return;
    }
    Object.assign(product,updatedProductDto)
  }

  deleteById(id: string): any{
    const index= this.products!
      .findIndex(product=>product.id===Number(id))!;
    if (index ===-1){
      return;
    }
    const deletedProduct=this.products[index]
    this.products.splice(index,1);
    return deletedProduct
  }

  areaTriangulo(data: any): any {
    const area = (data.base * data.altura)/2;
    return {
        "base": data.base,
        "altura": data.altura,
        "areaTriangulo": area,
    };
  }
}
