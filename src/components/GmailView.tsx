import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Send,
  Trash2,
  Star,
  RefreshCw,
  Search,
  Plus,
  ArrowLeft,
  Reply,
  Forward,
  CheckCircle2,
  AlertTriangle,
  Inbox,
  SendHorizontal,
  Clock,
  Sparkles,
  FileText,
  User as UserIcon,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Tag,
  Paperclip,
  Check,
  X,
  Radio,
  Gamepad2,
  Trophy
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../services/googleAuth';
import {
  gmailService,
  GmailMessageSummary,
  GmailMessageDetail,
  GmailLabel,
} from '../services/gmailService';

interface GmailViewProps {
  onNavigateToLive?: () => void;
}

const CREATOR_TEMPLATES = [
  {
    id: 'sponsorship',
    label: '💼 Sponsorship Pitch & Rate Card',
    icon: Sparkles,
    subject: 'Visor Stream Partnership Proposal - [Creator Name] x [Brand]',
    body: `Hi [Brand Marketing Team],

Thank you for reaching out to partner with my stream on Visor Stream.

My gaming community currently reaches over [Number] concurrent active viewers across East Africa and the global gaming diaspora, specializing in Mobile & PC Esports.

Key Metrics:
• Average Concurrent Viewers: 2,500+
• Monthly Stream Hours: 120+
• Core Audience: EA Gaming Community (Uganda, Kenya, Tanzania, Nigeria)

We offer integrated live overlays, sponsored scrims, product giveaways, and affiliate discount links during our broadcasts.

Please let me know if you would like to review our full media kit and rate card.

Best regards,
[Your Name / Gamer Tag]
Visor Stream Broadcaster`,
  },
  {
    id: 'tournament',
    label: '🏆 Esports Tournament / Scrim Invitation',
    icon: Trophy,
    subject: 'Scrimmage & Tournament Invitation - Visor Esports Series',
    body: `Hello Team Captain,

We are inviting your squad to participate in our upcoming Visor Esports Community Invitational.

Details:
• Game: Apex Legends / PUBG Mobile / Warzone
• Format: Squads Battle Royale (Best of 5)
• Date & Time: This Saturday at 19:00 EAT
• Broadcast: Live on Visor Stream with dedicated casters

Please confirm your squad lineup (Captain IGN + Discord Tag) by Friday 18:00 EAT.

See you on the battleground,
[Your Name]
Tournament Organizer`,
  },
  {
    id: 'collab',
    label: '🤝 Co-Stream & Creator Collab',
    icon: Gamepad2,
    subject: 'Co-Stream / Dual Broadcast Collab Request',
    body: `Hey [Creator Name],

Big fan of your content on Visor Stream! I love your high-energy gameplay and community banter.

I wanted to see if you would be down for a dual squad co-stream this week. We could run a 3-hour session and cross-raid each other's chats at the end.

Let me know what day works best for your schedule!

Cheers,
[Your Gamer Tag]`,
  },
  {
    id: 'schedule',
    label: '📅 Weekly Stream Schedule Announcement',
    icon: Radio,
    subject: 'This Week Live Broadcast Schedule - Visor Stream',
    body: `Hey Community,

Here is our live broadcasting lineup for this week on Visor Stream:

• Tuesday 19:00 EAT: Ranked Grinding & Viewer Squads
• Thursday 20:00 EAT: Community Tournament Cast
• Saturday 18:00 EAT: Special 6-Hour Marathon + Giveaways

Tune in at https://visorstream.live to earn loyalty points and enter subscriber-only chat rooms.

Catch you in the live chat!
[Your Streamer Name]`,
  },
];

export const GmailView: React.FC<GmailViewProps> = ({ onNavigateToLive }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Mail state
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [messageDetail, setMessageDetail] = useState<GmailMessageDetail | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<string>('INBOX');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [labels, setLabels] = useState<GmailLabel[]>([]);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());

  // Compose State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [replyThreadId, setReplyThreadId] = useState<string | undefined>(undefined);

  // Mandatory Confirmation Dialog State (Per Skill Instructions)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant: 'danger' | 'primary' | 'warning';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: '',
    variant: 'primary',
    onConfirm: async () => {},
  });
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  // Status Notification Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Initialize Auth on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(!!token);
      },
      () => {
        // Not authenticated or token absent
        setHasToken(false);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Handle Google Sign-in
  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setHasToken(true);
        showToast('Successfully authenticated with Gmail!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err?.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setHasToken(false);
    setMessages([]);
    setMessageDetail(null);
    setSelectedMessageId(null);
    showToast('Signed out of Gmail', 'info');
  };

  // Load Messages
  const loadMessages = useCallback(async () => {
    if (!hasToken) return;
    setIsLoadingMessages(true);
    try {
      const labelParam = currentLabel === 'ALL' ? undefined : [currentLabel];
      const res = await gmailService.listMessages({
        labelIds: labelParam,
        query: searchQuery.trim() || undefined,
        maxResults: 25,
      });
      setMessages(res.messages);

      // Also fetch labels for unread count
      try {
        const lbls = await gmailService.getLabels();
        setLabels(lbls);
      } catch (e) {
        // ignore label fetch failure
      }
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      showToast(err.message || 'Error loading emails from Gmail', 'error');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [hasToken, currentLabel, searchQuery]);

  useEffect(() => {
    if (hasToken) {
      loadMessages();
    }
  }, [hasToken, currentLabel, loadMessages]);

  // Load Single Message Detail
  const handleSelectMessage = async (msgId: string) => {
    setSelectedMessageId(msgId);
    setIsLoadingDetail(true);
    try {
      const detail = await gmailService.getMessageDetail(msgId);
      setMessageDetail(detail);

      // Auto mark as read if unread
      if (detail.isUnread) {
        await gmailService.modifyLabels(msgId, [], ['UNREAD']);
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, isUnread: false } : m))
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to load email detail', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Toggle Star
  const handleToggleStar = async (msg: GmailMessageSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStarred = !msg.isStarred;
      if (newStarred) {
        await gmailService.modifyLabels(msg.id, ['STARRED'], []);
      } else {
        await gmailService.modifyLabels(msg.id, [], ['STARRED']);
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isStarred: newStarred } : m))
      );
      if (messageDetail && messageDetail.id === msg.id) {
        setMessageDetail({ ...messageDetail, isStarred: newStarred });
      }
    } catch (err: any) {
      showToast('Failed to update star', 'error');
    }
  };

  // Mandatory Confirmation for Send Email
  const requestSendEmail = () => {
    if (!composeTo.trim()) {
      showToast('Recipient address is required', 'error');
      return;
    }
    if (!composeSubject.trim()) {
      showToast('Subject is required', 'error');
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: 'Confirm Sending Email',
      description: `You are about to send an email to "${composeTo}" with the subject "${composeSubject}". This action will transmit your message immediately from your authenticated Gmail account.`,
      confirmLabel: 'Confirm & Send Email',
      variant: 'primary',
      onConfirm: async () => {
        setIsExecutingAction(true);
        try {
          await gmailService.sendEmail({
            to: composeTo.trim(),
            cc: composeCc.trim() || undefined,
            subject: composeSubject.trim(),
            body: composeBody,
            threadId: replyThreadId,
          });
          showToast('Email sent successfully!', 'success');
          setIsComposeOpen(false);
          setComposeTo('');
          setComposeCc('');
          setComposeSubject('');
          setComposeBody('');
          setReplyThreadId(undefined);
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
          loadMessages();
        } catch (err: any) {
          console.error(err);
          showToast(err.message || 'Failed to send email', 'error');
        } finally {
          setIsExecutingAction(false);
        }
      },
    });
  };

  // Mandatory Confirmation for Move to Trash
  const requestTrashMessage = (msgId: string, subject: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Move Email to Trash',
      description: `Are you sure you want to move the email "${subject}" to your Gmail Trash?`,
      confirmLabel: 'Move to Trash',
      variant: 'danger',
      onConfirm: async () => {
        setIsExecutingAction(true);
        try {
          await gmailService.trashMessage(msgId);
          showToast('Message moved to Trash', 'info');
          setMessages((prev) => prev.filter((m) => m.id !== msgId));
          if (selectedMessageId === msgId) {
            setSelectedMessageId(null);
            setMessageDetail(null);
          }
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          showToast(err.message || 'Failed to trash email', 'error');
        } finally {
          setIsExecutingAction(false);
        }
      },
    });
  };

  // Reply Handler
  const handleReply = (detail: GmailMessageDetail) => {
    setComposeTo(detail.fromEmail || detail.from);
    setComposeSubject(
      detail.subject.startsWith('Re:') ? detail.subject : `Re: ${detail.subject}`
    );
    setComposeBody(
      `\n\n--- Original Message from ${detail.fromName} (${detail.date}) ---\n${detail.bodyText || detail.snippet}`
    );
    setReplyThreadId(detail.threadId);
    setIsComposeOpen(true);
  };

  // Apply Template
  const applyTemplate = (template: typeof CREATOR_TEMPLATES[0]) => {
    setComposeSubject(template.subject);
    setComposeBody(template.body);
    showToast(`Applied "${template.label}" template`, 'info');
  };

  // Calculate unread inbox count
  const inboxUnread =
    labels.find((l) => l.id === 'INBOX')?.messagesUnread ||
    messages.filter((m) => m.isUnread).length;

  return (
    <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-slideUp ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-300'
              : 'bg-slate-900/90 border-slate-700 text-sky-300'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
          {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-sky-400" />}
          <span className="text-xs font-mono-code font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header Bento Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-600/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Gmail Creator Communications
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono-code font-bold uppercase">
                    Google Workspace
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  Manage live stream sponsorships, esports invitations, brand pitches, and community emails
                </p>
              </div>
            </div>
          </div>

          {/* User / Authentication Status */}
          <div className="flex items-center gap-3 flex-wrap">
            {hasToken && currentUser ? (
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl p-2 sm:px-4 sm:py-2.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-black text-white leading-tight">
                    {currentUser.displayName || 'Creator'}
                  </p>
                  <p className="text-[10px] font-mono-code text-slate-400">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Sign out of Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-right">
                <span className="text-[11px] font-mono-code text-slate-400 block mb-1">
                  Google Workspace Auth Required
                </span>
              </div>
            )}

            {hasToken && (
              <button
                onClick={() => {
                  setComposeTo('');
                  setComposeSubject('');
                  setComposeBody('');
                  setReplyThreadId(undefined);
                  setIsComposeOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-slate-950 hover:bg-sky-400 transition-colors font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Compose Email</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unauthenticated State View */}
      {!hasToken ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center shadow-xl">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tight">
              Connect Your Gmail Account
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
              Sign in with Google to read and send emails directly inside Visor Stream. Respond to brand sponsors, coordinate tournament scrims, and organize fan mail with permission from your account.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-xs text-rose-300 font-mono-code text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Official Google Styled Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm tracking-wide shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isAuthenticating ? 'Connecting to Gmail...' : 'Sign in with Google'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono-code">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure OAuth 2.0 connection. In-memory token storage.</span>
          </div>
        </div>
      ) : (
        /* Authenticated Gmail Bento Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar: Folders & Creator Filters */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-slate-400">
                  Mailboxes
                </span>
                <button
                  onClick={loadMessages}
                  disabled={isLoadingMessages}
                  className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-xl transition-colors"
                  title="Refresh inbox"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin text-sky-400' : ''}`} />
                </button>
              </div>

              <div className="space-y-1">
                {[
                  { id: 'INBOX', label: 'Inbox', icon: Inbox, count: inboxUnread },
                  { id: 'STARRED', label: 'Starred', icon: Star },
                  { id: 'SENT', label: 'Sent Messages', icon: SendHorizontal },
                  { id: 'DRAFT', label: 'Drafts', icon: FileText },
                  { id: 'TRASH', label: 'Trash', icon: Trash2 },
                ].map((folder) => {
                  const Icon = folder.icon;
                  const isActive = currentLabel === folder.id;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setCurrentLabel(folder.id);
                        setSelectedMessageId(null);
                        setMessageDetail(null);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                        <span>{folder.label}</span>
                      </div>
                      {typeof folder.count === 'number' && folder.count > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono-code font-bold">
                          {folder.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Creator Quick Filters */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-slate-500">
                  Creator Smart Filters
                </span>
                <div className="space-y-1">
                  {[
                    { label: 'Sponsorship Inquiries', query: 'sponsor OR partnership OR brand' },
                    { label: 'Esports & Tournament Invites', query: 'tournament OR scrim OR esports' },
                    { label: 'Visor Community Alerts', query: 'Visor OR streaming' },
                  ].map((filter, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(filter.query);
                        loadMessages();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 flex items-center gap-2 transition-colors font-mono-code"
                    >
                      <Tag className="w-3 h-3 text-sky-400/70" />
                      <span className="truncate">{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Templates Bento Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Streamer Templates
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">
                1-click populate professional responses for brands and organizers:
              </p>
              <div className="space-y-1.5">
                {CREATOR_TEMPLATES.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        applyTemplate(tpl);
                        setIsComposeOpen(true);
                      }}
                      className="w-full text-left p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-2.5 transition-all group"
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate text-[11px] font-bold group-hover:text-sky-300">
                        {tpl.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center & Right Pane: Message List + Message Detail */}
          <div className="lg:col-span-9 space-y-4">
            {/* Search Bar & Action Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search Gmail messages (sender, subject, keyword)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') loadMessages();
                  }}
                  className="w-full pl-10 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setTimeout(loadMessages, 50);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={loadMessages}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono-code font-bold flex items-center gap-1.5 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>

            {/* Split View: Message List or Selected Message Reading Pane */}
            {selectedMessageId && messageDetail ? (
              /* Reading Pane */
              <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
                {/* Detail Header / Nav back */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedMessageId(null);
                      setMessageDetail(null);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Inbox</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleStar(messageDetail, e)}
                      className={`p-2 rounded-xl border transition-colors ${
                        messageDetail.isStarred
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title="Star email"
                    >
                      <Star className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleReply(messageDetail)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 text-xs font-bold transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      <span>Reply</span>
                    </button>

                    <button
                      onClick={() => requestTrashMessage(messageDetail.id, messageDetail.subject)}
                      className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email Subject & Sender Metadata */}
                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {messageDetail.subject}
                  </h3>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                        {messageDetail.fromName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {messageDetail.fromName}
                          </span>
                          <span className="text-xs text-slate-400 font-mono-code">
                            &lt;{messageDetail.fromEmail}&gt;
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono-code">
                          To: {messageDetail.to}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono-code text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {messageDetail.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attachments if any */}
                {messageDetail.hasAttachments && (
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono-code font-bold uppercase text-slate-400 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-sky-400" />
                      Attachments ({messageDetail.attachments.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {messageDetail.attachments.map((att, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-400" />
                          <span className="font-mono-code">{att.filename}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Body Content */}
                <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans min-h-[220px]">
                  {messageDetail.bodyHtml ? (
                    <div
                      className="gmail-rendered-body prose prose-invert max-w-none text-slate-200"
                      dangerouslySetInnerHTML={{ __html: messageDetail.bodyHtml }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-slate-200">
                      {messageDetail.bodyText || messageDetail.snippet}
                    </pre>
                  )}
                </div>

                {/* Bottom Quick Reply Action Bar */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleReply(messageDetail)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-sky-400 transition-colors shadow-lg active:scale-95"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Quick Reply</span>
                  </button>

                  <button
                    onClick={() => {
                      setComposeSubject(`Fwd: ${messageDetail.subject}`);
                      setComposeBody(
                        `\n\n---------- Forwarded message ---------\nFrom: ${messageDetail.from}\nDate: ${messageDetail.date}\nSubject: ${messageDetail.subject}\nTo: ${messageDetail.to}\n\n${messageDetail.bodyText || messageDetail.snippet}`
                      );
                      setIsComposeOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                  >
                    <Forward className="w-4 h-4" />
                    <span>Forward</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Message List Table */
              <div className="bg-slate-900 border border-slate-800 rounded-[28px] overflow-hidden shadow-2xl">
                {isLoadingMessages ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-mono-code text-slate-400">
                      Syncing messages from Gmail...
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                      <Inbox className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-white text-base">No messages found</h4>
                      <p className="text-xs text-slate-400 font-mono-code">
                        {searchQuery
                          ? `No emails matched query: "${searchQuery}"`
                          : `No messages in ${currentLabel}`}
                      </p>
                    </div>
                    <button
                      onClick={loadMessages}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg.id)}
                        className={`p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 cursor-pointer transition-all ${
                          msg.isUnread ? 'bg-sky-500/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Star toggle */}
                          <button
                            onClick={(e) => handleToggleStar(msg, e)}
                            className={`p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors ${
                              msg.isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
                            }`}
                          >
                            <Star className="w-4 h-4" />
                          </button>

                          {/* Sender Initial Avatar */}
                          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-black text-xs flex-shrink-0">
                            {msg.fromName.charAt(0).toUpperCase()}
                          </div>

                          {/* Subject & snippet */}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold truncate ${
                                  msg.isUnread ? 'text-white font-black' : 'text-slate-300'
                                }`}
                              >
                                {msg.fromName}
                              </span>
                              {msg.isUnread && (
                                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                              )}
                            </div>
                            <p
                              className={`text-xs truncate ${
                                msg.isUnread ? 'text-slate-200 font-semibold' : 'text-slate-400'
                              }`}
                            >
                              <span className="text-white font-bold mr-1.5">{msg.subject}</span>
                              <span className="text-slate-500 font-mono-code font-normal">
                                — {msg.snippet}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Timestamp & Trash action */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-[11px] font-mono-code text-slate-500 whitespace-nowrap">
                            {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              requestTrashMessage(msg.id, msg.subject);
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose & Send Email Modal / Drawer */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-[28px] max-w-2xl w-full shadow-2xl overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white tracking-tight">
                    Compose Gmail Message
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono-code">
                    Broadcaster & Esports Outbox
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compose Form */}
            <div className="p-6 space-y-4 font-mono-code">
              {/* Recipient To */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <label>To (Recipient Email)</label>
                  <button
                    type="button"
                    onClick={() => setShowCc(!showCc)}
                    className="text-[10px] text-sky-400 hover:underline"
                  >
                    {showCc ? 'Hide CC' : '+ Add CC'}
                  </button>
                </div>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="sponsor@brand.com, player@team.gg"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-sans"
                  required
                />
              </div>

              {/* Optional CC */}
              {showCc && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Cc</label>
                  <input
                    type="email"
                    value={composeCc}
                    onChange={(e) => setComposeCc(e.target.value)}
                    placeholder="manager@agency.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-sans"
                  />
                </div>
              )}

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Subject</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Visor Stream Sponsorship Proposal..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-sans"
                  required
                />
              </div>

              {/* Quick Template Picker inside Compose */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">
                  Insert Streamer Template
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CREATOR_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 hover:text-sky-300 transition-colors"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Body */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Email Body</label>
                <textarea
                  rows={8}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-sans leading-relaxed resize-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={requestSendEmail}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-sky-400 transition-colors shadow-lg active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY User Confirmation Dialog for Destructive / Mutating Actions */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-[28px] max-w-md w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  confirmationModal.variant === 'danger'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                }`}
              >
                {confirmationModal.variant === 'danger' ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-black text-lg text-white tracking-tight">
                  {confirmationModal.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono-code">User Confirmation Required</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-300 leading-relaxed">
                {confirmationModal.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isExecutingAction}
                onClick={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isExecutingAction}
                onClick={confirmationModal.onConfirm}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 ${
                  confirmationModal.variant === 'danger'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                    : 'bg-white hover:bg-sky-400 text-slate-950 shadow-lg'
                }`}
              >
                {isExecutingAction ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  <span>{confirmationModal.confirmLabel}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
