// 1 CONFIGURAÇÕES INICIAIS E VARIÁVEIS GLOBAIS
// 1.1 URL base da API
//const API_URL = 'http://localhost:3000/api';

const API_URL = 'https://ubs-tabagismo.onrender.com/api';

// 1.2 Token JWT (armazenado em memória e sessionStorage)
let authToken = sessionStorage.getItem('token') || null;


// 2 FUNÇÕES DE AUTENTICAÇÃO
// 2.1 Login via API
async function loginAPI(usuario, senha) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || 'Erro ao fazer login');
        }

        // Salvar token
        authToken = data.token;
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

        return data;
    } catch (err) {
        throw err;
    }
}

// 2.2 Salvar sessão (compatível com código existente)
function salvarSessao(usuario) {
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
}

// 2.3 Verificar sessão (index.html)
function verificarSessao() {
    const token = sessionStorage.getItem('token');
    if (token) {
        authToken = token;
        if (window.location.pathname.includes('index.html') ||
            window.location.pathname === '/' ||
            window.location.pathname.endsWith('/')) {
            window.location.href = 'menu.html';
        }
    }
}

// 2.4 Logout
function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    authToken = null;
    window.location.href = 'index.html';
}

// 2.5 Obter cabeçalhos com autenticação
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
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
async function handleLogin(event) {
    event.preventDefault();
    ocultarErro();

    const usuario = document.getElementById('inputUsuario').value;
    const senha = document.getElementById('inputSenha').value;

    if (!usuario || !senha) {
        exibirErro('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const data = await loginAPI(usuario, senha);
        salvarSessao(data.usuario);
        window.location.href = 'menu.html';
    } catch (err) {
        exibirErro(err.message || 'Usuário/CPF ou senha incorretos.');
        const inputSenha = document.getElementById('inputSenha');
        if (inputSenha) {
            inputSenha.value = '';
            inputSenha.focus();
        }
    }
}


// 4 INICIALIZAÇÃO DA PÁGINA
// 4.1 Evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    // Configurar token se existir
    const token = sessionStorage.getItem('token');
    if (token) {
        authToken = token;
    }

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