import CryptoJS from 'crypto-js';
import { ENCRYPTION_KEY } from '@/config';

export function encryptMessage(text: string): string {
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return "";
  }
}

export function decryptMessage(ciphertext: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) {
      // This can happen if the key is wrong or data is corrupt
      return "Error: Could not decrypt message.";
    }
    return originalText;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "Error: Could not decrypt message.";
  }
}
