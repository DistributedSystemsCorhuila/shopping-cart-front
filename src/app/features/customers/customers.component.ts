import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { ToastService } from '../../core/services/toast.service';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-customers',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customers.component.html',
})
export class CustomersComponent implements OnInit {
  private svc = inject(CustomerService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  protected customers = signal<Customer[]>([]);
  protected loading = signal(false);
  protected saving = signal(false);
  protected showModal = signal(false);
  protected editingId = signal<number | null>(null);
  protected deleteTarget = signal<Customer | null>(null);

  protected form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    phone:   ['', Validators.required],
    address: ['', Validators.required],
  });

  protected modalTitle = computed(() => this.editingId() ? 'Editar Cliente' : 'Nuevo Cliente');

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: data => { this.customers.set(data ?? []); this.loading.set(false); },
      error: () => { this.toast.error('Error', 'No se pudo cargar los clientes'); this.loading.set(false); }
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', email: '', phone: '', address: '' });
    this.showModal.set(true);
  }

  openEdit(c: Customer): void {
    this.editingId.set(c.id!);
    this.form.setValue({ name: c.name, email: c.email, phone: c.phone, address: c.address });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const val = this.form.getRawValue() as Customer;
    this.saving.set(true);
    const id = this.editingId();
    const req = id ? this.svc.update(id, val) : this.svc.create(val);
    req.subscribe({
      next: () => {
        this.toast.success(id ? 'Cliente actualizado' : 'Cliente registrado');
        this.saving.set(false);
        this.closeModal();
        this.load();
      },
      error: () => { this.toast.error('Error al guardar'); this.saving.set(false); }
    });
  }

  confirmDelete(c: Customer): void { this.deleteTarget.set(c); }
  cancelDelete(): void { this.deleteTarget.set(null); }

  doDelete(): void {
    const c = this.deleteTarget();
    if (!c?.id) return;
    this.svc.delete(c.id).subscribe({
      next: () => { this.toast.success('Cliente eliminado'); this.deleteTarget.set(null); this.load(); },
      error: () => { this.toast.error('Error al eliminar'); this.deleteTarget.set(null); }
    });
  }

  protected fieldError(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
