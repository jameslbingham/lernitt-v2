// @ts-nocheck
import clientPromise from "../../../lib/mongodb";
import LessonCompletionModal from "../../../components/tutor/LessonCompletionModal";
import WithdrawalButton from "../../../components/tutor/WithdrawalButton"; // We will ensure this is a Client Component
import TransactionHistory from "../../../components/tutor/TransactionHistory";

async function getTutorData() {
  const client = await clientPromise;
  const db = client.db("lernitt-v2");
  
  // 1. Self-Healing Bob Logic (Kept from current v2)
  const tutorData = await db.collection("users").findOne({ email: "bob@test.com" });

  if (!tutorData) {
    const newBob = {
      email: "bob@test.com",
      name: "Bob",
      role: "tutor",
      balance: 50.00, // Starting balance for Day 10/11 testing
      totalEarnings: 50.00, // Syncing with your existing processor's field
      payoutMethod: "paypal",
      paypalEmail: "bob-paypal@test.com"
    };
    await db.collection("users").insertOne(newBob);
    return JSON.parse(JSON.stringify(newBob));
  }

  return JSON.parse(JSON.stringify(tutorData));
}

export default async function TutorProfilePage() {
  const tutor = await getTutorData();

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <header className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Tutor Hub</h1>
          <p className="text-gray-500 text-sm">Welcome back, {tutor.name}</p>
        </div>
        <div className="text-right">
          <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            v2.0 Stable
          </span>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Available Funds Display */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border-2 border-black">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Funds</h2>
          <p className="text-5xl font-black text-green-600 tracking-tighter">
            ${tutor.balance.toFixed(2)}
          </p>
          <p className="text-[10px] text-gray-400 mt-2 font-mono">LEDGER_SYNC: SUCCESSFUL</p>
        </div>

        {/* Interactive Withdrawal Section */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border-2 border-black">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Withdrawal Method</h2>
          <p className="text-lg font-bold text-blue-600">PayPal: {tutor.paypalEmail}</p>
          
          {/* Integrated Client-Side Button from v1 logic */}
          <WithdrawalButton 
            balance={tutor.balance} 
            paypalEmail={tutor.paypalEmail}
            tutorId={tutor._id}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Controls */}
        <div className="lg:col-span-1 bg-gray-900 text-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-black mb-2 uppercase italic text-yellow-400">Audit Test</h3>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Simulate a $25.00 student payment. The system automatically takes a 15% platform cut ($3.75) and adds $21.25 to your balance.
          </p>
          <LessonCompletionModal tutorEmail={tutor.email} />
        </div>

        {/* Phase 2: Transaction History Ledger */}
        <div className="lg:col-span-2">
          <TransactionHistory tutorId={tutor._id} />
        </div>
      </div>
    </div>
  );
}
