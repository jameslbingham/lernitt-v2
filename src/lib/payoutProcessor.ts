import User from '@/models/User';

/**
 * Handles withdrawal logic. Bob may elect to withdraw into his PayPal account, 
 * if that is what he has placed in his profile.
 */
export async function processTutorWithdrawal(tutorId: string, amount: number) {
  const tutor = await User.findById(tutorId);

  if (!tutor) {
    throw new Error("Tutor profile not found");
  }

  // Check the withdrawal election from the User profile
  if (tutor.withdrawalMethod === 'PayPal') {
    if (!tutor.paypalEmail) {
      throw new Error("PayPal election found, but no PayPal email is set in the profile.");
    }
    
    return {
      success: true,
      method: 'PayPal',
      recipient: tutor.paypalEmail,
      amount: amount,
      status: 'Transfer Initiated'
    };
  }

  // Default to Stripe for all other cases
  return {
    success: true,
    method: 'Stripe',
    amount: amount,
    status: 'Transfer Initiated'
  };
}
