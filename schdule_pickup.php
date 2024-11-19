<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$host = 'localhost';
$dbname = 'ecopulse';
$username = 'ecopulse';
$password = 'ecopulse123';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$pickupDay = isset($data['pickup_day']) ? $data['pickup_day'] : '';  
$selectedTime = isset($data['pickup_time']) ? $data['pickup_time'] : '';
$selectedWaste = isset($data['waste_type']) ? $data['waste_type'] : '';
$selectedRecyclables = isset($data['recyclables']) ? $data['recyclables'] : [];
$userId = isset($data['user_id']) ? $data['user_id'] : '';  
$userCommunity = isset($data['user_community']) ? $data['user_community'] : '';  

if (empty($pickupDay) || empty($selectedTime) || empty($selectedWaste) || empty($userId) || empty($userCommunity)) {
    http_response_code(400);
    echo json_encode(['message' => 'Please fill in all fields: day, time, waste type, user ID, and community.']);
    exit;
}

$sql = "INSERT INTO pickups (pickup_day, pickup_time, waste_type, recyclables, user_id, user_community) 
        VALUES (:pickup_day, :pickup_time, :waste_type, :recyclables, :user_id, :user_community)";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':pickup_day' => $pickupDay,
        ':pickup_time' => $selectedTime,
        ':waste_type' => $selectedWaste,
        ':recyclables' => implode(', ', $selectedRecyclables),
        ':user_id' => $userId,
        ':user_community' => $userCommunity  
    ]);

    // Send notification to the user
    $message = "Your pickup is scheduled for $pickupDay at $selectedTime. Waste Type: $selectedWaste.";

    $notificationSql = "INSERT INTO notification (user_id, message) VALUES (:user_id, :message)";
    $notificationStmt = $pdo->prepare($notificationSql);
    $notificationStmt->execute([
        ':user_id' => $userId,
        ':message' => $message
    ]);

    $response = [
        'message' => 'Pickup scheduled successfully and notification sent!',
        'data' => [
            'Waste Type' => $selectedWaste,
            'Pickup Time' => $selectedTime,
            'Pickup Day' => $pickupDay,
            'Recyclables' => $selectedRecyclables
        ]
    ];

    http_response_code(200);
    echo json_encode($response);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Error saving data: ' . $e->getMessage()]);
}
?>
