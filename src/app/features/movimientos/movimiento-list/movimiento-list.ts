import { Component, inject, signal } from '@angular/core';
import { MovimientoService } from '../../../services/movimiento';
import { Movimiento } from '../../../models/movimiento.model';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-movimiento-list',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink],
  templateUrl: './movimiento-list.html',
  styleUrl: './movimiento-list.css',
})
export class MovimientoList {
  private movimientoService = inject(MovimientoService);

  numeroCuenta: number | null = null;
  movimientos = signal<Movimiento[]>([]);
  errorMsg = signal<string | null>(null);
  consultado = signal(false);

  buscar(): void {
    if (!this.numeroCuenta) {
      this.errorMsg.set('Ingrese un número de cuenta');
      return;
    }
    this.errorMsg.set(null);
    this.movimientoService.getByCuenta(this.numeroCuenta).subscribe({
      next: (data) => {
        this.movimientos.set(data);
        this.consultado.set(true);
      },
      error: (err) => this.errorMsg.set(err.error?.mensaje ?? 'Error al consultar movimientos'),
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este movimiento? Esto revertirá su efecto sobre el saldo.')) return;
    this.movimientoService.delete(id).subscribe({
      next: () => this.buscar(),
      error: (err) => this.errorMsg.set(err.error?.mensaje ?? 'No se pudo eliminar el movimiento'),
    });
  }
}
