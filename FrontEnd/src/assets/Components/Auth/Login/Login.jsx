import React, { useState } from 'react';
import './Login.css';
import { toast } from "react-toastify";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [modalType, setModalType] = useState('success');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    number: '',
    email: '',
    password: '',
    password2: '',
    service: '',
    acceptTerm: false
  });

  const handleChangeLogin = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
 
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
   
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateLogin = () => {
    const newErrors = {};

    if (!loginData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!loginData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (loginData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors = {};

    if (!registerData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    } else if (registerData.first_name.length < 2) {
      newErrors.first_name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!registerData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    } else if (registerData.last_name.length < 2) {
      newErrors.last_name = 'El apellido debe tener al menos 3 caracteres';
    }

    if (!registerData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }
    
    if (!registerData.service) {
      newErrors.service = 'Debes seleccionar un tipo de servicio';
    }

    if (!registerData.number) {
      newErrors.number = 'El teléfono es requerido';
    } else if (!/^[+]?[0-9\s\-\(\)]{10,}$/.test(registerData.number)) {
      newErrors.number = 'El formato del teléfono no es válido';
    }

    if (!registerData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.password)) {
      newErrors.password = 'La contraseña debe contener mayúsculas, minúsculas y números';
    }

    if (!registerData.password2) {
      newErrors.password2 = 'Debes confirmar la contraseña';
    } else if (registerData.password !== registerData.password2) {
      newErrors.password2 = 'Las contraseñas no coinciden';
    }

    if (!registerData.acceptTerm) {
      newErrors.acceptTerm = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const login = () => {
  if (!validateLogin()) {
    setModalType('error');
    setModalMessage('Por favor, corrige los errores en el formulario');
    setShowModal(true);
    return;
  }

  fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
    credentials: 'include'
  })
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error en la autenticación');
      }
      return res.json();
    })
    .then(data => {
      if (data.role === "admin") {
        navigate('/adminDashboard');
      } else if (data.role === 'client') {
        navigate('/clientDashboard');
      } else {
        throw new Error('Rol no reconocido');
      }
    })
  .catch((error) => {
    const errorMessage = error.message || 'Error de conexión con el servidor';
    toast.error(`❌ ${errorMessage}`);
    setModalType('error');
    setModalMessage(`Error: ${errorMessage}`);
    setShowModal(true);
  });
};

  const register = () => {
    if (!validateRegister()) {
      setModalType('error');
      setModalMessage('Por favor, corriges los errores en el formulario');
      setShowModal(true);
      return;
    }

    fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.error || 'Error en la creación del cliente');
        });
      }
      return response.json();
    })
    .then(data => {
      setModalType('success');
      setModalMessage('¡Cuenta creada exitosamente! Se ha enviado un email de confirmación.');
      setShowModal(true);
      setRegisterData({
        first_name: '',
        last_name: '',
        number: '',
        email: '',
        password: '',
        password2: '',
        service: '',
        acceptTerm: false
      }
      
    );
    setErrors({})
    })
    .catch(error => {
      setModalType('error');
      setModalMessage(error.message);
      const newErrors = {};
      newErrors.email = 'Email en uso';
      setErrors(newErrors);
      setShowModal(true);
      return Object.keys(newErrors).length === 0;
    });
  };

  const closeDemoModal = () => {
    setShowModal(false);
  };

  return (
    <div className="lg-login-container">
      <div className="lg-background-pattern"></div>

      <div className="lg-main-container">
        
        <div className="lg-branding-section">
          <div className="lg-branding-content">
            <div className="lg-camera-icon">
              <svg className="lg-camera-svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15.5c1.93 0 3.5-1.57 3.5-3.5S13.93 8.5 12 8.5 8.5 10.07 8.5 12s1.57 3.5 3.5 3.5zm0-5c.83 0 1.5.67 1.5 1.5S12.83 13.5 12 13.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/>
                <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24L16 6h4v12z"/>
              </svg>
            </div>
            
            <h1 className="lg-brand-title">
              Pantone <span className="lg-brand-accent">Mercedes</span>
            </h1>
            <p className="lg-brand-description">
              Capturamos momentos únicos con la más alta calidad profesional
            </p>
            
            <div className="lg-features-list">
              <div className="lg-feature-item">
                <div className="lg-feature-dot lg-orange-dot"></div>
                <span>Fotografía profesional de eventos</span>
              </div>
              <div className="lg-feature-item">
                <div className="lg-feature-dot lg-yellow-dot"></div>
                <span>Sesiones de retratos personalizadas</span>
              </div>
              <div className="lg-feature-item">
                <div className="lg-feature-dot lg-orange-dot"></div>
                <span>Edición y retoque de alta gama</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg-form-section">
          <div className="lg-form-container">
            
            <div className="lg-tab-buttons">
              <button 
                className={`lg-tab-button ${activeTab === 'login' ? 'lg-tab-active' : 'lg-tab-inactive'}`}
                onClick={() => setActiveTab('login')}
              >
                Iniciar Sesión
              </button>
              <button 
                className={`lg-tab-button ${activeTab === 'register' ? 'lg-tab-active' : 'lg-tab-inactive'}`}
                onClick={() => setActiveTab('register')}
              >
                Registrarse
              </button>
            </div>

            <div className={`lg-form-content ${activeTab === 'login' ? '' : 'lg-form-hidden'}`}>
              <h2 className="lg-form-title">Bienvenido de vuelta</h2>
              
              <form className="lg-form" onSubmit={(e) => { e.preventDefault(); login(); }}>
                <div className="lg-form-group">
                  <label className="lg-form-label">Email</label>
                  <input 
                    type="email" 
                    className={`lg-form-input ${errors.email ? 'lg-input-error' : ''}`} 
                    placeholder="tu@email.com" 
                    value={loginData.email} 
                    onChange={handleChangeLogin} 
                    name="email"
                  />
                  {errors.email && <span className="lg-error-message">{errors.email}</span>}
                </div>
                
                <div className="lg-form-group">
                  <label className="lg-form-label">Contraseña</label>
                  <input 
                    type="password" 
                    className={`lg-form-input ${errors.password ? 'lg-input-error' : ''}`} 
                    placeholder="••••••••" 
                    value={loginData.password} 
                    onChange={handleChangeLogin} 
                    name="password"
                  />
                  {errors.password && <span className="lg-error-message">{errors.password}</span>}
                </div>
                
                <div className="lg-form-options">
                  <label className="lg-checkbox-label">
                    <input 
                      type="checkbox" 
                      className="lg-form-checkbox" 
                      onChange={handleChangeLogin} 
                      name="remember"
                      checked={loginData.remember}
                    />
                    <span className="lg-checkbox-text">Recordarme</span>
                  </label>
                  <a href="#" className="lg-forgot-link" onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPassword(true);
                  }}>
                    ¿Olvidaste tu contraseña?
                  </a>                
                </div>
                
                <button 
                  type="submit" 
                  className="lg-submit-button"
                  id="lg-submit-button-login"
                >
                  Iniciar Sesión
                </button>
              </form>
            </div>

            <div className={`lg-form-content ${activeTab === 'register' ? '' : 'lg-form-hidden'}`}>
              <h2 className="lg-form-title">Crear cuenta nueva</h2>
              
              <form className="lg-form" onSubmit={(e) => { e.preventDefault(); register(); }}>
                <div className="lg-form-column">
                  <div className="lg-form-group">
                    <label className="lg-form-label">Nombre</label>
                    <input 
                      type="text" 
                      className={`lg-form-input ${errors.first_name ? 'lg-input-error' : ''}`} 
                      placeholder="Nombre" 
                      value={registerData.first_name} 
                      name='first_name' 
                      onChange={handleChangeRegister} 
                    />
                    {errors.first_name && <span className="lg-error-message">{errors.first_name}</span>}
                  </div>
                  <div className="lg-form-group">
                    <label className="lg-form-label">Apellido</label>
                    <input 
                      type="text" 
                      className={`lg-form-input ${errors.last_name ? 'lg-input-error' : ''}`} 
                      placeholder="Apellido" 
                      value={registerData.last_name} 
                      name='last_name' 
                      onChange={handleChangeRegister}  
                    />
                    {errors.last_name && <span className="lg-error-message">{errors.last_name}</span>}
                  </div>
                </div>
                
                <div className="lg-form-group">
                  <label className="lg-form-label">Email</label>
                  <input 
                    type="email" 
                    className={`lg-form-input ${errors.email ? 'lg-input-error' : ''}`} 
                    placeholder="tu@email.com" 
                    value={registerData.email} 
                    name='email' 
                    onChange={handleChangeRegister} 
                  />
                  {errors.email && <span className="lg-error-message">{errors.email}</span>}
                </div>
                
                <div className="lg-form-group">
                  <label className="lg-form-label">Teléfono</label>
                  <input 
                    type="tel" 
                    className={`lg-form-input ${errors.number ? 'lg-input-error' : ''}`} 
                    placeholder="+54 11 1234-5678" 
                    value={registerData.number} 
                    name='number' 
                    onChange={handleChangeRegister}
                  />
                  {errors.number && <span className="lg-error-message">{errors.number}</span>}
                </div>
                
                <div className="lg-form-group">
                  <label className="lg-form-label">Contraseña</label>
                  <input 
                    type="password" 
                    className={`lg-form-input ${errors.password ? 'lg-input-error' : ''}`} 
                    placeholder="••••••••" 
                    value={registerData.password} 
                    name='password' 
                    onChange={handleChangeRegister} 
                  />
                  {errors.password && <span className="lg-error-message">{errors.password}</span>}
                </div>
                
                <div className="lg-form-group">
                  <label className="lg-form-label">Confirmar Contraseña</label>
                  <input 
                    type="password" 
                    className={`lg-form-input ${errors.password2 ? 'lg-input-error' : ''}`} 
                    placeholder="••••••••" 
                    value={registerData.password2} 
                    name='password2' 
                    onChange={handleChangeRegister} 
                  />
                  {errors.password2 && <span className="lg-error-message">{errors.password2}</span>}
                </div>

                <div className="lg-form-group">
                  <label className="lg-form-label">Tipo de Servicio</label>
                  <select 
                    className={`lg-form-input ${errors.service ? 'lg-input-error' : ''}`}
                    value={registerData.service} 
                    name='service' 
                    onChange={handleChangeRegister}
                    required
                  >
                    <option value="">Selecciona un servicio</option>
                    <option value="fotografia">XV</option>
                    <option value="video">Casamiento</option>
                    <option value="retrato">Book</option>
                    <option value="eventos">Bautismo</option>
                    <option value="producto">Evento Coorporativo</option>
                    <option value="dron">Otros</option>
                  </select>
                  {errors.service && <span className="lg-error-message">{errors.service}</span>}
                </div>

                <div className="lg-form-checkbox-group">
                  <input 
                    type="checkbox" 
                    className={`lg-form-checkbox ${errors.acceptTerm ? 'lg-checkbox-error' : ''}`} 
                    name='acceptTerm' 
                    onChange={handleChangeRegister} 
                    checked={registerData.acceptTerm}
                  />
                  <span className="lg-checkbox-text">
                    Acepto los <a href="#" className="lg-terms-link">términos y condiciones</a>
                  </span>
                  {errors.acceptTerm && <span className="lg-error-message">{errors.acceptTerm}</span>}
                </div>
                
                <button 
                  type="submit" 
                  className="lg-submit-button"
                >
                  Crear Cuenta
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div 
          className="lg-modal-overlay"
          onClick={closeDemoModal}
        >
          <div 
            className={`lg-modal-content ${modalType === 'error' ? 'lg-modal-error' : 'lg-modal-success'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lg-modal-icon">
              {modalType === 'error' ? (
                <svg className="lg-modal-error-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              ) : (
                <svg className="lg-modal-success-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              )}
            </div>
            <h3 className="lg-modal-title">
              {modalType === 'error' ? '¡Error!' : '¡Éxito!'}
            </h3>
            <p className="lg-modal-message">{modalMessage}</p>
            <button 
              onClick={closeDemoModal} 
              className={`lg-modal-button ${modalType === 'error' ? 'lg-modal-button-error' : 'lg-modal-button-success'}`}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Login;