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

exports.editarRotina = (req, res) => {
    const userId = req.session.userId;
    const routineId = req.params.id;
    const { name, habitos } = req.body;

    if (!name) {
        return res.status(400).send("O nome da rotina é obrigatório.");
    }

    db.run(
        `UPDATE routines SET name = ? WHERE id = ? AND user_id = ?`,
        [name, routineId, userId],
        function(err) {
            if (err) {
                console.error("Erro ao editar rotina:", err.message);
                return res.status(500).send("Erro ao atualizar a rotina.");
            }
            if (this.changes === 0) {
                return res.status(403).send("Rotina não encontrada ou acesso negado.");
            }

            db.run(`DELETE FROM habits_routines WHERE routine_id = ?`, [routineId], function(delErr) {
                if (delErr) {
                    console.error("Erro ao limpar vínculos da rotina:", delErr.message);
                    return res.status(500).send("Erro ao atualizar hábitos da rotina.");
                }

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
                    function(insErr) {
                        if (insErr) {
                            console.error("Erro ao revincular hábitos:", insErr.message);
                            return res.status(500).send("Erro ao vincular hábitos à rotina.");
                        }
                        res.redirect('/');
                    }
                );
            });
        }
    );
};

exports.excluirRotina = (req, res) => {
    const userId = req.session.userId;
    const routineId = req.params.id;

    db.get(`SELECT id FROM routines WHERE id = ? AND user_id = ?`, [routineId, userId], (err, rotina) => {
        if (err || !rotina) {
            return res.status(403).send("Rotina não encontrada ou acesso negado.");
        }

        db.run(`DELETE FROM habits_routines WHERE routine_id = ?`, [routineId], function(delRelErr) {
            if (delRelErr) {
                console.error("Erro ao remover vínculos da rotina:", delRelErr.message);
                return res.status(500).send("Erro ao excluir vínculos da rotina.");
            }

            db.run(`DELETE FROM routines WHERE id = ? AND user_id = ?`, [routineId, userId], function(delErr) {
                if (delErr) {
                    console.error("Erro ao excluir rotina:", delErr.message);
                    return res.status(500).send("Erro ao excluir a rotina.");
                }
                res.redirect('/');
            });
        });
    });
};

exports.listarRotinas = (req, res) => {
    const userId = req.session.userId;

    const sqlRotinas = `
        SELECT r.id as routine_id, r.name as routine_name,
               h.id as habit_id, h.name as habit_name
        FROM routines r
        LEFT JOIN habits_routines hr ON r.id = hr.routine_id
        LEFT JOIN habits h ON hr.habit_id = h.id AND h.is_active = 1
        WHERE r.user_id = ?
        ORDER BY r.id DESC
    `;

    db.all(sqlRotinas, [userId], (err, rows) => {
        if (err) {
            console.error("Erro ao listar rotinas:", err.message);
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

        const rotinas = Object.values(rotinasMap);
        
        db.all(
            `SELECT id, name FROM habits WHERE user_id = ? AND is_active = 1 ORDER BY id DESC`,
            [userId],
            (habErr, habitosExistentes) => {
                if (habErr) {
                    console.error("Erro ao buscar hábitos para o modal:", habErr.message);
                    habitosExistentes = [];
                }

                res.render('rotinas', { rotinas, habitosExistentes });
            }
        );
    });
};