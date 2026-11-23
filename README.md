# Habit Tracker — Rastreador de Hábitos e Rotinas

Aplicação web full-stack desenvolvida para organização de hábitos diários, agrupamento em rotinas personalizadas e acompanhamento visual de consistência semanal.

## Funcionalidades

- **Autenticação e Sessão:** Cadastro e login de usuários com senhas criptografadas e controle de sessão protegido por middleware em todas as rotas privadas.
- **Gestão Completa de Hábitos (CRUD):** Criação, listagem, edição de dias da semana e inativação lógica (`soft delete` via `is_active = 0`), preservando o histórico de check-ins anteriores.
- **Gestão de Rotinas (Relação N:N):** Agrupamento de múltiplos hábitos em blocos de rotina por meio de tabela associativa (`habits_routines`), com suporte a criação, edição e exclusão.
- **Check-in Diário Assíncrono:** Marcação e desmarcação de hábitos do dia em tempo real utilizando Fetch API sem recarregamento de página.
- **Painel de Métricas e Progresso:** Cálculo de desempenho diário e semanal via consultas SQL (`COUNT` e `GROUP BY`), exibido por meio de barras de progresso dinâmicas no Dashboard.

## Tecnologias Utilizadas

- **Back-end:** Node.js, Express
- **Banco de Dados:** SQLite3
- **Front-end & Templates:** EJS, HTML5, CSS3, Bootstrap 5, Bootstrap Icons, JavaScript (Vanilla / Fetch API)
- **Segurança & Sessão:** `express-session`, `bcrypt`

## Arquitetura do Projeto (MVC)

```text
tracker-habitos/
├── controllers/       # Regras de negócio e consultas SQL (auth, dashboard, habito, rotina)
├── database/          # Conexão e inicialização das tabelas no SQLite
├── middlewares/       # Verificação de autenticação e proteção de sessão
├── public/            # Arquivos estáticos (CSS customizado e scripts JS do cliente)
├── routes/            # Definição das rotas da aplicação por entidade
├── views/             # Templates EJS (Dashboard, Hábitos, Rotinas, Login e Partials)
├── index.js           # Ponto de entrada e configuração do servidor Express
└── package.json       # Dependências e metadados do projeto


classDiagram
    class Usuario {
        -int id
        -String nome
        -String email
        -String senha
        +cadastrar() void
        +autenticar() boolean
    }

    class Habito {
        -int id
        -int userId
        -String name
        -String daysOfWeek
        -boolean isActive
        +salvarHabito() void
        +editarHabito() void
        +inativarHabito() void
        +listarHabitos() List~Habito~
    }

    class RegistroCheckin {
        -int id
        -int userId
        -int habitId
        -Date targetDate
        +toggleCheckin() boolean
    }

    class Rotina {
        -int id
        -int userId
        -String name
        +salvarRotina() void
        +editarRotina() void
        +excluirRotina() void
        +listarRotinas() List~Rotina~
    }

    class DashboardProgresso {
        +calcularProgressoDiario() float
        +calcularProgressoSemanal() float
        +renderizarDashboard() void
    }

    Usuario "1" --> "0..*" Habito : possui
    Usuario "1" --> "0..*" Rotina : organiza
    Habito "1" *-- "0..*" RegistroCheckin : registra
    Rotina "0..*" o-- "0..*" Habito : agrupa
    DashboardProgresso ..> Habito : consulta
    DashboardProgresso ..> Rotina : consulta
