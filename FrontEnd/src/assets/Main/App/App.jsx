import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Login from '../../Components/Auth/Login/Login.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from 'react-hot-toast';
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
            <Route path="/public/gallery/:category" element={<PublicGallery />} />
            
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
        theme="dark"
        style={{ top: '20px', left: '50%', transform: 'translateX(-50%)' }}
        toastStyle={{
          background: '#1f2937',
          color: '#d1d5db',
          border: '1px solid #374151',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          fontSize: '0.9rem',
        }}
        progressStyle={{
          background: 'linear-gradient(to right, #FF8C00, #FFB347)',
        }}
      />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#d1d5db',
            border: '1px solid #374151',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            fontSize: '0.9rem',
          },
          success: {
            iconTheme: { primary: '#FF8C00', secondary: '#000' },
          },
          error: {
            iconTheme: { primary: '#dc3545', secondary: '#fff' },
          },
          duration: 3000,
        }}
      />
    </>
  )
}

export default App