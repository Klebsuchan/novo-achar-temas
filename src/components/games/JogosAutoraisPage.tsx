import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Gamepad2, ArrowRight, Crosshair, FlaskConical, PaintBucket, Trophy, Building2 } from 'lucide-react';
import { Post, stripHtmlTags } from '../../utils/blogLogic';
import {
  GameType,
  getAllGameTypes,
  getGameCatalogItem,
  getGameTypeForPost,
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

interface JogosAutoraisPageProps {
  allPosts: Post[];
  onSelectPost: (post: Post) => void;
}

const GAME_ICONS: Record<GameType, typeof Crosshair> = {
  western: Crosshair,
  chemistry: FlaskConical,
  'ocean-paint': PaintBucket,
  athletics: Trophy,
  'builder-tetris': Building2,
};

export default function JogosAutoraisPage({ allPosts, onSelectPost }: JogosAutoraisPageProps) {
  const { user } = useFirebaseAuth();
  const [selectedGame, setSelectedGame] = useState<GameType>('western');
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [lastPersonalBest, setLastPersonalBest] = useState<number | undefined>(undefined);

  const allGames = getAllGameTypes();
  const activeMeta = getGameCatalogItem(selectedGame);

  const matchingPosts = useMemo(
    () => allPosts.filter((p) => getGameTypeForPost(p) === selectedGame).slice(0, 4),
    [allPosts, selectedGame]
  );

  const handleScoreRecord = useCallback(
    (rawScore: number) => {
      if (!Number.isFinite(rawScore) || rawScore <= 0) return;
      trackGameEvent(selectedGame, 'score', Math.floor(rawScore));
      recordOfficialGameScore(user, selectedGame, rawScore)
        .then(({ personalBest }) => {
          setLastPersonalBest(personalBest);
          setLeaderboardRefresh((c) => c + 1);
        })
        .catch(() => {
          // Error telemetry handled inside recordOfficialGameScore
        });
    },
    [user, selectedGame]
  );

  return (
    <section
      aria-labelledby="jogos-autorais-heading"
      className="w-full px-4 sm:px-4 lg:px-5 py-5 sm:py-10"
    >
      {/* Page Header */}
      <div className="pb-4 sm:pb-6 mb-4 sm:mb-8 border-b border-stone-200 dark:border-[#1B3358] flex flex-col md:flex-row md:items-end justify-between gap-2.5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-[#B45309] dark:text-[#F5B731] mb-1">
            <Gamepad2 size={14} />
            <span>Arcade Editorial · Achar Temas</span>
          </div>
          <h1
            id="jogos-autorais-heading"
            className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-[#081224] dark:text-white tracking-tight"
          >
            Jogos Autorais
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 max-w-2xl mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">
            Cinco experiências interativas criadas para acompanhar os cadernos do portal — faroeste 16-bit, química aplicada, pintura marinha, atletismo e engenharia.
          </p>
        </div>

        <div className="hidden sm:block text-[11px] font-mono text-stone-600 dark:text-slate-400 whitespace-nowrap">
          5 jogos originais · 100% gratuitos no navegador
        </div>
      </div>

      {/* 5 Game Selector Cards: sleek horizontal swipe strip on mobile */}
      <div className="flex lg:grid lg:grid-cols-5 overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2.5 sm:gap-3 -mx-4 px-4 lg:mx-0 lg:px-0 mb-5 sm:mb-8 pb-1">
        {allGames.map((gt) => {
          const item = getGameCatalogItem(gt);
          const Icon = GAME_ICONS[gt];
          const isActive = selectedGame === gt;
          return (
            <button
              key={gt}
              type="button"
              data-arcade-select={gt}
              onClick={() => {
                setSelectedGame(gt);
                setLastPersonalBest(undefined);
              }}
              className={`min-w-[172px] max-w-[185px] lg:max-w-none lg:min-w-0 snap-start shrink-0 p-3 sm:p-4 rounded-2xl md:rounded-sm border text-left flex flex-col justify-between transition-colors cursor-pointer shadow-2xs md:shadow-none ${
                isActive
                  ? 'bg-[#081224] text-white border-[#F5B731] ring-1 ring-[#F5B731]'
                  : 'bg-white dark:bg-[#0B1930] border-stone-200 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] text-[#081224] dark:text-[#F4F0E6]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl md:rounded-sm flex items-center justify-center ${
                      isActive ? 'bg-[#F5B731] text-[#081224]' : 'bg-[#F4F1E8] dark:bg-[#050C18] text-[#B45309] dark:text-[#F5B731]'
                    }`}
                  >
                    <Icon size={15} />
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider ${
                      isActive ? 'text-[#F5B731]' : 'text-stone-500 dark:text-slate-400'
                    }`}
                  >
                    {isActive ? 'Ativo' : 'Jogar'}
                  </span>
                </div>
                <div className="font-display font-black text-xs sm:text-sm uppercase leading-snug mb-1 line-clamp-2">
                  {item.title}
                </div>
                <div
                  className={`text-[11px] leading-snug line-clamp-1 ${
                    isActive ? 'text-slate-300' : 'text-stone-500 dark:text-slate-400'
                  }`}
                >
                  {item.badge.split('·')[1]?.trim() || item.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Active Arcade Stage */}
      <div
        id="jogos-autorais-stage"
        data-game-type={selectedGame}
        className="rounded-2xl md:rounded-sm border border-stone-200 dark:border-[#1B3358] bg-white dark:bg-[#0B1930] overflow-hidden mb-8 sm:mb-10 shadow-sm md:shadow-none"
      >
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-stone-200 dark:border-[#1B3358] flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731]">
              {activeMeta.badge}
            </div>
            <h2 className="font-display font-black text-lg sm:text-2xl uppercase text-[#081224] dark:text-white">
              {activeMeta.title}
            </h2>
          </div>
          <div className="hidden sm:block text-xs font-mono text-stone-600 dark:text-slate-300">
            {activeMeta.controlsHint}
          </div>
        </div>

        <Suspense
          fallback={
            <div className="p-10 text-center text-xs font-mono text-stone-500 dark:text-slate-400">
              Carregando motor do jogo...
            </div>
          }
        >
          {selectedGame === 'western' && (
            <WesternShooterGame
              articleTitle="Acervo Histórico Achar Temas"
              onScoreRecord={handleScoreRecord}
            />
          )}
          {selectedGame === 'chemistry' && (
            <ChemistryLabGame
              articleTitle="Caderno Ciência & Natureza"
              onScoreRecord={handleScoreRecord}
            />
          )}
          {selectedGame === 'ocean-paint' && (
            <OceanPaintGame
              articleTitle="Ateliê Arte & Curiosidades"
              onScoreRecord={handleScoreRecord}
            />
          )}
          {selectedGame === 'athletics' && (
            <AthleticsRunnerGame
              articleTitle="Pista Saúde & Esporte"
              onScoreRecord={handleScoreRecord}
            />
          )}
          {selectedGame === 'builder-tetris' && (
            <BuilderTetrisGame
              articleTitle="Arquitetura & Construção"
              onScoreRecord={handleScoreRecord}
            />
          )}
        </Suspense>

        <GameLeaderboardPanel
          gameType={selectedGame}
          refreshTrigger={leaderboardRefresh}
          lastPersonalBest={lastPersonalBest}
        />
      </div>

      {/* Related Articles Connected to Selected Game */}
      {matchingPosts.length > 0 && (
        <div>
          <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] mb-1">
            Leitura Combinada
          </div>
          <h3 className="font-display font-black text-lg sm:text-xl uppercase text-[#081224] dark:text-white mb-4">
            Artigos do Portal que Contam com Este Jogo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {matchingPosts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => onSelectPost(post)}
                className="p-4 rounded-2xl md:rounded-sm bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] hover:border-[#F5B731] text-left flex flex-col justify-between gap-2.5 transition-colors cursor-pointer group shadow-2xs md:shadow-none"
              >
                <div className="font-display font-bold text-sm uppercase text-[#081224] dark:text-white group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] line-clamp-2">
                  {stripHtmlTags(post.title.rendered)}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731]">
                  <span>Abrir artigo</span>
                  <ArrowRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
