# Sistema de Gestão de Vinhos

Sistema completo para gestão de vinhos, incluindo produção, estoque e vendas.

## Observação Importante
Este é um projeto de demonstração, portanto as credenciais e configurações estão diretamente no código por simplicidade. Em um ambiente de produção, essas informações sensíveis deveriam estar em arquivos `.env` e nunca serem commitadas no repositório.

## Funcionalidades

### 1. Gestão de Produção
- Cadastro e gestão de propriedades e vinhas
- Registro de castas plantadas
- Controle de colheitas
- Acompanhamento da produção

### 2. Gestão de Estoque
- Controle de entrada e saída de produtos
- Localização em armazém
- Gestão de inventário

### 3. Gestão de Vendas
- Registro de vendas
- Cadastro de clientes
- Controle de exportações
- Relatórios de vendas

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

3. Inicie o banco de dados SQL Server com Docker:
```bash
docker-compose up -d
```

4. Aguarde alguns segundos para que o banco de dados seja inicializado e populado (isso acontece automaticamente)

5. Inicie a aplicação Node.js:
```bash
cd app
npm start
```

6. Acesse a aplicação:
- Interface principal: http://localhost:3000

## Banco de Dados

O banco de dados SQL Server é configurado automaticamente com:
- Usuário: sa
- Senha: Str0ngPassword@
- Porta: 1433
- Nome do banco: vinhos

## Desenvolvimento

Para desenvolver novas funcionalidades:

1. O banco de dados já está configurado com triggers e views necessários
2. As rotas estão organizadas por módulo em `app/src/routes/`
3. A interface utiliza Tailwind CSS via CDN para estilização
4. Todas as operações de banco são centralizadas em `app/src/db/`

## Suporte

Em caso de problemas:
1. Verifique se o Docker está rodando
2. Confirme se as portas 1433 e 3000 estão livres
3. Verifique os logs do container do SQL Server
4. Confira os logs da aplicação Node.js 