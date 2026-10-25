/**
 * Live student ↔ professional link between browser tabs/windows (same origin).
 * Open a student window and a pro window side by side: pro activity on the
 * student's project shows up instantly, and student reactions flow back.
 */
export type BridgeEvent =
  /** pro → student: a note on the student's demo */
  | {
      type: "feedback";
      id: string;
      demoId: string;
      fromName: string;
      fromTitle: string;
      text: string;
      at: number;
    }
  /** pro → student: opened or tried the student's demo */
  | { type: "view" | "try"; demoId: string; fromName: string; fromTitle: string }
  /** student → pro: marked a note helpful, or replied to it */
  | { type: "helpful"; commentId: string; fromName: string }
  | { type: "reply"; commentId: string; fromName: string; text: string };

const CHANNEL = "cc-bridge";

function channel() {
  return typeof BroadcastChannel === "undefined"
    ? null
    : new BroadcastChannel(CHANNEL);
}

export function postBridge(event: BridgeEvent) {
  const ch = channel();
  ch?.postMessage(event);
  ch?.close();
}

export function onBridge(cb: (event: BridgeEvent) => void) {
  const ch = channel();
  if (!ch) return () => {};
  ch.onmessage = (e: MessageEvent<BridgeEvent>) => cb(e.data);
  return () => ch.close();
}
