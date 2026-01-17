import clientPromise from "@/lib/mongodb";
import LessonCompletionModal from "@/components/tutor/LessonCompletionModal";

async function getTutorData() {
  const client = await clientPromise;
  const db = client.db("lernitt-v2");
  
  let tutor = await db.collection("users").findOne({ email: "bob@test.com" });

  if (!tutor) {
    const newBob = {
      email: "bob@test.com",
      name: "Bob",
      role: "tutor",
      balance: 50.00,
      paypalEmail: "bob-paypal@test.com"
    };
    await db.collection("users").insertOne(newBob);
    tutor = newBob;
  }

  return JSON.parse(JSON.stringify(tutor));
}

export default async function TutorProfilePage() {
  const tutor = await getTutorData();

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6">Tutor Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Available Funds</h2>
          <p className="text-4xl font-bold text-green-600">${tutor.balance.toFixed(2)}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Withdrawal Method</h2>
          <p className="text-lg font-semibold text-blue-600">PayPal: {tutor.paypalEmail}</p>
          <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition">
            Withdraw to PayPal
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-400 text-center">
        <h3 className="text-lg font-bold mb-2">Audit Test</h3>
        <p className="text-sm text-gray-600 mb-4">Click to simulate a $25 lesson (Adds $21.25 to balance).</p>
        <LessonCompletionModal tutorEmail={tutor.email} />
      </div>
    </div>
  );
}
