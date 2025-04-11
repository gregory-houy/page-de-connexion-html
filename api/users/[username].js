// api/users/[username].js
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { username } = req.query;
    const usersFilePath = path.join(process.cwd(), 'users.json');

    if (!username) {
      return res.status(400).json({ error: 'Nom d\'utilisateur à supprimer requis.' });
    }

    try {
      const data = await fs.readFile(usersFilePath, 'utf8');
      const users = JSON.parse(data);

      const initialLength = users.length;
      const updatedUsers = users.filter(user => user.username !== username);

      if (updatedUsers.length < initialLength) {
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2), 'utf8');
        return res.status(200).json({ message: `L'utilisateur "${username}" a été supprimé.` });
      } else {
        return res.status(404).json({ error: `L'utilisateur "${username}" n'existe pas.` });
      }
    } catch (error) {
      console.error('Erreur lors de la modification de users.json:', error);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Méthode ${req.method} non autorisée.`);
  }
}