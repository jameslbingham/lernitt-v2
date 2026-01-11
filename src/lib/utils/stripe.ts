// @ts-nocheck
import Stripe from 'stripe';

/**
 * Merged Stripe Utility:
 * Ported from V1 to support both live and mock modes.
 * Enforces USD as the platform master currency.
 */

// Treat as mock if VITE_MOCK is 1 or if the secret key is missing
const isMock = process.env.VITE_MOCK === "1" || !process.env.STRIPE_SECRET_KEY;

let stripeInstance: any;

if (isMock) {
  // Lightweight stub from your V1 build
  const nowId = (prefix: string) => `${prefix}_mock_${Date.now()}`;

  stripeInstance = {
    accounts: {
      create: async ({ email }: { email: string }) => ({
        id: nowId("acct"),
        object: "account",
        type: "express",
        email: email || "mock@example.com",
      }),
    },
    accountLinks: {
      create: async ({ account }: { account: string }) => ({
        object: "account_link",
        url: "https://example.com/mock-stripe-onboarding?acct=" + account,
      }),
    },
    transfers: {
      create: async ({ amount, destination }: { amount: number; destination: string }) => ({
        id: nowId("tr"),
        object: "transfer",
        amount: amount || 0,
        currency: "usd", // Enforced USD for V2
        destination: destination || nowId("acct"),
        status: "succeeded",
      }),
    },
  };
} else {
  // Live mode using your existing secret key
  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });
}

export const stripe = stripeInstance;
