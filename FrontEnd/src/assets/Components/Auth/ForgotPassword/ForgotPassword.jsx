import React, { useState, useEffect } from 'react';
import '../Login/Login.css';

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('email');
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(false);
  const [timer, setTimer] = useState(null);
  const [idResetPassword, setIdResetPassword] = useState(0);
  const startTimer = () => {
    if (timer) clearInterval(timer);
    
    const newTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(newTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/recover/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('');
        setStep('code');
        setTimeLeft(120);
        startTimer();
      } else {
        setMessage(data.message || 'Error al enviar el código');
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendCooldown(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:3000/recover/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setTimeLeft(120);
        startTimer();
        setMessage('Código reenviado correctamente');
        setTimeout(() => setResendCooldown(false), 30000);
      }
    } catch (error) {
      setMessage('Error al reenviar el código');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/recover/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      setIdResetPassword(data.id);
      console.log("SET ID PASSWORD 1 : ", idResetPassword)
      if (response.ok && data.valid) {
        console.log("ENTRO AL SET STEP")
        setStep('newPassword');
        setMessage('');
      } else {
        setMessage(data.message || 'Código inválido');
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("id reser password", idResetPassword)
      const response = await fetch('http://localhost:3000/recover/reset-password', {    
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          idResetPassword,
          newPassword 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStep('success');
        setMessage('Contraseña actualizada correctamente');
      } else {
        setMessage(data.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>

        {step === 'email' && (
          <>
            <div className="modal-icon">
              <svg className="modal-check" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7H9V5.5L3 7V9L9 10.5V12L3 13.5V15.5L9 14V16H15V14L21 15.5V13.5L15 12V10.5L21 9Z"/>
              </svg>
            </div>

            <h3 className="modal-title">Recuperar Contraseña</h3>
            
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-input"
                  placeholder="Ingresa tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {message && <p className="modal-message error">{message}</p>}

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>
          </>
        )}

        {step === 'code' && (
          <>
            <div className="modal-icon">
              <svg className="modal-check" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7H9V5.5L3 7V9L9 10.5V12L3 13.5V15.5L9 14V16H15V14L21 15.5V13.5L15 12V10.5L21 9Z"/>
              </svg>
            </div>

            <h3 className="modal-title">Verificar Código</h3>
            <p className="modal-message">Se envió un código de 6 dígitos a: {email}</p>
            
            {timeLeft > 0 && (
              <p className="modal-message">
                ⏰ El código expira en: {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </p>
            )}
            
            {timeLeft === 0 && (
              <p className="modal-message error">❌ El código ha expirado</p>
            )}

            <form onSubmit={handleVerifyCode} className="form">
              <div className="form-group">
                <label className="form-label">Código de 6 dígitos</label>
                <input 
                  type="text" 
                  className="form-input code-input"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                  }}
                  required
                  disabled={isLoading || timeLeft === 0}
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>

              {message && <p className="modal-message error">{message}</p>}

              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button 
                  type="submit" 
                  className="submit-button" 
                  disabled={isLoading || timeLeft === 0}
                >
                  {isLoading ? 'Verificando...' : 'Verificar código'}
                </button>

                <button 
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown || isLoading}
                  className="resend-button"
                >
                  {resendCooldown ? 'Reenviar en 30s' : 'Reenviar código'}
                </button>
              </div>
            </form>

            <button 
              onClick={() => {
                setStep('email');
                setMessage('');
                setCode('');
                if (timer) clearInterval(timer);
              }}
              className="modal-button"
              style={{ marginTop: '15px' }}
            >
              ↶ Cambiar email
            </button>
          </>
        )}

        {step === 'newPassword' && (
          <>
            <div className="modal-icon">
              <svg className="modal-check" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7H9V5.5L3 7V9L9 10.5V12L3 13.5V15.5L9 14V16H15V14L21 15.5V13.5L15 12V10.5L21 9Z"/>
              </svg>
            </div>

            <h3 className="modal-title">Nueva Contraseña</h3>
            <p className="modal-message">Crea una nueva contraseña para tu cuenta</p>

            <form onSubmit={handleResetPassword} className="form">
              <div className="form-group">
                <label className="form-label">Nueva Contraseña</label>
                <input 
                  type="password" 
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  className="form-input"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {message && <p className="modal-message error">{message}</p>}

              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button 
                  type="submit" 
                  className="submit-button" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep('code')}
                  className="modal-button"
                >
                  ↶ Volver al código
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="modal-icon success">
              <svg className="modal-check" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>

            <h3 className="modal-title">¡Contraseña Actualizada!</h3>
            <p className="modal-message">Tu contraseña ha sido cambiada exitosamente</p>

            <button 
              onClick={onClose}
              className="submit-button"
            >
              Iniciar Sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;