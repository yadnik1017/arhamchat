export interface Profile {
  id: string;
  email: string;
  avatar_url?: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  last_message?: Message;
  other_participant?: Profile;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
