// Protects any admin route — redirect to login if not logged in
function requireLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
}

function requireAdmin(req, res, next) {
    if (req.session && req.session.role === 'admin') {
        return next();
    }
    res.status(403).json({ error: 'Forbidden. Admins only.' });
}

// Protects client portal routes — separate from staff sessions above
function requireClientLogin(req, res, next) {
    if (req.session && req.session.clientId) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
}

module.exports = { requireLogin, requireAdmin, requireClientLogin };