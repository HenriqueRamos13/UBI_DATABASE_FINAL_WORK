# Sistema de Gerenciamento de Vinhos

Este é um projeto de teste que implementa um sistema de gerenciamento de vinhos usando Node.js e SQL Server.

## Observação Importante
Este é um projeto de teste/demonstração, por isso as variáveis de ambiente (.env) e senhas estão diretamente no código.

## Pré-requisitos

- Docker
- Docker Compose
- Node.js (versão 14 ou superior)
- npm

## Como Executar

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd database
```

2. Instale as dependências do projeto:
```bash
cd app
npm install
cd ..
```

3. Inicie os containers Docker:
```bash
docker-compose up -d
```

4. Aguarde alguns segundos para que o banco de dados seja inicializado e populado (isso acontece automaticamente)

5. Inicie a aplicação Node.js:
```bash
cd app
npm start
```

## Acessando a Aplicação

- API principal: http://localhost:3000
- Página de teste HTML: http://localhost:3000/hello

## Estrutura do Projeto

- `/app` - Aplicação Node.js
- `schema.sql` - Estrutura do banco de dados
- `seed.sql` - Dados iniciais do banco
- `Dockerfile` - Configuração do container SQL Server
- `init-db.sh` - Script de inicialização do banco
- `compose.yml` - Configuração do Docker Compose

## Banco de Dados

O banco de dados SQL Server é configurado automaticamente com:
- Usuário: sa
- Senha: Str0ngPassword@
- Porta: 1433
- Nome do banco: vinhos 