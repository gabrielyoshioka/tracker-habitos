const db = require('../database/db');

exports.renderizarDashboard = (req, res) => {
    const userId = req.session.userId;
    const dataAtual = new Date();
    const hoje = dataAtual.toLocaleDateString('en-CA'); 
    const diaSemanaStr = dataAtual.getDay().toString();
    
    const sqlHabitos = `
        SELECT h.id, h.name, h.days_of_week,
               CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END as is_completed
        FROM habits h
        LEFT JOIN habit_tracker t ON h.id = t.habit_id AND t.target_date = ?
        WHERE h.user_id = ? AND h.is_active = 1
        ORDER BY is_completed ASC, h.id DESC
    `;

    db.all(sqlHabitos, [hoje, userId], (err, habitos) => {
        if (err) {
            console.error("Erro ao buscar hábitos:", err.message);
            habitos = [];
        }
        
        const habitosDeHoje = habitos.filter(habito => {
            if (!habito.days_of_week) return true; 
            const diasArray = habito.days_of_week.split(',');
            return diasArray.includes(diaSemanaStr);
        });
        
        const sqlRotinas = `
            SELECT r.id as routine_id, r.name as routine_name,
                   h.id as habit_id, h.name as habit_name
            FROM routines r
            LEFT JOIN habits_routines hr ON r.id = hr.routine_id
            LEFT JOIN habits h ON hr.habit_id = h.id
            WHERE r.user_id = ?
            ORDER BY r.id DESC
        `;

        db.all(sqlRotinas, [userId], (err, rows) => {
            if (err) {
                console.error("Erro ao buscar rotinas:", err.message);
                rows = [];
            }

            const rotinasMap = {};
            rows.forEach(row => {
                if (!rotinasMap[row.routine_id]) {
                    rotinasMap[row.routine_id] = {
                        id: row.routine_id,
                        name: row.routine_name,
                        habitos: []
                    };
                }
                if (row.habit_id) {
                    rotinasMap[row.routine_id].habitos.push({
                        id: row.habit_id,
                        name: row.habit_name
                    });
                }
            });

            const rotinasSemana = Object.values(rotinasMap);

            res.render('index', { 
                habitosHoje: habitosDeHoje, 
                rotinasSemana: rotinasSemana,
                habitosExistentes: habitos 
            });
        });
    });
};