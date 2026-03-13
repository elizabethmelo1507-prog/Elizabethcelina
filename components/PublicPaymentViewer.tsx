import React, { useState, useEffect } from 'react';
import { CheckCircle, ShieldCheck, Lock, Loader2, Sparkles } from 'lucide-react';

interface PaymentData {
    client: string;
    description: string;
    amount: string;
    contractId?: string | number;
    clientPhone?: string;
    invoiceId?: number;
}

interface PublicPaymentViewerProps {
    data: PaymentData;
}

type PayStep = 'choose' | 'pix' | 'card' | 'done';

// ── Pill ────────────────────────────────────────────
const Pill = ({ children, color = 'lime' }: { children: React.ReactNode; color?: 'lime' | 'white' }) => (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border
        ${color === 'lime'
            ? 'bg-brand-lime/12 text-brand-lime border-brand-lime/25'
            : 'bg-white/8 text-white/60 border-white/15'}`}>
        {children}
    </span>
);

export function PublicPaymentViewer({ data }: PublicPaymentViewerProps) {
    const [step, setStep] = useState<PayStep>('choose');
    const [pixCopied, setPixCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    const pixKey = '042.122.602-12';
    const whatsapp = '5592982031507'; // Elizabeth Celina

    const handleCopyPix = () => {
        navigator.clipboard.writeText(pixKey).catch(() => { });
        setPixCopied(true);
        setTimeout(() => setPixCopied(false), 2500);
    };

    const savePendingSecondHalf = () => {
        try {
            const now = new Date();
            const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
            const inv = {
                id: data.invoiceId || Date.now(),
                client: data.client,
                description: data.description,
                amount: data.amount,
                dueDate: dateStr,
                status: 'Aguardando',
                type: 'Pontual',
                contractId: data.contractId,
                source: 'contract',
                isSplitPayment: false,
            };
            const existing: object[] = JSON.parse(localStorage.getItem('ec_pending_invoices') || '[]');
            // Avoid duplicating if same invoiceId already exists
            const filtered = existing.filter((e: any) => e.id !== inv.id);
            localStorage.setItem('ec_pending_invoices', JSON.stringify([inv, ...filtered]));
        } catch { /* ignore */ }
    };

    const buildWaUrl = (method: 'pix' | 'card') => {
        const phone = whatsapp;
        const msg = method === 'pix'
            ? encodeURIComponent(
                `Olá, Elizabeth! Realizei o pagamento via PIX da 2ª parcela referente a "${data.description}" no valor de R$ ${data.amount}. Segue o comprovante em anexo! 🧾`
            )
            : encodeURIComponent(
                `Olá, Elizabeth! Escolhi pagar a 2ª parcela de "${data.description}" (R$ ${data.amount}) via cartão de crédito. Pode me enviar o link? 😊`
            );
        return `https://wa.me/${phone}?text=${msg}`;
    };

    const handleConfirm = (method: 'pix' | 'card') => {
        savePendingSecondHalf();
        const url = buildWaUrl(method);
        window.open(url, '_blank');
        setTimeout(() => setStep('done'), 800);
    };

    const firstName = data.client.split(' ')[0];

    return (
        <div className="min-h-screen bg-brand-blue text-white overflow-x-hidden font-sans">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(204,255,0,.10),transparent)]" />
                <div className="absolute top-[-120px] right-[-80px] w-[420px] h-[420px] rounded-full bg-brand-lime/[0.04] blur-3xl" />
                <div className="absolute bottom-[-80px] left-[-60px] w-[300px] h-[300px] rounded-full bg-purple-500/[0.05] blur-3xl" />
            </div>

            {/* Header bar */}
            <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/8">
                <span className="font-black text-xl tracking-tight">E.Celina</span>
                <div className="flex items-center gap-2 text-xs text-white/40">
                    <Lock size={11} className="text-brand-lime" />
                    Pagamento Seguro
                </div>
            </header>

            <div
                className="relative z-10 max-w-lg mx-auto px-6 py-16 text-center"
                style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)', transition: 'all .6s ease .1s' }}
            >
                {/* ── CHOOSE ── */}
                {step === 'choose' && (
                    <div>
                        <div className="w-20 h-20 rounded-full bg-brand-lime/15 border-2 border-brand-lime/40 mx-auto mb-7 flex items-center justify-center shadow-[0_0_50px_rgba(204,255,0,.2)]">
                            <Sparkles size={34} className="text-brand-lime" />
                        </div>
                        <Pill><ShieldCheck size={9} /> 2ª Parcela · Pagamento Seguro</Pill>
                        <h1 className="text-3xl md:text-5xl font-black mt-5 mb-3 leading-tight">
                            Olá, <span className="text-brand-lime">{firstName}!</span>
                        </h1>
                        <p className="text-white/50 text-sm mb-2 max-w-sm mx-auto leading-relaxed">
                            {data.description}
                        </p>
                        <p className="text-white/80 font-black text-2xl mb-8">
                            R$ <span className="text-brand-lime">{data.amount}</span>
                        </p>

                        <p className="text-white/40 text-xs mb-5 uppercase tracking-widest font-bold">Escolha o método de pagamento</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setStep('pix')}
                                className="p-6 rounded-2xl border-2 border-white/15 bg-white/5 hover:border-[#32BCAD]/60 hover:bg-[#32BCAD]/8 transition-all duration-300 hover:-translate-y-1 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-[#32BCAD]/15 border border-[#32BCAD]/30 mx-auto mb-4 flex items-center justify-center text-2xl">📱</div>
                                <p className="font-black text-white text-base mb-1">PIX</p>
                                <p className="text-xs text-white/40">Instantâneo · Aprovação imediata</p>
                                <span className="mt-3 inline-block text-[9px] font-black uppercase tracking-widest text-[#32BCAD] border border-[#32BCAD]/30 bg-[#32BCAD]/10 px-2.5 py-1 rounded-full">Recomendado</span>
                            </button>
                            <button
                                onClick={() => setStep('card')}
                                className="p-6 rounded-2xl border-2 border-white/15 bg-white/5 hover:border-purple-500/60 hover:bg-purple-500/8 transition-all duration-300 hover:-translate-y-1 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 mx-auto mb-4 flex items-center justify-center text-2xl">💳</div>
                                <p className="font-black text-white text-base mb-1">Cartão de Crédito</p>
                                <p className="text-xs text-white/40">Parcelamento disponível</p>
                                <span className="mt-3 inline-block text-[9px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 rounded-full">Até 3x</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── PIX ── */}
                {step === 'pix' && (
                    <div>
                        <div className="w-20 h-20 rounded-2xl bg-[#32BCAD]/15 border border-[#32BCAD]/30 mx-auto mb-7 flex items-center justify-center text-4xl">📱</div>
                        <Pill>PIX · Pagamento Instantâneo</Pill>
                        <h2 className="text-3xl md:text-5xl font-black mt-5 mb-2">Transfira via <span className="text-[#32BCAD]">PIX</span></h2>
                        <p className="text-white/50 text-sm mb-6">
                            Valor: <strong className="text-white text-lg">R$ {data.amount}</strong>
                            <span className="text-white/30 text-sm"> · 2ª parcela</span>
                        </p>

                        {/* PIX Card */}
                        <div className="max-w-sm mx-auto mb-5 p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-left">
                            <div className="flex justify-center mb-5">
                                <div className="p-2 bg-white rounded-2xl shadow-[0_0_30px_rgba(204,255,0,.2)]">
                                    <img src="/pix-qrcode.jpg" alt="QR Code PIX Elizabeth Celina" className="w-44 h-44 object-contain rounded-xl" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 text-center">Ou copie a Chave PIX (CPF)</p>
                            <div className="flex items-center gap-3 mb-4">
                                <code className="flex-1 text-sm text-brand-lime font-mono bg-brand-lime/8 px-3 py-2 rounded-xl border border-brand-lime/20 break-all text-center">
                                    {pixKey}
                                </code>
                                <button
                                    onClick={handleCopyPix}
                                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-black transition-all duration-300 border
                                        ${pixCopied ? 'bg-brand-lime text-brand-blue border-brand-lime' : 'border-white/15 text-white/60 hover:border-white/30'}`}>
                                    {pixCopied ? '✓ Copiado!' : 'Copiar'}
                                </button>
                            </div>
                            <div className="space-y-1.5 text-xs text-white/40 border-t border-white/8 pt-4">
                                <p>👤 <span className="text-white/60">Favorecida:</span> Elizabeth Celina G. V. M. Melo</p>
                                <p>🏦 <span className="text-white/60">Banco:</span> Nubank</p>
                                <p>📋 <span className="text-white/60">Referente:</span> {data.description}</p>
                            </div>
                        </div>

                        {/* WA hint */}
                        <div className="max-w-sm mx-auto mb-6 p-4 rounded-2xl bg-[#25D366]/8 border border-[#25D366]/25 text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 shrink-0 rounded-lg bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center text-base">💬</div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#25D366] opacity-80 mb-1">Mensagem pronta</p>
                                    <p className="text-xs text-white/50 leading-relaxed italic">
                                        "Realizei o pagamento via PIX referente a <strong className="text-white not-italic">"{data.description}"</strong>... Segue o comprovante! 🧾"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button onClick={() => setStep('choose')} className="px-6 py-3 rounded-full border border-white/15 text-white/60 hover:border-white/30 text-sm font-bold transition-all">← Voltar</button>
                            <a
                                href={buildWaUrl('pix')}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => { savePendingSecondHalf(); setTimeout(() => setStep('done'), 800); }}
                                className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white font-black px-8 py-3.5 rounded-full hover:bg-[#20bc5a] transition-all duration-300 shadow-[0_0_40px_rgba(37,211,102,.35)] hover:-translate-y-0.5 text-sm">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Confirmar pagamento via PIX
                            </a>
                        </div>
                    </div>
                )}

                {/* ── CARD ── */}
                {step === 'card' && (
                    <div>
                        <div className="w-20 h-20 rounded-2xl bg-purple-500/15 border border-purple-500/30 mx-auto mb-7 flex items-center justify-center text-4xl">💳</div>
                        <Pill>Cartão de Crédito · Até 3x</Pill>
                        <h2 className="text-3xl md:text-5xl font-black mt-5 mb-3 leading-tight">
                            Link enviado pelo <span className="text-[#25D366]">WhatsApp</span>
                        </h2>
                        <p className="text-white/50 text-sm mb-3 max-w-md mx-auto leading-relaxed">
                            O link de pagamento via cartão é gerado e enviado pelo WhatsApp.
                            Clique no botão abaixo e enviarei o link seguro em instantes! 🚀
                        </p>
                        <p className="text-white/35 text-xs mb-8">
                            Valor: <strong className="text-white">R$ {data.amount}</strong>
                            <span className="text-white/30"> · 2ª parcela</span>
                        </p>

                        {/* WA hint */}
                        <div className="max-w-sm mx-auto mb-8 p-5 rounded-2xl bg-[#25D366]/8 border border-[#25D366]/25 text-left">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center text-xl">💬</div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#25D366] opacity-80">Mensagem pronta</p>
                                    <p className="text-xs text-white/60 font-bold">Será enviada automaticamente</p>
                                </div>
                            </div>
                            <div className="bg-white/[0.05] rounded-xl p-3 border border-white/8">
                                <p className="text-xs text-white/55 leading-relaxed italic">
                                    "Olá, Elizabeth! Escolhi pagar a 2ª parcela de <strong className="text-white not-italic">"{data.description}"</strong> via cartão. Pode me enviar o link? 😊"
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button onClick={() => setStep('choose')} className="px-6 py-3 rounded-full border border-white/15 text-white/60 hover:border-white/30 text-sm font-bold transition-all">← Voltar</button>
                            <a
                                href={buildWaUrl('card')}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => { savePendingSecondHalf(); setTimeout(() => setStep('done'), 800); }}
                                className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white font-black px-8 py-3.5 rounded-full hover:bg-[#20bc5a] transition-all duration-300 shadow-[0_0_40px_rgba(37,211,102,.35)] hover:-translate-y-0.5 text-sm">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Pedir link pelo WhatsApp
                            </a>
                        </div>
                    </div>
                )}

                {/* ── DONE ── */}
                {step === 'done' && (
                    <div>
                        <div className="w-24 h-24 rounded-full bg-brand-lime/20 border-2 border-brand-lime mx-auto mb-8 flex items-center justify-center shadow-[0_0_60px_rgba(204,255,0,.35)]">
                            <CheckCircle size={46} className="text-brand-lime" strokeWidth={1.5} />
                        </div>
                        <Pill color="lime"><CheckCircle size={9} /> Tudo certo!</Pill>
                        <h2 className="text-4xl md:text-6xl font-black mt-6 mb-4">Pagamento <br />Confirmado! 🎉</h2>
                        <p className="text-white/55 text-lg max-w-sm mx-auto">
                            Obrigada, <strong className="text-brand-lime">{firstName}</strong>!<br />
                            Recebi sua confirmação e o pagamento será verificado em breve. Fique de olho no WhatsApp! 🚀
                        </p>
                        <p className="text-white/25 text-xs mt-6">
                            {data.description} · R$ {data.amount}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center pb-10">
                <p className="text-[10px] text-white/20 flex items-center justify-center gap-1.5">
                    <Lock size={9} /> Página protegida · E.Celina Soluções Digitais
                </p>
            </div>
        </div>
    );
}
