<?php
// Simple handler para formulario de contacto

// Forzar UTF-8
mb_internal_encoding('UTF-8');

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Método no permitido';
    exit;
}

// Honeypot (bots)
$honeypot = isset($_POST['_honey']) ? trim((string)$_POST['_honey']) : '';
if ($honeypot !== '') {
    // Fingir éxito para bots
    $next = isset($_POST['_next']) ? $_POST['_next'] : 'index.html#contacto';
    // Insertar query antes del hash (#)
    $parts = explode('#', $next, 2);
    $base = $parts[0];
    $hash = isset($parts[1]) ? '#' . $parts[1] : '';
    $sep = (strpos($base, '?') === false) ? '?' : '&';
    header('Location: ' . $base . $sep . 'contact_status=ok' . $hash);
    exit;
}

// Campos
$tipo = isset($_POST['tipo']) ? trim((string)$_POST['tipo']) : '';
$presupuesto = isset($_POST['presupuesto']) ? trim((string)$_POST['presupuesto']) : '';
$nombre = isset($_POST['nombre']) ? trim((string)$_POST['nombre']) : '';
$email = isset($_POST['email']) ? trim((string)$_POST['email']) : '';
$empresa = isset($_POST['empresa']) ? trim((string)$_POST['empresa']) : '';
$mensaje = isset($_POST['mensaje']) ? trim((string)$_POST['mensaje']) : '';
$next = isset($_POST['_next']) ? (string)$_POST['_next'] : 'index.html#contacto';

// Validaciones
$errors = [];
if ($tipo === '') $errors[] = 'tipo';
if ($presupuesto === '') $errors[] = 'presupuesto';
if ($nombre === '') $errors[] = 'nombre';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($mensaje === '') $errors[] = 'mensaje';

if (!empty($errors)) {
    $qs = http_build_query([
        'contact_status' => 'error',
        'fields' => implode(',', $errors)
    ]);
    // Insertar query antes del hash (#)
    $parts = explode('#', $next, 2);
    $base = $parts[0];
    $hash = isset($parts[1]) ? '#' . $parts[1] : '';
    $sep = (strpos($base, '?') === false) ? '?' : '&';
    header('Location: ' . $base . $sep . $qs . $hash);
    exit;
}

// Email de destino
$to = 'contacto@dangellabs.com';

// Asunto
$subject = 'Nuevo contacto desde dangellabs.com';

// Construir cuerpo
$lines = [
    'Nuevo mensaje de contacto:',
    '----------------------------------------',
    'Tipo de proyecto: ' . $tipo,
    'Presupuesto: ' . $presupuesto,
    'Nombre: ' . $nombre,
    'Email: ' . $email,
    'Empresa: ' . ($empresa !== '' ? $empresa : '-'),
    'Mensaje:',
    $mensaje,
    '----------------------------------------',
    'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'desconocida'),
    'Agente: ' . ($_SERVER['HTTP_USER_AGENT'] ?? 'desconocido'),
];
$body = implode("\r\n", $lines);

// Headers
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: Dangel Labs <contacto@dangellabs.com>';
$headers[] = 'Reply-To: ' . $nombre . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

// Enviar
$sent = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));

// Redirigir con estado
if ($sent) {
    $qs = http_build_query(['contact_status' => 'ok']);
} else {
    $qs = http_build_query(['contact_status' => 'error', 'reason' => 'send_failed']);
}

// Insertar query antes del hash (#)
$parts = explode('#', $next, 2);
$base = $parts[0];
$hash = isset($parts[1]) ? '#' . $parts[1] : '';
$sep = (strpos($base, '?') === false) ? '?' : '&';
header('Location: ' . $base . $sep . $qs . $hash);
exit;


