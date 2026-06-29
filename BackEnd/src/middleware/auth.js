const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Acceso denegado' });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ message: 'Acceso no autorizado' });
    }
    next();
};

module.exports = { requireAuth, requireAdmin };
