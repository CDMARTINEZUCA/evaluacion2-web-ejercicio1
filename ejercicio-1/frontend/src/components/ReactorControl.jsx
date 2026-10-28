import React, { useState } from 'react';

import '../App.css';

const API_BASE_URL = 'http://localhost:3067/api/reactor';

export default function ReactorControl() {
    const [temperature, setTemperature] = useState('');
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [isStabilized, setIsStabilized] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAdjust = async (e) => {
        e.preventDefault();

        if (!temperature || isNaN(temperature)) {
            setMessage('Por favor, ingresa un número válido.');
            return;
        }

        const tempNum = Number(temperature);
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/adjust`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temperatura: tempNum }),
            });

            const data = await response.json();

            setHistory((prevHistory) => [
                { temp: tempNum, result: data.mensaje || data.resultado },
                ...prevHistory
            ]);

            setMessage(data.mensaje || data.resultado);

            if (
                data.estabilizado ||
                data.mensaje?.toLowerCase().includes('estabilizado') ||
                data.resultado?.toLowerCase().includes('estabilizado')
            ) {
                setIsStabilized(true);
            }

            setTemperature('');
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            setMessage('Error de conexión con el servidor del reactor.');
        } finally {
            setLoading(false);
        }
    };

    const handleReboot = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/reboot`, {
                method: 'POST',
            });

            const data = await response.json();

            setMessage(data.mensaje || 'Nueva temperatura generada.');
            setHistory([]);
            setIsStabilized(false);
            setTemperature('');
        } catch (error) {
            console.error('Error al reiniciar el reactor:', error);
            setMessage('Error al intentar reiniciar el sistema.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reactor-container">
            <h2 className="reactor-title">Estabiliza el Reactor</h2>

            {}
            {message && (
                <div className={`reactor-alert ${isStabilized ? 'stabilized' : 'warning'}`}>
                    {message}
                </div>
            )}

            
            <form onSubmit={handleAdjust} className="reactor-form">
                <div className="reactor-input-group">
                    <input
                        type="number"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        placeholder="Ej. 50 (1-100)"
                        disabled={isStabilized || loading}
                        min="1"
                        max="100"
                        required
                        className="reactor-input"
                    />
                    <button
                        type="submit"
                        disabled={isStabilized || loading}
                        className="reactor-btn"
                    >
                        {loading ? 'Ajustando...' : 'Ajustar'}
                    </button>
                </div>
            </form>

            
            <button
                onClick={handleReboot}
                disabled={loading}
                className="reactor-reboot-btn"
            >
                Reiniciar Reactor
            </button>

            
            <div>
                <h3>Historial de intentos</h3>
                {history.length === 0 ? (
                    <p className="reactor-empty-history">No se han realizado intentos</p>
                ) : (
                    <ul className="reactor-history-list">
                        {history.map((item, index) => {
                            
                            const intentoNumero = history.length - index;

                            return (
                                <li key={index} className="reactor-history-item">
                                    Intento {intentoNumero}: <strong>{item.temp}°C</strong> — <em>{item.result}</em>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}