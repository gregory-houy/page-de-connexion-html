import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    try {
      const usersFilePath = path.join(process.cwd(), 'users.json');
      const data = await fs.readFile(usersFilePath, 'utf8');
      const users = JSON.parse(data);

      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        return res.status(200).json({ message: 'Connexion réussie.' });
      } else {
        return res.status(401).json({ error: 'Identifiants et/ou mot de passe incorrect.' });
      }
    } catch (error) {
      console.error('Erreur lors de la lecture de users.json:', error);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Méthode ${req.method} non autorisée.`);
  }
}