// 1 CONFIGURAÇÕES INICIAIS
// 1.1 Importação de dependências
const express = require('express');
const bcrypt = require('bcryptjs');
const { query, run, get } = require('../database');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// 1.2 Configuração do router
const router = express.Router();

// 1.3 Aplicar middleware de autenticação + admin
router.use(verificarToken);
router.use(verificarAdmin);


// 2 ROTAS DE USUÁRIOS
// 2.1 GET /api/usuarios - Listar usuários
router.get('/', async (req, res) => {
    try {
        const usuarios = await query(
            `SELECT id, nome, cpf, registro_profissional, login, perfil, ativo, data_cadastro 
             FROM usuarios ORDER BY nome ASC`
        );
        res.json(usuarios);
    } catch (err) {
        console.error('Erro ao listar usuários:', err);
        res.status(500).json({ erro: 'Erro ao buscar usuários.' });
    }
});

// 2.2 POST /api/usuarios - Cadastrar usuário
router.post('/', async (req, res) => {
    try {
        const { nome, cpf, registro_profissional, login, senha, perfil } = req.body;

        // 2.2.1 Validações
        if (!nome || !cpf || !login || !senha || !perfil) {
            return res.status(400).json({ 
                erro: 'Todos os campos obrigatórios devem ser preenchidos.' 
            });
        }

        // 2.2.2 Verificar login duplicado
        const loginExiste = await get('SELECT id FROM usuarios WHERE login = ?', [login]);
        if (loginExiste) {
            return res.status(400).json({ erro: 'Este login já está em uso.' });
        }

        // 2.2.3 Verificar CPF duplicado
        const cpfExiste = await get('SELECT id FROM usuarios WHERE cpf = ?', [cpf]);
        if (cpfExiste) {
            return res.status(400).json({ erro: 'Já existe um usuário com este CPF.' });
        }

        // 2.2.4 Criptografar senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // 2.2.5 Inserir usuário
        const resultado = await run(
            `INSERT INTO usuarios (nome, cpf, registro_profissional, login, senha_hash, perfil)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nome, cpf, registro_profissional, login, senhaHash, perfil]
        );

        res.status(201).json({ 
            id: resultado.id, 
            mensagem: 'Usuário cadastrado com sucesso!' 
        });

    } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
    }
});

// 2.3 PUT /api/usuarios/:id - Atualizar usuário
router.put('/:id', async (req, res) => {
    try {
        const { nome, cpf, registro_profissional, login, senha, perfil, ativo } = req.body;

        if (senha) {
            const senhaHash = await bcrypt.hash(senha, 10);
            await run(
                `UPDATE usuarios SET nome=?, cpf=?, registro_profissional=?, login=?, senha_hash=?, perfil=?, ativo=?, data_atualizacao=datetime('now','-3 hours') WHERE id=?`,
                [nome, cpf, registro_profissional, login, senhaHash, perfil, ativo !== false ? 1 : 0, req.params.id]
            );
        } else {
            await run(
                `UPDATE usuarios SET nome=?, cpf=?, registro_profissional=?, login=?, perfil=?, ativo=?, data_atualizacao=datetime('now','-3 hours') WHERE id=?`,
                [nome, cpf, registro_profissional, login, perfil, ativo !== false ? 1 : 0, req.params.id]
            );
        }

        res.json({ mensagem: 'Usuário atualizado com sucesso!' });

    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        res.status(500).json({ erro: 'Erro ao atualizar usuário.' });
    }
});

// 2.4 DELETE /api/usuarios/:id - Excluir usuário
router.delete('/:id', async (req, res) => {
    try {
        const usuario = await get('SELECT * FROM usuarios WHERE id = ?', [req.params.id]);
        
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        if (usuario.perfil === 'admin') {
            return res.status(400).json({ erro: 'Não é permitido excluir administradores.' });
        }

        await run('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        res.json({ mensagem: 'Usuário excluído com sucesso!' });

    } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        res.status(500).json({ erro: 'Erro ao excluir usuário.' });
    }
});


// 3 EXPORTAÇÃO
module.exports = router;