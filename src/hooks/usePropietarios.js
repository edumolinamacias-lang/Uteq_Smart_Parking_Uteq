import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const COLUMNAS_PROPIETARIOS = `
  id,
  propietario_nombre,
  cedula_enmascarada,
  correo_institucional,
  foto_propietario_url,
  placa,
  marca,
  modelo
`

export const usePropietarios = () => {
  const [propietarios, setPropietarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarPropietarios = useCallback(async () => {
    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('vehiculos')
      .select(COLUMNAS_PROPIETARIOS)
      .order('propietario_nombre', { ascending: true })

    if (errorSupabase) {
      setPropietarios([])
      setError(errorSupabase.message)
    } else {
      setPropietarios(data ?? [])
    }

    setCargando(false)
  }, [])

  useEffect(() => {
    cargarPropietarios()
  }, [cargarPropietarios])

  return {
    propietarios,
    cargando,
    error,
    recargar: cargarPropietarios,
  }
}