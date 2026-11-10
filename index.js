const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const habitoRoutes = require('./routes/habitoRoutes');
const rotinaRoutes = require('./routes/rotinaRoutes');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'chave_secreta_projeto_habitos',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', habitoRoutes);
app.use('/', rotinaRoutes);

app.listen(3000, () => {
    console.log('Acesse no navegador: http://localhost:3000');
});