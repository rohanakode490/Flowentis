import test from "node:test";
import assert from "node:assert/strict";

// Validation logic matching primary backend & frontend schemas
function validateProfileUpdate(body) {
  const { name } = body;
  if (typeof name !== "string" || !name.trim()) {
    return { success: false, error: "Valid name is required" };
  }
  return { success: true, sanitizedName: name.trim() };
}

function validateEmail(email) {
  if (typeof email !== "string") return false;
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : false;
}

test("User Profile & API Invariants", async (t) => {
  await t.test("rejects empty or whitespace-only name updates", () => {
    assert.equal(validateProfileUpdate({ name: "" }).success, false);
    assert.equal(validateProfileUpdate({ name: "    " }).success, false);
    assert.equal(validateProfileUpdate({ name: null }).success, false);
    assert.equal(validateProfileUpdate({}).success, false);
  });

  await t.test("accepts valid name and trims whitespace", () => {
    const result = validateProfileUpdate({ name: "  Alex Morgan  " });
    assert.equal(result.success, true);
    assert.equal(result.sanitizedName, "Alex Morgan");
  });

  await t.test("validates and normalizes valid email addresses", () => {
    assert.equal(
      validateEmail("  TEST.USER@FLOWENTIS.IO  "),
      "test.user@flowentis.io",
    );
    assert.equal(validateEmail("invalid-email"), false);
    assert.equal(validateEmail("user@domain"), false);
  });
});
