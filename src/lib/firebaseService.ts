import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { AppUser } from '../context/AuthContext';
import { MerchantOrder, AuditEntry, GrowthCampaign, Product } from '../types';

// 1. User Profile Storage in Firestore
export const saveUserToFirestore = async (user: AppUser) => {
  try {
    if (!user.uid) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL || null,
      role: user.role || 'buyer',
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore user save warning (handled gracefully):', error);
  }
};

// 2. Order Persistence in Firestore
export const saveOrderToFirestore = async (order: MerchantOrder) => {
  try {
    const orderRef = doc(db, 'orders', order.id || `ord-${Date.now()}`);
    await setDoc(orderRef, {
      ...order,
      createdAt: serverTimestamp(),
      firestoreSynced: true
    });
  } catch (error) {
    console.warn('Firestore order save warning (handled gracefully):', error);
  }
};

export const fetchOrdersFromFirestore = async (): Promise<MerchantOrder[]> => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    const orders: MerchantOrder[] = [];
    snapshot.forEach(docSnap => {
      orders.push(docSnap.data() as MerchantOrder);
    });
    return orders;
  } catch (error) {
    console.warn('Firestore fetch orders warning:', error);
    return [];
  }
};

// 3. Real-Time Audit Log Persistence in Firestore
export const saveAuditLogToFirestore = async (log: AuditEntry) => {
  try {
    const logRef = doc(db, 'audit_logs', log.id);
    await setDoc(logRef, {
      ...log,
      serverTime: serverTimestamp()
    });
  } catch (error) {
    console.warn('Firestore audit log save warning:', error);
  }
};

// 4. Growth Campaign Persistence
export const saveCampaignToFirestore = async (campaign: GrowthCampaign) => {
  try {
    const campRef = doc(db, 'campaigns', campaign.id);
    await setDoc(campRef, {
      ...campaign,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore campaign save warning:', error);
  }
};

// 5. Merchant Catalog Ingestion Persistence
export const saveCatalogBatchToFirestore = async (batchId: string, batchData: any) => {
  try {
    const batchRef = doc(db, 'catalog_batches', batchId);
    await setDoc(batchRef, {
      ...batchData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore catalog batch save warning:', error);
  }
};
