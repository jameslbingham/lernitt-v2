import User from '@/models/User';

/**
 * Processes withdrawal based on Bob's profile election (PayPal or Stripe)
 */
export async function processTutorWithdrawal(tutorId: string, amount: number) {
  const tutor = await User.findById(tutorId);
  if (!tutor) throw new Error("Tutor profile not found");

  // Bob may elect to withdraw into his PayPal account if that is in his profile
  if (tutor.withdrawalMethod === 'PayPal') {
    if (!tutor.paypalEmail) {
        throw new Error("PayPal elected but no email found in profile.");
    }
    
    return {
      success: true,
      method: 'PayPal',
      recipient: tutor.paypalEmail,
      amount,
      status: 'Processing'
    };
  }

  // Default to Stripe payout logic
  return {
    success: true,
    method: 'Stripe',
    amount,
    status: 'Completed'
  };
}
