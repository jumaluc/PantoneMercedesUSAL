import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Login from '../../Components/Auth/Login/Login.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientDashboard from '../../Components/Client/ClientDashboard.jsx';
import AdminDashboard from '../../Components/Admin/AdminDashboard.jsx';
import { PrivateRoute } from '../../hooks/PrivateRoute.jsx';
import PublicHome from '../../Components/PublicWebsite/PublicLayout.jsx';
import PublicGallery from '../../Components/PublicWebsite/PublicGallery.jsx'; // Importa el componente correcto

function App() {
  return (
    <>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta pública principal */}
            <Route path="/" element={<PublicHome />} />
            
            {/* Rutas públicas para galerías */}
            <Route path="/public/gallery" element={<PublicGallery />} />
            <Route path="/public/gallery/casamientos" element={<PublicGallery category="casamientos" />} />
            <Route path="/public/gallery/xv-anos" element={<PublicGallery category="xv-anos" />} />
            <Route path="/public/gallery/bautizos" element={<PublicGallery category="bautizos" />} />
            
            {/* Ruta de login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas */}
            <Route
              path="/clientDashboard"
              element={
                <PrivateRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/adminDashboard"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            
            {/* Redirección para rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        toastStyle={{
          background: '#ffffff',
          color: '#333333',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        progressStyle={{
          background: 'linear-gradient(to right, #4CAF50, #45a049)',
        }}
      />
    </>
  )
}

export default App