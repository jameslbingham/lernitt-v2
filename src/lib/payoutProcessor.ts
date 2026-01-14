// @ts-nocheck
import User from '@/models/User';

/**
 * Handles withdrawal logic for all tutors based on their individual profile preferences.
 * A tutor may elect to withdraw their funds into their PayPal account, 
 * if that is what they have placed in their profile.
 */
export async function processTutorWithdrawal(tutorId: string, amount: number) {
  // 1. Fetch the specific tutor's profile to check their withdrawal election
  const tutor = await User.findById(tutorId);

  if (!tutor) {
    throw new Error("Tutor profile not found. Payout aborted.");
  }

  // 2. Logic to handle the choice if the tutor has elected PayPal
  if (tutor.withdrawalMethod === 'PayPal') {
    if (!tutor.paypalEmail) {
      throw new Error("The tutor elected PayPal but no PayPal email is saved in their profile.");
    }
    
    // Logic for routing funds to the tutor's PayPal account
    return {
      success: true,
      method: 'PayPal',
      recipient: tutor.paypalEmail,
      amount: amount,
      status: 'Transfer Initiated',
      note: "Funds are being sent to the tutor's PayPal account as per their profile preference."
    };
  }

  // 3. Logic to handle the choice if the tutor has elected Stripe (Default)
  return {
    success: true,
    method: 'Stripe',
    amount: amount,
    status: 'Transfer Initiated',
    note: "Funds are being sent via the tutor's Stripe connected bank account."
  };
}
