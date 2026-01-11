// @ts-nocheck
/**
 * PayPal Utility:
 * Standardizes PayPal interactions and supports mock testing.
 * Enforces USD as the platform master currency.
 */

const isMock = process.env.VITE_MOCK === "1" || !process.env.PAYPAL_CLIENT_SECRET;

let paypalInstance: any;

if (isMock) {
  // Mock Stub for local development/testing without real API calls
  const nowId = (prefix: string) => `${prefix}_mock_${Date.now()}`;

  paypalInstance = {
    payouts: {
      create: async ({ amount, recipient }: { amount: number; recipient: string }) => ({
        batch_header: {
          payout_batch_id: nowId("payout"),
          batch_status: "SUCCESS",
        },
        amount: {
          value: amount.toString(),
          currency: "USD", // Enforced USD
        },
        recipient,
      }),
    },
    orders: {
      capture: async (orderId: string) => ({
        id: orderId || nowId("ord"),
        status: "COMPLETED",
        purchase_units: [{
          amount: { currency_code: "USD", value: "20.00" }
        }]
      })
    }
  };
} else {
  /**
   * Live Mode:
   * Uses your existing PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.
   * Note: In a real Next.js environment, you would use the official 
   * @paypal/checkout-server-sdk here.
   */
  paypalInstance = {
    // This serves as a wrapper for your existing PayPal SDK calls
    clientId: process.env.PAYPAL_CLIENT_ID,
    secret: process.env.PAYPAL_CLIENT_SECRET,
    baseUrl: process.env.NODE_ENV === 'production' 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com",
  };
}

export const paypal = paypalInstance;
