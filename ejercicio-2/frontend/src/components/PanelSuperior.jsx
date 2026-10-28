import React from 'react';
import './PanelSuperior.css';

function PanelSuperior({ estadoNave = {} }) {
  const creditos = estadoNave.creditos ?? 500;
  const total = estadoNave.total ?? 0;

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
      </div>
    </div>
  );
}

export default PanelSuperior;
