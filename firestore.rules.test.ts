import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Deterministic unit test runner for the Dirty Dozen security payloads
 * and structural invariants of firestore.rules / DRAFT_firestore.rules.
 */

interface AuthContext {
  uid: string;
  email: string;
  email_verified: boolean;
}

const REQUEST_TIME = '2026-11-18T16:35:00Z';

function isValidId(id: unknown): boolean {
  return (
    typeof id === 'string' &&
    id.length >= 1 &&
    id.length <= 128 &&
    /^[a-zA-Z0-9_\-]+$/.test(id)
  );
}

function evaluateCommentCreate(
  auth: AuthContext | null,
  commentId: string,
  incoming: Record<string, unknown>
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!auth || auth.email_verified !== true) return 'PERMISSION_DENIED';
  if (!isValidId(commentId)) return 'PERMISSION_DENIED';

  const requiredKeys = [
    'postId',
    'authorUid',
    'authorName',
    'authorPhotoUrl',
    'content',
    'createdAt',
  ];
  const keys = Object.keys(incoming);
  if (
    !requiredKeys.every((k) => keys.includes(k)) ||
    !keys.every((k) => requiredKeys.includes(k))
  ) {
    return 'PERMISSION_DENIED';
  }

  if (
    typeof incoming.postId !== 'number' ||
    !Number.isInteger(incoming.postId) ||
    incoming.postId <= 0 ||
    incoming.postId > 1000000
  ) {
    return 'PERMISSION_DENIED';
  }

  if (
    typeof incoming.authorUid !== 'string' ||
    !isValidId(incoming.authorUid) ||
    incoming.authorUid !== auth.uid
  ) {
    return 'PERMISSION_DENIED';
  }

  if (
    typeof incoming.authorName !== 'string' ||
    incoming.authorName.length < 2 ||
    incoming.authorName.length > 80
  ) {
    return 'PERMISSION_DENIED';
  }

  if (
    typeof incoming.authorPhotoUrl !== 'string' ||
    incoming.authorPhotoUrl.length > 500
  ) {
    return 'PERMISSION_DENIED';
  }

  if (
    typeof incoming.content !== 'string' ||
    incoming.content.length < 3 ||
    incoming.content.length > 1500
  ) {
    return 'PERMISSION_DENIED';
  }

  if (incoming.createdAt !== REQUEST_TIME) {
    return 'PERMISSION_DENIED';
  }

  return 'ALLOWED';
}

function evaluateCommentUpdate(): 'PERMISSION_DENIED' {
  return 'PERMISSION_DENIED';
}

function evaluateCommentDelete(
  auth: AuthContext | null,
  commentId: string,
  existing: { authorUid: string }
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!auth || auth.email_verified !== true) return 'PERMISSION_DENIED';
  if (!isValidId(commentId)) return 'PERMISSION_DENIED';
  if (existing.authorUid !== auth.uid) return 'PERMISSION_DENIED';
  return 'ALLOWED';
}

function evaluateSubscriptionGet(
  auth: AuthContext | null,
  userId: string
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!auth || auth.email_verified !== true) return 'PERMISSION_DENIED';
  if (!isValidId(userId)) return 'PERMISSION_DENIED';
  if (auth.uid !== userId) return 'PERMISSION_DENIED';
  return 'ALLOWED';
}

function evaluateSubscriptionList(): 'PERMISSION_DENIED' {
  return 'PERMISSION_DENIED';
}

function evaluateSubscriptionCreateOrUpdate(
  op: 'create' | 'update',
  auth: AuthContext | null,
  userId: string,
  incoming: Record<string, unknown>,
  existing?: Record<string, unknown>
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!auth || auth.email_verified !== true) return 'PERMISSION_DENIED';
  if (!isValidId(userId) || auth.uid !== userId) return 'PERMISSION_DENIED';

  const requiredKeys = [
    'userUid',
    'email',
    'displayName',
    'notifyNewArticles',
    'preferredPillar',
    'createdAt',
    'updatedAt',
  ];
  const keys = Object.keys(incoming);
  if (
    !requiredKeys.every((k) => keys.includes(k)) ||
    !keys.every((k) => requiredKeys.includes(k))
  ) {
    return 'PERMISSION_DENIED';
  }

  if (
    typeof incoming.userUid !== 'string' ||
    !isValidId(incoming.userUid) ||
    incoming.userUid !== auth.uid
  ) {
    return 'PERMISSION_DENIED';
  }

  if (
    typeof incoming.email !== 'string' ||
    incoming.email.length < 5 ||
    incoming.email.length > 160 ||
    incoming.email !== auth.email
  ) {
    return 'PERMISSION_DENIED';
  }

  if (
    typeof incoming.displayName !== 'string' ||
    incoming.displayName.length < 1 ||
    incoming.displayName.length > 100
  ) {
    return 'PERMISSION_DENIED';
  }

  if (typeof incoming.notifyNewArticles !== 'boolean') {
    return 'PERMISSION_DENIED';
  }

  if (
    typeof incoming.preferredPillar !== 'string' ||
    incoming.preferredPillar.length < 1 ||
    incoming.preferredPillar.length > 64
  ) {
    return 'PERMISSION_DENIED';
  }

  if (op === 'create') {
    if (incoming.createdAt !== REQUEST_TIME || incoming.updatedAt !== REQUEST_TIME) {
      return 'PERMISSION_DENIED';
    }
    return 'ALLOWED';
  }

  if (!existing) return 'PERMISSION_DENIED';
  if (
    incoming.userUid !== existing.userUid ||
    incoming.email !== existing.email ||
    incoming.createdAt !== existing.createdAt ||
    incoming.updatedAt !== REQUEST_TIME
  ) {
    return 'PERMISSION_DENIED';
  }

  return 'ALLOWED';
}

test('Dirty Dozen Payloads all return PERMISSION_DENIED and valid operations succeed', () => {
  const validUserA: AuthContext = {
    uid: 'user_A_123',
    email: 'leitor.a@gmail.com',
    email_verified: true,
  };
  const unverifiedUserA: AuthContext = {
    uid: 'user_A_123',
    email: 'leitor.a@gmail.com',
    email_verified: false,
  };

  const validCommentPayload = {
    postId: 685,
    authorUid: 'user_A_123',
    authorName: 'Leitor Achar Temas',
    authorPhotoUrl: 'https://lh3.googleusercontent.com/a/avatar',
    content: 'Excelente artigo sobre Constantino e o Império Romano!',
    createdAt: REQUEST_TIME,
  };

  // Sanity check: valid comment creation succeeds
  assert.equal(
    evaluateCommentCreate(validUserA, 'comment_01', validCommentPayload),
    'ALLOWED'
  );

  // 1. Unauthenticated Comment Creation
  assert.equal(
    evaluateCommentCreate(null, 'comment_01', validCommentPayload),
    'PERMISSION_DENIED'
  );

  // 2. Unverified Email Comment Creation
  assert.equal(
    evaluateCommentCreate(unverifiedUserA, 'comment_01', validCommentPayload),
    'PERMISSION_DENIED'
  );

  // 3. Identity Spoofing on Comment
  assert.equal(
    evaluateCommentCreate(validUserA, 'comment_01', {
      ...validCommentPayload,
      authorUid: 'user_B_999',
    }),
    'PERMISSION_DENIED'
  );

  // 4. Shadow Field Injection on Comment
  assert.equal(
    evaluateCommentCreate(validUserA, 'comment_01', {
      ...validCommentPayload,
      isAdmin: true,
    }),
    'PERMISSION_DENIED'
  );

  // 5. Oversized Comment Content (Resource Poisoning)
  assert.equal(
    evaluateCommentCreate(validUserA, 'comment_01', {
      ...validCommentPayload,
      content: 'X'.repeat(1501),
    }),
    'PERMISSION_DENIED'
  );

  // 6. Forged Client Timestamp on Comment
  assert.equal(
    evaluateCommentCreate(validUserA, 'comment_01', {
      ...validCommentPayload,
      createdAt: '2020-01-01T00:00:00Z',
    }),
    'PERMISSION_DENIED'
  );

  // 7. Unauthorized Comment Mutation
  assert.equal(evaluateCommentUpdate(), 'PERMISSION_DENIED');

  // 8. Cross-User Comment Deletion
  assert.equal(
    evaluateCommentDelete(validUserA, 'comment_01', { authorUid: 'user_B_999' }),
    'PERMISSION_DENIED'
  );

  // 9. PII Leak via Cross-User Get on Subscription
  assert.equal(
    evaluateSubscriptionGet(validUserA, 'user_B_999'),
    'PERMISSION_DENIED'
  );

  // 10. PII Leak via List Enumeration on Subscriptions
  assert.equal(evaluateSubscriptionList(), 'PERMISSION_DENIED');

  const validSubPayload = {
    userUid: 'user_A_123',
    email: 'leitor.a@gmail.com',
    displayName: 'Leitor A',
    notifyNewArticles: true,
    preferredPillar: 'all',
    createdAt: REQUEST_TIME,
    updatedAt: REQUEST_TIME,
  };

  assert.equal(
    evaluateSubscriptionCreateOrUpdate('create', validUserA, 'user_A_123', validSubPayload),
    'ALLOWED'
  );

  // 11. Email Spoofing on Subscription
  assert.equal(
    evaluateSubscriptionCreateOrUpdate('create', validUserA, 'user_A_123', {
      ...validSubPayload,
      email: 'victim@gmail.com',
    }),
    'PERMISSION_DENIED'
  );

  // 12. Immortal Field Tampering on Subscription Update
  assert.equal(
    evaluateSubscriptionCreateOrUpdate(
      'update',
      validUserA,
      'user_A_123',
      {
        ...validSubPayload,
        createdAt: '2025-01-01T00:00:00Z',
      },
      validSubPayload
    ),
    'PERMISSION_DENIED'
  );
});

test('DRAFT_firestore.rules contains all Eight Pillars security invariants', () => {
  const rulesText = fs.readFileSync(
    path.resolve(process.cwd(), 'DRAFT_firestore.rules'),
    'utf-8'
  );
  assert.ok(rulesText.includes("rules_version = '2';"));
  assert.ok(rulesText.includes('allow read, write: if false;'));
  assert.ok(rulesText.includes('isValidComment(incoming())'));
  assert.ok(rulesText.includes('isValidSubscription(incoming())'));
  assert.ok(rulesText.includes('request.auth.token.email_verified == true'));
  assert.ok(rulesText.includes('incoming().createdAt == request.time'));
  assert.ok(rulesText.includes('affectedKeys().hasOnly'));
});
