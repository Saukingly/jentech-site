// One-time use: encrypts any existing plaintext phone numbers in the
// clients table. Safe to run more than once — already-encrypted values are
// left alone. Run from the /server folder: node encrypt-existing-phones.js
//
// Run this AFTER database/privacy_and_encryption.sql and AFTER
// ENCRYPTION_KEY is set in your .env.

const db = require('./db');
const { encrypt, decrypt } = require('./utils/encryption');

function looksAlreadyEncrypted(value) {
    return typeof value === 'string' && value.split(':').length === 3;
}

async function run() {
    try {
        const [rows] = await db.query('SELECT id, phone FROM clients WHERE phone IS NOT NULL');
        let converted = 0;

        for (const row of rows) {
            if (looksAlreadyEncrypted(row.phone)) continue; // already done
            const encrypted = encrypt(row.phone);
            await db.query('UPDATE clients SET phone = ? WHERE id = ?', [encrypted, row.id]);
            converted++;
        }

        console.log(`Done. Encrypted ${converted} phone number(s); ${rows.length - converted} were already encrypted.`);
    } catch (err) {
        console.error('Error encrypting existing phone numbers:', err.message);
    }
    process.exit();
}

run();