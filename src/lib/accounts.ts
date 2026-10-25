import type { SessionKind, SignupProfile } from "@/lib/rung-store";

/** Prototype-only account list (no backend): email → saved onboarding. */
const ACCOUNTS_KEY = "cc-accounts-v1";

type SavedAccount = { kind: SessionKind; profile: SignupProfile };

function readAll(): Record<string, SavedAccount> {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveAccount(kind: SessionKind, profile: SignupProfile) {
  try {
    const all = readAll();
    all[profile.email.trim().toLowerCase()] = { kind, profile };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function findAccount(email: string, kind: SessionKind) {
  const acct = readAll()[email.trim().toLowerCase()];
  return acct?.kind === kind ? acct.profile : null;
}
