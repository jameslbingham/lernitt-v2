import User from '@/models/User';

/**
 * Handles withdrawal logic based on user profile preferences.
 */
export async function processTutorWithdrawal(tutorId: string, amount: number) {
  const tutor = await User.findById(tutorId);

  if (!tutor) {
    throw new Error("Tutor not found");
  }

  // Bob may elect to withdraw into his PayPal account if that is in his profile
  if (tutor.withdrawalMethod === 'PayPal') {
    if (!tutor.paypalEmail) {
      throw new Error("PayPal elected but no email address found in profile.");
    }
    
    // Payout logic for PayPal
    return {
      success: true,
      method: 'PayPal',
      recipient: tutor.paypalEmail,
      amount: amount,
      status: 'Transfer Initiated'
    };
  }

  // Default to Stripe payout logic
  return {
    success: true,
    method: 'Stripe',
    amount: amount,
    status: 'Transfer Initiated'
  };
}
