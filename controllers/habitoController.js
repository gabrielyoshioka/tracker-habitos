const db = require('../database/db');

exports.salvarHabito = (req, res) => {
    const userId = req.session.userId;
    const { name, days_of_week } = req.body;

    let diasStr = "";
    if (Array.isArray(days_of_week)) {
        diasStr = days_of_week.join(','); 
    } else if (days_of_week) {
        diasStr = days_of_week; 
    }

    db.run(
        `INSERT INTO habits (user_id, name, days_of_week) VALUES (?, ?, ?)`,
        [userId, name, diasStr],
        function(err) {
            if (err) {
                console.error("Erro ao inserir hábito:", err.message);
                return res.status(500).send("Erro ao salvar o hábito.");
            }
            
            res.redirect('/');
        }
    );
};

exports.toggleCheckin = (req, res) => {
    const userId = req.session.userId;
    const { habitId, data } = req.body; 

    db.get(`SELECT id FROM habits WHERE id = ? AND user_id = ?`, [habitId, userId], (err, habito) => {
        if (err || !habito) {
            return res.status(403).json({ sucesso: false, erro: "Hábito não encontrado ou acesso negado." });
        }

        db.get(`SELECT id FROM habit_tracker WHERE habit_id = ? AND target_date = ?`, [habitId, data], (err, tracker) => {
            if (err) return res.status(500).json({ sucesso: false, erro: "Erro interno." });

            if (tracker) {
                db.run(`DELETE FROM habit_tracker WHERE id = ?`, [tracker.id], function(err) {
                    if (err) return res.status(500).json({ sucesso: false, erro: "Erro ao desmarcar." });
                    return res.json({ sucesso: true, acao: "desmarcado" });
                });
            } else {
                db.run(
                    `INSERT INTO habit_tracker (user_id, habit_id, target_date) VALUES (?, ?, ?)`,
                    [userId, habitId, data],
                    function(err) {
                        if (err) return res.status(500).json({ sucesso: false, erro: "Erro ao marcar." });
                        return res.json({ sucesso: true, acao: "marcado" });
                    }
                );
            }
        });
    });
};