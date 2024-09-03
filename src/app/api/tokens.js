import { connectToDatabase } from '../../utils/dbConnect';
import React, { useState, useEffect } from 'react';

export default async function handler(req, res) {
  let db;
  try {
    db = await connectToDatabase();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect to the database' });
  }

  if (req.method === 'GET') {
    try {
      const user = await db.collection('users').findOne({ email: req.query.email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ tokens: user.tokens || 0 });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
  } else if (req.method === 'POST') {
    const { email, amount } = req.body;
    
    // Basic validation
    if (!email || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    
    try {
      const result = await db.collection('users').updateOne(
        { email },
        { $inc: { tokens: amount } },
        { upsert: true }
      );
      if (result.modifiedCount === 1 || result.upsertedCount === 1) {
        return res.status(200).json({ message: 'Tokens updated successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to update tokens' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update tokens' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
