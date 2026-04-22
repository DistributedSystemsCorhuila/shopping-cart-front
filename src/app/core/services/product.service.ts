import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';

const BASE = 'http://localhost:8080/api/v1/products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  getAll(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(BASE).pipe(map(r => r.data));
  }

  getActive(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${BASE}/active`).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${BASE}/${id}`).pipe(map(r => r.data));
  }

  create(product: Product): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(BASE, product).pipe(map(r => r.data));
  }

  update(id: number, product: Product): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(`${BASE}/${id}`, product).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }
}
