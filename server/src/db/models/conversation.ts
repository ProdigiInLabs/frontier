import { Schema, model } from 'mongoose';

export type Channel = 'chat' | 'agent' | 'search' | 'voice-turn' | 'voice-realtime';
export type MessageRole = 'user' | 'assistant';

export interface ConversationMessage {
  role: MessageRole;
  text: string;
  at: Date;
}

export interface ConversationDoc {
  conversationId: string;
  channel: Channel;
  messages: ConversationMessage[];
  /** Set only for anonymized operational metrics — never a visitor identity. */
  clientHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<ConversationMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    // Capped defensively: this is a demo-scale log, not a data warehouse.
    text: { type: String, required: true, maxlength: 8000 },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const conversationSchema = new Schema<ConversationDoc>(
  {
    conversationId: { type: String, required: true, index: true, unique: true },
    channel: { type: String, enum: ['chat', 'agent', 'search', 'voice-turn', 'voice-realtime'], required: true },
    messages: { type: [messageSchema], default: [] },
    clientHash: { type: String },
  },
  { timestamps: true },
);

export const Conversation = model<ConversationDoc>('Conversation', conversationSchema);
