export const getInviteLink = (inviteCode: string): string => {
  const domain = typeof window !== 'undefined' && window.location.origin.includes('directcash.site')
    ? window.location.origin
    : 'https://directcash.site';
  return `${domain}/invite/${inviteCode}`;
};

export const SUPPORT_WHATSAPP_NUMBER = '5513991472036';
export const SUPPORT_WHATSAPP_DISPLAY = '(13) 99147-2036';

