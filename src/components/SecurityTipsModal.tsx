import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, ShieldCheck, X, CheckCircle2, AlertTriangle, 
  Smartphone, UserCheck, DollarSign, Lock, HelpCircle
} from 'lucide-react';

interface SecurityTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecurityTipsModal({ isOpen, onClose }: SecurityTipsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-[#161616] border border-white/10 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/5 flex items-start justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#161616]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 font-mono">
                  Guia Antifraude & Segurança PIX
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Dicas de Segurança para Validação
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto font-sans">
            <p className="text-xs text-slate-300 leading-relaxed">
              Como o <strong className="text-white">Direct Cash Pix</strong> opera via transferências P2P diretas entre os participantes, <strong className="text-amber-400">você é o único responsável</strong> por verificar o seu extrato bancário antes de confirmar o recebimento e liberar o nível de um doador.
            </p>

            {/* Step 1 */}
            <div className="bg-[#121212] p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#00FF85] border border-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone size={16} className="text-[#00FF85]" />
                  Confira Sempre o Extrato do Seu Banco
                </h4>
              </div>
              <p className="text-xs text-slate-400 pl-9 leading-relaxed">
                <strong className="text-slate-200">Nunca confie apenas em prints ou PDFs</strong> do comprovante anexado. Abra o aplicativo do seu banco (Itaú, Bradesco, Nubank, Inter, etc.) e confirme se o valor real de R$ 10,00 foi creditado em seu saldo.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#121212] p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#00FF85] border border-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck size={16} className="text-[#00FF85]" />
                  Valide o Nome do Pagador
                </h4>
              </div>
              <p className="text-xs text-slate-400 pl-9 leading-relaxed">
                Verifique se o nome completo do remetente que aparece na notificação/extrato bancário corresponde ao nome cadastrado do doador no seu painel. Em caso de divergência acentuada, questione o participante.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#121212] p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#00FF85] border border-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  Cuidado com "PIX Agendado" ou Falsificado
                </h4>
              </div>
              <p className="text-xs text-slate-400 pl-9 leading-relaxed">
                Atenção para comprovantes com a palavra <strong className="text-amber-300 font-mono">"AGENDAMENTO"</strong>. O agendamento pode ser cancelado antes da efetivação. Somente aprove após a transação estar <strong className="text-white">CONCLUÍDA / EFETIVADA</strong> no seu extrato.
              </p>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs space-y-1 text-amber-200">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <Lock size={15} />
                Lembre-se: Aprovação é Irreversível no Sistema
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Uma vez que você clica em "Confirmar / Aprovar" no painel, o nível do membro é liberado na matriz de doação. Por isso, mantenha essa rotina de segurança rigorosa em cada validação!
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-white/5 bg-[#121212] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#00FF85] hover:bg-[#00cc6a] text-[#121212] text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,255,133,0.2)] flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} />
              <span>Entendido, Mantenho minha Conta Segura</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
