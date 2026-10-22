"use client";

import { useEffect } from "react";
import { observeScrollGuards } from "../utils/observeScrollGuards.js";

interface IScrollGuardRegistration {
  users: number;
  disconnect: () => void;
}

export interface IScrollGuardProps {
  /** Defaults to the current document. Supply an iframe's document to check its elements. */
  ownerDocument?: Document;
}

// Document-owned registrations keep nested or sibling providers from installing duplicate observers.
const registrations = new WeakMap<Document, IScrollGuardRegistration>();

/** Development-only errors for user-scrollable overflow on elements marked data-scroll="none". */
export function ScrollGuard({ ownerDocument }: IScrollGuardProps): null {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const target = ownerDocument ?? document;
    let registration = registrations.get(target);
    if (!registration) {
      registration = { users: 0, disconnect: observeScrollGuards(target) };
      registrations.set(target, registration);
    }
    registration.users++;
    return () => {
      registration.users--;
      if (!registration.users) {
        registration.disconnect();
        registrations.delete(target);
      }
    };
  }, [ownerDocument]);
  return null;
}
