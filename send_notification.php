<?php
header('Access-Control-Allow-Origin: http://localhost:4200'); // Adjust this as needed
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Get the JSON input from the POST request
$data = json_decode(file_get_contents("php://input"), true);

// Check if the required data is available
if (!isset($data['community']) || !isset($data['message'])) {
    echo json_encode(['status' => 'error', 'message' => 'Community or message not found']);
    exit;
}

// Get the community and message from the POST data
$community = $data['community'];
$message = $data['message'];

// Validate the message
if (empty($message)) {
    echo json_encode(['status' => 'error', 'message' => 'Notification message cannot be empty']);
    exit;
}

// Database connection settings
$servername = "localhost";  // MySQL server address (usually localhost)
$username = "ecopulse";  // Replace with your MySQL username
$password = "ecopulse123";  // Replace with your MySQL password
$dbname = "ecopulse";  // Replace with your database name

// Create a new MySQL connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check for connection errors
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $conn->connect_error]));
}

try {
    // Fetch all users from the users table, either for a specific community or for all users if community is "default"
    if ($community === 'default') {
        // Fetch all users for a broadcast notification
        $userStmt = $conn->prepare("SELECT id FROM users");
    } else {
        // Fetch users only from the specified community
        $userStmt = $conn->prepare("SELECT id FROM users WHERE community = ?");
        $userStmt->bind_param("s", $community);
    }
    
    $userStmt->execute();
    $result = $userStmt->get_result();

    // Check if any users were found
    if ($result->num_rows > 0) {
        // Insert a notification record for each user found
        while ($row = $result->fetch_assoc()) {
            $user_id = $row['id'];

            // Insert notification for each user in the notification table
            $stmt = $conn->prepare("INSERT INTO notification (user_id, message, community) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $user_id, $message, $community);
            $stmt->execute();
        }

        // Notification has been saved to the database for all users
        echo json_encode(['status' => 'success', 'message' => 'Notification sent successfully to all relevant users']);
    } else {
        // If no users were found
        echo json_encode(['status' => 'error', 'message' => 'No users found to notify']);
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error sending notification: ' . $e->getMessage()]);
} finally {
    // Close the database connection
    $conn->close();
}
?>
