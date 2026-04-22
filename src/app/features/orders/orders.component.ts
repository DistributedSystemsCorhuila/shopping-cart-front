import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal
} from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  private svc   = inject(OrderService);
  private toast = inject(ToastService);

  protected orders  = signal<Order[]>([]);
  protected loading = signal(false);
  protected detail  = signal<Order | null>(null);

  protected readonly statuses: OrderStatus[] = ['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: data => { this.orders.set(data ?? []); this.loading.set(false); },
      error: () => { this.toast.error('Error', 'No se pudo cargar las órdenes'); this.loading.set(false); }
    });
  }

  viewDetail(order: Order): void { this.detail.set(order); }
  closeDetail(): void { this.detail.set(null); }

  updateStatus(order: Order, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as OrderStatus;
    if (!order.id || status === order.status) return;
    this.svc.updateStatus(order.id, status).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        if (this.detail()?.id === updated.id) this.detail.set(updated);
        this.toast.success('Estado actualizado', `Orden #${order.id} → ${status}`);
      },
      error: () => this.toast.error('Error al actualizar estado')
    });
  }

  protected badgeClass(status?: OrderStatus): string {
    const map: Record<string, string> = {
      PENDING:   'badge badge-warning',
      CONFIRMED: 'badge badge-info',
      SHIPPED:   'badge badge-purple',
      DELIVERED: 'badge badge-success',
      CANCELLED: 'badge badge-danger',
    };
    return map[status ?? ''] ?? 'badge badge-gray';
  }

  protected statusLabel(status?: OrderStatus): string {
    const map: Record<string, string> = {
      PENDING:   'Pendiente',
      CONFIRMED: 'Confirmada',
      SHIPPED:   'Enviada',
      DELIVERED: 'Entregada',
      CANCELLED: 'Cancelada',
    };
    return map[status ?? ''] ?? (status ?? '—');
  }

  protected formatCOP(n?: number): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
  }

  protected formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
