import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CustomerService } from '../../core/services/customer.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="topbar">
      <div class="topbar-left">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span class="topbar-title">Dashboard</span>
      </div>
      <span class="topbar-badge">Shopping Cart API</span>
    </div>

    <main class="page">
      <div class="page-header">
        <div>
          <h1 class="page-heading">Bienvenido</h1>
          <p class="page-desc">Resumen del sistema de carrito de compras</p>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="load()" [disabled]="loading()">
          @if (loading()) { <span class="spinner"></span> }
          @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          }
          Actualizar
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Productos</span>
            <div class="stat-icon stat-icon-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ stats().products }}</div>
          <div class="stat-trend">Total registrados</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Clientes</span>
            <div class="stat-icon stat-icon-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ stats().customers }}</div>
          <div class="stat-trend">Total registrados</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Órdenes</span>
            <div class="stat-icon stat-icon-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ stats().orders }}</div>
          <div class="stat-trend">Total generadas</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Pendientes</span>
            <div class="stat-icon stat-icon-warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ stats().pending }}</div>
          <div class="stat-trend">Órdenes PENDING</div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Acciones rápidas</span>
        </div>
        <div class="card-body">
          <div class="quick-actions">
            <a class="qa-card" routerLink="/products">
              <div class="qa-icon stat-icon-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <span class="qa-label">Nuevo Producto</span>
              <span class="qa-desc">Agregar al catálogo</span>
            </a>
            <a class="qa-card" routerLink="/customers">
              <div class="qa-icon stat-icon-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <span class="qa-label">Nuevo Cliente</span>
              <span class="qa-desc">Registrar cliente</span>
            </a>
            <a class="qa-card" routerLink="/cart">
              <div class="qa-icon stat-icon-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <span class="qa-label">Ir al Carrito</span>
              <span class="qa-desc">Gestionar ítems</span>
            </a>
            <a class="qa-card" routerLink="/orders">
              <div class="qa-icon stat-icon-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              </div>
              <span class="qa-label">Ver Órdenes</span>
              <span class="qa-desc">Gestionar estados</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Discount policy -->
      <div class="card" style="margin-top:1rem">
        <div class="card-header">
          <span class="card-title">Política de descuentos automáticos</span>
          <span class="badge badge-success">Activa</span>
        </div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Total del carrito</th>
                  <th>Descuento aplicado</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Menos de $100.000</td><td><span class="badge badge-gray">Sin descuento</span></td></tr>
                <tr><td>$100.000 – $299.999</td><td><span class="badge badge-warning">10%</span></td></tr>
                <tr><td>$300.000 o más</td><td><span class="badge badge-success">15%</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  `
})
export class DashboardComponent implements OnInit {
  private productSvc = inject(ProductService);
  private customerSvc = inject(CustomerService);
  private orderSvc = inject(OrderService);

  protected loading = signal(false);
  protected stats = signal({ products: 0, customers: 0, orders: 0, pending: 0 });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    forkJoin({
      products: this.productSvc.getAll(),
      customers: this.customerSvc.getAll(),
      orders: this.orderSvc.getAll(),
    }).subscribe({
      next: ({ products, customers, orders }) => {
        this.stats.set({
          products: products?.length ?? 0,
          customers: customers?.length ?? 0,
          orders: orders?.length ?? 0,
          pending: orders?.filter(o => o.status === 'PENDING').length ?? 0,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
