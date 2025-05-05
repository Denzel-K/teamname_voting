import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const allVotes = await db.collection('votes').find().toArray();

    // Flatten all votes into a single array
    const votes = allVotes.flatMap(entry => entry.votes);

    // Calculate mode (most frequent vote)
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

    res.status(200).json({ winner });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results' });
  } finally {
    await client.close();
  }
}