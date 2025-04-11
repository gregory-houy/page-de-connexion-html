// api/inventory/inventory.js
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
    const inventoryFilePath = path.join(process.cwd(), 'inventory.json');

    // Vérification de l'authentification (exemple basique - adaptez à votre système)
    const isLoggedIn = req.cookies?.username || req.headers['authorization']; // Exemple: cookie 'username' ou header 'authorization'
    if (!isLoggedIn) {
        return res.status(401).json({ error: 'Non autorisé. Veuillez vous connecter.' });
    }

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