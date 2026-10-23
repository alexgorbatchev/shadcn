import { useEffect } from "react";

export interface IDocumentGuardProps {
  /** Defaults to the current document, including its portals. Supply an iframe's document to observe it instead. */
  ownerDocument?: Document;
}

type ObserveDocument = (document: Document) => () => void;
interface IGuardRegistration {
  users: number;
  disconnect: () => void;
}

const registrations = new WeakMap<Document, Map<ObserveDocument, IGuardRegistration>>();

/** Share each development guard's observation across sibling and nested providers. */
export function useDocumentGuard(observe: ObserveDocument, ownerDocument?: Document): void {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const target = ownerDocument ?? document;
    let observers = registrations.get(target);
    if (!observers) {
      observers = new Map();
      registrations.set(target, observers);
    }
    let registration = observers.get(observe);
    if (!registration) {
      registration = { users: 0, disconnect: observe(target) };
      observers.set(observe, registration);
    }
    registration.users++;
    return () => {
      registration.users--;
      if (!registration.users) {
        registration.disconnect();
        observers.delete(observe);
        if (!observers.size) registrations.delete(target);
      }
    };
  }, [observe, ownerDocument]);
}
