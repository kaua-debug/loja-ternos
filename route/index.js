const express = require('express');
const router = express.Router();
const fs = require('path');
const usuarios = require('../data/usuarios.json')
const produtos = require('../data/produtos.json')

//Simulação de carrinho (armazenamento em memoria)
let carrinho = [];


//Pagina Inicial
router.get('/', (req, res) => {
    res.render('index', { produtos });
});

//Lista de Produtos
router.get('/produtos', (req, res) => {
    res.render('produtos', { produtos });
});

//Páginas de produto
router.get('/produto/:id', (req, res) => {
    const produto = produtos.find(p => p.id === parseInt(req.params.id));
    if (!produto) return res.status(404).send('Produto não encontrado');
    res.render('produto', { produto });
});

//adicionar oroduto ao carrinhp
router.post('/carrinho', (req, res) => {
    const produtoId = parseInt(req.body.produtoId);
    if (produto) {
        carrinho.push(produto)
    }
    res.redirect('/carrinho')
});

//Exibir carrinho
router.get('/carrinho', (req, res) => {
    res.render('carrinho', { carrinho });
});


module.exports = router;