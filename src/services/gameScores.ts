import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, OperationType, handleFirestoreError } from '../firebase';
import type { GameType } from '../games/gameRegistry';
import { LeaderboardEntry, rankLeaderboardEntries } from '../games/gameLogic';

const LOCAL_SCORES_KEY = 'achar_temas_game_best_scores';

export function getLocalHighScore(gameType: GameType): number {
  try {
    const raw = localStorage.getItem(LOCAL_SCORES_KEY);
    if (!raw) return 0;
    const map = JSON.parse(raw) as Record<string, number>;
    return typeof map[gameType] === 'number' && map[gameType] > 0 ? Math.floor(map[gameType]) : 0;
  } catch {
    return 0;
  }
}

export function saveLocalHighScore(gameType: GameType, score: number): number {
  const cleanScore = Math.max(0, Math.floor(score));
  const current = getLocalHighScore(gameType);
  const nextBest = Math.max(current, cleanScore);
  try {
    const raw = localStorage.getItem(LOCAL_SCORES_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[gameType] = nextBest;
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
  return nextBest;
}

export async function fetchGameLeaderboard(
  gameType: GameType,
  maxItems = 8
): Promise<LeaderboardEntry[]> {
  const path = 'game_scores';
  try {
    const q = query(
      collection(db, path),
      where('gameType', '==', gameType),
      limit(50)
    );
    const snap = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      entries.push({
        userUid: String(d.userUid || docSnap.id),
        playerName: String(d.playerName || 'Jogador'),
        playerPhotoUrl: String(d.playerPhotoUrl || ''),
        gameType: String(d.gameType || gameType),
        bestScore: typeof d.bestScore === 'number' ? d.bestScore : 0,
        updatedAtIso:
          d.updatedAt && typeof d.updatedAt.toDate === 'function'
            ? d.updatedAt.toDate().toISOString()
            : new Date().toISOString(),
      });
    });
    return rankLeaderboardEntries(entries, maxItems);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function recordOfficialGameScore(
  user: User | null,
  gameType: GameType,
  score: number
): Promise<{ personalBest: number; savedToCloud: boolean }> {
  const cleanScore = Math.max(0, Math.min(10000000, Math.floor(score)));
  const localBest = saveLocalHighScore(gameType, cleanScore);

  if (!user || !user.emailVerified || cleanScore <= 0) {
    return { personalBest: localBest, savedToCloud: false };
  }

  const docId = `${user.uid}_${gameType}`;
  const docPath = `game_scores/${docId}`;
  const ref = doc(db, 'game_scores', docId);
  const safeName = (user.displayName || user.email?.split('@')[0] || 'Jogador')
    .trim()
    .slice(0, 60);
  const safePhoto = (user.photoURL || '').slice(0, 500);

  try {
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        userUid: user.uid,
        playerName: safeName.length >= 2 ? safeName : 'Jogador',
        playerPhotoUrl: safePhoto,
        gameType,
        bestScore: cleanScore,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { personalBest: Math.max(localBest, cleanScore), savedToCloud: true };
    }

    const existingBest = Number(existingSnap.data()?.bestScore || 0);
    if (cleanScore > existingBest) {
      await updateDoc(ref, {
        playerName: safeName.length >= 2 ? safeName : 'Jogador',
        playerPhotoUrl: safePhoto,
        bestScore: cleanScore,
        updatedAt: serverTimestamp(),
      });
      return { personalBest: Math.max(localBest, cleanScore), savedToCloud: true };
    }

    return { personalBest: Math.max(localBest, existingBest), savedToCloud: false };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}
