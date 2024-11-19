<?php
header('Access-Control-Allow-Origin: http://localhost:4200'); // Change if needed
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Get the raw POST data
$data = json_decode(file_get_contents("php://input"));

// Log incoming data for debugging
file_put_contents('php://stderr', print_r($data, true));  // Log to PHP error log

// Validate the input
if (!isset($data->name) || !isset($data->pickupSchedule) || empty($data->pickupSchedule)) {
    echo json_encode(array("status" => "error", "message" => "Missing required fields."));
    exit();
}

$community_name = $data->name;
$pickup_schedule = $data->pickupSchedule;

// Database connection settings
$servername = "localhost";
$username = "ecopulse";
$password = "ecopulse123";
$dbname = "ecopulse";

// Create a new MySQL connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check for connection errors
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Insert the community name into the 'communities' table
$sql = "INSERT INTO communities (name) VALUES ('$community_name')";
if ($conn->query($sql) !== TRUE) {
    echo json_encode(array("status" => "error", "message" => "Error adding community: " . $conn->error));
    exit();
}

$community_id = $conn->insert_id;  // Get the last inserted community ID

// Insert the pickup schedule into the 'pickup_schedules' table
foreach ($pickup_schedule as $schedule) {
    if (isset($schedule->days) && isset($schedule->times)) {
        $days = implode(",", $schedule->days);  // Convert array of days to a comma-separated string
        $times = implode(",", $schedule->times);  // Convert array of times to a comma-separated string

        $sql_schedule = "INSERT INTO pickup_schedules (community_id, pickup_day, pickup_time)
                         VALUES ('$community_id', '$days', '$times')";

        if (!$conn->query($sql_schedule)) {
            echo json_encode(array("status" => "error", "message" => "Error adding pickup schedule: " . $conn->error));
            exit();
        }
    }
}

// Return success response
echo json_encode(array("status" => "success", "message" => "Community added successfully."));

// Close the connection
$conn->close();
?>
