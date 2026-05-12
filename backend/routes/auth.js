// 1 CONFIGURAÇÕES INICIAIS
// 1.1 Importação de dependências
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

// 1.2 Configuração do router
const router = express.Router();


// 2 ROTA DE LOGIN
// 2.1 POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;

        // 2.1.1 Validação básica
        if (!usuario || !senha) {
            return res.status(400).json({ 
                erro: 'Usuário/CPF e senha são obrigatórios.' 
            });
        }

        // 2.1.2 Buscar usuário por login ou CPF
        const user = await get(
            'SELECT * FROM usuarios WHERE (login = ? OR cpf = ?) AND ativo = 1',
            [usuario.trim(), usuario.trim()]
        );

        if (!user) {
            return res.status(401).json({ 
                erro: 'Usuário/CPF ou senha incorretos.' 
            });
        }

        // 2.1.3 Verificar senha
        const senhaValida = await bcrypt.compare(senha, user.senha_hash);
        
        if (!senhaValida) {
            return res.status(401).json({ 
                erro: 'Usuário/CPF ou senha incorretos.' 
            });
        }

        // 2.1.4 Gerar token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                nome: user.nome, 
                perfil: user.perfil,
                login: user.login 
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 2.1.5 Registrar log de login
        await run(
            `INSERT INTO logs (id_usuario, acao, tabela_afetada, id_registro_afetado, dados_novos)
             VALUES (?, 'LOGIN', 'usuarios', ?, ?)`,
            [user.id, user.id, `Usuário "${user.nome}" fez login`]
        );

        // 2.1.6 Retornar resposta
        res.json({
            token,
            usuario: {
                id: user.id,
                nome: user.nome,
                perfil: user.perfil,
                login: user.login
            }
        });

    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});


// 3 ROTA DE CRIAÇÃO DO USUÁRIO ADMIN INICIAL
// 3.1 POST /api/auth/inicializar
router.post('/inicializar', async (req, res) => {
    try {
        // 3.1.1 Verificar se já existem usuários
        const existentes = await get('SELECT COUNT(*) as total FROM usuarios');
        
        if (existentes.total > 0) {
            return res.status(400).json({ 
                erro: 'Sistema já inicializado. Usuários existentes.' 
            });
        }

        // 3.1.2 Criar senha hash
        const senhaHash = await bcrypt.hash('admin123', 10);
        const senhaHashFarma = await bcrypt.hash('farma123', 10);

        // 3.1.3 Inserir usuário admin
        await run(
            `INSERT INTO usuarios (nome, cpf, login, senha_hash, perfil)
             VALUES (?, ?, ?, ?, ?)`,
            ['Admin UBS', '111.111.111-11', 'admin', senhaHash, 'admin']
        );

        // 3.1.4 Inserir usuário farmacêutica
        await run(
            `INSERT INTO usuarios (nome, cpf, login, senha_hash, perfil)
             VALUES (?, ?, ?, ?, ?)`,
            ['Farmacêutica UBS', '222.222.222-22', 'farmaceutica', senhaHashFarma, 'operador']
        );

        res.json({ mensagem: 'Sistema inicializado com sucesso! Usuários padrão criados.' });

    } catch (err) {
        console.error('Erro na inicialização:', err);
        res.status(500).json({ erro: 'Erro ao inicializar o sistema.' });
    }
});


// 4 EXPORTAÇÃO
module.exports = router;