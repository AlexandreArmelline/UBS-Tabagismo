// 1 CONFIGURAÇÕES INICIAIS
// 1.1 URL da API de pacientes
const PACIENTES_API = `${API_URL}/pacientes`;


// 2 FUNÇÕES DE API
// 2.1 Buscar todos os pacientes
async function buscarPacientes(busca = '', status = '') {
    try {
        const params = new URLSearchParams();
        if (busca) params.append('busca', busca);
        if (status && status !== 'todos') params.append('status', status);

        const response = await fetch(`${PACIENTES_API}?${params.toString()}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Erro ao buscar pacientes');
        return await response.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

// 2.2 Buscar paciente por ID
async function buscarPacientePorId(id) {
    try {
        const response = await fetch(`${PACIENTES_API}/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Paciente não encontrado');
        return await response.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

// 2.3 Cadastrar paciente
async function cadastrarPacienteAPI(dados) {
    try {
        const response = await fetch(PACIENTES_API, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(dados)
        });

        const data = await response.json();
        
        if (!response.ok) {
            // Extrai a mensagem de erro da API
            throw new Error(data.erro || 'Erro ao cadastrar paciente.');
        }
        
        return { sucesso: true, data };
    } catch (err) {
        return { sucesso: false, erro: err.message };
    }
}



// 3 FUNÇÕES DE VALIDAÇÃO (LOCAL)
// 3.1 Validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let digito1 = 11 - (soma % 11);
    if (digito1 >= 10) digito1 = 0;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    let digito2 = 11 - (soma % 11);
    if (digito2 >= 10) digito2 = 0;

    return parseInt(cpf.charAt(9)) === digito1 && parseInt(cpf.charAt(10)) === digito2;
}


// 4 FUNÇÃO DE CADASTRO (utilizada em add-paciente.html)
async function cadastrarPaciente() {
    const dados = {
        nome_completo: document.getElementById('nomeCompleto').value.trim(),
        cpf: document.getElementById('cpf').value.trim(),
        rg: document.getElementById('rg').value.trim(),
        data_nascimento: document.getElementById('dataNascimento').value,
        telefone: document.getElementById('telefone').value.trim(),
        endereco: document.getElementById('endereco').value.trim(),
        cidade: document.getElementById('cidade').value.trim(),
        uf: document.getElementById('uf').value,
        data_adesao: document.getElementById('dataAdesao').value,
        observacoes: document.getElementById('observacoes').value.trim()
    };

    // Validações
    if (!dados.nome_completo || !dados.cpf || !dados.data_nascimento || !dados.data_adesao) {
        exibirErroPaciente('Preencha todos os campos obrigatórios.');
        return;
    }

    if (!validarCPF(dados.cpf)) {
        exibirErroPaciente('CPF inválido. Verifique o número digitado.');
        return;
    }

    const resultado = await cadastrarPacienteAPI(dados);

    if (resultado.sucesso) {
        exibirSucesso(`Paciente "${dados.nome_completo}" cadastrado com sucesso!`);
        document.getElementById('formAddPaciente').reset();
        document.getElementById('nomeCompleto').focus();
    } else {
        exibirErroPaciente(resultado.erro);
    }
}


// 5 FUNÇÕES DE FEEDBACK
function exibirSucesso(mensagem) {
    const msg = document.getElementById('msgFeedback');
    if (!msg) return;
    msg.className = 'alert alert-success text-center rounded-3';
    msg.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>${mensagem}`;
    msg.classList.remove('d-none');
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => msg.classList.add('d-none'), 5000);
}

function exibirErroPaciente(mensagem) {
    const msg = document.getElementById('msgFeedback');
    if (!msg) return;
    msg.className = 'alert alert-danger text-center rounded-3';
    msg.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-1"></i>${mensagem}`;
    msg.classList.remove('d-none');
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => msg.classList.add('d-none'), 5000);
}