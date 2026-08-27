import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilPeople, cilGrid, cilHistory } from '@coreui/icons'

const Dashboard = () => {
  return (
    <div>
      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-primary text-white fw-bold">
              Bienvenido al Sistema de Gestión - Smart Parking UTEQ
            </CCardHeader>
            <CCardBody>
              <p className="text-medium-emphasis">
                Utiliza el menú lateral izquierdo para navegar entre los módulos de control de estacionamiento:
              </p>
              <CRow className="g-3 mt-2">
                <CCol md={3} sm={6}>
                  <div className="p-3 border rounded bg-light text-center">
                    <CIcon icon={cilSpeedometer} size="3xl" className="text-primary mb-2" />
                    <h6 className="fw-bold">Vehículos</h6>
                    <p className="text-muted small mb-0">Control de autos registrados</p>
                  </div>
                </CCol>
                <CCol md={3} sm={6}>
                  <div className="p-3 border rounded bg-light text-center">
                    <CIcon icon={cilPeople} size="3xl" className="text-info mb-2" />
                    <h6 className="fw-bold">Propietarios</h6>
                    <p className="text-muted small mb-0">Gestión de usuarios y accesos</p>
                  </div>
                </CCol>
                <CCol md={3} sm={6}>
                  <div className="p-3 border rounded bg-light text-center">
                    <CIcon icon={cilGrid} size="3xl" className="text-warning mb-2" />
                    <h6 className="fw-bold">Puestos / Sensores</h6>
                    <p className="text-muted small mb-0">Monitoreo de espacios libres</p>
                  </div>
                </CCol>
                <CCol md={3} sm={6}>
                  <div className="p-3 border rounded bg-light text-center">
                    <CIcon icon={cilHistory} size="3xl" className="text-success mb-2" />
                    <h6 className="fw-bold">Historial</h6>
                    <p className="text-muted small mb-0">Registros de entradas y salidas</p>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Dashboard