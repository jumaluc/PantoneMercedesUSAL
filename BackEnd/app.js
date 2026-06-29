const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


const recoverPasswRoutes = require('./src/routes/recoverPasswRoutes');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const publicRoutes = require('./src/routes/publicRoutes');
const adminPublicRoutes = require('./src/routes/adminPublicRoutes');

//MIDDLEWARE
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5199',
    ];
    if (!origin || allowed.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    const token = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    req.session = { user: null };

    try {
        // Access token válido → sesión normal
        const data = jwt.verify(token, process.env.SECRET_WEB_TOKEN);
        req.session.user = data;
    } catch (error) {
        // Access token expirado/inválido → intentar con refresh token
        if (refreshToken) {
            try {
                const refreshData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                // Emitir nuevo access token transparentemente
                const newAccessToken = jwt.sign(
                    { id: refreshData.id, role: refreshData.role },
                    process.env.SECRET_WEB_TOKEN,
                    { expiresIn: '1h' }
                );
                res.cookie('access_token', newAccessToken, {
                    httpOnly: true,
                    sameSite: 'strict',
                    maxAge: 1000 * 60 * 60
                });
                req.session.user = { id: refreshData.id, role: refreshData.role };
            } catch (refreshError) {
                // Refresh token también expirado → sin sesión, el usuario deberá loguearse
            }
        }
    }
    next();
});


// Rutas públicas
app.use('/api/public', publicRoutes);

// Rutas administrativas para contenido público
app.use('/api/admin/public-content', adminPublicRoutes);
app.use('/user',userRoutes);
app.use('/auth',authRoutes);
app.use('/recover',recoverPasswRoutes);
app.use('/admin', adminRoutes)

module.exports = app;



