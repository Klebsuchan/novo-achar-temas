# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default Deny**: All paths not explicitly matched in `/databases/{database}/documents` are denied for both `read` and `write`.
2. **Comment Identity & Integrity (`/comments/{commentId}`)**:
   - Any reader may view (`get`, `list`) public article comments, provided `resource.data.postId is int && resource.data.postId > 0`.
   - Only a signed-in user with `request.auth.token.email_verified == true` can create a comment.
   - `incoming().authorUid` must strictly equal `request.auth.uid`.
   - `incoming().keys()` must contain `['postId', 'authorUid', 'authorName', 'authorPhotoUrl', 'content', 'createdAt']` (no shadow or ghost fields).
   - `authorName` must be a string between 2 and 80 characters; `content` must be a string between 3 and 1500 characters; `authorPhotoUrl` must be a string `<= 500` characters.
   - `createdAt` must equal `request.time`.
   - Comments are immutable once published (`allow update: if false;`), and may only be deleted by their author (`existing().authorUid == request.auth.uid`).
3. **Newsletter Subscription PII Isolation (`/newsletter_subscriptions/{userId}`)**:
   - Contains PII (`email`). Strictly isolated per user: `allow get` is only permitted when `isSignedIn() && isValidId(userId) && request.auth.uid == userId`.
   - `allow list: if false;` prevents any enumeration or scraping of subscriber emails.
   - `allow create, update` requires `isSignedIn() && request.auth.token.email_verified == true && isValidId(userId) && request.auth.uid == userId`, `incoming().userUid == request.auth.uid`, and `incoming().email == request.auth.token.email`.
   - On update, `createdAt`, `userUid`, and `email` are immutable, `updatedAt == request.time`, and `affectedKeys().hasOnly(['displayName', 'notifyNewArticles', 'preferredPillar', 'updatedAt'])`.

## 2. The "Dirty Dozen" Payloads

1. **Unauthenticated Comment Creation**: `{ postId: 685, authorUid: "anon", authorName: "Hacker", authorPhotoUrl: "", content: "Spam", createdAt: SERVER_TIMESTAMP }` -> `PERMISSION_DENIED`
2. **Unverified Email Comment Creation**: Authenticated user with `email_verified: false` creating a comment -> `PERMISSION_DENIED`
3. **Identity Spoofing on Comment**: Authenticated as `user_A`, payload has `authorUid: "user_B"` -> `PERMISSION_DENIED`
4. **Shadow Field Injection on Comment**: Payload includes extra key `isAdmin: true` -> `PERMISSION_DENIED`
5. **Oversized Comment Content (Resource Poisoning)**: `content` length > 1500 chars -> `PERMISSION_DENIED`
6. **Forged Client Timestamp on Comment**: `createdAt` is a past timestamp instead of `request.time` -> `PERMISSION_DENIED`
7. **Unauthorized Comment Mutation**: Author attempts to `update` an existing comment -> `PERMISSION_DENIED`
8. **Cross-User Comment Deletion**: `user_A` attempts to `delete` a comment where `authorUid == "user_B"` -> `PERMISSION_DENIED`
9. **PII Leak via Cross-User Get on Subscription**: `user_A` attempts `get(/newsletter_subscriptions/user_B)` -> `PERMISSION_DENIED`
10. **PII Leak via List Enumeration on Subscriptions**: Authenticated user attempts `list(/newsletter_subscriptions)` -> `PERMISSION_DENIED`
11. **Email Spoofing on Subscription**: `user_A` (`a@gmail.com`) attempts to subscribe `victim@gmail.com` -> `PERMISSION_DENIED`
12. **Immortal Field Tampering on Subscription Update**: `user_A` attempts to change `createdAt` or `userUid` during an update -> `PERMISSION_DENIED`
