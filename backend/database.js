// 1 CONFIGURAÇÕES INICIAIS
// 1.1 Importação de dependências
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 1.2 Caminho do banco de dados
const dbPath = path.resolve(__dirname, 'ubs_tabagismo.db');

// 1.3 Conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Conectado ao banco SQLite com sucesso.');
        console.log('Arquivo:', dbPath);
    }
});


// 2 CRIAÇÃO DAS TABELAS
// 2.1 Habilitar chaves estrangeiras
db.run('PRAGMA foreign_keys = ON');

// 2.2 Tabela de Usuários
db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        registro_profissional TEXT,
        login TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        perfil TEXT NOT NULL CHECK(perfil IN ('admin', 'operador')),
        ativo INTEGER DEFAULT 1,
        data_cadastro TEXT DEFAULT (datetime('now', '-3 hours')),
        data_atualizacao TEXT DEFAULT (datetime('now', '-3 hours'))
    )
`);

// 2.3 Tabela de Pacientes
db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_completo TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        rg TEXT,
        data_nascimento TEXT,
        telefone TEXT,
        endereco TEXT,
        cidade TEXT,
        uf TEXT,
        data_adesao TEXT,
        observacoes TEXT,
        ativo INTEGER DEFAULT 1,
        data_cadastro TEXT DEFAULT (datetime('now', '-3 hours')),
        data_atualizacao TEXT DEFAULT (datetime('now', '-3 hours'))
    )
`);

// 2.4 Tabela de Registros Clínicos
db.run(`
    CREATE TABLE IF NOT EXISTS registros_clinicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_paciente INTEGER NOT NULL,
        id_usuario INTEGER NOT NULL,
        data_atendimento TEXT NOT NULL,
        peso REAL,
        pressao_sistolica INTEGER,
        pressao_diastolica INTEGER,
        fuma_atualmente TEXT CHECK(fuma_atualmente IN ('sim', 'nao')),
        quantidade_cigarros INTEGER,
        medicamento TEXT,
        dias_sem_fumar INTEGER,
        recaidas INTEGER,
        gatilhos TEXT,
        hobbies TEXT,
        ambiente_familiar TEXT,
        observacoes_clinicas TEXT,
        data_registro TEXT DEFAULT (datetime('now', '-3 hours')),
        FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON DELETE CASCADE,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    )
`);

// 2.5 Tabela de Logs (LGPD)
db.run(`
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER,
        acao TEXT NOT NULL,
        tabela_afetada TEXT,
        id_registro_afetado INTEGER,
        dados_anteriores TEXT,
        dados_novos TEXT,
        ip_origem TEXT,
        data_hora TEXT DEFAULT (datetime('now', '-3 hours')),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    )
`);


// 3 FUNÇÕES UTILITÁRIAS
// 3.1 Executar query com promise
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// 3.2 Executar run (INSERT, UPDATE, DELETE) com promise
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

// 3.3 Executar get (uma linha) com promise
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}


// 4 EXPORTAÇÃO
module.exports = { db, query, run, get };