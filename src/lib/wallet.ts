import { Keypair } from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

const ENCRYPTION_KEY = "your-hard-coded-password"; // Replace with a secure password

// Generate a new Solana private key
export function generatePrivateKey(): string {
  const keypair = Keypair.generate();
  return bs58.encode(keypair.secretKey);
}

// Simple XOR-based encryption (Note: This is not secure for production use)
function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return Buffer.from(result).toString('base64');
}

// Simple XOR-based decryption
function xorDecrypt(encryptedText: string, key: string): string {
  const text = Buffer.from(encryptedText, 'base64').toString();
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

// Encrypt a private key
export function encryptPrivateKey(privateKey: string): string {
  return xorEncrypt(privateKey, ENCRYPTION_KEY);
}

// Decrypt an encrypted private key
export function decryptPrivateKey(encryptedPrivateKey: string): string {
  return xorDecrypt(encryptedPrivateKey, ENCRYPTION_KEY);
}

// Create a Keypair from a private key
export function createKeypairFromPrivateKey(privateKey: string): Keypair {
  const secretKey = bs58.decode(privateKey);
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

// Usage example:
// const privateKey = generatePrivateKey();
// const encryptedPrivateKey = encryptPrivateKey(privateKey);
// const decryptedPrivateKey = decryptPrivateKey(encryptedPrivateKey);
// const keypair = createKeypairFromPrivateKey(decryptedPrivateKey);