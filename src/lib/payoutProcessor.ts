// @ts-nocheck
import User from '@/models/User';

export async function processTutorWithdrawal(tutorId: string, amount: number) {
  try {
    const tutor = await User.findById(tutorId);
    if (!tutor) throw new Error("Tutor not found");

    // Bob may elect to withdraw into his PayPal account if that is in his profile
    const method = tutor.payoutMethod === 'paypal' ? 'PayPal' : 'Stripe';
    const account = tutor.payoutAccount || 'Default Account';

    return {
      success: true,
      method: method,
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      arrival: "1-3 Business Days"
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
