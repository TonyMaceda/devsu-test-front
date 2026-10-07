import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../../services/cliente';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente } from '../../../models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css',
})
export class ClienteForm implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  errorMsg = signal<string | null>(null);
  clienteIdPk = signal<number | null>(null);
  esEdicion = signal(false);

  form = this.fb.group({
    nombre: ['', Validators.required],
    genero: ['', Validators.required],
    edad: [null as number | null, [Validators.required, Validators.min(18)]],
    identificacion: ['', Validators.required],
    direccion: ['', Validators.required],
    telefono: ['', Validators.required],
    clienteId: ['', Validators.required],
    contrasena: ['', Validators.required],
    estado: [true],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.esEdicion.set(true);
      this.clienteIdPk.set(Number(idParam));
      this.clienteService.getById(Number(idParam)).subscribe({
        next: (cliente) => {
          this.form.patchValue(cliente);
          this.form.get('contrasena')?.setValue('')
          this.form.get('contrasena')?.disable();
        },
        error: () => this.errorMsg.set('No se pudo cargar el cliente'),
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) return;
    const dto = this.form.getRawValue() as Cliente;

    const request$ = this.esEdicion()
      ? this.clienteService.update(this.clienteIdPk()!, dto)
      : this.clienteService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: (err) => this.errorMsg.set(err.error?.mensaje ?? 'Error al guardar el cliente'),
    });
  }

  cancelar(): void {
    this.router.navigate(['/clientes']);
  }
}
