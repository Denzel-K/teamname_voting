import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { voterName, votes } = req.body;

  if (!voterName || !votes || votes.length !== 3) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    await db.collection('votes').insertOne({ voterName, votes, timestamp: new Date() });
    res.status(200).json({ message: 'Votes saved!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving votes' });
  } finally {
    await client.close();
  }
}