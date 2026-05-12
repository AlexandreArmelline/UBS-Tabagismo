// 1 CONFIGURAÇÕES INICIAIS
// 1.1 URL da API de registros
const REGISTROS_API = `${API_URL}/registros`;


// 2 FUNÇÕES DE API
// 2.1 Buscar registros de um paciente
async function buscarRegistrosPorPaciente(idPaciente) {
    try {
        const response = await fetch(`${REGISTROS_API}/paciente/${idPaciente}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Erro ao buscar registros');
        return await response.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

// 2.2 Criar registro clínico
async function criarRegistroAPI(dados) {
    try {
        const response = await fetch(REGISTROS_API, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(dados)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || 'Erro ao salvar');
        return { sucesso: true, data };
    } catch (err) {
        return { sucesso: false, erro: err.message };
    }
}

// 2.3 Buscar dados do dashboard
async function buscarDashboardAPI() {
    try {
        const response = await fetch(`${REGISTROS_API}/dashboard`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Erro ao carregar dashboard');
        return await response.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

// 2.4 Buscar últimos registros
async function buscarUltimosRegistrosAPI(limit = 10) {
    try {
        const response = await fetch(`${REGISTROS_API}/ultimos?limit=${limit}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Erro ao buscar registros');
        return await response.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}