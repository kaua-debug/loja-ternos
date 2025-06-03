const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Os caminhos para 'produtos.json' e 'usuarios.json' estão CORRETOS AQUI
// porque este arquivo (se estiver em 'route/') precisa subir um nível (../)
// para acessar a pasta 'data'.
let produtos = require('../data/produtos.json'); // Usar 'let' para permitir reatribuição
const usuarios = require('../data/usuarios.json');

// Simulação de carrinho (armazenado em memória)
let carrinho = [];

// Middleware para proteger rotas (requer 'express-session' configurado em app.js)
function proteger(req, res, next) {
    if (!req.session || !req.session.usuario) { // Adicionado req.session para evitar erro se a sessão não estiver configurada
        return res.redirect('/login');
    }
    next();
}

// Página inicial
router.get('/', (req, res) => {
    res.render('index', { produtos });
});

// Lista de produtos
router.get('/produtos', (req, res) => {
    res.render('produtos', { produtos });
});

// Página do produto individual
router.get('/produto/:id', (req, res) => {
    const produto = produtos.find(p => p.id === parseInt(req.params.id));
    if (!produto) return res.status(404).send('Produto não encontrado');
    res.render('produto', { produto });
});

// Adicionar produto ao carrinho
router.post('/carrinho', (req, res) => {
    const produtoId = parseInt(req.body.produtoId);
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
        carrinho.push(produto);
    }
    res.redirect('/carrinho');
});

// Exibir carrinho
router.get('/carrinho', (req, res) => {
    res.render('carrinho', { carrinho });
});

// Tela de login
router.get('/login', (req, res) => {
    res.render('login', { erro: null });
});

// Processar login
router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    if (usuario) {
        // Certifique-se de que 'express-session' está configurado em app.js
        req.session.usuario = usuario;
        res.redirect('/admin');
    } else {
        res.render('login', { erro: 'Email ou senha inválidos' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    if (req.session) { // Verifica se a sessão existe antes de tentar destruir
        req.session.destroy();
    }
    res.redirect('/');
});

// Painel de administração (protegido)
router.get('/admin', proteger, (req, res) => {
    res.render('admin', { usuario: req.session.usuario, produtos: produtos }); // Passa 'produtos' para a view admin
});

// Cadastrar novo produto
router.post('/admin', proteger, (req, res) => {
    const { nome, descricao, preco, imagem } = req.body;

    // Não re-requer o arquivo aqui. Modifique o array 'produtos' já carregado.
    // É importante que 'produtos' seja declarado com 'let' no topo do arquivo.
    const novoProduto = {
        id: produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1, // Gera ID único
        nome,
        descricao,
        preco: parseFloat(preco),
        imagem
    };

    produtos.push(novoProduto); // Adiciona ao array em memória

    // Escreve o array atualizado de volta no arquivo JSON
    fs.writeFileSync(
        path.join(__dirname, '../data/produtos.json'),
        JSON.stringify(produtos, null, 2)
    );

    res.redirect('/admin'); // Redireciona para o painel admin para ver o novo produto
});

module.exports = router;
