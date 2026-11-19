import { useState, useEffect } from 'react';
import {
  Mail,
  LogIn,
  CheckCircle2,
  BellRing,
  Sparkles,
} from 'lucide-react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  db,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { EDITORIAL_PILLARS } from '../utils/blogLogic';

export default function NewsletterBox() {
  const { user, authReady, authError, signInWithGoogle } = useFirebaseAuth();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferredPillar, setPreferredPillar] = useState<string>('all');
  const [loadingSub, setLoadingSub] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Check if current authenticated Google user already has an active email subscription
  useEffect(() => {
    if (!authReady || !user) {
      setIsSubscribed(false);
      return;
    }

    let cancelled = false;
    const subRef = doc(db, 'newsletter_subscriptions', user.uid);
    getDoc(subRef)
      .then((snap) => {
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data();
          setIsSubscribed(Boolean(data.notifyNewArticles));
          if (typeof data.preferredPillar === 'string') {
            setPreferredPillar(data.preferredPillar);
          }
        } else {
          setIsSubscribed(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          handleFirestoreError(
            error,
            OperationType.GET,
            `newsletter_subscriptions/${user.uid}`
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, authReady]);

  const subscribeOrUpdateUser = async (
    targetUser: NonNullable<typeof user>,
    nextNotify: boolean,
    nextPillar: string
  ) => {
    if (!targetUser.email) return;

    setLoadingSub(true);
    setStatusMessage(null);
    const subPath = `newsletter_subscriptions/${targetUser.uid}`;
    const subRef = doc(db, 'newsletter_subscriptions', targetUser.uid);

    const safeName = (
      targetUser.displayName ||
      targetUser.email.split('@')[0] ||
      'Leitor Achar Temas'
    )
      .trim()
      .slice(0, 100);
    const safeEmail = targetUser.email.trim().slice(0, 160);
    const safePillar = (nextPillar || 'all').slice(0, 64);

    try {
      const existingSnap = await getDoc(subRef);
      if (!existingSnap.exists()) {
        await setDoc(subRef, {
          userUid: targetUser.uid,
          email: safeEmail,
          displayName: safeName || 'Leitor',
          notifyNewArticles: nextNotify,
          preferredPillar: safePillar,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(subRef, {
          displayName: safeName || 'Leitor',
          notifyNewArticles: nextNotify,
          preferredPillar: safePillar,
          updatedAt: serverTimestamp(),
        });
      }
      setIsSubscribed(nextNotify);
      setStatusMessage(
        nextNotify
          ? `Pronto! Novos artigos serão enviados diretamente para ${safeEmail}.`
          : 'Notificações por e-mail pausadas.'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, subPath);
    } finally {
      setLoadingSub(false);
    }
  };

  const handleOneClickGoogleSubscribe = async () => {
    setStatusMessage(null);
    if (!user) {
      const signedInUser = await signInWithGoogle();
      if (signedInUser) {
        await subscribeOrUpdateUser(signedInUser, true, preferredPillar);
      }
      return;
    }
    await subscribeOrUpdateUser(user, true, preferredPillar);
  };

  return (
    <aside className="lg:col-span-4 bg-white dark:bg-[#081224] text-[#081224] dark:text-[#F4F0E6] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-6 shadow-sm md:shadow-xl transition-colors">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] mb-2">
        <Mail size={14} />
        <span>Novos Artigos Direto no E-mail</span>
      </div>
      <h3 className="font-display font-black text-xl sm:text-2xl uppercase text-[#081224] dark:text-white mb-2 leading-tight">
        Receba Cada Novo Artigo no Seu E-mail
      </h3>
      <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed mb-5">
        Conecte sua conta Google em 1 clique para receber gratuitamente nossos novos ensaios de
        história, ciência, biodiversidade e cultura assim que forem publicados.
      </p>

      <div className="mb-4">
        <label
          htmlFor="newsletter-pillar-select"
          className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 dark:text-slate-300 mb-1.5"
        >
          Tema de preferência:
        </label>
        <select
          id="newsletter-pillar-select"
          value={preferredPillar}
          onChange={(e) => {
            const val = e.target.value;
            setPreferredPillar(val);
            if (user && isSubscribed) {
              subscribeOrUpdateUser(user, true, val);
            }
          }}
          className="w-full min-h-[42px] bg-[#F4F1E8] dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3 py-2 text-xs text-[#081224] dark:text-white focus:outline-none focus:border-[#D97706] dark:focus:border-[#F5B731] cursor-pointer"
        >
          <option value="all">Todas as Editorias (Recomendado)</option>
          {EDITORIAL_PILLARS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.shortTitle}
            </option>
          ))}
        </select>
      </div>

      {!user ? (
        <div>
          {authError && (
            <p className="text-xs text-red-400 mb-3">{authError}</p>
          )}
          <button
            type="button"
            onClick={handleOneClickGoogleSubscribe}
            disabled={loadingSub}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl md:rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] text-xs font-display font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn size={15} />
            <span>Entrar com Google e Receber Artigos</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-xl md:rounded-sm bg-[#0D1E3A] border border-[#1B3358] text-xs">
            <div className="text-slate-400">E-mail vinculado:</div>
            <div className="font-mono text-[#F5B731] truncate font-medium mt-0.5">
              {user.email}
            </div>
          </div>

          {isSubscribed ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <BellRing size={14} />
                <span>Inscrição ativa para novos artigos</span>
              </div>
              <button
                type="button"
                disabled={loadingSub}
                onClick={() => subscribeOrUpdateUser(user, false, preferredPillar)}
                className="w-full py-2 px-3 rounded-xl md:rounded-sm border border-[#1B3358] hover:border-slate-500 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer"
              >
                {loadingSub ? 'Atualizando...' : 'Pausar recebimento por e-mail'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={loadingSub}
              onClick={handleOneClickGoogleSubscribe}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl md:rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] text-xs font-display font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles size={15} />
              <span>
                {loadingSub ? 'Ativando...' : 'Ativar Envio de Novos Artigos'}
              </span>
            </button>
          )}
        </div>
      )}

      {statusMessage && (
        <p className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>{statusMessage}</span>
        </p>
      )}
    </aside>
  );
}
