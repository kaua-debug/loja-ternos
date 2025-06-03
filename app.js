const express = require('express');
const session = require('express-session'); // Necessário para req.session
const path = require('path');
const app = express();

// Configuração da sessão
// É importante usar uma chave secreta forte e única para produção
app.use(session({
    secret: 'sua_chave_secreta_muito_segura', // Troque por uma string aleatória e forte
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Defina como true se estiver usando HTTPS em produção
}));

// Middleware para processar dados de formulário
app.use(express.urlencoded({ extended: true })); // Para dados de formulário HTML
app.use(express.json()); // Para dados JSON (se for usar APIs)

// Configuração do EJS como motor de template
app.set('view engine', 'ejs');
// Define o diretório onde os arquivos .ejs estão localizados
app.set('views', path.join(__dirname, 'views'));

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Correção dos caminhos para os arquivos JSON
// 'app.js' está na raiz do projeto (C:\dev\loja ternos\loja-ternos\app.js)
// A pasta 'data' está diretamente dentro da raiz (C:\dev\loja ternos\loja-ternos\data\)
// Portanto, os caminhos corretos são './data/...' ou 'data/...'.
// O erro 'Cannot find module' significa que o Node.js não encontrou o arquivo
// no local especificado, mesmo com o caminho correto no código.
// Por favor, VERIFIQUE se os arquivos 'produtos.json' e 'usuarios.json'
// realmente existem dentro da pasta 'data' e se os nomes estão EXATOS (incluindo maiúsculas/minúsculas).
const produtos = require('./data/produtos.json'); // Esta linha
const usuarios = require('./data/usuarios.json'); // E esta linha (linha 32 no seu erro)

// Importa o roteador principal
const mainRouter = require('./route/index'); // Assumindo que seu roteador está em route/index.js

// Usa o roteador para todas as rotas
app.use('/', mainRouter);

// Correção da definição da porta
// Você pode usar process.env.PORT para ambientes de produção ou 3000 para desenvolvimento
const PORT = process.env.PORT || 3000; // Define a porta, usando variável de ambiente ou 3000 como padrão

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
