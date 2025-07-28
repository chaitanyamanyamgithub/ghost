import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'stealthspeak-!@#-is-super-secret-key-2024';

export function encryptMessage(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.warn('Encryption failed, using plaintext:', error);
    return text;
  }
}

export function decryptMessage(encryptedText: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return originalText;
  } catch (error) {
    console.warn('Decryption failed, using encrypted text:', error);
    return encryptedText;
  }
}

export function generateRoomId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}_${random}`;
}

export function isValidRoomId(roomId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(roomId) && roomId.length >= 5;
}