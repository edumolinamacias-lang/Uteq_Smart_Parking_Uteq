import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilCarAlt,
  cilGrid,
  cilHistory,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Gestión del Parqueadero',
  },
  {
    component: CNavItem,
    name: 'Vehículos y Propietarios',
    to: '/vehiculos',
    icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Puestos / Sensores',
    to: '/puestos',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Historial de Parqueo',
    to: '/historial',
    icon: <CIcon icon={cilHistory} customClassName="nav-icon" />,
  },
]

export default _nav