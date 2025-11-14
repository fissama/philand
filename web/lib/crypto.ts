/**
 * Simple encryption/decryption utilities for localStorage
 * Uses a basic XOR cipher with a rotating key for client-side obfuscation
 * Note: This provides obfuscation, not cryptographic security
 */

const ENCRYPTION_KEY_NAME = "philand-ek";

/**
 * Get or generate encryption key
 */
function getEncryptionKey(): string {
  if (typeof globalThis.window === "undefined") {
    return "default-key";
  }

  let key = localStorage.getItem(ENCRYPTION_KEY_NAME);
  
  if (!key) {
    // Generate random key
    key = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
    ).join("");
    localStorage.setItem(ENCRYPTION_KEY_NAME, key);
  }

  return key;
}

/**
 * Encrypt data using XOR cipher
 */
export function encrypt(data: string): string {
  try {
    const key = getEncryptionKey();
    const encoded = new TextEncoder().encode(data);
    const keyBytes = new TextEncoder().encode(key);
    
    const encrypted = new Uint8Array(encoded.length);
    for (let i = 0; i < encoded.length; i++) {
      encrypted[i] = encoded[i] ^ keyBytes[i % keyBytes.length];
    }

    // Convert to base64
    return btoa(String.fromCharCode.apply(null, Array.from(encrypted)));
  } catch (error) {
    console.error("Encryption failed:", error);
    return btoa(data); // Fallback to base64 only
  }
}

/**
 * Decrypt data
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    
    // Convert from base64
    const encrypted = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
    const keyBytes = new TextEncoder().encode(key);

    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
    }

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    try {
      return atob(encryptedData); // Try base64 decode fallback
    } catch {
      return encryptedData;
    }
  }
}
