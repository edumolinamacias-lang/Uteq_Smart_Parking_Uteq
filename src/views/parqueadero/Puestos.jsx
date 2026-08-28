
import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { usePuestos } from '../../hooks/usePuestos'

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CBadge,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect
} from '@coreui/react'

export default function Puestos() {

  const {
    fetchPuestos,
    insertPuesto,
    updatePuesto,
    deletePuesto,
    loading,
    error
  } = usePuestos()

  const [puestos, setPuestos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [visibleModal, setVisibleModal] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  // ==========================================
  // FORMULARIO
  // ==========================================

  const [formData, setFormData] = useState({
    codigo: '',
    columna: '',
    numero: '',
    sensor_id_rtdb: '',
    estado: 'DISPONIBLE',
    distancia_cm: ''
  })

  // ==========================================
  // CARGAR PUESTOS
  // ==========================================

  const cargarPuestos = useCallback(async () => {

    const data = await fetchPuestos()

    if (data) {
      setPuestos(data)
    }

  }, [fetchPuestos])

  useEffect(() => {
    cargarPuestos()
  }, [cargarPuestos])

  // ==========================================
  // ABRIR MODAL
  // ==========================================

  const handleOpenModal = (puesto = null) => {

    if (puesto) {

      setEditandoId(puesto.id)

      setFormData({
        codigo: puesto.codigo || '',
        columna: puesto.columna || '',
        numero: puesto.numero || '',
        sensor_id_rtdb: puesto.sensor_id_rtdb || '',
        estado: puesto.estado || 'DISPONIBLE',
        distancia_cm: puesto.distancia_cm ?? ''
      })

    } else {

      setEditandoId(null)

      setFormData({
        codigo: '',
        columna: '',
        numero: '',
        sensor_id_rtdb: '',
        estado: 'DISPONIBLE',
        distancia_cm: ''
      })
    }

    setVisibleModal(true)
  }

  // ==========================================
  // GUARDAR PUESTO
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault()

    const codigo = formData.codigo.trim().toUpperCase()
    const columna = formData.columna.trim().toUpperCase()
    const numero = Number(formData.numero)
    const sensor = formData.sensor_id_rtdb.trim()

    // ==========================================
    // VALIDAR CÓDIGO
    // ==========================================

    if (!codigo) {
      alert('Ingrese el código del puesto.')
      return
    }

    if (codigo.length > 3) {
      alert('El código del puesto debe tener máximo 3 caracteres.')
      return
    }

    // ==========================================
    // VALIDAR COLUMNA
    // ==========================================

    if (!['A', 'B', 'C', 'D'].includes(columna)) {

      alert('Seleccione una columna válida.')

      return
    }

    // ==========================================
    // VALIDAR NÚMERO
    // ==========================================

    if (
      !Number.isInteger(numero) ||
      numero < 1 ||
      numero > 20
    ) {

      alert('El número debe estar entre 1 y 20.')

      return
    }

    // ==========================================
    // VALIDAR SENSOR
    // ==========================================

    if (!sensor) {

      alert('Ingrese el ID del sensor.')

      return
    }

    // ==========================================
    // VALIDAR CÓDIGO DUPLICADO
    // ==========================================

    const codigoExiste = puestos.some(
      (puesto) =>
        puesto.codigo?.toUpperCase() === codigo &&
        puesto.id !== editandoId
    )

    if (codigoExiste) {

      alert(`El código "${codigo}" ya existe.`)

      return
    }

    // ==========================================
    // VALIDAR COLUMNA + NÚMERO
    // ==========================================

    const posicionExiste = puestos.some(
      (puesto) =>
        puesto.columna?.toUpperCase() === columna &&
        Number(puesto.numero) === numero &&
        puesto.id !== editandoId
    )

    if (posicionExiste) {

      alert(
        `La combinación columna ${columna} y número ${numero} ya existe.`
      )

      return
    }

    // ==========================================
    // VALIDAR SENSOR DUPLICADO
    // ==========================================

    const sensorExiste = puestos.some(
      (puesto) =>
        puesto.sensor_id_rtdb?.toLowerCase().trim() ===
          sensor.toLowerCase() &&
        puesto.id !== editandoId
    )

    if (sensorExiste) {

      alert(
        `El sensor "${sensor}" ya está asignado a otro puesto.`
      )

      return
    }

    // ==========================================
    // GENERAR RUTA FIREBASE AUTOMÁTICA
    // ==========================================

    const rutaFirebase =
      `/estacionamiento/puestos/${codigo.toLowerCase()}`

    // ==========================================
    // DATOS A ENVIAR
    // ==========================================

    const datos = {

      codigo: codigo,

      columna: columna,

      numero: numero,

      sensor_id_rtdb: sensor,

      // Se genera automáticamente
      ruta_firebase: rutaFirebase,

      estado: formData.estado,

      distancia_cm:
        formData.distancia_cm === ''
          ? null
          : Number(formData.distancia_cm)

    }

    // ==========================================
    // INSERTAR / ACTUALIZAR
    // ==========================================

    let res

    if (editandoId) {

      res = await updatePuesto(
        editandoId,
        datos
      )

    } else {

      res = await insertPuesto(datos)

    }

    // ==========================================
    // RESULTADO
    // ==========================================

    if (res.success) {

      setVisibleModal(false)

      cargarPuestos()

    } else {

      alert(
        'Error al guardar: ' + res.error
      )

    }
  }

  // ==========================================
  // ELIMINAR
  // ==========================================

  const handleDelete = async (id) => {

    if (
      window.confirm(
        '¿Estás seguro de eliminar este puesto?'
      )
    ) {

      const res = await deletePuesto(id)

      if (res.success) {

        cargarPuestos()

      } else {

        alert(
          'Error al eliminar: ' + res.error
        )
      }
    }
  }

  // ==========================================
  // FILTRAR
  // ==========================================

  const puestosFiltrados = puestos.filter(
    (puesto) => {

      const texto =
        busqueda.toLowerCase()

      return (

        (puesto.codigo || '')
          .toLowerCase()
          .includes(texto)

        ||

        (puesto.columna || '')
          .toLowerCase()
          .includes(texto)

        ||

        (puesto.sensor_id_rtdb || '')
          .toLowerCase()
          .includes(texto)

        ||

        (puesto.estado || '')
          .toLowerCase()
          .includes(texto)
      )
    }
  )

  // ==========================================
  // ORDENAR
  // A01 A02 A03...
  // B01 B02 B03...
  // C01 C02 C03...
  // D01 D02 D03...
  // ==========================================

  const puestosOrdenados = [...puestosFiltrados].sort(
    (a, b) => {

      const columnaA =
        (a.columna || '').toUpperCase()

      const columnaB =
        (b.columna || '').toUpperCase()

      const ordenColumnas = {
        A: 1,
        B: 2,
        C: 3,
        D: 4
      }

      if (
        ordenColumnas[columnaA] !==
        ordenColumnas[columnaB]
      ) {

        return (
          (ordenColumnas[columnaA] || 99) -
          (ordenColumnas[columnaB] || 99)
        )
      }

      return (
        Number(a.numero || 0) -
        Number(b.numero || 0)
      )
    }
  )

  return (

    <CRow>

      <CCol xs={12}>

        <CCard className="mb-4 shadow-sm border-0">

          {/* ==================================
              CABECERA
          ================================== */}

          <CCardHeader
            className="
              bg-dark
              text-white
              fw-bold
              d-flex
              flex-column
              flex-md-row
              justify-content-between
              align-items-center
              py-3
              gap-3
            "
          >

            <span>
              Monitoreo y Gestión de Puestos
            </span>

            <div
              className="
                d-flex
                align-items-center
                gap-2
                w-100
                w-md-auto
                justify-content-end
              "
            >

              <CFormInput
                type="text"
                placeholder="Buscar puesto o sensor..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
                style={{
                  maxWidth: '250px'
                }}
                size="sm"
              />

              <CButton
                color="primary"
                size="sm"
                onClick={() =>
                  handleOpenModal()
                }
              >
                + Nuevo Puesto
              </CButton>

            </div>

          </CCardHeader>

          {/* ==================================
              CUERPO
          ================================== */}

          <CCardBody>

            {error && (

              <p className="text-danger text-center">
                Error: {error}
              </p>

            )}

            {loading && puestos.length === 0 ? (

              <p className="text-center py-4">
                Cargando puestos...
              </p>

            ) : puestosOrdenados.length === 0 ? (

              <p className="text-center text-muted py-4">
                No se encontraron puestos registrados.
              </p>

            ) : (

              <CRow>

                {puestosOrdenados.map(
                  (puesto) => {

                    const isOcupado =
                      puesto.estado?.toUpperCase() ===
                      'OCUPADO'

                    return (

                      <CCol
                        xs={12}
                        sm={6}
                        md={3}
                        lg={3}
                        xl={3}
                        key={puesto.id}
                        className="mb-3"
                      >

                        <CCard
                          className={`
                            border-start
                            border-4
                            ${
                              isOcupado
                                ? 'border-danger'
                                : 'border-success'
                            }
                            shadow-sm
                            h-100
                          `}
                        >

                          <CCardBody
                            className="
                              d-flex
                              flex-column
                              justify-content-between
                            "
                          >

                            <div>

                              {/* CÓDIGO Y ESTADO */}

                              <div
                                className="
                                  d-flex
                                  justify-content-between
                                  align-items-center
                                  mb-2
                                "
                              >

                                <h5
                                  className="
                                    card-title
                                    fw-bold
                                    m-0
                                  "
                                >
                                  {puesto.codigo}
                                </h5>

                                <CBadge
                                  color={
                                    isOcupado
                                      ? 'danger'
                                      : 'success'
                                  }
                                >
                                  {puesto.estado ||
                                    'DISPONIBLE'}
                                </CBadge>

                              </div>

                              {/* COLUMNA */}

                              <p
                                className="
                                  mb-1
                                  text-muted
                                  small
                                "
                              >
                                Columna:{' '}
                                <strong>
                                  {puesto.columna}
                                </strong>
                              </p>

                              {/* NÚMERO */}

                              <p
                                className="
                                  mb-1
                                  text-muted
                                  small
                                "
                              >
                                Número:{' '}
                                <strong>
                                  {puesto.numero}
                                </strong>
                              </p>

                              {/* SENSOR */}

                              <p
                                className="
                                  mb-1
                                  text-muted
                                  small
                                  text-truncate
                                "
                              >

                                Sensor:{' '}

                                <code>
                                  {puesto.sensor_id_rtdb ||
                                    'N/D'}
                                </code>

                              </p>

                              {/* DISTANCIA */}

                              <p className="mb-2">

                                Distancia:{' '}

                                <strong>
                                  {puesto.distancia_cm ??
                                    'N/D'} cm
                                </strong>

                              </p>

                            </div>

                            {/* ==================================
                                BOTONES
                            ================================== */}

                            <div>

                              <div
                                className="
                                  border-top
                                  pt-2
                                  mt-2
                                  d-flex
                                  justify-content-between
                                  align-items-center
                                "
                              >

                                <small
                                  className="text-muted"
                                  style={{
                                    fontSize:
                                      '0.7rem'
                                  }}
                                >

                                  {puesto.ultima_actualizacion
                                    ? new Date(
                                        puesto.ultima_actualizacion
                                      ).toLocaleTimeString()
                                    : 'N/D'}

                                </small>

                                <div>

                                  <CButton
                                    size="sm"
                                    color="warning"
                                    className="
                                      me-1
                                      text-white
                                    "
                                    onClick={() =>
                                      handleOpenModal(
                                        puesto
                                      )
                                    }
                                  >
                                    Editar
                                  </CButton>

                                  <CButton
                                    size="sm"
                                    color="danger"
                                    variant="outline"
                                    onClick={() =>
                                      handleDelete(
                                        puesto.id
                                      )
                                    }
                                  >
                                    Eliminar
                                  </CButton>

                                </div>

                              </div>

                            </div>

                          </CCardBody>

                        </CCard>

                      </CCol>

                    )
                  }
                )}

              </CRow>

            )}

            {/* ==================================
                VOLVER
            ================================== */}

            <div className="mt-3">

              <Link
                to="/vehiculos"
                className="
                  btn
                  btn-outline-secondary
                "
              >
                &larr; Volver a Vehículos
              </Link>

            </div>

          </CCardBody>

        </CCard>

      </CCol>

      {/* ========================================
          MODAL
      ======================================== */}

      <CModal
        visible={visibleModal}
        onClose={() =>
          setVisibleModal(false)
        }
      >

        <CModalHeader>

          <CModalTitle>

            {editandoId
              ? 'Editar Puesto'
              : 'Registrar Nuevo Puesto'}

          </CModalTitle>

        </CModalHeader>

        <CForm onSubmit={handleSubmit}>

          <CModalBody>

            {/* ==================================
                CÓDIGO
            ================================== */}

            <div className="mb-3">

              <label
                className="
                  form-label
                  fw-bold
                "
              >
                Código del Puesto
              </label>

              <CFormInput
                type="text"
                placeholder="Ej. A01"
                maxLength={3}
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    codigo:
                      e.target.value
                        .toUpperCase()
                        .slice(0, 3)
                  })
                }
                required
              />

            </div>

            {/* ==================================
                COLUMNA
            ================================== */}

            <div className="mb-3">

              <label
                className="
                  form-label
                  fw-bold
                "
              >
                Columna
              </label>

              <CFormSelect
                value={formData.columna}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    columna:
                      e.target.value
                  })
                }
                required
              >

                <option value="">
                  Seleccione una columna
                </option>

                <option value="A">
                  A
                </option>

                <option value="B">
                  B
                </option>

                <option value="C">
                  C
                </option>

                <option value="D">
                  D
                </option>

              </CFormSelect>

            </div>

            {/* ==================================
                NÚMERO
            ================================== */}

            <div className="mb-3">

              <label
                className="
                  form-label
                  fw-bold
                "
              >
                Número
              </label>

              <CFormInput
                type="number"
                min="1"
                max="20"
                step="1"
                placeholder="Ej. 1"
                value={formData.numero}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numero:
                      e.target.value
                  })
                }
                required
              />

            </div>

            {/* ==================================
                SENSOR
            ================================== */}

            <div className="mb-3">

              <label
                className="
                  form-label
                  fw-bold
                "
              >
                Sensor ID (RTDB)
              </label>

              <CFormInput
                type="text"
                placeholder="Ej. parking_A_01"
                value={
                  formData.sensor_id_rtdb
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sensor_id_rtdb:
                      e.target.value
                  })
                }
                required
              />

              <small className="text-muted">
                Cada sensor debe ser único.
              </small>

            </div>

            {/* ==================================
                ESTADO
            ================================== */}

            <div className="mb-3">

              <label
                className="
                  form-label
                  fw-bold
                "
              >
                Estado
              </label>

              <CFormSelect
                value={formData.estado}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estado:
                      e.target.value
                  })
                }
              >

                <option value="DISPONIBLE">
                  DISPONIBLE
                </option>

                <option value="OCUPADO">
                  OCUPADO
                </option>

              </CFormSelect>

            </div>

            {/* ==================================
                DISTANCIA
            ================================== */}

            <div className="mb-3">

              <label
                className="
                  form-label
                  fw-bold
                "
              >
                Distancia (cm)
              </label>

              <CFormInput
                type="number"
                step="0.01"
                placeholder="Ej. 50.0"
                value={
                  formData.distancia_cm
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    distancia_cm:
                      e.target.value
                  })
                }
              />

            </div>

          </CModalBody>

          <CModalFooter>

            <CButton
              color="secondary"
              onClick={() =>
                setVisibleModal(false)
              }
            >
              Cancelar
            </CButton>

            <CButton
              color="primary"
              type="submit"
            >

              {editandoId
                ? 'Guardar Cambios'
                : 'Registrar Puesto'}

            </CButton>

          </CModalFooter>

        </CForm>

      </CModal>

    </CRow>
  )
}
