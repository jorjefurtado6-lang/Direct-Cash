export type PixType = 'cpf' | 'email' | 'telefone' | 'aleatoria';

export interface User {
  uid?: string;
  name: string;
  email?: string;
  pixKey: string;
  pixType: PixType;
  isActive: boolean;
  inviteCode?: string;
  sponsorCode?: string;
  createdAt?: any;
  isAdmin?: boolean;
  whatsapp?: string;
  allowWhatsappContact?: boolean;
}

export interface Receiver {
  level: number;
  name: string;
  pixKey: string;
  status: 'pending' | 'uploading' | 'verified';
  whatsapp?: string;
  allowWhatsappContact?: boolean;
}
