import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../Styles/App.css'
import Login from './Login.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from './Dashboard';

function App() {
  return (
    <>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <>
              <Login />
              <ToastContainer position="top-center" autoClose={3000} />
            </>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
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
          theme="light" // ← Cambia de "colored" a "light" para fondo blanco
          style={{
            top: '20px', // Ajusta la posición vertical
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          toastStyle={{
            background: '#ffffff', // Fondo blanco sólido
            color: '#333333', // Texto oscuro
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
          progressStyle={{
            background: 'linear-gradient(to right, #4CAF50, #45a049)', // Barra de progreso verde
          }}
        />
    </>
  )
}

export default App