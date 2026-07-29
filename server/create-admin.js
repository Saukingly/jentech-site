// One-time use: creates the first admin account so you can log into the
// dashboard and create every other staff account from there afterward.
//
// Run from the /server folder:
//   node create-admin.js
//
// Then delete this file (or just leave it — running it again is safe,
// it'll just fail with "Email already in use" if the account already exists).

const bcrypt = require('bcryptjs');
const db = require('./db');

const NAME = 'Admin';
const EMAIL = 'admin@jentech.com'; // change this to your real email if you'd like
const PASSWORD = 'ChangeMe123!'; // CHANGE THIS after your first login

async function run() {
    try {
        const hashed = await bcrypt.hash(PASSWORD, 10);
        await db.query(
            'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)', [NAME, EMAIL, hashed, 'admin', null]
        );
        console.log('✅ Admin account created!');
        console.log('   Email:   ' + EMAIL);
        console.log('   Password:' + ' ' + PASSWORD);
        console.log('   Log in at /pages/admin/login.html, then change this password ASAP.');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.log('An account with that email already exists — nothing to do.');
        } else {
            console.error('Error creating admin:', err);
        }
    }
    process.exit();
}

run();
