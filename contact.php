<?php
// Handler para formulario de contacto — validación robusta y anti-spam

mb_internal_encoding('UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Método no permitido';
    exit;
}

// ——— Anti-bots: Honeypots ———
$honey = isset($_POST['_honey']) ? trim((string)$_POST['_honey']) : '';
$website = isset($_POST['website']) ? trim((string)$_POST['website']) : '';
if ($honey !== '' || $website !== '') {
    $next = isset($_POST['_next']) ? (string)$_POST['_next'] : 'index.html#contacto';
    $parts = explode('#', $next, 2);
    $base = $parts[0];
    $hash = isset($parts[1]) ? '#' . $parts[1] : '';
    $sep = (strpos($base, '?') === false) ? '?' : '&';
    header('Location: ' . $base . $sep . 'contact_status=ok' . $hash);
    exit;
}

// ——— Anti-bots: Tiempo mínimo en formulario (segundos) ———
$ts = isset($_POST['_ts']) ? (int)$_POST['_ts'] : 0;
if ($ts > 0 && (time() - $ts) < 3) {
    $next = isset($_POST['_next']) ? (string)$_POST['_next'] : 'index.html#contacto';
    $parts = explode('#', $next, 2);
    $base = $parts[0];
    $hash = isset($parts[1]) ? '#' . $parts[1] : '';
    $sep = (strpos($base, '?') === false) ? '?' : '&';
    header('Location: ' . $base . $sep . 'contact_status=ok' . $hash);
    exit;
}

// ——— Campos ———
$interes = isset($_POST['interes']) ? trim((string)$_POST['interes']) : '';
$nombre = isset($_POST['nombre']) ? trim((string)$_POST['nombre']) : '';
$email = isset($_POST['email']) ? trim((string)$_POST['email']) : '';
$celular = isset($_POST['celular']) ? trim((string)$_POST['celular']) : '';
$empresa = isset($_POST['empresa']) ? trim((string)$_POST['empresa']) : '';
$mensaje = isset($_POST['mensaje']) ? trim((string)$_POST['mensaje']) : '';
$next = isset($_POST['_next']) ? (string)$_POST['_next'] : 'index.html#contacto';

// ——— Validaciones ———
$errors = [];

if ($interes === '') {
    $errors[] = 'interes';
}
if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 120) {
    $errors[] = 'nombre';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}
$celularDigits = preg_replace('/\D/', '', $celular);
if (strlen($celularDigits) < 9 || strlen($celularDigits) > 15) {
    $errors[] = 'celular';
}
if (mb_strlen($mensaje) < 10 || mb_strlen($mensaje) > 2000) {
    $errors[] = 'mensaje';
}

if (!empty($errors)) {
    $qs = http_build_query([
        'contact_status' => 'error',
        'fields' => implode(',', $errors)
    ]);
    $parts = explode('#', $next, 2);
    $base = $parts[0];
    $hash = isset($parts[1]) ? '#' . $parts[1] : '';
    $sep = (strpos($base, '?') === false) ? '?' : '&';
    header('Location: ' . $base . $sep . $qs . $hash);
    exit;
}

// ——— Email ———
$to = 'contacto@dangellabs.com';
$subject = 'Nuevo contacto desde dangellabs.com — ' . $interes;

$lines = [
    'Nuevo mensaje de contacto',
    '----------------------------------------',
    '¿Qué le interesa?: ' . $interes,
    'Nombre: ' . $nombre,
    'Email: ' . $email,
    'Celular: ' . $celular,
    'Empresa: ' . ($empresa !== '' ? $empresa : '-'),
    '',
    'Mensaje:',
    $mensaje,
    '----------------------------------------',
    'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'desconocida'),
    'Agente: ' . ($_SERVER['HTTP_USER_AGENT'] ?? 'desconocido'),
];
$body = implode("\r\n", $lines);

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: Dangel Labs <contacto@dangellabs.com>';
$headers[] = 'Reply-To: ' . $nombre . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));

if ($sent) {
    $qs = http_build_query(['contact_status' => 'ok']);
} else {
    $qs = http_build_query(['contact_status' => 'error', 'reason' => 'send_failed']);
}

$parts = explode('#', $next, 2);
$base = $parts[0];
$hash = isset($parts[1]) ? '#' . $parts[1] : '';
$sep = (strpos($base, '?') === false) ? '?' : '&';
header('Location: ' . $base . $sep . $qs . $hash);
exit;
