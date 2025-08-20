import { useState } from 'react'
import '../Estilos/App.css'
import Login from './Login.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  const [count, setCount] = useState(0)

  return (

    <>
    <Login></Login>
    <ToastContainer position="top-center" autoClose={3000} />

    </>
  )

}

export default App
