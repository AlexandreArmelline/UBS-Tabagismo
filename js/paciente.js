// 1 CONFIGURAÇÕES INICIAIS
// 1.1 Chave do localStorage para pacientes
const CHAVE_PACIENTES = 'pacientes';


// 2 FUNÇÕES DE VALIDAÇÃO
// 2.1 Validar CPF (algoritmo básico)
function validarCPF(cpf) {
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

// 2.2 Validar se CPF já está cadastrado
function cpfJaCadastrado(cpf) {
    const pacientes = JSON.parse(localStorage.getItem(CHAVE_PACIENTES)) || [];
    const cpfLimpo = cpf.replace(/\D/g, '');
    return pacientes.some(p => p.cpf.replace(/\D/g, '') === cpfLimpo);
}


// 3 FUNÇÕES DE MANIPULAÇÃO DE DADOS
// 3.1 Obter próximo ID disponível
function obterProximoId() {
    const pacientes = JSON.parse(localStorage.getItem(CHAVE_PACIENTES)) || [];
    if (pacientes.length === 0) return 1;
    return Math.max(...pacientes.map(p => p.id)) + 1;
}

// 3.2 Salvar paciente no localStorage
function salvarPaciente(paciente) {
    const pacientes = JSON.parse(localStorage.getItem(CHAVE_PACIENTES)) || [];
    pacientes.push(paciente);
    localStorage.setItem(CHAVE_PACIENTES, JSON.stringify(pacientes));
}


// 4 FUNÇÕES DE FEEDBACK
// 4.1 Exibir mensagem de sucesso
function exibirSucesso(mensagem) {
    const msgFeedback = document.getElementById('msgFeedback');
    msgFeedback.className = 'alert alert-success mt-3 text-center';
    msgFeedback.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>${mensagem}`;
    msgFeedback.classList.remove('d-none');
    
    setTimeout(() => {
        msgFeedback.classList.add('d-none');
    }, 5000);
}

// 4.2 Exibir mensagem de erro
function exibirErroPaciente(mensagem) {
    const msgFeedback = document.getElementById('msgFeedback');
    msgFeedback.className = 'alert alert-danger mt-3 text-center';
    msgFeedback.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-1"></i>${mensagem}`;
    msgFeedback.classList.remove('d-none');
    
    setTimeout(() => {
        msgFeedback.classList.add('d-none');
    }, 5000);
}


// 5 FUNÇÃO PRINCIPAL DE CADASTRO
// 5.1 Coletar dados do formulário e cadastrar
function cadastrarPaciente() {
    // Coleta dados
    const nomeCompleto = document.getElementById('nomeCompleto').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const rg = document.getElementById('rg').value.trim();
    const dataNascimento = document.getElementById('dataNascimento').value;
    const telefone = document.getElementById('telefone').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const uf = document.getElementById('uf').value;
    const dataAdesao = document.getElementById('dataAdesao').value;
    const observacoes = document.getElementById('observacoes').value.trim();
    
    // 5.1.1 Validações básicas
    if (!nomeCompleto || !cpf || !dataNascimento || !dataAdesao) {
        exibirErroPaciente('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // 5.1.2 Validar CPF
    if (!validarCPF(cpf)) {
        exibirErroPaciente('CPF inválido. Verifique o número digitado.');
        return;
    }
    
    // 5.1.3 Verificar duplicidade de CPF
    if (cpfJaCadastrado(cpf)) {
        exibirErroPaciente('Já existe um paciente cadastrado com este CPF.');
        return;
    }
    
    // 5.1.4 Validar data de nascimento
    const hoje = new Date();
    const nascimento = new Date(dataNascimento + 'T00:00:00');
    if (nascimento > hoje) {
        exibirErroPaciente('A data de nascimento não pode ser futura.');
        return;
    }
    
    // 5.1.5 Validar data de adesão
    const adesao = new Date(dataAdesao + 'T00:00:00');
    if (adesao > hoje) {
        exibirErroPaciente('A data de adesão não pode ser futura.');
        return;
    }
    
    // 5.1.6 Montar objeto paciente
    const paciente = {
        id: obterProximoId(),
        nomeCompleto,
        cpf,
        rg,
        dataNascimento,
        telefone,
        endereco,
        cidade,
        uf,
        dataAdesao,
        observacoes,
        ativo: true,
        dataCadastro: new Date().toISOString()
    };
    
    // 5.1.7 Salvar e dar feedback
    salvarPaciente(paciente);
    exibirSucesso(`Paciente "${nomeCompleto}" cadastrado com sucesso!`);
    
    // 5.1.8 Limpar formulário
    document.getElementById('formAddPaciente').reset();
    document.getElementById('nomeCompleto').focus();
}