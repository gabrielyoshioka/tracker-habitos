const bcrypt = require('bcrypt');
const db = require('../database/db');

exports.renderAuth = (req, res) => res.render('auth', { erro: null });

exports.registrarUsuario = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        db.run(`INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
            [name, email, hashedPassword],
            function(err) {
                if (err) {
                    if (err.errno === 19) return res.status(400).send("E-mail já cadastrado.");
                    return res.status(500).send("Erro interno.");
                }
                req.session.userId = this.lastID;
                res.redirect('/tracker');
            }
        );
    } catch (error) {
        res.status(500).send("Erro ao processar a senha.");
    }
};

exports.loginUsuario = (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).send("Erro interno.");
        
        if (!user) return res.render('auth', { erro: "E-mail ou senha incorretos." });

        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
            req.session.userId = user.id;
            res.redirect('/');
        } else {
            res.render('auth', { erro: "E-mail ou senha incorretos." });
        }
    });
};

exports.logoutUsuario = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error("Erro ao limpar sessão:", err);
        res.redirect('/login');
    });
};