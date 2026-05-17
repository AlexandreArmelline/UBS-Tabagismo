# Sistema Web - Grupo de Tabagismo da UBS Ipiranga

Sistema web desenvolvido para o **Projeto Integrador** do curso de **Bacharelado em Tecnologia da Informação** da **UNIVESP**.

O sistema permite o cadastro e acompanhamento de pacientes do Grupo de Tabagismo da UBS do Ipiranga, substituindo planilhas informais por um banco de dados estruturado.

---

## Funcionalidades

###  Autenticação
- Login com usuário/CPF e senha
- Dois perfis de acesso: **Administrador** e **Operador**
- Senhas criptografadas com bcrypt
- Autenticação via JWT (JSON Web Token)

###  Gestão de Pacientes
- Cadastrar, editar, inativar e reativar pacientes
- Busca por nome ou CPF
- Filtro por status (ativos/inativos)

###  Gestão de Usuários (Admin)
- Cadastrar e excluir profissionais
- Apenas administradores têm acesso

###  Registro Clínico
- Registro de indicadores de tabagismo
- Peso, pressão arterial, cigarros/dia
- Medicamentos utilizados
- Dias sem fumar e recaídas
- Gatilhos, hobbies e ambiente familiar
- Histórico completo por paciente

###  Dashboard
- Total de pacientes
- Taxa de cessação do tabagismo
- Gráfico de status (fumam/não fumam/sem registro)
- Medicamentos mais utilizados
- Média de cigarros/dia
- Últimos registros

###  Segurança e LGPD
- Senhas com hash bcrypt
- Log de todas as operações
- Exclusão lógica (não apaga dados)

---

##  Tecnologias Utilizadas

| Tecnologia | Finalidade |
|------------|------------|
| **Node.js** | Servidor back-end |
| **Express** | Framework web |
| **SQLite3** | Banco de dados |
| **Bootstrap 5** | Framework front-end |
| **JWT** | Autenticação |
| **bcryptjs** | Criptografia de senhas |
| **HTML5/CSS3** | Estrutura e estilização |
| **JavaScript** | Lógica do front-end |

---

##  Estrutura do Projeto
UBS-Tabagismo/
├── frontend/ # Interface do usuário
│ ├── index.html # Tela de Login
│ ├── menu.html # Menu Principal
│ ├── pesquisa.html # Pesquisa de Pacientes
│ ├── add-paciente.html # Cadastro/Edição de Paciente
│ ├── add-usuario.html # Cadastro de Usuário
│ ├── registro-clinico.html # Registro Clínico
│ ├── dashboard.html # Dashboard de Indicadores
│ ├── admin.html # Administração do Sistema
│ ├── css/estilo.css # Estilos personalizados
│ └── js/
│ ├── app.js # Autenticação e navegação
│ ├── paciente.js # CRUD de pacientes
│ ├── usuario.js # CRUD de usuários
│ └── registro.js # Registros clínicos
│
├── backend/ # Servidor e API
│ ├── server.js # Servidor Express
│ ├── database.js # Conexão e modelo SQLite
│ ├── routes/
│ │ ├── auth.js # Rotas de autenticação
│ │ ├── pacientes.js # Rotas de pacientes
│ │ ├── usuarios.js # Rotas de usuários
│ │ └── registros.js # Rotas de registros
│ └── middleware/
│ └── auth.js # Middleware de autenticação
│
├── docs/ # Documentação técnica
│ ├── DER-conceitual.pdf # Modelo Conceitual
│ ├── DER-logico.pdf # Modelo Lógico
│ └── script-sql.sql # Script SQL
│
└── package.json # Dependências do projeto

_____________________________________________________________________________________________________________


O sistema está disponível em:

https://ubs-tabagismo.onrender.com

_____________________________________________________________________________________________________________


 Modelo de Dados
Entidades Principais:
PACIENTE - Dados cadastrais dos pacientes

USUARIO - Profissionais que acessam o sistema

REGISTRO_CLINICO - Indicadores e evolução do tratamento

LOGS - Registro de atividades (LGPD)