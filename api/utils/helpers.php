<?php
// api/utils/helpers.php

// Função para retornar JSON padronizado
function jsonResponse($data, $statusCode = 200)
{
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Função para resposta de erro
function jsonError($message, $statusCode = 400)
{
    jsonResponse(['error' => true, 'message' => $message], $statusCode);
}
?>
