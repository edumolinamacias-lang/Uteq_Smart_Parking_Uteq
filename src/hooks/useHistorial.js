
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useHistorial = () => {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // =========================================================
  // OBTENER HISTORIAL
  // =========================================================

  const fetchHistorial = useCallback(async () => {

    setLoading(true)
    setError(null)

    try {

      const { data, error } = await supabase
        .from('registros_estacionamiento')
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

  // =========================================================
  // INSERTAR
  // =========================================================

  const insertHistorial = async (nuevoRegistro) => {

    setLoading(true)
    setError(null)

    try {

      // Validar vehículo
      if (
        nuevoRegistro.vehiculo_id === null ||
        nuevoRegistro.vehiculo_id === undefined ||
        nuevoRegistro.vehiculo_id === ''
      ) {
        throw new Error(
          'Debe seleccionar un vehículo.'
        )
      }

      // Validar código
      if (
        !nuevoRegistro.codigo_registro ||
        nuevoRegistro.codigo_registro.trim() === ''
      ) {
        throw new Error(
          'No se generó el código del registro.'
        )
      }

      const registro = {

        ...nuevoRegistro,

        vehiculo_id:
          Number(nuevoRegistro.vehiculo_id),

        puesto_id:
          Number(nuevoRegistro.puesto_id),

      }

      const {
        data,
        error,
      } = await supabase
        .from('registros_estacionamiento')
        .insert([registro])
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

  // =========================================================
  // ACTUALIZAR
  // =========================================================

  const updateHistorial = async (
    id,
    datosActualizados
  ) => {

    setLoading(true)
    setError(null)

    try {

      const datos = {
        ...datosActualizados,
      }

      if (
        datos.vehiculo_id !== undefined &&
        datos.vehiculo_id !== null &&
        datos.vehiculo_id !== ''
      ) {

        datos.vehiculo_id =
          Number(datos.vehiculo_id)

      }

      if (
        datos.puesto_id !== undefined &&
        datos.puesto_id !== null &&
        datos.puesto_id !== ''
      ) {

        datos.puesto_id =
          Number(datos.puesto_id)

      }

      const {
        data,
        error,
      } = await supabase
        .from('registros_estacionamiento')
        .update(datos)
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

  // =========================================================
  // ELIMINAR
  // =========================================================

  const deleteHistorial = async (id) => {

    setLoading(true)
    setError(null)

    try {

      const { error } = await supabase
        .from('registros_estacionamiento')
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

    fetchHistorial,

    insertHistorial,

    updateHistorial,

    deleteHistorial,

    loading,

    error,

  }
}
