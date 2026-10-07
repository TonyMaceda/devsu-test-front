import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CuentaService } from '../../../services/cuenta';
import { Cuenta } from '../../../models/cuenta.model';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cuenta-list',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink],
  templateUrl: './cuenta-list.html',
  styleUrl: './cuenta-list.css',
})
export class CuentaList implements OnInit {
  private cuentaService = inject(CuentaService);
  private router = inject(Router);

  cuentas = signal<Cuenta[]>([]);
  errorMsg = signal<string | null>(null);
  busqueda = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cuentaService.getAll().subscribe({
      next: (data) => this.cuentas.set(data),
      error: () => this.errorMsg.set('No se pudo cargar la lista de cuentas'),
    });
  }

  buscar(): void {
    this.cuentaService.getAll(this.busqueda || undefined).subscribe({
      next: (data) => this.cuentas.set(data),
      error: () => this.errorMsg.set('Error al buscar cuentas'),
    });
  }

  editar(numeroCuenta: number): void {
    this.router.navigate(['/cuentas', numeroCuenta, 'editar']);
  }

  eliminar(numeroCuenta: number): void {
    if (!confirm('¿Eliminar esta cuenta?')) return;
    this.cuentaService.delete(numeroCuenta).subscribe({
      next: () => this.cargar(),
      error: (err) => this.errorMsg.set(err.error?.mensaje ?? 'No se pudo eliminar la cuenta'),
    });
  }
}
