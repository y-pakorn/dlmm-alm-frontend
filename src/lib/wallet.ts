import { Keypair } from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import * as crypto from "crypto";

const ENCRYPTION_KEY = "your-hard-coded-password"; // Replace with a secure password

// Generate a new Solana private key
export function generatePrivateKey(): string {
  const keypair = Keypair.generate();
  return bs58.encode(keypair.secretKey);
}

// Encrypt a private key
export function encryptPrivateKey(privateKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt an encrypted private key
export function decryptPrivateKey(encryptedPrivateKey: string): string {
  const [ivHex, encryptedHex] = encryptedPrivateKey.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
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