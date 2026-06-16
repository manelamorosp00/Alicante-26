import React, { useState, useEffect } from 'react';
import { Language, Member, Expense, PlanItem, VoteItem } from './types';
import { t } from './translations';
import {
  defaultMembers,
  defaultExpenses,
  defaultPlans,
  defaultVotes,
  defaultSightseeings,
  punishmentOptions
} from './data';
import { SpinningWheel } from './components/SpinningWheel';
import { ExpenseSplitter } from './components/ExpenseSplitter';
import { ItineraryTimeline } from './components/ItineraryTimeline';
import { SightseeingGrid } from './components/SightseeingGrid';
import { ProfileManager } from './components/ProfileManager';
import { TutorialOverlay } from './components/TutorialOverlay';
import { Recomanacions } from './components/Recomanacions';
import { db, auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firebaseUtils';
import {
  Sparkles,
  Utensils,
  MapPin,
  Calendar,
  Coins,
  Dices,
  Users,
  ExternalLink,
  Sunset,
  Vote,
  Plus,
  Trash2,
  BookmarkCheck,
  Check,
  X,
  LogIn,
  LogOut,
  UserCheck,
  Compass
} from 'lucide-react';

export default function App() {
  // 0. Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null | undefined>(undefined); // undefined = loading
  const [authLoading, setAuthLoading] = useState(false);
  const [showWhoAreYou, setShowWhoAreYou] = useState(false); // Modal "Qui ets tu?"
  const [showTutorial, setShowTutorial] = useState(false); // Tutorial onboarding

  // 1. Language selector state
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('alicante_lang');
    return (saved as Language) || 'ca';
  });

  // 2. Active Member / Persona state
  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    return localStorage.getItem('alicante_active_member') || '';
  });

  // 3. Core App data lists (now loaded and synchronized with Firestore)
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [votes, setVotes] = useState<VoteItem[]>([]);

  // 4. Tab selection state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'plans' | 'recomanacions' | 'sightseeing' | 'games' | 'profiles'>('dashboard');

  // Bridge: Recomanacions → Plans tab prefill
  const [prefillPlan, setPrefillPlan] = useState<Partial<PlanItem> | undefined>(undefined);

  const handleAddToPlanFromRec = (prefill: Partial<PlanItem>) => {
    setPrefillPlan(prefill);
    setActiveTab('plans');
  };

  // Interactive Poll creation states inside Games Tab
  const [newPollQuestionCa, setNewPollQuestionCa] = useState('');
  const [newPollQuestionEn, setNewPollQuestionEn] = useState('');
  const [newPollQuestionAn, setNewPollQuestionAn] = useState('');
  const [pollOptionsInput, setPollOptionsInput] = useState<string[]>(['', '']);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);

  // Dynamic Countdown calculation
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Custom PWA / iOS standalone banner view
  const [dismissedPwaGuide, setDismissedPwaGuide] = useState(() => {
    return localStorage.getItem('alicante_pwa_dismissed') === 'true';
  });

  // Custom Member Registration States
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regAvatar, setRegAvatar] = useState('🌴');
  const [regBudget, setRegBudget] = useState(150);

  // Auth state listener — detects login/logout automatically
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        // Logged out → clear active member
        setActiveMemberId('');
      }
    });
    return () => unsub();
  }, []);

  // When members load and we have a Firebase user, auto-link to their profile
  useEffect(() => {
    if (!firebaseUser || members.length === 0) return;
    const linked = members.find(m => m.googleUid === firebaseUser.uid);
    if (linked) {
      setActiveMemberId(linked.id);
      setShowWhoAreYou(false);
    } else if (!activeMemberId) {
      // No linked member yet → show "Qui ets tu?" modal
      setShowWhoAreYou(true);
    }
  }, [firebaseUser, members]);

  // Login amb Google
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    setActiveMemberId('');
    setShowWhoAreYou(false);
  };

  // Vincular compte Google a un membre del grup
  const handleLinkMember = async (memberId: string) => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'members', memberId), { googleUid: firebaseUser.uid });
      setActiveMemberId(memberId);
      setShowWhoAreYou(false);
      // Mostrar tutorial la primera vegada que es vincula
      const tutorialKey = `alicante_tutorial_done_${memberId}`;
      if (!localStorage.getItem(tutorialKey)) {
        setShowTutorial(true);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `members/${memberId}`);
    }
  };

  const handleFinishTutorial = () => {
    if (activeMemberId) {
      localStorage.setItem(`alicante_tutorial_done_${activeMemberId}`, 'true');
    }
    setShowTutorial(false);
  };

  // Sync basic local state (tab config / lang)
  useEffect(() => {
    localStorage.setItem('alicante_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('alicante_active_member', activeMemberId);
  }, [activeMemberId]);

  useEffect(() => {
    localStorage.setItem('alicante_pwa_dismissed', dismissedPwaGuide ? 'true' : 'false');
  }, [dismissedPwaGuide]);

  // Synchronize Firestore subscriptions (realtime bidirectional Sync)
  useEffect(() => {
    // 1. Sync Members
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      if (snapshot.empty) {
        // If Firestore collection is brand new or empty, pre-populate from defaults
        defaultMembers.forEach((m) => {
          setDoc(doc(db, 'members', m.id), m).catch((err) => {
            console.error('Error seeding initial member:', err);
          });
        });
      } else {
        const list: Member[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Member);
        });
        setMembers(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });

    // 2. Sync Expenses (no seeding — start empty in production)
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Expense);
      });
      setExpenses(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'expenses');
    });

    // 3. Sync Plans
    const unsubPlans = onSnapshot(collection(db, 'plans'), (snapshot) => {
      if (snapshot.empty) {
        defaultPlans.forEach((p) => {
          setDoc(doc(db, 'plans', p.id), p).catch((err) => {
            console.error('Error seeding initial plan:', err);
          });
        });
      } else {
        const list: PlanItem[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as PlanItem);
        });
        setPlans(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'plans');
    });

    // 4. Sync Votes / Polls (no seeding — start empty in production)
    const unsubVotes = onSnapshot(collection(db, 'votes'), (snapshot) => {
      const list: VoteItem[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as VoteItem);
      });
      setVotes(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'votes');
    });

    return () => {
      unsubMembers();
      unsubExpenses();
      unsubPlans();
      unsubVotes();
    };
  }, []);

  // Compute countdown to June 22th, 2026
  useEffect(() => {
    const targetDate = new Date('2026-06-22T12:00:00');
    
    const calculateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const secs = Math.floor((difference / 1000) % 60);
      const mins = Math.floor((difference / 1000 / 60) % 60);
      const hrs = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const ds = Math.floor(difference / (1000 * 60 * 60 * 24));
      
      setTimeLeft({ days: ds, hours: hrs, minutes: mins, seconds: secs });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handlers for Expenses (cloud-synchronized)
  const handleAddExpense = async (newExp: Omit<Expense, 'id'>) => {
    const id = 'exp_' + Date.now();
    const expense: Expense = {
      ...newExp,
      id,
    };
    // Let errors propagate so the form can display them
    await setDoc(doc(db, 'expenses', id), expense);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `expenses/${id}`);
    }
  };

  const handleResetExpenses = async () => {
    try {
      const q = await getDocs(collection(db, 'expenses'));
      q.forEach(async (d) => {
        await deleteDoc(doc(db, 'expenses', d.id));
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'expenses');
    }
  };

  // Handlers for Plans (cloud-synchronized)
  const handleAddPlan = async (newPlan: Omit<PlanItem, 'id' | 'votes'>) => {
    const id = 'plan_' + Date.now();
    const plan: PlanItem = {
      ...newPlan,
      id,
      votes: [activeMemberId], // Creator likes it by default
      favorites: [],
    };
    try {
      await setDoc(doc(db, 'plans', id), plan);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `plans/${id}`);
    }
  };

  const handleVotePlan = async (id: string) => {
    const planToUpdate = plans.find(p => p.id === id);
    if (!planToUpdate) return;
    const votesList = planToUpdate.votes || [];
    const newVotes = votesList.includes(activeMemberId)
      ? votesList.filter(vid => vid !== activeMemberId)
      : [...votesList, activeMemberId];
    try {
      await updateDoc(doc(db, 'plans', id), { votes: newVotes });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `plans/${id}`);
    }
  };

  const handleToggleFavoritePlan = async (id: string) => {
    const planToUpdate = plans.find(p => p.id === id);
    if (!planToUpdate) return;
    const favs = planToUpdate.favorites || [];
    const newFavs = favs.includes(activeMemberId)
      ? favs.filter(vid => vid !== activeMemberId)
      : [...favs, activeMemberId];
    try {
      await updateDoc(doc(db, 'plans', id), { favorites: newFavs });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `plans/${id}`);
    }
  };

  // Handlers for Friend Profiles (cloud-synchronized)
  const handleUpdateMember = async (id: string, updated: Partial<Member>) => {
    try {
      await updateDoc(doc(db, 'members', id), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `members/${id}`);
    }
  };

  // Handlers for registering custom new characters
  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regNickname.trim()) return;

    const id = 'member_' + Date.now();
    const newMember: Member = {
      id,
      name: regName.trim(),
      nickname: regNickname.trim(),
      avatarUrl: regAvatar,
      role: 'Amic d\'Alacant 🌴',
      color: 'bg-art-yellow',
    };

    try {
      await setDoc(doc(db, 'members', id), newMember);
      setActiveMemberId(id); // select them automatically!
      setIsRegistering(false);
      setRegName('');
      setRegNickname('');
      setRegAvatar('🌴');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `members/${id}`);
    }
  };

  // Handlers for Group Polls (cloud-synchronized)
  const handleVotePoll = async (pollId: string, optionId: string) => {
    if (!activeMemberId) return;

    const poll = votes.find(v => v.id === pollId);
    if (!poll) return;

    const updatedOptions = poll.options.map(opt => {
      if (opt.id === optionId) {
        const hasVoted = opt.votes.includes(activeMemberId);
        return {
          ...opt,
          votes: hasVoted 
            ? opt.votes.filter(uId => uId !== activeMemberId)
            : [...opt.votes, activeMemberId]
        };
      } else {
        return {
          ...opt,
          votes: opt.votes.filter(uId => uId !== activeMemberId)
        };
      }
    });

    try {
      await updateDoc(doc(db, 'votes', pollId), { options: updatedOptions });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `votes/${pollId}`);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = pollOptionsInput.filter(opt => opt.trim() !== '');
    if (!newPollQuestionCa.trim() || cleanOptions.length < 2) return;

    const id = 'poll_' + Date.now();
    const newPoll: VoteItem = {
      id,
      question: {
        ca: newPollQuestionCa.trim(),
        en: (newPollQuestionEn.trim() || newPollQuestionCa.trim()),
        an: (newPollQuestionAn.trim() || newPollQuestionCa.trim())
      },
      options: cleanOptions.map((opt, index) => ({
        id: `opt_${index}_` + Date.now(),
        text: {
          ca: opt.trim(),
          en: opt.trim(),
          an: opt.trim()
        },
        votes: []
      })),
      createdBy: activeMemberId,
      closed: false
    };

    try {
      await setDoc(doc(db, 'votes', id), newPoll);
      // Reset Form
      setNewPollQuestionCa('');
      setNewPollQuestionEn('');
      setNewPollQuestionAn('');
      setPollOptionsInput(['', '']);
      setIsCreatingPoll(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `votes/${id}`);
    }
  };

  const handleToggleClosePoll = async (pollId: string) => {
    const poll = votes.find(v => v.id === pollId);
    if (!poll) return;
    try {
      await updateDoc(doc(db, 'votes', pollId), { closed: !poll.closed });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `votes/${pollId}`);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    try {
      await deleteDoc(doc(db, 'votes', pollId));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `votes/${pollId}`);
    }
  };

  const activeMember = members.find(m => m.id === activeMemberId);

  // 5a. Loading Firebase Auth
  if (firebaseUser === undefined) {
    return (
      <div className="min-h-screen bg-[#fdfaf2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Sunset className="w-14 h-14 text-art-orange animate-bounce" />
          <p className="font-display font-black uppercase text-art-text tracking-wider">Carregant...</p>
        </div>
      </div>
    );
  }

  // 5b. Not logged in → Google login screen
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-[#fdfaf2] flex flex-col justify-center items-center p-6 relative overflow-hidden" id="login-screen-overlay">

        <div className="w-full max-w-md bg-white border-4 border-[#2d2d2d] p-10 text-[#2d2d2d] shadow-[8px_8px_0px_0px_#2d2d2d] relative z-10 rounded-none text-center">

          <div className="flex justify-center mb-3">
            <Sunset className="w-14 h-14 text-art-orange animate-bounce" />
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-art-text uppercase">
            Alacant 2026 🌴
          </h1>
          <p className="text-[#2d2d2d]/70 font-semibold text-xs sm:text-sm mt-2 max-w-xs mx-auto">
            El niu d'operacions col·lectiu dels amics per les Hogueras.
          </p>

          {/* Language switcher */}
          <div className="flex gap-2 justify-center mt-5 mb-8 bg-white p-1 border-2 border-[#2d2d2d] w-fit mx-auto text-[10px]">
            <button type="button" onClick={() => setLanguage('ca')} className={`px-2.5 py-1 font-bold uppercase transition-all cursor-pointer ${language === 'ca' ? 'bg-[#2d2d2d] text-white' : 'text-art-text/60 hover:text-art-text'}`}>Català</button>
            <button type="button" onClick={() => setLanguage('en')} className={`px-2.5 py-1 font-bold uppercase transition-all cursor-pointer ${language === 'en' ? 'bg-[#2d2d2d] text-white' : 'text-art-text/60 hover:text-art-text'}`}>English</button>
            <button type="button" onClick={() => setLanguage('an')} className={`px-2.5 py-1 font-bold uppercase transition-all cursor-pointer ${language === 'an' ? 'bg-[#2d2d2d] text-white' : 'text-art-text/60 hover:text-art-text'}`}>Andaluz</button>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:translate-y-[-2px] hover:shadow-[4px_6px_0px_0px_#2d2d2d] active:translate-y-0 transition-all cursor-pointer font-black uppercase text-sm tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <span className="animate-spin text-xl">⏳</span>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>
              {language === 'ca' ? 'Entrar amb Google' : language === 'en' ? 'Sign in with Google' : 'Entrá con Google'}
            </span>
            <LogIn className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-art-text/40 mt-5 font-mono">
            {language === 'ca' ? 'Només per als amics del grup. Gratuït i sense anuncis.' : language === 'en' ? 'Squad members only. Free & ad-free.' : 'Solo pa\' la peña. Gratis y sin publicidá.'}
          </p>
        </div>
      </div>
    );
  }

  // 5c. Modal "Qui ets tu?" — logged in but profile not linked yet
  const WhoAreYouModal = showWhoAreYou ? (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white border-4 border-[#2d2d2d] p-6 shadow-[8px_8px_0px_0px_#2d2d2d] rounded-none">

        <div className="flex items-center gap-3 mb-1">
          <UserCheck className="w-7 h-7 text-art-orange shrink-0" />
          <h2 className="font-display font-black text-xl uppercase text-art-text">
            {language === 'ca' ? 'Qui ets tu?' : language === 'en' ? 'Who are you?' : '¿Y tú quién ere\'?'}
          </h2>
        </div>

        {firebaseUser.email && (
          <p className="text-xs text-art-text/60 font-mono mb-4">
            {language === 'ca' ? 'Connectat com:' : language === 'en' ? 'Signed in as:' : 'Metío como:'} <strong>{firebaseUser.email}</strong>
          </p>
        )}
        <p className="text-xs text-art-text/70 mb-5 font-semibold">
          {language === 'ca' ? 'Selecciona el teu personatge per vincular-lo al teu compte Google. Només cal fer-ho una vegada.' : language === 'en' ? 'Select your character to link it to your Google account. You only need to do this once.' : 'Selecsiona tu jeto pa\' vincularlo a tu cuenta Google. Solo una vé\'.'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[320px] overflow-y-auto pr-1">
          {members.map(m => {
            const alreadyLinked = !!m.googleUid && m.googleUid !== firebaseUser.uid;
            return (
              <button
                key={m.id}
                type="button"
                disabled={alreadyLinked}
                onClick={() => handleLinkMember(m.id)}
                className={`group p-3 border-2 flex flex-col items-center gap-2 text-center transition-all rounded-none select-none
                  ${alreadyLinked
                    ? 'border-[#2d2d2d]/20 bg-gray-100 opacity-50 cursor-not-allowed'
                    : 'border-[#2d2d2d] bg-white hover:bg-[#fdfaf2] cursor-pointer shadow-[3px_3px_0px_0px_#2d2d2d] hover:translate-y-[-1px] active:translate-y-0'
                  }`}
              >
                <div className="w-11 h-11 rounded-full border-2 border-[#2d2d2d] bg-white flex items-center justify-center text-xl shrink-0">
                  {m.avatarUrl}
                </div>
                <div>
                  <h3 className="font-black text-xs text-art-text uppercase group-hover:text-art-orange transition-colors">{m.name}</h3>
                  {alreadyLinked && <p className="text-[9px] text-art-text/40 font-mono">Ja vinculat</p>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t-2 border-[#2d2d2d]/10 flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-art-text/50 hover:text-art-text font-bold uppercase transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            {language === 'ca' ? 'Sortir' : language === 'en' ? 'Sign out' : 'Salí'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // 6. Main App rendering with chosen character loaded
  return (
    <div className="min-h-screen bg-[#fdfaf2] text-art-text font-sans flex flex-col justify-between" id="full-app-shell">

      {/* Modal "Qui ets tu?" overlay */}
      {WhoAreYouModal}

      {/* Tutorial onboarding — primera vegada */}
      {showTutorial && (
        <TutorialOverlay
          language={language}
          memberName={members.find(m => m.id === activeMemberId)?.name || ''}
          onFinish={handleFinishTutorial}
        />
      )}
      
      {/* Top Banner Header */}
      <header className="bg-white text-art-text border-b-4 border-[#2d2d2d] sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Sunset className="w-8 h-8 text-art-orange animate-pulse shrink-0" />
            <div>
              <h1 className="font-display font-black text-base sm:text-lg tracking-tight uppercase flex items-center gap-1.5 justify-center sm:justify-start">
                {t('appTitle', language)}
              </h1>
              <p className="text-[10px] text-art-text/60 font-mono font-black mt-0.5 leading-none">{t('appSubtitle', language)}</p>
            </div>
          </div>

          {/* Controls right-side (Switcher + Language flags) */}
          <div className="flex items-center flex-wrap justify-center gap-3">
            
            {/* Flags toggle */}
            <div className="flex p-0.5 bg-white rounded-none border-2 border-[#2d2d2d] text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setLanguage('ca')}
                className={`px-2 py-1 rounded-none transition-all cursor-pointer ${language === 'ca' ? 'bg-art-orange text-white' : 'text-art-text/50 hover:text-art-text'}`}
              >
                CAT 🗳️
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-none transition-all cursor-pointer ${language === 'en' ? 'bg-art-orange text-white' : 'text-art-text/50 hover:text-art-text'}`}
              >
                ENG 🇬🇧
              </button>
              <button
                type="button"
                onClick={() => setLanguage('an')}
                className={`px-2 py-1 rounded-none transition-all cursor-pointer ${language === 'an' ? 'bg-art-orange text-white' : 'text-art-text/50 hover:text-art-text'}`}
              >
                AND 💃
              </button>
            </div>

            {/* Connected persona + logout */}
            {activeMember && (
              <div className="flex items-center gap-2 bg-white border-2 border-[#2d2d2d] pl-2 pr-3 py-1 rounded-none text-xs font-black uppercase text-art-text shadow-[2px_2px_0px_0px_#2d2d2d]">
                {/* Micro Avatar */}
                <div className="w-5 h-5 rounded-full border border-[#2d2d2d] bg-white flex items-center justify-center text-xs shadow-3xs shrink-0 select-none">
                  {activeMember.avatarUrl}
                </div>

                <span className="font-black text-art-text truncate max-w-[90px]" title={activeMember.nickname}>
                  {activeMember.nickname || activeMember.name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[9px] font-black text-art-orange ml-1.5 hover:underline cursor-pointer uppercase tracking-wider flex items-center gap-0.5"
                  title={language === 'ca' ? 'Tancar sessió' : language === 'en' ? 'Sign out' : 'Salí'}
                >
                  <LogOut className="w-3 h-3" />
                  [{language === 'ca' ? 'Sortir' : language === 'en' ? 'Sign out' : 'Salí'}]
                </button>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Main Container tabs layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Dynamic navigation bar inside app */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1.5 bg-[#fdfaf2] border-2 border-[#2d2d2d] rounded-none p-1.5 shadow-[4px_4px_0px_0px_#2d2d2d] max-w-full justify-start md:justify-center">
          {(['dashboard', 'expenses', 'plans', 'recomanacions', 'sightseeing', 'games', 'profiles'] as const).map((tab) => {
            const labelKey = `nav${tab.charAt(0).toUpperCase() + tab.slice(1)}`;
            const isTabSelected = activeTab === tab;

            const tabIcon = () => {
              switch (tab) {
                case 'dashboard': return <Sunset className="w-4 h-4" />;
                case 'expenses': return <Coins className="w-4 h-4" />;
                case 'plans': return <Calendar className="w-4 h-4" />;
                case 'recomanacions': return <Compass className="w-4 h-4" />;
                case 'sightseeing': return <MapPin className="w-4 h-4" />;
                case 'games': return <Dices className="w-4 h-4" />;
                case 'profiles': return <Users className="w-4 h-4" />;
              }
            };

            const tabLabel = () => {
              if (tab === 'recomanacions') {
                return language === 'ca' ? 'Recomanacions' : language === 'en' ? 'Recommendations' : 'Recomanasione\'';
              }
              return t(labelKey, language);
            };

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-2 border-2 border-[#2d2d2d] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 select-none whitespace-nowrap cursor-pointer rounded-none ${isTabSelected ? 'bg-art-orange text-white shadow-[2px_2px_0px_0px_#2d2d2d]' : 'bg-white text-art-text hover:bg-art-bg'}`}
              >
                {tabIcon()}
                <span>{tabLabel()}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab contents wrapper */}
        <div className="flex-1">
          
          {/* 1. DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6 animate-fadeIn" id="dashboard-view-panel">
              
              {/* iOS Mobile App/PWA Install Guide (Brutalist Style) */}
              {!dismissedPwaGuide && (
                <div className="bg-[#f2ece2] border-2 border-[#2d2d2d] p-5 shadow-[4px_4px_0px_0px_#2d2d2d] flex flex-col sm:flex-row items-start gap-4 relative rounded-none animate-fadeIn">
                  <div className="bg-art-yellow p-3 border-2 border-[#2d2d2d] text-art-text shrink-0 text-xl font-bold rounded-none select-none">
                    📲
                  </div>
                  <div className="flex-1 pr-6">
                    <h4 className="font-display font-black text-xs uppercase text-art-text tracking-wide">
                      {language === 'ca' ? '💡 Porta Alacant 2026 al teu iPhone!' : language === 'en' ? '💡 Add Alacant 2026 to your iPhone!' : '💡 ¡Mete Alacant 2026 en tu móvil!'}
                    </h4>
                    <p className="text-[11px] font-semibold text-art-text/80 leading-relaxed mt-1">
                      {language === 'ca' ? (
                        <>Toca el botó de <strong>Compartir 📤</strong> a la barra inferior de Safari, i selecciona <strong>'Afegir a la pantalla d'inici' 📲</strong> per tenir-ho com una aplicació nativa de veritat!</>
                      ) : language === 'en' ? (
                        <>Tap the <strong>Share button 📤</strong> in iPhone's Safari browser, then click <strong>'Add to Home Screen' 📲</strong> to install this web console like a real native app!</>
                      ) : (
                        <>¡Ponlo flamenquito en tu pantalla d'inicio canija! Dale a <strong>Compartir 📤</strong> en er Safari, y búscate <strong>'Añadir a pantalla de inicio' 📲</strong> pa' vacilar de App nativeca!</>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissedPwaGuide(true)}
                    className="absolute top-3 right-3 text-art-text/60 hover:text-art-text font-black text-sm p-1 cursor-pointer select-none border border-transparent hover:border-[#2d2d2d] hover:bg-white transition-all rounded-none"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* Welcome Jumbotron Banner */}
              <div className="bg-[#2d2d2d] rounded-none p-6 sm:p-8 text-white relative overflow-hidden shadow-[6px_6px_0px_0px_#FF6321] border-2 border-[#2d2d2d]">
                
                <div className="relative z-10 max-w-xl">
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-art-orange px-2.5 py-1 border-2 border-[#2d2d2d] whitespace-nowrap text-white">
                    {t('tripDates', language)}
                  </span>
                  
                  <h2 className="text-2xl sm:text-4xl font-display font-black uppercase mt-3 tracking-tight text-white">
                    {language === 'ca' 
                      ? 'Que comenci l\'aventura d\'Alacant!' 
                      : language === 'en' 
                      ? 'Let the Alicante adventure unfold!' 
                      : '¡Que de empiese er relío flamenquito en Alacant!'}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed mt-2 font-medium">
                    {language === 'ca' 
                      ? `Hola ${activeMember?.nickname || activeMember?.name}! Estàs a la central col·lectiva. Sota tens els detalls del xalet d'Airbnb i els dies restants.` 
                      : language === 'en' 
                      ? `Hi ${activeMember?.nickname || activeMember?.name}! You are tuned into the group headquarters. Below is our Airbnb booking info and countdown.` 
                      : `¡Hola ${activeMember?.nickname || activeMember?.name}! Çintonisa con la peñita. Abaho tiene' er Airbnb de susharra y los día' de rampa.`}
                  </p>
                </div>
              </div>

              {/* Countdown & Quick summary items */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Real-time Countdown timer card */}
                <div className="bg-[#fdfaf2] border-2 border-[#2d2d2d] p-6 shadow-[4px_4px_0px_0px_#2d2d2d] flex flex-col justify-between gap-4 rounded-none">
                  <div>
                    <h3 className="text-art-text font-black uppercase tracking-wider text-[10px]">{t('daysRemaining', language)}</h3>
                    <div className="flex gap-2 items-center mt-3">
                      <div className="text-center">
                        <span className="text-3xl font-display font-black text-art-text">{timeLeft.days}</span>
                        <span className="text-[9px] uppercase font-mono font-black text-art-text/60 block mt-0.5">{language === 'ca' ? 'Dies' : language === 'en' ? 'Days' : 'Día\''}</span>
                      </div>
                      <span className="text-art-text font-black text-xl mb-4">:</span>
                      <div className="text-center">
                        <span className="text-3xl font-display font-black text-art-text">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="text-[9px] uppercase font-mono font-black text-art-text/60 block mt-0.5">{language === 'ca' ? 'Hor' : language === 'en' ? 'Hrs' : 'Hor\''}</span>
                      </div>
                      <span className="text-art-text font-black text-xl mb-4">:</span>
                      <div className="text-center">
                        <span className="text-3xl font-display font-black text-art-text">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="text-[9px] uppercase font-mono font-black text-art-text/60 block mt-0.5">Min</span>
                      </div>
                      <span className="text-art-text font-black text-xl mb-4">:</span>
                      <div className="text-center">
                        <span className="text-3xl font-display font-black text-art-text">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="text-[9px] uppercase font-mono font-black text-art-text/60 block mt-0.5">Seg</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono font-black text-art-text/60">
                    {language === 'ca' ? 'Data d\'inici: 22 de Juny del 2026' : language === 'en' ? 'Start date: June 22th, 2026' : 'Pistoletaso: 22 de Hunio d\'Alacant'}
                  </p>
                </div>

                {/* Airbnb Integration Link card */}
                <div className="bg-white border-2 border-[#2d2d2d] p-6 shadow-[4px_4px_0px_0px_#2d2d2d] rounded-none md:col-span-2 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-white bg-art-orange font-black border-2 border-[#2d2d2d] px-2.5 py-0.5 text-[9px] uppercase tracking-wider block w-fit rounded-none">
                      RESERVA AIRBNB
                    </span>
                    <h3 className="font-display font-black uppercase text-base md:text-lg text-art-text mt-3">
                      {t('airbnbCardTitle', language)}
                    </h3>
                    <p className="text-xs text-art-text/75 mt-1 font-medium">
                      {t('airbnbCardDesc', language)}
                    </p>
                    <p className="text-[11px] text-art-text/50 font-mono font-bold italic mt-2.5 truncate">
                      https://www.airbnb.com/rooms/984807263791129906
                    </p>
                  </div>

                  <a
                    href="https://www.airbnb.com/rooms/984807263791129906"
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 w-full sm:w-auto py-3 px-5 border-2 border-[#2d2d2d] bg-art-yellow hover:bg-art-yellow/85 text-art-text font-black text-xs sm:text-sm shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-y-[-1px] flex items-center justify-center gap-2 cursor-pointer select-none transition-all rounded-none"
                  >
                    <span>{t('viewOnAirbnb', language)}</span>
                    <ExternalLink className="w-4 h-4 text-art-orange" />
                  </a>
                </div>

              </div>

              {/* Group overview statistics banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Total expenses summary */}
                <div className="bg-white border-2 border-[#2d2d2d] p-5 shadow-[3px_3px_0px_0px_#2d2d2d] rounded-none flex items-center gap-4">
                  <Coins className="text-white bg-art-orange p-2.5 w-11 h-11 border-2 border-[#2d2d2d] rounded-none shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-black text-art-text/40 tracking-wider font-mono">{t('statsTotalExpenses', language)}</span>
                    <h4 className="text-lg font-display font-black text-art-text mt-0.5">
                      {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </h4>
                  </div>
                </div>

                {/* Number of plans summary list */}
                <div className="bg-white border-2 border-[#2d2d2d] p-5 shadow-[3px_3px_0px_0px_#2d2d2d] rounded-none flex items-center gap-4">
                  <Calendar className="text-white bg-art-orange p-2.5 w-11 h-11 border-2 border-[#2d2d2d] rounded-none shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-black text-art-text/40 tracking-wider font-mono">{t('statsPlansCount', language)}</span>
                    <h4 className="text-lg font-display font-black text-art-text mt-0.5">
                      {plans.length}
                    </h4>
                  </div>
                </div>

                {/* Joined users count */}
                <div className="bg-white border-2 border-[#2d2d2d] p-5 shadow-[3px_3px_0px_0px_#2d2d2d] rounded-none flex items-center gap-4">
                  <Users className="text-white bg-art-orange p-2.5 w-11 h-11 border-2 border-[#2d2d2d] rounded-none shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-black text-art-text/40 tracking-wider font-mono">{t('statsMembers', language)}</span>
                    <h4 className="text-lg font-display font-black text-art-text mt-0.5">
                      {members.length}
                    </h4>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. EXPENSES VIEW */}
          {activeTab === 'expenses' && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="font-display font-black uppercase text-xl sm:text-2xl text-art-text flex items-center gap-2">
                  <Coins className="text-art-orange animate-bounce" />
                  {t('expenseTitle', language)}
                </h2>
                <p className="text-xs sm:text-sm text-art-text/70 mt-1">
                  {t('expenseSubtitle', language)}
                </p>
              </div>

              <ExpenseSplitter
                language={language}
                members={members}
                expenses={expenses}
                activeMemberId={activeMemberId}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                onResetExpenses={handleResetExpenses}
              />
            </div>
          )}

          {/* 3. PLANS VIEW */}
          {activeTab === 'plans' && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="font-display font-black uppercase text-xl sm:text-2xl text-art-text flex items-center gap-2">
                  <Calendar className="text-art-orange" />
                  {t('plansTitle', language)}
                </h2>
                <p className="text-xs sm:text-sm text-art-text/70 mt-1">
                  {t('plansSubtitle', language)}
                </p>
              </div>

              <ItineraryTimeline
                language={language}
                members={members}
                plans={plans}
                activeMemberId={activeMemberId}
                onAddPlan={handleAddPlan}
                onVotePlan={handleVotePlan}
                onToggleFavoritePlan={handleToggleFavoritePlan}
                prefillPlan={prefillPlan}
                onPrefillConsumed={() => setPrefillPlan(undefined)}
              />
            </div>
          )}

          {/* 3b. RECOMANACIONS VIEW */}
          {activeTab === 'recomanacions' && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="font-display font-black uppercase text-xl sm:text-2xl text-art-text flex items-center gap-2">
                  <Compass className="text-art-orange" />
                  {language === 'ca' ? 'Recomanacions' : language === 'en' ? 'Recommendations' : 'Recomanasione\''}
                </h2>
                <p className="text-xs sm:text-sm text-art-text/70 mt-1">
                  {language === 'ca' ? 'Bars, restaurants i excursions seleccionats per al viatge. Afegeix-los al pla amb un clic.'
                    : language === 'en' ? 'Curated bars, restaurants and activities for the trip. Add them to the itinerary with one click.'
                    : 'Bare\', re\'taurante\' y líos selesionao\' pa\' el viaje. Súmalos ar itinerario con un toque.'}
                </p>
              </div>
              <Recomanacions
                language={language}
                onAddToPlan={handleAddToPlanFromRec}
              />
            </div>
          )}

          {/* 4. SIGHTSEEING VIEW */}
          {activeTab === 'sightseeing' && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="font-display font-black uppercase text-xl sm:text-2xl text-art-text flex items-center gap-2">
                  <MapPin className="text-art-orange animate-pulse" />
                  {t('sightTitle', language)}
                </h2>
                <p className="text-xs sm:text-sm text-art-text/70 mt-1">
                  {t('sightSubtitle', language)}
                </p>
              </div>

              <SightseeingGrid
                language={language}
                items={defaultSightseeings}
              />
            </div>
          )}

          {/* 5. GAMES & WHEEL VIEW */}
          {activeTab === 'games' && (
            <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 py-2 animate-fadeIn" id="games-view-panel">
              
              {/* Left Side: Spinning Wheel */}
              <div className="flex-1 flex flex-col gap-4">
                <h2 className="font-display font-black uppercase text-lg text-art-text flex items-center gap-2">
                  <Dices className="text-art-orange" />
                  {t('spinWheelTitle', language)}
                </h2>
                <p className="text-xs text-art-text/70 max-w-md font-medium">
                  {language === 'ca' 
                    ? 'Trieu la llista de càstigs o els noms dels amics, i doneu-li canya per saber a qui li toca cuinar, netejar o comprar gel!' 
                    : language === 'en' 
                    ? 'Toggle between the list of house punishments or friends list. Let chance decide who gets tomorrow\'s tasks!' 
                    : 'Dale un viajesito a er cacharro pa capotear a quién le caé er fregoteo, la compra o er ventiló\'.'}
                </p>

                <SpinningWheel
                  language={language}
                  members={members}
                  punishments={punishmentOptions.map(o => o.text[language])}
                />
              </div>

              {/* Right Side: Simple Polls / Decisions */}
              <div className="flex-1 flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <h2 className="font-display font-black uppercase text-lg text-art-text flex items-center gap-1.5">
                    <Vote className="text-art-orange" />
                    {t('subVotesTitle', language)}
                  </h2>

                  <button
                    type="button"
                    onClick={() => setIsCreatingPoll(!isCreatingPoll)}
                    className="py-1.5 px-3 border-2 border-[#2d2d2d] bg-white text-art-text hover:bg-art-bg/25 font-black uppercase text-xs shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-y-[-1px] transition-all cursor-pointer rounded-none"
                  >
                    {t('createVoteBtn', language)}
                  </button>
                </div>

                {/* Poll Creator Form */}
                {isCreatingPoll && (
                  <form onSubmit={handleCreatePoll} className="bg-white rounded-none p-5 border-2 border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] flex flex-col gap-3 text-xs animate-fadeIn">
                    <div>
                      <label htmlFor="poll-question-ca" className="block font-black uppercase tracking-wider text-art-text/60 mb-1">
                        {language === 'ca' ? 'Pregunta (Català)' : language === 'en' ? 'Question (Catalan)' : 'Pregunta (Català)'}:
                      </label>
                      <input
                        id="poll-question-ca"
                        type="text"
                        required
                        value={newPollQuestionCa}
                        onChange={(e) => {
                          setNewPollQuestionCa(e.target.value);
                          // Auto populate EN and AN if they are empty
                          if (!newPollQuestionEn) setNewPollQuestionEn(e.target.value);
                          if (!newPollQuestionAn) setNewPollQuestionAn(e.target.value);
                        }}
                        className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-none focus:outline-hidden"
                        placeholder="ex: On sopem dijous?"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="poll-question-en" className="block font-black uppercase tracking-wider text-art-text/60 mb-1">Pregunta (English):</label>
                        <input
                          id="poll-question-en"
                          type="text"
                          value={newPollQuestionEn}
                          onChange={(e) => setNewPollQuestionEn(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-none focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label htmlFor="poll-question-an" className="block font-black uppercase tracking-wider text-art-text/60 mb-1">Pregunta (Andalúz):</label>
                        <input
                          id="poll-question-an"
                          type="text"
                          value={newPollQuestionAn}
                          onChange={(e) => setNewPollQuestionAn(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-none focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="font-black uppercase tracking-wider text-art-text/60">Options:</span>
                      {pollOptionsInput.map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => {
                              const updated = [...pollOptionsInput];
                              updated[oIdx] = e.target.value;
                              setPollOptionsInput(updated);
                            }}
                            placeholder={`${t('pollOption', language)} ${oIdx + 1}`}
                            className="flex-1 px-3 py-1.5 border-2 border-[#2d2d2d] rounded-none text-xs focus:outline-hidden bg-white"
                          />
                          {pollOptionsInput.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setPollOptionsInput(pollOptionsInput.filter((_, i) => i !== oIdx))}
                              className="text-rose-500 bg-rose-50 hover:bg-rose-100 border-2 border-[#2d2d2d] px-2 rounded-none font-bold"
                            >
                              -
                            </button>
                          )}
                        </div>
                      ))}

                      {pollOptionsInput.length < 5 && (
                        <button
                          type="button"
                          onClick={() => setPollOptionsInput([...pollOptionsInput, ''])}
                          className="text-xs self-start text-art-orange font-black uppercase hover:underline"
                        >
                          + {t('addOption', language)}
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end mt-2 pt-2 border-t-2 border-[#2d2d2d]/10">
                      <button
                        type="button"
                        onClick={() => setIsCreatingPoll(false)}
                        className="py-2 px-3 border-2 border-transparent text-art-text/60 font-black uppercase tracking-wider hover:text-art-text"
                      >
                        {t('cancelBtn', language)}
                      </button>
                      <button
                        type="submit"
                        className="py-2 px-4 border-2 border-[#2d2d2d] bg-art-orange text-white font-black uppercase tracking-wider hover:bg-art-orange/85 shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-y-[-1px] cursor-pointer"
                      >
                        {language === 'ca' ? 'Llançar Votació' : language === 'en' ? 'Create Poll' : 'Lanzá Voto'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Poll List cards rendering */}
                <div className="flex flex-col gap-4">
                  {votes.map((poll) => {
                    const totalPollVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);

                    return (
                      <div key={poll.id} className="bg-white rounded-none border-2 border-[#2d2d2d] p-5 shadow-[4px_4px_0px_0px_#2d2d2d] flex flex-col gap-4 relative">
                        <div>
                          {/* Close poll & Delete poll trigger controls for creator */}
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[9px] uppercase font-mono font-bold text-art-text/50">
                              {language === 'ca' ? 'Pregunta de grup' : language === 'en' ? 'Democratic poll' : 'Encuesta flamenquita'}
                            </span>
                            
                            <div className="flex items-center gap-15">
                              <button
                                type="button"
                                onClick={() => handleToggleClosePoll(poll.id)}
                                className={`text-[10px] font-black border-2 border-[#2d2d2d] px-2 py-0.5 rounded-none uppercase transition-all select-none ${poll.closed ? 'bg-slate-200 text-slate-500 shadow-none' : 'bg-[#ffebee] text-rose-600 hover:bg-rose-100 shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-y-[-1px]'}`}
                              >
                                {poll.closed ? t('pollStatusClosed', language) : (language === 'ca' ? 'Tancar' : language === 'en' ? 'Close' : 'Cerrà')}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePoll(poll.id)}
                                className="text-slate-300 hover:text-rose-600 p-1.5 border border-transparent hover:border-[#2d2d2d] transition-all cursor-pointer"
                                title="Delete Poll"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-display font-black uppercase text-art-text text-sm mt-1">
                            {poll.question[language] || poll.question['ca']}
                          </h4>
                        </div>

                        {/* Options trigger/vote bars list */}
                        <div className="flex flex-col gap-2">
                          {poll.options.map((opt) => {
                            const optVoters = opt.votes || [];
                            const userHasVotedThisOpt = optVoters.includes(activeMemberId);
                            const optPercentage = totalPollVotes > 0 ? (optVoters.length / totalPollVotes) * 100 : 0;

                            return (
                              <button
                                key={opt.id}
                                type="button"
                                disabled={poll.closed}
                                onClick={() => handleVotePoll(poll.id, opt.id)}
                                className={`w-full text-left rounded-none p-3 border-2 relative overflow-hidden transition-all text-xs flex items-center justify-between gap-3 ${
                                  userHasVotedThisOpt 
                                    ? 'border-art-orange bg-art-orange/5 font-extrabold shadow-[2px_2px_0px_0px_#2d2d2d]' 
                                    : 'border-[#2d2d2d] hover:border-art-orange bg-white hover:translate-y-[-1px] shadow-[2px_2px_0px_0px_#2d2d2d] active:translate-y-0 active:shadow-[1px_1px_0px_0px_#2d2d2d]'
                                } ${poll.closed ? 'cursor-default opacity-85 shadow-none hover:translate-y-0 active:translate-y-0' : 'cursor-pointer select-none'}`}
                              >
                                {/* Percentage loading background visual bar */}
                                <div 
                                  className="absolute left-0 top-0 bottom-0 bg-art-orange/15 transition-all pointer-events-none" 
                                  style={{ width: `${optPercentage}%` }}
                                ></div>

                                <div className="relative z-10 flex items-center gap-2 font-bold uppercase text-art-text">
                                  {userHasVotedThisOpt && <Check className="w-3.5 h-3.5 text-art-orange stroke-[3px]" />}
                                  <span>{opt.text[language] || opt.text['ca']}</span>
                                </div>

                                <div className="text-right shrink-0 relative z-10 flex items-center gap-1.5">
                                  {/* Avatars tiny rows */}
                                  <div className="flex -space-x-1.5 py-0.5 max-w-[80px] overflow-hidden">
                                    {optVoters.map((voterId) => {
                                      const uObj = members.find(m => m.id === voterId);
                                      return uObj ? (
                                        <span key={voterId} title={uObj.nickname} className="w-5 h-5 rounded-full bg-white border border-[#2d2d2d] flex items-center justify-center text-[10px] shadow-3xs">{uObj.avatarUrl}</span>
                                      ) : null;
                                    })}
                                  </div>
                                  <span className="font-mono font-black text-art-text text-xs">
                                    {optVoters.length} ({Math.round(optPercentage)}%)
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Total prompt */}
                        <div className="text-[10px] font-mono text-art-text/70 uppercase border-2 border-[#2d2d2d] bg-[#fdfaf2] p-2.5 rounded-none flex justify-between items-center mt-1">
                          <span>
                            {language === 'ca' ? 'Democràcia activa' : language === 'en' ? 'Democratic poll' : 'Er parlamento'}: <strong>{totalPollVotes} {language === 'ca' ? 'vots' : language === 'en' ? 'votes' : 'voto\''}</strong>
                          </span>
                          <span>
                            {language === 'ca' ? 'Creat per' : language === 'en' ? 'By' : 'Lanzáo por'} <strong>{members.find(m => m.id === poll.createdBy)?.name || poll.createdBy}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* 6. PROFILES VIEW */}
          {activeTab === 'profiles' && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="font-display font-black uppercase text-xl sm:text-2xl text-art-text flex items-center gap-2">
                  <Users className="text-art-orange" />
                  {t('profilesTitle', language)}
                </h2>
                <p className="text-xs sm:text-sm text-art-text/70 mt-1">
                  {t('profilesSubtitle', language)}
                </p>
              </div>

              <ProfileManager
                language={language}
                members={members}
                activeMemberId={activeMemberId}
                onSelectMember={(id) => setActiveMemberId(id)}
                onUpdateMember={handleUpdateMember}
              />
            </div>
          )}

        </div>

      </main>

      {/* Page Footer */}
      <footer className="bg-[#2d2d2d] text-white/70 border-t-4 border-[#2d2d2d] py-6 mt-8">
        <div className="w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-center md:text-left">
          
          <div>
            <p className="font-black text-white uppercase tracking-wider text-sm">
              {t('allRights', language)} — Alacant 2026 🌴☀️
            </p>
            <p className="text-[10px] text-white/50 mt-1.5 font-mono">
              {language === 'ca' 
                ? 'Control de gastos compartits gratuït i 100% lliure d\'anuncis.' 
                : language === 'en' 
                ? 'Your secure, non-commercial offline-first trip coordinator hub.' 
                : 'Er bote flamenquito y el arrame de biles grato, çin publicidá\'.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-white/40">{language === 'ca' ? 'Ràpid:' : language === 'en' ? 'Link:' : 'Ar jale:'}</span>
            <a
              href="https://www.airbnb.com/rooms/984807263791129906"
              target="_blank"
              rel="noreferrer"
              className="text-art-yellow hover:text-art-yellow/80 underline decoration-art-yellow/20 underline-offset-4 font-black uppercase tracking-wider flex items-center gap-1 select-none transition-all active:scale-95"
            >
              <span>Airbnb Original</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
}
