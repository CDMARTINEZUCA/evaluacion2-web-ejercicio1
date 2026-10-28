import React from 'react';
import { Button } from 'reactstrap';
import './PanelSuperior.css';

function PanelSuperior({
  estadoNave = {},
  tiempoRestante = 0,
  misionActiva = false,
  misionConfirmada = false,
  confirmando = false,
  onConfirmarMision
}) {
  const creditos = estadoNave.creditos ?? 500;
  const total = estadoNave.total ?? 0;
  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  const tiempoFormateado = `${minutos}:${String(segundos).padStart(2, '0')}`;

  return (
    <div className="contenedor-panel-superior">
      <h1 className="titulo-mision">
        Centro de Control de Misión
      </h1>

      <div className="panel-superior">
        <div className="panel-card">
          <span className="panel-label">
            Créditos disponibles
          </span>

          <span className="panel-value creditos">
            {creditos} Cr
          </span>
        </div>

        <div className="panel-card">
          <span className="panel-label">
            Costo total de Carga
          </span>

          <span className="panel-value total">
            {total} Cr
          </span>
        </div>

        <div className="panel-card">
          <span className="panel-label">
            Tiempo restante
          </span>

          <span className="panel-value contador">
            {misionActiva ? tiempoFormateado : '--:--'}
          </span>
        </div>

        <div className="panel-card panel-confirmacion">
          <span className="panel-label">
            Estado de misión
          </span>

          <Button
            color={misionConfirmada ? 'success' : 'primary'}
            size="sm"
            disabled={!misionActiva || misionConfirmada || confirmando}
            onClick={onConfirmarMision}
          >
            {misionConfirmada ? 'Misión confirmada' : 'Confirmar misión'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PanelSuperior;
