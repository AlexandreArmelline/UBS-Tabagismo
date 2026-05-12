// 1 CONFIGURAÇÕES INICIAIS
// 1.1 Importação de dependências
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 1.2 Importação das rotas
const authRoutes = require('./routes/auth');
const pacientesRoutes = require('./routes/pacientes');
const usuariosRoutes = require('./routes/usuarios');
const registrosRoutes = require('./routes/registros');

// 1.3 Configuração do app
const app = express();
const PORT = process.env.PORT || 3000;

// 1.4 Middlewares globais
app.use(cors());
app.use(express.json());

// 1.5 Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));


// 2 ROTAS
// 2.1 Rota principal - serve o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// 2.2 Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/registros', registrosRoutes);


// 3 INICIALIZAÇÃO DO SERVIDOR
// 3.1 Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  Servidor rodando na porta ${PORT}`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`========================================\n`);
});