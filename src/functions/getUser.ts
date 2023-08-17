import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../services/api';
import { User } from 'firebase/auth';

export async function getUserFromFirestore(userId: string): Promise<User> {
  const userRef = doc(firestore, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return {} as User;
  }

  const userData = userDoc.data() as User;
  return userData ? userData : {} as User;
}
