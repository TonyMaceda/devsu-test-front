export interface CuentaReporte {
  numeroCuenta: number;
  tipoCuenta: string;
  saldo: number;
  totalCreditos: number;
  totalDebitos: number;
}

export interface Reporte {
  clienteId: string;
  fechaInicio: string;
  fechaFin: string;
  cuentas: CuentaReporte[];
}

export interface ReportePdfResponse {
  pdfBase64: string;
}
