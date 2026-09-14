const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./banco.sqlite', (err) => {
    if (err) console.error(err.message);
    console.log('Conectado ao banco SQLite com sucesso!');
});

db.serialize(() => {
    // Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de Rotinas
    db.run(`CREATE TABLE IF NOT EXISTS routines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Tabela de Hábitos
    db.run(`CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        days_of_week TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Tabela Associativa
    db.run(`CREATE TABLE IF NOT EXISTS habits_routines (
        habit_routine_id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER,
        routine_id INTEGER,
        FOREIGN KEY (habit_id) REFERENCES habits(id),
        FOREIGN KEY (routine_id) REFERENCES routines(id)
    )`);

    // Histórico de Check-ins
    db.run(`CREATE TABLE IF NOT EXISTS habit_tracker (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        habit_id INTEGER,
        target_date DATETIME NOT NULL,
        complete_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_late BOOLEAN,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (habit_id) REFERENCES habits(id),
        UNIQUE(habit_id, target_date)
    )`);
});

module.exports = db;