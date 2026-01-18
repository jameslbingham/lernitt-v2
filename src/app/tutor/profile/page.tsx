// @ts-nocheck
import clientPromise from "../../../lib/database/mongodb";
import LessonCompletionModal from "../../../components/tutor/LessonCompletionModal";
import WithdrawalButton from "../../../components/tutor/WithdrawalButton"; 
import TransactionHistory from "../../../components/tutor/TransactionHistory";

/**
 * Server-side data fetch with Self-Healing Logic
 * Ensures the tutor (Bob) exists in the 'lernitt-v2' database
 */
async function getTutorData() {
  const client = await clientPromise;
  const db = client.db("lernitt-v2");
  
  // Find Bob in the v2 database
  const tutorData = await db.collection("users").findOne({ email: "bob@test.com" });

  if (!tutorData) {
    const newBob = {
      email: "bob@test.com",
      name: "Bob",
      role: "tutor",
      balance: 50.00,
      totalEarnings: 50.00,
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
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="header-title">Tutor Hub</h1>
          <p className="header-subtitle">Welcome back, {tutor.name}</p>
        </div>
        <div className="header-right">
          <span className="badge-v2">v2.0 Stable</span>
        </div>
      </header>
      
      <div className="stats-container">
        {/* Available Funds Display */}
        <div className="stats-card balance-card">
          <h2 className="card-label">Available Funds</h2>
          <p className="amount-text">${tutor.balance.toFixed(2)}</p>
          <p className="sync-status">LEDGER_SYNC: SUCCESSFUL</p>
        </div>

        {/* Interactive Withdrawal Section */}
        <div className="stats-card withdrawal-card">
          <h2 className="card-label">Withdrawal Method</h2>
          <p className="method-text">PayPal: {tutor.paypalEmail}</p>
          
          <WithdrawalButton 
            balance={tutor.balance} 
            paypalEmail={tutor.paypalEmail}
            tutorId={tutor._id}
          />
        </div>
      </div>

      <div className="main-grid">
        {/* Test Controls */}
        <div className="audit-sidebar">
          <h3 className="audit-title">Audit Test</h3>
          <p className="audit-desc">
            Simulate a $25.00 student payment. The system automatically takes a 15% platform cut ($3.75) and adds $21.25 to your balance.
          </p>
          <LessonCompletionModal tutorEmail={tutor.email} />
        </div>

        {/* Phase 2: Transaction History Ledger */}
        <div className="ledger-content">
          <TransactionHistory tutorId={tutor._id} refreshTrigger={0} />
        </div>
      </div>

      <style jsx>{`
        .dashboard-wrapper {
          padding: 32px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: system-ui, -apple-system, sans-serif;
          background-color: #f9f9f9;
          min-height: 100vh;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          border-bottom: 2px solid #eee;
          padding-bottom: 24px;
        }
        .header-title {
          font-size: 32px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -1.5px;
          margin: 0;
        }
        .header-subtitle {
          color: #666;
          font-size: 14px;
          margin: 4px 0 0 0;
        }
        .badge-v2 {
          background-color: #000;
          color: #fff;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .stats-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        @media (min-width: 768px) {
          .stats-container { grid-template-columns: 1fr 1fr; }
        }
        .stats-card {
          background: #fff;
          border: 2px solid #000;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }
        .card-label {
          font-size: 10px;
          font-weight: 900;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 0 0 4px 0;
        }
        .amount-text {
          font-size: 48px;
          font-weight: 900;
          color: #16a34a;
          letter-spacing: -2px;
          margin: 0;
        }
        .method-text {
          font-size: 18px;
          font-weight: bold;
          color: #2563eb;
          margin: 0 0 16px 0;
        }
        .sync-status {
          font-size: 10px;
          color: #999;
          font-family: monospace;
          margin: 8px 0 0 0;
        }
        .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 1024px) {
          .main-grid { grid-template-columns: 1fr 2fr; }
        }
        .audit-sidebar {
          background-color: #111;
          color: #fff;
          padding: 24px;
          border-radius: 16px;
        }
        .audit-title {
          font-size: 18px;
          font-weight: 900;
          text-transform: uppercase;
          font-style: italic;
          color: #facc15;
          margin: 0 0 8px 0;
        }
        .audit-desc {
          font-size: 12px;
          color: #999;
          line-height: 1.6;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
}
