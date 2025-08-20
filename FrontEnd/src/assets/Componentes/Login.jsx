import React, { useState } from 'react';
import '../Estilos/Login.css';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [errors, setErrors] = useState({});

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    cel: '',
    email: '',
    password: '',
    password2: '',
    acceptTerm: false
  });

  const handleChangeLogin = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleChangeRegister = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validaciones para login
  const validateLogin = () => {
    const newErrors = {};

    // Validar email
    if (!loginData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Validar password
    if (!loginData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (loginData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validaciones para registro
  const validateRegister = () => {
    const newErrors = {};

    // Validar nombre
    if (!registerData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    } else if (registerData.firstName.length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar apellido
    if (!registerData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    } else if (registerData.lastName.length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 3 caracteres';
    }

    // Validar email
    if (!registerData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Validar teléfono
    if (!registerData.cel) {
      newErrors.cel = 'El teléfono es requerido';
    } else if (!/^[+]?[0-9\s\-\(\)]{10,}$/.test(registerData.cel)) {
      newErrors.cel = 'El formato del teléfono no es válido';
    }

    // Validar contraseña
    if (!registerData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.password)) {
      newErrors.password = 'La contraseña debe contener mayúsculas, minúsculas y números';
    }

    // Validar confirmación de contraseña
    if (!registerData.password2) {
      newErrors.password2 = 'Debes confirmar la contraseña';
    } else if (registerData.password !== registerData.password2) {
      newErrors.password2 = 'Las contraseñas no coinciden';
    }

    // Validar términos y condiciones
    if (!registerData.acceptTerm) {
      newErrors.acceptTerm = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const login = () => {
    if (!validateLogin()) {
      setModalMessage('Por favor, corrige los errores en el formulario');
      setShowModal(true);
      return;
    }

    console.log('Login exitoso:', loginData);
    setModalMessage('Inicio de sesión exitoso. Redirigiendo al dashboard...');
    setShowModal(true);
    
    // Aquí iría la lógica real de login (API call, etc.)
  };

  const register = () => {
    if (!validateRegister()) {
      setModalMessage('Por favor, corrige los errores en el formulario');
      setShowModal(true);
      return;
    }

    console.log('Registro exitoso:', registerData);
    setModalMessage('¡Cuenta creada exitosamente! Se ha enviado un email de confirmación.');
    setShowModal(true);
    
    // Aquí iría la lógica real de registro (API call, etc.)
  };

  const closeDemoModal = () => {
    setShowModal(false);
  };

  return (
    <div className="login-container">
      {/* Background Pattern */}
      <div className="background-pattern"></div>

      {/* Main Container */}
      <div className="main-container">
        
        {/* Left Side - Branding */}
        <div className="branding-section">
          <div className="branding-content">
            {/* Logo/Icon */}
            <div className="camera-icon">
              <svg className="camera-svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15.5c1.93 0 3.5-1.57 3.5-3.5S13.93 8.5 12 8.5 8.5 10.07 8.5 12s1.57 3.5 3.5 3.5zm0-5c.83 0 1.5.67 1.5 1.5S12.83 13.5 12 13.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/>
                <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24L16 6h4v12z"/>
              </svg>
            </div>
            
            <h1 className="brand-title">
              Pantone <span className="brand-accent">Mercedes</span>
            </h1>
            <p className="brand-description">
              Capturamos momentos únicos con la más alta calidad profesional
            </p>
            
            {/* Features */}
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-dot orange-dot"></div>
                <span>Fotografía profesional de eventos</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot yellow-dot"></div>
                <span>Sesiones de retratos personalizadas</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot orange-dot"></div>
                <span>Edición y retoque de alta gama</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="form-section">
          <div className="form-container">
            
            {/* Form Toggle Buttons */}
            <div className="tab-buttons">
              <button 
                className={`tab-button ${activeTab === 'login' ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab('login')}
              >
                Iniciar Sesión
              </button>
              <button 
                className={`tab-button ${activeTab === 'register' ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab('register')}
              >
                Registrarse
              </button>
            </div>

            {/* Login Form */}
            <div className={`form-content ${activeTab === 'login' ? '' : 'form-hidden'}`}>
              <h2 className="form-title">Bienvenido de vuelta</h2>
              
              <form className="form" onSubmit={(e) => { e.preventDefault(); login(); }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className={`form-input ${errors.email ? 'input-error' : ''}`} 
                    placeholder="tu@email.com" 
                    value={loginData.email} 
                    onChange={handleChangeLogin} 
                    name="email"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input 
                    type="password" 
                    className={`form-input ${errors.password ? 'input-error' : ''}`} 
                    placeholder="••••••••" 
                    value={loginData.password} 
                    onChange={handleChangeLogin} 
                    name="password"
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
                
                <div className="form-options">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="form-checkbox" 
                      onChange={handleChangeLogin} 
                      name="remember"
                      checked={loginData.remember}
                    />
                    <span className="checkbox-text">Recordarme</span>
                  </label>
                  <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                >
                  Iniciar Sesión
                </button>
              </form>
            </div>

            {/* Register Form */}
            <div className={`form-content ${activeTab === 'register' ? '' : 'form-hidden'}`}>
              <h2 className="form-title">Crear cuenta nueva</h2>
              
              <form className="form" onSubmit={(e) => { e.preventDefault(); register(); }}>
                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input 
                      type="text" 
                      className={`form-input ${errors.firstName ? 'input-error' : ''}`} 
                      placeholder="Nombre" 
                      value={registerData.firstName} 
                      name='firstName' 
                      onChange={handleChangeRegister} 
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Apellido</label>
                    <input 
                      type="text" 
                      className={`form-input ${errors.lastName ? 'input-error' : ''}`} 
                      placeholder="Apellido" 
                      value={registerData.lastName} 
                      name='lastName' 
                      onChange={handleChangeRegister}  
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className={`form-input ${errors.email ? 'input-error' : ''}`} 
                    placeholder="tu@email.com" 
                    value={registerData.email} 
                    name='email' 
                    onChange={handleChangeRegister} 
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input 
                    type="tel" 
                    className={`form-input ${errors.cel ? 'input-error' : ''}`} 
                    placeholder="+54 11 1234-5678" 
                    value={registerData.cel} 
                    name='cel' 
                    onChange={handleChangeRegister}
                  />
                  {errors.cel && <span className="error-message">{errors.cel}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input 
                    type="password" 
                    className={`form-input ${errors.password ? 'input-error' : ''}`} 
                    placeholder="••••••••" 
                    value={registerData.password} 
                    name='password' 
                    onChange={handleChangeRegister} 
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Confirmar Contraseña</label>
                  <input 
                    type="password" 
                    className={`form-input ${errors.password2 ? 'input-error' : ''}`} 
                    placeholder="••••••••" 
                    value={registerData.password2} 
                    name='password2' 
                    onChange={handleChangeRegister} 
                  />
                  {errors.password2 && <span className="error-message">{errors.password2}</span>}
                </div>
                
                <div className="form-checkbox-group">
                  <input 
                    type="checkbox" 
                    className={`form-checkbox ${errors.acceptTerm ? 'checkbox-error' : ''}`} 
                    name='acceptTerm' 
                    onChange={handleChangeRegister} 
                    checked={registerData.acceptTerm}
                  />
                  <span className="checkbox-text">
                    Acepto los <a href="#" className="terms-link">términos y condiciones</a>
                  </span>
                  {errors.acceptTerm && <span className="error-message">{errors.acceptTerm}</span>}
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                >
                  Crear Cuenta
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de errores/éxito */}
      {showModal && (
        <div 
          className="modal-overlay"
          onClick={closeDemoModal}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon">
              <svg className="modal-check" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
            <h3 className="modal-title">
              {modalMessage.includes('error') ? '¡Error!' : '¡Éxito!'}
            </h3>
            <p className="modal-message">{modalMessage}</p>
            <button 
              onClick={closeDemoModal} 
              className="modal-button"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;