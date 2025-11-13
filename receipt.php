<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$conn = new mysqli("localhost", "root", "", "nanocafe");

if ($conn->connect_error) {
  echo json_encode(["success" => false, "error" => $conn->connect_error]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
  echo json_encode(["success" => false, "error" => "Invalid data"]);
  exit;
}

$timestamp = date('Y-m-d H:i:s');
$location = $conn->real_escape_string($data['location']);
$delivery_fee = floatval($data['delivery_fee']);
$grand_total = floatval($data['grand_total']);
$items = $conn->real_escape_string(json_encode($data['items']));

$sql = "INSERT INTO receipts (timestamp, location, delivery_fee, grand_total, items)
        VALUES ('$timestamp', '$location', '$delivery_fee', '$grand_total', '$items')";

if ($conn->query($sql)) {
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "error" => $conn->error]);
}

$conn->close();
?>
