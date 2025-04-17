// api/users.js
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const usersFilePath = path.join(process.cwd(), 'users.json');

    if (req.method === 'GET') {
        const { username } = req.query;

        if (username) {
            try {
                const data = await fs.readFile(usersFilePath, 'utf8');
                const users = JSON.parse(data);
                const user = users.find(u => u.username === username);
                if (user) {
                    return res.status(200).json(user);
                } else {
                    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
                }
            } catch (error) {
                console.error('Erreur lors de la lecture de users.json:', error);
                return res.status(500).json({ error: 'Erreur interne du serveur.' });
            }
        } else {
            // ... (votre code existant pour lister tous les utilisateurs)
            try {
                const data = await fs.readFile(usersFilePath, 'utf8');
                const users = JSON.parse(data);
                return res.status(200).json(users);
            } catch (error) {
                console.error('Erreur lors de la lecture de users.json:', error);
                return res.status(500).json({ error: 'Erreur interne du serveur.' });
            }
        }
    } else if (req.method === 'POST') {
        // ... (votre code existant pour ajouter un utilisateur - vous devrez le modifier pour prendre en compte le prénom)
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Méthode ${req.method} non autorisée.`);
    }
}