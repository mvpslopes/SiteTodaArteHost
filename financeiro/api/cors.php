<?php
// CORS para o front consumir a API (mesmo domínio ou subdomínio)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://gestao.todaarte.com.br', 'https://financeiro.todaarte.com.br', 'https://todaarte.com.br', 'http://localhost:5174', 'http://localhost:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5173'];
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
