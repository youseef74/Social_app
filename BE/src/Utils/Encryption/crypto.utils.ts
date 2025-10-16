import crypto from "node:crypto";
import fs from "node:fs";

const IV_LENGTH = parseInt(process.env.IV_LENGTH || "16", 10);
const ENCRYPTION_SECRET_KEY = Buffer.from(process.env.ENCRYPTION_SECRET_KEY || "12345678901234567890123456789012");

export const encrypt = (text: string) :string => {
    const Iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, Iv);

    let encryptedData = cipher.update(text, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');

    return `${Iv.toString('hex')}:${encryptedData}`;
};

export const decrypt = (text: string) :string => {
    const [iv, encryptedtext] = text.split(':');
    const binaryLike = Buffer.from(iv, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, binaryLike);

    let decryptedData = decipher.update(encryptedtext, 'hex', 'utf-8');
    decryptedData += decipher.final('utf-8');

    return decryptedData;
};


if(fs.existsSync('publicKey.pem')&&fs.existsSync('privateKey.pem')){
    console.log("Keys already exist");

}else{
    const {publicKey,privateKey} = crypto.generateKeyPairSync('rsa',{
        modulusLength:2048,
        publicKeyEncoding:{
            type:'spki',
            format:'pem'
        },
        privateKeyEncoding:{
            type:'pkcs8',
            format:'pem'
        }
    })
    
    fs.writeFileSync('publicKey.pem',publicKey)
    fs.writeFileSync('privateKey.pem',privateKey)
    }

