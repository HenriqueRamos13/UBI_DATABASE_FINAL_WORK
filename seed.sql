USE vinhos;
GO

-- Limpar dados existentes (se necessário)
DELETE FROM dbo.detalheVenda;
DELETE FROM dbo.venda;
DELETE FROM dbo.precoCliente;
DELETE FROM dbo.lote;
DELETE FROM dbo.composicaoVinho;
DELETE FROM dbo.vinho;
DELETE FROM dbo.colheita;
DELETE FROM dbo.vinha;
DELETE FROM dbo.casta;
DELETE FROM dbo.regiao;
DELETE FROM dbo.cliente;
DELETE FROM dbo.utilizador;
GO

-- Inserir regiões
INSERT INTO dbo.regiao (nome, pais) VALUES 
('Douro', 'Portugal'),
('Alentejo', 'Portugal'),
('Dão', 'Portugal'),
('Bordeaux', 'França'),
('Toscana', 'Itália');
GO

-- Inserir castas
INSERT INTO dbo.casta (nome, tipo, caracteristicas) VALUES 
('Touriga Nacional', 'Tinta', 'Casta nobre portuguesa, aromas intensos'),
('Touriga Franca', 'Tinta', 'Taninos suaves, boa estrutura'),
('Tinta Roriz', 'Tinta', 'Adaptável e versátil'),
('Alvarinho', 'Branca', 'Aromática e mineral'),
('Encruzado', 'Branca', 'Complexa e elegante');
GO

-- Obter IDs para uso nas relações
DECLARE @DouroId UNIQUEIDENTIFIER;
DECLARE @AlentejoId UNIQUEIDENTIFIER;
DECLARE @DaoId UNIQUEIDENTIFIER;
DECLARE @TourigaNacionalId UNIQUEIDENTIFIER;
DECLARE @TourigaFrancaId UNIQUEIDENTIFIER;
DECLARE @TintaRorizId UNIQUEIDENTIFIER;
DECLARE @ArintoId UNIQUEIDENTIFIER;
DECLARE @AlvarinhoId UNIQUEIDENTIFIER;

SELECT @DouroId = id FROM dbo.regiao WHERE nome = 'Douro';
SELECT @AlentejoId = id FROM dbo.regiao WHERE nome = 'Alentejo';
SELECT @DaoId = id FROM dbo.regiao WHERE nome = 'Dão';
SELECT @TourigaNacionalId = id FROM dbo.casta WHERE nome = 'Touriga Nacional';
SELECT @TourigaFrancaId = id FROM dbo.casta WHERE nome = 'Touriga Franca';
SELECT @TintaRorizId = id FROM dbo.casta WHERE nome = 'Tinta Roriz';
SELECT @ArintoId = id FROM dbo.casta WHERE nome = 'Alvarinho';
SELECT @AlvarinhoId = id FROM dbo.casta WHERE nome = 'Encruzado';

-- Inserir vinhas
INSERT INTO dbo.vinha (propriedade_id, area, ano_plantacao, estado) VALUES 
(1, 20.5, 1990, 'Ativa'),
(1, 15.0, 2000, 'Ativa'),
(2, 30.0, 2010, 'Ativa'),
(3, 10.0, 2015, 'Ativa');
GO

-- Obter IDs das vinhas para uso nas colheitas
DECLARE @VinhaDouro1Id UNIQUEIDENTIFIER;
DECLARE @VinhaAlentejoId UNIQUEIDENTIFIER;
DECLARE @VinhaDaoId UNIQUEIDENTIFIER;
DECLARE @VinhaDouro2Id UNIQUEIDENTIFIER;
DECLARE @VinhaAlentejo2Id UNIQUEIDENTIFIER;
DECLARE @TourigaNacionalId UNIQUEIDENTIFIER;
DECLARE @TourigaFrancaId UNIQUEIDENTIFIER;
DECLARE @TintaRorizId UNIQUEIDENTIFIER;
DECLARE @ArintoId UNIQUEIDENTIFIER;
DECLARE @AlvarinhoId UNIQUEIDENTIFIER;

SELECT TOP 1 @VinhaDouro1Id = id FROM dbo.vinha WHERE propriedade_id = 1;
SELECT TOP 1 @VinhaAlentejoId = id FROM dbo.vinha WHERE propriedade_id = 2;
SELECT TOP 1 @VinhaDaoId = id FROM dbo.vinha WHERE propriedade_id = 3;
SELECT TOP 1 @VinhaDouro2Id = id FROM dbo.vinha WHERE propriedade_id = 4;
SELECT TOP 1 @VinhaAlentejo2Id = id FROM dbo.vinha WHERE propriedade_id = 4;
SELECT @TourigaNacionalId = id FROM dbo.casta WHERE nome = 'Touriga Nacional';
SELECT @TourigaFrancaId = id FROM dbo.casta WHERE nome = 'Touriga Franca';
SELECT @TintaRorizId = id FROM dbo.casta WHERE nome = 'Tinta Roriz';
SELECT @ArintoId = id FROM dbo.casta WHERE nome = 'Alvarinho';
SELECT @AlvarinhoId = id FROM dbo.casta WHERE nome = 'Encruzado';

-- Inserir colheitas
INSERT INTO dbo.colheita (ano, quantidade, qualidade, vinhaId, castaId) VALUES 
(2022, 15000, 'Alta', @VinhaDouro1Id, @TourigaNacionalId),
(2022, 12500, 'Alta', @VinhaDouro1Id, @TourigaFrancaId),
(2022, 25000, 'Media', @VinhaAlentejoId, @TintaRorizId),
(2022, 18000, 'Alta', @VinhaDaoId, @TourigaFrancaId),
(2022, 20000, 'Media', @VinhaDouro2Id, @TourigaFrancaId),
(2022, 22000, 'Alta', @VinhaAlentejo2Id, @ArintoId),
(2023, 14500, 'Alta', @VinhaDouro1Id, @TourigaNacionalId),
(2023, 13000, 'Media', @VinhaDouro1Id, @TourigaFrancaId),
(2023, 24000, 'Alta', @VinhaAlentejoId, @TintaRorizId),
(2023, 17500, 'Alta', @VinhaDaoId, @TourigaFrancaId);
GO

-- Inserir vinhos
DECLARE @DouroId UNIQUEIDENTIFIER;
DECLARE @AlentejoId UNIQUEIDENTIFIER;
DECLARE @DaoId UNIQUEIDENTIFIER;

SELECT @DouroId = id FROM dbo.regiao WHERE nome = 'Douro';
SELECT @AlentejoId = id FROM dbo.regiao WHERE nome = 'Alentejo';
SELECT @DaoId = id FROM dbo.regiao WHERE nome = 'Dão';

INSERT INTO dbo.vinho (nome, tipo, teor_alcoolico, regiaoId) VALUES 
('Reserva Douro Tinto', 'Tinto', 14.5, @DouroId),
('Alentejo Premium', 'Tinto', 13.8, @AlentejoId),
('Dão Reserva Especial', 'Tinto', 13.5, @DaoId),
('Douro Branco', 'Branco', 12.5, @DouroId),
('Alentejo Rosé', 'Rosé', 12.0, @AlentejoId),
('Espumante Douro', 'Espumante', 11.5, @DouroId);
GO

-- Inserir composição dos vinhos
DECLARE @VinhoDouroTintoId UNIQUEIDENTIFIER;
DECLARE @VinhoAlentejoTintoId UNIQUEIDENTIFIER;
DECLARE @VinhoDaoTintoId UNIQUEIDENTIFIER;
DECLARE @VinhoDouroBrancoId UNIQUEIDENTIFIER;
DECLARE @VinhoAlentejoRoseId UNIQUEIDENTIFIER;
DECLARE @VinhoDouroEspumanteId UNIQUEIDENTIFIER;
DECLARE @TourigaNacionalId UNIQUEIDENTIFIER;
DECLARE @TourigaFrancaId UNIQUEIDENTIFIER;
DECLARE @TintaRorizId UNIQUEIDENTIFIER;
DECLARE @ArintoId UNIQUEIDENTIFIER;
DECLARE @AlvarinhoId UNIQUEIDENTIFIER;

SELECT TOP 1 @VinhoDouroTintoId = id FROM dbo.vinho WHERE nome = 'Reserva Douro Tinto';
SELECT TOP 1 @VinhoAlentejoTintoId = id FROM dbo.vinho WHERE nome = 'Alentejo Premium';
SELECT TOP 1 @VinhoDaoTintoId = id FROM dbo.vinho WHERE nome = 'Dão Reserva Especial';
SELECT TOP 1 @VinhoDouroBrancoId = id FROM dbo.vinho WHERE nome = 'Douro Branco';
SELECT TOP 1 @VinhoAlentejoRoseId = id FROM dbo.vinho WHERE nome = 'Alentejo Rosé';
SELECT TOP 1 @VinhoDouroEspumanteId = id FROM dbo.vinho WHERE nome = 'Espumante Douro';
SELECT @TourigaNacionalId = id FROM dbo.casta WHERE nome = 'Touriga Nacional';
SELECT @TourigaFrancaId = id FROM dbo.casta WHERE nome = 'Touriga Franca';
SELECT @TintaRorizId = id FROM dbo.casta WHERE nome = 'Tinta Roriz';
SELECT @ArintoId = id FROM dbo.casta WHERE nome = 'Alvarinho';
SELECT @AlvarinhoId = id FROM dbo.casta WHERE nome = 'Encruzado';

INSERT INTO dbo.composicaoVinho (vinhoId, castaId, percentagem) VALUES 
(@VinhoDouroTintoId, @TourigaNacionalId, 60),
(@VinhoDouroTintoId, @TourigaFrancaId, 30),
(@VinhoDouroTintoId, @TintaRorizId, 10),
(@VinhoAlentejoTintoId, @TintaRorizId, 70),
(@VinhoAlentejoTintoId, @TourigaNacionalId, 30),
(@VinhoDaoTintoId, @TourigaFrancaId, 50),
(@VinhoDaoTintoId, @TourigaNacionalId, 50),
(@VinhoDouroBrancoId, @ArintoId, 100),
(@VinhoAlentejoRoseId, @TintaRorizId, 100),
(@VinhoDouroEspumanteId, @AlvarinhoId, 100);
GO

-- Inserir lotes
DECLARE @VinhoDouroTintoId UNIQUEIDENTIFIER;
DECLARE @VinhoAlentejoTintoId UNIQUEIDENTIFIER;
DECLARE @VinhoDaoTintoId UNIQUEIDENTIFIER;
DECLARE @VinhoDouroBrancoId UNIQUEIDENTIFIER;
DECLARE @VinhoAlentejoRoseId UNIQUEIDENTIFIER;
DECLARE @VinhoDouroEspumanteId UNIQUEIDENTIFIER;

SELECT TOP 1 @VinhoDouroTintoId = id FROM dbo.vinho WHERE nome = 'Reserva Douro Tinto';
SELECT TOP 1 @VinhoAlentejoTintoId = id FROM dbo.vinho WHERE nome = 'Alentejo Premium';
SELECT TOP 1 @VinhoDaoTintoId = id FROM dbo.vinho WHERE nome = 'Dão Reserva Especial';
SELECT TOP 1 @VinhoDouroBrancoId = id FROM dbo.vinho WHERE nome = 'Douro Branco';
SELECT TOP 1 @VinhoAlentejoRoseId = id FROM dbo.vinho WHERE nome = 'Alentejo Rosé';
SELECT TOP 1 @VinhoDouroEspumanteId = id FROM dbo.vinho WHERE nome = 'Espumante Douro';

INSERT INTO dbo.lote (vinhoId, ano, quantidade, custo, data_engarrafamento, num_garrafas, validade, quantidade_disponivel) VALUES 
(@VinhoDouroTintoId, 2022, 10000, 80000, '2023-06-15', 13333, '2032-06-15', 10000),
(@VinhoAlentejoTintoId, 2022, 15000, 110000, '2023-07-20', 20000, '2030-07-20', 15000),
(@VinhoDaoTintoId, 2022, 8000, 68000, '2023-08-10', 10666, '2031-08-10', 8000),
(@VinhoDouroBrancoId, 2023, 12000, 84000, '2023-12-05', 16000, '2026-12-05', 12000),
(@VinhoAlentejoRoseId, 2023, 9000, 63000, '2024-01-15', 12000, '2026-01-15', 9000),
(@VinhoDouroEspumanteId, 2023, 7500, 67500, '2024-02-20', 10000, '2027-02-20', 7500);
GO

-- Inserir clientes
INSERT INTO dbo.cliente (nome, tipo, nif, morada, pais, email, telefone) VALUES 
('João Silva', 'Nacional', '123456789', 'Rua Principal 123, Porto', 'Portugal', 'joao@email.com', '351123456789'),
('Wine Imports Ltd', 'Internacional', 'GB123456789', '10 London Street, London', 'Reino Unido', 'contact@wineimports.co.uk', '44123456789'),
('Vinhos Europa', 'Internacional', 'FR123456789', '15 Rue de Vin, Paris', 'França', 'contact@vinhoseuropa.fr', '33123456789');
GO

-- Inserir utilizadores
INSERT INTO dbo.utilizador (nome, email, perfil) VALUES 
('Admin Sistema', 'admin@vinhos.pt', 'admin'),
('Gestor Vendas', 'gestor@vinhos.pt', 'gestor'),
('Operador Armazém', 'operador@vinhos.pt', 'operador');
GO

-- Inserir preços por tipo de cliente
DECLARE @VinhoDouroTintoId UNIQUEIDENTIFIER;
DECLARE @VinhoAlentejoTintoId UNIQUEIDENTIFIER;
DECLARE @VinhoDaoTintoId UNIQUEIDENTIFIER;
DECLARE @VinhoDouroBrancoId UNIQUEIDENTIFIER;
DECLARE @VinhoAlentejoRoseId UNIQUEIDENTIFIER;
DECLARE @VinhoDouroEspumanteId UNIQUEIDENTIFIER;

SELECT TOP 1 @VinhoDouroTintoId = id FROM dbo.vinho WHERE nome = 'Reserva Douro Tinto';
SELECT TOP 1 @VinhoAlentejoTintoId = id FROM dbo.vinho WHERE nome = 'Alentejo Premium';
SELECT TOP 1 @VinhoDaoTintoId = id FROM dbo.vinho WHERE nome = 'Dão Reserva Especial';
SELECT TOP 1 @VinhoDouroBrancoId = id FROM dbo.vinho WHERE nome = 'Douro Branco';
SELECT TOP 1 @VinhoAlentejoRoseId = id FROM dbo.vinho WHERE nome = 'Alentejo Rosé';
SELECT TOP 1 @VinhoDouroEspumanteId = id FROM dbo.vinho WHERE nome = 'Espumante Douro';

-- Preços para Particulares
INSERT INTO dbo.precoCliente (vinhoId, tipo_cliente, preco, data_inicio, data_fim) VALUES 
(@VinhoDouroTintoId, 'Particular', 1500, '2023-01-01', NULL),
(@VinhoAlentejoTintoId, 'Particular', 1200, '2023-01-01', NULL),
(@VinhoDaoTintoId, 'Particular', 1400, '2023-01-01', NULL),
(@VinhoDouroBrancoId, 'Particular', 1100, '2023-01-01', NULL),
(@VinhoAlentejoRoseId, 'Particular', 900, '2023-01-01', NULL),
(@VinhoDouroEspumanteId, 'Particular', 1300, '2023-01-01', NULL);

-- Preços para Distribuidores (com desconto)
INSERT INTO dbo.precoCliente (vinhoId, tipo_cliente, preco, data_inicio, data_fim) VALUES 
(@VinhoDouroTintoId, 'Distribuidor', 1200, '2023-01-01', NULL),
(@VinhoAlentejoTintoId, 'Distribuidor', 960, '2023-01-01', NULL),
(@VinhoDaoTintoId, 'Distribuidor', 1120, '2023-01-01', NULL),
(@VinhoDouroBrancoId, 'Distribuidor', 880, '2023-01-01', NULL),
(@VinhoAlentejoRoseId, 'Distribuidor', 720, '2023-01-01', NULL),
(@VinhoDouroEspumanteId, 'Distribuidor', 1040, '2023-01-01', NULL);

-- Preços para Restaurantes (com desconto menor)
INSERT INTO dbo.precoCliente (vinhoId, tipo_cliente, preco, data_inicio, data_fim) VALUES 
(@VinhoDouroTintoId, 'Restaurante', 1350, '2023-01-01', NULL),
(@VinhoAlentejoTintoId, 'Restaurante', 1080, '2023-01-01', NULL),
(@VinhoDaoTintoId, 'Restaurante', 1260, '2023-01-01', NULL),
(@VinhoDouroBrancoId, 'Restaurante', 990, '2023-01-01', NULL),
(@VinhoAlentejoRoseId, 'Restaurante', 810, '2023-01-01', NULL),
(@VinhoDouroEspumanteId, 'Restaurante', 1170, '2023-01-01', NULL);
GO

-- Inserir vendas
DECLARE @RestauranteId UNIQUEIDENTIFIER;
DECLARE @DistribuidorId UNIQUEIDENTIFIER;
DECLARE @ParticularId UNIQUEIDENTIFIER;
DECLARE @GlobalWinesId UNIQUEIDENTIFIER;

SELECT TOP 1 @RestauranteId = id FROM dbo.cliente WHERE nome = 'João Silva';
SELECT TOP 1 @DistribuidorId = id FROM dbo.cliente WHERE nome = 'Wine Imports Ltd';
SELECT TOP 1 @ParticularId = id FROM dbo.cliente WHERE nome = 'Vinhos Europa';
SELECT TOP 1 @GlobalWinesId = id FROM dbo.cliente WHERE nome = 'Global Wines';

INSERT INTO dbo.venda (clienteId, data, valor_total, estado, tipo) VALUES 
(@RestauranteId, '2023-09-15', 13500, 'Entregue', 'Nacional'),
(@DistribuidorId, '2023-10-20', 48000, 'Entregue', 'Nacional'),
(@ParticularId, '2023-11-05', 4500, 'Entregue', 'Nacional'),
(@GlobalWinesId, '2024-01-15', 52800, 'Pendente', 'Exportação');
GO

-- Inserir detalhes de venda
DECLARE @Venda1Id UNIQUEIDENTIFIER;
DECLARE @Venda2Id UNIQUEIDENTIFIER;
DECLARE @Venda3Id UNIQUEIDENTIFIER;
DECLARE @Venda4Id UNIQUEIDENTIFIER;
DECLARE @Venda5Id UNIQUEIDENTIFIER;
DECLARE @LoteDouroTintoId UNIQUEIDENTIFIER;
DECLARE @LoteAlentejoTintoId UNIQUEIDENTIFIER;
DECLARE @LoteDaoTintoId UNIQUEIDENTIFIER;
DECLARE @LoteDouroBrancoId UNIQUEIDENTIFIER;
DECLARE @LoteAlentejoRoseId UNIQUEIDENTIFIER;
DECLARE @LoteDouroEspumanteId UNIQUEIDENTIFIER;

SELECT TOP 1 @Venda1Id = id FROM dbo.venda ORDER BY data ASC;
SELECT TOP 1 @Venda2Id = id FROM dbo.venda WHERE id <> @Venda1Id ORDER BY data ASC;
SELECT TOP 1 @Venda3Id = id FROM dbo.venda WHERE id NOT IN (@Venda1Id, @Venda2Id) ORDER BY data ASC;
SELECT TOP 1 @Venda4Id = id FROM dbo.venda WHERE id NOT IN (@Venda1Id, @Venda2Id, @Venda3Id) ORDER BY data ASC;
SELECT TOP 1 @Venda5Id = id FROM dbo.venda WHERE id NOT IN (@Venda1Id, @Venda2Id, @Venda3Id, @Venda4Id) ORDER BY data ASC;

SELECT TOP 1 @LoteDouroTintoId = l.id FROM dbo.lote l INNER JOIN dbo.vinho v ON l.vinhoId = v.id WHERE v.nome = 'Reserva Douro Tinto';
SELECT TOP 1 @LoteAlentejoTintoId = l.id FROM dbo.lote l INNER JOIN dbo.vinho v ON l.vinhoId = v.id WHERE v.nome = 'Alentejo Premium';
SELECT TOP 1 @LoteDaoTintoId = l.id FROM dbo.lote l INNER JOIN dbo.vinho v ON l.vinhoId = v.id WHERE v.nome = 'Dão Reserva Especial';
SELECT TOP 1 @LoteDouroBrancoId = l.id FROM dbo.lote l INNER JOIN dbo.vinho v ON l.vinhoId = v.id WHERE v.nome = 'Douro Branco';
SELECT TOP 1 @LoteAlentejoRoseId = l.id FROM dbo.lote l INNER JOIN dbo.vinho v ON l.vinhoId = v.id WHERE v.nome = 'Alentejo Rosé';
SELECT TOP 1 @LoteDouroEspumanteId = l.id FROM dbo.lote l INNER JOIN dbo.vinho v ON l.vinhoId = v.id WHERE v.nome = 'Espumante Douro';

INSERT INTO dbo.detalheVenda (vendaId, loteId, quantidade, preco, desconto) VALUES 
(@Venda1Id, @LoteDouroTintoId, 10, 1350, 0),
(@Venda2Id, @LoteAlentejoTintoId, 50, 960, 0),
(@Venda3Id, @LoteDouroBrancoId, 3, 1100, 0),
(@Venda3Id, @LoteDouroEspumanteId, 1, 1300, 10),
(@Venda4Id, @LoteDaoTintoId, 15, 1260, 5),
(@Venda5Id, @LoteAlentejoTintoId, 30, 960, 0),
(@Venda5Id, @LoteDouroBrancoId, 20, 880, 0),
(@Venda5Id, @LoteAlentejoRoseId, 10, 720, 0);
GO

-- Atualizar a quantidade disponível nos lotes após as vendas
UPDATE l
SET quantidade_disponivel = l.quantidade - ISNULL((
    SELECT SUM(dv.quantidade)
    FROM dbo.detalheVenda dv
    WHERE dv.loteId = l.id
), 0)
FROM dbo.lote l;
GO
