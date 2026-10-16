const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mot de passe admin sécurisé côté serveur
const ADMIN_PASSWORD = "ton_vrai_mot_de_passe";

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        return res.json({ success: true, token: "token_admin_autorise_2026" });
    }
    res.status(401).json({ success: false, message: "Mot de passe incorrect" });
});

// Base de données simulée en mémoire
const users = {
    "Timothée": { 
        pseudo: "Timothée", 
        email: "timothee@example.com", 
        password: "pass", 
        points: 1180, 
        tickets: 10 
    }
};

// === API BACKOFFICE ADMIN ===
app.get('/api/admin/stats', (req, res) => {
    try {
        const usersList = Object.values(users);
        let totalPoints = usersList.reduce((acc, u) => acc + (u.points || 0), 0);
        let totalTickets = usersList.reduce((acc, u) => acc + (u.tickets || 0), 0);

        res.json({
            success: true,
            totalUsers: usersList.length,
            totalPoints,
            totalTickets,
            users: usersList
        });
    } catch (err) {
        console.error("Erreur API Admin stats:", err);
        res.status(500).json({ success: false, message: "Erreur serveur interne" });
    }
});

app.post('/api/admin/modify-user', (req, res) => {
    const { pseudo, addPoints, addTickets } = req.body;
    if (users[pseudo]) {
        users[pseudo].points += (addPoints || 0);
        users[pseudo].tickets += (addTickets || 0);
        return res.json({ success: true, user: users[pseudo] });
    }
    res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
});

app.post('/api/admin/delete-user', (req, res) => {
    const { pseudo } = req.body;
    if (users[pseudo]) {
        delete users[pseudo];
        return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
});

// Route d'inscription
app.post('/api/register', (req, res) => {
    const { pseudo, email, password } = req.body;

    if (!pseudo || !email || !password) {
        return res.json({ success: false, message: "Tous les champs sont requis !" });
    }

    if (users[pseudo]) {
        return res.json({ success: false, message: "Ce pseudo est déjà pris !" });
    }

    users[pseudo] = {
        pseudo,
        email,
        password,
        points: 0,
        tickets: 10
    };

    res.json({
        success: true,
        message: "Compte créé avec succès ! Bienvenue 🌴",
        user: users[pseudo]
    });
});

// Route de connexion
app.post('/api/login', (req, res) => {
    const { emailOrPseudo, password } = req.body;

    if (!emailOrPseudo || !password) {
        return res.json({ success: false, message: "Veuillez remplir tous les champs !" });
    }

    const userKey = Object.keys(users).find(
        key => users[key].pseudo.toLowerCase() === emailOrPseudo.toLowerCase() || 
               users[key].email.toLowerCase() === emailOrPseudo.toLowerCase()
    );

    if (!userKey || users[userKey].password !== password) {
        return res.json({ success: false, message: "Identifiants incorrects (Mot de passe : pass pour Timothée) !" });
    }

    res.json({
        success: true,
        message: "Connexion réussie !",
        user: users[userKey]
    });
});

// Route pour récupérer les infos d'un utilisateur
app.get('/api/user/:username', (req, res) => {
    const username = req.params.username;
    if (!users[username]) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }
    res.json(users[username]);
});

// Route pour ajouter un ticket bonus (+)
app.post('/api/add-ticket', (req, res) => {
    const { username } = req.body;
    if (!users[username]) {
        return res.json({ success: false, message: "Utilisateur non trouvé" });
    }
    
    users[username].tickets += 1;

    res.json({
        success: true,
        user: users[username]
    });
});

// Route pour jouer aux jeux
app.post('/api/play', (req, res) => {
    const { username, gameType } = req.body;
    
    if (!users[username]) {
        return res.json({ success: false, message: "Utilisateur non trouvé" });
    }

    if (users[username].tickets <= 0) {
        return res.json({
            success: false,
            message: "Tickets insuffisants !"
        });
    }

    users[username].tickets -= 1;

    let earnedPoints = 50;
    if (gameType === 'Grille Coco') {
        earnedPoints = Math.floor(Math.random() * 60) + 20;
    }

    users[username].points += earnedPoints;

    res.json({
        success: true,
        message: `Félicitations ! +${earnedPoints} points !`,
        user: users[username]
    });
});

app.listen(PORT, () => {
    console.log(`Serveur Paradise-Kdo lancé sur http://localhost:${PORT}`);
});
