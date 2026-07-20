import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle, X, DollarSign } from 'lucide-react';

interface NotificationProps {
  user: User;
}

interface PaymentNotification {
  id: string;
  amount: number;
  senderId: string;
}

export default function Notifications({ user }: NotificationProps) {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);

  useEffect(() => {
    if (!user.pixKey) return;

    const q = query(
      collection(db, 'payments'),
      where('receiverId', '==', user.pixKey),
      where('status', '==', 'pending_verification')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications: PaymentNotification[] = [];
      snapshot.forEach((doc) => {
        newNotifications.push({
          id: doc.id,
          amount: doc.data().amount,
          senderId: doc.data().senderId,
        });
      });
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [user.pixKey]);

  const confirmPayment = async (paymentId: string) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        status: 'verified'
      });
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900 border border-[#32BCAD]/50 rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-[#32BCAD]"></div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#32BCAD]/20 flex items-center justify-center shrink-0">
                <DollarSign className="text-[#32BCAD]" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-bold text-sm">Doação Recebida!</h4>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32BCAD] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#32BCAD]"></span>
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Você tem uma nova doação PIX de <strong className="text-[#32BCAD]">R$ {notif.amount.toFixed(2)}</strong> pendente de confirmação.
                </p>
                
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={() => confirmPayment(notif.id)}
                    className="flex-1 bg-[#32BCAD] hover:bg-[#269689] text-slate-900 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCircle size={14} /> Confirmar Recebimento
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
