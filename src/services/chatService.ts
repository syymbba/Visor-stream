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

// Post a Super Chat tip / donation to Firestore
export async function recordStreamTip(
  streamId: string,
  tipData: {
    streamerName: string;
    senderName: string;
    senderPhone?: string;
    amount: number;
    currency: string;
    network: string;
    message: string;
  }
): Promise<void> {
  try {
    const tipsCol = collection(db, 'tips');
    await addDoc(tipsCol, {
      ...tipData,
      streamId,
      status: 'completed',
      createdAt: serverTimestamp()
    });

    // Also dispatch to stream chat as a pinned Super Tip
    await sendStreamChatMessage(streamId, {
      sender: tipData.senderName,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80',
      badge: 'VIP',
      text: tipData.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDonation: true,
      donationAmount: `${tipData.amount.toLocaleString()} ${tipData.currency}`,
      donationCurrency: tipData.currency,
      donationMessage: tipData.message
    });
  } catch (error) {
    console.warn('Tip recording error:', error);
  }
}

// Pool of realistic esports and gaming community live chatters
export const SIMULATED_COMMUNITY_CHATTERS: Array<{
  sender: string;
  avatar: string;
  badge: 'VIP' | 'PRO' | 'FAN' | 'CREATOR' | 'MOD';
  text: string;
}> = [
  {
    sender: 'Kiprono_Eldoret',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80',
    badge: 'PRO',
    text: 'That 360 no-scope was pure witchcraft! 🔥🔥'
  },
  {
    sender: 'Fatuma_Mombasa',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80',
    badge: 'FAN',
    text: 'Watching live from Coastal Kenya! 🇰🇪 Great stream quality today'
  },
  {
    sender: 'Kigozi_Gamers',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=80',
    badge: 'VIP',
    text: 'Sent MoMo support! Let us hit that sub goal before tournament finals! 🚀'
  },
  {
    sender: 'Amina_DarEsSalaam',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80',
    badge: 'PRO',
    text: 'Tanzania gamers in the building 🇹🇿 Show the loadout specs!'
  },
  {
    sender: 'Nsubuga_Apex',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=60&auto=format&fit=crop&q=80',
    badge: 'MOD',
    text: 'Keep chat clean and friendly fam! Type !discord for the clan link.'
  },
  {
    sender: 'Juma_Sniper99',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&auto=format&fit=crop&q=80',
    badge: 'FAN',
    text: 'GGs! That clutch in round 3 saved the entire match 👑'
  },
  {
    sender: 'Zola_Luanda',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80',
    badge: 'PRO',
    text: '120fps stream looking silky smooth on Nairobi relay node ⚡'
  }
];

export function getRandomSimulatedChatter(): Omit<ChatMessage, 'id' | 'timestamp'> {
  const item = SIMULATED_COMMUNITY_CHATTERS[Math.floor(Math.random() * SIMULATED_COMMUNITY_CHATTERS.length)];
  return {
    sender: item.sender,
    avatar: item.avatar,
    badge: item.badge,
    text: item.text
  };
}

