import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from './firebaseConfig'; 

export default function Puesto() {
  const { id } = useParams();
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    const puestoRef = ref(database, `parqueadero/puestos/${id}`);
    const unsubscribe = onValue(puestoRef, (snapshot) => {
      if (snapshot.exists()) {
        setEstado(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, [id]);

  if (!estado) return <div className="p-4">Cargando datos del sensor {id}...</div>;

  // Asumiendo que una distancia menor a 50cm indica que hay un vehículo
  const isOcupado = estado.distancia < 50; 

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold">Puesto: {id}</h2>
      <div className={`p-4 rounded-lg text-white font-semibold ${isOcupado ? 'bg-red-500' : 'bg-green-500'}`}>
        Estado: {isOcupado ? 'Ocupado' : 'Disponible'}
      </div>
      <ul className="text-gray-700 space-y-2">
        <li><strong>Distancia actual:</strong> {estado.distancia} cm</li>
        <li><strong>Última actualización:</strong> {new Date(estado.timestamp).toLocaleString()}</li>
      </ul>
      <Link to="/" className="text-blue-600 hover:underline block mt-4 font-medium">
        &larr; Volver al Dashboard
      </Link>
    </div>
  );
}