import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, effect
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { CustomerService } from '../../core/services/customer.service';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart, CartItem } from '../../core/models/cart.model';
import { Customer } from '../../core/models/customer.model';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-cart',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  private cartSvc    = inject(CartService);
  private customerSvc = inject(CustomerService);
  private productSvc = inject(ProductService);
  private orderSvc   = inject(OrderService);
  private toast      = inject(ToastService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private fb         = inject(FormBuilder);

  protected customers = signal<Customer[]>([]);
  protected products  = signal<Product[]>([]);
  protected cart      = signal<Cart | null>(null);
  protected selectedCustomerId = signal<number | null>(null);

  protected loadingCustomers = signal(false);
  protected loadingCart      = signal(false);
  protected savingItem       = signal(false);
  protected checkingOut      = signal(false);
  protected clearingCart     = signal(false);

  protected addForm = this.fb.group({
    productId: [null as number | null, Validators.required],
    quantity:  [1, [Validators.required, Validators.min(1)]],
  });

  protected selectedCustomer = computed(() =>
    this.customers().find(c => c.id === this.selectedCustomerId()) ?? null
  );

  protected discountPct = computed(() => {
    const total = this.cart()?.totalAmount ?? 0;
    if (total >= 300000) return 15;
    if (total >= 100000) return 10;
    return 0;
  });

  protected discountAmount = computed(() =>
    (this.cart()?.totalAmount ?? 0) * this.discountPct() / 100
  );

  protected finalTotal = computed(() =>
    (this.cart()?.totalAmount ?? 0) - this.discountAmount()
  );

  ngOnInit(): void {
    this.loadCustomers();
    this.loadProducts();
    const paramId = this.route.snapshot.paramMap.get('customerId');
    if (paramId) {
      const id = Number(paramId);
      this.selectedCustomerId.set(id);
    }
  }

  private loadCustomers(): void {
    this.loadingCustomers.set(true);
    this.customerSvc.getAll().subscribe({
      next: data => {
        this.customers.set(data ?? []);
        this.loadingCustomers.set(false);
        const id = this.selectedCustomerId();
        if (id) this.loadCart(id);
      },
      error: () => this.loadingCustomers.set(false),
    });
  }

  private loadProducts(): void {
    this.productSvc.getActive().subscribe({
      next: data => this.products.set(data ?? []),
      error: () => {},
    });
  }

  selectCustomer(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    if (!id) { this.cart.set(null); this.selectedCustomerId.set(null); return; }
    this.selectedCustomerId.set(id);
    this.router.navigate(['/cart', id]);
    this.loadCart(id);
  }

  private loadCart(customerId: number): void {
    this.loadingCart.set(true);
    this.cartSvc.getOrCreateByCustomer(customerId).subscribe({
      next: data => { this.cart.set(data); this.loadingCart.set(false); },
      error: () => { this.toast.error('Error', 'No se pudo cargar el carrito'); this.loadingCart.set(false); }
    });
  }

  addItem(): void {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    const cartId = this.cart()?.id;
    if (!cartId) return;
    const { productId, quantity } = this.addForm.getRawValue();
    this.savingItem.set(true);
    this.cartSvc.addItem(cartId, { productId: productId!, quantity: quantity! }).subscribe({
      next: cart => { this.cart.set(cart); this.addForm.reset({ productId: null, quantity: 1 }); this.savingItem.set(false); this.toast.success('Producto agregado'); },
      error: () => { this.toast.error('Error al agregar'); this.savingItem.set(false); }
    });
  }

  updateQty(item: CartItem, delta: number): void {
    const cartId = this.cart()?.id;
    if (!cartId || !item.id) return;
    const newQty = (item.quantity ?? 1) + delta;
    if (newQty < 1) { this.removeItem(item); return; }
    this.cartSvc.updateItem(cartId, item.id, newQty).subscribe({
      next: cart => { this.cart.set(cart); },
      error: () => this.toast.error('Error al actualizar')
    });
  }

  removeItem(item: CartItem): void {
    const cartId = this.cart()?.id;
    if (!cartId || !item.id) return;
    this.cartSvc.removeItem(cartId, item.id).subscribe({
      next: cart => { this.cart.set(cart); this.toast.info('Ítem eliminado'); },
      error: () => this.toast.error('Error al eliminar')
    });
  }

  clearCart(): void {
    const cartId = this.cart()?.id;
    if (!cartId) return;
    this.clearingCart.set(true);
    this.cartSvc.clearCart(cartId).subscribe({
      next: cart => { this.cart.set(cart); this.clearingCart.set(false); this.toast.info('Carrito vaciado'); },
      error: () => { this.toast.error('Error al vaciar'); this.clearingCart.set(false); }
    });
  }

  checkout(): void {
    const cartId = this.cart()?.id;
    if (!cartId) return;
    this.checkingOut.set(true);
    this.orderSvc.checkout(cartId).subscribe({
      next: order => {
        this.checkingOut.set(false);
        this.toast.success('¡Checkout exitoso!', `Orden #${order.id} creada · Total: ${this.formatCOP(order.total ?? 0)}`);
        const custId = this.selectedCustomerId();
        if (custId) this.loadCart(custId);
      },
      error: () => { this.toast.error('Error al hacer checkout'); this.checkingOut.set(false); }
    });
  }

  protected formatCOP(n: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
  }

  protected productName(id: number): string {
    return this.products().find(p => p.id === id)?.name ?? `Producto #${id}`;
  }
}
