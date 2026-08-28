import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useHistorial = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHistorial = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('registros_estacionamiento').select('*')
      if (error) throw error
      return data || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchHistorial, loading, error }
}