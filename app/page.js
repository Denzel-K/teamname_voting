import { useState } from 'react';
import { MongoClient } from 'mongodb';
import toast, { Toaster } from 'react-hot-toast';

const teamNames = [
  { id: 1, name: "Night Agents" },
  { id: 2, name: "Null Terminators" },
  { id: 3, name: "Engage360" },
  { id: 4, name: "Neon 360" },
  { id: 5, name: "Shadow Protocol" },
];

export default function VotePage({ initialVotes }) {
  const [voterName, setVoterName] = useState('');
  const [votes, setVotes] = useState([]);
  const [remainingVotes, setRemainingVotes] = useState(3);

  const handleRandomVote = () => {
    if (remainingVotes <= 0) {
      toast.error("You've used all 3 votes!");
      return;
    }

    const randomTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
    setVotes([...votes, randomTeam.id]);
    setRemainingVotes(remainingVotes - 1);
    toast.success(`Voted for ${randomTeam.name}! (${remainingVotes - 1} left)`);
  };

  const submitVotes = async () => {
    if (votes.length !== 3 || !voterName.trim()) {
      toast.error("Please cast 3 votes and enter your name!");
      return;
    }

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
      } else {
        toast.error("Failed to submit votes.");
      }
    } catch (error) {
      toast.error("Error submitting votes.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Toaster />
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Team Name Vote</h1>
        
        <div className="mb-4">
          <label className="block mb-2">Your Name:</label>
          <input
            type="text"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your name"
          />
        </div>

        <div className="mb-4">
          <p>Votes remaining: {remainingVotes}</p>
          <button
            onClick={handleRandomVote}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Random Vote
          </button>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold">Your Votes:</h2>
          <ul>
            {votes.map((voteId, index) => (
              <li key={index}>
                {teamNames.find((team) => team.id === voteId)?.name}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={submitVotes}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Submit Votes
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const votes = await db.collection('votes').find().toArray();
  await client.close();

  return {
    props: { initialVotes: votes },
  };
}