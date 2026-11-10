const db = require('../database/db');

exports.salvarRotina = (req, res) => {
    const userId = req.session.userId;
    const { name, habitos } = req.body;

    if (!name) {
        return res.status(400).send("O nome da rotina é obrigatório.");
    }

    db.run(
        `INSERT INTO routines (name, user_id) VALUES (?, ?)`,
        [name, userId],
        function(err) {
            if (err) {
                console.error("Erro ao salvar rotina:", err.message);
                return res.status(500).send("Erro ao salvar a rotina.");
            }

            const routineId = this.lastID;

            if (!habitos) {
                return res.redirect('/');
            }

            const habitosArray = Array.isArray(habitos) ? habitos : [habitos];

            const placeholders = habitosArray.map(() => '(?, ?)').join(', ');
            const values = [];
            
            habitosArray.forEach(habitId => {
                values.push(habitId, routineId);
            });

            db.run(
                `INSERT INTO habits_routines (habit_id, routine_id) VALUES ${placeholders}`,
                values,
                function(insertErr) {
                    if (insertErr) {
                        console.error("Erro ao associar hábitos:", insertErr.message);
                        return res.status(500).send("Erro ao vincular os hábitos à rotina.");
                    }
                    res.redirect('/');
                }
            );
        }
    );
};