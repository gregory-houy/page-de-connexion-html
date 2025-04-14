// api/messages.js
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
    if (!kv) {
        console.error('Vercel KV n\'est pas configuré.');
        return res.status(500).json({ error: 'Vercel KV n\'est pas configuré.' });
    }

    if (req.method === 'GET') {
        const { sender, recipient } = req.query;

        if (!sender || !recipient) {
            return res.status(400).json({ error: 'Expéditeur et destinataire requis pour récupérer les messages.' });
        }

        const conversationKey = `chat:${sender}:${recipient}`;
        const reverseConversationKey = `chat:${recipient}:${sender}`;

        try {
            const conversationMessages = await kv.lrange(conversationKey, 0, -1) || await kv.lrange(reverseConversationKey, 0, -1) || [];
            const parsedMessages = conversationMessages.map(JSON.parse);
            return res.status(200).json(parsedMessages);
        } catch (error) {
            console.error('Erreur lors de la récupération des messages depuis Vercel KV:', error);
            return res.status(500).json({ error: 'Erreur interne du serveur lors de la récupération des messages.' });
        }
    } else if (req.method === 'POST') {
        const { sender, recipient, text } = req.body;

        if (!sender || !recipient || !text) {
            return res.status(400).json({ error: 'Expéditeur, destinataire et texte du message requis.' });
        }

        const newMessage = { id: uuidv4(), sender, recipient, text, timestamp: new Date().toISOString() };
        const conversationKey = `chat:${sender}:${recipient}`;

        try {
            await kv.rpush(conversationKey, JSON.stringify(newMessage));
            return res.status(201).json({ message: 'Message envoyé.' });
        } catch (error) {
            console.error('Erreur lors de l\'écriture du message dans Vercel KV:', error);
            return res.status(500).json({ error: 'Erreur interne du serveur lors de l\'envoi du message.' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Méthode ${req.method} non autorisée.`);
    }
}