// api/users.js
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const usersFilePath = path.join(process.cwd(), 'users.json');
    console.log('usersFilePath (users.js):', usersFilePath);

    if (req.method === 'GET') {
        const { username } = req.query;
        console.log('Méthode GET détectée dans /api/users avec query:', req.query);

        if (username) {
            console.log(`Recherche de l'utilisateur: ${username}`);
            try {
                const data = await fs.readFile(usersFilePath, 'utf8');
                const users = JSON.parse(data);
                const user = users.find(u => u.username === username);
                if (user) {
                    console.log('Utilisateur trouvé:', user);
                    return res.status(200).json(user);
                } else {
                    console.log(`Utilisateur "${username}" non trouvé.`);
                    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
                }
            } catch (error) {
                console.error('Erreur lors de la lecture de users.json:', error);
                return res.status(500).json({ error: 'Erreur interne du serveur.' });
            }
        } else {
            // Code pour lister tous les utilisateurs (inchangé)
            console.log('Requête GET sans nom d\'utilisateur, liste de tous les utilisateurs.');
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
        // Votre code existant pour la méthode POST (ajout d'utilisateur) reste inchangé pour l'instant
        console.log('Méthode POST détectée dans /api/users');
        const { username, password, prenom } = req.body; // Assurez-vous que votre formulaire d'ajout envoie aussi le prénom

        if (!username || !password || !prenom) {
            return res.status(400).json({ error: 'Nom d\'utilisateur, mot de passe et prénom requis.' });
        }

        try {
            console.log('Tentative de lecture de users.json (POST)');
            const data = await fs.readFile(usersFilePath, 'utf8');
            const users = JSON.parse(data);

            if (users.some(user => user.username === username)) {
                return res.status(409).json({ error: `L'utilisateur "${username}" existe déjà.` });
            }

            users.push({ username, password, prenom });
            console.log('Nouveau tableau users (POST):', users);
            console.log('Tentative d\'écriture dans users.json (POST)');
            await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
            return res.status(201).json({ message: `L'utilisateur "${username}" a été ajouté.` });
        } catch (error) {
            console.error('Erreur lors de l\'écriture dans users.json (POST):', error);
            console.error('Détails de l\'erreur (POST):', error);
            return res.status(500).json({ error: 'Erreur interne du serveur.' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Méthode ${req.method} non autorisée.`);
    }
}