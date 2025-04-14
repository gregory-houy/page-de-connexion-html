// api/messages.js
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const messagesFilePath = path.join(process.cwd(), 'messages.json');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { sender, recipient } = req.query;

        try {
            const data = await fs.readFile(messagesFilePath, 'utf8');
            const messages = JSON.parse(data);

            if (sender && recipient) {
                const conversationMessages = messages.filter(
                    msg =>
                        (msg.sender === sender && msg.recipient === recipient) ||
                        (msg.sender === recipient && msg.recipient === sender)
                );
                return res.status(200).json(conversationMessages);
            } else {
                return res.status(200).json(messages); // Retourner tous les messages si pas de filtre
            }
        } catch (error) {
            console.error('Erreur lors de la lecture des messages:', error);
            return res.status(500).json({ error: 'Erreur interne du serveur.' });
        }
    } else if (req.method === 'POST') {
        const { sender, recipient, text } = req.body;

        if (!sender || !recipient || !text) {
            return res.status(400).json({ error: 'Expéditeur, destinataire et texte du message requis.' });
        }

        const newMessage = { id: uuidv4(), sender, recipient, text, timestamp: new Date().toISOString() };

        try {
            const data = await fs.readFile(messagesFilePath, 'utf8');
            const messages = JSON.parse(data);
            messages.push(newMessage);
            await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), 'utf8');
            return res.status(201).json({ message: 'Message envoyé.' });
        } catch (error) {
            console.error('Erreur lors de l\'écriture des messages:', error);
            return res.status(500).json({ error: 'Erreur interne du serveur.' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Méthode ${req.method} non autorisée.`);
    }
}