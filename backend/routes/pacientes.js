// 1 CONFIGURAÇÕES INICIAIS
// 1.1 Importação de dependências
const express = require('express');
const { query, run, get } = require('../database');
const { verificarToken } = require('../middleware/auth');

// 1.2 Configuração do router
const router = express.Router();

// 1.3 Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);


// 2 ROTAS DE PACIENTES
// 2.1 GET /api/pacientes - Listar pacientes
router.get('/', async (req, res) => {
    try {
        const { busca, status } = req.query;

        let sql = 'SELECT * FROM pacientes WHERE 1=1';
        const params = [];

        // 2.1.1 Filtro de busca
        if (busca) {
            sql += ' AND (nome_completo LIKE ? OR cpf LIKE ?)';
            params.push(`%${busca}%`, `%${busca}%`);
        }

        // 2.1.2 Filtro de status
        if (status === 'ativo') {
            sql += ' AND ativo = 1';
        } else if (status === 'inativo') {
            sql += ' AND ativo = 0';
        }

        sql += ' ORDER BY nome_completo ASC';

        const pacientes = await query(sql, params);
        res.json(pacientes);

    } catch (err) {
        console.error('Erro ao listar pacientes:', err);
        res.status(500).json({ erro: 'Erro ao buscar pacientes.' });
    }
});

// 2.2 GET /api/pacientes/:id - Buscar paciente por ID
router.get('/:id', async (req, res) => {
    try {
        const paciente = await get(
            'SELECT * FROM pacientes WHERE id = ?',
            [req.params.id]
        );

        if (!paciente) {
            return res.status(404).json({ erro: 'Paciente não encontrado.' });
        }

        res.json(paciente);

    } catch (err) {
        console.error('Erro ao buscar paciente:', err);
        res.status(500).json({ erro: 'Erro ao buscar paciente.' });
    }
});

// 2.3 POST /api/pacientes - Cadastrar paciente
router.post('/', async (req, res) => {
    try {
        const {
            nome_completo, cpf, rg, data_nascimento, telefone,
            endereco, cidade, uf, data_adesao, observacoes
        } = req.body;

        // 2.3.1 Validações
        if (!nome_completo || !cpf) {
            return res.status(400).json({ 
                erro: 'Nome completo e CPF são obrigatórios.' 
            });
        }

        // 2.3.2 Verificar CPF duplicado
        const existente = await get(
            'SELECT id FROM pacientes WHERE cpf = ?',
            [cpf.replace(/\D/g, '')]
        );

        if (existente) {
            return res.status(400).json({ 
                erro: 'Já existe um paciente cadastrado com este CPF.' 
            });
        }

        // 2.3.3 Inserir paciente
        const resultado = await run(
            `INSERT INTO pacientes 
             (nome_completo, cpf, rg, data_nascimento, telefone, endereco, cidade, uf, data_adesao, observacoes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nome_completo, cpf, rg, data_nascimento, telefone, endereco, cidade, uf, data_adesao, observacoes]
        );

        // 2.3.4 Registrar log (LGPD)
        await run(
            `INSERT INTO logs (id_usuario, acao, tabela_afetada, id_registro_afetado, dados_novos)
             VALUES (?, 'CRIAR', 'pacientes', ?, ?)`,
            [req.usuario.id, resultado.id, JSON.stringify(req.body)]
        );

        res.status(201).json({ 
            id: resultado.id, 
            mensagem: 'Paciente cadastrado com sucesso!' 
        });

    } catch (err) {
        console.error('Erro ao cadastrar paciente:', err);
        res.status(500).json({ erro: 'Erro ao cadastrar paciente.' });
    }
});

// 2.4 PUT /api/pacientes/:id - Atualizar paciente
router.put('/:id', async (req, res) => {
    try {
        const paciente = await get('SELECT * FROM pacientes WHERE id = ?', [req.params.id]);
        
        if (!paciente) {
            return res.status(404).json({ erro: 'Paciente não encontrado.' });
        }

        const {
            nome_completo, cpf, rg, data_nascimento, telefone,
            endereco, cidade, uf, data_adesao, observacoes, ativo
        } = req.body;

        await run(
            `UPDATE pacientes SET 
             nome_completo = ?, cpf = ?, rg = ?, data_nascimento = ?,
             telefone = ?, endereco = ?, cidade = ?, uf = ?,
             data_adesao = ?, observacoes = ?, ativo = ?,
             data_atualizacao = datetime('now', '-3 hours')
             WHERE id = ?`,
            [nome_completo, cpf, rg, data_nascimento, telefone, endereco, cidade, uf, 
             data_adesao, observacoes, ativo !== false ? 1 : 0, req.params.id]
        );

        // Registrar log (LGPD)
        await run(
            `INSERT INTO logs (id_usuario, acao, tabela_afetada, id_registro_afetado, dados_anteriores, dados_novos)
             VALUES (?, 'ATUALIZAR', 'pacientes', ?, ?, ?)`,
            [req.usuario.id, req.params.id, JSON.stringify(paciente), JSON.stringify(req.body)]
        );

        res.json({ mensagem: 'Paciente atualizado com sucesso!' });

    } catch (err) {
        console.error('Erro ao atualizar paciente:', err);
        res.status(500).json({ erro: 'Erro ao atualizar paciente.' });
    }
});

// ROTA TEMPORÁRIA - EXCLUIR POR NOME
router.delete('/nome/:nome', async (req, res) => {
    try {
        const resultado = await run(
            'DELETE FROM pacientes WHERE nome_completo LIKE ?',
            [`%${req.params.nome}%`]
        );
        
        // Registrar log
        await run(
            `INSERT INTO logs (id_usuario, acao, tabela_afetada, dados_novos)
             VALUES (?, 'EXCLUIR_POR_NOME', 'pacientes', ?)`,
            [req.usuario.id, `Excluídos ${resultado.changes} pacientes com nome "${req.params.nome}"`]
        );

        res.json({ 
            mensagem: `${resultado.changes} paciente(s) excluído(s) com sucesso!` 
        });
    } catch (err) {
        console.error('Erro ao excluir:', err);
        res.status(500).json({ erro: 'Erro ao excluir pacientes.' });
    }
});

// 3 EXPORTAÇÃO
module.exports = router;