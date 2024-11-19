<?php
// Allow Cross-Origin requests
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Database connection settings
$servername = "localhost";  
$username = "ecopulse";  
$password = "ecopulse123";  
$dbname = "ecopulse";  

// Create a new MySQL connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check for connection errors
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Get the user_id from the query parameters
$user_id = isset($_GET['userId']) ? $_GET['userId'] : null;

if ($user_id) {
    // Query to get the notifications for the specific user
    $sql = "SELECT message, created_at FROM notification WHERE user_id = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $user_id); // 's' for string type
    $stmt->execute();
    $result = $stmt->get_result();

    // Initialize an array to store the notifications
    $notifications = [];

    if ($result->num_rows > 0) {
        // Fetch the results as an associative array
        while ($row = $result->fetch_assoc()) {
            $notifications[] = [
                'date' => $row['created_at'],
                'message' => $row['message']
            ];
        }
    }

    // Return the notifications as a JSON response
    echo json_encode($notifications);
} else {
    echo json_encode(['status' => 'error', 'message' => 'User ID is required']);
}

// Close the database connection
$conn->close();
?>
