const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/seriesapp', { useNewUrlParser: true, useUnifiedTopology: true });

// Définition du schéma pour les utilisateurs
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    series: [{
        title: String,
        posterPath: String,
        category: String
    }]
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());

// API pour l'inscription d'un nouvel utilisateur
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password, series: [] });
        await user.save();
        res.status(201).json({ message: 'Utilisateur inscrit avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l'inscription de l'utilisateur.' });
    }
});

// API pour la connexion d'un utilisateur
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ message: 'Connexion réussie.', userId: user._id });
        } else {
            res.status(401).json({ error: 'Nom d'utilisateur ou mot de passe incorrect.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la connexion de l'utilisateur.' });
    }
});

// API pour ajouter une série à l'utilisateur
app.post('/api/addseries/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { title, posterPath, category } = req.body;
        const user = await User.findById(userId);
        if (user) {
            user.series.push({ title, posterPath, category });
            await user.save();
            res.json({ message: 'Série ajoutée avec succès.' });
        } else {
            res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l'ajout de la série.' });
    }
});

// API pour récupérer les séries d'un utilisateur
app.get('/api/getseries/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (user) {
            res.json(user.series);
        } else {
            res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des séries.' });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
