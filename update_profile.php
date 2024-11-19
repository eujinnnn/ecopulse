<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Allow Cross-Origin requests
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle OPTIONS request for preflight check
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection settings
$host = 'localhost';
$dbname = 'ecopulse';
$username = 'ecopulse';
$password = 'ecopulse123';

// Connect to the database
try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get the POST data
$data = json_decode(file_get_contents("php://input"), true);

// Log the incoming data for debugging
error_log("Incoming Data: " . json_encode($data));

// Check if the request method is POST and data is received
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $data) {
    $userId = $data['id'] ?? null;
    $name = $data['name'] ?? null;
    $email = $data['email'] ?? null;
    $contactNumber = $data['contactNumber'] ?? null;
    $community = $data['community'] ?? null;
    $address = $data['address'] ?? null;

    // Validate that the required fields are not null
    if (!$userId || !$name || !$email || !$contactNumber || !$community || !$address) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    // Update the user's profile in the database
    $stmt = $conn->prepare("UPDATE users SET email = :email, username = :name, contactNumber = :contactNumber, community = :community, address = :address WHERE id = :id");
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':contactNumber', $contactNumber);
    $stmt->bindParam(':community', $community);
    $stmt->bindParam(':address', $address);
    $stmt->bindParam(':id', $userId);

    // Log before executing the statement
    error_log("Executing statement for user ID: $userId");

    try {
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
        } else {
            http_response_code(500);
            $errorInfo = $stmt->errorInfo();
            echo json_encode(['success' => false, 'message' => 'Error updating profile: ' . $errorInfo[2]]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Exception occurred: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request method or no data received.']);
}
?>
