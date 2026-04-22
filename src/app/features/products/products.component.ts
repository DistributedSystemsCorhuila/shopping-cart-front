import {
  ChangeDetectionStrategy, Component, inject, OnInit,
  signal, computed
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  private svc = inject(ProductService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  protected products = signal<Product[]>([]);
  protected loading = signal(false);
  protected saving = signal(false);
  protected showModal = signal(false);
  protected editingId = signal<number | null>(null);
  protected deleteTarget = signal<Product | null>(null);

  protected form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: ['', Validators.required],
    price:       [0,  [Validators.required, Validators.min(1)]],
    stock:       [0,  [Validators.required, Validators.min(0)]],
  });

  protected modalTitle = computed(() => this.editingId() ? 'Editar Producto' : 'Nuevo Producto');
  protected totalActive = computed(() => this.products().filter(p => p.active !== false).length);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: data => { this.products.set(data ?? []); this.loading.set(false); },
      error: () => { this.toast.error('Error', 'No se pudo cargar los productos'); this.loading.set(false); }
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '', price: 0, stock: 0 });
    this.showModal.set(true);
  }

  openEdit(p: Product): void {
    this.editingId.set(p.id!);
    this.form.setValue({ name: p.name, description: p.description, price: p.price, stock: p.stock });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const val = this.form.getRawValue() as Product;
    this.saving.set(true);
    const id = this.editingId();
    const req = id ? this.svc.update(id, val) : this.svc.create(val);
    req.subscribe({
      next: () => {
        this.toast.success(id ? 'Producto actualizado' : 'Producto creado');
        this.saving.set(false);
        this.closeModal();
        this.load();
      },
      error: () => { this.toast.error('Error al guardar'); this.saving.set(false); }
    });
  }

  confirmDelete(p: Product): void { this.deleteTarget.set(p); }
  cancelDelete(): void { this.deleteTarget.set(null); }

  doDelete(): void {
    const p = this.deleteTarget();
    if (!p?.id) return;
    this.svc.delete(p.id).subscribe({
      next: () => { this.toast.success('Producto eliminado'); this.deleteTarget.set(null); this.load(); },
      error: () => { this.toast.error('Error al eliminar'); this.deleteTarget.set(null); }
    });
  }

  protected formatCOP(n: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
  }

  protected fieldError(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.invalid && c.touched);
  }
}
