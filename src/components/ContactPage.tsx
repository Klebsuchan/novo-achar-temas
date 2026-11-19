import { useState, FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Instagram,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';

interface ContactPageProps {
  onBackHome: () => void;
  onNavigatePrivacy: () => void;
}

export default function ContactPage({ onBackHome, onNavigatePrivacy }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSentSuccess(false);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      setErrorMsg('Informe seu nome (entre 2 e 100 caracteres).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 160) {
      setErrorMsg('Informe um endereço de e-mail válido.');
      return;
    }
    if (cleanSubject.length < 3 || cleanSubject.length > 140) {
      setErrorMsg('Informe o assunto da mensagem (entre 3 e 140 caracteres).');
      return;
    }
    if (cleanMessage.length < 10 || cleanMessage.length > 3000) {
      setErrorMsg('Escreva sua mensagem com pelo menos 10 caracteres (máx. 3.000).');
      return;
    }

    setSubmitting(true);
    const randomToken = Math.random().toString(36).slice(2, 8);
    const messageId = `msg_${Date.now()}_${randomToken}`;
    const docPath = `contact_messages/${messageId}`;

    try {
      await setDoc(doc(db, 'contact_messages', messageId), {
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setSentSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    } finally {
      setSubmitting(false);
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#081224] text-[#F4F0E6] border border-[#1B3358] rounded-2xl md:rounded-sm p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F5B731] mb-2">
              <MessageSquare size={14} />
              <span>Fale com a Redação</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black uppercase text-white tracking-tight mb-3">
              Contato Oficial
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Envie sugestões de temas, correções editoriais, dúvidas sobre artigos, convites de
              imprensa ou propostas comerciais diretamente para nossa equipe.
            </p>

            <div className="space-y-4 pt-4 border-t border-[#1B3358] text-xs">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[#F5B731] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    E-mail Editorial
                  </div>
                  <div className="font-mono text-white mt-0.5">contato@achartemas.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Instagram size={16} className="text-[#F5B731] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    Redes Sociais
                  </div>
                  <a
                    href="https://www.instagram.com/achar.temas?igsh=eTlqaGNwYnYydzB6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#F5B731] underline mt-0.5 inline-block"
                  >
                    @achar.temas no Instagram
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="text-[#38BDF8] shrink-0 mt-0.5" />
                <div className="text-slate-300 leading-relaxed">
                  Seus dados são protegidos nos termos da LGPD e usados exclusivamente para
                  responder sua mensagem.{' '}
                  <button
                    type="button"
                    onClick={onNavigatePrivacy}
                    className="text-[#F5B731] underline cursor-pointer"
                  >
                    Ler Política de Privacidade
                  </button>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-6 sm:p-8 shadow-xs md:shadow-none">
          <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-[#081224] dark:text-white mb-2">
            Enviar Mensagem
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 mb-6">
            Preencha os campos abaixo. Nossa equipe analisa todas as mensagens em até 2 dias úteis.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-bold uppercase tracking-wider text-[#081224] dark:text-slate-200 mb-1.5"
                >
                  Seu Nome
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Maria Oliveira"
                  className="w-full min-h-[44px] bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3.5 py-2.5 text-sm text-[#081224] dark:text-white focus:outline-none focus:border-[#D97706] dark:focus:border-[#F5B731]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-bold uppercase tracking-wider text-[#081224] dark:text-slate-200 mb-1.5"
                >
                  Seu E-mail
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  maxLength={160}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full min-h-[44px] bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3.5 py-2.5 text-sm text-[#081224] dark:text-white focus:outline-none focus:border-[#D97706] dark:focus:border-[#F5B731]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="block text-xs font-bold uppercase tracking-wider text-[#081224] dark:text-slate-200 mb-1.5"
              >
                Assunto
              </label>
              <input
                id="contact-subject"
                type="text"
                required
                minLength={3}
                maxLength={140}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Sugestão de pauta, correção, parceria..."
                className="w-full min-h-[44px] bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3.5 py-2.5 text-sm text-[#081224] dark:text-white focus:outline-none focus:border-[#D97706] dark:focus:border-[#F5B731]"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs font-bold uppercase tracking-wider text-[#081224] dark:text-slate-200 mb-1.5"
              >
                Mensagem
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                minLength={10}
                maxLength={3000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva sua mensagem para a Redação Achar Temas..."
                className="w-full bg-[#F4F1E8] dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3.5 py-2.5 text-sm text-[#081224] dark:text-white focus:outline-none focus:border-[#D97706] dark:focus:border-[#F5B731] resize-y"
              />
              <div className="text-[11px] font-mono text-stone-500 dark:text-slate-400 text-right mt-1">
                {message.length}/3000
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-red-700 dark:text-red-400">{errorMsg}</p>
            )}

            {sentSuccess && (
              <div className="p-3.5 rounded-xl md:rounded-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Mensagem enviada com sucesso! A Redação Achar Temas agradece o seu contato.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="min-h-[46px] inline-flex items-center justify-center gap-2 bg-[#F5B731] hover:bg-[#E09F1F] disabled:opacity-60 text-[#081224] px-6 py-3 rounded-xl md:rounded-sm text-xs font-display font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Send size={15} />
              <span>{submitting ? 'Enviando...' : 'Enviar Mensagem à Redação'}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
