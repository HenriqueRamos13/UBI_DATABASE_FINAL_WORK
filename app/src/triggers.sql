USE vinhos;
GO

-- Trigger para controle automático de stock quando há vendas
-- Este trigger atualiza automaticamente a quantidade disponível do lote
-- quando um detalhe de venda é inserido, garantindo consistência dos dados

CREATE OR ALTER TRIGGER tr_controle_stock_venda
ON dbo.detalhe_venda
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Declarar variáveis para controle
    DECLARE @loteId UNIQUEIDENTIFIER;
    DECLARE @quantidadeVendida INT;
    DECLARE @quantidadeDisponivel INT;
    DECLARE @totalGarrafas INT;
    
    -- Cursor para processar múltiplas inserções
    DECLARE venda_cursor CURSOR FOR
    SELECT loteId, quantidade
    FROM inserted;
    
    OPEN venda_cursor;
    FETCH NEXT FROM venda_cursor INTO @loteId, @quantidadeVendida;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Verificar quantidade disponível atual
        SELECT @quantidadeDisponivel = quantidade_disponivel,
               @totalGarrafas = num_garrafas
        FROM dbo.lote
        WHERE id = @loteId;
        
        -- Validar se há stock suficiente
        IF @quantidadeDisponivel < @quantidadeVendida
        BEGIN
            RAISERROR('Stock insuficiente. Disponível: %d, Solicitado: %d', 16, 1, 
                     @quantidadeDisponivel, @quantidadeVendida);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Validar se quantidade não fica negativa
        IF (@quantidadeDisponivel - @quantidadeVendida) < 0
        BEGIN
            RAISERROR('Operação resultaria em stock negativo', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Atualizar quantidade disponível
        UPDATE dbo.lote
        SET quantidade_disponivel = quantidade_disponivel - @quantidadeVendida,
            updated_at = SYSUTCDATETIME()
        WHERE id = @loteId;
        
        -- Log da operação (opcional - para auditoria)
        PRINT 'Stock atualizado para lote ' + CAST(@loteId AS VARCHAR(36)) + 
              '. Quantidade vendida: ' + CAST(@quantidadeVendida AS VARCHAR(10)) + 
              '. Nova quantidade disponível: ' + CAST((@quantidadeDisponivel - @quantidadeVendida) AS VARCHAR(10));
        
        FETCH NEXT FROM venda_cursor INTO @loteId, @quantidadeVendida;
    END
    
    CLOSE venda_cursor;
    DEALLOCATE venda_cursor;
END;
GO

-- Comentários sobre o trigger:
-- 1. Executa AFTER INSERT para garantir que o detalhe da venda foi inserido com sucesso
-- 2. Usa cursor para suportar inserções múltiplas (bulk inserts)
-- 3. Valida stock disponível antes de atualizar
-- 4. Previne stock negativo
-- 5. Atualiza o campo updated_at para auditoria
-- 6. Usa ROLLBACK em caso de erro para manter consistência
-- 7. Fornece mensagens de erro claras
-- 8. Inclui logging para debugging/auditoria

-- Teste do trigger (opcional - remover em produção):
-- SELECT 'Trigger tr_controle_stock_venda criado com sucesso' AS Status;
