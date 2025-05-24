USE vinhos;
GO

CREATE OR ALTER FUNCTION dbo.GuidToCreatedAt(@g UNIQUEIDENTIFIER)
RETURNS DATETIME2(3)
AS
BEGIN
    DECLARE @b BINARY(16) = CAST(@g AS BINARY(16));
    DECLARE @time_low    BIGINT = CAST(SUBSTRING(@b, 1, 4) AS BIGINT);
    DECLARE @time_mid    BIGINT = CAST(SUBSTRING(@b, 5, 2) AS BIGINT);
    DECLARE @time_hi_ver BIGINT = CAST(SUBSTRING(@b, 7, 2) AS BIGINT);
    DECLARE @time_hi     BIGINT = @time_hi_ver & 0x0FFF;
    DECLARE @ts60        BIGINT =
         (@time_hi   * POWER(CAST(2 AS BIGINT), 48))
       + (@time_mid * POWER(CAST(2 AS BIGINT), 32))
       + @time_low;
    DECLARE @unix_ms     BIGINT = (@ts60 - 122192928000000000) / 10000;
    RETURN DATEADD(ms, @unix_ms, '1970-01-01');
END;
GO

CREATE TABLE dbo.regiao (
    id          UNIQUEIDENTIFIER NOT NULL
                   CONSTRAINT PK_regiao PRIMARY KEY
                   DEFAULT NEWSEQUENTIALID(),
    nome VARCHAR(255) NOT NULL
      CONSTRAINT CK_regiao_nome
      CHECK (nome IN (
        'Alenquer',
        'Alentejo',
        'Arruda',
        'Bairrada',
        'Beira Interior',
        'Bucelas',
        'Carcavelos',
        'Colares',
        'Dão',
        'Douro',
        'Encostas de Aire',
        'Lagoa',
        'Lagos',
        'Madeira',
        'Madeirense',
        'Óbidos',
        'Palmela',
        'Porto',
        'Portimão',
        'Tejo',
        'Setúbal',
        'Tavira',
        'Távora-Varosa',
        'Torres Vedras',
        'Trás-os-Montes',
        'Vinho Verde'
      )),
    updated_at  DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME(),
);
GO

CREATE TABLE dbo.casta (
    id          UNIQUEIDENTIFIER NOT NULL
                   CONSTRAINT PK_casta PRIMARY KEY
                   DEFAULT NEWSEQUENTIALID(),
    nome        VARCHAR(255)    NOT NULL,
    tipo        VARCHAR(100)    NOT NULL
                   CONSTRAINT CK_casta_tipo 
                     CHECK (tipo IN ('Tinta','Branca')),
    updated_at  DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME(),

);
GO

CREATE TABLE dbo.vinha ( -- VINHEDOS (PODE TER UMA OU VARIAS CASTAS)
    id                    UNIQUEIDENTIFIER NOT NULL
                             CONSTRAINT PK_vinha PRIMARY KEY
                             DEFAULT NEWSEQUENTIALID(),
    localizacao           VARCHAR(500)      NOT NULL,
    area                  FLOAT             NOT NULL
                             CONSTRAINT CK_vinha_area 
                               CHECK (area > 0),
    regiaoId              UNIQUEIDENTIFIER  NOT NULL,
    castaPredominanteId   UNIQUEIDENTIFIER  NOT NULL,
    updated_at            DATETIME2(3)      NOT NULL DEFAULT SYSUTCDATETIME(),
    deleted_at            DATETIME2(3)      NULL,
    CONSTRAINT FK_vinha_regiao 
      FOREIGN KEY(regiaoId) REFERENCES dbo.regiao(id),
    CONSTRAINT FK_vinha_castaPredominante 
      FOREIGN KEY(castaPredominanteId) REFERENCES dbo.casta(id)
);
GO

CREATE TABLE dbo.vinha_casta (
    vinhaId     UNIQUEIDENTIFIER NOT NULL,
    castaId     UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT PK_vinha_castas PRIMARY KEY(vinhaId, castaId),
    CONSTRAINT FK_vinha_castas_vinha 
      FOREIGN KEY(vinhoId) REFERENCES dbo.vinho(id),
    CONSTRAINT FK_vinho_castas_casta 
      FOREIGN KEY(castaId) REFERENCES dbo.casta(id)
);
GO

CREATE TABLE dbo.colheita (
    id          UNIQUEIDENTIFIER NOT NULL
                   CONSTRAINT PK_colheita PRIMARY KEY
                   DEFAULT NEWSEQUENTIALID(),
    ano         INT              NOT NULL
                   CONSTRAINT CK_colheita_ano 
                     CHECK (ano >= 1900 AND ano <= YEAR(GETDATE())),
    quantidade  FLOAT            NOT NULL
                   CONSTRAINT CK_colheita_qt 
                     CHECK (quantidade >= 0),
    qualidade   VARCHAR(50)      NOT NULL
                   CONSTRAINT CK_colheita_qualidade 
                     CHECK (qualidade IN ('Alta','Media','Baixa')),
    updated_at  DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
);
GO

CREATE TABLE dbo.colheita_vinha (
    colheitaId UNIQUEIDENTIFIER NOT NULL,
    vinhaId   UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT PK_colheita_vinha PRIMARY KEY(colheitaId, vinhaId),
    CONSTRAINT FK_colheita_vinha_colheita 
      FOREIGN KEY(colheitaId) REFERENCES dbo.colheita(id),
    CONSTRAINT FK_colheita_vinha_vinha 
      FOREIGN KEY(vinhaId) REFERENCES dbo.vinha(id)
);
GO

CREATE TABLE dbo.vinho (
    id              UNIQUEIDENTIFIER NOT NULL
                       CONSTRAINT PK_vinho PRIMARY KEY
                       DEFAULT NEWSEQUENTIALID(),
    nome            VARCHAR(255)    NOT NULL,
    tipo            VARCHAR(50)     NOT NULL
                       CONSTRAINT CK_vinho_tipo 
                         CHECK (tipo IN ('Tinto','Branco','Rosé','Espumante','Doce','Seco','Meio-Seco','Meio-Doce','Licoroso','Fortificado')),
    teor_alcoolico  FLOAT           NOT NULL
                       CONSTRAINT CK_vinho_teor 
                         CHECK (teor_alcoolico BETWEEN 0 AND 100),
    regiaoId        UNIQUEIDENTIFIER NOT NULL,
    updated_at      DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME(),
    deleted_at      DATETIME2(3)    NULL,
    CONSTRAINT FK_vinho_regiao 
      FOREIGN KEY(regiaoId) REFERENCES dbo.regiao(id)
);
GO

CREATE TABLE dbo.composicao_vinho_casta (
    vinhoId     UNIQUEIDENTIFIER NOT NULL,
    castaId     UNIQUEIDENTIFIER NOT NULL,
    percentagem FLOAT           NOT NULL,
    CONSTRAINT PK_composicao_vinho_casta PRIMARY KEY(vinhoId, castaId),
    CONSTRAINT FK_composicao_vinho_casta_vinho 
      FOREIGN KEY(vinhoId) REFERENCES dbo.vinho(id),
    CONSTRAINT FK_composicao_vinho_casta_casta 
      FOREIGN KEY(castaId) REFERENCES dbo.casta(id)
);
GO

CREATE TABLE dbo.lote (
    id                    UNIQUEIDENTIFIER NOT NULL
                             CONSTRAINT PK_lote PRIMARY KEY
                             DEFAULT NEWSEQUENTIALID(),
    vinhoId               UNIQUEIDENTIFIER NOT NULL,
    ano                   INT             NOT NULL
                             CONSTRAINT CK_lote_ano 
                               CHECK (ano >= 1900 AND ano <= YEAR(GETDATE())),
    custo                 INT             NOT NULL
                             CONSTRAINT CK_lote_custo 
                               CHECK (custo >= 0),
    data_engarrafamento   DATE            NOT NULL,
    num_garrafas          INT             NOT NULL
                             CONSTRAINT CK_lote_ng 
                               CHECK (num_garrafas >= 0),
    validade              DATE            NOT NULL,
    quantidade_disponivel INT           NOT NULL
                             CONSTRAINT CK_lote_disp 
                               CHECK (quantidade_disponivel >= 0),
    updated_at            DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_lote_vinho 
      FOREIGN KEY(vinhoId) REFERENCES dbo.vinho(id)
);
GO

CREATE TABLE dbo.cliente (
    id          UNIQUEIDENTIFIER NOT NULL
                   CONSTRAINT PK_cliente PRIMARY KEY
                   DEFAULT NEWSEQUENTIALID(),
    nome        VARCHAR(255)    NOT NULL,
    tipo        VARCHAR(50)     NOT NULL
                   CONSTRAINT CK_cliente_tipo 
                     CHECK (tipo IN ('Particular','Distribuidor','Restaurante')),
    nif         VARCHAR(50)     NOT NULL,
    email       VARCHAR(255)    NULL,
    telefone    VARCHAR(100)    NULL,
    morada      VARCHAR(500)    NULL,
    updated_at  DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME(),

);
GO

CREATE TABLE dbo.venda (
    id          UNIQUEIDENTIFIER NOT NULL
                   CONSTRAINT PK_venda PRIMARY KEY
                   DEFAULT NEWSEQUENTIALID(),
    clienteId   UNIQUEIDENTIFIER NOT NULL,
    data        DATE            NOT NULL,
    valor_total INT             NOT NULL
                   CONSTRAINT CK_venda_valor 
                     CHECK (valor_total >= 0),
    estado      VARCHAR(50)     NOT NULL
                   CONSTRAINT CK_venda_estado 
                     CHECK (estado IN ('Pendente','Paga','Entregue')),
    tipo        VARCHAR(50)     NOT NULL
                   CONSTRAINT CK_venda_tipo 
                     CHECK (tipo IN ('Nacional','Exportação')),
    updated_at  DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME(),
,
    CONSTRAINT FK_venda_cliente 
      FOREIGN KEY(clienteId) REFERENCES dbo.cliente(id)
);
GO

CREATE TABLE dbo.detalheVenda (
    id          UNIQUEIDENTIFIER NOT NULL
                   CONSTRAINT PK_detalheVenda PRIMARY KEY
                   DEFAULT NEWSEQUENTIALID(),
    vendaId     UNIQUEIDENTIFIER NOT NULL,
    loteId      UNIQUEIDENTIFIER NOT NULL,
    quantidade  INT             NOT NULL
                   CONSTRAINT CK_det_qt 
                     CHECK (quantidade >= 0),
    preco       INT             NOT NULL
                   CONSTRAINT CK_det_preco 
                     CHECK (preco >= 0),
    updated_at  DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME(),
,
    CONSTRAINT FK_detalheVenda_venda 
      FOREIGN KEY(vendaId) REFERENCES dbo.venda(id),
    CONSTRAINT FK_detalheVenda_lote 
      FOREIGN KEY(loteId) REFERENCES dbo.lote(id)
);
GO

CREATE TABLE dbo.utilizador (
    id          UNIQUEIDENTIFIER NOT NULL
                   CONSTRAINT PK_utilizador PRIMARY KEY
                   DEFAULT NEWSEQUENTIALID(),
    nome        VARCHAR(255)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    perfil      VARCHAR(50)     NOT NULL
                   CONSTRAINT CK_utilizador_perfil 
                     CHECK (perfil IN ('admin','gestor','operador')),
    updated_at  DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME(),

);
GO




-- VIEWS