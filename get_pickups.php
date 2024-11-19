<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow cross-origin requests

$servername = "localhost";
$username = "ecopulse";
$password = "ecopulse123";
$dbname = "ecopulse";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['error' => "Connection failed: " . $conn->connect_error]));
}

// Check if userId is provided and adjust the SQL query accordingly
$userId = isset($_GET['userId']) ? $_GET['userId'] : null;

// Modify the query to include a WHERE clause if userId is passed
$sql = "SELECT created_at, pickup_day, pickup_time, waste_type, recyclables FROM pickups";
if ($userId) {
    $sql .= " WHERE user_id = ?"; // Assuming your table has user_id column
}

$stmt = $conn->prepare($sql);
if ($userId) {
    $stmt->bind_param('s', $userId); // Assuming userId is a string
}

$stmt->execute();
$result = $stmt->get_result();

$pickups = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $pickups[] = [
            'date' => $row['created_at'],
            'day' => $row['pickup_day'],
            'time' => $row['pickup_time'],
            'type' => $row['waste_type'],
            'details' => $row['recyclables']
        ];
    }
}

// Close the connection
$conn->close();

// Return the data as JSON
echo json_encode($pickups);
?>
