import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronRight, ChevronLeft, ShieldCheck, Zap, Users, 
  ArrowRightLeft, CheckCircle2, QrCode, Share2, HelpCircle, Sparkles, Layers
} from 'lucide-react';

interface QuickGuideOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export default function QuickGuideOverlay({ isOpen, onClose, userName }: QuickGuideOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'welcome',
      title: `Bem-vindo(a), ${userName || 'Membro'}!`,
      subtitle: 'Entenda como funciona a sua Rede de Doações Diretas P2P em menos de 1 minuto.',
      icon: Sparkles,
      color: 'text-[#00FF85]',
      bgColor: 'bg-[#00FF85]/10',
      borderColor: 'border-[#00FF85]/30',
      badge: 'Visão Geral do Sistema',
      content: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed font-sans">
          <p>
            O <strong className="text-white">Direct Cash Pix</strong> é uma plataforma de <strong className="text-[#00FF85]">roteamento automatizado de ajuda mútua</strong> que conecta pessoas que doam diretamente entre si.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-[#121212] p-3.5 rounded-xl border border-white/5 flex items-start gap-3">
              <ShieldCheck className="text-[#00FF85] shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="text-white text-xs block">100% P2P Sem Intermediários</strong>
                <span className="text-slate-400 text-xs">As doações vão de conta bancária para conta bancária via PIX.</span>
              </div>
            </div>
            <div className="bg-[#121212] p-3.5 rounded-xl border border-white/5 flex items-start gap-3">
              <Zap className="text-[#00FF85] shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="text-white text-xs block">Sem Custódia ou Taxas</strong>
                <span className="text-slate-400 text-xs">O site não retém seu dinheiro e não cobra mensalidades.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'network',
      title: 'A Matriz de 5 Níveis de Doação',
      subtitle: 'Como o algoritmo mapeia os repasses de R$ 10,00 entre os membros.',
      icon: Layers,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      badge: 'Engenharia da Rede',
      content: (
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed font-sans">
          <p>
            Na sua ativação, você realizou doações de R$ 10,00 para 5 membros da sua linha ascendente. Agora, seu link está ativo para receber!
          </p>
          <div className="bg-[#121212] p-3.5 rounded-xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs pb-1 border-b border-white/5">
              <span className="text-slate-400 font-bold">1º Nível (Seus Indicados):</span>
              <span className="text-[#00FF85] font-mono font-bold">Recebe R$ 10 por cada um</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-1 border-b border-white/5">
              <span className="text-slate-400 font-bold">2º ao 5º Nível (Indiretos):</span>
              <span className="text-[#00FF85] font-mono font-bold">Recebe R$ 10 em escala</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              💡 <strong>Compressão Dinâmica:</strong> Se algum membro da linha ficar inativo, o sistema pula o nó e redireciona o repasse para quem está ativo!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'verification',
      title: 'Como Confirmar Doações Recebidas',
      subtitle: 'Seu papel na validação de comprovantes dos membros da sua rede.',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      badge: 'Gestão de Pagamentos',
      content: (
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed font-sans">
          <p>
            Sempre que um novo doador realizar um PIX para você, ele enviará o comprovante pelo painel do sistema:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300">
            <li>Acesse a aba <strong className="text-white font-mono">"Recebidos"</strong> no seu Dashboard.</li>
            <li>Abra o extrato do seu aplicativo bancário e verifique se o PIX de <strong>R$ 10,00</strong> caiu na sua conta.</li>
            <li>Clique em <strong className="text-[#00FF85]">"Aprovar / Confirmar"</strong> para liberar o nível do doador.</li>
          </ol>
          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[11px] text-amber-300">
            ⚠️ <strong>Importante:</strong> Só confirme a doação após checar a entrada real do dinheiro no seu extrato bancário.
          </div>
        </div>
      )
    },
    {
      id: 'growth',
      title: 'Compartilhe e Expanda sua Rede',
      subtitle: 'Ferramentas prontas para você divulgar seu link de convite.',
      icon: Share2,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      badge: 'Divulgação Inteligente',
      content: (
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed font-sans">
          <p>
            Seu link pessoal de convite é a sua principal ferramenta de expansão. Você tem à disposição:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-[#121212] p-3 rounded-xl border border-white/5 flex items-center gap-2.5">
              <Share2 size={16} className="text-[#00FF85]" />
              <span className="text-xs font-bold text-white">Kit de Compartilhamento WhatsApp</span>
            </div>
            <div className="bg-[#121212] p-3 rounded-xl border border-white/5 flex items-center gap-2.5">
              <QrCode size={16} className="text-[#00FF85]" />
              <span className="text-xs font-bold text-white">QR Code Exclusivo do seu Link</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Acesse o botão <strong className="text-white">"Kit WhatsApp"</strong> no topo do seu painel para enviar mensagens pré-formatadas para seus contatos!
          </p>
        </div>
      )
    }
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem('direct_cash_quick_guide_seen', 'true');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-[#161616] border border-white/10 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/5 flex items-start justify-between relative bg-gradient-to-r from-slate-900 to-[#161616]">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${current.bgColor} ${current.borderColor} border flex items-center justify-center ${current.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FF85] font-mono">
                  {current.badge} • Passo {currentStep + 1} de {steps.length}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {current.title}
                </h3>
              </div>
            </div>
            <button
              onClick={handleComplete}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Fechar Guia"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/50 h-1">
            <motion.div
              className="bg-[#00FF85] h-[#00FF85] h-full"
              initial={{ width: `${(currentStep / steps.length) * 100}%` }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <p className="text-xs text-slate-400 font-medium">
              {current.subtitle}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {current.content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-5 border-t border-white/5 bg-[#121212] flex flex-col sm:flex-row items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-[#00FF85] focus:ring-[#00FF85] h-3.5 w-3.5"
              />
              <span>Não exibir novamente no login</span>
            </label>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-[#00FF85] hover:bg-[#00cc6a] text-[#121212] text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,255,133,0.2)] flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentStep === steps.length - 1 ? 'Concluir e Começar' : 'Próximo'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
