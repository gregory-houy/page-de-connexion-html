// api/inventory/inventory.js
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Fonction d'authentification (ADAPTEZ CECI À VOTRE SYSTÈME D'AUTHENTIFICATION)
async function isAuthenticated(req) {
    // Exemple basé sur la vérification d'un cookie 'username'
    const username = req.cookies?.username;
    if (username) {
        const usersFilePath = path.join(process.cwd(), 'users.json');
        try {
            const data = await fs.readFile(usersFilePath, 'utf8');
            const users = JSON.parse(data);
            return users.some(user => user.username === username);
        } catch (error) {
            console.error('Erreur lors de la lecture de users.json pour l\'authentification:', error);
            return false;
        }
    }
    return false;
}

export default async function handler(req, res) {
    if (!await isAuthenticated(req)) {
        return res.status(401).json({ error: 'Non autorisé. Veuillez vous connecter.' });
    }

    const inventoryFilePath = path.join(process.cwd(), 'inventory.json');

    if (req.method === 'GET') {
        try {
            const data = await fs.readFile(inventoryFilePath, 'utf8');
            const inventory = JSON.parse(data);
            return res.status(200).json(inventory);
        } catch (error) {
            console.error('Erreur lors de la lecture de inventory.json:', error);
            return res.status(500).json({ error: 'Erreur interne du serveur.' });
        }
    } else if (req.method === 'POST') {
        const { name, quantity, price } = req.body;

        if (!name || quantity === undefined || price === undefined) {
            return res.status(400).json({ error: 'Nom, quantité et prix requis.' });
        }

        const newItem = { id: uuidv4(), name, quantity, price };

        try {
            const data = await fs.readFile(inventoryFilePath, 'utf8');
            const inventory = JSON.parse(data);
            inventory.push(newItem);
            await fs.writeFile(inventoryFilePath, JSON.stringify(inventory, null, 2), 'utf8');
            return res.status(201).json({ message: `L'élément "${name}" a été ajouté.` });
        } catch (error) {
            console.error('Erreur lors de l\'écriture dans inventory.json:', error);
            return res.status(500).json({ error: 'Erreur interne du serveur.' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Méthode ${req.method} non autorisée.`);
    }
}