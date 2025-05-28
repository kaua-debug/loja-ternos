const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const produtos = require('../data/produtos.json');
const usuarios = require('../data/usuarios.json');

// Simulação de carrinho (armazenado em memória)
let carrinho = [];

// Middleware para proteger rotas
function proteger(req, res, next) {
  if (!req.session.usuario) {
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
    req.session.usuario = usuario;
    res.redirect('/admin');
  } else {
    res.render('login', { erro: 'Email ou senha inválidos' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Painel de administração (protegido)
router.get('/admin', proteger, (req, res) => {
  res.render('admin', { usuario: req.session.usuario });
});

// Cadastrar novo produto
router.post('/admin', proteger, (req, res) => {
  const { nome, descricao, preco, imagem } = req.body;
  const produtos = require('../data/produtos.json');

  const novoProduto = {
    id: produtos.length + 1,
    nome,
    descricao,
    preco: parseFloat(preco),
    imagem
  };

  produtos.push(novoProduto);

  fs.writeFileSync(
    path.join(__dirname, '../data/produtos.json'),
    JSON.stringify(produtos, null, 2)
  );

  res.redirect('/');
});

module.exports = router;
