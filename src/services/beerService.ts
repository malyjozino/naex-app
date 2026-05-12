import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, serverTimestamp, orderBy, onSnapshot, limit, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';
import { User, BeerPost, getRank } from '../types';
import { isYesterday, isToday, parseISO } from 'date-fns';
import imageCompression from 'browser-image-compression';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    }
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const beerService = {
  async compressImage(file: File) {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Compression error:', error);
      return file; // Fallback to original
    }
  },

  async addBeerEx(
    user: User, 
    amount: 0.3 | 0.5, 
    photoBlob: Blob, 
    postId: string,
    onProgress?: (progress: number) => void
  ) {
    const storageRef = ref(storage, `beers/${user.id}/${postId}`);
    
    try {
      // 1. Upload photo with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, photoBlob);

      const photoUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          }, 
          (error) => reject(error), 
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      // 2. Local Stats calculation for the Post (Optimistic)
      const newTotalLitres = Number((user.totalLitres + amount).toFixed(1));
      
      const now = new Date();
      const lastDate = user.lastBeerDate ? parseISO(user.lastBeerDate) : null;
      let newStreakCurrent = user.streakCurrent;

      if (!lastDate) {
        newStreakCurrent = 1;
      } else if (isToday(lastDate)) {
        // Same day, streak persists
      } else if (isYesterday(lastDate)) {
        newStreakCurrent += 1;
      } else {
        newStreakCurrent = 1;
      }

      const newStreakLongest = Math.max(newStreakCurrent, user.streakLongest);
      const newRank = getRank(newTotalLitres);

      // 3. Create post
      const postData: Omit<BeerPost, 'id'> = {
        userId: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        photoUrl,
        amount,
        timestamp: serverTimestamp(),
        totalLitresAfter: newTotalLitres,
        reactions: { '🍺': [], '🔥': [], '💀': [], '😂': [] }
      };

      await setDoc(doc(db, 'posts', postId), postData);

      // 4. Update user with Atomic Increment
      const userRef = doc(db, 'users', user.id);
      const userUpdate: any = {
        totalLitres: increment(amount),
        totalBeers: increment(1),
        streakCurrent: newStreakCurrent,
        streakLongest: newStreakLongest,
        lastBeerDate: now.toISOString(),
        rankTitle: newRank
      };

      await updateDoc(userRef, userUpdate);

      // Return the optimistic user state (optional, as subscriber will update UI)
      return { 
        ...user, 
        totalLitres: newTotalLitres,
        totalBeers: user.totalBeers + 1,
        streakCurrent: newStreakCurrent,
        streakLongest: newStreakLongest,
        lastBeerDate: now.toISOString(),
        rankTitle: newRank
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'posts/users');
    }
  },

  // Keep old addBeer for compatibility if needed, but we'll use addBeerEx
  async addBeer(user: User, amount: 0.3 | 0.5, photoFile: File) {
    const compressedFile = await this.compressImage(photoFile);
    const postId = doc(collection(db, 'posts')).id;
    return this.addBeerEx(user, amount, compressedFile, postId);
  },

  async toggleReaction(postId: string, emoji: string, userId: string, hasReacted: boolean) {
    const postRef = doc(db, 'posts', postId);
    try {
      await updateDoc(postRef, {
        [`reactions.${emoji}`]: hasReacted ? arrayRemove(userId) : arrayUnion(userId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
    }
  },

  subscribeToFeed(callback: (posts: BeerPost[]) => void) {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BeerPost));
      callback(posts);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));
  },

  subscribeToLeaderboard(callback: (users: User[]) => void) {
    const q = query(collection(db, 'users'), orderBy('totalLitres', 'desc'), limit(20));
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      callback(users);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
  },

  subscribeToUser(userId: string, callback: (user: User) => void) {
    return onSnapshot(doc(db, 'users', userId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as User);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${userId}`));
  }
};

export const authService = {
  async register(nickname: string, pin: string, avatar: string): Promise<User> {
    // Check if nickname exists
    const q = query(collection(db, 'users'), where('nickname', '==', nickname));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Nickname already taken, traveler! Choose another.');
    }

    const userId = doc(collection(db, 'users')).id;
    const user: User = {
      id: userId,
      nickname,
      pin,
      avatar,
      totalLitres: 0,
      totalBeers: 0,
      streakCurrent: 0,
      streakLongest: 0,
      rankTitle: getRank(0)
    };

    try {
      await setDoc(doc(db, 'users', userId), user);
      return user;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}`);
      throw error;
    }
  },

  async login(nickname: string, pin: string): Promise<User> {
    const q = query(collection(db, 'users'), where('nickname', '==', nickname), where('pin', '==', pin));
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error('Wrong nickname or PIN. The tavern door remains shut.');
      }
      const userData = querySnapshot.docs[0].data();
      return { id: querySnapshot.docs[0].id, ...userData } as User;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
      throw error;
    }
  }
};
