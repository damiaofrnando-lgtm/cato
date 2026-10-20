import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, UserInvestment, DiamondTask, Language, VIPTier, Announcement, ConcessionStats } from '../types';
import { VIP_TIERS, INITIAL_DIAMOND_TASKS, FUND_PLANS } from '../data/mockData';
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

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['pt'];
  currentRoute: string;
  navigateTo: (route: string) => void;
  routeParams: Record<string, string>;
  register: (phone: string, phoneCode: string, email: string, password: string, inviteCode: string) => Promise<{ success: boolean; message?: string }>;
  login: (identifier: string, phoneCode: string, password: string) => Promise<{ success: boolean; message?: string }>;
  demoLogin: () => Promise<void> | void;
  logout: () => void;
  claimDiamondLot: (taskId: string) => { success: boolean; reward: number; message: string };
  completedTaskIds: string[];
  recharge: (amount: number, method: string) => Promise<{ success: boolean; message: string }>;
  withdraw: (amount: number, accountType: string, accountNumber: string, accountName: string) => Promise<{ success: boolean; message: string }>;
  upgradeVip: (tierId: number) => Promise<{ success: boolean; message: string }>;
  triggerSimulated24hProfit: () => Promise<{ success: boolean; profit: number; message: string }>;
  lastAutoProfit: { amount: number; time: string; tierName: string } | null;
  spinLuckyDraw: () => Promise<{ success: boolean; prize: { label: string; value: number; type: 'money' | 'spins' | 'gift' } }>;
  investInFund: (planId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  investments: UserInvestment[];
  transactions: Transaction[];
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

    return () => {
      unsubAnn();
      unsubTasks();
      unsubStats();
    };
  }, []);

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

  // 24-hour countdown clock effect: ONLY runs after purchasing a VIP diamond plan
  useEffect(() => {
    // If no plan has been purchased, the clock CANNOT count down
    if (!user || user.vipLevel <= 0 || !cycleTargetTime) {
      setCountdownSeconds(0);
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
  }, [cycleTargetTime, user?.vipLevel]);

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

  // 3. Register New Operator into Live Firebase Auth and Firestore Database
  const register = async (phone: string, phoneCode: string, email: string, password: string, inviteCode: string) => {
    try {
      const cleanPhone = phone.trim().replace(/\s+/g, '');
      const cleanEmail = email.trim().toLowerCase();

      // Check if phone is already registered in Firestore
      const qPhone = query(collection(db, 'users'), where('phone', '==', cleanPhone));
      const snapPhone = await getDocs(qPhone);
      if (!snapPhone.empty) {
        return { success: false, message: 'Este número de telefone já está cadastrado na Concessão Catoca. Faça login ou use outro número.' };
      }

      // Check if email is already registered in Firestore
      const qEmail = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        return { success: false, message: 'Este endereço de e-mail já está cadastrado. Faça login ou use outro e-mail.' };
      }

      // 1. Create User in Firebase Authentication
      let authUid: string;
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        authUid = userCred.user.uid;
      } catch (authErr: any) {
        if (authErr?.code === 'auth/email-already-in-use') {
          try {
            const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
            authUid = userCred.user.uid;
          } catch {
            return {
              success: false,
              message: 'Este e-mail já está registrado na autenticação. Faça login com sua senha.',
            };
          }
        } else if (authErr?.code === 'auth/weak-password') {
          return {
            success: false,
            message: 'A senha deve possuir pelo menos 6 caracteres.',
          };
        } else if (authErr?.code === 'auth/invalid-email') {
          return {
            success: false,
            message: 'O formato do endereço de e-mail é inválido.',
          };
        } else {
          console.warn('Falha no Firebase Auth createUser, usando identificador único da concessão:', authErr);
          authUid = `CATOCA-${Math.floor(100000 + Math.random() * 900000)}`;
        }
      }

      const newUserId = authUid;

      const newUser: User = {
        id: newUserId,
        phone: cleanPhone,
        phoneCode,
        email: cleanEmail,
        password,
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
        avatar: '/src/assets/images/catoca_diamond_gem_1792306524777.jpg',
        createdAt: new Date().toISOString(),
        payPasswordSet: false,
        totalCaratsExtracted: 0.20,
        cycleTargetTime: 0,
      };

      // 2. Write user document to Firestore (using Auth UID as key)
      await setDoc(doc(db, 'users', newUserId), newUser);

      // 3. Write welcome transaction to Firestore
      const txId = `tx-welcome-${Date.now()}`;
      const welcomeTx: Transaction = {
        id: txId,
        userId: newUserId,
        type: 'referral_bonus',
        amount: 650,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Saldo Inicial de Cadastro Catoca: 650 Kz (Convite: ${inviteCode.trim() || '1fg9kafci6'})`,
      };
      await setDoc(doc(db, 'transactions', txId), welcomeTx);

      localStorage.setItem('catoca_active_user_id', newUserId);
      setUser(newUser);
      navigateTo('/pages/index/index');
      return { success: true };
    } catch (err: any) {
      console.error('Erro no registro Firestore/Auth:', err);
      return {
        success: false,
        message: err?.message ? `Erro no banco de dados: ${err.message}` : 'Erro ao cadastrar credencial.',
      };
    }
  };

  // 4. Login Operator with live Firebase Auth & Firestore validation
  const login = async (identifier: string, _phoneCode: string, password: string) => {
    try {
      const cleanId = identifier.trim().toLowerCase();
      const isEmail = cleanId.includes('@');
      const cleanPhone = identifier.trim().replace(/\s+/g, '');

      let foundUser: User | null = null;
      let authUserUid: string | null = null;

      if (isEmail) {
        // Attempt Firebase Auth login first
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanId, password);
          authUserUid = cred.user.uid;
        } catch (authErr: any) {
          console.warn('Firebase Auth sign in notice:', authErr?.code || authErr?.message);
        }

        // Fetch user from Firestore by auth UID if authenticated
        if (authUserUid) {
          const userDoc = await getDoc(doc(db, 'users', authUserUid));
          if (userDoc.exists()) {
            foundUser = userDoc.data() as User;
          }
        }

        // If not found by UID, search by email in Firestore
        if (!foundUser) {
          const q = query(collection(db, 'users'), where('email', '==', cleanId));
          const snap = await getDocs(q);
          if (!snap.empty) {
            foundUser = snap.docs[0].data() as User;
            // If user exists in Firestore but not in Firebase Auth, sync to Auth
            if (!authUserUid && password && foundUser.password === password) {
              try {
                await createUserWithEmailAndPassword(auth, cleanId, password);
              } catch {
                // Ignore if already created
              }
            }
          }
        }
      } else {
        // Phone login: Query Firestore
        let q = query(collection(db, 'users'), where('phone', '==', cleanPhone));
        let snap = await getDocs(q);
        if (snap.empty) {
          q = query(collection(db, 'users'), where('phone', '==', identifier.trim()));
          snap = await getDocs(q);
        }
        if (!snap.empty) {
          foundUser = snap.docs[0].data() as User;
          // Sync with Firebase Auth using registered email
          if (foundUser.email && password) {
            try {
              await signInWithEmailAndPassword(auth, foundUser.email, password);
            } catch (authErr: any) {
              if (authErr?.code === 'auth/user-not-found') {
                try {
                  await createUserWithEmailAndPassword(auth, foundUser.email, password);
                } catch {
                  // Ignore
                }
              }
            }
          }
        }
      }

      if (!foundUser) {
        return {
          success: false,
          message: 'Operador não encontrado. Por favor, verifique seu telefone ou e-mail, ou cadastre-se.',
        };
      }

      if (foundUser.password && password && foundUser.password !== password) {
        return {
          success: false,
          message: 'Senha incorreta. Verifique suas credenciais de acesso.',
        };
      }

      localStorage.setItem('catoca_active_user_id', foundUser.id);
      setUser(foundUser);
      navigateTo('/pages/index/index');
      return { success: true };
    } catch (err: any) {
      console.error('Erro no login:', err);
      return {
        success: false,
        message: err?.message ? `Erro no banco de dados: ${err.message}` : 'Erro ao autenticar.',
      };
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
          phone: '923849120',
          phoneCode: '+244',
          email: demoEmail,
          password: demoPass,
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
          avatar: '/src/assets/images/catoca_diamond_gem_1792306524777.jpg',
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
    return {
      success: true,
      reward: 0,
      message: 'O lucro dos diamantes é gerado automaticamente a cada 24h pelo relógio regressivo!',
    };
  };

  // 6. Recharge in Firestore
  const recharge = async (amount: number, method: string) => {
    if (!user) return { success: false, message: 'Usuário não autenticado' };

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        balance: user.balance + amount,
        depositBalance: user.depositBalance + amount,
        luckyDrawSpins: user.luckyDrawSpins + 2,
      });

      const txId = `tx-rech-${Date.now()}`;
      const rechTx: Transaction = {
        id: txId,
        userId: user.id,
        type: 'recharge',
        amount,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Alocação de Capital Mineral Catoca via ${method.toUpperCase()}`,
      };
      await setDoc(doc(db, 'transactions', txId), rechTx);

      return {
        success: true,
        message: `Alocação de ${formatCurrency(amount)} confirmada na mina de Catoca!`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  // 7. Withdraw in Firestore (min 1000 Kz)
  const withdraw = async (amount: number, accountType: string, accountNumber: string, accountName: string) => {
    if (!user) return { success: false, message: 'Usuário não autenticado' };
    if (amount < 1000) return { success: false, message: 'O valor mínimo para levantamento é de 1.000 Kz' };
    if (amount > user.balance) return { success: false, message: 'Saldo insuficiente no cofre' };

    const netAmount = Math.round(amount * 0.95);

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        balance: user.balance - amount,
        depositBalance: Math.max(0, user.depositBalance - amount),
        bankAccount: {
          accountType,
          accountName,
          accountNumber,
          bankName: accountType === 'multicaixa' ? 'Banco Multicaixa AO' : 'Conta Externa',
        },
      });

      const txId = `tx-wd-${Date.now()}`;
      const wdTx: Transaction = {
        id: txId,
        userId: user.id,
        type: 'withdraw',
        amount: -amount,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Resgate de Rendimentos Catoca (${accountName} - ${accountNumber.slice(-4)}). Líquido: ${formatCurrency(netAmount)}`,
      };
      await setDoc(doc(db, 'transactions', txId), wdTx);

      return {
        success: true,
        message: `Ordem de saque de ${formatCurrency(amount)} emitida com prioridade!`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
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
    language,
    setLanguage,
    t: translations[language],
    currentRoute,
    navigateTo,
    routeParams,
    register,
    login,
    demoLogin,
    logout,
    claimDiamondLot,
    completedTaskIds,
    recharge,
    withdraw,
    upgradeVip,
    triggerSimulated24hProfit,
    lastAutoProfit,
    spinLuckyDraw,
    investInFund,
    investments,
    transactions,
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
