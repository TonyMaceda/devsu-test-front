import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClienteService } from '../../../services/cliente';
import { Cliente } from '../../../models/cliente.model';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
})
export class ClienteList implements OnInit {
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  clientes = signal<Cliente[]>([]);
  busqueda = '';
  errorMsg = signal<string | null>(null);

  ngOnInit() {
    this.cargar();
  }

  cargar(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: () => this.errorMsg.set('No se pudo cargar la lista de clientes'),
    });
  }

  buscar(): void {
    this.clienteService.getAll(this.busqueda || undefined).subscribe({
      next: (data) => this.clientes.set(data),
      error: () => this.errorMsg.set('Error al buscar clientes'),
    });
  }

  editar(id: number): void {
    this.router.navigate(['/clientes', id, 'editar']);
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este cliente?')) return;
    this.clienteService.delete(id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.errorMsg.set(err.error?.mensaje ?? 'No se pudo eliminar el cliente'),
    });
  }
}
