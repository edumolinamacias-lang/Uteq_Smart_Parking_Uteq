import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const usePuestos = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPuestos = useCallback(async () => {
    setLoading(true)
    try {
      // Ajustado para consultar el estado de los 80 sensores de distancia
      const { data, error } = await supabase.from('puestos').select('*').order('numero_puesto')
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const updateEstadoPuesto = async (id, estado) => {
    try {
      const { error } = await supabase.from('puestos').update({ estado }).eq('id', id)
      if (error) throw error
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  return { fetchPuestos, updateEstadoPuesto, loading, error }
}