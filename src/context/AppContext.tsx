import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, UserInvestment, DiamondTask, Language, VIPTier, Announcement, ConcessionStats } from '../types';
import { VIP_TIERS, INITIAL_DIAMOND_TASKS, FUND_PLANS, VIP_DAILY_PRESENCE_BONUS } from '../data/mockData';
import { translations } from '../locales/translations';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {
  subscribeToAnnouncements,
  subscribeToMiningTasks,
  subscribeToConcessionStats,
  seedDefaultAnnouncements,
  seedDefaultMiningTasks,
  seedDefaultConcessionStats,
} from '../services/firestoreService';

export const ADMIN_UID = '0j4XJDI6iXgXpODNoMZHs7daRnR2';
export const ADMIN_EMAILS = ['damiaofrnando@gmail.com', 'enzzon25@gmail.com'];

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['pt'];
  currentRoute: string;
  navigateTo: (route: string) => void;
  routeParams: Record<string, string>;
  register: (phone: string, phoneCode: string, email: string, password: string, inviteCode: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  login: (identifier: string, phoneCode: string, password: string) => Promise<{ success: boolean; message?: string }>;
  adminLoginShortcut: () => Promise<void>;
  demoLogin: () => Promise<void> | void;
  logout: () => void;
  claimDiamondLot: (taskId: string) => { success: boolean; reward: number; message: string };
  completedTaskIds: string[];
  recharge: (amount: number, method: string, proofUrl?: string, senderInfo?: string) => Promise<{ success: boolean; message: string }>;
  withdraw: (amount: number, accountType: string, accountNumber: string, accountName: string, pin?: string) => Promise<{ success: boolean; message: string }>;
  bindBankAccount: (bankName: string, accountName: string, accountNumber: string) => Promise<{ success: boolean; message: string }>;
  setPaymentPassword: (password: string) => Promise<{ success: boolean; message: string }>;
  claimDailyPresenceReward: () => Promise<{ success: boolean; amount: number; message: string }>;
  upgradeVip: (tierId: number) => Promise<{ success: boolean; message: string }>;
  triggerSimulated24hProfit: () => Promise<{ success: boolean; profit: number; message: string }>;
  lastAutoProfit: { amount: number; time: string; tierName: string } | null;
  spinLuckyDraw: () => Promise<{ success: boolean; prize: { label: string; value: number; type: 'money' | 'spins' | 'gift' } }>;
  investInFund: (planId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  investments: UserInvestment[];
  transactions: Transaction[];
  allTransactions: Transaction[];
  allUsers: User[];
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  totalPendingCount: number;
  approveDeposit: (txId: string) => Promise<{ success: boolean; message: string }>;
  rejectDeposit: (txId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  approveWithdraw: (txId: string) => Promise<{ success: boolean; message: string }>;
  rejectWithdraw: (txId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  adjustUserBalance: (userId: string, deltaAmount: number, reason: string) => Promise<{ success: boolean; message: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  announcements: Announcement[];
  miningTasks: DiamondTask[];
  concessionStats: ConcessionStats | null;
  currentVipTier: VIPTier;
  formatCurrency: (amount: number) => string;
  tasksRemainingToday: number;
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;
  activeModal: { name: string; data?: any } | null;
  hideBalance: boolean;
  toggleHideBalance: () => void;
  countdownSeconds: number;
  countdownFormatted: string;
  isClockActive: boolean;
  isSunday: boolean;
  isClockPausedForSunday: boolean;
  simulateSunday: boolean;
  toggleSimulateSunday: () => void;
  managerWhatsAppUrl: string;
  whatsappGroupUrl: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('catoca_lang') as Language) || 'pt';
  });

  const [currentRoute, setCurrentRoute] = useState<string>('/pages/register/index');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({ i: '1fg9kafci6' });
  const [hideBalance, setHideBalance] = useState<boolean>(false);

  // Active user state in memory
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<{ name: string; data?: any } | null>(null);

  // Real-time collections from Firestore service layer
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [miningTasks, setMiningTasks] = useState<DiamondTask[]>([]);
  const [concessionStats, setConcessionStats] = useState<ConcessionStats | null>(null);

  // Global collections for Admin Management & Real-time Auditing
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  // Real-time listeners for global Concession Collections
  useEffect(() => {
    const unsubAnn = subscribeToAnnouncements((data) => {
      setAnnouncements(data);
    });
    const unsubTasks = subscribeToMiningTasks((data) => {
      setMiningTasks(data);
    });
    const unsubStats = subscribeToConcessionStats((data) => {
      setConcessionStats(data);
    });

    // Real-time listener for all users
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list: User[] = [];
        snap.forEach((d) => {
          list.push(d.data() as User);
        });
        setAllUsers(list);
      },
      (err) => {
        console.warn('Sync all users:', err);
      }
    );

    // Real-time listener for all transactions
    const unsubTx = onSnapshot(
      collection(db, 'transactions'),
      (snap) => {
        const list: Transaction[] = [];
        snap.forEach((d) => {
          list.push(d.data() as Transaction);
        });
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setAllTransactions(list);
      },
      (err) => {
        console.warn('Sync all transactions:', err);
      }
    );

    return () => {
      unsubAnn();
      unsubTasks();
      unsubStats();
      unsubUsers();
      unsubTx();
    };
  }, []);

  const isAdmin = !!(
    user &&
    (user.id === ADMIN_UID ||
      user.isAdmin === true ||
      user.role === 'admin' ||
      ADMIN_EMAILS.includes((user.email || '').toLowerCase()))
  );

  const pendingDepositsCount = allTransactions.filter(
    (t) => t.type === 'recharge' && t.status === 'pending'
  ).length;

  const pendingWithdrawalsCount = allTransactions.filter(
    (t) => t.type === 'withdraw' && t.status === 'pending'
  ).length;

  const totalPendingCount = pendingDepositsCount + pendingWithdrawalsCount;

  // Official WhatsApp Links
  const managerWhatsAppUrl = 'https://wa.me/message/RYWEG4XDAU64P1';
  const whatsappGroupUrl = 'https://chat.whatsapp.com/EytIiPqiWd1B5RvLk3kDKY?s=cl&p=i&mlu=4&ilr=4&iam=2';

  // Sunday operational rest & maintenance state
  const [simulateSunday, setSimulateSunday] = useState<boolean>(() => {
    try {
      return localStorage.getItem('catoca_simulate_sunday') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSimulateSunday = () => {
    setSimulateSunday((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('catoca_simulate_sunday', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isRealSunday = new Date().getDay() === 0;
  const isSunday = isRealSunday || simulateSunday;

  // 24-hour cycle timer state
  const [cycleTargetTime, setCycleTargetTime] = useState<number>(0);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);

  const [lastAutoProfit, setLastAutoProfit] = useState<{ amount: number; time: string; tierName: string } | null>(() => {
    try {
      const saved = localStorage.getItem('catoca_last_auto_profit');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 1. Initial Session Restoration from Firebase Auth & Firestore
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // 1. Try to fetch user by Firebase Auth UID
          const userRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            setUser(userData);
            localStorage.setItem('catoca_active_user_id', fbUser.uid);
            if (userData.cycleTargetTime) {
              setCycleTargetTime(userData.cycleTargetTime);
            }
            return;
          }

          // 2. Fallback: try by email in case created under custom ID
          if (fbUser.email) {
            const q = query(collection(db, 'users'), where('email', '==', fbUser.email.toLowerCase()));
            const qSnap = await getDocs(q);
            if (!qSnap.empty) {
              const userData = qSnap.docs[0].data() as User;
              setUser(userData);
              localStorage.setItem('catoca_active_user_id', userData.id);
              if (userData.cycleTargetTime) {
                setCycleTargetTime(userData.cycleTargetTime);
              }
              return;
            }
          }
        } catch (err) {
          console.error('Falha ao sincronizar sessão Auth com Firestore:', err);
        }
      }

      // Fallback: restore from localStorage if Auth state has not hydrated
      const activeUserId = localStorage.getItem('catoca_active_user_id');
      if (activeUserId) {
        try {
          const userRef = doc(db, 'users', activeUserId);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            setUser(userData);
            if (userData.cycleTargetTime) {
              setCycleTargetTime(userData.cycleTargetTime);
            }
          } else {
            localStorage.removeItem('catoca_active_user_id');
          }
        } catch (err) {
          console.error('Falha ao restaurar sessão inicial do Firestore:', err);
        }
      }
    });

    return () => unsubAuth();
  }, []);

  // 2. Real-Time Firestore Synchronization (User, Transactions, Investments)
  useEffect(() => {
    if (!user?.id) {
      setTransactions([]);
      setInvestments([]);
      return;
    }

    // Live listener for User document
    const unsubUser = onSnapshot(
      doc(db, 'users', user.id),
      (snap) => {
        if (snap.exists()) {
          const freshData = snap.data() as User;
          setUser(freshData);
          if (freshData.cycleTargetTime) {
            setCycleTargetTime(freshData.cycleTargetTime);
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `users/${user.id}`);
      }
    );

    // Live listener for User Transactions
    const qTx = query(
      collection(db, 'transactions'),
      where('userId', '==', user.id)
    );
    const unsubTx = onSnapshot(
      qTx,
      (snap) => {
        const list: Transaction[] = [];
        snap.forEach((d) => {
          list.push(d.data() as Transaction);
        });
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setTransactions(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'transactions');
      }
    );

    // Live listener for User Investments
    const qInv = query(
      collection(db, 'investments'),
      where('userId', '==', user.id)
    );
    const unsubInv = onSnapshot(
      qInv,
      (snap) => {
        const list: UserInvestment[] = [];
        snap.forEach((d) => {
          list.push(d.data() as UserInvestment);
        });
        setInvestments(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'investments');
      }
    );

    return () => {
      unsubUser();
      unsubTx();
      unsubInv();
    };
  }, [user?.id]);

  // Execute automatic 24h profit distribution in Firestore
  const distributeAutomaticProfit = async (userToCredit: User) => {
    if (!userToCredit || userToCredit.vipLevel <= 0) return;
    const tier = VIP_TIERS.find((t) => t.id === userToCredit.vipLevel);
    if (!tier || tier.dailyIncome <= 0) return;

    const profit = tier.dailyIncome;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const nextCycle = Date.now() + 24 * 60 * 60 * 1000;

    const profitData = {
      amount: profit,
      time: nowStr,
      tierName: `${tier.name} - ${tier.title}`,
    };
    setLastAutoProfit(profitData);
    localStorage.setItem('catoca_last_auto_profit', JSON.stringify(profitData));

    try {
      // 1. Update User in Firestore
      const userRef = doc(db, 'users', userToCredit.id);
      await updateDoc(userRef, {
        balance: userToCredit.balance + profit,
        depositBalance: userToCredit.depositBalance + profit,
        todayEarnings: profit,
        yesterdayEarnings: userToCredit.todayEarnings,
        totalEarnings: userToCredit.totalEarnings + profit,
        thisMonthEarnings: userToCredit.thisMonthEarnings + profit,
        tasksCompletedToday: 1,
        totalCaratsExtracted: +(userToCredit.totalCaratsExtracted + (parseFloat(tier.caratCapacity) || 1.5)).toFixed(2),
        cycleTargetTime: nextCycle,
      });

      // 2. Add Transaction to Firestore
      const txId = `tx-auto-${Date.now()}`;
      const newTx: Transaction = {
        id: txId,
        userId: userToCredit.id,
        type: 'task_reward',
        amount: profit,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Lucro Automático de 24h: ${tier.name} (${tier.title}) (+${profit.toLocaleString('pt-BR')} Kz)`,
      };
      await setDoc(doc(db, 'transactions', txId), newTx);

      setCycleTargetTime(nextCycle);
      setCountdownSeconds(24 * 60 * 60);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userToCredit.id}`);
    }
  };

  const isClockActive = !!(user && user.vipLevel > 0);
  const isClockPausedForSunday = isSunday && isClockActive;

  // 24-hour countdown clock effect: ONLY runs after purchasing a VIP diamond plan
  useEffect(() => {
    // If no plan has been purchased, the clock CANNOT count down
    if (!user || user.vipLevel <= 0 || !cycleTargetTime) {
      setCountdownSeconds(0);
      return;
    }

    // Regra: Nos domingos não há tarefas e o relógio para de contar, dando sequência na segunda-feira!
    if (isSunday) {
      const now = Date.now();
      const diff = Math.max(1, Math.floor((cycleTargetTime - now) / 1000));
      setCountdownSeconds(diff);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.floor((cycleTargetTime - now) / 1000);

      if (diff <= 0) {
        // 24 hours expired! Automatically credit profit for the active diamond
        distributeAutomaticProfit(user);
      } else {
        setCountdownSeconds(diff);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [cycleTargetTime, user?.vipLevel, isSunday]);

  // Format countdown as HH:MM:SS
  const formatCountdown = (totalSec: number) => {
    if (!user || user.vipLevel <= 0) {
      return '--:--:--';
    }
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/pages/register/index?i=1fg9kafci6';
      const cleanHash = hash.replace(/^#/, '');
      const [path, queryStr] = cleanHash.split('?');

      const params: Record<string, string> = {};
      if (queryStr) {
        const searchParams = new URLSearchParams(queryStr);
        searchParams.forEach((val, key) => {
          params[key] = val;
        });
      }

      if (!params.i && !params.inviteCode) {
        params.i = '1fg9kafci6';
      }

      setRouteParams(params);
      setCurrentRoute(path || '/pages/register/index');
    };

    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) {
      window.location.hash = '#/pages/register/index?i=1fg9kafci6';
    } else {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('catoca_lang', lang);
  };

  const toggleHideBalance = () => {
    setHideBalance((prev) => !prev);
  };

  const navigateTo = (route: string) => {
    const clean = route.startsWith('/') ? route : `/${route}`;
    let target = clean;
    if (clean === '/pages/register/index' && routeParams.i) {
      target += `?i=${routeParams.i}`;
    }
    window.location.hash = `#${target}`;
    setCurrentRoute(clean);
  };

  const openModal = (modalName: string, data?: any) => {
    setActiveModal({ name: modalName, data });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const currentVipTier = VIP_TIERS.find((v) => v.id === (user?.vipLevel ?? 0)) || VIP_TIERS[0];

  const formatCurrency = (amount: number) => {
    if (hideBalance) return '••••••';
    if (language === 'pt') {
      return `${amount.toLocaleString('pt-BR')} Kz`;
    } else if (language === 'es') {
      return `$${amount.toLocaleString('es-ES')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  // Helper for human-friendly authentication and database error messages
  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este endereço de e-mail já está cadastrado. Inicie sessão com a sua palavra-passe ou recupere o acesso.';
      case 'auth/invalid-email':
        return 'O formato do endereço de e-mail é inválido. Verifique o e-mail digitado.';
      case 'auth/weak-password':
        return 'A palavra-passe deve conter pelo menos 6 caracteres.';
      case 'auth/user-not-found':
        return 'Nenhuma conta encontrada com este e-mail. Crie uma nova conta.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Palavra-passe incorreta ou credenciais inválidas. Verifique os dados inseridos.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas falhadas. O acesso foi bloqueado temporariamente por segurança. Tente mais tarde.';
      case 'auth/network-request-failed':
        return 'Falha de comunicação com os servidores. Verifique a sua conexão de internet.';
      case 'auth/user-disabled':
        return 'Esta conta de operador foi temporariamente suspensa pela administração.';
      case 'permission-denied':
        return 'Acesso negado pelas permissões de segurança da base de dados.';
      case 'unavailable':
        return 'O serviço de dados está temporariamente indisponível. Tente novamente em instantes.';
      default:
        if (err?.message && typeof err.message === 'string') {
          if (err.message.includes('offline')) {
            return 'Não foi possível comunicar com o servidor. Verifique a sua ligação à internet.';
          }
          return err.message;
        }
        return 'Ocorreu um erro ao processar a autenticação. Tente novamente.';
    }
  };

  // 3. Register New Operator into Live Firebase Auth and Firestore Database
  const register = async (
    phone: string,
    phoneCode: string,
    email: string,
    password: string,
    inviteCode: string,
    name?: string
  ) => {
    try {
      const cleanPhone = phone.trim().replace(/\s+/g, '');
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = (name || '').trim();

      if (!cleanPhone) {
        return { success: false, message: 'O número de telefone é obrigatório.' };
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, message: 'Por favor, informe um endereço de e-mail válido.' };
      }
      if (!password || password.length < 6) {
        return { success: false, message: 'A palavra-passe deve conter pelo menos 6 caracteres.' };
      }

      // 1. Verify in Firestore that phone number is not duplicated
      try {
        const qPhone = query(collection(db, 'users'), where('phone', '==', cleanPhone));
        const snapPhone = await getDocs(qPhone);
        if (!snapPhone.empty) {
          return {
            success: false,
            message: 'Este número de telefone já está cadastrado na Concessão Catoca. Faça login ou utilize outro número.',
          };
        }
      } catch (checkErr) {
        console.warn('Aviso na checagem de telefone único:', checkErr);
      }

      // 2. Create User in Firebase Authentication
      let authUid: string;
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        authUid = userCred.user.uid;
      } catch (authErr: any) {
        return {
          success: false,
          message: formatAuthError(authErr),
        };
      }

      // 3. Construct user document (NEVER storing plaintext passwords in Firestore)
      const newUser: User = {
        id: authUid,
        name: cleanName || `Operador ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        phoneCode,
        email: cleanEmail,
        inviteCode: Math.random().toString(36).substring(2, 10).toLowerCase(),
        invitedBy: inviteCode.trim() || '1fg9kafci6',
        vipLevel: 0,
        balance: 650,
        depositBalance: 650,
        todayEarnings: 0,
        yesterdayEarnings: 0,
        totalEarnings: 650,
        thisMonthEarnings: 650,
        tasksCompletedToday: 0,
        luckyDrawSpins: 3,
        token: 'jwt_catoca_' + Date.now(),
        avatar: '/assets/images/catoca_diamond_gem_1792306524777.jpg',
        createdAt: new Date().toISOString(),
        payPasswordSet: false,
        totalCaratsExtracted: 0.20,
        cycleTargetTime: 0,
      };

      // 4. Write user document to Firestore
      await setDoc(doc(db, 'users', authUid), newUser);

      // 5. Write welcome registration bonus transaction to Firestore
      const txId = `tx-welcome-${Date.now()}`;
      const welcomeTx: Transaction = {
        id: txId,
        userId: authUid,
        type: 'referral_bonus',
        amount: 650,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Saldo Inicial de Cadastro Catoca: +650 Kz (Convite: ${inviteCode.trim() || '1fg9kafci6'})`,
      };
      await setDoc(doc(db, 'transactions', txId), welcomeTx);

      localStorage.setItem('catoca_active_user_id', authUid);
      setUser(newUser);
      navigateTo('/pages/index/index');
      return { success: true };
    } catch (err: any) {
      console.error('Erro no registro Firestore/Auth:', err);
      return {
        success: false,
        message: formatAuthError(err),
      };
    }
  };

  // 4. Login Operator with live Firebase Auth & Firestore validation
  const login = async (identifier: string, _phoneCode: string, password: string) => {
    try {
      const cleanId = identifier.trim();
      const isEmail = cleanId.includes('@');
      const cleanPhone = cleanId.replace(/\s+/g, '');

      if (!cleanId) {
        return { success: false, message: 'Informe o seu número de telefone ou e-mail.' };
      }
      if (!password) {
        return { success: false, message: 'Informe a sua palavra-passe.' };
      }

      let authUserEmail = '';
      let targetUserId: string | null = null;
      let userData: User | null = null;

      if (isEmail) {
        authUserEmail = cleanId.toLowerCase();
      } else {
        // Find user by phone in Firestore to retrieve associated email
        let snap = await getDocs(query(collection(db, 'users'), where('phone', '==', cleanPhone)));
        if (snap.empty) {
          snap = await getDocs(query(collection(db, 'users'), where('phone', '==', cleanId)));
        }
        if (snap.empty) {
          return {
            success: false,
            message: 'Nenhum operador encontrado com este número de telefone. Verifique o número ou cadastre-se.',
          };
        }
        userData = snap.docs[0].data() as User;
        targetUserId = userData.id;
        authUserEmail = userData.email || '';
      }

      if (!authUserEmail) {
        return {
          success: false,
          message: 'Conta sem e-mail de autenticação vinculado. Entre em contato com o suporte.',
        };
      }

      // Authenticate with Firebase Authentication
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, authUserEmail, password);
      } catch (authErr: any) {
        return {
          success: false,
          message: formatAuthError(authErr),
        };
      }

      // Retrieve user document from Firestore using authenticated UID
      const effectiveUid = cred.user.uid;
      const userRef = doc(db, 'users', effectiveUid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        userData = userSnap.data() as User;
      } else if (targetUserId && targetUserId !== effectiveUid) {
        const fallbackSnap = await getDoc(doc(db, 'users', targetUserId));
        if (fallbackSnap.exists()) {
          userData = fallbackSnap.data() as User;
        }
      }

      // If document is missing in Firestore, create default document
      if (!userData) {
        userData = {
          id: effectiveUid,
          name: authUserEmail.split('@')[0],
          phone: cleanPhone || '900000000',
          phoneCode: '+244',
          email: authUserEmail,
          inviteCode: Math.random().toString(36).substring(2, 10).toLowerCase(),
          invitedBy: '1fg9kafci6',
          vipLevel: 0,
          balance: 650,
          depositBalance: 650,
          todayEarnings: 0,
          yesterdayEarnings: 0,
          totalEarnings: 650,
          thisMonthEarnings: 650,
          tasksCompletedToday: 0,
          luckyDrawSpins: 3,
          token: 'jwt_catoca_' + Date.now(),
          avatar: '/assets/images/catoca_diamond_gem_1792306524777.jpg',
          createdAt: new Date().toISOString(),
          payPasswordSet: false,
          totalCaratsExtracted: 0.20,
          cycleTargetTime: 0,
        };
        await setDoc(doc(db, 'users', effectiveUid), userData);
      }

      // Check if user is an Administrator (by UID, designated email, or database flag)
      const isAdminUser =
        effectiveUid === ADMIN_UID ||
        ADMIN_EMAILS.includes(authUserEmail.toLowerCase()) ||
        userData?.isAdmin === true ||
        userData?.role === 'admin' ||
        cleanId === ADMIN_UID;

      if (isAdminUser) {
        userData.isAdmin = true;
        userData.role = 'admin';
        try {
          await updateDoc(doc(db, 'users', userData.id), { isAdmin: true, role: 'admin' });
        } catch {
          // ignore
        }
        localStorage.setItem('catoca_active_user_id', userData.id);
        setUser(userData);
        navigateTo('/pages/admin/index');
        return { success: true };
      }

      localStorage.setItem('catoca_active_user_id', userData.id);
      setUser(userData);
      navigateTo('/pages/index/index');
      return { success: true };
    } catch (err: any) {
      console.error('Erro no login:', err);
      return {
        success: false,
        message: formatAuthError(err),
      };
    }
  };

  // Direct Administrator Quick-Access for UID 0j4XJDI6iXgXpODNoMZHs7daRnR2
  const adminLoginShortcut = async () => {
    try {
      const adminEmail = 'damiaofrnando@gmail.com';
      let adminUser: User | null = null;

      // Try reading existing admin document
      const docSnap = await getDoc(doc(db, 'users', ADMIN_UID));
      if (docSnap.exists()) {
        adminUser = docSnap.data() as User;
      } else {
        const q = query(collection(db, 'users'), where('email', '==', adminEmail.toLowerCase()));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          adminUser = qSnap.docs[0].data() as User;
        }
      }

      if (!adminUser) {
        adminUser = {
          id: ADMIN_UID,
          name: 'Damiao Fernando (Administrador Catoca)',
          phone: '923849120',
          phoneCode: '+244',
          email: adminEmail,
          inviteCode: 'catoca_adm',
          vipLevel: 15,
          balance: 25000000,
          depositBalance: 25000000,
          todayEarnings: 800000,
          yesterdayEarnings: 1500000,
          totalEarnings: 35000000,
          thisMonthEarnings: 35000000,
          tasksCompletedToday: 0,
          luckyDrawSpins: 99,
          token: 'jwt_admin_catoca',
          avatar: '/assets/aistudio/IMG_1487_83d7197c.jpeg',
          createdAt: new Date().toISOString(),
          payPasswordSet: true,
          paymentPassword: '2026',
          totalCaratsExtracted: 5000,
          cycleTargetTime: 0,
          isAdmin: true,
          role: 'admin',
          bankAccount: {
            accountType: 'multicaixa',
            accountName: 'Damiao Fernando Administrador',
            accountNumber: 'AO06.0040.0000.8923.4112.1018.9',
            bankName: 'Banco BFA Multicaixa',
          },
        };
        await setDoc(doc(db, 'users', ADMIN_UID), adminUser);
      } else {
        adminUser.isAdmin = true;
        adminUser.role = 'admin';
        await updateDoc(doc(db, 'users', adminUser.id), { isAdmin: true, role: 'admin' });
      }

      localStorage.setItem('catoca_active_user_id', adminUser.id);
      setUser(adminUser);
      navigateTo('/pages/admin/index');
    } catch (e) {
      console.error('Falha no adminLoginShortcut:', e);
      navigateTo('/pages/admin/index');
    }
  };

  // 5. Demo Operator connected to Firebase Auth and Firestore document
  const demoLogin = async () => {
    try {
      const demoEmail = 'operador.demo@catoca.ao';
      const demoPass = 'CatocaDemo2026!';
      let demoUid = 'CATOCA-772910';

      try {
        const cred = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
        demoUid = cred.user.uid;
      } catch (e: any) {
        if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
          try {
            const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
            demoUid = cred.user.uid;
          } catch {
            // Keep default demoUid
          }
        }
      }

      const demoRef = doc(db, 'users', demoUid);
      const demoSnap = await getDoc(demoRef);
      let demoUser: User;

      if (!demoSnap.exists()) {
        demoUser = {
          id: demoUid,
          name: 'Damiao Fernando',
          phone: '923849120',
          phoneCode: '+244',
          email: demoEmail,
          inviteCode: '1fg9kafci6',
          invitedBy: 'catoca_concessao',
          vipLevel: 2,
          balance: 56000,
          depositBalance: 56000,
          todayEarnings: 6000,
          yesterdayEarnings: 16000,
          totalEarnings: 142000,
          thisMonthEarnings: 142000,
          tasksCompletedToday: 2,
          luckyDrawSpins: 5,
          token: 'jwt_catoca_demo',
          avatar: '/assets/images/catoca_diamond_gem_1792306524777.jpg',
          createdAt: new Date().toISOString(),
          payPasswordSet: true,
          totalCaratsExtracted: 38.45,
          cycleTargetTime: Date.now() + 24 * 60 * 60 * 1000,
          bankAccount: {
            accountType: 'multicaixa',
            accountName: 'Damiao Fernando',
            accountNumber: 'AO06.0040.0000.8923.4112.1018.9',
            bankName: 'Banco BFA Multicaixa',
          },
        };
        await setDoc(demoRef, demoUser);

        const demoTx: Transaction = {
          id: `tx-demo-${Date.now()}`,
          userId: demoUid,
          type: 'vip_upgrade',
          amount: -10000,
          status: 'completed',
          date: new Date().toLocaleDateString('pt-BR'),
          timestamp: Date.now(),
          note: 'Concessão VIP 2 Ativa - Tubo Catoca Central (700 Kz/dia)',
        };
        await setDoc(doc(db, 'transactions', demoTx.id), demoTx);
      } else {
        demoUser = demoSnap.data() as User;
      }

      localStorage.setItem('catoca_active_user_id', demoUid);
      setUser(demoUser);
      navigateTo('/pages/index/index');
    } catch (err) {
      console.error('Erro no demoLogin:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Erro ao deslogar do Firebase Auth:', e);
    }
    localStorage.removeItem('catoca_active_user_id');
    setUser(null);
    setTransactions([]);
    setInvestments([]);
    setActiveModal(null);
    navigateTo('/pages/login/index');
  };

  const tasksRemainingToday = Math.max(0, currentVipTier.dailyTasks - (user?.tasksCompletedToday ?? 0));

  const claimDiamondLot = (taskId: string) => {
    if (!user) {
      return { success: false, reward: 0, message: 'Usuário não autenticado' };
    }
    if (isSunday) {
      return {
        success: false,
        reward: 0,
        message: 'Aos domingos não se realizam tarefas nem extrações na mina de Catoca (manutenção técnica preventiva das usinas). As operações retomam na segunda-feira!',
      };
    }
    return {
      success: true,
      reward: 0,
      message: 'O lucro dos diamantes é gerado automaticamente a cada 24h pelo relógio regressivo!',
    };
  };

  // 6. Recharge in Firestore with receipt proof and Pending status for Admin review
  const recharge = async (amount: number, method: string, proofUrl?: string, senderInfo?: string) => {
    if (!user) return { success: false, message: 'Usuário não autenticado' };

    try {
      const txId = `tx-rech-${Date.now()}`;
      const rechTx: Transaction = {
        id: txId,
        userId: user.id,
        userName: user.name || 'Operador Catoca',
        userPhone: user.phone,
        userEmail: user.email,
        type: 'recharge',
        amount,
        status: 'pending', // Pending approval by Admin
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Depósito via ${method.toUpperCase()}${senderInfo ? ` (${senderInfo})` : ''}`,
        paymentMethod: method,
        proofUrl: proofUrl || '',
        senderName: senderInfo || '',
      };
      await setDoc(doc(db, 'transactions', txId), rechTx);

      return {
        success: true,
        message: `Comprovativo de depósito de ${formatCurrency(amount)} enviado para análise da administração Catoca! O depósito ficará PENDENTE até aprovação no painel do Administrador.`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `transactions/${user.id}`);
      return { success: false, message: 'Erro ao enviar comprovativo de depósito.' };
    }
  };

  // 7. Withdraw in Firestore with strict TRUE payment password verification (0% fee, pending until approved, refund if rejected)
  const withdraw = async (amount: number, accountType: string, accountNumber: string, accountName: string, pin?: string) => {
    if (!user) return { success: false, message: 'Usuário não autenticado' };
    if (amount < 1000) return { success: false, message: 'O valor mínimo para levantamento é de 1.000 Kz' };
    if (amount > user.balance) return { success: false, message: 'Saldo insuficiente no cofre' };

    // STRICT VALIDATION: If payment password is not set, or PIN doesn't match the true payment password
    if (!user.payPasswordSet || !user.paymentPassword) {
      return {
        success: false,
        message: 'Para efetuar saques, você precisa primeiro definir a sua Senha de Pagamento no seu Perfil / Cofre.',
      };
    }

    if (!pin || pin.trim() !== user.paymentPassword.trim()) {
      return {
        success: false,
        message: 'Senha de pagamento incorreta! Digite a senha verdadeira de segurança cadastrada na sua conta.',
      };
    }

    // Zero fee as requested: net amount = requested amount
    const fee = 0;
    const netAmount = amount;

    try {
      const userRef = doc(db, 'users', user.id);
      const updatedAccount = {
        accountType: 'multicaixa' as const,
        accountName,
        accountNumber,
        bankName: user.bankAccount?.bankName || (accountType === 'multicaixa' ? 'Banco Multicaixa AO' : 'Conta Bancária'),
      };

      // Immediately deduct requested amount from user's balance
      const newBalance = user.balance - amount;
      await updateDoc(userRef, {
        balance: newBalance,
        bankAccount: updatedAccount,
      });

      const txId = `tx-wd-${Date.now()}`;
      const wdTx: Transaction = {
        id: txId,
        userId: user.id,
        userName: user.name || 'Operador Catoca',
        userPhone: user.phone,
        userEmail: user.email,
        type: 'withdraw',
        amount: -amount,
        status: 'pending', // PENDING for Admin review and approval!
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Ordem de Saque (${accountName} - ${accountNumber.slice(-4)}). Taxa: 0 Kz (Isento). Líquido: ${formatCurrency(netAmount)}`,
        accountType,
        accountName,
        accountNumber,
      };
      await setDoc(doc(db, 'transactions', txId), wdTx);

      setUser((prev) => prev ? {
        ...prev,
        balance: newBalance,
        bankAccount: updatedAccount,
      } : null);

      return {
        success: true,
        message: `Solicitação de saque de ${formatCurrency(amount)} enviada! O valor saiu da sua carteira e ficará PENDENTE até aprovação no painel do Administrador (Taxa: 0 Kz). Se recusado, o valor volta integralmente.`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
      return { success: false, message: 'Erro ao processar ordem de saque.' };
    }
  };

  // ADMIN ACTION: Approve Deposit
  const approveDeposit = async (txId: string) => {
    try {
      const txRef = doc(db, 'transactions', txId);
      const txSnap = await getDoc(txRef);
      if (!txSnap.exists()) return { success: false, message: 'Transação não encontrada.' };
      const txData = txSnap.data() as Transaction;
      if (txData.status !== 'pending') return { success: false, message: 'Esta transação já foi processada anteriormente.' };

      const targetUserId = txData.userId;
      if (!targetUserId) return { success: false, message: 'Operador não associado a esta transação.' };

      const userRef = doc(db, 'users', targetUserId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return { success: false, message: 'Operador não encontrado na base de dados.' };
      const targetUser = userSnap.data() as User;

      const newBalance = (targetUser.balance || 0) + txData.amount;
      const newDepositBalance = (targetUser.depositBalance || 0) + txData.amount;
      const newSpins = (targetUser.luckyDrawSpins || 0) + 2;

      await updateDoc(userRef, {
        balance: newBalance,
        depositBalance: newDepositBalance,
        luckyDrawSpins: newSpins,
      });

      await updateDoc(txRef, {
        status: 'completed',
        reviewedBy: user?.name || 'Administrador Central',
        reviewedAt: new Date().toISOString(),
      });

      if (user && user.id === targetUserId) {
        setUser((prev) => prev ? {
          ...prev,
          balance: newBalance,
          depositBalance: newDepositBalance,
          luckyDrawSpins: newSpins,
        } : null);
      }

      return {
        success: true,
        message: `Depósito de ${formatCurrency(txData.amount)} aprovado com sucesso! Saldo creditado na conta de ${targetUser.name || 'Operador'}.`,
      };
    } catch (err: any) {
      console.error('Erro ao aprovar depósito:', err);
      return { success: false, message: err?.message || 'Falha ao aprovar depósito.' };
    }
  };

  // ADMIN ACTION: Reject Deposit
  const rejectDeposit = async (txId: string, reason: string) => {
    try {
      const txRef = doc(db, 'transactions', txId);
      const txSnap = await getDoc(txRef);
      if (!txSnap.exists()) return { success: false, message: 'Transação não encontrada.' };
      const txData = txSnap.data() as Transaction;
      if (txData.status !== 'pending') return { success: false, message: 'Esta transação já foi processada anteriormente.' };

      await updateDoc(txRef, {
        status: 'failed',
        adminNote: reason,
        reviewedBy: user?.name || 'Administrador Central',
        reviewedAt: new Date().toISOString(),
      });

      return { success: true, message: 'Depósito recusado e registrado no histórico de auditoria.' };
    } catch (err: any) {
      console.error('Erro ao recusar depósito:', err);
      return { success: false, message: err?.message || 'Falha ao recusar depósito.' };
    }
  };

  // ADMIN ACTION: Approve Withdrawal
  const approveWithdraw = async (txId: string) => {
    try {
      const txRef = doc(db, 'transactions', txId);
      const txSnap = await getDoc(txRef);
      if (!txSnap.exists()) return { success: false, message: 'Transação não encontrada.' };
      const txData = txSnap.data() as Transaction;
      if (txData.status !== 'pending') return { success: false, message: 'Esta transação já foi processada anteriormente.' };

      await updateDoc(txRef, {
        status: 'completed',
        reviewedBy: user?.name || 'Administrador Central',
        reviewedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: `Saque de ${formatCurrency(Math.abs(txData.amount))} aprovado com sucesso! Pagamento liberado ao operador.`,
      };
    } catch (err: any) {
      console.error('Erro ao aprovar saque:', err);
      return { success: false, message: err?.message || 'Falha ao aprovar saque.' };
    }
  };

  // ADMIN ACTION: Reject Withdrawal (with refund of held balance)
  const rejectWithdraw = async (txId: string, reason: string) => {
    try {
      const txRef = doc(db, 'transactions', txId);
      const txSnap = await getDoc(txRef);
      if (!txSnap.exists()) return { success: false, message: 'Transação não encontrada.' };
      const txData = txSnap.data() as Transaction;
      if (txData.status !== 'pending') return { success: false, message: 'Esta transação já foi processada anteriormente.' };

      const targetUserId = txData.userId;
      if (targetUserId) {
        const userRef = doc(db, 'users', targetUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const targetUser = userSnap.data() as User;
          const refundAmount = Math.abs(txData.amount);
          const newBalance = (targetUser.balance || 0) + refundAmount;

          await updateDoc(userRef, {
            balance: newBalance,
          });

          if (user && user.id === targetUserId) {
            setUser((prev) => prev ? { ...prev, balance: newBalance } : null);
          }
        }
      }

      await updateDoc(txRef, {
        status: 'failed',
        adminNote: reason,
        reviewedBy: user?.name || 'Administrador Central',
        reviewedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Saque recusado com sucesso. O valor foi estornado integralmente ao saldo do operador.',
      };
    } catch (err: any) {
      console.error('Erro ao recusar saque:', err);
      return { success: false, message: err?.message || 'Falha ao recusar saque.' };
    }
  };

  // ADMIN ACTION: Adjust User Balance (Credit/Debit with mandatory audit reasons)
  const adjustUserBalance = async (targetUserId: string, deltaAmount: number, reason: string) => {
    try {
      const userRef = doc(db, 'users', targetUserId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        return { success: false, message: 'Operador não encontrado na base de dados.' };
      }
      const targetUser = userSnap.data() as User;
      const newBalance = Math.max(0, (targetUser.balance || 0) + deltaAmount);

      await updateDoc(userRef, {
        balance: newBalance,
      });

      const txId = `tx-adm-${Date.now()}`;
      const adjustTx: Transaction = {
        id: txId,
        userId: targetUserId,
        userName: targetUser.name,
        userPhone: targetUser.phone,
        userEmail: targetUser.email,
        type: 'fund_interest',
        amount: deltaAmount,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Ajuste Administrativo (${deltaAmount >= 0 ? '+' : ''}${formatCurrency(deltaAmount)}): ${reason}`,
        adminNote: reason,
        reviewedBy: user?.name || 'Administrador Central Catoca',
        reviewedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'transactions', txId), adjustTx);

      if (user && user.id === targetUserId) {
        setUser((prev) => prev ? { ...prev, balance: newBalance } : null);
      }

      return {
        success: true,
        message: `Saldo ${deltaAmount >= 0 ? 'creditado' : 'debitado'} com sucesso! Novo saldo do operador: ${formatCurrency(newBalance)}.`,
      };
    } catch (err: any) {
      console.error('Erro ao ajustar saldo:', err);
      return { success: false, message: err?.message || 'Falha ao realizar ajuste de saldo.' };
    }
  };

  // ADMIN ACTION: Delete User from system
  const deleteUser = async (targetUserId: string) => {
    try {
      if (!targetUserId) {
        return { success: false, message: 'Identificador de utilizador inválido.' };
      }

      // Safeguard: Prevent deleting the primary admin account or current admin
      if (targetUserId === ADMIN_UID || (user && user.id === targetUserId)) {
        return { success: false, message: 'Operação recusada: Não é permitido remover a conta de administrador atual.' };
      }

      // Check user existence
      const userRef = doc(db, 'users', targetUserId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        if (userData.email && ADMIN_EMAILS.includes(userData.email)) {
          return { success: false, message: 'Operação recusada: Não é permitido remover um utilizador administrador.' };
        }
      }

      // Delete the user record from Firestore
      await deleteDoc(userRef);

      // Immediately remove from allUsers in memory
      setAllUsers((prev) => prev.filter((u) => u.id !== targetUserId));

      return {
        success: true,
        message: 'Utilizador removido permanentemente da base de dados com sucesso.',
      };
    } catch (err: any) {
      console.error('Erro ao remover utilizador:', err);
      return { success: false, message: err?.message || 'Falha ao remover utilizador do banco de dados.' };
    }
  };

  // Bind Bank Account / IBAN
  const bindBankAccount = async (bankName: string, accountName: string, accountNumber: string) => {
    if (!user) return { success: false, message: 'Usuário não conectado.' };
    if (!accountName.trim() || !accountNumber.trim()) {
      return { success: false, message: 'Preencha o titular e o número do IBAN/Express.' };
    }
    try {
      const userRef = doc(db, 'users', user.id);
      const newAccount = {
        accountType: 'multicaixa' as const,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim(),
      };
      await updateDoc(userRef, {
        bankAccount: newAccount,
      });
      setUser((prev) => prev ? { ...prev, bankAccount: newAccount } : null);
      return { success: true, message: 'IBAN de pagamento vinculado com sucesso!' };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
      return { success: false, message: 'Erro ao salvar IBAN no banco de dados.' };
    }
  };

  // Set / Change Payment Password (4 to 6 digits)
  const setPaymentPassword = async (password: string) => {
    if (!user) return { success: false, message: 'Usuário não conectado.' };
    if (!/^\d{4,6}$/.test(password)) {
      return { success: false, message: 'A senha de pagamento deve conter de 4 a 6 dígitos numéricos.' };
    }
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        paymentPassword: password,
        payPasswordSet: true,
      });
      setUser((prev) => prev ? { ...prev, paymentPassword: password, payPasswordSet: true } : null);
      return { success: true, message: 'Senha de pagamento definida com sucesso!' };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
      return { success: false, message: 'Erro ao salvar senha de pagamento.' };
    }
  };

  // Claim Daily Presence Reward based on VIP Level
  const claimDailyPresenceReward = async () => {
    if (!user) return { success: false, amount: 0, message: 'Usuário não conectado.' };

    const todayStr = new Date().toISOString().split('T')[0];
    if (user.lastDailyRewardDate === todayStr) {
      return {
        success: false,
        amount: 0,
        message: 'Presença diária já confirmada hoje! Retorne amanhã para novo bônus.',
      };
    }

    const vipLevel = user.vipLevel || 0;
    const bonusAmount = VIP_DAILY_PRESENCE_BONUS[vipLevel] ?? 2;

    try {
      const userRef = doc(db, 'users', user.id);
      const newBalance = (user.balance || 0) + bonusAmount;
      const newTodayEarnings = (user.todayEarnings || 0) + bonusAmount;
      const newTotalEarnings = (user.totalEarnings || 0) + bonusAmount;

      await updateDoc(userRef, {
        balance: newBalance,
        todayEarnings: newTodayEarnings,
        totalEarnings: newTotalEarnings,
        lastDailyRewardDate: todayStr,
      });

      const txId = `tx-bonus-${Date.now()}`;
      const bonusTx: Transaction = {
        id: txId,
        userId: user.id,
        type: 'task_reward',
        amount: bonusAmount,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Bónus de Presença Diária (VIP ${vipLevel}: +${bonusAmount} Kz)`,
      };
      await setDoc(doc(db, 'transactions', txId), bonusTx);

      setUser((prev) => prev ? {
        ...prev,
        balance: newBalance,
        todayEarnings: newTodayEarnings,
        totalEarnings: newTotalEarnings,
        lastDailyRewardDate: todayStr,
      } : null);

      return {
        success: true,
        amount: bonusAmount,
        message: `Presença confirmada! Bónus VIP ${vipLevel} de +${formatCurrency(bonusAmount)} creditado no cofre!`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
      return { success: false, amount: 0, message: 'Erro ao registrar bônus diário.' };
    }
  };

  // 8. Upgrade VIP in Firestore (starts 24h clock)
  const upgradeVip = async (tierId: number) => {
    if (!user) return { success: false, message: 'Usuário não autenticado' };
    const targetTier = VIP_TIERS.find((t) => t.id === tierId);
    if (!targetTier) return { success: false, message: 'Concessão inválida' };

    if (user.balance < targetTier.price) {
      return {
        success: false,
        message: `Saldo insuficiente. Necessário ${formatCurrency(targetTier.price)} para comprar o diamante ${targetTier.name} (${targetTier.title}).`,
      };
    }

    // Start 24-hour countdown immediately upon diamond purchase!
    const nextTarget = Date.now() + 24 * 60 * 60 * 1000;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        vipLevel: tierId,
        balance: user.balance - targetTier.price,
        depositBalance: Math.max(0, user.depositBalance - targetTier.price),
        luckyDrawSpins: user.luckyDrawSpins + 4,
        cycleTargetTime: nextTarget,
      });

      const txId = `tx-vip-${Date.now()}`;
      const vipTx: Transaction = {
        id: txId,
        userId: user.id,
        type: 'vip_upgrade',
        amount: -targetTier.price,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Aquisição do Diamante ${targetTier.name} (${targetTier.title}) - 120 dias de lucro automático (${targetTier.dailyIncome.toLocaleString('pt-BR')} Kz/dia)`,
      };
      await setDoc(doc(db, 'transactions', txId), vipTx);

      setCycleTargetTime(nextTarget);
      setCountdownSeconds(24 * 60 * 60);

      return {
        success: true,
        message: `Diamante ${targetTier.name} (${targetTier.title}) adquirido com sucesso! O relógio de 24h começou a contar regressivamente para gerar o seu lucro automático de ${formatCurrency(targetTier.dailyIncome)}!`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  // 9. Trigger Simulated 24h Profit in Firestore
  const triggerSimulated24hProfit = async () => {
    if (!user) return { success: false, profit: 0, message: 'Usuário não autenticado' };
    if (isSunday) {
      return {
        success: false,
        profit: 0,
        message: 'Aos domingos não se realizam tarefas nem extrações na mina de Catoca. O relógio está pausado e continuará na segunda-feira!',
      };
    }
    if (user.vipLevel <= 0) {
      return {
        success: false,
        profit: 0,
        message: 'Você ainda não possui um Diamante VIP ativo! Adquira um diamante para gerar lucro automático a cada 24h.',
      };
    }

    const tier = VIP_TIERS.find((t) => t.id === user.vipLevel);
    if (!tier || tier.dailyIncome <= 0) {
      return { success: false, profit: 0, message: 'Plano sem rendimento configurado' };
    }

    const profit = tier.dailyIncome;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const nextCycle = Date.now() + 24 * 60 * 60 * 1000;

    const profitData = {
      amount: profit,
      time: nowStr,
      tierName: `${tier.name} - ${tier.title}`,
    };
    setLastAutoProfit(profitData);
    localStorage.setItem('catoca_last_auto_profit', JSON.stringify(profitData));

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        balance: user.balance + profit,
        depositBalance: user.depositBalance + profit,
        todayEarnings: user.todayEarnings + profit,
        totalEarnings: user.totalEarnings + profit,
        thisMonthEarnings: user.thisMonthEarnings + profit,
        tasksCompletedToday: (user.tasksCompletedToday || 0) + 1,
        totalCaratsExtracted: +(user.totalCaratsExtracted + (parseFloat(tier.caratCapacity) || 1.5)).toFixed(2),
        cycleTargetTime: nextCycle,
      });

      const txId = `tx-auto-${Date.now()}`;
      const profitTx: Transaction = {
        id: txId,
        userId: user.id,
        type: 'task_reward',
        amount: profit,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Lucro Automático de 24h: ${tier.name} (${tier.title}) (+${profit.toLocaleString('pt-BR')} Kz)`,
      };
      await setDoc(doc(db, 'transactions', txId), profitTx);

      setCycleTargetTime(nextCycle);
      setCountdownSeconds(24 * 60 * 60);

      return {
        success: true,
        profit,
        message: `Lucro automático de ${formatCurrency(profit)} creditado com sucesso no cofre! O relógio de 24h começou a contar para o próximo dia.`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  // 10. Spin Lucky Draw in Firestore
  const spinLuckyDraw = async () => {
    if (!user || user.luckyDrawSpins <= 0) {
      return {
        success: false,
        prize: { label: 'Sem giros', value: 0, type: 'money' as const },
      };
    }

    const prizes = [
      { label: '2.000 Kz', value: 2000, type: 'money' as const },
      { label: '5.000 Kz', value: 5000, type: 'money' as const },
      { label: '10.000 Kz', value: 10000, type: 'money' as const },
      { label: '25.000 Kz', value: 25000, type: 'money' as const },
      { label: '+3 Extrações', value: 3, type: 'spins' as const },
      { label: '1.500 Kz', value: 1500, type: 'money' as const },
    ];

    const chosen = prizes[Math.floor(Math.random() * prizes.length)];
    const isMoney = chosen.type === 'money';
    const newBalance = user.balance + (isMoney ? chosen.value : 0);
    const newSpins = Math.max(0, user.luckyDrawSpins - 1 + (chosen.type === 'spins' ? chosen.value : 0));

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        balance: newBalance,
        luckyDrawSpins: newSpins,
        todayEarnings: user.todayEarnings + (isMoney ? chosen.value : 0),
        totalEarnings: user.totalEarnings + (isMoney ? chosen.value : 0),
      });

      if (isMoney && chosen.value > 0) {
        const txId = `tx-lucky-${Date.now()}`;
        const luckyTx: Transaction = {
          id: txId,
          userId: user.id,
          type: 'lucky_draw',
          amount: chosen.value,
          status: 'completed',
          date: new Date().toLocaleDateString('pt-BR'),
          timestamp: Date.now(),
          note: `Roleta de Diamantes Catoca: ${chosen.label}`,
        };
        await setDoc(doc(db, 'transactions', txId), luckyTx);
      }

      return { success: true, prize: chosen };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  // 11. Invest in Kimberlite Fund in Firestore
  const investInFund = async (planId: string, amount: number) => {
    if (!user) return { success: false, message: 'Usuário não autenticado' };
    if (user.balance < amount) return { success: false, message: 'Saldo insuficiente' };

    const plan = FUND_PLANS.find((p) => p.id === planId) || FUND_PLANS[0];

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        balance: user.balance - amount,
        depositBalance: Math.max(0, user.depositBalance - amount),
      });

      const invId = `inv-${Date.now()}`;
      const newInv: UserInvestment = {
        id: invId,
        userId: user.id,
        planId,
        planTitle: plan.title,
        amount,
        startDate: new Date().toLocaleDateString('pt-BR'),
        daysRemaining: plan.durationDays,
        accruedYield: Math.round(amount * (plan.dailyYieldPercent / 100)),
        totalProjected: Math.round(amount * (1 + plan.totalReturnsPercent / 100)),
        status: 'active',
      };
      await setDoc(doc(db, 'investments', invId), newInv);

      const txId = `tx-inv-${Date.now()}`;
      const invTx: Transaction = {
        id: txId,
        userId: user.id,
        type: 'fund_interest',
        amount: -amount,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Subscrição de Cota Kimberlito: ${plan.title} (${formatCurrency(amount)})`,
      };
      await setDoc(doc(db, 'transactions', txId), invTx);

      return {
        success: true,
        message: `Subscrição de ${formatCurrency(amount)} ativada com sucesso!`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `investments/${planId}`);
    }
  };

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin,
    language,
    setLanguage,
    t: translations[language],
    currentRoute,
    navigateTo,
    routeParams,
    register,
    login,
    adminLoginShortcut,
    demoLogin,
    logout,
    claimDiamondLot,
    completedTaskIds,
    recharge,
    withdraw,
    bindBankAccount,
    setPaymentPassword,
    claimDailyPresenceReward,
    upgradeVip,
    triggerSimulated24hProfit,
    lastAutoProfit,
    spinLuckyDraw,
    investInFund,
    investments,
    transactions,
    allTransactions,
    allUsers,
    pendingDepositsCount,
    pendingWithdrawalsCount,
    totalPendingCount,
    approveDeposit,
    rejectDeposit,
    approveWithdraw,
    rejectWithdraw,
    adjustUserBalance,
    deleteUser,
    announcements,
    miningTasks,
    concessionStats,
    currentVipTier,
    formatCurrency,
    tasksRemainingToday,
    openModal,
    closeModal,
    activeModal,
    hideBalance,
    toggleHideBalance,
    countdownSeconds,
    countdownFormatted: formatCountdown(countdownSeconds),
    isClockActive,
    isSunday,
    isClockPausedForSunday,
    simulateSunday,
    toggleSimulateSunday,
    managerWhatsAppUrl,
    whatsappGroupUrl,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
