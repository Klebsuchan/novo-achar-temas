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
const ADMIN_EMAIL = 'braian.kleber.camargo@gmail.com';

function isValidId(id: unknown): boolean {
  return (
    typeof id === 'string' &&
    id.length >= 1 &&
    id.length <= 128 &&
    /^[a-zA-Z0-9_\-]+$/.test(id)
  );
}

function isAdmin(auth: AuthContext | null): boolean {
  return Boolean(auth && auth.email_verified === true && auth.email === ADMIN_EMAIL);
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
    incoming.postId > 10000000
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
  if (existing.authorUid !== auth.uid && !isAdmin(auth)) return 'PERMISSION_DENIED';
  return 'ALLOWED';
}

function evaluateSubscriptionGet(
  auth: AuthContext | null,
  userId: string
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!auth || auth.email_verified !== true) return 'PERMISSION_DENIED';
  if (!isValidId(userId)) return 'PERMISSION_DENIED';
  if (auth.uid !== userId && !isAdmin(auth)) return 'PERMISSION_DENIED';
  return 'ALLOWED';
}

function evaluateSubscriptionList(auth: AuthContext | null): 'ALLOWED' | 'PERMISSION_DENIED' {
  return isAdmin(auth) ? 'ALLOWED' : 'PERMISSION_DENIED';
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

function evaluateGameScoreWrite(
  op: 'create' | 'update',
  auth: AuthContext | null,
  scoreId: string,
  incoming: Record<string, unknown>,
  existing?: Record<string, unknown>
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!auth || auth.email_verified !== true) return 'PERMISSION_DENIED';
  if (!isValidId(scoreId)) return 'PERMISSION_DENIED';

  const requiredKeys = [
    'userUid',
    'playerName',
    'playerPhotoUrl',
    'gameType',
    'bestScore',
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
  if (incoming.userUid !== auth.uid) return 'PERMISSION_DENIED';
  if (scoreId !== `${auth.uid}_${String(incoming.gameType)}`) return 'PERMISSION_DENIED';
  if (
    typeof incoming.bestScore !== 'number' ||
    !Number.isInteger(incoming.bestScore) ||
    incoming.bestScore < 0 ||
    incoming.bestScore > 10000000
  ) {
    return 'PERMISSION_DENIED';
  }
  if (op === 'create') {
    return incoming.createdAt === REQUEST_TIME && incoming.updatedAt === REQUEST_TIME
      ? 'ALLOWED'
      : 'PERMISSION_DENIED';
  }
  if (!existing) return 'PERMISSION_DENIED';
  if (
    existing.userUid !== auth.uid ||
    incoming.gameType !== existing.gameType ||
    incoming.createdAt !== existing.createdAt ||
    incoming.updatedAt !== REQUEST_TIME ||
    (incoming.bestScore as number) < (existing.bestScore as number)
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
  const spoofedAdmin: AuthContext = {
    uid: 'spoof_admin',
    email: ADMIN_EMAIL,
    email_verified: false,
  };
  const verifiedAdmin: AuthContext = {
    uid: 'real_admin',
    email: ADMIN_EMAIL,
    email_verified: true,
  };

  const validCommentPayload = {
    postId: 685,
    authorUid: 'user_A_123',
    authorName: 'Leitor Achar Temas',
    authorPhotoUrl: 'https://lh3.googleusercontent.com/a/avatar',
    content: 'Excelente artigo sobre Constantino e o Império Romano!',
    createdAt: REQUEST_TIME,
  };

  assert.equal(evaluateCommentCreate(validUserA, 'comment_01', validCommentPayload), 'ALLOWED');
  // 1. Unauthenticated
  assert.equal(evaluateCommentCreate(null, 'comment_01', validCommentPayload), 'PERMISSION_DENIED');
  // 2. Unverified
  assert.equal(evaluateCommentCreate(unverifiedUserA, 'comment_01', validCommentPayload), 'PERMISSION_DENIED');
  // 3. Identity Spoofing
  assert.equal(
    evaluateCommentCreate(validUserA, 'comment_01', { ...validCommentPayload, authorUid: 'user_B_999' }),
    'PERMISSION_DENIED'
  );
  // 4. Shadow Field Injection
  assert.equal(
    evaluateCommentCreate(validUserA, 'comment_01', { ...validCommentPayload, isAdmin: true }),
    'PERMISSION_DENIED'
  );
  // 5. Oversized Comment
  assert.equal(
    evaluateCommentCreate(validUserA, 'comment_01', { ...validCommentPayload, content: 'X'.repeat(1501) }),
    'PERMISSION_DENIED'
  );
  // 6. Forged Timestamp
  assert.equal(
    evaluateCommentCreate(validUserA, 'comment_01', { ...validCommentPayload, createdAt: '2020-01-01T00:00:00Z' }),
    'PERMISSION_DENIED'
  );
  // 7. Unauthorized Update
  assert.equal(evaluateCommentUpdate(), 'PERMISSION_DENIED');
  // 8. Cross-User Delete
  assert.equal(
    evaluateCommentDelete(validUserA, 'comment_01', { authorUid: 'user_B_999' }),
    'PERMISSION_DENIED'
  );
  // 9. PII Leak via Cross-User Get
  assert.equal(evaluateSubscriptionGet(validUserA, 'user_B_999'), 'PERMISSION_DENIED');
  // 10. PII Leak via List by non-admin & spoofed admin
  assert.equal(evaluateSubscriptionList(validUserA), 'PERMISSION_DENIED');
  assert.equal(evaluateSubscriptionList(spoofedAdmin), 'PERMISSION_DENIED');
  assert.equal(evaluateSubscriptionList(verifiedAdmin), 'ALLOWED');

  // 11. Admin Email Spoofing check
  assert.equal(isAdmin(spoofedAdmin), false);
  assert.equal(isAdmin(verifiedAdmin), true);

  // 12. Game Score tampering / lowering / wrong docId
  const validScore = {
    userUid: 'user_A_123',
    playerName: 'Leitor A',
    playerPhotoUrl: '',
    gameType: 'western',
    bestScore: 1400,
    createdAt: REQUEST_TIME,
    updatedAt: REQUEST_TIME,
  };
  assert.equal(evaluateGameScoreWrite('create', validUserA, 'user_A_123_western', validScore), 'ALLOWED');
  assert.equal(evaluateGameScoreWrite('create', validUserA, 'user_B_999_western', validScore), 'PERMISSION_DENIED');
  assert.equal(
    evaluateGameScoreWrite('update', validUserA, 'user_A_123_western', { ...validScore, bestScore: 900 }, validScore),
    'PERMISSION_DENIED'
  );
  assert.equal(
    evaluateGameScoreWrite('update', validUserA, 'user_A_123_western', { ...validScore, bestScore: 2200 }, validScore),
    'ALLOWED'
  );
});

test('firestore.rules and DRAFT_firestore.rules contain all Eight Pillars security invariants', () => {
  for (const filename of ['DRAFT_firestore.rules', 'firestore.rules']) {
    const rulesText = fs.readFileSync(path.resolve(process.cwd(), filename), 'utf-8');
    assert.ok(rulesText.includes("rules_version = '2';"));
    assert.ok(rulesText.includes('allow read, write: if false;'));
    assert.ok(rulesText.includes('isValidComment(incoming())'));
    assert.ok(rulesText.includes('isValidSubscription(incoming())'));
    assert.ok(rulesText.includes('isValidArticle(incoming())'));
    assert.ok(rulesText.includes('isValidContactMessage(incoming())'));
    assert.ok(rulesText.includes('isValidGameScore(incoming())'));
    assert.ok(
      rulesText.includes(
        'allow list: if existing().gameType is string && existing().gameType.size() >= 6 && existing().gameType.size() <= 20;'
      )
    );
    assert.ok(rulesText.includes('request.auth.token.email_verified == true'));
    assert.ok(rulesText.includes('incoming().createdAt == request.time'));
    assert.ok(rulesText.includes('affectedKeys().hasOnly'));
  }
});
