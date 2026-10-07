import { Routes } from '@angular/router';
import { ClienteList } from './features/clientes/cliente-list/cliente-list';
import { CuentaList } from './features/cuentas/cuenta-list/cuenta-list';
import { MovimientoList } from './features/movimientos/movimiento-list/movimiento-list';
import { ReporteView } from './features/reportes/reporte-view/reporte-view';
import { ClienteForm } from './features/clientes/cliente-form/cliente-form';
import { CuentaForm } from './features/cuentas/cuenta-form/cuenta-form';
import { MovimientoForm } from './features/movimientos/movimiento-form/movimiento-form';

export const routes: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },

  { path: 'clientes', component: ClienteList },
  { path: 'clientes/nuevo', component: ClienteForm },
  { path: 'clientes/:id/editar', component: ClienteForm },

  { path: 'cuentas', component: CuentaList },
  { path: 'cuentas/nueva', component: CuentaForm },
  { path: 'cuentas/:numeroCuenta/editar', component: CuentaForm },

  { path: 'movimientos', component: MovimientoList },
  { path: 'movimientos/nuevo', component: MovimientoForm },

  { path: 'reportes', component: ReporteView },

  { path: '**', redirectTo: 'clientes' },
];
