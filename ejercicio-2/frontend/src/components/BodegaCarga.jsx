import React from 'react';
import {
  ListGroup,
  ListGroupItem,
  Button,
  ButtonGroup,
  Badge
} from 'reactstrap';

function BodegaCarga({
  itemsCargados = [],
  onActualizarUnidades,
  onDesembarcar,
  calculando = false
}) {
  return (
    <div className="p-3 bg-light rounded shadow-sm">
      <h3 className="h5 mb-3 text-center">
        Tu Bodega de Carga
      </h3>

      {itemsCargados.length === 0 ? (
        <p className="text-muted text-center">
          La bodega está vacía.
        </p>
      ) : (
        <ListGroup>
          {itemsCargados.map((item) => {
            const cantidad = Number(item.stock ?? item.cantidad ?? 0);

            return (
              <ListGroupItem
                key={item.id}
                className="d-flex justify-content-between align-items-center flex-wrap gap-2"
              >
                <div>
                  <strong>{item.nombre}</strong>
                  <div className="mt-1">
                    <Badge color="secondary">
                      Cant: {cantidad}
                    </Badge>
                  </div>
                </div>

                <div className="d-flex align-items-center flex-wrap gap-2">
                  <ButtonGroup size="sm">
                    <Button
                      color="warning"
                      disabled={calculando || cantidad <= 1}
                      onClick={() =>
                        onActualizarUnidades(item.id, cantidad - 1)
                      }
                    >
                      -
                    </Button>

                    <Button color="light" disabled>
                      {cantidad}
                    </Button>

                    <Button
                      color="success"
                      disabled={calculando}
                      onClick={() =>
                        onActualizarUnidades(item.id, cantidad + 1)
                      }
                    >
                      +
                    </Button>
                  </ButtonGroup>

                  <Button
                    color="danger"
                    outline
                    size="sm"
                    disabled={calculando}
                    onClick={() => onDesembarcar(item.id)}
                  >
                    Desembarcar
                  </Button>
                </div>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      )}

      {calculando && (
        <p className="text-primary text-center mt-3 mb-0" role="status">
          Calculando peso...
        </p>
      )}
    </div>
  );
}

export default BodegaCarga;