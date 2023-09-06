
export interface Conversation {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  source: 'YOU' | 'THEM' | 'YOU-REPLY';
  text: string;
}

export type FollowUpType = 'SMOOTH' | 'DEEP' | 'FUNNY';
