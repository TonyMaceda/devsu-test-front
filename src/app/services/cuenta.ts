import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cuenta } from '../models/cuenta.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CuentaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/cuentas`;

  getAll(clienteId?: string): Observable<Cuenta[]> {
    const options = clienteId ? { params: { clienteId } } : {};
    return this.http.get<Cuenta[]>(this.baseUrl, options);
  }

  getByNumero(numeroCuenta: number): Observable<Cuenta> {
    return this.http.get<Cuenta>(`${this.baseUrl}/${numeroCuenta}`);
  }

  create(cuenta: Cuenta): Observable<Cuenta> {
    return this.http.post<Cuenta>(this.baseUrl, cuenta);
  }

  update(numeroCuenta: number, cuenta: Partial<Cuenta>): Observable<Cuenta> {
    return this.http.put<Cuenta>(`${this.baseUrl}/${numeroCuenta}`, cuenta);
  }

  delete(numeroCuenta: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${numeroCuenta}`);
  }
}
