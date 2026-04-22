import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order, OrderStatus } from '../models/order.model';
import { ApiResponse } from '../models/api-response.model';

const BASE = 'http://localhost:8080/api/v1/orders';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  checkout(cartId: number): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(`${BASE}/checkout/${cartId}`, {}).pipe(map(r => r.data));
  }

  getAll(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(BASE).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${BASE}/${id}`).pipe(map(r => r.data));
  }

  getByCustomer(customerId: number): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${BASE}/customer/${customerId}`).pipe(map(r => r.data));
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<ApiResponse<Order>>(`${BASE}/${id}/status?status=${status}`, {}).pipe(map(r => r.data));
  }
}
