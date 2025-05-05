import { MongoClient } from 'mongodb';

export async function POST(request) {
  const { voterName, votes } = await request.json();

  if (!voterName || !votes || votes.length !== 3) {
    return new Response(JSON.stringify({ message: 'Invalid data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    await db.collection('votes').insertOne({ voterName, votes, timestamp: new Date() });
    return new Response(JSON.stringify({ message: 'Votes saved!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error saving votes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await client.close();
  }
}