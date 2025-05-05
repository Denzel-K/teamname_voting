'use client';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const teamNames = [
  { id: 1, name: "Night Agents" },
  { id: 2, name: "Null Terminators" },
  { id: 3, name: "Engage360" },
  { id: 4, name: "Neon 360" },
  { id: 5, name: "Shadow Protocol" },
];

export default function VotePage() {
  const [voterName, setVoterName] = useState('');
  const [votes, setVotes] = useState([]);
  const [remainingVotes, setRemainingVotes] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalVoters, setTotalVoters] = useState(0);
  const [winner, setWinner] = useState(null);

  // Fetch current voting stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/results');
        const data = await response.json();
        setTotalVoters(data.totalVoters || 0);
        if (data.totalVoters >= 2) {
          setWinner(data.winner);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    };
    
    const interval = setInterval(fetchStats, 5000); // Poll every 5 seconds
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
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterName, votes }),
      });

      if (response.ok) {
        toast.success("Votes submitted!");
        setVotes([]);
        setRemainingVotes(3);
        // Refresh stats after submission
        const stats = await fetch('/api/results').then(res => res.json());
        setTotalVoters(stats.totalVoters);
      } else {
        throw new Error('Failed to submit votes');
      }
    } catch (error) {
      toast.error("Error submitting votes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <Toaster position="top-center" toastOptions={{ className: 'bg-gray-800 text-white' }} />
      <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">Team Name Vote</h1>
        
        {/* Voter Info */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-300">Your Name:</label>
          <input
            type="text"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>

        {/* Voting Controls */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-300">Votes remaining: {remainingVotes}</span>
            <button
              onClick={handleRandomVote}
              disabled={remainingVotes <= 0}
              className={`px-4 py-2 rounded ${remainingVotes <= 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Random Vote
            </button>
          </div>

          {/* Current Votes */}
          <div className="mb-4">
            <h2 className="font-semibold text-gray-300 mb-2">Your Votes:</h2>
            {votes.length === 0 ? (
              <p className="text-gray-400 italic">No votes yet</p>
            ) : (
              <ul className="space-y-1">
                {votes.map((voteId, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                      {index + 1}
                    </span>
                    {teamNames.find((team) => team.id === voteId)?.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={submitVotes}
            disabled={votes.length !== 3 || !voterName.trim() || isSubmitting}
            className={`w-full py-2 rounded font-medium ${votes.length !== 3 || !voterName.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Votes'}
          </button>
        </div>

        {/* Results Section */}
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h2 className="font-bold text-lg mb-3 text-center">Current Status</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 p-3 rounded text-center">
              <div className="text-2xl font-bold">{totalVoters}</div>
              <div className="text-sm text-gray-400">Voters</div>
            </div>
            <div className="bg-gray-800 p-3 rounded text-center">
              <div className="text-2xl font-bold">{totalVoters * 3}</div>
              <div className="text-sm text-gray-400">Total Votes</div>
            </div>
          </div>

          {winner ? (
            <div className="bg-blue-900/30 p-4 rounded border border-blue-500">
              <h3 className="font-bold text-blue-400 mb-1">Current Winner:</h3>
              <p className="text-xl">{teamNames.find(t => t.id === winner)?.name}</p>
            </div>
          ) : totalVoters >= 2 ? (
            <div className="text-yellow-400 text-center py-3">
              Calculating winner...
            </div>
          ) : (
            <div className="text-gray-400 text-center py-3">
              Waiting for at least 2 voters to determine winner
            </div>
          )}
        </div>

        {/* All Team Options */}
        <div className="mt-6">
          <h2 className="font-bold mb-3 text-center">Team Name Options</h2>
          <ul className="space-y-2">
            {teamNames.map((team) => (
              <li key={team.id} className="flex items-center bg-gray-700/50 p-3 rounded">
                <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                  {team.id}
                </span>
                {team.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}