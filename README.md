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