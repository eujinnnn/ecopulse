<?php
header("Access-Control-Allow-Origin: http://localhost:4200"); // Adjust as needed
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Allow methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow headers

// Your existing code goes here
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
$host = 'localhost'; // Your database host
$dbname = 'ecopulse'; // Your database name
$username = 'ecopulse'; // Your database username
$password = 'ecopulse123'; // Your database password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get the user ID from the request
    if (isset($_GET['id'])) {
        $userId = $_GET['id'];

        // Prepare and execute the SQL statement to fetch user details (including community and other fields)
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->bindParam(':id', $userId);
        $stmt->execute();

        // Fetch the user details
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            // Get the community name from the user record
            $communityName = $user['community'];

            // Fetch the community id based on the community_name from the communities table
            $stmtCommunity = $pdo->prepare("SELECT id FROM communities WHERE name = :community_name");
            $stmtCommunity->bindParam(':community_name', $communityName);
            $stmtCommunity->execute();

            // Fetch the community ID
            $community = $stmtCommunity->fetch(PDO::FETCH_ASSOC);

            if ($community) {
                // Add community_id and other details to the response
                $response = [
                    'community_id' => $community['id'],
                    'community_name' => $communityName,
                    'user_id' => $user['id'],
                    'email' => $user['email'],
                    'username' => $user['username'],
                    'address' => $user['address'],
                    'contactNumber' => $user['contactNumber'],
                    'role' => $user['role']
                ];
                echo json_encode($response);
            } else {
                echo json_encode(['message' => 'Community not found']);
            }
        } else {
            echo json_encode(['message' => 'User not found']);
        }
    } else {
        echo json_encode(['message' => 'No user ID provided']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
