import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Input
} from 'reactstrap';
import './Catalogo.css';

function CatalogoBase({
  inventario = [],
  onAgregarCarga,
  calculando = false
}) {
  const [cantidades, setCantidades] = useState({});

  const handleInputChange = (id, valor, stock) => {
    const numero = valor === '' ? '' : Number(valor);

    if (
      numero !== '' &&
      (!Number.isInteger(numero) ||
        numero < 1 ||
        numero > stock)
    ) {
      return;
    }

    setCantidades((prev) => ({
      ...prev,
      [id]: numero
    }));
  };

  return (
    <Container className="catalogo-container my-4">
      <h2 className="titulo-catalogo text-center mb-4">
        Catálogo de la Base
      </h2>

      <Row className="catalogo-grid">
        {inventario.map((item) => {
          const agotado = item.stock === 0;
          const cantidadActual = cantidades[item.id] ?? 1;

          return (
            <Col
              md="6"
              xs="12"
              key={item.id}
              className="mb-3"
            >
              <Card className="mb-3 h-100 shadow-sm catalogo-card">
                <CardBody className="d-flex flex-column justify-content-between">
                  <div>
                    <CardTitle tag="h3" className="h5">
                      {item.nombre}
                    </CardTitle>

                    <CardText className="categoria">
                      Categoría: {item.categoria}
                    </CardText>

                    <CardText className="precio">
                      Costo: {item.precio} Cr
                    </CardText>

                    <CardText className={`stock ${agotado ? 'sin-stock' : ''}`}>
                      Stock disponible: {item.stock}
                    </CardText>
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <Button
                      className="btn-cargar"
                      onClick={() => onAgregarCarga(item.id, Number(cantidadActual))}
                      disabled={agotado || calculando}
                    >
                      {agotado ? 'Agotado en Base' : 'Añadir'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

export default CatalogoBase;