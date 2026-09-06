# Security Specification & Threat Model

## 1. Data Invariants
1. **User Isolation**: A journal entry stored at `/users/{userId}/entries/{entryId}` MUST strictly belong to the authenticated user matching `{userId}` (`request.auth.uid == userId`). No user may read, write, or list another user's documents.
2. **Identity Integrity**: `incoming().userId` must match `request.auth.uid` and `{userId}` path parameter on document creation, and is immutable on updates.
3. **Document ID Synchronization**: `incoming().id` must match `{entryId}` path parameter and is immutable on updates.
4. **Temporal Integrity**: `createdAt` and `updatedAt` must be valid server timestamps (`request.time`) on create, and `updatedAt` must be `request.time` on updates while `createdAt` remains unchanged.
5. **Bounded Inputs**: String lengths (`title` <= 200 chars, `summary` <= 4000 chars) and list sizes (`messages` <= 100 items, `tags` <= 10 items) are strictly bounded to eliminate Denial of Wallet (DoW) attacks.
6. **No Client Side Delegation**: Read, list, and write queries must be rejected at the security boundary if `{userId}` does not match `request.auth.uid`.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Test Suite)

| # | Attack Vector | Target Path | Malicious Payload / Condition | Expected Result |
|---|---|---|---|---|
| 1 | Unauthenticated Read | `/users/user_123/entries/entry_1` | `request.auth = null` | PERMISSION_DENIED |
| 2 | Cross-User Read Snooping | `/users/victim_999/entries/entry_1` | `request.auth.uid = attacker_111` | PERMISSION_DENIED |
| 3 | Cross-User Collection Listing | `/users/victim_999/entries` | `request.auth.uid = attacker_111` | PERMISSION_DENIED |
| 4 | Identity Spoofing On Create | `/users/user_123/entries/entry_1` | `incoming().userId = victim_999` while auth is `user_123` | PERMISSION_DENIED |
| 5 | Cross-User Write Hijack | `/users/victim_999/entries/entry_1` | Attacker attempts write to victim path with own UID | PERMISSION_DENIED |
| 6 | ID Poisoning / Path Mismatch | `/users/user_123/entries/entry_1` | `incoming().id = entry_2` | PERMISSION_DENIED |
| 7 | Client Timestamp Tampering | `/users/user_123/entries/entry_1` | `incoming().createdAt = 2020-01-01` (not server `request.time`) | PERMISSION_DENIED |
| 8 | Creation Date Rewrite Attack | `/users/user_123/entries/entry_1` | Updating `createdAt` on an existing entry | PERMISSION_DENIED |
| 9 | Oversized String Attack (DoW) | `/users/user_123/entries/entry_1` | `title` > 200 chars or junk buffer | PERMISSION_DENIED |
| 10 | Unbounded Message Flooding | `/users/user_123/entries/entry_1` | `messages` list size > 100 entries | PERMISSION_DENIED |
| 11 | Malformed Document ID | `/users/user_123/entries/..%2F..` | ID containing path traversal characters | PERMISSION_DENIED |
| 12 | Arbitrary Field Injection | `/users/user_123/entries/entry_1` | Injecting `isAdmin: true` or rogue keys on update | PERMISSION_DENIED |

---

## 3. Security Assertions Summary
- All 12 adversarial vectors fail closed (`PERMISSION_DENIED`).
- Only valid authenticated sessions matching `request.auth.uid == userId` can access `/users/{userId}/entries/{entryId}`.
