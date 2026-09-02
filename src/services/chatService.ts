import { 
  db, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  handleFirestoreError,
  OperationType 
} from '../firebase';
import { ChatMessage } from '../types';

const INITIAL_MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  default: [
    { 
      id: 'c1', 
      sender: 'Musa_Kampala', 
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80', 
      text: 'That slide-jump maneuver was insane bro!! 🔥', 
      timestamp: '14:05:32', 
      badge: 'PRO' 
    },
    { 
      id: 'c2', 
      sender: 'Nairobi_Apex_God', 
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&auto=format&fit=crop&q=80', 
      text: 'M-Pesa tip incoming! Show us the gyro sensitivity again', 
      timestamp: '14:05:12', 
      badge: 'VIP', 
      isDonation: true, 
      donationAmount: '500 KES', 
      donationCurrency: 'KES', 
      donationMessage: 'Repping the squad king! 👑 Keep carrying!' 
    },
    { 
      id: 'c3', 
      sender: 'Sarah_Entebbe', 
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80', 
      text: 'The low ping on Nairobi node today is silky smooth', 
      timestamp: '14:04:48', 
      badge: 'FAN' 
    },
    { 
      id: 'c4', 
      sender: 'VSR_Alpha', 
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80', 
      text: 'Welcome in everybody! Sub goal 500 for the tournament giveaway!', 
      timestamp: '14:04:10', 
      badge: 'CREATOR' 
    }
  ]
};

// Retrieve local cached messages
export function getLocalChatMessages(streamId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`visor_chat_${streamId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading local chat cache:', e);
  }
  return INITIAL_MOCK_MESSAGES[streamId] || INITIAL_MOCK_MESSAGES.default;
}

// Save to local cache
export function setLocalChatMessages(streamId: string, messages: ChatMessage[]): void {
  try {
    localStorage.setItem(`visor_chat_${streamId}`, JSON.stringify(messages.slice(-50)));
  } catch (e) {
    console.warn('Error saving local chat cache:', e);
  }
}

// Subscribe to real-time chat from Firestore with local fallback
export function subscribeToStreamChat(
  streamId: string,
  onMessagesUpdate: (messages: ChatMessage[]) => void
): () => void {
  // Start with local cache immediately for zero latency
  const initial = getLocalChatMessages(streamId);
  onMessagesUpdate(initial);

  try {
    const chatCol = collection(db, 'chat_messages');
    const q = query(
      chatCol,
      where('streamId', '==', streamId),
      limit(60)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreMsgs: (ChatMessage & { _rawTime?: number })[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            const createdAtSeconds = data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0;
            return {
              id: docSnap.id,
              sender: data.sender || 'Gamer',
              avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80',
              badge: data.badge,
              text: data.text || '',
              timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isDonation: data.isDonation,
              donationAmount: data.donationAmount,
              donationCurrency: data.donationCurrency,
              donationMessage: data.donationMessage,
              _rawTime: createdAtSeconds
            };
          });

          // Sort chronologically client-side
          firestoreMsgs.sort((a, b) => (a._rawTime || 0) - (b._rawTime || 0));

          setLocalChatMessages(streamId, firestoreMsgs);
          onMessagesUpdate(firestoreMsgs);
        }
      },
      (error) => {
        // Log friendly warning and maintain cached messages
        console.warn('[VISOR Stream Chat Sync] Offline fallback active:', error.message || error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firestore subscription fallback:', err);
    return () => {};
  }
}

// Post a chat message
export async function sendStreamChatMessage(
  streamId: string,
  message: Omit<ChatMessage, 'id'>
): Promise<ChatMessage> {
  const localId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const fullMsg: ChatMessage = {
    ...message,
    id: localId
  };

  // Immediate optimistic local update
  const currentLocal = getLocalChatMessages(streamId);
  const updatedLocal = [...currentLocal, fullMsg];
  setLocalChatMessages(streamId, updatedLocal);

  try {
    const chatCol = collection(db, 'chat_messages');
    await addDoc(chatCol, {
      ...message,
      streamId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, {
      operation: OperationType.CREATE,
      path: 'chat_messages',
      timestamp: new Date().toISOString()
    });
  }

  return fullMsg;
}

// Note: there used to be a `recordStreamTip()` here that wrote tip records
// directly to a Firestore `tips` collection. It was unused dead code (no
// component ever called it) that duplicated the *real* tip ledger, which
// lives in Postgres (`tips` table, written only via the Pesapal IPN webhook
// in server.ts once a payment actually completes - see POST /api/tips and
// the webhook handler). Keeping both around risked a "split-brain" tips
// model where a viewer-facing tip total and a creator's actual payout ledger
// could silently disagree. If a Firestore-backed live tip alert is ever
// needed again, it should be *driven by* the Postgres completion event
// (e.g. via a server-triggered write), not written independently by the client.

