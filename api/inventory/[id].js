// api/inventory/[id].js
import { promises as fs } from 'fs';
import path from 'path';

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

    if (req.method === 'DELETE') {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'ID de l\'élément à supprimer requis.' });
        }

        try {
            const data = await fs.readFile(inventoryFilePath, 'utf8');
            const inventory = JSON.parse(data);

            const initialLength = inventory.length;
            const updatedInventory = inventory.filter(item => item.id !== id);

            if (updatedInventory.length < initialLength) {
                await fs.writeFile(inventoryFilePath, JSON.stringify(updatedInventory, null, 2), 'utf8');
                return res.status(200).json({ message: `L'élément avec l'ID "${id}" a été supprimé.` });
            } else {
                return res.status(404).json({ error: `L'élément avec l'ID "${id}" n'existe pas.` });
            }
        } catch (error) {
            console.error('Erreur lors de la modification de inventory.json:', error);
            return res.status(500).json({ error: 'Erreur interne du serveur.' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Méthode ${req.method} non autorisée.`);
    }
}