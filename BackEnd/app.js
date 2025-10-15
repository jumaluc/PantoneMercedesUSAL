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
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next)=>{

    const token = req.cookies.access_token;
    req.session = {user :  null};
    try{
        const data = jwt.verify(token, process.env.SECRET_WEB_TOKEN)
        req.session.user = data;
    }
    catch(error){}
    next()
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



