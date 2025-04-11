// api/users.js
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const usersFilePath = path.join(process.cwd(), 'users.json');
  console.log('usersFilePath (users.js):', usersFilePath);

  if (req.method === 'GET') {
    console.log('Méthode GET détectée dans /api/users');
    try {
      console.log('Tentative de lecture de users.json');
      const data = await fs.readFile(usersFilePath, 'utf8');
      console.log('Contenu de users.json (GET):', data);
      const users = JSON.parse(data);
      return res.status(200).json(users);
    } catch (error) {
      console.error('Erreur lors de la lecture de users.json (GET):', error);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  } else if (req.method === 'POST') {
    console.log('Méthode POST détectée dans /api/users');
    const { username, password } = req.body;
    console.log('req.body (POST):', req.body);

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    try {
      console.log('Tentative de lecture de users.json (POST)');
      const data = await fs.readFile(usersFilePath, 'utf8');
      console.log('Contenu de users.json (POST):', data);
      const users = JSON.parse(data);

      if (users.some(user => user.username === username)) {
        return res.status(409).json({ error: `L'utilisateur "${username}" existe déjà.` });
      }

      users.push({ username, password });
      console.log('Nouveau tableau users (POST):', users);
      console.log('Tentative d\'écriture dans users.json (POST)');
      await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
      return res.status(201).json({ message: `L'utilisateur "${username}" a été ajouté.` });
    } catch (error) {
      console.error('Erreur lors de l\'écriture dans users.json (POST):', error);
      console.error('Détails de l\'erreur (POST):', error); // Ajout du log de l'erreur complète
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Méthode ${req.method} non autorisée.`);
  }
}