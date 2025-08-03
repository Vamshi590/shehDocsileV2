import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import InPatients from './pages/InPatients'
import Prescriptions from './pages/Prescriptions'
import Reports from './pages/Reports'
import Operations from './pages/Operations'
import DuesFollowUp from './pages/DuesFollowUp'
import Data from './pages/Data'
import Opticals from './pages/Opticals'
import Medicines from './pages/Medicines'
import Analytics from './pages/Analytics'
import Staff from './pages/Staff'
import Labs from './pages/Labs'
import CertificateGenerator from './components/certificates/CertificateGenerator'

function App(): React.JSX.Element {
  const [route, setRoute] = useState<string>('/login')

  // Simple hash-based routing
  useEffect(() => {
    const handleHashChange = (): void => {
      const hash = window.location.hash.replace('#', '') || '/login'
      setRoute(hash)
    }

    // Set initial route
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  // Render the appropriate component based on the route
  const renderRoute = (): React.JSX.Element => {
    switch (route) {
      case '/login':
        return <Login />
      case '/dashboard':
        return <Dashboard />
      case '/patients':
        return <Patients />
      case '/inpatients':
        return <InPatients />
      case '/operations':
        return <Operations />
      case '/prescriptions':
        return <Prescriptions />
      case '/reports':
        return <Reports />
      case '/dues-followup':
        return <DuesFollowUp />
      case '/data':
        return <Data />
      case '/opticals':
        return <Opticals />
      case '/medicines':
        return <Medicines />
      case '/analytics':
        return <Analytics />
      case '/staff':
        return <Staff />
      case '/labs':
        return <Labs />
      case '/certificates':
        return <CertificateGenerator />
      default:
        return <Login />
    }
  }

  return <div className="font-sans">{renderRoute()}</div>
}

export default App
