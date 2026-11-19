# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default Deny**: All paths not explicitly matched in `/databases/{database}/documents` are denied for both `read` and `write`.
2. **Verified Admin Identity (`isAdmin()`)**:
   - Admin access requires BOTH `request.auth != null && request.auth.token.email_verified == true` AND `request.auth.token.email == 'braian.kleber.camargo@gmail.com'`. Unverified tokens with a matching email are strictly denied.
3. **Comment Identity & Integrity (`/comments/{commentId}`)**:
   - Any reader may view (`get`, `list`) public article comments, provided `resource.data.postId is int && resource.data.postId > 0`.
   - Only a signed-in user with `request.auth.token.email_verified == true` can create a comment.
   - `incoming().authorUid == request.auth.uid`, strict key check, bounded sizes, `createdAt == request.time`.
   - Comments are immutable (`allow update: if false;`), and may be deleted by their author or `isAdmin()`.
4. **Newsletter Subscription PII Isolation (`/newsletter_subscriptions/{userId}`)**:
   - Contains PII (`email`). `get` is permitted for owner (`request.auth.uid == userId`) or `isAdmin()`. `list` is restricted strictly to `isAdmin() && existing().userUid is string`.
   - `create`/`update` requires verified owner, `userUid == request.auth.uid`, `email == request.auth.token.email`, immutable `createdAt`/`userUid`/`email` on update.
5. **Editorial CMS Articles (`/articles/{articleId}`)**:
   - Public may `get` or `list` ONLY documents where `existing().published == true`. Drafts (`published == false`) are readable only by `isAdmin()`.
   - Only `isAdmin()` may `create`, `update`, or `delete` articles, enforcing strict schema bounds, `authorUid == request.auth.uid` on create, immutable `authorUid`/`createdAt` on update, and server timestamps.
6. **Contact Messages PII Isolation (`/contact_messages/{messageId}`)**:
   - Contains PII (`email`). Visitors may `create` new messages with strict bounds, `status == 'new'`, and `createdAt == request.time`.
   - All reads (`get`, `list`), status `update`s (`['status']` only), and `delete`s are restricted strictly to `isAdmin()`.
7. **Game Leaderboard Scores (`/game_scores/{scoreId}`)**:
   - Publicly readable (`get`, `list`) when `existing().bestScore is int && existing().bestScore >= 0` (no PII).
   - Verified Google players may `create` or `update` ONLY their own deterministic doc `request.auth.uid + '_' + incoming().gameType`, enforcing monotonic `incoming().bestScore >= existing().bestScore`, immutable `userUid`/`gameType`/`createdAt`, and valid `gameType` allowlist.

## 2. The "Dirty Dozen" Payloads

1. **Unauthenticated Comment Creation** -> `PERMISSION_DENIED`
2. **Unverified Email Comment Creation** (`email_verified: false`) -> `PERMISSION_DENIED`
3. **Identity Spoofing on Comment** (`authorUid != request.auth.uid`) -> `PERMISSION_DENIED`
4. **Shadow Field Injection on Comment** (`isAdmin: true`) -> `PERMISSION_DENIED`
5. **Oversized Comment Content** (`content.length > 1500`) -> `PERMISSION_DENIED`
6. **Forged Client Timestamp on Comment** (`createdAt != request.time`) -> `PERMISSION_DENIED`
7. **Unauthorized Comment Mutation** (any `update`) -> `PERMISSION_DENIED`
8. **Cross-User Comment Deletion** (`authorUid != request.auth.uid` by non-admin) -> `PERMISSION_DENIED`
9. **PII Leak via Cross-User Get on Subscription** (`user_A` reading `user_B`) -> `PERMISSION_DENIED`
10. **PII Leak via List Enumeration on Subscriptions / Contact Messages by Non-Admin** -> `PERMISSION_DENIED`
11. **Admin Email Spoofing without `email_verified: true`** (`email == 'braian.kleber.camargo@gmail.com'`, `email_verified: false` creating/listing articles or reading contact messages) -> `PERMISSION_DENIED`
12. **Score Tampering / Lowering or Cross-User Write on `game_scores`** (wrong `scoreId`, lower `bestScore`, or extra field) -> `PERMISSION_DENIED`
