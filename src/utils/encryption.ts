// import crypto from 'crypto';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

// const algorithm: crypto.CipherGCMTypes = 'aes-256-gcm';
// const key: string = crypto.createHash('sha256').update(`${process.env.CRYPTO_KEY}`).digest('base64').substr(0, 32);
// const iv: string = crypto.randomBytes(8).toString('hex').slice(0, 8);

// export const encrypt = (text: string) => {
//     const cipher = crypto.createCipheriv(algorithm, key, iv, { authTagLength: 16 });
//     let crypted = cipher.update(text, 'utf8', 'hex');
//     crypted += cipher.final('hex');
//     const authTag = cipher.getAuthTag();
//     return { crypted, authTagJSON: JSON.stringify(authTag) };
// }

// export const decrypt = (text: string, authTagJSONString: string) => {
//     if (!text) {
//         return text;
//     }

//     const decipher = crypto.createDecipheriv(algorithm, key, iv, { authTagLength: 16 });
//     const authTag = Buffer.from(JSON.parse(authTagJSONString).data);
//     decipher.setAuthTag(authTag);
//     let decrypted = decipher.update(text, 'hex', 'utf8');
//     decrypted += decipher.final('utf-8');
//     return decrypted;
// }

export const secretKey = `${process.env.CRYPTO_KEY}`;