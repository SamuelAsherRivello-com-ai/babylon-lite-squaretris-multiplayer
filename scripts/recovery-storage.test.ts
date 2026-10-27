import test from "node:test";
import assert from "node:assert/strict";
import { scopeRecoveryStorage } from "./recovery-storage.ts";
test("two embedded players cannot recover each other's seat, while reload recovers its own", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const host = scopeRecoveryStorage(storage, "wgd-primary");
  const guest = scopeRecoveryStorage(storage, "wgd-secondary");
  host.setItem("room:ABCD", "host-token");
  assert.equal(guest.getItem("room:ABCD"), null);
  guest.setItem("room:ABCD", "guest-token");
  assert.equal(host.getItem("room:ABCD"), "host-token");
  assert.equal(scopeRecoveryStorage(storage, "wgd-secondary").getItem("room:ABCD"), "guest-token");
  assert.equal(scopeRecoveryStorage(storage, "").getItem("room:ABCD"), null);
});

