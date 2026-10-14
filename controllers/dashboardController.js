const db = require('../database/db');

exports.renderizarDashboard = (req, res) => {
    const userId = req.session.userId;
    
    const hoje = new Date().toLocaleDateString('en-CA'); 
    
    const sql = `
        SELECT h.id, h.name, 
               CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END as is_completed
        FROM habits h
        LEFT JOIN habit_tracker t ON h.id = t.habit_id AND t.target_date = ?
        WHERE h.user_id = ? AND h.is_active = 1
        ORDER BY is_completed ASC, h.id DESC
    `;

    db.all(sql, [hoje, userId], (err, habitos) => {
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