// Shared password strength rule — used by both client signup and the
// client portal's "change password" feature, so they always agree.
function validatePassword(password) {
    if (!password || password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) return 'Password must include at least one letter and one number.';
    return null;
}

<<<<<<< HEAD
module.exports = { validatePassword };
=======
module.exports = { validatePassword };
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
