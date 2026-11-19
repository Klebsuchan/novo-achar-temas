import { useEffect, useState, FormEvent } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FilePlus2,
  Lock,
  Mail,
  MessageSquare,
  Send,
  Trash2,
  Users,
} from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import {
  Category,
  EditorialArticleDoc,
  Post,
  buildCleanArticlePath,
  createSlug,
  formatEditorialDate,
  getCategoryNameForPost,
  getPillarForPost,
  getPostHeroImage,
  isEditorialAdminUser,
  EDITORIAL_ADMIN_EMAIL,
  stripHtmlTags,
} from '../utils/blogLogic';
import { getArticleSeo } from '../data/articleSeo';

export { EDITORIAL_ADMIN_EMAIL, isEditorialAdminUser };

interface SubscriberRecord {
  uid: string;
  email: string;
  displayName: string;
  notifyNewArticles: boolean;
  preferredPillar: string;
}

interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAtIso: string;
}

interface EditorialAdminPageProps {
  allPosts: Post[];
  cmsArticles: EditorialArticleDoc[];
  categories: Category[];
  onRefreshCmsArticles: () => Promise<void>;
  onBackHome: () => void;
  onOpenPost: (post: Post) => void;
}

const SUGGESTED_IMAGES = [
  { label: 'História / Roma', path: '/wp-images/content-685-image-4.jpg' },
  { label: 'Ciência / Acústica', path: '/wp-images/content-666-image.jpg' },
  { label: 'Arte / Pintura', path: '/wp-images/content-560-image.jpg' },
  { label: 'Saúde / Corrida', path: '/src/assets/images/corrida_rua_esporte_1795095041679.jpg' },
  { label: 'Casa / Arquitetura', path: '/src/assets/images/acabamentos_inteligentes_casa_1795095031186.jpg' },
  { label: 'Natureza / Jardim', path: '/wp-images/content-650-image-2.jpg' },
];

export default function EditorialAdminPage({
  allPosts,
  cmsArticles,
  categories,
  onRefreshCmsArticles,
  onBackHome,
  onOpenPost,
}: EditorialAdminPageProps) {
  const { user, signInWithGoogle } = useFirebaseAuth();
  const isAdmin = isEditorialAdminUser(user);

  const [tab, setTab] = useState<'artigos' | 'newsletter' | 'mensagens'>('artigos');

  // CMS Article Editor Form State
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [categoryId, setCategoryId] = useState<number>(49);
  const [heroImage, setHeroImage] = useState('/wp-images/content-685-image-4.jpg');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [published, setPublished] = useState(true);
  const [savingArticle, setSavingArticle] = useState(false);
  const [articleStatus, setArticleStatus] = useState<string | null>(null);
  const [articleError, setArticleError] = useState<string | null>(null);

  // Subscribers & Broadcast State
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number>(allPosts[0]?.id || 685);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [newsletterResult, setNewsletterResult] = useState<{
    message: string;
    htmlDigest?: string;
    configured?: boolean;
  } | null>(null);

  // Contact Messages State
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const loadSubscribers = async () => {
    if (!isAdmin) return;
    setLoadingSubs(true);
    try {
      const snap = await getDocs(collection(db, 'newsletter_subscriptions'));
      const list: SubscriberRecord[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          uid: String(data.userUid || d.id),
          email: String(data.email || ''),
          displayName: String(data.displayName || 'Leitor'),
          notifyNewArticles: Boolean(data.notifyNewArticles),
          preferredPillar: String(data.preferredPillar || 'all'),
        });
      });
      setSubscribers(list);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'newsletter_subscriptions');
    } finally {
      setLoadingSubs(false);
    }
  };

  const loadMessages = async () => {
    if (!isAdmin) return;
    setLoadingMessages(true);
    try {
      const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: ContactMessageRecord[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          name: String(data.name || ''),
          email: String(data.email || ''),
          subject: String(data.subject || ''),
          message: String(data.message || ''),
          status: (data.status as ContactMessageRecord['status']) || 'new',
          createdAtIso:
            data.createdAt && typeof data.createdAt.toDate === 'function'
              ? data.createdAt.toDate().toISOString()
              : new Date().toISOString(),
        });
      });
      setMessages(list);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'contact_messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadSubscribers();
    loadMessages();
  }, [isAdmin]);

  if (!user) {
    return (
      <section className="w-full px-4 sm:px-4 lg:px-5 py-10 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-8 text-center">
          <Lock size={28} className="mx-auto text-[#B45309] dark:text-[#F5B731] mb-3" />
          <h1 className="font-display text-2xl font-black uppercase text-[#081224] dark:text-white mb-2">
            Painel Editorial Restrito
          </h1>
          <p className="text-sm text-stone-600 dark:text-slate-300 mb-6">
            Entre com a conta Google administradora autorizada para publicar artigos, gerenciar a
            newsletter e responder leitores.
          </p>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="min-h-[44px] bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] px-6 py-3 rounded-xl md:rounded-sm text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer"
          >
            Entrar com Google
          </button>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="w-full px-4 sm:px-4 lg:px-5 py-10 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-8 text-center">
          <Lock size={28} className="mx-auto text-red-600 mb-3" />
          <h1 className="font-display text-2xl font-black uppercase text-[#081224] dark:text-white mb-2">
            Acesso Não Autorizado
          </h1>
          <p className="text-sm text-stone-600 dark:text-slate-300 mb-6">
            A conta conectada ({user.email}) não possui permissão de editor-chefe deste portal.
          </p>
          <button
            type="button"
            onClick={onBackHome}
            className="min-h-[44px] bg-[#081224] dark:bg-[#F5B731] text-[#F5B731] dark:text-[#081224] px-6 py-3 rounded-xl md:rounded-sm text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer"
          >
            Voltar ao Portal
          </button>
        </div>
      </section>
    );
  }

  const resetForm = () => {
    setEditingDocId(null);
    setEditingPostId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContentHtml('');
    setCategoryId(49);
    setHeroImage('/wp-images/content-685-image-4.jpg');
    setFocusKeyword('');
    setMetaDescription('');
    setPublished(true);
    setArticleError(null);
  };

  const handleEditArticle = (item: EditorialArticleDoc) => {
    setEditingDocId(item.docId);
    setEditingPostId(item.postId);
    setTitle(item.title);
    setSlug(item.slug);
    setExcerpt(item.excerpt);
    setContentHtml(item.contentHtml);
    setCategoryId(item.categoryId);
    setHeroImage(item.heroImage || '/wp-images/content-685-image-4.jpg');
    setFocusKeyword(item.focusKeyword || '');
    setMetaDescription(item.metaDescription || '');
    setPublished(item.published);
    setArticleStatus(null);
    setArticleError(null);
  };

  const handleSaveArticle = async (e: FormEvent) => {
    e.preventDefault();
    setArticleError(null);
    setArticleStatus(null);

    const cleanTitle = title.trim();
    const cleanSlug = (slug.trim() || createSlug(cleanTitle)).slice(0, 160);
    const cleanExcerpt = excerpt.trim();
    const cleanContent = contentHtml.trim();

    if (cleanTitle.length < 4 || cleanTitle.length > 180) {
      setArticleError('O título deve ter entre 4 e 180 caracteres.');
      return;
    }
    if (cleanSlug.length < 2) {
      setArticleError('Informe um slug válido para a URL.');
      return;
    }
    if (cleanExcerpt.length < 10 || cleanExcerpt.length > 500) {
      setArticleError('O resumo deve ter entre 10 e 500 caracteres.');
      return;
    }
    if (cleanContent.length < 20 || cleanContent.length > 100000) {
      setArticleError('O corpo HTML do artigo precisa de pelo menos 20 caracteres.');
      return;
    }

    setSavingArticle(true);
    try {
      if (editingDocId) {
        const ref = doc(db, 'articles', editingDocId);
        await updateDoc(ref, {
          slug: cleanSlug,
          title: cleanTitle,
          excerpt: cleanExcerpt,
          contentHtml: cleanContent,
          categoryId: Number(categoryId) || 49,
          heroImage: heroImage.trim().slice(0, 500),
          published,
          focusKeyword: focusKeyword.trim().slice(0, 120),
          metaDescription: metaDescription.trim().slice(0, 200),
          updatedAt: serverTimestamp(),
        });
        setArticleStatus('Artigo atualizado com sucesso!');
      } else {
        const maxPostId = Math.max(
          1000,
          ...allPosts.map((p) => p.id),
          ...cmsArticles.map((a) => a.postId)
        );
        const newPostId = maxPostId + 1;
        const newDocId = `article_${newPostId}`;
        const ref = doc(db, 'articles', newDocId);
        await setDoc(ref, {
          postId: newPostId,
          slug: cleanSlug,
          title: cleanTitle,
          excerpt: cleanExcerpt,
          contentHtml: cleanContent,
          categoryId: Number(categoryId) || 49,
          heroImage: heroImage.trim().slice(0, 500),
          published,
          focusKeyword: focusKeyword.trim().slice(0, 120),
          metaDescription: metaDescription.trim().slice(0, 200),
          authorUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setArticleStatus(`Artigo #${newPostId} salvo e ${published ? 'publicado' : 'salvo como rascunho'}!`);
      }
      await onRefreshCmsArticles();
      resetForm();
    } catch (error) {
      handleFirestoreError(
        error,
        editingDocId ? OperationType.UPDATE : OperationType.CREATE,
        editingDocId ? `articles/${editingDocId}` : 'articles'
      );
    } finally {
      setSavingArticle(false);
    }
  };

  const handleTogglePublish = async (item: EditorialArticleDoc) => {
    try {
      await updateDoc(doc(db, 'articles', item.docId), {
        published: !item.published,
        updatedAt: serverTimestamp(),
      });
      await onRefreshCmsArticles();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `articles/${item.docId}`);
    }
  };

  const handleDeleteArticle = async (item: EditorialArticleDoc) => {
    try {
      await deleteDoc(doc(db, 'articles', item.docId));
      if (editingDocId === item.docId) resetForm();
      await onRefreshCmsArticles();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `articles/${item.docId}`);
    }
  };

  const handleUpdateMessageStatus = async (
    msgId: string,
    nextStatus: ContactMessageRecord['status']
  ) => {
    try {
      await updateDoc(doc(db, 'contact_messages', msgId), { status: nextStatus });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: nextStatus } : m))
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `contact_messages/${msgId}`);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, 'contact_messages', msgId));
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `contact_messages/${msgId}`);
    }
  };

  const selectedArticleForBroadcast =
    allPosts.find((p) => p.id === selectedPostId) || allPosts[0];
  const selectedPillar = selectedArticleForBroadcast
    ? getPillarForPost(selectedArticleForBroadcast)
    : null;
  const activeRecipients = subscribers.filter(
    (s) =>
      s.notifyNewArticles &&
      (s.preferredPillar === 'all' || s.preferredPillar === selectedPillar?.id)
  );

  const handleSendNewsletterBroadcast = async () => {
    if (!selectedArticleForBroadcast) return;
    setSendingNewsletter(true);
    setNewsletterResult(null);
    try {
      const idToken = await user.getIdToken();
      const seo = getArticleSeo(selectedArticleForBroadcast);
      const catName = getCategoryNameForPost(selectedArticleForBroadcast, categories);
      const origin = window.location.origin;
      const heroPath = getPostHeroImage(selectedArticleForBroadcast);
      const resp = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          articleTitle: stripHtmlTags(selectedArticleForBroadcast.title.rendered),
          articleUrl: `${origin}${buildCleanArticlePath(seo.slug)}`,
          articleExcerpt: stripHtmlTags(selectedArticleForBroadcast.excerpt.rendered),
          heroImageUrl: heroPath.startsWith('http') ? heroPath : `${origin}${heroPath}`,
          categoryName: catName,
          recipients: activeRecipients.map((r) => ({
            email: r.email,
            displayName: r.displayName,
          })),
        }),
      });
      const data = await resp.json();
      setNewsletterResult({
        message: data.message || data.error || 'Solicitação concluída.',
        htmlDigest: data.htmlDigest,
        configured: data.configured,
      });
    } catch {
      setNewsletterResult({
        message: 'Não foi possível conectar ao endpoint de envio da newsletter.',
      });
    } finally {
      setSendingNewsletter(false);
    }
  };

  const handleDownloadDigest = () => {
    if (!newsletterResult?.htmlDigest) return;
    const blob = new Blob([newsletterResult.htmlDigest], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-achar-temas-${selectedPostId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unreadCount = messages.filter((m) => m.status === 'new').length;
  const activeSubsCount = subscribers.filter((s) => s.notifyNewArticles).length;

  return (
    <section className="w-full px-4 sm:px-4 lg:px-5 py-6 sm:py-10">
      <button
        type="button"
        onClick={onBackHome}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 hover:text-[#B45309] dark:hover:text-[#F5B731] mb-5 cursor-pointer"
      >
        <ArrowLeft size={15} />
        <span>Voltar ao Início</span>
      </button>

      {/* Admin Header */}
      <div className="bg-[#081224] text-[#F4F0E6] border border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#F5B731] mb-1">
              Operação Editorial · Redação Achar Temas
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black uppercase text-white">
              Painel de Gestão do Blog
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Logado como <span className="font-mono text-[#F5B731]">{user.email}</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#0D1E3A] border border-[#1B3358] rounded-xl md:rounded-sm px-3 py-2">
              <div className="font-display text-xl font-black text-[#F5B731] tabular-nums">
                {allPosts.length}
              </div>
              <div className="text-[10px] font-mono uppercase text-slate-300">Artigos</div>
            </div>
            <div className="bg-[#0D1E3A] border border-[#1B3358] rounded-xl md:rounded-sm px-3 py-2">
              <div className="font-display text-xl font-black text-[#38BDF8] tabular-nums">
                {activeSubsCount}
              </div>
              <div className="text-[10px] font-mono uppercase text-slate-300">Assinantes</div>
            </div>
            <div className="bg-[#0D1E3A] border border-[#1B3358] rounded-xl md:rounded-sm px-3 py-2">
              <div className="font-display text-xl font-black text-emerald-400 tabular-nums">
                {unreadCount}
              </div>
              <div className="text-[10px] font-mono uppercase text-slate-300">Novas Msgs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab('artigos')}
          className={`min-h-[42px] px-4 py-2 rounded-xl md:rounded-sm text-xs font-display font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer ${
            tab === 'artigos'
              ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
              : 'bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] text-stone-700 dark:text-slate-300'
          }`}
        >
          <FilePlus2 size={15} />
          <span>Publicar & Gerenciar Artigos ({cmsArticles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('newsletter')}
          className={`min-h-[42px] px-4 py-2 rounded-xl md:rounded-sm text-xs font-display font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer ${
            tab === 'newsletter'
              ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
              : 'bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] text-stone-700 dark:text-slate-300'
          }`}
        >
          <Mail size={15} />
          <span>Newsletter & Disparo ({subscribers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('mensagens')}
          className={`min-h-[42px] px-4 py-2 rounded-xl md:rounded-sm text-xs font-display font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer ${
            tab === 'mensagens'
              ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
              : 'bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] text-stone-700 dark:text-slate-300'
          }`}
        >
          <MessageSquare size={15} />
          <span>Mensagens Recebidas ({messages.length})</span>
        </button>
      </div>

      {/* TAB 1: CMS ARTICLES */}
      {tab === 'artigos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleSaveArticle}
            className="lg:col-span-7 bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-black uppercase text-[#081224] dark:text-white">
                {editingDocId ? `Editando Artigo #${editingPostId}` : 'Novo Artigo Editorial'}
              </h2>
              {editingDocId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold text-[#B45309] dark:text-[#F5B731] hover:underline cursor-pointer"
                >
                  + Criar Novo
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Título do Artigo</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingDocId && !slug) {
                      setSlug(createSlug(e.target.value));
                    }
                  }}
                  placeholder="Ex.: A Revolução da Energia Solar no Século XXI"
                  className="w-full min-h-[42px] bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Slug da URL (/artigo/...)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(createSlug(e.target.value))}
                  placeholder="revolucao-energia-solar"
                  className="w-full min-h-[42px] bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Editoria / Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full min-h-[42px] bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Imagem de Capa</label>
                <select
                  value={SUGGESTED_IMAGES.some((i) => i.path === heroImage) ? heroImage : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') setHeroImage(e.target.value);
                  }}
                  className="w-full min-h-[42px] bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3 text-sm mb-2"
                >
                  {SUGGESTED_IMAGES.map((img) => (
                    <option key={img.path} value={img.path}>
                      Acervo: {img.label}
                    </option>
                  ))}
                  <option value="custom">URL / Caminho personalizado</option>
                </select>
                <input
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="/wp-images/... ou https://..."
                  className="w-full min-h-[38px] bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Resumo Editorial</label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Resumo exibido nos cards da capa e redes sociais..."
                className="w-full bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm p-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Conteúdo Completo (HTML com &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;)
              </label>
              <textarea
                rows={8}
                required
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                placeholder="<p>Introdução completa...</p><h2>Contexto Histórico</h2><p>Desenvolvimento...</p>"
                className="w-full bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm p-3 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Palavra-Chave SEO</label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="Ex.: energia solar no Brasil"
                  className="w-full min-h-[40px] bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Meta Description SEO</label>
                <input
                  type="text"
                  maxLength={200}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Até 160 caracteres para o Google"
                  className="w-full min-h-[40px] bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3 text-xs"
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 accent-[#D97706]"
              />
              <span>Publicar imediatamente no portal</span>
            </label>

            {articleError && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{articleError}</p>
            )}
            {articleStatus && (
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>{articleStatus}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={savingArticle}
              className="min-h-[44px] bg-[#F5B731] hover:bg-[#E09F1F] disabled:opacity-60 text-[#081224] px-6 py-2.5 rounded-xl md:rounded-sm text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer"
            >
              {savingArticle ? 'Salvando...' : editingDocId ? 'Atualizar Artigo' : 'Salvar Artigo'}
            </button>
          </form>

          {/* Published & Draft CMS Articles List */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-6">
            <h2 className="font-display text-lg font-black uppercase text-[#081224] dark:text-white mb-4">
              Artigos Criados no Painel ({cmsArticles.length})
            </h2>
            {cmsArticles.length === 0 ? (
              <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
                Nenhum artigo criado via painel ainda. Os {allPosts.length} artigos base continuam
                ativos normalmente, e qualquer novo artigo criado aqui será integrado ao acervo.
              </p>
            ) : (
              <div className="space-y-3">
                {cmsArticles.map((item) => (
                  <div
                    key={item.docId}
                    className="p-3.5 rounded-xl md:rounded-sm bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-mono uppercase text-[#B45309] dark:text-[#F5B731]">
                        #{item.postId} · {item.published ? 'Publicado' : 'Rascunho'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditArticle(item)}
                          title="Editar"
                          className="p-1.5 rounded-lg border border-stone-300 dark:border-[#1B3358] hover:border-[#F5B731] cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          title={item.published ? 'Ocultar' : 'Publicar'}
                          className="p-1.5 rounded-lg border border-stone-300 dark:border-[#1B3358] hover:border-[#F5B731] cursor-pointer"
                        >
                          {item.published ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(item)}
                          title="Excluir"
                          className="p-1.5 rounded-lg border border-stone-300 dark:border-[#1B3358] hover:border-red-500 text-red-600 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="font-display font-bold text-sm uppercase text-[#081224] dark:text-white mb-1">
                      {item.title}
                    </div>
                    {item.published && (
                      <button
                        type="button"
                        onClick={() => {
                          const found = allPosts.find((p) => p.id === item.postId);
                          if (found) onOpenPost(found);
                        }}
                        className="text-[11px] font-semibold text-[#0284C7] dark:text-[#38BDF8] hover:underline cursor-pointer"
                      >
                        Abrir artigo publicado →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NEWSLETTER DISPATCH */}
      {tab === 'newsletter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-6 space-y-4">
            <h2 className="font-display text-xl font-black uppercase text-[#081224] dark:text-white">
              Disparo de Novo Artigo
            </h2>
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5">
                Selecionar Artigo para Enviar
              </label>
              <select
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(Number(e.target.value))}
                className="w-full min-h-[42px] bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3 text-sm"
              >
                {allPosts.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} — {stripHtmlTags(p.title.rendered)}
                  </option>
                ))}
              </select>
            </div>

            {selectedArticleForBroadcast && (
              <div className="p-4 rounded-xl md:rounded-sm bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] text-xs space-y-1">
                <div className="font-bold text-[#B45309] dark:text-[#F5B731]">
                  Editoria: {selectedPillar?.shortTitle}
                </div>
                <div className="text-stone-700 dark:text-slate-300">
                  Destinatários elegíveis ativos: <strong>{activeRecipients.length}</strong> de{' '}
                  {subscribers.length} inscritos
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendNewsletterBroadcast}
              disabled={sendingNewsletter}
              className="min-h-[44px] inline-flex items-center gap-2 bg-[#F5B731] hover:bg-[#E09F1F] disabled:opacity-60 text-[#081224] px-5 py-2.5 rounded-xl md:rounded-sm text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer"
            >
              <Send size={14} />
              <span>{sendingNewsletter ? 'Processando...' : 'Gerar & Enviar Newsletter'}</span>
            </button>

            {newsletterResult && (
              <div className="p-4 rounded-xl md:rounded-sm bg-[#081224] text-slate-200 text-xs space-y-3 border border-[#1B3358]">
                <p>{newsletterResult.message}</p>
                {newsletterResult.htmlDigest && (
                  <button
                    type="button"
                    onClick={handleDownloadDigest}
                    className="inline-flex items-center gap-2 bg-[#F5B731] text-[#081224] px-3.5 py-2 rounded-lg font-bold uppercase text-[11px] cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Baixar HTML da Newsletter</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-black uppercase text-[#081224] dark:text-white flex items-center gap-2">
                <Users size={16} className="text-[#B45309] dark:text-[#F5B731]" />
                <span>Assinantes Cadastrados ({subscribers.length})</span>
              </h2>
              <button
                type="button"
                onClick={loadSubscribers}
                className="text-xs font-semibold text-[#B45309] dark:text-[#F5B731] hover:underline cursor-pointer"
              >
                Atualizar
              </button>
            </div>
            {loadingSubs ? (
              <p className="text-xs text-stone-500">Carregando assinantes...</p>
            ) : subscribers.length === 0 ? (
              <p className="text-xs text-stone-600 dark:text-slate-400">
                Nenhum assinante inscrito até o momento.
              </p>
            ) : (
              <div className="divide-y divide-stone-200 dark:divide-[#1B3358] max-h-96 overflow-y-auto">
                {subscribers.map((sub) => (
                  <div key={sub.uid} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-[#081224] dark:text-white truncate">
                        {sub.displayName}
                      </div>
                      <div className="font-mono text-stone-500 dark:text-slate-400 truncate">
                        {sub.email}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          sub.notifyNewArticles
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-stone-200 text-stone-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {sub.notifyNewArticles ? 'Ativo' : 'Pausado'}
                      </span>
                      <div className="text-[10px] text-stone-500 mt-0.5">{sub.preferredPillar}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT MESSAGES */}
      {tab === 'mensagens' && (
        <div className="bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-black uppercase text-[#081224] dark:text-white">
              Caixa de Entrada do Contato ({messages.length})
            </h2>
            <button
              type="button"
              onClick={loadMessages}
              className="text-xs font-semibold text-[#B45309] dark:text-[#F5B731] hover:underline cursor-pointer"
            >
              Atualizar
            </button>
          </div>

          {loadingMessages ? (
            <p className="text-xs text-stone-500">Carregando mensagens...</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-stone-600 dark:text-slate-400">
              Nenhuma mensagem enviada pelo formulário de Contato até o momento.
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <article
                  key={msg.id}
                  className="p-4 rounded-xl md:rounded-sm bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="font-bold text-sm text-[#081224] dark:text-white">
                        {msg.subject}
                      </span>
                      <div className="text-xs text-stone-600 dark:text-slate-400">
                        De: <strong>{msg.name}</strong> ({msg.email}) ·{' '}
                        {formatEditorialDate(msg.createdAtIso)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={msg.status}
                        onChange={(e) =>
                          handleUpdateMessageStatus(
                            msg.id,
                            e.target.value as ContactMessageRecord['status']
                          )
                        }
                        className="text-xs bg-white dark:bg-[#0B1930] border border-stone-300 dark:border-[#1B3358] rounded px-2 py-1"
                      >
                        <option value="new">Nova</option>
                        <option value="read">Lida</option>
                        <option value="replied">Respondida</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        title="Excluir mensagem"
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
