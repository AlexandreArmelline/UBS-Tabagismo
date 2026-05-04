// 1 CONFIGURAÇÕES INICIAIS E VARIÁVEIS GLOBAIS
// 1.1 Dados de usuários de teste (protótipo)
const USUARIOS_TESTE = [
    {
        id: 1,
        nome: 'Admin UBS',
        login: 'admin',
        cpf: '111.111.111-11',
        senha: 'admin123',
        perfil: 'admin'
    },
    {
        id: 2,
        nome: 'Farmacêutica UBS',
        login: 'farmaceutica',
        cpf: '222.222.222-22',
        senha: 'farma123',
        perfil: 'operador'
    }
];

// 1.2 Inicialização dos dados no localStorage
function inicializarDados() {
    if (!localStorage.getItem('usuarios')) {
        localStorage.setItem('usuarios', JSON.stringify(USUARIOS_TESTE));
    }
    if (!localStorage.getItem('pacientes')) {
        localStorage.setItem('pacientes', JSON.stringify([]));
    }
    if (!localStorage.getItem('registros')) {
        localStorage.setItem('registros', JSON.stringify([]));
    }
    if (!localStorage.getItem('logs')) {
        localStorage.setItem('logs', JSON.stringify([]));
    }
}


// 2 FUNÇÕES DE AUTENTICAÇÃO
// 2.1 Validação de login
function validarLogin(usuario, senha) {
    usuario = usuario.trim();
    senha = senha.trim();
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioEncontrado = usuarios.find(
        u => (u.login === usuario || u.cpf === usuario) && u.senha === senha
    );
    
    return usuarioEncontrado;
}

// 2.2 Salvar sessão do usuário
function salvarSessao(usuario) {
    const sessao = {
        id: usuario.id,
        nome: usuario.nome,
        perfil: usuario.perfil,
        login: usuario.login,
        dataHoraLogin: new Date().toISOString()
    };
    localStorage.setItem('sessao', JSON.stringify(sessao));
    
    // Registrar log de login
    registrarLogNoApp('Login', `Usuário "${usuario.nome}" fez login no sistema`);
}

// 2.3 Verificar sessão (usado no index.html para pular login se já logado)
function verificarSessao() {
    const sessao = JSON.parse(localStorage.getItem('sessao'));
    if (sessao) {
        // Redireciona apenas se estiver na página de login
        if (window.location.pathname.includes('index.html') || 
            window.location.pathname === '/' || 
            window.location.pathname.endsWith('/')) {
            window.location.href = 'menu.html';
        }
    }
}

// 2.4 Função de logout
function logout() {
    localStorage.removeItem('sessao');
    window.location.href = 'index.html';
}


// 3 MANIPULAÇÃO DO FORMULÁRIO DE LOGIN
// 3.1 Exibir mensagem de erro
function exibirErro(mensagem) {
    const msgErro = document.getElementById('msgErro');
    if (!msgErro) return;
    const textoErro = document.getElementById('textoErro');
    if (textoErro) {
        textoErro.textContent = mensagem;
    }
    msgErro.classList.remove('d-none');
    
    setTimeout(() => {
        msgErro.classList.add('d-none');
    }, 5000);
}

// 3.2 Ocultar mensagem de erro
function ocultarErro() {
    const msgErro = document.getElementById('msgErro');
    if (msgErro) {
        msgErro.classList.add('d-none');
    }
}

// 3.3 Handler de submit do formulário
function handleLogin(event) {
    event.preventDefault();
    ocultarErro();
    
    const usuario = document.getElementById('inputUsuario').value;
    const senha = document.getElementById('inputSenha').value;
    
    if (!usuario || !senha) {
        exibirErro('Por favor, preencha todos os campos.');
        return;
    }
    
    const usuarioAutenticado = validarLogin(usuario, senha);
    
    if (usuarioAutenticado) {
        salvarSessao(usuarioAutenticado);
        window.location.href = 'menu.html';
    } else {
        exibirErro('Usuário/CPF ou senha incorretos. Tente novamente.');
        const inputSenha = document.getElementById('inputSenha');
        if (inputSenha) {
            inputSenha.value = '';
            inputSenha.focus();
        }
    }
}


// 4 FUNÇÃO DE LOG
// 4.1 Registrar log de atividades
function registrarLogNoApp(acao, detalhes) {
    const sessao = JSON.parse(localStorage.getItem('sessao'));
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    
    logs.push({
        dataHora: new Date().toISOString(),
        usuario: sessao ? sessao.nome : 'Sistema',
        acao,
        detalhes
    });
    
    localStorage.setItem('logs', JSON.stringify(logs));
}


// 5 INICIALIZAÇÃO DA PÁGINA
// 5.1 Evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    inicializarDados();
    
    // Só executa verificarSessao e formLogin se estiver no index.html
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        verificarSessao();
        formLogin.addEventListener('submit', handleLogin);
        
        const inputUsuario = document.getElementById('inputUsuario');
        if (inputUsuario) {
            inputUsuario.focus();
        }
    }
});