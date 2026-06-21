import React, { useState, useEffect } from 'react';
import { Language, Member, Expense, PlanItem, VoteItem, WheelConfig, DrinkCount, ShoppingItem, Recipe, PackingItem } from './types';
import { t } from './translations';
import {
  defaultMembers,
  defaultExpenses,
  defaultPlans,
  defaultVotes,
  defaultSightseeings,
  defaultShoppingItems,
  defaultRecipes,
  defaultPackingItems,
  punishmentOptions
} from './data';
import { SpinningWheel } from './components/SpinningWheel';
import { ExpenseSplitter } from './components/ExpenseSplitter';
import { ItineraryTimeline } from './components/ItineraryTimeline';
import { SightseeingGrid } from './components/SightseeingGrid';
import { MyProfile } from './components/MyProfile';
import { ShoppingList } from './components/ShoppingList';
import { Receptes } from './components/Receptes';
import { PackingList } from './components/PackingList';
import { TutorialOverlay } from './components/TutorialOverlay';
import { SupportWidget, CandleDoc } from './components/SupportWidget';
import { Recomanacions } from './components/Recomanacions';
import { db, auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence, browserSessionPersistence, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
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
  Compass,
  Thermometer,
  Star,
  Beer,
  Wine,
  GlassWater,
  MoreHorizontal,
  ShoppingCart,
  Backpack
} from 'lucide-react';



const TRIP_NIGHTS = ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26'];

export default function App() {
  // 0. Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null | undefined>(undefined); // undefined = loading
  const [authLoading, setAuthLoading] = useState(false);
  const [showWhoAreYou, setShowWhoAreYou] = useState(false); // Modal "Qui ets tu?"
  const [showMoreMenu, setShowMoreMenu] = useState(false); // Mobile "Més" drawer
  const [showTutorial, setShowTutorial] = useState(false); // Tutorial onboarding
  // Profile setup (between "Qui ets tu?" and tutorial)
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState<string>('');
  const [setupAvatar, setSetupAvatar] = useState('');
  const [setupNickname, setSetupNickname] = useState('');
  const [setupRole, setSetupRole] = useState('');

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
  const [wheels, setWheels] = useState<WheelConfig[]>([]);

  // New features state
  const [drinks, setDrinks] = useState<DrinkCount[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [packingItems, setPackingItems]     = useState<PackingItem[]>([]);
  const [customRecipes, setCustomRecipes]  = useState<Recipe[]>([]);
  const [supportCandles, setSupportCandles] = useState<CandleDoc[]>([]);
  const [alacantTemp, setAlacantTemp] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number | null>(null);

  // 4. Tab selection state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'plans' | 'recomanacions' | 'sightseeing' | 'games' | 'begudes' | 'profiles' | 'compra' | 'receptes' | 'portar'>('dashboard');

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
    // Set local persistence once on load (must be done before any sign-in attempt)
    // Try localStorage (normal), fall back to sessionStorage (incognito/Safari)
    setPersistence(auth, browserLocalPersistence).catch(() => {
      setPersistence(auth, browserSessionPersistence).catch((e) => console.warn('[auth] setPersistence:', e));
    });

    // Handle redirect result (when coming back from signInWithRedirect fallback)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('[auth] Redirect sign-in succeeded:', result.user.email);
        }
      })
      .catch((err) => {
        console.warn('[auth] getRedirectResult:', err?.code ?? err);
      });

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


  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      // Popup first (fast UX in normal browsers)
      await signInWithPopup(auth, googleProvider);
      setAuthLoading(false);
    } catch (err: any) {
      // Any popup failure (blocked, incognito cookie issue, cancelled) → redirect
      console.warn('[auth] Popup failed, falling back to redirect:', err?.code);
      try {
        await signInWithRedirect(auth, googleProvider);
        // redirect navigates away — setAuthLoading not needed
      } catch (redirectErr: any) {
        console.error('[auth] Redirect also failed:', redirectErr?.code);
        setAuthLoading(false);
      }
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    setActiveMemberId('');
    setShowWhoAreYou(false);
  };

  // Step 1: user picks who they are → open profile setup
  const handlePickMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    setPendingMemberId(memberId);
    setSetupAvatar(member.avatarUrl);
    setSetupNickname(member.nickname || member.name);
    setSetupRole(member.role);
    setShowWhoAreYou(false);
    setShowProfileSetup(true);
  };

  // Step 2: user confirms their profile → link to Google + maybe show tutorial
  const [profileSetupError, setProfileSetupError] = useState<string | null>(null);
  const [profileSetupLoading, setProfileSetupLoading] = useState(false);

  const handleConfirmProfileSetup = async () => {
    if (!firebaseUser || !pendingMemberId) return;
    setProfileSetupLoading(true);
    setProfileSetupError(null);
    try {
      await setDoc(doc(db, 'members', pendingMemberId), {
        googleUid: firebaseUser.uid,
        avatarUrl: setupAvatar,
        nickname: setupNickname.trim() || setupNickname,
        role: setupRole,
      }, { merge: true });
      setActiveMemberId(pendingMemberId);
      setShowProfileSetup(false);
      setProfileSetupLoading(false);
      const tutorialKey = `alicante_tutorial_done_${pendingMemberId}`;
      if (!localStorage.getItem(tutorialKey)) {
        setShowTutorial(true);
      }
    } catch (err: any) {
      console.error('[profile] updateDoc failed:', err?.code, err?.message);
      setProfileSetupLoading(false);
      setProfileSetupError(
        err?.code === 'permission-denied'
          ? 'Sense permís. Tanca sessió i torna a entrar.'
          : `Error en guardar (${err?.code ?? 'unknown'}). Comprova la connexió.`
      );
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
  // Only start subscriptions AFTER authentication — Firestore rules require request.auth != null
  useEffect(() => {
    if (!firebaseUser) return; // Don't subscribe before the user is authenticated

    // One-time migrations (run once per browser, tracked in localStorage)
    // Migration v3: delete the old seeded default plans (p1-p6) — itinerary should start empty
    if (!localStorage.getItem('alicante_migration_clear_plans_v1')) {
      const oldPlanIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
      Promise.all(
        oldPlanIds.map(id => deleteDoc(doc(db, 'plans', id)).catch(() => {}))
      ).then(() => localStorage.setItem('alicante_migration_clear_plans_v1', 'true'));
    }

    if (!localStorage.getItem('alicante_migration_jade_v1')) {
      updateDoc(doc(db, 'members', 'amiga_eva'), { name: 'Jade', nickname: 'Jade la Misteriosa' })
        .then(() => localStorage.setItem('alicante_migration_jade_v1', 'true'))
        .catch(() => {}); // Silently ignore if doc doesn't exist yet
    }
    if (!localStorage.getItem('alicante_migration_clear_votes_v1')) {
      getDocs(collection(db, 'plans')).then((snap) => {
        snap.forEach((d) => {
          updateDoc(doc(db, 'plans', d.id), { votes: [], favorites: [] }).catch(() => {});
        });
        localStorage.setItem('alicante_migration_clear_votes_v1', 'true');
      }).catch(() => {});
    }

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
      console.warn('[members] Firestore error (check rules/auth):', error.message);
    });

    // 2. Sync Expenses (no seeding — start empty in production)
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Expense);
      });
      setExpenses(list);
    }, (error) => {
      console.warn('[expenses] Firestore error (check rules/auth):', error.message);
    });

    // 3. Sync Plans (no seeding — itinerary starts empty, users add their own plans)
    const unsubPlans = onSnapshot(collection(db, 'plans'), (snapshot) => {
      const list: PlanItem[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as PlanItem);
      });
      setPlans(list);
    }, (error) => {
      console.warn('[plans] Firestore error (check rules/auth):', error.message);
    });

    // 4. Sync Votes / Polls (no seeding — start empty in production)
    const unsubVotes = onSnapshot(collection(db, 'votes'), (snapshot) => {
      const list: VoteItem[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as VoteItem);
      });
      setVotes(list);
    }, (error) => {
      console.warn('[votes] Firestore error (check rules/auth):', error.message);
    });

    // 5. Sync custom Wheels
    const unsubWheels = onSnapshot(collection(db, 'wheels'), (snapshot) => {
      const list: WheelConfig[] = [];
      snapshot.forEach((d) => { list.push(d.data() as WheelConfig); });
      setWheels(list);
    }, (error) => { console.warn('[wheels] Firestore error:', error.message); });

    // 6. Sync Drinks counter
    const unsubDrinks = onSnapshot(collection(db, 'drinks'), (snapshot) => {
      const list: DrinkCount[] = [];
      snapshot.forEach((d) => list.push(d.data() as DrinkCount));
      setDrinks(list);
    }, (error) => console.warn('[drinks] Firestore error:', error.message));


    // 7. Sync Shopping list (no seeding — starts empty, users add their own items)
    const unsubShopping = onSnapshot(collection(db, 'shopping'), (snapshot) => {
      const list: ShoppingItem[] = [];
      snapshot.forEach((d) => list.push(d.data() as ShoppingItem));
      setShoppingItems(list);
    }, (error) => console.warn('[shopping] Firestore error:', error.message));

    // 8. Sync Packing list (no seeding — starts empty)
    const unsubPacking = onSnapshot(collection(db, 'packing'), (snapshot) => {
      const list: PackingItem[] = [];
      snapshot.forEach((d) => list.push(d.data() as PackingItem));
      setPackingItems(list);
    }, (error) => console.warn('[packing] Firestore error:', error.message));

    // 9. Sync custom Recipes (user-added recipes, stored in Firestore)
    const unsubRecipes = onSnapshot(collection(db, 'recipes'), (snapshot) => {
      const list: Recipe[] = [];
      snapshot.forEach((d) => list.push(d.data() as Recipe));
      setCustomRecipes(list);
    }, (error) => console.warn('[recipes] Firestore error:', error.message));

    // 10. Sync support candles (temporary widget)
    const unsubCandles = onSnapshot(collection(db, 'supportCandles'), (snapshot) => {
      const list: CandleDoc[] = [];
      snapshot.forEach((d) => list.push(d.data() as CandleDoc));
      setSupportCandles(list);
    }, (error) => console.warn('[supportCandles] Firestore error:', error.message));

    return () => {
      unsubMembers();
      unsubExpenses();
      unsubPlans();
      unsubVotes();
      unsubWheels();
      unsubDrinks();
      unsubShopping();
      unsubPacking();
      unsubRecipes();
      unsubCandles();
    };
  }, [firebaseUser]);

  // Compute countdown to June 22th, 2026
  useEffect(() => {
    const targetDate = new Date('2026-06-22T00:00:00');
    
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


  // Fetch temperatura real d'Alacant via Open-Meteo (gratuïta, sense API key)
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=38.3453&longitude=-0.4831&current_weather=true')
      .then(r => r.json())
      .then(data => { setAlacantTemp(Math.round(data.current_weather?.temperature ?? null)); setWeatherCode(data.current_weather?.weathercode ?? null); })
      .catch(() => {});
  }, []);

  // ── Drink handlers ──────────────────────────────────────────────────────────
  const handleAddDrink = async (type: 'birres' | 'sangries' | 'cubates') => {
    if (!activeMemberId) return;
    const existing = drinks.find(d => d.memberId === activeMemberId);
    const updated: DrinkCount = existing
      ? { ...existing, [type]: (existing[type] || 0) + 1 }
      : { memberId: activeMemberId, birres: 0, sangries: 0, cubates: 0, [type]: 1 };
    // Optimistic update so buttons feel instant
    setDrinks(prev => prev.some(d => d.memberId === activeMemberId)
      ? prev.map(d => d.memberId === activeMemberId ? updated : d)
      : [...prev, updated]);
    try {
      await setDoc(doc(db, 'drinks', activeMemberId), updated);
    } catch (err) {
      console.error('[drinks] Error adding drink:', err);
      // Revert on failure
      setDrinks(prev => existing
        ? prev.map(d => d.memberId === activeMemberId ? existing! : d)
        : prev.filter(d => d.memberId !== activeMemberId));
    }
  };

  const handleRemoveDrink = async (type: 'birres' | 'sangries' | 'cubates') => {
    if (!activeMemberId) return;
    const existing = drinks.find(d => d.memberId === activeMemberId);
    if (!existing || (existing[type] || 0) <= 0) return;
    const updated = { ...existing, [type]: (existing[type] || 0) - 1 };
    // Optimistic update
    setDrinks(prev => prev.map(d => d.memberId === activeMemberId ? updated : d));
    try {
      await setDoc(doc(db, 'drinks', activeMemberId), updated);
    } catch (err) {
      console.error('[drinks] Error removing drink:', err);
      // Revert on failure
      setDrinks(prev => prev.map(d => d.memberId === activeMemberId ? existing! : d));
    }
  };

  // ── Bingo handlers ──────────────────────────────────────────────────────────

  // Handlers for Expenses (cloud-synchronized)
  // ── Shopping handlers ─────────────────────────────────────────────────────
  const handleToggleShoppingItem = async (id: string) => {
    const item = shoppingItems.find(i => i.id === id);
    if (!item) return;
    const updated = { ...item, isChecked: !item.isChecked };
    setShoppingItems(prev => prev.map(i => i.id === id ? updated : i));
    try {
      await setDoc(doc(db, 'shopping', id), updated);
    } catch (err) { console.error('[shopping] toggle error:', err); }
  };

  const handleAddShoppingItem = async (item: Omit<ShoppingItem, 'id'>) => {
    const id = 'sh_' + Date.now();
    const full: ShoppingItem = { ...item, id };
    setShoppingItems(prev => [...prev, full]);
    try {
      await setDoc(doc(db, 'shopping', id), full);
    } catch (err) { console.error('[shopping] add error:', err); }
  };

  const handleDeleteShoppingItem = async (id: string) => {
    setShoppingItems(prev => prev.filter(i => i.id !== id));
    try {
      await deleteDoc(doc(db, 'shopping', id));
    } catch (err) { console.error('[shopping] delete error:', err); }
  };

  // ── Packing handlers ────────────────────────────────────────────────────────
  const handleAddPackingItem = async (item: Omit<PackingItem, 'id'>) => {
    const id = 'pack_' + Date.now();
    const full: PackingItem = { ...item, id };
    setPackingItems(prev => [...prev, full]);
    try {
      await setDoc(doc(db, 'packing', id), full);
    } catch (err) { console.error('[packing] add error:', err); }
  };

  const handleDeletePackingItem = async (id: string) => {
    setPackingItems(prev => prev.filter(i => i.id !== id));
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'packing', id));
    } catch (err) { console.error('[packing] delete error:', err); }
  };

  const handleTogglePackingItem = async (id: string) => {
    const item = packingItems.find(i => i.id === id);
    if (!item) return;
    const updated = { ...item, isChecked: !item.isChecked };
    setPackingItems(prev => prev.map(i => i.id === id ? updated : i));
    try {
      await setDoc(doc(db, 'packing', id), updated);
    } catch (err) { console.error('[packing] toggle error:', err); }
  };

  // ── Recipes: add/delete custom recipes ────────────────────────────────────────
  const handleAddRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    const id = 'recipe_' + Date.now();
    const full: Recipe = { ...recipe, id };
    setCustomRecipes(prev => [full, ...prev]);
    try {
      await setDoc(doc(db, 'recipes', id), full);
    } catch (err) { console.error('[recipes] add error:', err); }
  };

  const handleDeleteRecipe = async (id: string) => {
    setCustomRecipes(prev => prev.filter(r => r.id !== id));
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'recipes', id));
    } catch (err) { console.error('[recipes] delete error:', err); }
  };

  // ── Support candles ────────────────────────────────────────────────────────
  const handleToggleCandle = async (memberId: string, currentlyLit: boolean) => {
    const newLit = !currentlyLit;
    const litAt = newLit ? Date.now() : null;
    setSupportCandles(prev => {
      const exists = prev.find(c => c.memberId === memberId);
      if (exists) return prev.map(c => c.memberId === memberId ? { ...c, lit: newLit, litAt } : c);
      return [...prev, { memberId, lit: newLit, litAt }];
    });
    try {
      await setDoc(doc(db, 'supportCandles', memberId), { memberId, lit: newLit, litAt });
    } catch (err) { console.error('[candles] toggle error:', err); }
  };

  // ── Recipes: add ingredients to shopping ────────────────────────────────────
  const handleAddIngredientsToShopping = async (ingredients: string[], recipeName: string) => {
    const newItems: ShoppingItem[] = ingredients.map((ing, idx) => ({
      id: 'sh_rec_' + Date.now() + '_' + idx,
      text: ing,
      emoji: '🍴',
      category: 'altres',
      isChecked: false,
      addedBy: activeMemberId,
    }));
    setShoppingItems(prev => [...prev, ...newItems]);
    try {
      await Promise.all(newItems.map(item => setDoc(doc(db, 'shopping', item.id), item)));
    } catch (err) { console.error('[shopping] addIngredients error:', err); }
  };

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

  const handleDeletePlan = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'plans', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `plans/${id}`);
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

  const handleAddMember = async (member: Omit<Member, 'id'>) => {
    const id = 'member_' + Date.now();
    try {
      await setDoc(doc(db, 'members', id), { ...member, id });
      setActiveMemberId(id);
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

  // Wheel CRUD
  const handleSaveWheel = async (wheel: Omit<WheelConfig, 'id'>) => {
    const id = `wheel_${Date.now()}`;
    try {
      await setDoc(doc(db, 'wheels', id), { ...wheel, id });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'wheels');
    }
  };

  const handleUpdateWheel = async (id: string, updated: Partial<WheelConfig>) => {
    try {
      await updateDoc(doc(db, 'wheels', id), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `wheels/${id}`);
    }
  };

  const handleDeleteWheel = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'wheels', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `wheels/${id}`);
    }
  };

  const activeMember = members.find(m => m.id === activeMemberId);

  // 5a. Loading Firebase Auth
  if (firebaseUser === undefined) {
    return (
      <div className="min-h-screen bg-[#FFF4E6] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#2A1A12] flex flex-col justify-center items-center p-6 relative overflow-hidden" id="login-screen-overlay">

        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-[#FF5A1F]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#E0290B]/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#FFD23F]/5 blur-3xl pointer-events-none" />

        {/* Language switcher — outside card, on dark bg so white text is visible */}
        <div className="flex gap-1 mb-6 bg-white/10 p-1 rounded-2xl z-10">
          <button type="button" onClick={() => setLanguage('ca')} className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all cursor-pointer rounded-xl ${language === 'ca' ? 'bg-[#FFD23F] text-[#2A1A12]' : 'text-white/50 hover:text-white'}`}>Català</button>
          <button type="button" onClick={() => setLanguage('en')} className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all cursor-pointer rounded-xl ${language === 'en' ? 'bg-[#FFD23F] text-[#2A1A12]' : 'text-white/50 hover:text-white'}`}>English</button>
          <button type="button" onClick={() => setLanguage('an')} className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all cursor-pointer rounded-xl ${language === 'an' ? 'bg-[#FFD23F] text-[#2A1A12]' : 'text-white/50 hover:text-white'}`}>Andaluz</button>
        </div>

        <div className="w-full max-w-sm bg-[#FFF4E6] border border-[#FFD9B8] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.40)] relative z-10 rounded-3xl text-center">

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-[#E0290B] flex items-center justify-center shadow-[0_4px_16px_rgba(224,41,11,0.40)]">
              <span className="text-3xl">🔥</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-art-text uppercase leading-none">
            Alacant 2026
          </h1>
          <p className="text-[#2A1A12]/50 font-mono text-[10px] uppercase tracking-widest mt-2">
            Hogueres · 22–26 juny
          </p>
          <p className="text-[#2A1A12]/60 font-semibold text-xs mt-3 max-w-xs mx-auto leading-relaxed">
            {language === 'ca' ? "El niu d'operacions col·lectiu dels amics per les Hogueras." : language === 'en' ? "Your squad hub for the Hogueras trip." : "El cuartel general de la peña pa las Hogueras."}
          </p>

          <div className="mt-6 mb-1">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#2A1A12] text-white rounded-2xl shadow-[0_4px_16px_rgba(42,26,18,0.30)] hover:bg-[#3D2518] hover:translate-y-[-2px] active:translate-y-0 transition-all cursor-pointer font-black text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <span className="animate-spin text-xl">⏳</span>
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>
                {language === 'ca' ? 'Entrar amb Google' : language === 'en' ? 'Sign in with Google' : 'Entrar con Google'}
              </span>
            </button>
          </div>

          <p className="text-[9px] text-art-text/30 mt-4 font-mono uppercase tracking-wider">
            {language === 'ca' ? 'Només per als amics del grup · Gratuït' : language === 'en' ? 'Squad members only · Free' : 'Solo pa la peña · Gratis'}
          </p>
        </div>
      </div>
    );
  }

  // 5c. Modal "Qui ets tu?" — logged in but profile not linked yet
  const WhoAreYouModal = showWhoAreYou ? (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white border-2 border-[#FFD9B8] p-6 shadow-[0_8px_24px_rgba(42,26,18,0.15)] rounded-2xl">

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
                onClick={() => handlePickMember(m.id)}
                className={`group p-3 border-2 flex flex-col items-center gap-2 text-center transition-all rounded-2xl select-none relative
                  ${alreadyLinked
                    ? 'border-[#FFD9B8]/50 bg-gray-50 cursor-not-allowed'
                    : 'border-[#FFD9B8] bg-white hover:bg-[#FFF4E6] cursor-pointer shadow-[0_4px_12px_rgba(42,26,18,0.10)] hover:translate-y-[-1px] active:translate-y-0'
                  }`}
              >
                {alreadyLinked && (
                  <span className="absolute top-1.5 right-1.5 bg-[#2A1A12] text-white text-[8px] font-black uppercase px-1 py-0.5 rounded-2xl flex items-center gap-0.5">
                    🔒
                  </span>
                )}
                <div className={`w-11 h-11 rounded-full border border-[#FFD9B8] bg-white flex items-center justify-center text-xl shrink-0 ${alreadyLinked ? 'grayscale opacity-50' : ''}`}>
                  {m.avatarUrl}
                </div>
                <div>
                  <h3 className={`font-black text-xs uppercase transition-colors ${alreadyLinked ? 'text-art-text/40' : 'text-art-text group-hover:text-art-orange'}`}>{m.name}</h3>
                  {alreadyLinked
                    ? <p className="text-[9px] font-black text-art-text/50 uppercase mt-0.5">Pres</p>
                    : <p className="text-[9px] text-art-text/30 font-mono">Selecciona</p>
                  }
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t-2 border-[#FFD9B8]/40 flex justify-end">
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

  // 5d. Profile Setup modal — edit avatar/nickname/role before linking + tutorial
  const setupEmojis = [
    '🙋‍♀️','🏄‍♂️','🍻','💃','🍕','🕶️','🌴','🍟','🚗','🏖️',
    '🎧','🎉','👙','🔥','🍹','🥑','💰','📸','🏊‍♂️','💅',
    '🦄','🔮','🎯','🚀','🍔','🍦','👑','🌮','🦈','🐚',
  ];
  const availableSetupRoles = [
    'rolePlanner','roleTreasurer','roleParty','roleChef',
    'roleDriver','roleDormilon','roleFotografo','roleInfiltrado',
  ];
  const ProfileSetupModal = showProfileSetup ? (() => {
    const pendingMember = members.find(m => m.id === pendingMemberId);
    return (
      <div className="fixed inset-0 bg-black/70 z-[150] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white border-2 border-[#FFD9B8] shadow-[0_8px_32px_rgba(42,26,18,0.18)] rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#FF5A1F] to-[#E0290B] px-6 py-4 flex items-center gap-3 rounded-t-2xl">
            <span className="text-3xl">{setupAvatar}</span>
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
                {language === 'ca' ? 'Personalitza el teu perfil' : language === 'en' ? 'Customize your profile' : 'Customiza tu jeto'}
              </p>
              <h2 className="font-display font-black text-lg uppercase text-white leading-tight">
                {pendingMember?.name}
              </h2>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-2">
                {language === 'ca' ? 'Tria el teu emoji' : language === 'en' ? 'Pick your emoji' : 'Elige tu emoji'}
              </label>
              <div className="grid grid-cols-10 gap-1">
                {setupEmojis.map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setSetupAvatar(em)}
                    className={`text-xl p-1 border-2 rounded-2xl transition-all cursor-pointer
                      ${setupAvatar === em
                        ? 'border-art-orange bg-art-orange/10 shadow-[0_4px_12px_rgba(255,90,31,0.25)] scale-105'
                        : 'border-transparent hover:border-art-orange'}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                {language === 'ca' ? 'El teu sobrenom' : language === 'en' ? 'Your nickname' : 'Tu mote'}
              </label>
              <input
                type="text"
                value={setupNickname}
                onChange={e => setSetupNickname(e.target.value)}
                maxLength={28}
                className="w-full px-3 py-2.5 border border-[#FFD9B8] font-bold text-sm text-art-text bg-white focus:outline-none focus:border-art-orange"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                {language === 'ca' ? 'El teu rol' : language === 'en' ? 'Your role' : 'Tu cargo'}
              </label>
              <select
                value={setupRole}
                onChange={e => setSetupRole(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#FFD9B8] font-bold text-sm text-art-text bg-white focus:outline-none focus:border-art-orange cursor-pointer"
              >
                {availableSetupRoles.map(r => (
                  <option key={r} value={r}>{t(r as any, language)}</option>
                ))}
              </select>
            </div>

            {/* Error message */}
            {profileSetupError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 font-semibold text-center">
                ⚠️ {profileSetupError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setShowProfileSetup(false); setShowWhoAreYou(true); }}
                disabled={profileSetupLoading}
                className="flex-1 py-3 border border-[#FFD9B8] font-black uppercase text-xs text-art-text/60 hover:text-art-text hover:bg-[#FFF4E6] transition-all cursor-pointer rounded-2xl disabled:opacity-40"
              >
                {language === 'ca' ? '← Enrere' : language === 'en' ? '← Back' : '← Atrás'}
              </button>
              <button
                type="button"
                onClick={handleConfirmProfileSetup}
                disabled={profileSetupLoading}
                className="flex-2 flex-grow py-3 border border-[#FFD9B8] bg-art-orange text-white font-black uppercase text-xs shadow-[0_4px_12px_rgba(42,26,18,0.10)] hover:translate-y-[-1px] transition-all cursor-pointer rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
              >
                {profileSetupLoading ? '⏳' : '✓'} {language === 'ca' ? 'Confirmar i entrar' : language === 'en' ? 'Confirm & Enter' : 'Confirmá y entrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  })() : null;

  // 6. Main App rendering with chosen character loaded
  return (
    <div className="min-h-screen bg-[#FFF4E6] text-art-text font-sans flex flex-col justify-between" id="full-app-shell">

      {/* Modal "Qui ets tu?" overlay */}
      {WhoAreYouModal}

      {/* Profile Setup modal */}
      {ProfileSetupModal}

      {/* Tutorial onboarding — primera vegada */}
      {showTutorial && (
        <TutorialOverlay
          language={language}
          memberName={members.find(m => m.id === activeMemberId)?.name || ''}
          onFinish={handleFinishTutorial}
        />
      )}
      
      {/* Top Banner Header */}
      <header className="bg-white text-art-text border-b border-[#FFD9B8] shadow-[0_2px_12px_rgba(42,26,18,0.07)] sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">

          {/* Flame logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none select-none">🔥</span>
            <span className="font-mono text-[9px] uppercase tracking-[3px] text-art-text/40 hidden sm:block">Fogueres · Alacant 2026</span>
          </div>

          {/* Avatar chip (center on mobile, right on desktop) */}
          {activeMember ? (
            <button
              type="button"
              onClick={() => setActiveTab('profiles')}
              className="flex items-center gap-2 bg-[#FFF4E6] border border-[#FFD9B8] pl-2 pr-3 py-1.5 rounded-2xl font-black uppercase text-art-text shadow-[0_2px_8px_rgba(42,26,18,0.08)] hover:border-art-orange transition-all cursor-pointer"
            >
              <span className="text-xl leading-none select-none">{activeMember.avatarUrl}</span>
              <span className="font-display text-sm text-art-text leading-none uppercase">
                {activeMember.nickname || activeMember.name}
              </span>
            </button>
          ) : (
            <span className="font-mono text-[9px] uppercase tracking-widest text-art-text/30">
              🔥 Fogueres 2026
            </span>
          )}

        </div>
      </header>

      {/* Main Container tabs layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 pb-24 sm:pb-6 flex flex-col gap-6">

        {/* Dynamic navigation bar inside app */}
        <nav className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-1.5 bg-[#FFF4E6] border border-[#FFD9B8] rounded-2xl p-1.5 shadow-[0_4px_16px_rgba(42,26,18,0.12)] max-w-full justify-start md:justify-center">
          {(['dashboard', 'expenses', 'plans', 'recomanacions', 'sightseeing', 'games', 'begudes', 'profiles'] as const).map((tab) => {
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
                case 'begudes': return <Beer className="w-4 h-4" />;
                case 'profiles': return <Users className="w-4 h-4" />;
              }
            };

            const tabLabel = () => {
              if (tab === 'begudes') {
                return language === 'ca' ? 'Begudes' : language === 'en' ? 'Drinks' : "Begudes";
              }
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
                className={`px-3 sm:px-4 py-2 border border-[#FFD9B8] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 select-none whitespace-nowrap cursor-pointer rounded-2xl ${isTabSelected ? 'bg-art-garnet text-white shadow-[0_2px_8px_rgba(224,41,11,0.25)]' : 'bg-white text-art-text hover:bg-[#FFF0D9]'}`}
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
            <div className="flex flex-col gap-4 animate-fadeIn" id="dashboard-view-panel">

              {/* ── SUPPORT WIDGET (temporal) ──────────────────────────────────── */}
              <SupportWidget
                language={language}
                members={members}
                activeMemberId={activeMemberId}
                candles={supportCandles}
                onToggleCandle={handleToggleCandle}
              />

              {/* ── WEATHER HERO ──────────────────────────────────────────────── */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF5A1F] via-[#E0290B] to-[#2A1A12] p-5 shadow-[0_8px_32px_rgba(224,41,11,0.35)]">
                {/* Decorative glow circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#FFD23F]/15 blur-2xl pointer-events-none" />
                <div className="absolute top-3 right-5 w-20 h-20 rounded-full bg-[#FFD23F]/25 pointer-events-none" />

                {/* Top label */}
                <p className="font-mono text-[9px] uppercase tracking-[3px] text-white/55 mb-3">
                  22–26 JUNY · FOGUERES
                </p>

                {/* City + weather row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h1 className="font-display text-5xl text-white uppercase leading-none tracking-tight drop-shadow-sm">
                      ALACANT
                    </h1>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-display text-3xl text-[#FFD23F] leading-none">
                        {alacantTemp !== null ? `${alacantTemp}°C` : '—°C'}
                      </span>
                      {weatherCode !== null && (
                        <span className="text-sm text-white/65">
                          {t(weatherCode === 0 ? 'weatherClear' : weatherCode <= 3 ? 'weatherCloudy' : weatherCode <= 48 ? 'weatherFoggy' : weatherCode <= 67 ? 'weatherRainy' : weatherCode <= 82 ? 'weatherShowers' : 'weatherStorm', language)}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Weather emoji */}
                  <span className="text-5xl leading-none select-none" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' }}>
                    {weatherCode === null ? '🌤️' : weatherCode === 0 ? '☀️' : weatherCode <= 3 ? '⛅' : weatherCode <= 48 ? '🌫️' : weatherCode <= 67 ? '🌧️' : weatherCode <= 82 ? '🌦️' : '⛈️'}
                  </span>
                </div>

                {/* Divider */}
                <div className="mt-4 pt-4 border-t border-white/15">
                  {new Date() < new Date('2026-06-22T00:00:00') ? (
                    <div className="flex items-end gap-4">
                      {[
                        { value: timeLeft.days, label: language === 'ca' ? 'dies' : language === 'en' ? 'days' : 'días' },
                        { value: String(timeLeft.hours).padStart(2,'0'), label: language === 'ca' ? 'hores' : language === 'en' ? 'hours' : 'horas' },
                        { value: String(timeLeft.minutes).padStart(2,'0'), label: language === 'ca' ? 'min' : 'min' },
                      ].map(({ value, label }) => (
                        <div key={label} className="flex flex-col items-center">
                          <span className="font-display text-2xl text-white leading-none">{value}</span>
                          <span className="font-mono text-[8px] text-white/45 uppercase tracking-widest mt-0.5">{label}</span>
                        </div>
                      ))}
                      <div className="ml-auto flex flex-col items-center">
                        <span className="font-display text-2xl text-white leading-none">{members.filter(m => !!m.googleUid).length}</span>
                        <span className="font-mono text-[8px] text-white/45 uppercase tracking-widest mt-0.5">
                          {language === 'ca' ? 'colla' : language === 'en' ? 'crew' : 'pandilla'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xl text-[#FFD23F] uppercase">🎉 {language === 'ca' ? 'ESTEM AQUÍ!' : language === 'en' ? 'WE\'RE HERE!' : '¡AQUÍ ESTAMO\'!'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── MEMBER AVATARS ────────────────────────────────────────────── */}
              {members.length > 0 && (
                <div className="flex gap-3 overflow-x-auto hide-scrollbar py-1 px-0.5">
                  {members.map(m => (
                    <div key={m.id} className="flex flex-col items-center gap-1 shrink-0">
                      <div className={`w-12 h-12 rounded-full bg-[#FFF4E6] border-2 flex items-center justify-center text-2xl select-none ${m.id === activeMemberId ? 'border-art-orange shadow-[0_0_0_2px_rgba(255,90,31,0.30)]' : 'border-[#FFD9B8]'}`}>
                        {m.avatarUrl}
                      </div>
                      <span className="text-[8px] font-mono uppercase text-art-text/50 tracking-wide max-w-[48px] truncate text-center leading-none">
                        {(m.nickname || m.name).split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── BALANÇ + PROPER PLA ───────────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-3">

                {/* Balance card (dark) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('expenses')}
                  className="bg-[#2A1A12] rounded-2xl p-4 shadow-[0_4px_16px_rgba(42,26,18,0.35)] flex flex-col gap-2 text-left cursor-pointer hover:brightness-110 transition-all"
                >
                  <span className="font-mono text-[8px] uppercase tracking-widest text-white/35">
                    {language === 'ca' ? 'El teu balanç' : language === 'en' ? 'Your balance' : 'Tu saldo'}
                  </span>
                  <span className="font-display text-2xl text-[#FFD23F] leading-none">
                    {(() => {
                      const me = members.find(m => m.id === activeMemberId);
                      if (!me) return expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
                      const paid = expenses.filter(e => e.paidBy === activeMemberId).reduce((s, e) => s + e.amount, 0);
                      const share = expenses.reduce((s, e) => {
                        const split = e.splitAmong?.length ? e.splitAmong : members.map(m => m.id);
                        return split.includes(activeMemberId) ? s + e.amount / split.length : s;
                      }, 0);
                      const balance = paid - share;
                      return (balance >= 0 ? '+' : '') + balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
                    })()}
                  </span>
                  <span className="text-[10px] text-white/35 font-mono leading-snug">
                    {language === 'ca' ? 'La colla et deu diners' : language === 'en' ? 'Group owes you' : 'La gente te debe pasta'}
                  </span>
                </button>

                {/* Next plan card */}
                {(() => {
                  const nextPlan = plans
                    .filter(p => p.date)
                    .sort((a, b) => a.date!.localeCompare(b.date!))
                    .find(p => p.date! >= new Date().toISOString().slice(0, 10));

                  if (!nextPlan) return (
                    <button
                      type="button"
                      onClick={() => setActiveTab('plans')}
                      className="bg-white border border-[#FFD9B8] rounded-2xl p-4 shadow-[0_4px_12px_rgba(42,26,18,0.10)] flex flex-col justify-center items-center gap-2 cursor-pointer hover:bg-[#FFF4E6] hover:border-art-orange transition-all"
                    >
                      <span className="text-3xl">📅</span>
                      <span className="font-mono text-[9px] uppercase text-art-text/40 tracking-wider text-center">
                        {language === 'ca' ? 'Afegir pla' : language === 'en' ? 'Add plan' : 'Añadir plan'}
                      </span>
                    </button>
                  );

                  const d = new Date(nextPlan.date + 'T00:00:00');
                  return (
                    <button
                      type="button"
                      onClick={() => setActiveTab('plans')}
                      className="bg-white border border-[#FFD9B8] rounded-2xl p-4 shadow-[0_4px_12px_rgba(42,26,18,0.10)] flex flex-col gap-2.5 cursor-pointer hover:bg-[#FFF4E6] hover:border-art-orange transition-all text-left"
                    >
                      <span className="font-mono text-[8px] uppercase tracking-widest text-art-text/35">
                        {language === 'ca' ? 'Proper pla' : language === 'en' ? 'Next plan' : 'Próximo plan'}
                      </span>
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col items-center bg-[#FFF4E6] border border-[#FFD9B8] rounded-xl px-2 py-1 shrink-0">
                          <span className="font-display text-xl text-art-orange leading-none">{d.getDate()}</span>
                          <span className="font-mono text-[7px] uppercase text-art-text/40 tracking-widest leading-tight">
                            {d.toLocaleDateString(language === 'ca' ? 'ca-ES' : language === 'en' ? 'en-GB' : 'es-ES', { month: 'short' }).toUpperCase()}
                          </span>
                        </div>
                        <p className="font-display text-sm text-art-text uppercase leading-tight line-clamp-2">{nextPlan.title}</p>
                      </div>
                      {nextPlan.emoji && <span className="text-lg leading-none">{nextPlan.emoji}</span>}
                    </button>
                  );
                })()}
              </div>



              {/* ── VOTACIÓ ACTIVA ────────────────────────────────────────────── */}
              {(() => {
                const activeVote = votes.find(v => v.options && v.options.length > 0);
                if (!activeVote) return null;
                const totalVotes = activeVote.options.reduce((s, o) => s + o.votes.length, 0);
                return (
                  <div className="bg-white border border-[#FFD9B8] rounded-2xl p-4 shadow-[0_4px_16px_rgba(42,26,18,0.10)]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="bg-art-garnet text-white font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                        🗳️ {language === 'ca' ? 'Votació' : language === 'en' ? 'Vote' : 'Votasión'}
                      </span>
                    </div>
                    <p className="font-display text-sm text-art-text uppercase tracking-tight mb-3 leading-tight">
                      {activeVote.question[language]}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeVote.options.map(opt => {
                        const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                        const hasVoted = opt.votes.includes(activeMemberId);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setActiveTab('games')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border font-black text-xs transition-all cursor-pointer ${
                              hasVoted
                                ? 'bg-art-orange text-white border-art-orange shadow-[0_2px_8px_rgba(255,90,31,0.30)]'
                                : 'bg-[#FFF4E6] text-art-text border-[#FFD9B8] hover:border-art-orange'
                            }`}
                          >
                            {opt.text[language]}
                            {totalVotes > 0 && (
                              <span className="font-mono text-[9px] opacity-60">{pct}%</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* ── ALLOTJAMENT ───────────────────────────────────────────────── */}
              <div className="bg-white border border-[#FFD9B8] px-4 py-3 shadow-[0_2px_8px_rgba(42,26,18,0.10)] rounded-2xl flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-white bg-art-garnet font-black rounded-lg px-2 py-0.5 text-[8px] uppercase tracking-wider shrink-0">
                    Airbnb
                  </span>
                  <div className="min-w-0">
                    <p className="font-black text-art-text text-xs uppercase truncate">{t('airbnbCardTitle', language)}</p>
                    <p className="text-[10px] text-art-text/50 font-mono truncate">{t('airbnbCardDesc', language)}</p>
                  </div>
                </div>
                <a
                  href="https://www.airbnb.com/rooms/984807263791129906"
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 py-1.5 px-3 bg-art-orange text-white font-black text-[10px] uppercase rounded-xl shadow-[0_2px_8px_rgba(255,90,31,0.30)] hover:bg-art-garnet hover:translate-y-[-1px] flex items-center gap-1 cursor-pointer transition-all"
                >
                  {t('viewOnAirbnb', language)}
                  <ExternalLink className="w-3 h-3 text-art-orange" />
                </a>
              </div>

              {/* iOS PWA Install Guide (bottom, dismissable) */}
              {!dismissedPwaGuide && (
                <div className="bg-white border border-[#FFD9B8] p-4 shadow-[0_4px_16px_rgba(42,26,18,0.08)] flex items-start gap-3 relative rounded-2xl animate-fadeIn">
                  <span className="text-xl shrink-0 mt-0.5">📲</span>
                  <div className="flex-1 pr-6 min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-art-text/40 mb-1">
                      {language === 'ca' ? 'Instal·la l\'App' : language === 'en' ? 'Install App' : 'Instala la App'}
                    </p>
                    <p className="text-[11px] font-semibold text-art-text/70 leading-relaxed">
                      {language === 'ca'
                        ? <>Compartir <strong>📤</strong> → <strong>'Afegir a la pantalla d'inici'</strong></>
                        : language === 'en'
                        ? <>Share <strong>📤</strong> → <strong>'Add to Home Screen'</strong></>
                        : <>Compartir <strong>📤</strong> → <strong>'Añadir a pantalla de inicio'</strong></>
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissedPwaGuide(true)}
                    className="absolute top-3 right-3 text-art-text/40 hover:text-art-text p-1 cursor-pointer border border-transparent hover:border-[#FFD9B8] rounded-xl transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* 2. EXPENSES VIEW */}
          {activeTab === 'expenses' && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="font-display font-black uppercase text-xl sm:text-2xl text-art-text flex items-center gap-2">
                  <Coins className="text-art-garnet" />
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
              <ItineraryTimeline
                language={language}
                members={members}
                plans={plans}
                activeMemberId={activeMemberId}
                onAddPlan={handleAddPlan}
                onVotePlan={handleVotePlan}
                onToggleFavoritePlan={handleToggleFavoritePlan}
                onDeletePlan={handleDeletePlan}
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
                  customWheels={wheels}
                  activeMemberId={activeMemberId}
                  onSaveWheel={handleSaveWheel}
                  onUpdateWheel={handleUpdateWheel}
                  onDeleteWheel={handleDeleteWheel}
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
                    className="py-1.5 px-3 border border-[#FFD9B8] bg-white text-art-text hover:bg-art-bg/25 font-black uppercase text-xs shadow-[0_2px_8px_rgba(42,26,18,0.10)] hover:translate-y-[-1px] transition-all cursor-pointer rounded-2xl"
                  >
                    {t('createVoteBtn', language)}
                  </button>
                </div>

                {/* Poll Creator Form */}
                {isCreatingPoll && (
                  <form onSubmit={handleCreatePoll} className="bg-white rounded-2xl p-5 border border-[#FFD9B8] shadow-[0_4px_16px_rgba(42,26,18,0.12)] flex flex-col gap-3 text-xs animate-fadeIn">
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
                        className="w-full px-3 py-2 border border-[#FFD9B8] rounded-2xl focus:outline-hidden"
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
                          className="w-full px-3 py-2 border border-[#FFD9B8] rounded-2xl focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label htmlFor="poll-question-an" className="block font-black uppercase tracking-wider text-art-text/60 mb-1">Pregunta (Andalúz):</label>
                        <input
                          id="poll-question-an"
                          type="text"
                          value={newPollQuestionAn}
                          onChange={(e) => setNewPollQuestionAn(e.target.value)}
                          className="w-full px-3 py-2 border border-[#FFD9B8] rounded-2xl focus:outline-hidden"
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
                            className="flex-1 px-3 py-1.5 border border-[#FFD9B8] rounded-2xl text-xs focus:outline-hidden bg-white"
                          />
                          {pollOptionsInput.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setPollOptionsInput(pollOptionsInput.filter((_, i) => i !== oIdx))}
                              className="text-rose-500 bg-rose-50 hover:bg-rose-100 border border-[#FFD9B8] px-2 rounded-2xl font-bold"
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

                    <div className="flex gap-2 justify-end mt-2 pt-2 border-t-2 border-[#FFD9B8]/40">
                      <button
                        type="button"
                        onClick={() => setIsCreatingPoll(false)}
                        className="py-2 px-3 border-2 border-transparent text-art-text/60 font-black uppercase tracking-wider hover:text-art-text"
                      >
                        {t('cancelBtn', language)}
                      </button>
                      <button
                        type="submit"
                        className="py-2 px-4 border border-[#FFD9B8] bg-art-orange text-white font-black uppercase tracking-wider hover:bg-art-orange/85 shadow-[0_2px_8px_rgba(42,26,18,0.10)] hover:translate-y-[-1px] cursor-pointer"
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
                      <div key={poll.id} className="bg-white rounded-2xl border border-[#FFD9B8] p-5 shadow-[0_4px_16px_rgba(42,26,18,0.12)] flex flex-col gap-4 relative">
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
                                className={`text-[10px] font-black border border-[#FFD9B8] px-2 py-0.5 rounded-2xl uppercase transition-all select-none ${poll.closed ? 'bg-slate-200 text-slate-500 shadow-none' : 'bg-[#ffebee] text-rose-600 hover:bg-rose-100 shadow-[0_2px_8px_rgba(42,26,18,0.10)] hover:translate-y-[-1px]'}`}
                              >
                                {poll.closed ? t('pollStatusClosed', language) : (language === 'ca' ? 'Tancar' : language === 'en' ? 'Close' : 'Cerrà')}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePoll(poll.id)}
                                className="text-slate-300 hover:text-rose-600 p-1.5 border border-transparent hover:border-art-orange transition-all cursor-pointer"
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
                                className={`w-full text-left rounded-2xl p-3 border-2 relative overflow-hidden transition-all text-xs flex items-center justify-between gap-3 ${
                                  userHasVotedThisOpt 
                                    ? 'border-art-orange bg-art-orange/5 font-extrabold shadow-[0_2px_8px_rgba(42,26,18,0.10)]' 
                                    : 'border-[#FFD9B8] hover:border-art-orange bg-white hover:translate-y-[-1px] shadow-[0_2px_8px_rgba(42,26,18,0.10)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(42,26,18,0.08)]'
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
                                        <span key={voterId} title={uObj.nickname} className="w-5 h-5 rounded-full bg-white border border-[#FFD9B8] flex items-center justify-center text-[10px] shadow-3xs">{uObj.avatarUrl}</span>
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
                        <div className="text-[10px] font-mono text-art-text/70 uppercase border border-[#FFD9B8] bg-[#FFF4E6] p-2.5 rounded-2xl flex justify-between items-center mt-1">
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


          {/* BEGUDES VIEW */}
          {activeTab === 'begudes' && (
            <div className="animate-fadeIn flex flex-col gap-6">
              <div className="mb-2">
                <h2 className="font-display font-black uppercase text-xl sm:text-2xl text-art-text flex items-center gap-2">
                  <Beer className="text-art-orange" />
                  {language === 'ca' ? 'Comptador de Begudes' : language === 'en' ? 'Drinks Counter' : 'Contador de Bebidas'}
                </h2>
                <p className="text-xs sm:text-sm text-art-text/70 mt-1">
                  {language === 'ca' ? 'Porta el compte de les begudes de cada membre.' : language === 'en' ? 'Track drinks for each group member.' : 'Lleva la cuenta de las bebidas de cada uno.'}
                </p>
              </div>

              {/* ── MY DRINKS DASHBOARD ──────────────────────────────── */}
              {activeMemberId ? (() => {
                const myDrinks = drinks.find(d => d.memberId === activeMemberId) || { birres: 0, sangries: 0, cubates: 0 };
                const DRINK_MAX = 20;
                const drinkRows = [
                  { type: 'birres'   as const, emoji: '🍺', label: language === 'ca' ? 'Birres'   : language === 'en' ? 'Beers'    : 'Cervezas', accentColor: '#D97706', bgColor: '#FFFBEB', barColor: '#F59E0B', borderColor: '#FCD34D' },
                  { type: 'sangries' as const, emoji: '🍷', label: language === 'ca' ? 'Sangries' : language === 'en' ? 'Sangrias' : 'Sangrias', accentColor: '#B91C1C', bgColor: '#FFF1F2', barColor: '#E11D48', borderColor: '#FCA5A5' },
                  { type: 'cubates'  as const, emoji: '🥃', label: language === 'ca' ? 'Cubates'  : language === 'en' ? 'Mixers'   : 'Cubatas',  accentColor: '#5B21B6', bgColor: '#F5F3FF', barColor: '#7C3AED', borderColor: '#C4B5FD' },
                ] as const;
                return (
                  <div className="flex flex-col gap-3">
                    {drinkRows.map(({ type, emoji, label, accentColor, bgColor, barColor, borderColor }) => {
                      const count = (myDrinks[type] as number) || 0;
                      const pct = Math.min((count / DRINK_MAX) * 100, 100);
                      return (
                        <div
                          key={type}
                          className="border border-[#FFD9B8] shadow-[0_4px_16px_rgba(42,26,18,0.12)] overflow-hidden"
                          style={{ background: bgColor }}
                        >
                          <div className="flex items-center gap-3 px-4 py-4">
                            {/* Label */}
                            <div className="flex items-center gap-2 w-28 shrink-0">
                              <span className="text-2xl leading-none">{emoji}</span>
                              <span className="font-display font-black uppercase text-[11px] tracking-widest" style={{ color: accentColor }}>{label}</span>
                            </div>
                            {/* Progress bar */}
                            <div className="flex-1 h-6 border-2 overflow-hidden" style={{ borderColor, background: '#ffffff90' }}>
                              <div
                                className="h-full transition-all duration-300 ease-out"
                                style={{ width: `${pct}%`, background: barColor }}
                              />
                            </div>
                            {/* Count */}
                            <span className="font-display font-black text-2xl w-8 text-right shrink-0 tabular-nums" style={{ color: accentColor }}>
                              {count}
                            </span>
                            {/* Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleRemoveDrink(type)}
                                disabled={count === 0}
                                className="w-9 h-9 border border-[#FFD9B8] font-black text-xl flex items-center justify-center select-none transition-all active:scale-90 hover:brightness-90 disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{ background: '#fff', color: accentColor }}
                              >−</button>
                              <button
                                type="button"
                                onClick={() => handleAddDrink(type)}
                                className="w-9 h-9 border border-[#FFD9B8] font-black text-xl flex items-center justify-center select-none transition-all active:scale-90 hover:brightness-90"
                                style={{ background: barColor, color: '#fff' }}
                              >+</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })() : (
                <div className="border border-[#FFD9B8] bg-[#FFF4E6] p-6 shadow-[0_4px_16px_rgba(42,26,18,0.12)] text-center">
                  <Beer className="w-10 h-10 text-art-text/20 mx-auto mb-3" />
                  <p className="font-display font-black text-art-text/40 uppercase text-sm">
                    {language === 'ca' ? 'Selecciona el teu perfil a Perfils per registrar begudes' : language === 'en' ? 'Select your profile in Profiles to track drinks' : 'Selecciona tu perfil en Perfiles para registrar bebidas'}
                  </p>
                </div>
              )}

              {/* ── LEADERBOARD ──────────────────────────────────────────── */}
              <div className="bg-[#FFF4E6] border border-[#FFD9B8] p-5 shadow-[0_4px_16px_rgba(42,26,18,0.12)]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] uppercase font-black text-art-text/40 tracking-wider font-mono">🏆 Rànquing del grup</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {members
                    .map(m => {
                      const d = drinks.find(dr => dr.memberId === m.id) || { birres: 0, sangries: 0, cubates: 0 };
                      return { member: m, total: d.birres + d.sangries + d.cubates, birres: d.birres, sangries: d.sangries, cubates: d.cubates };
                    })
                    .sort((a, b) => b.total - a.total)
                    .map(({ member, total, birres, sangries, cubates }, idx) => (
                      <div key={member.id} className={`border border-[#FFD9B8] p-3 flex flex-col gap-1 ${idx === 0 && total > 0 ? 'bg-art-yellow shadow-[0_4px_12px_rgba(42,26,18,0.10)]' : 'bg-white'}`}>
                        <div className="flex items-center gap-2">
                          {idx === 0 && total > 0 && <span className="text-xs">🏆</span>}
                          <span className="text-lg">{member.avatarUrl}</span>
                          <span className="text-[11px] font-black text-art-text truncate">{member.nickname || member.name}</span>
                        </div>
                        <div className="flex gap-2 text-[10px] font-mono font-bold text-art-text/60">
                          <span>🍺{birres}</span><span>🍷{sangries}</span><span>🥃{cubates}</span>
                        </div>
                        <span className="text-xs font-display font-black text-art-text">{total} total</span>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

          {/* 7. SHOPPING LIST VIEW */}
          {activeTab === 'compra' && (
            <ShoppingList
              language={language}
              items={shoppingItems}
              activeMemberId={activeMemberId}
              onToggle={handleToggleShoppingItem}
              onAdd={handleAddShoppingItem}
              onDelete={handleDeleteShoppingItem}
            />
          )}

          {/* 8. RECEPTES VIEW */}
          {activeTab === 'receptes' && (
            <Receptes
              language={language}
              customRecipes={customRecipes}
              onAddToShopping={handleAddIngredientsToShopping}
              onAddRecipe={handleAddRecipe}
              onDeleteRecipe={handleDeleteRecipe}
            />
          )}

          {/* 9. PACKING LIST VIEW */}
          {activeTab === 'portar' && (
            <PackingList
              language={language}
              items={packingItems}
              members={members}
              activeMemberId={activeMemberId}
              onToggle={handleTogglePackingItem}
              onAdd={handleAddPackingItem}
              onDelete={handleDeletePackingItem}
            />
          )}

          {/* 6. MY PROFILE VIEW */}
          {activeTab === 'profiles' && (() => {
            const me = members.find(m => m.id === activeMemberId);
            if (!me) return null;

            const cuteEmojis = [
              '🙋‍♀️','🏄‍♂️','🍻','💃','🍕','🕶️','🌴','🍟','🚗','🏖️',
              '🎧','🎉','👙','🔥','🍹','🥑','💰','📸','🏊‍♂️','💅',
              '🦄','🔮','🎯','🚀','🍔','🍦','🛸','👻','👑','🌮',
            ];
            const availableRoles = [
              'rolePlanner','roleTreasurer','roleParty','roleChef',
              'roleDriver','roleDormilon','roleFotografo','roleInfiltrado',
            ];

            return (
              <MyProfile
                me={me}
                language={language}
                cuteEmojis={cuteEmojis}
                availableRoles={availableRoles}
                onUpdate={(fields) => handleUpdateMember(me.id, fields)}
                onLanguageChange={setLanguage}
                onLogout={handleLogout}
              />
            );
          })()}

        </div>

        {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────────── */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#FFD9B8] shadow-[0_-2px_16px_rgba(42,26,18,0.08)] flex items-end justify-around px-1" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))', paddingTop: '8px' }}>
          {([
            { tab: 'dashboard'  as const, icon: <Sunset   className="w-5 h-5" />, label: language === 'ca' ? 'Inici'    : language === 'en' ? 'Home'     : 'Inicio'  },
            { tab: 'expenses'   as const, icon: <Coins    className="w-5 h-5" />, label: language === 'ca' ? 'Despeses' : language === 'en' ? 'Expenses' : 'Gastos'  },
            { tab: 'plans'      as const, icon: <Calendar className="w-5 h-5" />, label: language === 'ca' ? 'Plans'    : language === 'en' ? 'Plans'    : 'Planes'  },
            { tab: 'begudes'    as const, icon: <Beer     className="w-5 h-5" />, label: language === 'ca' ? 'Begudes'  : language === 'en' ? 'Drinks'   : 'Bebidas' },
          ] as const).map(({ tab, icon, label }) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setShowMoreMenu(false); }}
                className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] select-none transition-colors"
                style={{ color: isActive ? '#E0290B' : 'rgba(42,26,18,0.40)' }}
              >
                {icon}
                {isActive && <span className="block w-1 h-1 rounded-full" style={{ background: '#E0290B' }} />}
                <span className="text-[8px] font-black uppercase tracking-wide leading-none mt-0.5">{label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowMoreMenu(prev => !prev)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] select-none transition-colors"
            style={{ color: (['recomanacions','sightseeing','games','profiles','compra','receptes','portar'] as const).some(t => t === activeTab) || showMoreMenu ? '#E0290B' : 'rgba(42,26,18,0.40)' }}
          >
            <MoreHorizontal className="w-5 h-5" />
            {(['recomanacions','sightseeing','games','profiles','compra','receptes','portar'] as const).some(t => t === activeTab) && <span className="block w-1 h-1 rounded-full" style={{ background: '#E0290B' }} />}
            <span className="text-[8px] font-black uppercase tracking-wide leading-none mt-0.5">{language === 'ca' ? 'Més' : language === 'en' ? 'More' : 'Más'}</span>
          </button>
        </nav>

        {/* ── MOBILE "MÉS" SHEET ────────────────────────────────────────────── */}
        {showMoreMenu && (
          <div
            className="sm:hidden fixed inset-0 z-40"
            onClick={() => setShowMoreMenu(false)}
          >
            <div
              className="absolute left-0 right-0 bg-white border-t border-[#FFD9B8] shadow-[0_-4px_20px_rgba(42,26,18,0.10)] p-4 animate-fadeIn"
              style={{ bottom: 'calc(56px + max(8px, env(safe-area-inset-bottom)))' }}
              onClick={e => e.stopPropagation()}
            >
              <span className="text-[9px] uppercase font-black text-art-text/40 tracking-widest mb-3 block">{language === 'ca' ? 'Més seccions' : language === 'en' ? 'More sections' : 'Más secciones'}</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {([
                  { tab: 'recomanacions' as const, icon: <Compass     className="w-4 h-4" />, label: language === 'ca' ? 'Recomanacions' : language === 'en' ? 'Tips'     : 'Recomendaciones' },
                  { tab: 'sightseeing'   as const, icon: <MapPin    className="w-4 h-4" />, label: language === 'ca' ? 'Sightseeing'   : language === 'en' ? 'Places'   : 'Turismo'         },
                  { tab: 'games'         as const, icon: <Dices     className="w-4 h-4" />, label: language === 'ca' ? 'Jocs'          : language === 'en' ? 'Games'    : 'Juegos'           },
                  { tab: 'compra'        as const, icon: <ShoppingCart className="w-4 h-4" />, label: language === 'ca' ? 'La compra'  : language === 'en' ? 'Shopping' : 'La compra'        },
                  { tab: 'receptes'      as const, icon: <Utensils  className="w-4 h-4" />, label: language === 'ca' ? 'Receptes'     : language === 'en' ? 'Recipes'  : 'Recetas'          },
                  { tab: 'portar'        as const, icon: <Backpack  className="w-4 h-4" />, label: language === 'ca' ? 'Què cal portar' : language === 'en' ? 'Packing' : 'Qué llevar'      },
                  { tab: 'profiles'      as const, icon: <Users     className="w-4 h-4" />, label: language === 'ca' ? 'Perfil'        : language === 'en' ? 'Profile'  : 'Perfil'         },
                ] as const).map(({ tab, icon, label }) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => { setActiveTab(tab); setShowMoreMenu(false); }}
                      className="flex items-center gap-3 px-4 py-3 border font-black uppercase text-xs tracking-wide transition-all select-none rounded-2xl"
                      style={isActive
                        ? { background: '#E0290B', borderColor: '#E0290B', color: '#ffffff' }
                        : { background: '#FFF4E6', borderColor: '#FFD9B8', color: 'rgba(42,26,18,0.70)' }
                      }
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
