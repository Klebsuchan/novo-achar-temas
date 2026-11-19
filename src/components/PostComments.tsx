import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  Send,
  LogIn,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { fetchComments, WPComment } from '../services/api';
import { formatEditorialDate, stripHtmlTags } from '../utils/blogLogic';
import {
  db,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

interface FirestoreCommentDoc {
  id: string;
  postId: number;
  authorUid: string;
  authorName: string;
  authorPhotoUrl: string;
  content: string;
  createdAtIso: string;
  createdAtMs: number;
}

export default function PostComments({ postId }: { postId: number }) {
  const { user, authReady, authError, signInWithGoogle } = useFirebaseAuth();

  const [wpComments, setWpComments] = useState<WPComment[]>([]);
  const [cloudComments, setCloudComments] = useState<FirestoreCommentDoc[]>([]);
  const [newComment, setNewComment] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load archival WordPress comments
  useEffect(() => {
    fetchComments(postId)
      .then((data) => setWpComments(data))
      .catch(() => setWpComments([]));
  }, [postId]);

  // Real-time Firestore comments listener for this post
  useEffect(() => {
    if (!authReady) return;
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('postId', '==', postId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: FirestoreCommentDoc[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let createdAtIso = new Date().toISOString();
          let createdAtMs = Date.now();
          if (data.createdAt instanceof Timestamp) {
            createdAtIso = data.createdAt.toDate().toISOString();
            createdAtMs = data.createdAt.toMillis();
          }
          return {
            id: docSnap.id,
            postId: Number(data.postId),
            authorUid: String(data.authorUid || ''),
            authorName: String(data.authorName || 'Leitor'),
            authorPhotoUrl: String(data.authorPhotoUrl || ''),
            content: String(data.content || ''),
            createdAtIso,
            createdAtMs,
          };
        });
        docs.sort((a, b) => a.createdAtMs - b.createdAtMs);
        setCloudComments(docs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'comments');
      }
    );

    return () => unsubscribe();
  }, [postId, authReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmittedSuccess(false);

    if (!user) {
      setErrorMsg('Faça login com sua conta Google para publicar um comentário.');
      return;
    }

    const cleanContent = newComment.trim();
    if (cleanContent.length < 3) {
      setErrorMsg('Escreva um comentário com pelo menos 3 caracteres.');
      return;
    }
    if (cleanContent.length > 1500) {
      setErrorMsg('O comentário deve ter no máximo 1.500 caracteres.');
      return;
    }

    const rawName = (user.displayName || user.email?.split('@')[0] || 'Leitor Achar Temas').trim();
    const safeName = rawName.length >= 2 ? rawName.slice(0, 80) : 'Leitor Google';
    const safePhoto = (user.photoURL || '').slice(0, 500);
    const commentId = `c_${postId}_${user.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32)}_${Date.now()}`;

    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'comments', commentId), {
        postId,
        authorUid: user.uid,
        authorName: safeName,
        authorPhotoUrl: safePhoto,
        content: cleanContent,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
      setSubmittedSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `comments/${commentId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
    }
  };

  const totalCount = wpComments.length + cloudComments.length;

  return (
    <section
      aria-labelledby="comments-heading"
      className="mt-14 pt-10 border-t border-stone-300 dark:border-[#1B3358]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2
            id="comments-heading"
            className="text-2xl font-display font-extrabold uppercase text-[#081224] dark:text-[#F4F0E6] flex items-center gap-2.5"
          >
            <MessageSquare size={22} className="text-[#D97706] dark:text-[#F5B731]" />
            <span>Discussão & Comentários dos Leitores</span>
          </h2>
          <p className="text-xs text-stone-600 dark:text-slate-400 mt-1">
            Comentários verificados com login Google de acordo com nossa Política Editorial.
          </p>
        </div>
        <span className="font-mono text-xs text-stone-600 dark:text-slate-400 tabular-nums">
          {totalCount} {totalCount === 1 ? 'comentário' : 'comentários'}
        </span>
      </div>

      {/* Existing Comments List */}
      <div className="space-y-4 mb-10">
        {wpComments.map((comment) => (
          <article
            key={`wp-${comment.id}`}
            className="bg-white dark:bg-[#0B1930] p-5 border border-stone-300 dark:border-[#1B3358] rounded-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#081224] text-[#F5B731] rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm text-[#081224] dark:text-[#F4F0E6]">
                  {comment.author_name}
                </div>
                <div className="text-xs text-stone-500 dark:text-slate-400 font-mono">
                  {formatEditorialDate(comment.date)} · Arquivo Editorial
                </div>
              </div>
            </div>
            <p className="text-sm text-stone-700 dark:text-slate-300 leading-relaxed">
              {stripHtmlTags(comment.content.rendered)}
            </p>
          </article>
        ))}

        {cloudComments.map((comment) => {
          const isOwnComment = Boolean(user && user.uid === comment.authorUid);
          return (
            <article
              key={comment.id}
              className="bg-white dark:bg-[#0B1930] p-5 border border-stone-300 dark:border-[#1B3358] rounded-sm"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {comment.authorPhotoUrl ? (
                    <img
                      src={comment.authorPhotoUrl}
                      alt={comment.authorName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-[#F5B731]"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-[#081224] text-[#F5B731] rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-sm text-[#081224] dark:text-[#F4F0E6] flex items-center gap-1.5">
                      <span>{comment.authorName}</span>
                      <ShieldCheck size={13} className="text-[#0EA5E9]" />
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 font-mono">
                      {formatEditorialDate(comment.createdAtIso)} · Conta Google Verificada
                    </div>
                  </div>
                </div>

                {isOwnComment && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment.id)}
                    aria-label="Excluir meu comentário"
                    className="inline-flex items-center gap-1 text-xs text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Excluir</span>
                  </button>
                )}
              </div>
              <p className="text-sm text-stone-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </article>
          );
        })}

        {totalCount === 0 && (
          <div className="bg-white/60 dark:bg-[#0B1930]/60 border border-stone-300 dark:border-[#1B3358] rounded-sm p-6 text-center">
            <p className="text-stone-600 dark:text-slate-300 text-sm">
              Ainda não há comentários neste artigo. Entre com sua conta Google e inicie a conversa abaixo!
            </p>
          </div>
        )}
      </div>

      {/* Add Comment Area — Requires Google Authentication */}
      <div className="bg-white dark:bg-[#0B1930] p-6 border border-stone-300 dark:border-[#1B3358] rounded-sm">
        <h3 className="font-display font-extrabold uppercase text-lg text-[#081224] dark:text-[#F4F0E6] mb-1">
          Participar da Discussão
        </h3>

        {!user ? (
          <div className="mt-3">
            <p className="text-xs text-stone-600 dark:text-slate-300 mb-4 leading-relaxed">
              Para garantir um debate autêntico e livre de spam, os comentários são exclusivos para leitores autenticados com o Google.
            </p>
            {authError && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-sm bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300"
              >
                {authError}
              </div>
            )}
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="inline-flex items-center gap-2.5 bg-[#081224] dark:bg-[#F5B731] text-[#F5B731] dark:text-[#081224] hover:bg-[#102444] dark:hover:bg-[#F8C854] px-5 py-3 rounded-sm text-xs font-display font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <LogIn size={15} />
              <span>Entrar com Google para Comentar</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-3">
            <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-stone-200 dark:border-[#1B3358]">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Leitor'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-[#F5B731]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#081224] text-[#F5B731] flex items-center justify-center text-xs font-bold">
                    {(user.displayName || user.email || 'L').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-xs">
                  <span className="text-stone-500 dark:text-slate-400">Comentando como </span>
                  <strong className="text-[#081224] dark:text-[#F4F0E6]">
                    {user.displayName || user.email}
                  </strong>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                Google Verificado
              </span>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-sm bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300"
              >
                {errorMsg}
              </div>
            )}

            {submittedSuccess && (
              <div
                role="status"
                className="mb-4 p-3 rounded-sm bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>Comentário publicado em tempo real! Obrigado por participar.</span>
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="comment-body-input"
                className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1.5"
              >
                Seu Comentário *
              </label>
              <textarea
                id="comment-body-input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Compartilhe sua análise, dúvida ou complemento sobre este artigo..."
                rows={4}
                maxLength={1500}
                className="w-full bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-300 dark:border-[#1B3358] rounded-sm p-3.5 text-sm text-[#081224] dark:text-[#F4F0E6] focus:outline-none focus:border-[#D97706] dark:focus:border-[#F5B731] transition-colors resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] px-5 py-2.5 rounded-sm text-xs font-display font-extrabold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Publicando...' : 'Publicar Comentário'}</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
