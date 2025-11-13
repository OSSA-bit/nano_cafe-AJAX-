<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$data = file_get_contents("php://input");
$file = "cart.json";
file_put_contents($file, $data);
echo json_encode(["success" => true]);
?>
