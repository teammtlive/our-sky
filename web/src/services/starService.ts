import {
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";
import type { Star } from "../types/star";

export async function createStar(name: string, wish: string): Promise<string> {
  const trimmedName = name.trim();
  const trimmedWish = wish.trim();

  if (!trimmedName) {
    throw new Error("Name is required.");
  }

  if (!trimmedWish) {
    throw new Error("Wish is required.");
  }

  const user = auth.currentUser;

  if (!user) {
    throw new Error("An authenticated user is required to create a star.");
  }

  const starRef = doc(collection(db, "stars"));

  await setDoc(starRef, {
    name: trimmedName,
    wish: trimmedWish,
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
    x: Math.random(),
    y: Math.random(),
    shineCount: 0,
    status: "active",
  });

  return starRef.id;
}

export async function getStar(starId: string): Promise<Star | null> {
  const starSnapshot = await getDoc(doc(db, "stars", starId));

  if (!starSnapshot.exists()) {
    return null;
  }

  return { id: starSnapshot.id, ...starSnapshot.data() } as Star;
}

export async function sendLight(starId: string): Promise<void> {
  await updateDoc(doc(db, "stars", starId), {
    shineCount: increment(1),
    lastShineAt: serverTimestamp(),
  });
}
