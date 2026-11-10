import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

// AES-256-GCM cipher test matching primary-backend crypto implementation
const algorithm = "aes-256-gcm";

function encrypt(text, masterKey) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(masterKey, "hex"),
    iv,
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

function decrypt(encryptedData, masterKey) {
  const [ivHex, encrypted, authTagHex] = encryptedData.split(":");
  if (!ivHex || !encrypted || !authTagHex) {
    throw new Error("Invalid encrypted data format.");
  }

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(masterKey, "hex"),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

test("Security & Crypto Invariants (Solana Key Protection)", async (t) => {
  // 32-byte (64 hex characters) master key
  const testMasterKey = crypto.randomBytes(32).toString("hex");

  await t.test("successfully encrypts and decrypts sensitive private key", () => {
    const rawKey = "5Kb8kLf9zgWQnogidDA76MzPL6TsZZY36hWXMssSzNydYXYB9KF";
    const encrypted = encrypt(rawKey, testMasterKey);

    assert.ok(encrypted.includes(":"), "Output must be colon-separated iv:ciphertext:tag");
    const parts = encrypted.split(":");
    assert.equal(parts.length, 3, "Must have exactly 3 parts (IV, Ciphertext, AuthTag)");
    assert.equal(parts[0].length, 24, "IV hex must be 12 bytes = 24 hex characters");
    assert.equal(parts[2].length, 32, "AuthTag hex must be 16 bytes = 32 hex characters");

    const decrypted = decrypt(encrypted, testMasterKey);
    assert.equal(decrypted, rawKey, "Decrypted text must match original raw key exactly");
  });

  await t.test("fails decryption when ciphertext is tampered with", () => {
    const rawKey = "SecretSolanaPrivateKey12345";
    const encrypted = encrypt(rawKey, testMasterKey);
    const parts = encrypted.split(":");

    // Tamper with ciphertext by flipping last character
    const tamperedCipher = parts[1].slice(0, -1) + (parts[1].slice(-1) === "0" ? "1" : "0");
    const tamperedData = `${parts[0]}:${tamperedCipher}:${parts[2]}`;

    assert.throws(() => {
      decrypt(tamperedData, testMasterKey);
    }, /Unsupported state or unable to authenticate data/, "Tampered data must fail GCM authentication");
  });

  await t.test("fails decryption with wrong master key", () => {
    const rawKey = "AnotherSecretKey";
    const encrypted = encrypt(rawKey, testMasterKey);
    const wrongMasterKey = crypto.randomBytes(32).toString("hex");

    assert.throws(() => {
      decrypt(encrypted, wrongMasterKey);
    }, "Decrypting with wrong master key must throw error");
  });
});
