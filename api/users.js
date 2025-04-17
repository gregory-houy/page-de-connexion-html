import { kv } from '@vercel/kv';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            const { username, password, prenom } = req.body;

            if (!username || !password || !prenom) {
                return res.status(400).json({ error: 'Nom d\'utilisateur, mot de passe et prénom sont requis.' });
            }

            const userKey = `user:${username}`;
            const existingUser = await kv.hgetall(userKey);

            if (existingUser) {
                return res.status(409).json({ error: `L'utilisateur "${username}" existe déjà.` });
            }

            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await kv.hmset(userKey, { password: hashedPassword, prenom });

            return res.status(201).json({ message: `L'utilisateur "${username}" a été ajouté.` });
        } else if (req.method === 'GET') {
            const { username: queryUsername } = req.query;

            if (queryUsername) {
                const userKey = `user:${queryUsername}`;
                const userData = await kv.hgetall(userKey);
                if (userData) {
                    return res.status(200).json({ username: queryUsername, prenom: userData.prenom });
                } else {
                    return res.status(404).json({ error: `Utilisateur "${queryUsername}" non trouvé.` });
                }
            } else {
                const keys = await kv.keys('user:*');
                const users = [];
                for (const key of keys) {
                    const userData = await kv.hgetall(key);
                    if (userData) {
                        users.push({ username: key.split(':')[1], prenom: userData.prenom });
                    }
                }
                return res.status(200).json(users);
            }
        } else if (req.method === 'DELETE') {
            const { username } = req.query;
            if (!username) {
                return res.status(400).json({ error: 'Le nom d\'utilisateur à supprimer est requis.' });
            }

            const userKey = `user:${username}`;
            const existingUser = await kv.hgetall(userKey);

            if (!existingUser) {
                return res.status(404).json({ error: `L'utilisateur "${username}" n'existe pas.` });
            }

            await kv.del(userKey);
            return res.status(200).json({ message: `L'utilisateur "${username}" a été supprimé.` });
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            return res.status(405).end(`Méthode ${req.method} non autorisée.`);
        }
    } catch (error) {
        console.error('Erreur dans l\'API des utilisateurs:', error);
        return res.status(500).json({ error: 'Erreur serveur lors de la gestion des utilisateurs.' });
    }
}