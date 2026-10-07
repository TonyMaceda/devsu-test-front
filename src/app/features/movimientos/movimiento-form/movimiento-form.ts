import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MovimientoService } from '../../../services/movimiento';
import { Movimiento } from '../../../models/movimiento.model';

@Component({
  selector: 'app-movimiento-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './movimiento-form.html',
  styleUrl: './movimiento-form.css',
})
export class MovimientoForm {
  private fb = inject(FormBuilder);
  private movimientoService = inject(MovimientoService);
  private router = inject(Router);

  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  form = this.fb.group({
    numeroCuenta: [null as number | null, Validators.required],
    tipoMovimiento: ['', Validators.required],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  registrar(): void {
    if (this.form.invalid) return;
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const dto = this.form.getRawValue() as Movimiento;

    this.movimientoService.create(dto).subscribe({
      next: () => {
        this.successMsg.set('Movimiento registrado correctamente');
        this.form.reset();
      },
      error: (err) => {
        // El backend devuelve exactamente "Saldo no disponible" o "Cupo diario Excedido"
        // en err.error.mensaje — se muestra tal cual, sin reinterpretar el texto.
        this.errorMsg.set(err.error?.mensaje ?? 'Error al registrar el movimiento');
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/movimientos']);
  }
}
