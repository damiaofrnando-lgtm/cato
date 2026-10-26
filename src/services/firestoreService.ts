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
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User, Transaction, UserInvestment, DiamondTask, Announcement, ConcessionStats } from '../types';
import { MOCK_TICKERS, INITIAL_DIAMOND_TASKS } from '../data/mockData';

/**
 * Camada de Serviço Oficial para Firestore - Sociedade Mineira de Catoca
 * Fornece métodos estruturados e assinaturas em tempo real (onSnapshot) para toda a plataforma.
 */

// ==========================================
// 1. SERVIÇOS DE OPERADOR / USUÁRIO
// ==========================================

export const subscribeToUser = (
  userId: string,
  onUpdate: (user: User | null) => void,
  onError?: (err: any) => void
): (() => void) => {
  if (!userId) {
    onUpdate(null);
    return () => {};
  }

  const userRef = doc(db, 'users', userId);
  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as User);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn(`[FirestoreService] Erro ao observar usuário ${userId}:`, err);
      if (onError) onError(err);
    }
  );
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    return snap.exists() ? (snap.data() as User) : null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${userId}`);
  }
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
};

export const saveUser = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
  }
};

// ==========================================
// 2. EXTRATO DE TRANSAÇÕES
// ==========================================

export const subscribeToUserTransactions = (
  userId: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: any) => void
): (() => void) => {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(collection(db, 'transactions'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Transaction);
      });
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate(list);
    },
    (err) => {
      console.warn(`[FirestoreService] Erro ao listar transações de ${userId}:`, err);
      if (onError) onError(err);
    }
  );
};

export const addTransaction = async (tx: Transaction): Promise<void> => {
  try {
    const txRef = doc(db, 'transactions', tx.id);
    await setDoc(txRef, tx);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `transactions/${tx.id}`);
  }
};

// ==========================================
// 3. AVISOS & LETREIRO EM TEMPO REAL (HomePage)
// ==========================================

export const subscribeToAnnouncements = (
  onUpdate: (announcements: Announcement[]) => void,
  onError?: (err: any) => void
): (() => void) => {
  const announcementsRef = collection(db, 'announcements');
  return onSnapshot(
    announcementsRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Inicializa com avisos padrão da mina se o banco estiver vazio
        seedDefaultAnnouncements();
        return;
      }
      const list: Announcement[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Announcement);
      });
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate(list);
    },
    (err) => {
      console.warn('[FirestoreService] Falha ao carregar letreiro de avisos. Usando dados locais:', err);
      if (onError) onError(err);
      const fallbackList: Announcement[] = MOCK_TICKERS.map((text, i) => ({
        id: `ann-local-${i + 1}`,
        text,
        type: i % 2 === 0 ? 'extraction' : 'withdrawal',
        timestamp: Date.now() - i * 60000,
        active: true,
      }));
      onUpdate(fallbackList);
    }
  );
};

export const seedDefaultAnnouncements = async (): Promise<void> => {
  try {
    const snap = await getDocs(collection(db, 'announcements'));
    if (!snap.empty) return;

    for (let i = 0; i < MOCK_TICKERS.length; i++) {
      const annId = `ann-catoca-${i + 1}`;
      const ann: Announcement = {
        id: annId,
        text: MOCK_TICKERS[i],
        type: i % 2 === 0 ? 'extraction' : 'withdrawal',
        timestamp: Date.now() - i * 60000,
        active: true,
      };
      await setDoc(doc(db, 'announcements', annId), ann);
    }
  } catch (err) {
    console.warn('[FirestoreService] Erro ao semear avisos iniciais:', err);
  }
};

// ==========================================
// 4. LOTES DE MINERAÇÃO EM TEMPO REAL (HomePage e Tasks)
// ==========================================

export const subscribeToMiningTasks = (
  onUpdate: (tasks: DiamondTask[]) => void,
  onError?: (err: any) => void
): (() => void) => {
  const tasksRef = collection(db, 'miningTasks');
  return onSnapshot(
    tasksRef,
    (snapshot) => {
      if (snapshot.empty) {
        seedDefaultMiningTasks();
        return;
      }
      const list: DiamondTask[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as DiamondTask);
      });
      list.sort((a, b) => a.id.localeCompare(b.id));
      onUpdate(list);
    },
    (err) => {
      console.warn('[FirestoreService] Falha ao carregar tarefas minerais. Usando tarefas padrão:', err);
      if (onError) onError(err);
      onUpdate(INITIAL_DIAMOND_TASKS);
    }
  );
};

export const seedDefaultMiningTasks = async (): Promise<void> => {
  try {
    const snap = await getDocs(collection(db, 'miningTasks'));
    if (!snap.empty) return;

    for (const task of INITIAL_DIAMOND_TASKS) {
      await setDoc(doc(db, 'miningTasks', task.id), task);
    }
  } catch (err) {
    console.warn('[FirestoreService] Erro ao semear tarefas minerais:', err);
  }
};

// ==========================================
// 5. MÉTRICAS DA CONCESSÃO CATOCA (HomePage e MinePage)
// ==========================================

export const subscribeToConcessionStats = (
  onUpdate: (stats: ConcessionStats) => void,
  onError?: (err: any) => void
): (() => void) => {
  const statsRef = doc(db, 'concession_stats', 'global');
  return onSnapshot(
    statsRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as ConcessionStats);
      } else {
        seedDefaultConcessionStats().then((s) => {
          if (s) onUpdate(s);
        });
      }
    },
    (err) => {
      console.warn('[FirestoreService] Erro ao monitorar métricas da concessão. Usando métricas padrão:', err);
      if (onError) onError(err);
      onUpdate({
        id: 'global',
        totalCaratsMined: 148290.45,
        activeOperatorsCount: 8412,
        totalDistributedKz: 948200000,
        concessionStatus: 'Operação Ativa 24h · UTM-1 e UTM-2',
        updatedAt: new Date().toISOString(),
      });
    }
  );
};

export const seedDefaultConcessionStats = async (): Promise<ConcessionStats | null> => {
  try {
    const statsRef = doc(db, 'concession_stats', 'global');
    const snap = await getDoc(statsRef);
    if (snap.exists()) {
      return snap.data() as ConcessionStats;
    }

    const defaultStats: ConcessionStats = {
      id: 'global',
      totalCaratsMined: 148290.45,
      activeOperatorsCount: 8412,
      totalDistributedKz: 948200000,
      concessionStatus: 'Operação Ativa 24h · UTM-1 e UTM-2',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(statsRef, defaultStats);
    return defaultStats;
  } catch (err) {
    console.warn('[FirestoreService] Erro ao semear estatísticas da concessão:', err);
    return null;
  }
};

// ==========================================
// 6. FUNDO DE KIMBERLITO (Investments)
// ==========================================

export const subscribeToInvestments = (
  userId: string,
  onUpdate: (investments: UserInvestment[]) => void,
  onError?: (err: any) => void
): (() => void) => {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(collection(db, 'investments'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: UserInvestment[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as UserInvestment);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn(`[FirestoreService] Erro ao listar investimentos de ${userId}:`, err);
      if (onError) onError(err);
    }
  );
};

export const addInvestment = async (inv: UserInvestment): Promise<void> => {
  try {
    const invRef = doc(db, 'investments', inv.id);
    await setDoc(invRef, inv);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `investments/${inv.id}`);
  }
};

// ==========================================
// 7. EQUIPE DE OPERADORES EM TEMPO REAL
// ==========================================

export const subscribeToTeamMembers = (
  inviteCode: string,
  onUpdate: (members: any[]) => void,
  onError?: (err: any) => void
): (() => void) => {
  if (!inviteCode) {
    onUpdate([]);
    return () => {};
  }

  const q = query(collection(db, 'users'), where('invitedBy', '==', inviteCode));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        const u = docSnap.data() as User;
        list.push({
          id: u.id,
          phone: u.phone ? `${u.phone.slice(0, 3)}****${u.phone.slice(-3)}` : 'Operador Catoca',
          joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : 'Hoje',
          level: 1,
          vipLevel: u.vipLevel || 0,
          totalEarnings: u.totalEarnings || 0,
          commissionEarned: Math.round((u.totalEarnings || 0) * 0.1),
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.warn(`[FirestoreService] Erro ao monitorar equipe de ${inviteCode}:`, err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
  );
};
