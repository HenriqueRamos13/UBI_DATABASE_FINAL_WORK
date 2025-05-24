USE vinhos;
GO

-- Limpar dados existentes
DELETE FROM dbo.detalhe_venda;
DELETE FROM dbo.venda;
DELETE FROM dbo.lote;
DELETE FROM dbo.composicao_vinho_casta;
DELETE FROM dbo.vinho;
DELETE FROM dbo.colheita_vinha;
DELETE FROM dbo.colheita;
DELETE FROM dbo.vinha_casta;
DELETE FROM dbo.vinha;
DELETE FROM dbo.casta;
DELETE FROM dbo.regiao;
DELETE FROM dbo.cliente;
DELETE FROM dbo.utilizador;
GO

PRINT 'Iniciando inserções...';
GO

-- Inserir regiões
INSERT INTO dbo.regiao (nome) VALUES 
('Douro'),
('Alentejo'),
('Dão'),
('Bairrada'),
('Vinho Verde'),
('Setúbal'),
('Palmela'),
('Tejo'),
('Trás-os-Montes'),
('Beira Interior');

PRINT 'Regiões inseridas';
GO

-- Inserir castas
INSERT INTO dbo.casta (nome, tipo) VALUES 
('Touriga Nacional', 'Tinta'),
('Touriga Franca', 'Tinta'),
('Tinta Roriz', 'Tinta'),
('Tinta Barroca', 'Tinta'),
('Tinto Cão', 'Tinta'),
('Alvarinho', 'Branca'),
('Arinto', 'Branca'),
('Encruzado', 'Branca'),
('Bical', 'Branca'),
('Fernão Pires', 'Branca');

PRINT 'Castas inseridas';
GO

-- Inserir colheitas
INSERT INTO dbo.colheita (ano, quantidade, qualidade) VALUES 
(2022, 15000, 'Alta'),
(2022, 12500, 'Alta'),
(2022, 25000, 'Media'),
(2022, 18000, 'Alta'),
(2022, 20000, 'Media'),
(2022, 22000, 'Alta'),
(2023, 14500, 'Alta'),
(2023, 13000, 'Media'),
(2023, 24000, 'Alta'),
(2023, 17500, 'Alta');

PRINT 'Colheitas inseridas';
GO

-- Inserir dados relacionados em um único bloco de transação
BEGIN TRANSACTION;

BEGIN TRY
    -- Declarar e obter IDs das regiões
    DECLARE @DouroId UNIQUEIDENTIFIER = (SELECT id FROM dbo.regiao WHERE nome = 'Douro');
    DECLARE @AlentejoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.regiao WHERE nome = 'Alentejo');
    DECLARE @DaoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.regiao WHERE nome = 'Dão');
    DECLARE @BairradaId UNIQUEIDENTIFIER = (SELECT id FROM dbo.regiao WHERE nome = 'Bairrada');
    DECLARE @VinhoVerdeId UNIQUEIDENTIFIER = (SELECT id FROM dbo.regiao WHERE nome = 'Vinho Verde');
    DECLARE @SetubalId UNIQUEIDENTIFIER = (SELECT id FROM dbo.regiao WHERE nome = 'Setúbal');
    DECLARE @PalmelaId UNIQUEIDENTIFIER = (SELECT id FROM dbo.regiao WHERE nome = 'Palmela');
    DECLARE @TejoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.regiao WHERE nome = 'Tejo');
    DECLARE @TrasOsMontesId UNIQUEIDENTIFIER = (SELECT id FROM dbo.regiao WHERE nome = 'Trás-os-Montes');
    DECLARE @BeiraInteriorId UNIQUEIDENTIFIER = (SELECT id FROM dbo.regiao WHERE nome = 'Beira Interior');

    -- Declarar e obter IDs das castas
    DECLARE @TourigaNacionalId UNIQUEIDENTIFIER = (SELECT id FROM dbo.casta WHERE nome = 'Touriga Nacional');
    DECLARE @TourigaFrancaId UNIQUEIDENTIFIER = (SELECT id FROM dbo.casta WHERE nome = 'Touriga Franca');
    DECLARE @TintaRorizId UNIQUEIDENTIFIER = (SELECT id FROM dbo.casta WHERE nome = 'Tinta Roriz');
    DECLARE @TintaBarrocaId UNIQUEIDENTIFIER = (SELECT id FROM dbo.casta WHERE nome = 'Tinta Barroca');
    DECLARE @TintoCaoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.casta WHERE nome = 'Tinto Cão');
    DECLARE @AlvarinhoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.casta WHERE nome = 'Alvarinho');
    DECLARE @ArintoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.casta WHERE nome = 'Arinto');
    DECLARE @EncruzadoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.casta WHERE nome = 'Encruzado');
    DECLARE @BicalId UNIQUEIDENTIFIER = (SELECT id FROM dbo.casta WHERE nome = 'Bical');
    DECLARE @FernaoPiresId UNIQUEIDENTIFIER = (SELECT id FROM dbo.casta WHERE nome = 'Fernão Pires');

    -- Inserir vinhos
    INSERT INTO dbo.vinho (nome, tipo, teor_alcoolico, regiaoId) VALUES 
    ('Reserva Douro Tinto', 'Tinto', 14.5, @DouroId),
    ('Alentejo Premium', 'Tinto', 13.8, @AlentejoId),
    ('Dão Reserva Especial', 'Tinto', 13.5, @DaoId),
    ('Bairrada Branco', 'Branco', 12.5, @BairradaId),
    ('Vinho Verde Alvarinho', 'Branco', 12.0, @VinhoVerdeId),
    ('Setúbal Moscatel', 'Doce', 17.0, @SetubalId),
    ('Palmela Tinto', 'Tinto', 13.0, @PalmelaId),
    ('Tejo Branco', 'Branco', 12.5, @TejoId),
    ('Trás-os-Montes Reserva', 'Tinto', 14.0, @TrasOsMontesId),
    ('Beira Interior Branco', 'Branco', 12.8, @BeiraInteriorId);

    PRINT 'Vinhos inseridos';

    -- Inserir vinhas
    INSERT INTO dbo.vinha (localizacao, regiaoId, castaPredominanteId) VALUES 
    ('Quinta do Crasto', @DouroId, @TourigaNacionalId),
    ('Herdade do Esporão', @AlentejoId, @TintaRorizId),
    ('Quinta dos Carvalhais', @DaoId, @TourigaNacionalId),
    ('Quinta da Bairrada', @BairradaId, @BicalId),
    ('Quinta do Vinho Verde', @VinhoVerdeId, @AlvarinhoId),
    ('Quinta do Setúbal', @SetubalId, @ArintoId),
    ('Quinta de Palmela', @PalmelaId, @TintaRorizId),
    ('Quinta do Tejo', @TejoId, @FernaoPiresId),
    ('Quinta de Trás-os-Montes', @TrasOsMontesId, @TourigaNacionalId),
    ('Quinta da Beira', @BeiraInteriorId, @EncruzadoId);

    PRINT 'Vinhas inseridas';

    -- Obter IDs das vinhas inseridas
    DECLARE @VinhaDouroId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.vinha WHERE localizacao = 'Quinta do Crasto');
    DECLARE @VinhaAlentejoId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.vinha WHERE localizacao = 'Herdade do Esporão');
    DECLARE @VinhaDaoId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.vinha WHERE localizacao = 'Quinta dos Carvalhais');
    DECLARE @VinhaBairradaId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.vinha WHERE localizacao = 'Quinta da Bairrada');
    DECLARE @VinhaVinhoVerdeId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.vinha WHERE localizacao = 'Quinta do Vinho Verde');
    DECLARE @VinhaSetubalId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.vinha WHERE localizacao = 'Quinta do Setúbal');
    DECLARE @VinhaPalmelaId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.vinha WHERE localizacao = 'Quinta de Palmela');
    DECLARE @VinhaTejoId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.vinha WHERE localizacao = 'Quinta do Tejo');
    DECLARE @VinhaTrasOsMontesId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.vinha WHERE localizacao = 'Quinta de Trás-os-Montes');
    DECLARE @VinhaBeiraId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.vinha WHERE localizacao = 'Quinta da Beira');

    -- Debug: Verificar se os IDs das vinhas foram obtidos
    IF @VinhaDouroId IS NULL PRINT 'ERRO: VinhaDouroId é NULL';
    IF @VinhaAlentejoId IS NULL PRINT 'ERRO: VinhaAlentejoId é NULL';
    IF @VinhaDaoId IS NULL PRINT 'ERRO: VinhaDaoId é NULL';

    -- Inserir relações vinha_casta
    PRINT 'Iniciando inserção de vinha_casta...';

    INSERT INTO dbo.vinha_casta (vinhaId, castaId) VALUES
    (@VinhaDouroId, @TourigaNacionalId),
    (@VinhaDouroId, @TourigaFrancaId),
    (@VinhaDouroId, @TintaRorizId),
    (@VinhaAlentejoId, @TintaRorizId),
    (@VinhaAlentejoId, @TourigaNacionalId),
    (@VinhaDaoId, @TourigaNacionalId),
    (@VinhaDaoId, @TintaRorizId),
    (@VinhaBairradaId, @BicalId),
    (@VinhaVinhoVerdeId, @AlvarinhoId),
    (@VinhaSetubalId, @ArintoId),
    (@VinhaPalmelaId, @TintaRorizId),
    (@VinhaTejoId, @FernaoPiresId),
    (@VinhaTrasOsMontesId, @TourigaNacionalId),
    (@VinhaTrasOsMontesId, @TintaRorizId),
    (@VinhaBeiraId, @EncruzadoId);

    PRINT 'Relações vinha_casta inseridas';

    -- Verificar inserções
    SELECT 'Vinha-Casta' as Tabela, COUNT(*) as Total FROM dbo.vinha_casta;

    -- Obter IDs dos vinhos inseridos
    DECLARE @VinhoDouroTintoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.vinho WHERE nome = 'Reserva Douro Tinto');
    DECLARE @VinhoAlentejoTintoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.vinho WHERE nome = 'Alentejo Premium');
    DECLARE @VinhoDaoTintoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.vinho WHERE nome = 'Dão Reserva Especial');
    DECLARE @VinhoBairradaBrancoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.vinho WHERE nome = 'Bairrada Branco');
    DECLARE @VinhoVerdeAlvarinhoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.vinho WHERE nome = 'Vinho Verde Alvarinho');
    DECLARE @VinhoSetubalMoscatelId UNIQUEIDENTIFIER = (SELECT id FROM dbo.vinho WHERE nome = 'Setúbal Moscatel');
    DECLARE @VinhoPalmelaTintoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.vinho WHERE nome = 'Palmela Tinto');
    DECLARE @VinhoTejoBrancoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.vinho WHERE nome = 'Tejo Branco');
    DECLARE @VinhoTrasOsMontesReservaId UNIQUEIDENTIFIER = (SELECT id FROM dbo.vinho WHERE nome = 'Trás-os-Montes Reserva');
    DECLARE @VinhoBeiraInteriorBrancoId UNIQUEIDENTIFIER = (SELECT id FROM dbo.vinho WHERE nome = 'Beira Interior Branco');

    -- Inserir composição dos vinhos
    INSERT INTO dbo.composicao_vinho_casta (vinhoId, castaId, percentagem) VALUES 
    (@VinhoDouroTintoId, @TourigaNacionalId, 60),
    (@VinhoDouroTintoId, @TourigaFrancaId, 30),
    (@VinhoDouroTintoId, @TintaRorizId, 10),
    (@VinhoAlentejoTintoId, @TintaRorizId, 70),
    (@VinhoAlentejoTintoId, @TourigaNacionalId, 30),
    (@VinhoDaoTintoId, @TourigaNacionalId, 50),
    (@VinhoDaoTintoId, @TintaRorizId, 50),
    (@VinhoBairradaBrancoId, @BicalId, 100),
    (@VinhoVerdeAlvarinhoId, @AlvarinhoId, 100),
    (@VinhoSetubalMoscatelId, @ArintoId, 100),
    (@VinhoPalmelaTintoId, @TintaRorizId, 100),
    (@VinhoTejoBrancoId, @FernaoPiresId, 100),
    (@VinhoTrasOsMontesReservaId, @TourigaNacionalId, 100),
    (@VinhoBeiraInteriorBrancoId, @EncruzadoId, 100);

    PRINT 'Composição dos vinhos inserida';

    -- Inserir lotes
    INSERT INTO dbo.lote (vinhoId, ano, custo, data_engarrafamento, num_garrafas, validade, quantidade_disponivel) VALUES 
    (@VinhoDouroTintoId, 2022, 80000, '2023-06-15', 13333, '2032-06-15', 10000),
    (@VinhoAlentejoTintoId, 2022, 110000, '2023-07-20', 20000, '2030-07-20', 15000),
    (@VinhoDaoTintoId, 2022, 68000, '2023-08-10', 10666, '2031-08-10', 8000),
    (@VinhoBairradaBrancoId, 2023, 84000, '2023-12-05', 16000, '2026-12-05', 12000),
    (@VinhoVerdeAlvarinhoId, 2023, 63000, '2024-01-15', 12000, '2026-01-15', 9000),
    (@VinhoSetubalMoscatelId, 2023, 67500, '2024-02-20', 10000, '2027-02-20', 7500),
    (@VinhoPalmelaTintoId, 2023, 72000, '2024-03-15', 15000, '2028-03-15', 11000),
    (@VinhoTejoBrancoId, 2023, 78000, '2024-04-10', 18000, '2027-04-10', 13000),
    (@VinhoTrasOsMontesReservaId, 2023, 85000, '2024-05-20', 14000, '2029-05-20', 10000),
    (@VinhoBeiraInteriorBrancoId, 2023, 69000, '2024-06-15', 16000, '2028-06-15', 12000);

    PRINT 'Lotes inseridos';

    COMMIT TRANSACTION;
    PRINT 'Todas as inserções foram concluídas com sucesso';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Erro durante as inserções. Todas as alterações foram revertidas.';
    PRINT ERROR_MESSAGE();
    THROW;
END CATCH;
GO

-- Verificar inserções
SELECT 'Regiões' as Tabela, COUNT(*) as Total FROM dbo.regiao;
SELECT 'Castas' as Tabela, COUNT(*) as Total FROM dbo.casta;
SELECT 'Colheitas' as Tabela, COUNT(*) as Total FROM dbo.colheita;
SELECT 'Vinhos' as Tabela, COUNT(*) as Total FROM dbo.vinho;
SELECT 'Vinhas' as Tabela, COUNT(*) as Total FROM dbo.vinha;
SELECT 'Composição Vinhos' as Tabela, COUNT(*) as Total FROM dbo.composicao_vinho_casta;
SELECT 'Lotes' as Tabela, COUNT(*) as Total FROM dbo.lote;
GO
