import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const usePuestos = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPuestos = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('puestos').select('*')
      if (error) throw error
      return data || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchPuestos, loading, error }
}