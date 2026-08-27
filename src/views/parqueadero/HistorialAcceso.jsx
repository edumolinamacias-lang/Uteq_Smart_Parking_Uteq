import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from './firebaseConfig';

export default function Historial() {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    // Consulta los últimos 50 eventos para no saturar la vista
    const historialRef = query(
      ref(database, 'parqueadero/historial'), 
      orderByChild('timestamp'), 
      limitToLast(50)
    );
    
    const unsubscribe = onValue(historialRef, (snapshot) => {
      const data = [];
      snapshot.forEach((child) => {
        data.push({ id: child.key, ...child.val() });
      });
      // Invertir el array para mostrar los eventos más recientes primero
      setRegistros(data.reverse());
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Registro de Ocupación</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Fecha y Hora</th>
              <th className="border p-3 text-left">Identificador</th>
              <th className="border p-3 text-left">Evento</th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 ? (
              <tr><td colSpan="3" className="p-4 text-center text-gray-500">No hay registros disponibles</td></tr>
            ) : (
              registros.map((reg) => (
                <tr key={reg.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="border p-3">{new Date(reg.timestamp).toLocaleString()}</td>
                  <td className="border p-3 font-semibold text-gray-700">{reg.puestoId}</td>
                  <td className="border p-3">
                    <span className={`px-2 py-1 rounded font-medium ${reg.evento === 'Ocupado' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {reg.evento}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}