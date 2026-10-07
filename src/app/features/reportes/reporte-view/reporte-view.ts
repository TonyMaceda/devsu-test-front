import { Component, inject, signal } from '@angular/core';
import { ReporteService } from '../../../services/reporte';
import { Reporte } from '../../../models/reporte.model';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-reporte-view',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './reporte-view.html',
  styleUrl: './reporte-view.css',
})
export class ReporteView {
  private reporteService = inject(ReporteService);

  clienteId = '';
  fechaInicio = '';
  fechaFin = '';

  reporte = signal<Reporte | null>(null);
  errorMsg = signal<string | null>(null);

  consultar(): void {
    if (!this.clienteId || !this.fechaInicio || !this.fechaFin) {
      this.errorMsg.set('Complete Cliente ID y el rango de fechas');
      return;
    }
    this.errorMsg.set(null);
    this.reporteService.getReporte(this.clienteId, this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => this.reporte.set(data),
      error: (err) => this.errorMsg.set(err.error?.mensaje ?? 'Error al generar el reporte'),
    });
  }

  descargarPdf(): void {
    this.reporteService.getReportePdf(this.clienteId, this.fechaInicio, this.fechaFin).subscribe({
      next: (res) => {
        const byteCharacters = atob(res.pdfBase64);
        const byteNumbers = Array.from(byteCharacters, (c) => c.charCodeAt(0));
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `estado-cuenta-${this.clienteId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => this.errorMsg.set(err.error?.mensaje ?? 'Error al generar el PDF'),
    });
  }
}
