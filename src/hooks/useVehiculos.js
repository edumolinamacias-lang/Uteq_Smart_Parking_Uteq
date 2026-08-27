import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useVehiculos = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchVehiculos = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('vehiculos').select('*').order('id')
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const addVehiculo = async (payload) => {
    try {
      const { error } = await supabase.from('vehiculos').insert([payload])
      if (error) throw error
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const updateVehiculo = async (id, payload) => {
    try {
      const { error } = await supabase.from('vehiculos').update(payload).eq('id', id)
      if (error) throw error
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const deleteVehiculo = async (id) => {
    try {
      const { error } = await supabase.from('vehiculos').delete().eq('id', id)
      if (error) throw error
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  return { fetchVehiculos, addVehiculo, updateVehiculo, deleteVehiculo, loading, error }
}