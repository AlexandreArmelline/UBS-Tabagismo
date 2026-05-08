// 1 CONFIGURAÇÕES INICIAIS
// 1.1 Chave do localStorage para usuários
const CHAVE_USUARIOS = 'usuarios';


// 2 FUNÇÕES DE VALIDAÇÃO
// 2.1 Validar CPF (algoritmo básico)
function validarCPFUsuario(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digito1 = 11 - (soma % 11);
    if (digito1 >= 10) digito1 = 0;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digito2 = 11 - (soma % 11);
    if (digito2 >= 10) digito2 = 0;
    
    return parseInt(cpf.charAt(9)) === digito1 && parseInt(cpf.charAt(10)) === digito2;
}

// 2.2 Verificar se login já existe
function loginJaExiste(login) {
    const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    return usuarios.some(u => u.login.toLowerCase() === login.toLowerCase());
}

// 2.3 Verificar se CPF já está cadastrado
function cpfUsuarioJaExiste(cpf) {
    const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    const cpfLimpo = cpf.replace(/\D/g, '');
    return usuarios.some(u => u.cpf.replace(/\D/g, '') === cpfLimpo);
}


// 3 FUNÇÕES DE MANIPULAÇÃO DE DADOS
// 3.1 Obter próximo ID disponível
function obterProximoIdUsuario() {
    const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    if (usuarios.length === 0) return 1;
    return Math.max(...usuarios.map(u => u.id)) + 1;
}

// 3.2 Salvar usuário no localStorage
function salvarUsuario(usuario) {
    const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    usuarios.push(usuario);
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}


// 4 FUNÇÕES DE FEEDBACK
// 4.1 Exibir mensagem de sucesso
function exibirSucessoUsuario(mensagem) {
    const msgFeedback = document.getElementById('msgFeedback');
    msgFeedback.className = 'alert alert-success mt-3 text-center rounded-3';
    msgFeedback.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>${mensagem}`;
    msgFeedback.classList.remove('d-none');
    
    setTimeout(() => {
        msgFeedback.classList.add('d-none');
    }, 5000);
}

// 4.2 Exibir mensagem de erro
function exibirErroUsuario(mensagem) {
    const msgFeedback = document.getElementById('msgFeedback');
    msgFeedback.className = 'alert alert-danger mt-3 text-center rounded-3';
    msgFeedback.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-1"></i>${mensagem}`;
    msgFeedback.classList.remove('d-none');
    
    setTimeout(() => {
        msgFeedback.classList.add('d-none');
    }, 5000);
}


// 5 FUNÇÃO PRINCIPAL DE CADASTRO
// 5.1 Coletar dados do formulário e cadastrar
function cadastrarUsuario() {
    const nomeCompleto = document.getElementById('nomeCompleto').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const registroProfissional = document.getElementById('registroProfissional').value.trim();
    const login = document.getElementById('login').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const perfilAcesso = document.getElementById('perfilAcesso').value;
    
    // 5.1.1 Validações básicas
    if (!nomeCompleto || !cpf || !login || !senha || !confirmarSenha || !perfilAcesso) {
        exibirErroUsuario('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // 5.1.2 Validar CPF
    if (!validarCPFUsuario(cpf)) {
        exibirErroUsuario('CPF inválido. Verifique o número digitado.');
        return;
    }
    
    // 5.1.3 Verificar duplicidade de CPF
    if (cpfUsuarioJaExiste(cpf)) {
        exibirErroUsuario('Já existe um usuário cadastrado com este CPF.');
        return;
    }
    
    // 5.1.4 Validar login
    if (login.length < 3) {
        exibirErroUsuario('O login deve ter no mínimo 3 caracteres.');
        return;
    }
    
    // 5.1.5 Verificar duplicidade de login
    if (loginJaExiste(login)) {
        exibirErroUsuario('Este login já está em uso. Escolha outro.');
        return;
    }
    
    // 5.1.6 Validar senha
    if (senha.length < 6) {
        exibirErroUsuario('A senha deve ter no mínimo 6 caracteres.');
        return;
    }
    
    // 5.1.7 Verificar se senhas conferem
    if (senha !== confirmarSenha) {
        exibirErroUsuario('As senhas não conferem. Verifique.');
        return;
    }
    
    // 5.1.8 Montar objeto usuário
    const usuario = {
        id: obterProximoIdUsuario(),
        nome: nomeCompleto,
        cpf,
        registroProfissional,
        login,
        senha,
        perfil: perfilAcesso,
        ativo: true,
        dataCadastro: new Date().toISOString()
    };
    
    // 5.1.9 Salvar e dar feedback
    salvarUsuario(usuario);
    exibirSucessoUsuario(`Usuário "${nomeCompleto}" cadastrado com sucesso!`);
    
    // 5.1.10 Limpar formulário
    document.getElementById('formAddUsuario').reset();
    document.getElementById('nomeCompleto').focus();
    document.getElementById('forcaSenhaContainer').style.display = 'none';
}