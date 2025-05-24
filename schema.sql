USE vinhos;
GO

DROP TABLE IF EXISTS dbo.detalhe_venda;
DROP TABLE IF EXISTS dbo.venda;
DROP TABLE IF EXISTS dbo.lote;
DROP TABLE IF EXISTS dbo.composicao_vinho_casta;
DROP TABLE IF EXISTS dbo.vinho;
DROP TABLE IF EXISTS dbo.colheita_vinha;
DROP TABLE IF EXISTS dbo.colheita;
DROP TABLE IF EXISTS dbo.vinha_casta;
DROP TABLE IF EXISTS dbo.vinha;
DROP TABLE IF EXISTS dbo.casta;
DROP TABLE IF EXISTS dbo.regiao;
DROP TABLE IF EXISTS dbo.cliente;
DROP TABLE IF EXISTS dbo.utilizador;
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
    updated_at  DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME()
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
    updated_at  DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.vinha (
    id                    UNIQUEIDENTIFIER NOT NULL
                             CONSTRAINT PK_vinha PRIMARY KEY
                             DEFAULT NEWSEQUENTIALID(),
    localizacao           VARCHAR(500)      NOT NULL,
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
    CONSTRAINT PK_vinha_casta PRIMARY KEY(vinhaId, castaId),
    CONSTRAINT FK_vinha_casta_vinha 
      FOREIGN KEY(vinhaId) REFERENCES dbo.vinha(id),
    CONSTRAINT FK_vinha_casta_casta 
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
    updated_at  DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME()
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
    updated_at  DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME()
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
    CONSTRAINT FK_venda_cliente 
      FOREIGN KEY(clienteId) REFERENCES dbo.cliente(id)
);
GO

CREATE TABLE dbo.detalhe_venda (
    id          UNIQUEIDENTIFIER NOT NULL
                   CONSTRAINT PK_detalhe_venda PRIMARY KEY
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
    CONSTRAINT FK_detalhe_venda_venda 
      FOREIGN KEY(vendaId) REFERENCES dbo.venda(id),
    CONSTRAINT FK_detalhe_venda_lote 
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
    updated_at  DATETIME2(3)    NOT NULL DEFAULT SYSUTCDATETIME()
);
GO




-- VIEWS

CREATE OR ALTER VIEW dbo.v_vinho_detalhado AS
WITH VinhoCastas AS (
    SELECT 
        v.id as vinho_id,
        STRING_AGG(c.nome + ' (' + CAST(cvc.percentagem as VARCHAR) + '%)', ', ') 
        WITHIN GROUP (ORDER BY c.nome) as castas
    FROM dbo.vinho v
    LEFT JOIN dbo.composicao_vinho_casta cvc ON v.id = cvc.vinhoId
    LEFT JOIN dbo.casta c ON c.id = cvc.castaId
    GROUP BY v.id
),
VinhaCastas AS (
    SELECT 
        vh.id as vinha_id,
        vh.localizacao,
        STRING_AGG(c.nome, ', ') WITHIN GROUP (ORDER BY c.nome) as castas_vinha
    FROM dbo.vinha vh
    LEFT JOIN dbo.vinha_casta vc ON vh.id = vc.vinhaId
    LEFT JOIN dbo.casta c ON vc.castaId = c.id
    GROUP BY vh.id, vh.localizacao
),
VinhoVinhas AS (
    SELECT DISTINCT
        v.id as vinho_id,
        STRING_AGG(vc.localizacao + ' (' + vc.castas_vinha + ')', ' | ') 
        WITHIN GROUP (ORDER BY vc.localizacao) as vinhas_info
    FROM dbo.vinho v
    LEFT JOIN dbo.lote l ON v.id = l.vinhoId
    LEFT JOIN dbo.colheita_vinha cv ON cv.colheitaId = l.id
    LEFT JOIN VinhaCastas vc ON vc.vinha_id = cv.vinhaId
    GROUP BY v.id
),
VinhoLotes AS (
    SELECT 
        v.id as vinho_id,
        STRING_AGG(
            'Lote ' + CAST(l.ano as VARCHAR) + 
            ' (Garrafas: ' + CAST(l.num_garrafas as VARCHAR) + 
            ', Disponível: ' + CAST(l.quantidade_disponivel as VARCHAR) + 
            ', Validade: ' + CONVERT(VARCHAR, l.validade, 103) + ')',
            ' | '
        ) WITHIN GROUP (ORDER BY l.ano, l.data_engarrafamento) as lotes_info
    FROM dbo.vinho v
    LEFT JOIN dbo.lote l ON v.id = l.vinhoId
    GROUP BY v.id
),
VinhoVendas AS (
    SELECT 
        v.id as vinho_id,
        COUNT(DISTINCT dv.vendaId) as total_vendas
    FROM dbo.vinho v
    LEFT JOIN dbo.lote l ON v.id = l.vinhoId
    LEFT JOIN dbo.detalhe_venda dv ON dv.loteId = l.id
    GROUP BY v.id
)
SELECT 
    v.id,
    v.nome as nome_vinho,
    v.tipo as tipo_vinho,
    v.teor_alcoolico,
    r.nome as regiao,
    vc.castas as composicao_castas,
    vv.vinhas_info as vinhas_e_castas,
    vl.lotes_info as lotes,
    vve.total_vendas,
    v.updated_at as ultima_atualizacao,
    v.deleted_at as data_remocao
FROM dbo.vinho v
LEFT JOIN dbo.regiao r ON v.regiaoId = r.id
LEFT JOIN VinhoCastas vc ON v.id = vc.vinho_id
LEFT JOIN VinhoVinhas vv ON v.id = vv.vinho_id
LEFT JOIN VinhoLotes vl ON v.id = vl.vinho_id
LEFT JOIN VinhoVendas vve ON v.id = vve.vinho_id;
GO
