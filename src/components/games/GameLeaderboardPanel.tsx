import { useEffect, useState } from 'react';
import { Trophy, Medal, LogIn } from 'lucide-react';
import type { GameType } from '../../games/gameRegistry';
import type { LeaderboardEntry } from '../../games/gameLogic';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { fetchGameLeaderboard, getLocalHighScore } from '../../services/gameScores';

interface GameLeaderboardPanelProps {
  gameType: GameType;
  refreshTrigger: number;
  lastPersonalBest?: number;
}

export default function GameLeaderboardPanel({
  gameType,
  refreshTrigger,
  lastPersonalBest,
}: GameLeaderboardPanelProps) {
  const { user, signInWithGoogle } = useFirebaseAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [personalBest, setPersonalBest] = useState<number>(() => getLocalHighScore(gameType));

  useEffect(() => {
    setPersonalBest(Math.max(getLocalHighScore(gameType), lastPersonalBest || 0));
  }, [gameType, refreshTrigger, lastPersonalBest]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGameLeaderboard(gameType, 5)
      .then((list) => {
        if (!cancelled) {
          setEntries(list);
          if (user) {
            const mine = list.find((e) => e.userUid === user.uid);
            if (mine && mine.bestScore > personalBest) {
              setPersonalBest(mine.bestScore);
            }
          }
        }
      })
      .catch(() => {
        // Error telemetry already captured in handleFirestoreError
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gameType, refreshTrigger, user]);

  return (
    <div className="px-4 py-3.5 bg-[#ECE7DA]/70 dark:bg-[#081224] border-t border-stone-200 dark:border-[#1B3358]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-[#B45309] dark:text-[#F5B731] shrink-0" />
          <span className="text-xs font-display font-extrabold uppercase tracking-wider text-[#081224] dark:text-white">
            Ranking do Portal & Recorde
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="px-2.5 py-1 rounded-xl md:rounded-sm bg-white dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] font-mono tabular-nums text-[#081224] dark:text-[#F5B731] font-bold">
            Seu Recorde: {personalBest.toLocaleString('pt-BR')} pts
          </span>
          {!user && (
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#B45309] dark:text-[#F5B731] hover:underline cursor-pointer"
            >
              <LogIn size={12} />
              <span>Entrar com Google para salvar no Top 5</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-[11px] font-mono text-stone-500 dark:text-slate-400">
          Carregando classificação...
        </div>
      ) : entries.length === 0 ? (
        <div className="text-xs text-stone-600 dark:text-slate-400">
          Ainda não há pontuações oficiais registradas neste jogo. Conclua uma partida conectado com Google para estrear o pódio!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {entries.map((entry, idx) => (
            <div
              key={entry.userUid}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl md:rounded-sm border text-xs ${
                user && entry.userUid === user.uid
                  ? 'bg-[#081224] text-[#F5B731] border-[#F5B731]'
                  : 'bg-white dark:bg-[#0D1E3A] text-[#081224] dark:text-slate-200 border-stone-200 dark:border-[#1B3358]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono font-bold tabular-nums shrink-0 flex items-center gap-1">
                  {idx === 0 ? <Medal size={13} className="text-[#F5B731]" /> : `#${idx + 1}`}
                </span>
                <span className="truncate font-semibold">{entry.playerName}</span>
              </div>
              <span className="font-mono font-bold tabular-nums shrink-0">
                {entry.bestScore.toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
