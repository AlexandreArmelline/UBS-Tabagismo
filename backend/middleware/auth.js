// 1 CONFIGURAÇÕES INICIAIS
// 1.1 Importação de dependências
const jwt = require('jsonwebtoken');

// 1.2 Chave secreta (deve estar no .env em produção)
const JWT_SECRET = process.env.JWT_SECRET || 'ubs-ipiranga-pi-univesp-2026';


// 2 FUNÇÕES DE MIDDLEWARE
// 2.1 Verificar token JWT
function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            erro: 'Acesso negado. Token não fornecido.' 
        });
    }
    
    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
        return res.status(401).json({ 
            erro: 'Acesso negado. Token inválido.' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ 
            erro: 'Token expirado ou inválido. Faça login novamente.' 
        });
    }
}

// 2.2 Verificar se é administrador
function verificarAdmin(req, res, next) {
    if (req.usuario && req.usuario.perfil === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            erro: 'Acesso negado. Permissão de administrador necessária.' 
        });
    }
}


// 3 EXPORTAÇÃO
module.exports = { verificarToken, verificarAdmin, JWT_SECRET };