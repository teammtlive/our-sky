import { onAuthStateChanged } from "firebase/auth";
import { type FormEvent, useEffect, useState } from "react";

import "./App.css";
import { auth } from "./lib/firebase";
import { createStar, getStar, sendLight } from "./services/starService";
import type { Star } from "./types/star";

function App() {
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [userUid, setUserUid] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedStarId, setSavedStarId] = useState<string | null>(() =>
    localStorage.getItem("our-sky-star-id"),
  );
  const [myStar, setMyStar] = useState<Star | null>(null);
  const [isStarLoading, setIsStarLoading] = useState(false);
  const [starLoadError, setStarLoadError] = useState<string | null>(null);
  const [isSendingLight, setIsSendingLight] = useState(false);
  const [isLightCooldown, setIsLightCooldown] = useState(false);
  const [lightMessage, setLightMessage] = useState<string | null>(null);
  const [lightError, setLightError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUserUid(user?.uid ?? null);
    });
  }, []);

  useEffect(() => {
    if (!savedStarId || !userUid) {
      return;
    }

    const starId = savedStarId;
    let isCurrent = true;

    async function loadSavedStar() {
      setIsStarLoading(true);
      setStarLoadError(null);

      try {
        const star = await getStar(starId);

        if (isCurrent) {
          setMyStar(star);
        }
      } catch {
        if (isCurrent) {
          setStarLoadError("ไม่สามารถโหลดดาวของคุณได้ โปรดลองอีกครั้ง");
        }
      } finally {
        if (isCurrent) {
          setIsStarLoading(false);
        }
      }
    }

    void loadSavedStar();

    return () => {
      isCurrent = false;
    };
  }, [savedStarId, userUid]);

  useEffect(() => {
    if (!isLightCooldown) {
      return;
    }

    const cooldownTimer = window.setTimeout(() => {
      setIsLightCooldown(false);
    }, 3000);

    return () => {
      window.clearTimeout(cooldownTimer);
    };
  }, [isLightCooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userUid || isSubmitting || savedStarId) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const starId = await createStar(name, wish);

      localStorage.setItem("our-sky-star-id", starId);
      setSavedStarId(starId);
      setMyStar(null);
      setIsStarLoading(true);
      setStarLoadError(null);
      setSuccessId(starId);
      setSubmittedName(name.trim());
      setName("");
      setWish("");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "ไม่สามารถส่งคำอธิษฐานได้ โปรดลองอีกครั้ง",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendLight() {
    if (!savedStarId || isSendingLight || isLightCooldown) {
      return;
    }

    setIsSendingLight(true);
    setLightMessage(null);
    setLightError(null);

    try {
      await sendLight(savedStarId);
      setMyStar((star) =>
        star ? { ...star, shineCount: star.shineCount + 1 } : star,
      );
      setLightMessage("ส่งแสงให้ดาวของคุณแล้ว ✨");
      setIsLightCooldown(true);
    } catch {
      setLightError("ไม่สามารถส่งแสงได้ โปรดลองอีกครั้ง");
    } finally {
      setIsSendingLight(false);
    }
  }

  const isAuthReady = Boolean(userUid);

  return (
    <main className="submission-page">
      <section className="submission-card" aria-labelledby="page-title">
        <p className="eyebrow">ท้องฟ้ายามค่ำคืนของเรา</p>
        <h1 id="page-title">OUR SKY</h1>
        <p className="subtitle">
          ฝากคำอธิษฐานของคุณไว้บนท้องฟ้ายามค่ำคืน เพื่อให้มันได้ส่องแสงอยู่ที่นี่
        </p>

        {successId && (
          <div className="success" aria-live="polite">
            <p>ดาวของคุณถูกสร้างแล้ว ✨</p>
            <p>
              ชื่อของคุณ: <strong>{submittedName}</strong>
            </p>
            <p>กลับมาดูดาวของฉันได้จากเครื่องนี้</p>
            <p className="star-id">
              รหัสดาวของคุณ: <code>{successId}</code>
            </p>
          </div>
        )}

        {savedStarId ? (
          <section className="my-star-panel" aria-live="polite">
            <h2>ดาวของฉัน</h2>
            {!isAuthReady && <p>กำลังเตรียมตัวตนของคุณ...</p>}
            {isAuthReady && isStarLoading && <p>กำลังค้นหาดาวของคุณ...</p>}
            {starLoadError && <p className="error">{starLoadError}</p>}
            {isAuthReady && !isStarLoading && !starLoadError && !myStar && (
              <p>ไม่พบดาวที่บันทึกไว้ในเครื่องนี้</p>
            )}
            {myStar && (
              <>
                <dl className="star-details">
                  <div>
                    <dt>ชื่อ</dt>
                    <dd>{myStar.name}</dd>
                  </div>
                  <div>
                    <dt>คำอธิษฐาน</dt>
                    <dd>{myStar.wish}</dd>
                  </div>
                  <div>
                    <dt>รหัสดาว</dt>
                    <dd>
                      <code>{myStar.id}</code>
                    </dd>
                  </div>
                </dl>

                <button
                  className="send-light-button"
                  type="button"
                  onClick={handleSendLight}
                  disabled={isSendingLight || isLightCooldown}
                >
                  ✨ ส่งแสง / SEND LIGHT
                </button>
                <div className="light-message" aria-live="polite">
                  {isSendingLight && <p>กำลังส่งแสง...</p>}
                  {isLightCooldown && <p>รอ 3 วินาทีก่อนส่งแสงอีกครั้ง</p>}
                  {lightMessage && <p className="light-success">{lightMessage}</p>}
                  {lightError && <p className="error">{lightError}</p>}
                </div>
              </>
            )}
          </section>
        ) : (
          <>
            <form className="wish-form" onSubmit={handleSubmit}>
              <label htmlFor="name">ชื่อของคุณ</label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="อยากให้เราเรียกคุณว่าอะไร"
                disabled={!isAuthReady || isSubmitting}
                required
              />

              <label htmlFor="wish">คำอธิษฐาน</label>
              <textarea
                id="wish"
                name="wish"
                value={wish}
                onChange={(event) => setWish(event.target.value)}
                placeholder="เขียนสิ่งที่คุณอยากฝากไว้กับท้องฟ้า"
                rows={5}
                disabled={!isAuthReady || isSubmitting}
                required
              />

              <button type="submit" disabled={!isAuthReady || isSubmitting}>
                {isSubmitting ? "กำลังส่ง..." : "ส่งคำอธิษฐาน"}
              </button>
            </form>

            <div className="message" aria-live="polite">
              {!isAuthReady && <p>กำลังเตรียมตัวตนของคุณ...</p>}
              {error && <p className="error">{error}</p>}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
