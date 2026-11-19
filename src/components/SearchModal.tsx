import { useState, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import {
  Post,
  Category,
  filterAndSortPosts,
  getPostHeroImage,
  getCategoryNameForPost,
  calculateReadingMetrics,
  formatEditorialDate,
  stripHtmlTags,
} from '../utils/blogLogic';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPosts: Post[];
  categories: Category[];
  onSelectPost: (post: Post) => void;
}

const SUGGESTED_TOPICS = [
  'Constantino',
  'Nikola Tesla',
  'Figuras de Chladni',
  'Van Gogh',
  'Ansiedade',
  'Engenharia Antiga',
  'Espiral de Ervas',
];

export default function SearchModal({
  isOpen,
  onClose,
  allPosts,
  categories,
  onSelectPost,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return allPosts.slice(0, 6);
    return filterAndSortPosts(allPosts, { searchQuery: query, sortBy: 'recent' });
  }, [allPosts, query]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pesquisar artigos no Achar Temas"
      className="fixed inset-0 z-50 bg-[#050C18]/80 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 md:p-10 overflow-y-auto"
    >
      <div className="bg-[#F4F1E8] dark:bg-[#0B1930] border border-stone-300 dark:border-[#1B3358] rounded-sm max-w-4xl w-full shadow-2xl overflow-hidden my-auto">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-300 dark:border-[#1B3358] bg-white dark:bg-[#081224]">
          <Search className="text-[#D97706] dark:text-[#F5B731] shrink-0" size={22} />
          <label htmlFor="global-search-input" className="sr-only">
            Pesquisar por título, tema ou palavra-chave
          </label>
          <input
            id="global-search-input"
            type="search"
            autoFocus
            placeholder="Pesquisar por tema, cientista, período histórico ou palavra-chave..."
            className="flex-1 bg-transparent text-[#081224] dark:text-[#F4F0E6] text-base sm:text-lg font-medium focus:outline-none placeholder:text-stone-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-stone-500 hover:text-[#081224] dark:hover:text-white px-2 py-1 cursor-pointer"
            >
              Limpar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar pesquisa"
            className="p-2 text-stone-500 hover:text-[#081224] dark:hover:text-white rounded-sm transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Suggested Quick Search Terms */}
        <div className="px-5 py-3 bg-stone-200/60 dark:bg-[#050C18] border-b border-stone-300 dark:border-[#1B3358] flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-600 dark:text-slate-400 mr-1">
            Buscas rápidas:
          </span>
          {SUGGESTED_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setQuery(topic)}
              className="text-xs font-medium px-2.5 py-1 rounded-sm bg-white dark:bg-[#0B1930] text-[#081224] dark:text-slate-200 border border-stone-300 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] transition-colors cursor-pointer whitespace-nowrap"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Search Results Body */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-stone-600 dark:text-slate-400">
              {query.trim()
                ? `${results.length} ${results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} para "${query}"`
                : 'Artigos em Destaque para Leitura Imediata'}
            </h3>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-display font-extrabold uppercase text-[#081224] dark:text-[#F4F0E6] mb-1">
                Nenhum artigo encontrado para "{query}"
              </p>
              <p className="text-sm text-stone-600 dark:text-slate-400">
                Experimente buscar por termos como História, Física, Pintura, Saúde ou Engenharia.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((post) => {
                const heroImg = getPostHeroImage(post);
                const catName = getCategoryNameForPost(post, categories);
                const metrics = calculateReadingMetrics(post.content.rendered);
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                    className="text-left bg-white dark:bg-[#081224] border border-stone-300 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] rounded-sm p-3.5 flex gap-3.5 items-start group transition-colors cursor-pointer"
                  >
                    <img
                      src={heroImg}
                      alt={stripHtmlTags(post.title.rendered)}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-sm object-cover shrink-0 bg-stone-200 dark:bg-[#050C18]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-slate-400 mb-1">
                        <span className="font-semibold text-[#B45309] dark:text-[#F5B731]">
                          {catName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{formatEditorialDate(post.date)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{metrics.readingTimeMinutes} min</span>
                      </div>
                      <h4 className="font-display font-extrabold text-sm uppercase text-[#081224] dark:text-[#F4F0E6] group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] transition-colors line-clamp-2 leading-snug">
                        {stripHtmlTags(post.title.rendered)}
                      </h4>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731]">
                        Ler artigo <ArrowRight size={12} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
