const db = require('../database/db');

exports.renderizarDashboard = (req, res) => {
    const userId = req.session.userId;
    const dataAtual = new Date();
    const hoje = dataAtual.toLocaleDateString('en-CA');
    const diaSemanaNum = dataAtual.getDay(); // 0 (Dom) a 6 (Sáb)
    const diaSemanaStr = diaSemanaNum.toString();

    // Calcula início (Domingo) e fim (Sábado) da semana atual no formato YYYY-MM-DD
    const dataInicioSemana = new Date(dataAtual);
    dataInicioSemana.setDate(dataAtual.getDate() - diaSemanaNum);
    const inicioSemana = dataInicioSemana.toLocaleDateString('en-CA');

    const dataFimSemana = new Date(dataInicioSemana);
    dataFimSemana.setDate(dataInicioSemana.getDate() + 6);
    const fimSemana = dataFimSemana.toLocaleDateString('en-CA');

    // 1. Busca todos os hábitos ativos do usuário e o status de conclusão de hoje
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
            const diasArray = habito.days_of_week.split(',').filter(d => d !== '');
            return diasArray.length === 0 || diasArray.includes(diaSemanaStr);
        });

        // Progresso simples (Hoje)
        const totalHoje = habitosDeHoje.length;
        const concluidosHoje = habitosDeHoje.filter(h => h.is_completed === 1).length;
        const progressoHoje = totalHoje > 0 ? Math.round((concluidosHoje / totalHoje) * 100) : 0;

        // 2. Conta os check-ins realizados na semana atual agrupados por hábito (SQL COUNT + GROUP BY)
        const sqlCheckinsSemana = `
            SELECT habit_id, COUNT(id) as total_concluido
            FROM habit_tracker
            WHERE user_id = ? AND target_date BETWEEN ? AND ?
            GROUP BY habit_id
        `;

        db.all(sqlCheckinsSemana, [userId, inicioSemana, fimSemana], (chkErr, checkinsRows) => {
            if (chkErr) {
                console.error("Erro ao contabilizar check-ins da semana:", chkErr.message);
                checkinsRows = [];
            }

            const checkinsPorHabito = {};
            checkinsRows.forEach(row => {
                checkinsPorHabito[row.habit_id] = row.total_concluido;
            });

            // Progresso semanal geral (todos os hábitos ativos do usuário)
            let metaGeralSemana = 0;
            let feitosGeralSemana = 0;

            habitos.forEach(habito => {
                const diasAtivos = habito.days_of_week
                    ? habito.days_of_week.split(',').filter(d => d !== '')
                    : [];
                const metaHabito = diasAtivos.length > 0 ? diasAtivos.length : 7;
                const feitosHabito = Math.min(metaHabito, checkinsPorHabito[habito.id] || 0);

                metaGeralSemana += metaHabito;
                feitosGeralSemana += feitosHabito;
            });

            const progressoGeralSemana = metaGeralSemana > 0
                ? Math.round((feitosGeralSemana / metaGeralSemana) * 100)
                : 0;

            // 3. Busca as rotinas e calcula o progresso semanal de cada bloco
            const sqlRotinas = `
                SELECT r.id as routine_id, r.name as routine_name,
                       h.id as habit_id, h.name as habit_name, h.days_of_week
                FROM routines r
                LEFT JOIN habits_routines hr ON r.id = hr.routine_id
                LEFT JOIN habits h ON hr.habit_id = h.id AND h.is_active = 1
                WHERE r.user_id = ?
                ORDER BY r.id DESC
            `;

            db.all(sqlRotinas, [userId], (rotErr, rows) => {
                if (rotErr) {
                    console.error("Erro ao buscar rotinas:", rotErr.message);
                    rows = [];
                }

                const rotinasMap = {};
                rows.forEach(row => {
                    if (!rotinasMap[row.routine_id]) {
                        rotinasMap[row.routine_id] = {
                            id: row.routine_id,
                            name: row.routine_name,
                            habitos: [],
                            metaSemanal: 0,
                            concluidosSemanal: 0,
                            progressoSemanal: 0
                        };
                    }

                    if (row.habit_id) {
                        const diasAtivos = row.days_of_week
                            ? row.days_of_week.split(',').filter(d => d !== '')
                            : [];
                        const metaHabito = diasAtivos.length > 0 ? diasAtivos.length : 7;
                        const feitosHabito = Math.min(metaHabito, checkinsPorHabito[row.habit_id] || 0);

                        rotinasMap[row.routine_id].habitos.push({
                            id: row.habit_id,
                            name: row.habit_name,
                            feitosSemana: feitosHabito,
                            metaSemana: metaHabito
                        });

                        rotinasMap[row.routine_id].metaSemanal += metaHabito;
                        rotinasMap[row.routine_id].concluidosSemanal += feitosHabito;
                    }
                });

                const rotinasSemana = Object.values(rotinasMap).map(rotina => {
                    rotina.progressoSemanal = rotina.metaSemanal > 0
                        ? Math.round((rotina.concluidosSemanal / rotina.metaSemanal) * 100)
                        : 0;
                    return rotina;
                });

                res.render('index', {
                    habitosHoje: habitosDeHoje,
                    rotinasSemana,
                    habitosExistentes: habitos,
                    metricas: {
                        concluidosHoje,
                        totalHoje,
                        progressoHoje,
                        feitosGeralSemana,
                        metaGeralSemana,
                        progressoGeralSemana
                    }
                });
            });
        });
    });
};