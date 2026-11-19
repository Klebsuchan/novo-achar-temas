import { useState } from 'react';
import { Shield, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

interface LegalPagesProps {
  page: 'privacidade' | 'termos' | 'cookies';
  onBackHome: () => void;
  onNavigateLegal: (page: 'privacidade' | 'termos' | 'cookies') => void;
}

export default function LegalPages({ page, onBackHome, onNavigateLegal }: LegalPagesProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [personalizedAdsEnabled, setPersonalizedAdsEnabled] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveCookiePrefs = () => {
    try {
      localStorage.setItem(
        'achar_temas_cookie_prefs',
        JSON.stringify({
          essential: true,
          analytics: analyticsEnabled,
          personalizedAds: personalizedAdsEnabled,
          updatedAt: new Date().toISOString(),
        })
      );
      localStorage.setItem('cookieConsent', 'true');
    } catch {
      // ignore storage errors
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 4000);
  };

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

      {/* Navigation Tabs between Legal Documents */}
      <div className="flex sm:flex-wrap items-center gap-1.5 sm:gap-2 p-1.5 bg-stone-200/80 dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onNavigateLegal('privacidade')}
          className={`min-h-[38px] px-3.5 sm:px-4 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-xl md:rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            page === 'privacidade'
              ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
              : 'text-stone-700 dark:text-slate-300 hover:text-[#081224] dark:hover:text-white'
          }`}
        >
          Política de Privacidade & LGPD
        </button>
        <button
          type="button"
          onClick={() => onNavigateLegal('termos')}
          className={`min-h-[38px] px-3.5 sm:px-4 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-xl md:rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            page === 'termos'
              ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
              : 'text-stone-700 dark:text-slate-300 hover:text-[#081224] dark:hover:text-white'
          }`}
        >
          Termos de Uso
        </button>
        <button
          type="button"
          onClick={() => onNavigateLegal('cookies')}
          className={`min-h-[38px] px-3.5 sm:px-4 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-xl md:rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            page === 'cookies'
              ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
              : 'text-stone-700 dark:text-slate-300 hover:text-[#081224] dark:hover:text-white'
          }`}
        >
          Política Editorial, Cookies & Comentários
        </button>
      </div>

      {page === 'privacidade' && (
        <article className="bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-10 editorial-prose shadow-2xs md:shadow-none">
          <div className="flex items-center gap-2 text-xs text-[#B45309] dark:text-[#F5B731] font-semibold uppercase tracking-wider mb-2">
            <Shield size={15} />
            <span>Conformidade LGPD (Lei nº 13.709/2018) & Google AdSense</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-[#081224] dark:text-[#F4F0E6] mb-6">
            Política de Privacidade
          </h1>

          <p>
            A sua privacidade é prioridade fundamental no portal editorial independente <strong>Achar Temas</strong> (
            <code>achartemas.com</code>). Este documento explica de forma transparente quais informações coletamos,
            como as utilizamos e quais são os seus direitos nos termos da Lei Geral de Proteção de Dados Pessoais
            (LGPD — Lei nº 13.709/2018) e das políticas do programa <strong>Google AdSense</strong>.
          </p>

          <h2>1. Coleta de Dados e Interação com o Leitor</h2>
          <p>
            O acesso aos artigos do Achar Temas é gratuito e não exige cadastro prévio. Coletamos dados pessoais apenas
            quando fornecidos voluntariamente pelo leitor em situações específicas:
          </p>
          <ul>
            <li>
              <strong>Comentários com Login Google:</strong> Nome público de exibição, foto de perfil opcional e
              conteúdo do comentário publicado por leitores autenticados via Google OAuth. O endereço de e-mail
              jamais é exibido publicamente.
            </li>
            <li>
              <strong>Boletim Informativo por E-mail:</strong> Endereço de e-mail confirmado via conta Google para
              recebimento gratuito de novos artigos publicados no portal.
            </li>
            <li>
              <strong>Dados Técnicos de Navegação:</strong> Endereço IP anonimizado, tipo de navegador, páginas
              visitadas, tempo de leitura e métricas de desempenho (Core Web Vitals).
            </li>
          </ul>

          <h2>2. Google AdSense e o Cookie DoubleClick DART</h2>
          <p>
            Utilizamos o programa de publicidade <strong>Google AdSense</strong> para exibir anúncios relevantes e
            manter a produção editorial gratuita. Em conformidade com os requisitos obrigatórios do Google AdSense,
            informamos que:
          </p>
          <ul>
            <li>
              Terceiros, incluindo o Google, utilizam cookies para veicular anúncios com base em visitas anteriores do
              usuário ao nosso website ou a outros websites na internet.
            </li>
            <li>
              Com o uso de cookies de publicidade (como o cookie <strong>DoubleClick DART</strong>), o Google e seus
              parceiros podem veicular anúncios personalizados para os usuários com base nas visitas feitas ao Achar
              Temas e/ou a outros sites na internet.
            </li>
            <li>
              Os usuários podem desativar a publicidade personalizada a qualquer momento acessando as{' '}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                Configurações de Anúncios do Google
              </a>{' '}
              ou visitando o portal{' '}
              <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">
                aboutads.info
              </a>
              .
            </li>
          </ul>

          <h2>3. Links Externos e Programa de Afiliados Shopee</h2>
          <p>
            Nosso portal contém links para a nossa Vitrine Shopee Achar Temas e fontes históricas ou científicas
            externas. Quando você clica em um link externo, passa a estar sujeito à política de privacidade da
            plataforma de destino.
          </p>

          <h2>4. Direitos do Titular dos Dados (Art. 18 da LGPD)</h2>
          <p>
            Você tem o direito de solicitar a confirmação da existência de tratamento, acesso, correção ou exclusão de
            qualquer comentário ou inscrição de e-mail diretamente na interface do site. Para gerenciar suas
            preferências, acesse também a aba{' '}
            <button
              type="button"
              onClick={() => onNavigateLegal('cookies')}
              className="text-[#B45309] dark:text-[#F5B731] font-semibold underline cursor-pointer"
            >
              Política Editorial, Cookies & Comentários
            </button>{' '}
            ou consulte nossos{' '}
            <button
              type="button"
              onClick={() => onNavigateLegal('termos')}
              className="text-[#B45309] dark:text-[#F5B731] font-semibold underline cursor-pointer"
            >
              Termos de Uso
            </button>
            .
          </p>
        </article>
      )}

      {page === 'termos' && (
        <article className="bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-10 editorial-prose shadow-2xs md:shadow-none">
          <div className="flex items-center gap-2 text-xs text-[#B45309] dark:text-[#F5B731] font-semibold uppercase tracking-wider mb-2">
            <FileText size={15} />
            <span>Condições Gerais de Acesso e Propriedade Intelectual</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-[#081224] dark:text-[#F4F0E6] mb-6">
            Termos de Uso
          </h1>

          <p>
            Bem-vindo ao <strong>Achar Temas</strong>. Ao acessar e utilizar este portal editorial, você concorda em
            cumprir estes Termos de Uso e todas as leis aplicáveis.
          </p>

          <h2>1. Finalidade Informativa e Cultural</h2>
          <p>
            Todo o conteúdo publicado no Achar Temas — abrangendo artigos sobre história, ciência, biodiversidade,
            arte, engenharia, gastronomia e saúde — possui caráter estritamente informativo, educacional e cultural.
          </p>
          <ul>
            <li>
              <strong>Aviso sobre Saúde e Bem-Estar:</strong> Artigos na editoria de Saúde e Esporte (como textos sobre
              ansiedade, prevenção de AVC, natação e corrida) baseiam-se em literatura de divulgação científica e{' '}
              <strong>não substituem diagnóstico, consulta ou orientação médica profissional</strong>.
            </li>
          </ul>

          <h2>2. Propriedade Intelectual e Citação</h2>
          <p>
            Os textos originais, curadoria temática, estrutura visual e identidade da marca Achar Temas são protegidos
            pela legislação de direitos autorais (Lei nº 9.610/1998). É permitida a citação de trechos curtos para fins
            acadêmicos ou jornalísticos, desde que acompanhada de crédito explícito ao portal (
            <strong>Redação Achar Temas</strong>) e link direto para o artigo original.
          </p>

          <h2>3. Conduta nos Comentários e Autenticação Google</h2>
          <p>
            O espaço de comentários é dedicado ao debate respeitoso entre leitores autenticados com conta Google. Não
            são permitidos comentários com discurso de ódio, spam comercial, links maliciosos ou ofensas pessoais. O
            próprio autor pode excluir seu comentário a qualquer momento.
          </p>
        </article>
      )}

      {page === 'cookies' && (
        <article className="bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-10 shadow-2xs md:shadow-none">
          <div className="editorial-prose">
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-[#081224] dark:text-[#F4F0E6] mb-6">
              Política Editorial, Cookies & Comentários
            </h1>

            <p>
              O <strong>Achar Temas</strong> adota os princípios internacionais de qualidade editorial{' '}
              <strong>E-E-A-T</strong> (Experiência, Especialidade, Autoridade e Confiabilidade). Cada artigo passa por
              pesquisa bibliográfica, estruturação didática e revisão periódica sob responsabilidade da{' '}
              <strong>Redação Achar Temas</strong>.
            </p>

            <h2>Gerenciamento de Preferências de Cookies</h2>
            <p>
              Você pode personalizar abaixo como os cookies de análise de tráfego e de publicidade do Google AdSense
              funcionam durante a sua sessão no Achar Temas:
            </p>
          </div>

          {/* Interactive Cookie Preferences Panel */}
          <div className="mt-6 space-y-4 border-t border-stone-200 dark:border-[#1B3358] pt-6">
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl md:rounded-sm bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358]">
              <div>
                <h3 className="text-sm font-bold text-[#081224] dark:text-[#F4F0E6]">
                  1. Cookies Essenciais e de Preferência Visual (Sempre Ativos)
                </h3>
                <p className="text-xs text-stone-600 dark:text-slate-400 mt-1">
                  Necessários para salvar sua escolha entre Modo Claro/Escuro, tamanho da fonte de leitura e sessão de
                  login Google.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                Obrigatório
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl md:rounded-sm bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358]">
              <div>
                <label
                  htmlFor="toggle-analytics-cookies"
                  className="text-sm font-bold text-[#081224] dark:text-[#F4F0E6] cursor-pointer"
                >
                  2. Cookies de Desempenho e Métricas Editoriais
                </label>
                <p className="text-xs text-stone-600 dark:text-slate-400 mt-1">
                  Ajudam a entender quais artigos e categorias (História, Ciência, Arte) despertam maior interesse para
                  orientar novas publicações.
                </p>
              </div>
              <input
                id="toggle-analytics-cookies"
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#D97706] cursor-pointer mt-1"
              />
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl md:rounded-sm bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358]">
              <div>
                <label
                  htmlFor="toggle-adsense-cookies"
                  className="text-sm font-bold text-[#081224] dark:text-[#F4F0E6] cursor-pointer"
                >
                  3. Cookies de Publicidade Google AdSense
                </label>
                <p className="text-xs text-stone-600 dark:text-slate-400 mt-1">
                  Permitem exibir anúncios compatíveis com seus interesses e limitar a repetição de um mesmo anúncio.
                </p>
              </div>
              <input
                id="toggle-adsense-cookies"
                type="checkbox"
                checked={personalizedAdsEnabled}
                onChange={(e) => setPersonalizedAdsEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#D97706] cursor-pointer mt-1"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleSaveCookiePrefs}
                className="min-h-[44px] bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] px-5 py-2.5 rounded-xl md:rounded-sm text-xs font-display font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Salvar Minhas Preferências de Cookies
              </button>
              {savedNotice && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={15} />
                  <span>Preferências salvas com sucesso!</span>
                </span>
              )}
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
