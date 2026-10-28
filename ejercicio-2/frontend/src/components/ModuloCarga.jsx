
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  UncontrolledAlert
} from 'reactstrap';

import PanelSuperior from './PanelSuperior';
import CatalogoBase from './Catalogo';
import BodegaCarga from './BodegaCarga';      

const API_URL = 'http://localhost:3005/api';

function ModuloCarga() {
  const [estadoNave, setEstadoNave] = useState({
    creditos: 500,
    itemsCargados: [],
    total: 0,
    expiraEn: null,
    misionIniciada: false
  });

  const [inventario, setInventario] = useState([]);

  const [errorMensaje, setErrorMensaje] = useState('');
  const [calculando, setCalculando] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  const cargarDatosActualizados = async () => {
    const [resInventario, resCarga] = await Promise.all([
      fetch(`${API_URL}/inventario`),
      fetch(`${API_URL}/carga`)
    ]);

    if (!resInventario.ok || !resCarga.ok) {
      throw new Error('No se pudieron actualizar los datos de la misión.');
    }

    const [dataInventario, dataCarga] = await Promise.all([
      resInventario.json(),
      resCarga.json()
    ]);

    setInventario(dataInventario);
    setEstadoNave(dataCarga);
  };

  const handleConfirmarCarga = useCallback(async (boton) => {
    setErrorMensaje('');
    setCalculando(true);

    try {
      const res = await fetch(`${API_URL}/carga/confirmar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ boton })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'No se pudo confirmar la carga.');
      }

      if (data.inventario) {
        setInventario(data.inventario);
      }

      if (data.cargaTotal) {
        setEstadoNave(data.cargaTotal);
      } else {
        await cargarDatosActualizados();
      }

      if (boton) {
        setErrorMensaje(data.mensaje);
      }
    } catch (error) {
      setErrorMensaje(error.message || 'Ocurrió un error al confirmar la carga.');
    } finally {
      setCalculando(false);
    }
  }, []);

  useEffect(() => {
    const iniciar = async () => {
      try {
        await cargarDatosActualizados();
      } catch (error) {
        setErrorMensaje(error.message);
      }
    };

    iniciar();
  }, []);

  useEffect(() => {
    if (
      !estadoNave.expiraEn ||
      estadoNave.misionIniciada ||
      estadoNave.itemsCargados.length === 0
    ) {
      setSegundosRestantes(0);
      return undefined;
    }

    const actualizarTemporizador = () => {
      const segundos = Math.max(
        0,
        Math.ceil((estadoNave.expiraEn - Date.now()) / 1000)
      );

      setSegundosRestantes(segundos);

      if (segundos === 0) {
        void handleConfirmarCarga(false);
      }
    };

    actualizarTemporizador();
    const intervalo = window.setInterval(actualizarTemporizador, 1000);

    return () => window.clearInterval(intervalo);
  }, [
    estadoNave.expiraEn,
    estadoNave.misionIniciada,
    estadoNave.itemsCargados.length,
    handleConfirmarCarga
  ]);

  const handleAgregarCarga = async (equipoId, cantidad) => {
    setErrorMensaje('');
    setCalculando(true);

    try {
      const res = await fetch(`${API_URL}/carga/agregar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ equipoId, cantidad })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'No se pudo agregar el suministro.');
      }

      setEstadoNave(data.carga);
      setInventario(data.inventario);
    } catch (error) {
      setErrorMensaje(error.message || 'Ocurrió un error al agregar.');
    } finally {
      setCalculando(false);
    }
  };

  const handleActualizarUnidades = async (equipoId, nuevaCantidad) => {
    const itemActual = estadoNave.itemsCargados.find(
      item => item.id === equipoId
    );

    if (!itemActual) return;

    const cantidadActual = Number(
      itemActual.stock ?? itemActual.cantidad ?? 0
    );

    const diferencia = nuevaCantidad - cantidadActual;

    if (diferencia === 0) return;

    setErrorMensaje('');
    setCalculando(true);

    try {
      const res = await fetch(
        `${API_URL}/carga/actualizar-unidades/${equipoId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cantidad: Math.abs(diferencia),
            transaccionElegida: diferencia > 0 ? 'Agregar' : 'Eliminar'
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'No se pudieron cambiar las unidades.');
      }

      await cargarDatosActualizados();
    } catch (error) {
      setErrorMensaje(error.message || 'Ocurrió un error al actualizar.');
    } finally {
      setCalculando(false);
    }
  };

  const handleDesembarcar = async (equipoId) => {
    setErrorMensaje('');
    setCalculando(true);

    try {
      const res = await fetch(
        `${API_URL}/carga/eliminar/${equipoId}`,
        {
          method: 'DELETE'
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.mensaje || data.message || 'No se pudo desembarcar el suministro.'
        );
      }

      await cargarDatosActualizados();
    } catch (error) {
      setErrorMensaje(error.message || 'Ocurrió un error al desembarcar.');
    } finally {
      setCalculando(false);
    }
  };

  return (
    <Container className="py-4">
      {errorMensaje && (
        <UncontrolledAlert color="warning">
          {errorMensaje}
        </UncontrolledAlert>
      )}

      <PanelSuperior estadoNave={estadoNave} />

      {calculando && (
        <p className="text-center fw-bold mt-3">
          Calculando peso...
        </p>
      )}

      <Row className="mt-4">
        <Col lg="8" md="7" xs="12">
          <CatalogoBase
            inventario={inventario}
            onAgregarCarga={handleAgregarCarga}
            calculando={calculando}
          />
        </Col>
        <Col lg="4" md="5" xs="12">
          <BodegaCarga
            itemsCargados={estadoNave.itemsCargados}
            onActualizarUnidades={handleActualizarUnidades}
            onDesembarcar={handleDesembarcar}
            onConfirmarCarga={handleConfirmarCarga}
            segundosRestantes={segundosRestantes}
            misionIniciada={estadoNave.misionIniciada}
            calculando={calculando}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default ModuloCarga;
