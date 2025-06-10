const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

let produtos = require('../data/produtos.json');

const getUsuarios = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, '../data/usuarios.jspn'), 'utf-8');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

let carrinho = [];

function proteger(req, res, next) {
    if (!req.session || !req.session.usuario) {
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
    const erro = req.query.erro || null;
    res.render('produtos', {
        produtos,
        erro,
        usuario: req.session.usuario || null
    });
});

// Página do produto individual
router.get('/produto/:id', (req, res) => {
    const produto = produtos.find(p => p.id === parseInt(req.params.id));
    if (!produto) return res.status(404).send('Produto nao encontrado');
    res.render('produto', { produto });
});

// Adicionar produto ao carrinho
router.post('/carrinho', (req, res) => {
    const produtoId = parseInt(req.body.produtoId);
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
        carrinho.push(produto);
    } else {
        return res.redirect('/produtos?erro=Produto%20nao%20encontrado');
    }
    res.redirect('/carrinho');
});

// Exibir carrinho com subtotal, frete e total
router.get('/carrinho', (req, res) => {
    // Exemplo simples: agrupar produtos iguais e contar quantidade
    const carrinhoAgrupado = [];

    carrinho.forEach(produto => {
        const existente = carrinhoAgrupado.find(p => p.id === produto.id);
        if (existente) {
            existente.quantidade++;
        } else {
            carrinhoAgrupado.push({ ...produto, quantidade: 1 });
        }
    });

    // Calcular subtotal
    const subtotal = carrinhoAgrupado.reduce((total, item) => total + item.preco * item.quantidade, 0);

    // Definir frete fixo para exemplo (zero se vazio)
    const frete = subtotal > 0 ? 20.0 : 0.0;

    // Total com frete
    const total = subtotal + frete;

    res.render('carrinho', {
        carrinho: carrinhoAgrupado,
        subtotal,
        frete,
        total
    });
});


// Tela de login
router.get('/login', (req, res) => {
    res.render('login', { erro: null });
});

// Processar login
router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const usuariosAtualizados = getUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    if (usuario) {
        req.session.usuario = usuario;
        res.redirect('/admin');
    } else {
        res.render('login', { erro: 'Email ou senha invalidos' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

// Painel admin
router.get('/admin', proteger, (req, res) => {
    res.render('admin', {
        usuario: req.session.usuario,
        produtos
    });
});

// Cadastro de novo produto
router.post('/admin', proteger, (req, res) => {
    const { nome, descricao, preco, imagem } = req.body;

    if (!nome || !descricao || !preco || !imagem) {
        return res.redirect('/admin?erro=Preencha%20todos%20os%20campos');
    }

    const novoProduto = {
        id: produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1,
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

    res.redirect('/admin');
});

// Rota que exibe o formulário de cadastro
router.get('/cadastro', (req, res) => {
    res.render('register', { erro: null, sucesso: null });
});

// Rota que processa o formulário de cadastro
router.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.render('register', { erro: 'Preencha todos os campos.', sucesso: null });
    }

   let usuariosAtualizados = getUsuarios();

    const usuarioExistente = usuariosAtualizados.find(u => u.email === email);
    if (usuarioExistente) {
        return res.render('register', { erro: 'Email já cadastrado.', sucesso: null });
    }

    const novoUsuario = {
        id: usuariosAtualizados.length > 0 ? Math.max(...usuariosAtualizados.map(u => u.id)) + 1 : 1,
        nome,
        email,
        senha
    };

    usuariosAtualizados.push(novoUsuario);

    try {
        fs.writeFileSync(
            path.join(__dirname, '../data/usuarios.json'),
            JSON.stringify(usuariosAtualizados, null, 2)
        );
    } catch (err) {
        return res.render('register', { erro: 'Erro ao salvar usuário.', sucesso: null });
    }

    res.render('register', { sucesso: 'Conta criada com sucesso!', erro: null });
});

module.exports = router;
