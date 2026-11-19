import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  Mail,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { EDITORIAL_PILLARS } from '../utils/blogLogic';

interface AboutPageProps {
  totalArticles: number;
  totalWords: number;
  onBackHome: () => void;
  onNavigateContact: () => void;
  onNavigateArticles: (pillarId?: string) => void;
  onNavigateGames: () => void;
}

export default function AboutPage({
  totalArticles,
  totalWords,
  onBackHome,
  onNavigateContact,
  onNavigateArticles,
  onNavigateGames,
}: AboutPageProps) {
  return (
    <section className="w-full px-4 sm:px-4 lg:px-5 py-6 sm:py-10">
      <button
        type="button"
        onClick={onBackHome}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 hover:text-[#B45309] dark:hover:text-[#F5B731] mb-5 sm:mb-6 cursor-pointer"
      >
        <ArrowLeft size={15} />
        <span>Voltar ao Início</span>
      </button>

      {/* Hero E-E-A-T Statement */}
      <div className="bg-white dark:bg-[#081224] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-6 sm:p-10 lg:p-12 mb-6 sm:mb-10 shadow-xs md:shadow-none">
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] mb-3">
          <Compass size={14} />
          <span>Institucional · E-E-A-T Editorial</span>
        </div>

        <h1
          className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-[#081224] dark:text-white tracking-tight leading-[1.06] mb-4"
          style={{ textWrap: 'balance' }}
        >
          Sobre o Achar Temas: Conhecimento Claro, Verificado e Gratuito
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-slate-300 leading-relaxed max-w-3xl mb-6">
          O <strong>Achar Temas</strong> nasceu com o propósito de tornar temas complexos de história,
          ciência, biodiversidade, arte, saúde e cultura pop acessíveis em português — com leitura
          prazerosa, zero sensacionalismo e rigor na checagem das fontes.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-5 border-t border-stone-200 dark:border-[#1B3358]">
          <div>
            <div className="font-display text-2xl sm:text-3xl font-black text-[#B45309] dark:text-[#F5B731] tabular-nums">
              {totalArticles}
            </div>
            <div className="text-xs text-stone-600 dark:text-slate-400">Artigos Publicados</div>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-black text-[#B45309] dark:text-[#F5B731] tabular-nums">
              {Math.floor(totalWords / 1000)}k+
            </div>
            <div className="text-xs text-stone-600 dark:text-slate-400">Palavras Revisadas</div>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-black text-[#B45309] dark:text-[#F5B731] tabular-nums">
              {EDITORIAL_PILLARS.length}
            </div>
            <div className="text-xs text-stone-600 dark:text-slate-400">Cadernos Temáticos</div>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-black text-[#B45309] dark:text-[#F5B731] tabular-nums">
              5
            </div>
            <div className="text-xs text-stone-600 dark:text-slate-400">Jogos Autorais</div>
          </div>
        </div>
      </div>

      {/* Editorial Standards & Methodology Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 sm:mb-10">
        <article className="lg:col-span-7 bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731]">
            <BookOpenCheck size={15} />
            <span>Metodologia de Apuração & Revisão</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-[#081224] dark:text-white">
            Como Produzimos Cada Reportagem
          </h2>
          <ul className="space-y-4 text-sm text-stone-700 dark:text-slate-300 leading-relaxed">
            <li className="flex items-start gap-3">
              <CheckCircle2 size={17} className="text-[#0EA5E9] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#081224] dark:text-white">Pesquisa em Fontes Primárias:</strong>{' '}
                Artigos históricos, científicos e médicos são estruturados com base em consensos
                acadêmicos, documentos originais e referências reconhecidas.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={17} className="text-[#0EA5E9] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#081224] dark:text-white">Clareza Didática & Resumo Objetivo:</strong>{' '}
                Estruturamos índice navegável, pontos-chave de leitura rápida e perguntas frequentes
                para facilitar o entendimento de estudantes e leitores curiosos.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={17} className="text-[#0EA5E9] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#081224] dark:text-white">Aprendizado Interativo:</strong>{' '}
                Nossos 5 jogos autorais complementam os textos — permitindo sintetizar fórmulas
                químicas reais, explorar história, colorir o oceano, treinar atletismo e planejar
                construções.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={17} className="text-[#081224] dark:text-white shrink-0 mt-0.5 hidden" />
              <ShieldCheck size={17} className="text-[#0EA5E9] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#081224] dark:text-white">Transparência de Receita:</strong>{' '}
                O acesso ao portal é 100% gratuito, sustentado por anúncios do Google AdSense e pela
                nossa vitrine de achados curados na Shopee, sem jamais influenciar nossas análises.
              </div>
            </li>
          </ul>
        </article>

        <aside className="lg:col-span-5 bg-[#081224] text-[#F4F0E6] border border-[#1B3358] rounded-2xl md:rounded-sm p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logoachartemas.jpg"
                alt="Redação Achar Temas"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-[#F5B731] shrink-0"
              />
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#F5B731] flex items-center gap-1.5">
                  <Users size={13} />
                  <span>Equipe Editorial</span>
                </div>
                <h2 className="font-display font-black text-xl uppercase text-white">
                  Redação Achar Temas
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              Publicação digital independente sediada no Brasil, dedicada à divulgação cultural,
              histórica, científica e prática em língua portuguesa.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Encontrou alguma imprecisão, quer sugerir uma pauta ou tratar de parcerias comerciais?
              Nossa redação responde diretamente pelo canal oficial de contato.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onNavigateContact}
              className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-2 bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] px-4 py-2.5 rounded-xl md:rounded-sm text-xs font-display font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Mail size={14} />
              <span>Falar com a Redação</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateArticles('all')}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 border border-[#1B3358] hover:border-[#F5B731] text-slate-200 px-4 py-2.5 rounded-xl md:rounded-sm text-xs font-display font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Ler Artigos</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </aside>
      </div>

      {/* Editorial Cadernos Overview */}
      <div className="bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-[#081224] dark:text-white">
            Nossos 6 Cadernos Editoriais
          </h2>
          <button
            type="button"
            onClick={onNavigateGames}
            className="text-xs font-display font-extrabold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] hover:underline cursor-pointer"
          >
            Conhecer Jogos Autorais →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EDITORIAL_PILLARS.map((pillar) => (
            <button
              key={pillar.id}
              type="button"
              onClick={() => onNavigateArticles(pillar.id)}
              className="text-left p-4 rounded-xl md:rounded-sm bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] transition-colors cursor-pointer"
            >
              <div className="font-display font-extrabold text-sm uppercase text-[#081224] dark:text-white mb-1">
                {pillar.title}
              </div>
              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
                {pillar.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
