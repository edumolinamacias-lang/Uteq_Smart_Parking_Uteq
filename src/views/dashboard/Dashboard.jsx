import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { CCard, CCardBody, CCol, CRow, CWidgetStatsF } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCarAlt, cilGrid, cilHistory, cilCheckCircle, cilBan, cilPeople } from '@coreui/icons'

export default function Dashboard() {
  const [totalVehiculos, setTotalVehiculos] = useState(0)
  const [totalPuestos, setTotalPuestos] = useState(0)
  const [puestosOcupados, setPuestosOcupados] = useState(0)
  const [puestosDisponibles, setPuestosDisponibles] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarResumen = async () => {
      setLoading(true)
      
      // Contar vehículos registrados
      const { count: countVehiculos } = await supabase
        .from('vehiculos')
        .select('*', { count: 'exact', head: true })

      // Consultar puestos para calcular estadísticas en tiempo real
      const { data: dataPuestos } = await supabase
        .from('puestos')
        .select('estado')

      if (dataPuestos) {
        const ocupados = dataPuestos.filter(p => p.estado?.toUpperCase() === 'OCUPADO').length
        const disponibles = dataPuestos.length - ocupados
        
        setTotalPuestos(dataPuestos.length)
        setPuestosOcupados(ocupados)
        setPuestosDisponibles(disponibles)
      }

      if (countVehiculos !== null) {
        setTotalVehiculos(countVehiculos)
      }

      setLoading(false)
    }

    cargarResumen()
  }, [])

  return (
    <>
      <CRow className="mb-4">
        <CCol xs={12}>
          <div className="bg-dark text-white p-4 rounded-3 shadow-sm border-start border-4 border-primary">
            <h3 className="fw-bold m-0">Smart Parking UTEQ - Panel Principal</h3>
            <p className="mt-2 mb-0 text-white-50">
              Resumen general y estado en tiempo real de los sensores y vehículos del estacionamiento inteligente.
            </p>
          </div>
        </CCol>
      </CRow>

      {/* Tarjetas de Métricas Principales */}
      <CRow className="mb-4">
        <CCol xs={12} sm={6} lg={3} className="mb-3">
          <CWidgetStatsF
            className="mb-3 shadow-sm"
            icon={<CIcon icon={cilCarAlt} height={24} />}
            color="primary"
            padding={false}
            title="Vehículos Registrados"
            value={loading ? '...' : totalVehiculos}
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3} className="mb-3">
          <CWidgetStatsF
            className="mb-3 shadow-sm"
            icon={<CIcon icon={cilGrid} height={24} />}
            color="info"
            padding={false}
            title="Total Puestos"
            value={loading ? '...' : totalPuestos}
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3} className="mb-3">
          <CWidgetStatsF
            className="mb-3 shadow-sm"
            icon={<CIcon icon={cilBan} height={24} />}
            color="danger"
            padding={false}
            title="Puestos Ocupados"
            value={loading ? '...' : puestosOcupados}
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3} className="mb-3">
          <CWidgetStatsF
            className="mb-3 shadow-sm"
            icon={<CIcon icon={cilCheckCircle} height={24} />}
            color="success"
            padding={false}
            title="Puestos Disponibles"
            value={loading ? '...' : puestosDisponibles}
          />
        </CCol>
      </CRow>

      {/* Tarjetas de Navegación Rápida a los Módulos */}
      <CRow>
        <CCol xs={12} md={4} className="mb-4">
          <Link to="/vehiculos" className="text-decoration-none">
            <CCard className="h-100 shadow-sm border-0 py-4 hover-card transition-all">
              <CCardBody className="text-center">
                <div className="text-primary mb-3">
                  <CIcon icon={cilCarAlt} size="3xl" />
                </div>
                <h5 className="fw-bold text-dark">Vehículos y Propietarios</h5>
                <p className="text-muted small mt-1 mb-0">Gestión unificada de autos y usuarios autorizados.</p>
              </CCardBody>
            </CCard>
          </Link>
        </CCol>

        <CCol xs={12} md={4} className="mb-4">
          <Link to="/puestos" className="text-decoration-none">
            <CCard className="h-100 shadow-sm border-0 py-4 hover-card transition-all">
              <CCardBody className="text-center">
                <div className="text-warning mb-3">
                  <CIcon icon={cilGrid} size="3xl" />
                </div>
                <h5 className="fw-bold text-dark">Puestos / Sensores</h5>
                <p className="text-muted small mt-1 mb-0">Monitoreo en vivo de espacios y estado de sensores.</p>
              </CCardBody>
            </CCard>
          </Link>
        </CCol>

        <CCol xs={12} md={4} className="mb-4">
          <Link to="/historial" className="text-decoration-none">
            <CCard className="h-100 shadow-sm border-0 py-4 hover-card transition-all">
              <CCardBody className="text-center">
                <div className="text-success mb-3">
                  <CIcon icon={cilHistory} size="3xl" />
                </div>
                <h5 className="fw-bold text-dark">Historial de Accesos</h5>
                <p className="text-muted small mt-1 mb-0">Consulta de registros de entradas y salidas.</p>
              </CCardBody>
            </CCard>
          </Link>
        </CCol>
      </CRow>
    </>
  )
}