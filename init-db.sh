#!/bin/bash
set -e

sleep 30s

SQLCMD_PATH="/opt/mssql-tools/bin/sqlcmd"
if [ ! -f "$SQLCMD_PATH" ]; then
    SQLCMD_PATH="/opt/mssql-tools18/bin/sqlcmd"
fi

echo "Criando banco de dados 'vinhos'..."
$SQLCMD_PATH -S localhost -U sa -P "Str0ngPassword@" -Q "CREATE DATABASE vinhos"

echo "Executando schema.sql..."
$SQLCMD_PATH -S localhost -U sa -P "Str0ngPassword@" -d vinhos -i /schema.sql

echo "Executando seed.sql..."
$SQLCMD_PATH -S localhost -U sa -P "Str0ngPassword@" -d vinhos -i /seed.sql

echo "Configuração do banco de dados concluída com sucesso!" 