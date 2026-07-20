import React, { useState, useMemo } from 'react';
import { User, Receiver, PixType } from '../types';
import { CheckCircle, Upload, ArrowRight, ShieldCheck, QrCode, AlertCircle, Loader2, Copy, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { createStaticPix } from 'pix-utils';
import { generateSimulatedReceiptSvg } from '../lib/receipt';

interface OnboardingProps {
  onComplete: (user: User) => void;
  initialUser?: User | null;
}

const mockReceivers: Receiver[] = [
  { level: 1, name: 'Patrocinador Direto', pixKey: '11999999999', status: 'pending' },
  { level: 2, name: 'Maria Silva', pixKey: 'maria@email.com', status: 'pending' },
  { level: 3, name: 'Carlos Santos', pixKey: '123.456.789-00', status: 'pending' },
  { level: 4, name: 'Ana Oliveira', pixKey: 'ana@pix.com.br', status: 'pending' },
  { level: 5, name: 'Roberto Alves', pixKey: 'roberto@email.com', status: 'pending' },
];

export default function Onboarding({ onComplete, initialUser }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2>(initialUser ? 2 : 1);
  const [formData, setFormData] = useState({ name: '', pixKey: '', pixType: 'cpf' as PixType, uid: '' });
  const [receivers, setReceivers] = useState<Receiver[]>(mockReceivers);
  const [isActivating, setIsActivating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const getFriendlyAuthErrorMessage = (error: any): string => {
    if (!error) return "Erro desconhecido.";
    const code = error.code || (error.message && error.message.includes('popup-closed-by-user') ? 'auth/popup-closed-by-user' : '');
    
    switch (code) {
      case 'auth/popup-closed-by-user':
        return "A janela de login do Google foi fechada antes de concluir a autenticação. Por favor, clique novamente e mantenha a janela aberta até concluir.";
      case 'auth/cancelled-popup-request':
        return "O processo de login foi cancelado por outra tentativa. Por favor, tente novamente.";
      case 'auth/popup-blocked':
        return "O popup de login do Google foi bloqueado pelo seu navegador. Por favor, desative o bloqueador de popups para este site e tente novamente.";
      case 'auth/network-request-failed':
        return "Erro de conexão com o servidor. Verifique sua internet e tente novamente.";
      case 'auth/internal-error':
        return "Ocorreu um erro interno de autenticação. Por favor, tente novamente mais tarde.";
      default:
        return error.message || String(error);
    }
  };

  const handleLoginOnly = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const uid = userCredential.user.uid;
      
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data() as User;
        if (userData.isActive) {
          onComplete({ ...userData, uid });
        } else {
          setFormData({
            name: userData.name,
            pixKey: userData.pixKey,
            pixType: userData.pixType,
            uid: uid
          });
          setStep(2);
        }
      } else {
        await auth.signOut();
        setErrorMsg("Esta conta Google não está cadastrada no sistema. Por favor, preencha seus dados abaixo para criar sua conta.");
      }
    } catch (error: any) {
      console.error("Error logging in:", error);
      setErrorMsg(`Erro de autenticação: ${getFriendlyAuthErrorMessage(error)}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pixKey) return;
    
    setIsRegistering(true);
    setErrorMsg(null);
    try {
      if (!initialUser) {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const uid = userCredential.user.uid;
        
        // Check if user already exists
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          if (userData.isActive) {
            onComplete({ ...userData, uid });
            return;
          } else {
            setFormData({
              name: userData.name,
              pixKey: userData.pixKey,
              pixType: userData.pixType,
              uid: uid
            });
            setStep(2);
            return;
          }
        }

        const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const newUser: User = {
          name: formData.name,
          pixKey: formData.pixKey,
          pixType: formData.pixType,
          uid,
          isActive: false,
          inviteCode,
          createdAt: serverTimestamp(),
        };
        
        await setDoc(docRef, newUser);
        setFormData(prev => ({ ...prev, uid }));
      }
      setStep(2);
    } catch (error: any) {
      console.error("Error creating user:", error);
      setErrorMsg(`Erro de autenticação: ${getFriendlyAuthErrorMessage(error)}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const [expandedReceiver, setExpandedReceiver] = useState<number | null>(1);
  const [expandedQR, setExpandedQR] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (pixKey: string) => {
    navigator.clipboard.writeText(pixKey);
    setCopiedKey(pixKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const uploadReceipt = async (level: number) => {
    // Simulate upload delay
    setReceivers(prev => prev.map(r => r.level === level ? { ...r, status: 'uploading' } : r));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setReceivers(prev => prev.map(r => r.level === level ? { ...r, status: 'verified' } : r));
    
    // Auto-expand next pending receiver
    const nextPending = receivers.find(r => r.level > level && r.status === 'pending');
    if (nextPending) {
      setExpandedReceiver(nextPending.level);
    } else {
      setExpandedReceiver(null);
    }
  };

  const allVerified = receivers.every(r => r.status === 'verified');

  const finishActivation = async () => {
    if (!allVerified) return;
    
    setIsActivating(true);
    setErrorMsg(null);
    
    try {
      // Use auth.currentUser.uid as the source of truth if available
      const uid = auth.currentUser?.uid || initialUser?.uid || formData.uid;
      const currentUser = initialUser || formData;

      if (!uid) {
         throw new Error("Usuário não identificado. Recarregue a página e tente novamente.");
      }

      // Record payments in firestore with dynamic SVG receipts
      const dateStr = new Date().toLocaleString('pt-BR');
      for (let i = 0; i < receivers.length; i++) {
        const receiver = receivers[i];
        const receiptSvg = generateSimulatedReceiptSvg(
          currentUser.name || 'Membro Cadastrado',
          receiver.name,
          10,
          dateStr
        );

        await addDoc(collection(db, 'payments'), {
          senderId: uid,
          senderName: currentUser.name || 'Membro Cadastrado',
          senderPixKey: currentUser.pixKey || '',
          receiverId: receiver.pixKey,
          receiverName: receiver.name,
          receiverPixKey: receiver.pixKey,
          receiptImage: receiptSvg,
          amount: 10,
          level: receiver.level,
          status: 'verified',
          createdAt: serverTimestamp()
        });
      }

      // Mark user as active
      const activatedUser = { ...currentUser, isActive: true } as User;
      await setDoc(doc(db, 'users', uid), { isActive: true }, { merge: true });
      
      onComplete(activatedUser);
    } catch (error: any) {
      console.error("Error activating user:", error);
      setErrorMsg(`Erro de ativação: ${error.message || error}`);
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_top_right,_#1e293b_0%,_#020617_40%)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/src/assets/images/direct_cash_pix_logo_1784486102011.jpg" alt="Direct Cash Pix Logo" className="w-52 h-auto rounded-3xl object-cover mb-4 shadow-[0_0_30px_rgba(50,188,173,0.3)]" style={{ height: '70.438px' }} referrerPolicy="no-referrer" />
        </div>

        {step === 1 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
              <ShieldCheck className="text-[#32BCAD]" /> Cadastro Seguro
            </h2>
            <form onSubmit={handleRegister} className="space-y-4 relative z-10">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome Completo</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#32BCAD] transition-colors text-white" placeholder="Seu nome" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tipo de Chave</label>
                  <select value={formData.pixType} onChange={e => setFormData({ ...formData, pixType: e.target.value as PixType })} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#32BCAD] transition-colors text-white appearance-none">
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="telefone">Telefone</option>
                    <option value="aleatoria">Aleatória</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Chave PIX</label>
                  <input required type="text" value={formData.pixKey} onChange={e => setFormData({ ...formData, pixKey: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#32BCAD] transition-colors text-white" placeholder="Sua chave" />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={isRegistering || isLoggingIn} className="w-full bg-[#32BCAD] hover:bg-[#269689] disabled:bg-slate-850 disabled:text-slate-500 text-slate-900 font-bold tracking-widest uppercase text-xs rounded-xl px-4 py-4 mt-6 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(50,188,173,0.3)]">
                {isRegistering ? (
                  <><Loader2 size={16} className="animate-spin" /> Cadastrando...</>
                ) : (
                  <>Continuar para Ativação <ArrowRight size={16} /></>
                )}
              </button>

              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <span className="relative px-3 bg-slate-950 text-slate-500 text-xs uppercase tracking-wider">ou acessar conta</span>
              </div>

              <button 
                type="button"
                onClick={handleLoginOnly}
                disabled={isRegistering || isLoggingIn}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:bg-slate-850 disabled:text-slate-500 text-white font-bold tracking-widest uppercase text-xs rounded-xl px-4 py-4 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoggingIn ? (
                  <><Loader2 size={16} className="animate-spin" /> Acessando...</>
                ) : (
                  <>Entrar com Google</>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/60 border border-[#32BCAD]/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32BCAD] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#32BCAD]"></span>
              </span>
            </div>
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-white">
              Ativação de Conta
            </h2>
            <p className="text-slate-400 text-sm mb-6">Transfira R$ 10,00 para cada membro acima e anexe os comprovantes para liberar seu link de convite.</p>
            
            <div className="space-y-3 mb-6 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {receivers.map((r) => {
                const isExpanded = expandedReceiver === r.level;
                const isVerified = r.status === 'verified';
                const isUploading = r.status === 'uploading';
                
                return (
                  <div key={r.level} className={`flex flex-col p-3 rounded-xl border transition-all ${isVerified ? 'bg-[#32BCAD]/10 border-[#32BCAD]/30' : 'bg-slate-800/40 border-slate-700'}`}>
                    <div 
                      className="flex items-center justify-between cursor-pointer" 
                      onClick={() => !isVerified && setExpandedReceiver(isExpanded ? null : r.level)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          0{r.level}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-white">{r.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">{r.pixKey}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#32BCAD] text-sm">R$ 10</span>
                        {isVerified ? (
                          <CheckCircle size={18} className="text-[#32BCAD]" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 ${isExpanded ? 'border-[#32BCAD]' : 'border-slate-600'}`} />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && !isVerified && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-2 border-t border-slate-700/50 flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => copyToClipboard(r.pixKey)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors"
                              >
                                {copiedKey === r.pixKey ? <CheckCircle size={14} className="text-[#32BCAD]" /> : <Copy size={14} />} Copiar
                              </button>
                              <button 
                                onClick={() => setExpandedQR(expandedQR === r.level ? null : r.level)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors"
                              >
                                <QrCode size={14} /> QR Code
                              </button>
                            </div>

                            <AnimatePresence>
                              {expandedQR === r.level && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }} 
                                  animate={{ height: 'auto', opacity: 1 }} 
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden flex flex-col items-center justify-center py-4 bg-white rounded-lg"
                                >
                                  {(() => {
                                    const pixPayload = createStaticPix({ 
                                      pixKey: r.pixKey, 
                                      merchantName: r.name.substring(0, 25) || 'Receiver', 
                                      merchantCity: 'Brasil', 
                                      transactionAmount: 10, 
                                      infoAdicional: 'Doacao' 
                                    });
                                    // Use type assertion since we know we provided valid data (max 25 chars, valid city)
                                    // Or just check if toBRCode exists
                                    return 'toBRCode' in pixPayload ? (
                                      <QRCodeSVG value={pixPayload.toBRCode()} size={150} />
                                    ) : (
                                      <div className="text-red-500 text-xs text-center px-4">Erro ao gerar PIX QR Code. Use a chave acima para pagar.</div>
                                    );
                                  })()}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            
                            <button 
                              onClick={() => uploadReceipt(r.level)}
                              disabled={isUploading}
                              className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-bold text-xs rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                              {isUploading ? (
                                <><Loader2 size={14} className="animate-spin" /> Enviando...</>
                              ) : (
                                <><ImageIcon size={14} /> Anexar Comprovante</>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-xs font-medium relative z-10">
                {errorMsg}
              </div>
            )}

            <button onClick={finishActivation} disabled={isActivating || !allVerified} className={`w-full font-bold uppercase tracking-widest text-xs rounded-xl px-4 py-4 flex items-center justify-center gap-2 transition-all relative z-10 ${allVerified ? 'bg-[#32BCAD] hover:bg-[#269689] text-slate-900 cursor-pointer shadow-[0_0_15px_rgba(50,188,173,0.3)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
              {isActivating ? (
                <><Loader2 size={16} className="animate-spin" /> Verificando Pagamentos...</>
              ) : (
                <><CheckCircle size={16} /> Finalizar e Ativar Conta</>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
