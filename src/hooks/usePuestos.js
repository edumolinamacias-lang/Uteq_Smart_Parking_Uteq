import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const usePuestos = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPuestos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('puestos')
        .select('*')
        .order('columna', { ascending: true })
        .order('numero', { ascending: true })

      if (error) throw error

      return data || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const insertPuesto = async (nuevoPuesto) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('puestos')
        .insert([nuevoPuesto])
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

  const updatePuesto = async (id, datosActualizados) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('puestos')
        .update(datosActualizados)
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

  const deletePuesto = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('puestos')
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
    fetchPuestos,
    insertPuesto,
    updatePuesto,
    deletePuesto,
    loading,
    error,
  }
}