import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            // Ajouter un nouvel utilisateur
            const { username, password, prenom } = req.body;

            if (!username || !password || !prenom) {
                return res.status(400).json({ error: 'Tous les champs sont requis.' });
            }

            const userKey = `user:${username}`;
            const existingUser = await kv.hgetall(userKey);

            if (existingUser) {
                return res.status(409).json({ error: `L'utilisateur "${username}" existe déjà.` });
            }

            // **Important :** En production, vous devriez hasher le mot de passe avant de le stocker !
            await kv.hmset(userKey, { password, prenom });

            return res.status(201).json({ message: `L'utilisateur "${username}" a été ajouté.` });
        } else if (req.method === 'GET') {
            // Récupérer la liste des utilisateurs
            const keys = await kv.keys('user:*');
            const users = [];

            for (const key of keys) {
                const userData = await kv.hgetall(key);
                if (userData) {
                    users.push({ username: key.split(':')[1], prenom: userData.prenom });
                }
            }

            return res.status(200).json(users);
        } else if (req.method === 'DELETE') {
            // Supprimer un utilisateur
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
            return res.status(405).json({ error: 'Méthode non autorisée.' });
        }
    } catch (error) {
        console.error('Erreur dans l\'API des utilisateurs:', error);
        return res.status(500).json({ error: 'Erreur serveur lors de la gestion des utilisateurs.' });
    }
}