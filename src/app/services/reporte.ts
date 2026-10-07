import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Reporte, ReportePdfResponse } from '../models/reporte.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reportes`;

  getReporte(clienteId: string, fechaInicio: string, fechaFin: string): Observable<Reporte> {
    return this.http.get<Reporte>(this.baseUrl, {
      params: { clienteId, fechaInicio, fechaFin, formato: 'json' },
    });
  }

  getReportePdf(
    clienteId: string,
    fechaInicio: string,
    fechaFin: string,
  ): Observable<ReportePdfResponse> {
    return this.http.get<ReportePdfResponse>(this.baseUrl, {
      params: { clienteId, fechaInicio, fechaFin, formato: 'pdf' },
    });
  }
}
