import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer } from '../models/customer.model';
import { ApiResponse } from '../models/api-response.model';

const BASE = 'http://localhost:8080/api/v1/customers';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);

  getAll(): Observable<Customer[]> {
    return this.http.get<ApiResponse<Customer[]>>(BASE).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<ApiResponse<Customer>>(`${BASE}/${id}`).pipe(map(r => r.data));
  }

  create(customer: Customer): Observable<Customer> {
    return this.http.post<ApiResponse<Customer>>(BASE, customer).pipe(map(r => r.data));
  }

  update(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<ApiResponse<Customer>>(`${BASE}/${id}`, customer).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }
}
