import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useHistorial = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHistorial = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('historial').select('*').order('fecha_ingreso', { ascending: false })
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const registrarSalida = async (id, fechaSalida) => {
    try {
      const { error } = await supabase.from('historial').update({ fecha_salida: fechaSalida }).eq('id', id)
      if (error) throw error
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  return { fetchHistorial, registrarSalida, loading, error }
}