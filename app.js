const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// Configuração da sessão
app.use(session({
    secret: 'sua_chave_secreta_muito_segura', // Troque por uma string forte e secreta em produção
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Em produção com HTTPS, coloque true
}));

// Middleware para processar dados de formulário
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração do EJS como motor de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Importa o roteador principal
const mainRouter = require('./route/index');

// Usa o roteador para todas as rotas
app.use('/', mainRouter);

// Porta do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
