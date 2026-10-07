import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Movimiento } from '../models/movimiento.model';

@Injectable({
  providedIn: 'root',
})
export class MovimientoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/movimientos`;

  getByCuenta(numeroCuenta: number): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.baseUrl, { params: { numeroCuenta } });
  }

  create(movimiento: Movimiento): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.baseUrl, movimiento);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
