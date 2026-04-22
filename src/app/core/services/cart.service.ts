import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cart, AddItemRequest } from '../models/cart.model';
import { ApiResponse } from '../models/api-response.model';

const BASE = 'http://localhost:8080/api/v1/carts';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);

  getOrCreateByCustomer(customerId: number): Observable<Cart> {
    return this.http.get<ApiResponse<Cart>>(`${BASE}/customer/${customerId}`).pipe(map(r => r.data));
  }

  getById(cartId: number): Observable<Cart> {
    return this.http.get<ApiResponse<Cart>>(`${BASE}/${cartId}`).pipe(map(r => r.data));
  }

  addItem(cartId: number, req: AddItemRequest): Observable<Cart> {
    return this.http.post<ApiResponse<Cart>>(`${BASE}/${cartId}/items`, req).pipe(map(r => r.data));
  }

  updateItem(cartId: number, itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<ApiResponse<Cart>>(`${BASE}/${cartId}/items/${itemId}?quantity=${quantity}`, {}).pipe(map(r => r.data));
  }

  removeItem(cartId: number, itemId: number): Observable<Cart> {
    return this.http.delete<ApiResponse<Cart>>(`${BASE}/${cartId}/items/${itemId}`).pipe(map(r => r.data));
  }

  clearCart(cartId: number): Observable<Cart> {
    return this.http.delete<ApiResponse<Cart>>(`${BASE}/${cartId}/items`).pipe(map(r => r.data));
  }
}
