// app/api/results/route.js
import { MongoClient } from 'mongodb';

export async function GET() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const allVotes = await db.collection('votes').find().toArray();
    
    // Count unique voters
    const uniqueVoters = [...new Set(allVotes.map(vote => vote.voterName))].length;

    // Calculate mode
    const votes = allVotes.flatMap(entry => entry.votes);
    const frequency = {};
    let maxCount = 0;
    let winner = null;

    votes.forEach(vote => {
      frequency[vote] = (frequency[vote] || 0) + 1;
      if (frequency[vote] > maxCount) {
        maxCount = frequency[vote];
        winner = vote;
      }
    });

    return new Response(JSON.stringify({ 
      winner: uniqueVoters >= 2 ? winner : null,
      totalVoters: uniqueVoters
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error fetching results' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await client.close();
  }
}