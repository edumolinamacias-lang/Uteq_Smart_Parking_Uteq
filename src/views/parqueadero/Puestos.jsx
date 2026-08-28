import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Puesto() {
  const { id } = useParams()
  const [estado, setEstado] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPuesto = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('puestos')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setEstado(data)
      }
      setLoading(false)
    }

    fetchPuesto()
  }, [id])

  if (loading) return <div className="p-4">Cargando datos del puesto {id}...</div>
  if (!estado) return <div className="p-4 text-danger">No se encontró información para el puesto {id}</div>

  const isOcupado = Number(estado.distancia_cm) < 50

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold">Puesto: {estado.codigo || id}</h2>
      <div className={`p-4 rounded-lg text-white font-semibold text-center ${isOcupado ? 'bg-danger' : 'bg-success'}`}>
        Estado: {isOcupado ? 'Ocupado' : 'Disponible'}
      </div>
      <ul className="text-gray-700 space-y-2 list-unstyled">
        <li><strong>Distancia actual:</strong> {estado.distancia_cm} cm</li>
        <li><strong>Última actualización:</strong> {estado.ultima_actualizacion ? new Date(estado.ultima_actualizacion).toLocaleString() : 'N/D'}</li>
      </ul>
      <Link to="/parqueadero/vehiculos" className="text-primary hover:underline block mt-4 font-medium text-decoration-none">
        &larr; Volver a Vehículos
      </Link>
    </div>
  )
}