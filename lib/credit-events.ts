const CREDIT_EVENT = "thumbmaker:credits-updated";

export const CREDIT_EVENT_NAME = CREDIT_EVENT;

export function emitCreditsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CREDIT_EVENT));
}

export function subscribeCreditsUpdated(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(CREDIT_EVENT, handler);
  return () => {
    window.removeEventListener(CREDIT_EVENT, handler);
  };
}



