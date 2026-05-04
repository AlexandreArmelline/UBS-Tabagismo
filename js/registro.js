// 1 CONFIGURAÇÕES INICIAIS
// 1.1 Chave do localStorage para registros clínicos
const CHAVE_REGISTROS = 'registros';


// 2 FUNÇÕES DE CONSULTA
// 2.1 Buscar todos os registros de um paciente
function buscarRegistrosPorPaciente(idPaciente) {
    const registros = JSON.parse(localStorage.getItem(CHAVE_REGISTROS)) || [];
    return registros
        .filter(r => r.id_paciente === idPaciente)
        .sort((a, b) => new Date(b.dataAtendimento) - new Date(a.dataAtendimento));
}

// 2.2 Buscar último registro de um paciente
function buscarUltimoRegistro(idPaciente) {
    const registros = buscarRegistrosPorPaciente(idPaciente);
    return registros.length > 0 ? registros[0] : null;
}

// 2.3 Buscar registro por ID
function buscarRegistroPorId(idRegistro) {
    const registros = JSON.parse(localStorage.getItem(CHAVE_REGISTROS)) || [];
    return registros.find(r => r.id === idRegistro) || null;
}


// 3 FUNÇÕES DE CÁLCULO DE INDICADORES
// 3.1 Calcular taxa de sucesso (parou de fumar)
function calcularTaxaSucesso(idPaciente) {
    const registros = buscarRegistrosPorPaciente(idPaciente);
    if (registros.length === 0) return 0;
    
    const registrosSemFumar = registros.filter(r => r.fumaAtualmente === 'nao').length;
    return Math.round((registrosSemFumar / registros.length) * 100);
}

// 3.2 Calcular evolução do peso
function calcularEvolucaoPeso(idPaciente) {
    const registros = buscarRegistrosPorPaciente(idPaciente);
    if (registros.length < 2) return null;
    
    const primeiro = registros[registros.length - 1];
    const ultimo = registros[0];
    
    if (!primeiro.peso || !ultimo.peso) return null;
    
    return {
        inicial: parseFloat(primeiro.peso),
        atual: parseFloat(ultimo.peso),
        diferenca: parseFloat((parseFloat(ultimo.peso) - parseFloat(primeiro.peso)).toFixed(1))
    };
}

// 3.3 Calcular total de recaídas
function calcularTotalRecaidas(idPaciente) {
    const registros = buscarRegistrosPorPaciente(idPaciente);
    return registros.reduce((total, r) => total + (parseInt(r.recaidas) || 0), 0);
}

// 3.4 Calcular maior período sem fumar
function calcularMaiorPeriodoSemFumar(idPaciente) {
    const registros = buscarRegistrosPorPaciente(idPaciente);
    if (registros.length === 0) return 0;
    
    return Math.max(...registros.map(r => parseInt(r.diasSemFumar) || 0));
}


// 4 FUNÇÕES DE MANIPULAÇÃO
// 4.1 Excluir registro
function excluirRegistro(idRegistro) {
    if (!confirm('Deseja realmente excluir este registro? Esta ação não pode ser desfeita.')) {
        return false;
    }
    
    let registros = JSON.parse(localStorage.getItem(CHAVE_REGISTROS)) || [];
    registros = registros.filter(r => r.id !== idRegistro);
    localStorage.setItem(CHAVE_REGISTROS, JSON.stringify(registros));
    
    return true;
}

// 4.2 Obter próximo ID
function obterProximoIdRegistro() {
    const registros = JSON.parse(localStorage.getItem(CHAVE_REGISTROS)) || [];
    if (registros.length === 0) return 1;
    return Math.max(...registros.map(r => r.id)) + 1;
}