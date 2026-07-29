// Encrypts sensitive fields (currently: client phone numbers) before they're
// stored, so raw data in the database isn't readable even if the database
// itself were ever compromised. Uses Node's built-in crypto — no extra
// package needed.
//
// Requires ENCRYPTION_KEY in .env — a 64-character hex string (32 bytes).
// Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// Losing this key means previously-encrypted data can never be read again —
// back it up somewhere safe, separate from your database backups.

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : null;

function encrypt(text) {
    if (text === null || text === undefined || text === '') return null;
    if (!KEY) throw new Error('ENCRYPTION_KEY is not set in .env — cannot encrypt.');

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

function decrypt(payload) {
    if (!payload) return null;
    if (!KEY) throw new Error('ENCRYPTION_KEY is not set in .env — cannot decrypt.');

    const parts = payload.split(':');
    if (parts.length !== 3) return payload; // not our encrypted format (e.g. old plaintext data) — return as-is

    try {
        const [ivHex, tagHex, dataHex] = parts;
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        return payload; // wrong key or corrupted data — fail safe by returning the raw value
    }
}

<<<<<<< HEAD
module.exports = { encrypt, decrypt };
=======
module.exports = { encrypt, decrypt };
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
