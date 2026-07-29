const rateLimit = require('express-rate-limit');

// Applies to login endpoints (staff + client). Locks an IP out after too many
// failed attempts in a short window — the actual protection a public admin
// login page needs, since the URL itself being visible is not the real risk.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 8, // 8 attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' }
});

// Looser limit for signup / resend-verification — these are hit far less
// often by a real user, so a lower ceiling is fine.
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts from this device. Please try again later.' }
});

module.exports = { loginLimiter, signupLimiter };