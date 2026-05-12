// 1 CONFIGURAÇÕES INICIAIS
// 1.1 Importação de dependências
const express = require('express');
const { query, run } = require('../database');
const { verificarToken } = require('../middleware/auth');

// 1.2 Configuração do router
const router = express.Router();

// 1.3 Aplicar middleware de autenticação
router.use(verificarToken);


// 2 ROTAS DE REGISTROS CLÍNICOS
// 2.1 GET /api/registros/paciente/:id - Registros de um paciente
router.get('/paciente/:id', async (req, res) => {
    try {
        const registros = await query(
            `SELECT r.*, u.nome as nome_usuario
             FROM registros_clinicos r
             JOIN usuarios u ON r.id_usuario = u.id
             WHERE r.id_paciente = ?
             ORDER BY r.data_atendimento DESC`,
            [req.params.id]
        );
        res.json(registros);
    } catch (err) {
        console.error('Erro ao buscar registros:', err);
        res.status(500).json({ erro: 'Erro ao buscar registros clínicos.' });
    }
});

// 2.2 POST /api/registros - Criar registro clínico
router.post('/', async (req, res) => {
    try {
        const {
            id_paciente, data_atendimento, peso, pressao_sistolica,
            pressao_diastolica, fuma_atualmente, quantidade_cigarros,
            medicamento, dias_sem_fumar, recaidas, gatilhos, hobbies,
            ambiente_familiar, observacoes_clinicas
        } = req.body;

        // 2.2.1 Validações
        if (!id_paciente || !data_atendimento || !fuma_atualmente) {
            return res.status(400).json({ 
                erro: 'Paciente, data de atendimento e status do tabagismo são obrigatórios.' 
            });
        }

        // 2.2.2 Inserir registro
        const resultado = await run(
            `INSERT INTO registros_clinicos 
             (id_paciente, id_usuario, data_atendimento, peso, pressao_sistolica,
              pressao_diastolica, fuma_atualmente, quantidade_cigarros, medicamento,
              dias_sem_fumar, recaidas, gatilhos, hobbies, ambiente_familiar,
              observacoes_clinicas)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_paciente, req.usuario.id, data_atendimento, peso, pressao_sistolica,
             pressao_diastolica, fuma_atualmente, quantidade_cigarros, medicamento,
             dias_sem_fumar, recaidas, gatilhos, hobbies, ambiente_familiar,
             observacoes_clinicas]
        );

        // 2.2.3 Registrar log (LGPD)
        await run(
            `INSERT INTO logs (id_usuario, acao, tabela_afetada, id_registro_afetado, dados_novos)
             VALUES (?, 'CRIAR', 'registros_clinicos', ?, ?)`,
            [req.usuario.id, resultado.id, JSON.stringify(req.body)]
        );

        res.status(201).json({ 
            id: resultado.id, 
            mensagem: 'Registro clínico salvo com sucesso!' 
        });

    } catch (err) {
        console.error('Erro ao criar registro:', err);
        res.status(500).json({ erro: 'Erro ao salvar registro clínico.' });
    }
});

// 2.3 GET /api/registros/ultimos - Últimos registros (dashboard)
router.get('/ultimos', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const registros = await query(
            `SELECT r.*, p.nome_completo as nome_paciente, u.nome as nome_usuario
             FROM registros_clinicos r
             JOIN pacientes p ON r.id_paciente = p.id
             JOIN usuarios u ON r.id_usuario = u.id
             ORDER BY r.data_registro DESC
             LIMIT ?`,
            [limit]
        );
        res.json(registros);
    } catch (err) {
        console.error('Erro ao buscar últimos registros:', err);
        res.status(500).json({ erro: 'Erro ao buscar registros.' });
    }
});

// 2.4 GET /api/registros/dashboard - Dados para o dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Total de pacientes
        const totalPacientes = await query('SELECT COUNT(*) as total FROM pacientes');
        
        // Pacientes ativos
        const ativos = await query('SELECT COUNT(*) as total FROM pacientes WHERE ativo = 1');
        
        // Total de registros
        const totalRegistros = await query('SELECT COUNT(*) as total FROM registros_clinicos');
        
        // Taxa de cessação
        const cessacao = await query(`
            SELECT 
                SUM(CASE WHEN fuma_atualmente = 'nao' THEN 1 ELSE 0 END) as pararam,
                COUNT(*) as total
            FROM registros_clinicos
            WHERE id IN (
                SELECT MAX(id) FROM registros_clinicos GROUP BY id_paciente
            )
        `);

        res.json({
            totalPacientes: totalPacientes[0].total,
            pacientesAtivos: ativos[0].total,
            totalRegistros: totalRegistros[0].total,
            taxaCessacao: cessacao[0].total > 0 
                ? Math.round((cessacao[0].pararam / cessacao[0].total) * 100) 
                : 0
        });

    } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        res.status(500).json({ erro: 'Erro ao carregar dashboard.' });
    }
});


// 3 EXPORTAÇÃO
module.exports = router;