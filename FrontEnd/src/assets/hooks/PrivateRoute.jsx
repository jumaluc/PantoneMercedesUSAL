import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children, allowedRoles }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/auth/me', {
          credentials: 'include'
        });

        if (!isMounted) return;

        if (!response.ok) {
          throw new Error('Error de autenticación');
        }

        const data = await response.json();
        
        if (isMounted) {
          if (data && data.role) {
            setRole(data.role);
          } else {
            setError('No se pudo obtener el rol del usuario');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error verificando autenticación:', err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div>Cargando...</div>
        {/* Puedes agregar un spinner aquí */}
      </div>
    );
  }

  if (error || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Opcional: redirigir a una página de "no autorizado" en lugar de login
    return <h1>Acceso denegado</h1>;
  }

  return children;
};