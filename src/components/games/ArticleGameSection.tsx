import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Gamepad2, Maximize2, Minimize2 } from 'lucide-react';
import { Post, stripHtmlTags } from '../../utils/blogLogic';
import {
  GameType,
  getAllGameTypes,
  getGameCatalogItem,
  getGameConfigForPost,
} from '../../games/gameRegistry';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { recordOfficialGameScore } from '../../services/gameScores';
import { trackGameEvent } from '../../utils/analytics';
import GameLeaderboardPanel from './GameLeaderboardPanel';

const WesternShooterGame = lazy(() => import('./WesternShooterGame'));
const ChemistryLabGame = lazy(() => import('./ChemistryLabGame'));
const OceanPaintGame = lazy(() => import('./OceanPaintGame'));
const AthleticsRunnerGame = lazy(() => import('./AthleticsRunnerGame'));
const BuilderTetrisGame = lazy(() => import('./BuilderTetrisGame'));

interface ArticleGameSectionProps {
  post: Post;
}

export default function ArticleGameSection({ post }: ArticleGameSectionProps) {
  const recommended = getGameConfigForPost(post);
  const { user } = useFirebaseAuth();
  const [activeGameType, setActiveGameType] = useState<GameType>(recommended.gameType);
  const [expanded, setExpanded] = useState(false);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [lastPersonalBest, setLastPersonalBest] = useState<number | undefined>(undefined);

  // Sync active game whenever user switches to another article
  useEffect(() => {
    setActiveGameType(recommended.gameType);
    setLastPersonalBest(undefined);
  }, [recommended.gameType, post.id]);

  const handleScoreRecord = useCallback(
    (rawScore: number) => {
      if (!Number.isFinite(rawScore) || rawScore <= 0) return;
      trackGameEvent(activeGameType, 'score', Math.floor(rawScore));
      recordOfficialGameScore(user, activeGameType, rawScore)
        .then(({ personalBest }) => {
          setLastPersonalBest(personalBest);
          setLeaderboardRefresh((c) => c + 1);
        })
        .catch(() => {
          // Error telemetry handled inside recordOfficialGameScore
        });
    },
    [user, activeGameType]
  );

  const activeInfo = getGameCatalogItem(activeGameType);
  const cleanTitle = stripHtmlTags(post.title.rendered);
  const allGames = getAllGameTypes();

  return (
    <section
      id="jogo-artigo"
      data-game-type={activeGameType}
      aria-labelledby="jogo-artigo-heading"
      className={`mt-8 sm:mt-12 rounded-2xl md:rounded-sm border border-stone-200 dark:border-[#1B3358] bg-white dark:bg-[#0B1930] overflow-hidden shadow-xs md:shadow-none ${
        expanded ? 'fixed inset-3 sm:inset-6 z-50 overflow-y-auto shadow-2xl' : ''
      }`}
    >
      {/* Editorial Arcade Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-[#1B3358] flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] font-bold mb-1">
            <Gamepad2 size={14} />
            <span>{activeInfo.badge}</span>
          </div>
          <h2
            id="jogo-artigo-heading"
            className="font-display font-black text-xl sm:text-2xl uppercase text-[#081224] dark:text-white"
          >
            {activeInfo.title}
          </h2>
          <p className="text-xs text-stone-600 dark:text-slate-300 mt-1 max-w-2xl">
            {activeGameType === recommended.gameType ? recommended.articleMission : activeInfo.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="min-h-[38px] px-3 py-1.5 rounded-xl md:rounded-sm border border-stone-200 dark:border-[#1B3358] bg-[#F4F1E8] dark:bg-[#050C18] hover:border-[#F5B731] text-xs font-semibold text-[#081224] dark:text-[#F4F0E6] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          <span>{expanded ? 'Fechar Tela Cheia' : 'Expandir Jogo'}</span>
        </button>
      </div>

      {/* Render Selected Game Engine */}
      <div>
        <Suspense
          fallback={
            <div className="p-10 text-center text-xs font-mono text-stone-500 dark:text-slate-400">
              Carregando motor do jogo...
            </div>
          }
        >
          {activeGameType === 'western' && (
            <WesternShooterGame articleTitle={cleanTitle} onScoreRecord={handleScoreRecord} />
          )}
          {activeGameType === 'chemistry' && (
            <ChemistryLabGame articleTitle={cleanTitle} onScoreRecord={handleScoreRecord} />
          )}
          {activeGameType === 'ocean-paint' && (
            <OceanPaintGame articleTitle={cleanTitle} onScoreRecord={handleScoreRecord} />
          )}
          {activeGameType === 'athletics' && (
            <AthleticsRunnerGame articleTitle={cleanTitle} onScoreRecord={handleScoreRecord} />
          )}
          {activeGameType === 'builder-tetris' && (
            <BuilderTetrisGame articleTitle={cleanTitle} onScoreRecord={handleScoreRecord} />
          )}
        </Suspense>
      </div>

      {/* Portal Top-5 Leaderboard & Personal Best */}
      <GameLeaderboardPanel
        gameType={activeGameType}
        refreshTrigger={leaderboardRefresh}
        lastPersonalBest={lastPersonalBest}
      />

      {/* Compact Cross-Portal Arcade Switcher Footer */}
      <div className="px-3 sm:px-4 py-3 bg-[#F4F1E8] dark:bg-[#081224] border-t border-stone-200 dark:border-[#1B3358] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-slate-400 shrink-0">
          Jogos do Portal:
        </span>
        <div className="flex sm:flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
          {allGames.map((gt) => {
            const item = getGameCatalogItem(gt);
            const isActive = activeGameType === gt;
            const isRecommended = recommended.gameType === gt;
            return (
              <button
                key={gt}
                type="button"
                data-game-switch={gt}
                onClick={() => {
                  setActiveGameType(gt);
                  setLastPersonalBest(undefined);
                }}
                className={`min-h-[36px] px-2.5 py-1 rounded-xl md:rounded-sm text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
                    : 'bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] text-stone-700 dark:text-slate-300 hover:border-[#F5B731]'
                }`}
              >
                {item.title}
                {isRecommended ? ' ★' : ''}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
