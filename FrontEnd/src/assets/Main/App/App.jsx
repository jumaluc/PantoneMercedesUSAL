import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Login from '../../Components/Auth/Login/Login.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientDashboard from '../../Components/Client/ClientDashboard.jsx';
import AdminDashboard from '../../Components/Admin/AdminDashboard.jsx';
import { PrivateRoute } from '../../hooks/PrivateRoute.jsx';

function App() {


  return (
    <>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
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
          <Route path="*" element={<Navigate to="/login" replace />} />
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