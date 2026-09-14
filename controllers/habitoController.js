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