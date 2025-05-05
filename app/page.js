'use client';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const teamNames = [
  { id: 1, name: "Night Agents", description: "Stealthy cyber operatives" },
  { id: 2, name: "Null Terminators", description: "Eradicating bugs since day one" },
  { id: 3, name: "Engage360", description: "Full-circle development approach" },
  { id: 4, name: "Neon 360", description: "Futuristic all-around coders" },
  { id: 5, name: "Shadow Protocol", description: "Covert code specialists" },
];

export default function VotePage() {
  const [voterName, setVoterName] = useState('');
  const [votes, setVotes] = useState([]);
  const [remainingVotes, setRemainingVotes] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ totalVoters: 0, winner: null });
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Fetch voting stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/results');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    };
    
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRandomVote = () => {
    if (remainingVotes <= 0) return;

    const randomTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
    setVotes([...votes, randomTeam.id]);
    setRemainingVotes(remainingVotes - 1);
    toast.success(`Voted for ${randomTeam.name}! (${remainingVotes - 1} left)`);
  };

  const submitVotes = async () => {
    if (votes.length !== 3 || !voterName.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterName, votes }),
      });
      toast.success("Votes submitted!");
      setVotes([]);
      setRemainingVotes(3);
    } catch (error) {
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-4 md:p-8 text-gray-100">
      <Toaster toastOptions={{ 
        className: 'backdrop-blur-lg bg-black/30 text-white border border-gray-700' 
      }} />

      {/* Main Grid Layout */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Left Panel - Voting Interface */}
        <div className="md:col-span-2 space-y-6">
          <div className="backdrop-blur-lg bg-white/5 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
              Team Name Vote
            </h1>
            <p className="text-gray-400 mb-6">Choose your favorite 3 times</p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Your Name</label>
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full p-3 bg-black/30 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRandomVote}
                  disabled={remainingVotes <= 0}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    remainingVotes <= 0 
                      ? 'bg-gray-700/50 cursor-not-allowed' 
                      : 'bg-blue-600/90 hover:bg-blue-700/90'
                  }`}
                >
                  {remainingVotes > 0 ? `Random Vote (${remainingVotes} left)` : 'Votes Used'}
                </button>

                <button
                  onClick={submitVotes}
                  disabled={votes.length !== 3 || !voterName.trim() || isSubmitting}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    votes.length !== 3 || !voterName.trim()
                      ? 'bg-gray-700/50 cursor-not-allowed'
                      : 'bg-green-600/90 hover:bg-green-700/90'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Votes'}
                </button>
              </div>
            </div>
          </div>

          {/* Current Votes */}
          <div className="backdrop-blur-lg bg-white/5 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Your Selections</h2>
            {votes.length === 0 ? (
              <p className="text-gray-400 italic">No votes yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {votes.map((voteId, index) => {
                  const team = teamNames.find(t => t.id === voteId);
                  return (
                    <div key={index} className="bg-black/20 p-4 rounded-lg border border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-600/80 rounded-full text-sm font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-medium">{team?.name}</h3>
                          <p className="text-xs text-gray-400">{team?.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Results & Info */}
        <div className="space-y-6">
          {/* Results Card */}
          <div className="backdrop-blur-lg bg-white/5 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Live Results</h2>
              <button 
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="text-xs bg-black/30 px-2 py-1 rounded hover:bg-black/50"
              >
                {showHowItWorks ? 'Hide' : 'How?'}
              </button>
            </div>

            {showHowItWorks && (
              <div className="mb-4 p-3 bg-black/30 rounded-lg text-sm border border-gray-700/50">
                <p className="mb-2">The winner is determined by:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Each member casts exactly 3 votes</li>
                  <li>We count which team gets the most votes overall</li>
                  <li>Requires ≥2 voters to declare a winner</li>
                  <li>Ties are resolved by earliest vote timestamp</li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black/30 p-3 rounded-lg text-center border border-gray-700/50">
                <div className="text-2xl font-bold">{stats.totalVoters}</div>
                <div className="text-xs text-gray-400">Voters</div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg text-center border border-gray-700/50">
                <div className="text-2xl font-bold">{stats.totalVoters * 3}</div>
                <div className="text-xs text-gray-400">Total Votes</div>
              </div>
            </div>

            {stats.winner ? (
              <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/30 p-4 rounded-lg border border-cyan-500/30">
                <h3 className="text-sm font-semibold text-cyan-300 mb-1">Current Winner</h3>
                <p className="text-2xl font-bold">
                  {teamNames.find(t => t.id === stats.winner)?.name}
                </p>
              </div>
            ) : stats.totalVoters >= 2 ? (
              <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/30 text-center">
                <p className="text-yellow-300">Calculating winner...</p>
              </div>
            ) : (
              <div className="bg-black/30 p-4 rounded-lg border border-gray-700/50 text-center">
                <p className="text-gray-400">Waiting for more voters</p>
                <p className="text-xs mt-1">(Need ≥2 voters)</p>
              </div>
            )}
          </div>

          {/* Team Options */}
          <div className="backdrop-blur-lg bg-white/5 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Team Options</h2>
            <div className="space-y-3">
              {teamNames.map(team => (
                <div key={team.id} className="bg-black/20 p-3 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded-full text-xs font-bold">
                      {team.id}
                    </span>
                    <div>
                      <h3 className="font-medium">{team.name}</h3>
                      <p className="text-xs text-gray-400">{team.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}