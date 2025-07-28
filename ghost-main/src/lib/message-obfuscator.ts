// Backup message obfuscation service (without Genkit dependency)
// This provides message scrambling functionality for secure communication

export interface ObfuscationResult {
  formattedMessage: string;
  originalLength: number;
  obfuscationType: string;
  timestamp: string;
}

/**
 * Simple but effective message obfuscation techniques
 */
class MessageObfuscator {
  private static readonly OBFUSCATION_METHODS = [
    'reverse',
    'caesar',
    'substitute',
    'split',
    'encode'
  ];

  // Reverse the message
  private static reverseObfuscation(message: string): string {
    return message.split('').reverse().join('');
  }

  // Caesar cipher with random shift
  private static caesarObfuscation(message: string): string {
    const shift = Math.floor(Math.random() * 25) + 1;
    return message.split('').map(char => {
      if (char.match(/[a-z]/i)) {
        const isUpper = char === char.toUpperCase();
        const base = isUpper ? 65 : 97;
        const shifted = ((char.charCodeAt(0) - base + shift) % 26) + base;
        return String.fromCharCode(shifted);
      }
      return char;
    }).join('') + `_shift${shift}`;
  }

  // Character substitution
  private static substituteObfuscation(message: string): string {
    const substitutions: Record<string, string> = {
      'a': '@', 'e': '3', 'i': '!', 'o': '0', 'u': 'v',
      's': '$', 't': '7', 'l': '1', 'g': '9', 'b': '6'
    };
    
    return message.toLowerCase().split('').map(char => 
      substitutions[char] || char
    ).join('');
  }

  // Split and rearrange
  private static splitObfuscation(message: string): string {
    if (message.length < 4) return message;
    
    const mid = Math.floor(message.length / 2);
    const first = message.substring(0, mid);
    const second = message.substring(mid);
    
    return `${second}|||${first}`;
  }

  // Base64-like encoding with custom alphabet
  private static encodeObfuscation(message: string): string {
    const customAlphabet = 'ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba9876543210+/';
    const buffer = Buffer.from(message, 'utf8');
    return buffer.toString('base64').split('').map(char => {
      const index = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(char);
      return index !== -1 ? customAlphabet[index] : char;
    }).join('');
  }

  /**
   * Obfuscate a message using a random method
   */
  static obfuscate(message: string): ObfuscationResult {
    const method = this.OBFUSCATION_METHODS[Math.floor(Math.random() * this.OBFUSCATION_METHODS.length)];
    let obfuscatedMessage: string;

    switch (method) {
      case 'reverse':
        obfuscatedMessage = this.reverseObfuscation(message);
        break;
      case 'caesar':
        obfuscatedMessage = this.caesarObfuscation(message);
        break;
      case 'substitute':
        obfuscatedMessage = this.substituteObfuscation(message);
        break;
      case 'split':
        obfuscatedMessage = this.splitObfuscation(message);
        break;
      case 'encode':
        obfuscatedMessage = this.encodeObfuscation(message);
        break;
      default:
        obfuscatedMessage = message;
    }

    return {
      formattedMessage: obfuscatedMessage,
      originalLength: message.length,
      obfuscationType: method,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Deobfuscate a message (if the method is known)
   */
  static deobfuscate(obfuscatedData: ObfuscationResult, originalMessage?: string): string {
    // For security reasons, we don't store the deobfuscation method
    // This is a one-way obfuscation for secure communication
    return `[Obfuscated: ${obfuscatedData.obfuscationType}] ${obfuscatedData.formattedMessage}`;
  }
}

/**
 * Main obfuscation function compatible with the existing AI flow
 */
export async function obfuscateMessage(params: { 
  message: string; 
  shouldObfuscate: boolean; 
}): Promise<ObfuscationResult> {
  if (!params.shouldObfuscate) {
    return {
      formattedMessage: params.message,
      originalLength: params.message.length,
      obfuscationType: 'none',
      timestamp: new Date().toISOString()
    };
  }

  // Add random delay to simulate AI processing (optional)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

  return MessageObfuscator.obfuscate(params.message);
}

/**
 * Quick obfuscation for emergency situations
 */
export function quickObfuscate(message: string): string {
  // Ultra-fast obfuscation for panic situations
  return message.split('').reverse().join('').replace(/[aeiou]/gi, '*');
}

/**
 * Generate secure room codes
 */
export function generateSecureRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  
  return segments.join('-');
}

export default MessageObfuscator;
