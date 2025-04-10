const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const usersFile = path.join(__dirname, 'users.json'); // Chemin mis à jour

async function getUsers() {
    try {
        const data = await fs.readFile(usersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveUsers(users) {
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/users' && req.method === 'GET') {
        const users = await getUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    } else if (req.url === '/users' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', async () => {
            try {
                const newUser = JSON.parse(body);
                const users = await getUsers();
                const existingUser = users.find(u => u.username.toLowerCase() === newUser.username.toLowerCase());
                if (existingUser) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: `L'utilisateur "${newUser.username}" existe déjà.` }));
                    return;
                }
                users.push(newUser);
                await saveUsers(users);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Utilisateur ajouté avec succès' }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Données invalides' }));
            }
        });
    } else if (req.url.startsWith('/users/') && req.method === 'DELETE') {
        const usernameToDelete = req.url.split('/')[2];
        const users = await getUsers();
        const initialLength = users.length;
        const updatedUsers = users.filter(user => user.username !== usernameToDelete);
        if (updatedUsers.length < initialLength) {
            await saveUsers(updatedUsers);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: `Utilisateur "${usernameToDelete}" supprimé.` }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Utilisateur "${usernameToDelete}" non trouvé.` }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});