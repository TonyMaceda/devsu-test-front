import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CuentaService } from '../../../services/cuenta';
import { ActivatedRoute, Router } from '@angular/router';
import { Cuenta } from '../../../models/cuenta.model';

@Component({
  selector: 'app-cuenta-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cuenta-form.html',
  styleUrl: './cuenta-form.css',
})
export class CuentaForm implements OnInit {
  private fb = inject(FormBuilder);
  private cuentaService = inject(CuentaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  errorMsg = signal<string | null>(null);
  esEdicion = signal(false);
  numeroCuentaOriginal = signal<number | null>(null);

  form = this.fb.group({
    numeroCuenta: [null as number | null, Validators.required],
    tipoCuenta: ['', Validators.required],
    saldoInicial: [0, [Validators.required, Validators.min(0)]],
    clienteId: ['', Validators.required],
    estado: [true],
  });

  ngOnInit(): void {
    const numeroParam = this.route.snapshot.paramMap.get('numeroCuenta');
    if (numeroParam) {
      this.esEdicion.set(true);
      this.numeroCuentaOriginal.set(Number(numeroParam));
      this.cuentaService.getByNumero(Number(numeroParam)).subscribe({
        next: (cuenta) => this.form.patchValue(cuenta),
        error: () => this.errorMsg.set('No se pudo cargar la cuenta'),
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) return;
    const dto = this.form.getRawValue() as Cuenta;

    const request$ = this.esEdicion()
      ? this.cuentaService.update(this.numeroCuentaOriginal()!, dto)
      : this.cuentaService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/cuentas']),
      error: (err) => this.errorMsg.set(err.error?.mensaje ?? 'Error al guardar la cuenta'),
    });
  }

  cancelar(): void {
    this.router.navigate(['/cuentas']);
  }
}
