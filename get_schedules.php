<?php
header("Access-Control-Allow-Origin: http://localhost:4200"); // Adjust as needed
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Allow methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow headers

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
$host = 'localhost';
$dbname = 'ecopulse';
$username = 'ecopulse';
$password = 'ecopulse123';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get the community ID from the request
    if (isset($_GET['community'])) {
        $communityId = $_GET['community'];

        // Fetch the schedule for the given community
        $stmt = $pdo->prepare("SELECT pickup_day, pickup_time FROM pickup_schedules WHERE community_id = :community_id");
        $stmt->bindParam(':community_id', $communityId);
        $stmt->execute();

        // Fetch the pickup schedule
        $schedule = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($schedule) {
            $pickupSchedule = [];
            foreach ($schedule as $entry) {
                $pickupSchedule[$entry['pickup_day']][] = $entry['pickup_time'];
            }
            echo json_encode(['pickup_schedule' => $pickupSchedule]);
        } else {
            echo json_encode(['message' => 'No schedule found for this community']);
        }
    } else {
        echo json_encode(['message' => 'No community ID provided']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
