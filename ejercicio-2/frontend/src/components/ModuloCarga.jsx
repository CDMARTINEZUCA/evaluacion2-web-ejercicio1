import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  UncontrolledAlert
} from 'reactstrap';

import PanelSuperior from './PanelSuperior';
import CatalogoBase from './Catalogo';
import BodegaCarga from './BodegaCarga';      

const TIEMPO_MISION_SEGUNDOS = 60;

function ModuloCarga() {
  const API_URL = 'http://localhost:3005/api';

  const [estadoNave, setEstadoNave] = useState({
    creditos: 500,
    itemsCargados: [],
    total: 0
  });

  const [inventario, setInventario] = useState([]);

  const [errorMensaje, setErrorMensaje] = useState('');
  const [calculando, setCalculando] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_MISION_SEGUNDOS);
  const [misionActiva, setMisionActiva] = useState(false);
  const [misionConfirmada, setMisionConfirmada] = useState(false);
  const finalizandoMision = useRef(false);

  const esperarTiempoMinimo = (ms = 1000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

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

  useEffect(() => {
    const iniciar = async () => {
      try {
        const resReinicio = await fetch(`${API_URL}/carga/confirmar`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ boton: false })
        });

        if (!resReinicio.ok) {
          const data = await resReinicio.json();
          throw new Error(data.mensaje || 'No se pudo iniciar una nueva carga.');
        }

        await cargarDatosActualizados();
      } catch (error) {
        setErrorMensaje(error.message);
      }
    };

    iniciar();
  }, []);

  const devolverCargaAlInventario = useCallback(async () => {
    if (finalizandoMision.current) return;

    finalizandoMision.current = true;
    setCalculando(true);

    try {
      const itemsCargados = [...estadoNave.itemsCargados];

      for (const item of itemsCargados) {
        const res = await fetch(`${API_URL}/carga/eliminar/${item.id}`, {
          method: 'DELETE'
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.mensaje || 'No se pudo devolver la carga.');
        }
      }

      await cargarDatosActualizados();
      setTiempoRestante(TIEMPO_MISION_SEGUNDOS);
      setMisionActiva(false);
      setErrorMensaje('El tiempo terminó. La carga volvió al inventario.');
    } catch (error) {
      setErrorMensaje(error.message || 'No se pudo devolver la carga al inventario.');
    } finally {
      finalizandoMision.current = false;
      setCalculando(false);
    }
  }, [estadoNave.itemsCargados]);

  useEffect(() => {
    if (!misionActiva || misionConfirmada) return undefined;

    if (tiempoRestante === 0) {
      devolverCargaAlInventario();
      return undefined;
    }

    const temporizador = setInterval(() => {
      setTiempoRestante((tiempo) => Math.max(0, tiempo - 1));
    }, 1000);

    return () => clearInterval(temporizador);
  }, [
    tiempoRestante,
    misionActiva,
    misionConfirmada,
    devolverCargaAlInventario
  ]);

  const handleAgregarCarga = async (equipoId, cantidad) => {
    setErrorMensaje('');
    setCalculando(true);

    try {
      const [res] = await Promise.all([
        fetch(`${API_URL}/carga/agregar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ equipoId, cantidad })
        }),
        esperarTiempoMinimo(1000) 
      ]);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'No se pudo agregar el suministro.');
      }

      setEstadoNave(data.carga);
      setInventario(data.inventario);
      if (!misionActiva) {
        setTiempoRestante(TIEMPO_MISION_SEGUNDOS);
        setMisionActiva(true);
        setMisionConfirmada(false);
      }
    } catch (error) {
      setErrorMensaje(error.message || 'Ocurrió un error al agregar.');
    } finally {
      setCalculando(false);
    }
  };

  const handleConfirmarMision = async () => {
    if (!misionActiva || misionConfirmada || finalizandoMision.current) {
      return;
    }

    setErrorMensaje('');
    setCalculando(true);
    finalizandoMision.current = true;

    try {
      const res = await fetch(`${API_URL}/carga/confirmar`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ boton: true })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'No se pudo confirmar la carga.');
      }

      setMisionConfirmada(true);
      setMisionActiva(false);
      setErrorMensaje(data.mensaje);
    } catch (error) {
      setErrorMensaje(error.message || 'No se pudo confirmar la carga.');
    } finally {
      finalizandoMision.current = false;
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
      const [res] = await Promise.all([
        fetch(
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
        ),
        esperarTiempoMinimo(1000) 
      ]);

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
      const [res] = await Promise.all([
        fetch(
          `${API_URL}/carga/eliminar/${equipoId}`,
          {
            method: 'DELETE'
          }
        ),
        esperarTiempoMinimo(1000) 
      ]);

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

      <PanelSuperior
        estadoNave={estadoNave}
        tiempoRestante={tiempoRestante}
        misionActiva={misionActiva}
        misionConfirmada={misionConfirmada}
        confirmando={calculando}
        onConfirmarMision={handleConfirmarMision}
      />

      {calculando && !misionConfirmada && (
        <p className="text-center fw-bold mt-3">
          Calculando peso...
        </p>
      )}

      <Row className="mt-4">
        <Col lg="8" md="7" xs="12">
          <CatalogoBase
            inventario={inventario}
            onAgregarCarga={handleAgregarCarga}
            calculando={calculando || misionConfirmada}
          />
        </Col>
        <Col lg="4" md="5" xs="12">
          <BodegaCarga
            itemsCargados={estadoNave.itemsCargados}
            onActualizarUnidades={handleActualizarUnidades}
            onDesembarcar={handleDesembarcar}
            calculando={calculando}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default ModuloCarga;