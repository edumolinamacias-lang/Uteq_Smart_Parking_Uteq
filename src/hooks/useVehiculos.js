import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useVehiculos = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchVehiculos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .order('id', { ascending: false })

      if (error) throw error

      return data || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const addVehiculo = async (payload) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .insert([payload])
        .select()

      if (error) throw error

      return {
        success: true,
        data,
      }
    } catch (err) {
      setError(err.message)

      return {
        success: false,
        error: err.message,
      }
    } finally {
      setLoading(false)
    }
  }

  const updateVehiculo = async (id, payload) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .update(payload)
        .eq('id', id)
        .select()

      if (error) throw error

      return {
        success: true,
        data,
      }
    } catch (err) {
      setError(err.message)

      return {
        success: false,
        error: err.message,
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteVehiculo = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('vehiculos')
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        success: true,
      }
    } catch (err) {
      setError(err.message)

      return {
        success: false,
        error: err.message,
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    fetchVehiculos,
    addVehiculo,
    updateVehiculo,
    deleteVehiculo,
    loading,
    error,
  }
}