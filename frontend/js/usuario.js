// 1 CONFIGURAÇÕES INICIAIS
// 1.1 URL da API de usuários
const USUARIOS_API = `${API_URL}/usuarios`;


// 2 FUNÇÕES DE API
// 2.1 Listar usuários
async function listarUsuariosAPI() {
    try {
        const response = await fetch(USUARIOS_API, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Erro ao listar usuários');
        return await response.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

// 2.2 Cadastrar usuário
async function cadastrarUsuarioAPI(dados) {
    try {
        const response = await fetch(USUARIOS_API, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(dados)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || 'Erro ao cadastrar');
        return { sucesso: true, data };
    } catch (err) {
        return { sucesso: false, erro: err.message };
    }
}

// 2.3 Excluir usuário
async function excluirUsuarioAPI(id) {
    try {
        const response = await fetch(`${USUARIOS_API}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || 'Erro ao excluir');
        return { sucesso: true };
    } catch (err) {
        return { sucesso: false, erro: err.message };
    }
}


// 3 FUNÇÕES DE VALIDAÇÃO
function validarCPFUsuario(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let d1 = 11 - (soma % 11); if (d1 >= 10) d1 = 0;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    let d2 = 11 - (soma % 11); if (d2 >= 10) d2 = 0;
    return parseInt(cpf.charAt(9)) === d1 && parseInt(cpf.charAt(10)) === d2;
}


// 4 FUNÇÃO DE CADASTRO
async function cadastrarUsuario() {
    const dados = {
        nome: document.getElementById('nomeCompleto').value.trim(),
        cpf: document.getElementById('cpf').value.trim(),
        registro_profissional: document.getElementById('registroProfissional').value.trim(),
        login: document.getElementById('login').value.trim(),
        senha: document.getElementById('senha').value,
        perfil: document.getElementById('perfilAcesso').value
    };
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (!dados.nome || !dados.cpf || !dados.login || !dados.senha || !confirmarSenha || !dados.perfil) {
        exibirErroUsuario('Preencha todos os campos obrigatórios.');
        return;
    }
    if (!validarCPFUsuario(dados.cpf)) {
        exibirErroUsuario('CPF inválido.');
        return;
    }
    if (dados.login.length < 3) {
        exibirErroUsuario('Login deve ter no mínimo 3 caracteres.');
        return;
    }
    if (dados.senha.length < 6) {
        exibirErroUsuario('Senha deve ter no mínimo 6 caracteres.');
        return;
    }
    if (dados.senha !== confirmarSenha) {
        exibirErroUsuario('Senhas não conferem.');
        return;
    }

    const resultado = await cadastrarUsuarioAPI(dados);
    if (resultado.sucesso) {
        exibirSucessoUsuario(`Usuário cadastrado com sucesso!`);
        document.getElementById('formAddUsuario').reset();
        document.getElementById('nomeCompleto').focus();
    } else {
        exibirErroUsuario(resultado.erro);
    }
}


// 5 FUNÇÕES DE FEEDBACK
function exibirSucessoUsuario(mensagem) {
    const msg = document.getElementById('msgFeedback');
    if (!msg) return;
    msg.className = 'alert alert-success text-center rounded-3';
    msg.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>${mensagem}`;
    msg.classList.remove('d-none');
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => msg.classList.add('d-none'), 5000);
}

function exibirErroUsuario(mensagem) {
    const msg = document.getElementById('msgFeedback');
    if (!msg) return;
    msg.className = 'alert alert-danger text-center rounded-3';
    msg.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-1"></i>${mensagem}`;
    msg.classList.remove('d-none');
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => msg.classList.add('d-none'), 5000);
}