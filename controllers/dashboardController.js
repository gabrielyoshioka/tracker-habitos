const db = require('../database/db');

exports.renderizarDashboard = (req, res) => {
    const userId = req.session.userId;
    
    db.all(`SELECT id, name FROM habits WHERE user_id = ? AND is_active = 1`, [userId], (err, habitos) => {
        if (err) {
            console.error("Erro ao buscar hábitos:", err.message);
            habitos = [];
        }
        
        res.render('index', { 
            habitosHoje: habitos,
            rotinasSemana: [],
            habitosExistentes: habitos
        });
    });
};