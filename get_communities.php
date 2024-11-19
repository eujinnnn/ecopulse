<?php
header('Access-Control-Allow-Origin: http://localhost:4200'); // Change if needed
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Database connection settings
$servername = "localhost";  // MySQL server address (usually localhost)
$username = "ecopulse";  // Replace with your MySQL username
$password = "ecopulse123";  // Replace with your MySQL password
$dbname = "ecopulse";  // Replace with your database name

// Create a new MySQL connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check for connection errors
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL query to fetch all communities and their pickup schedules
$query = "
    SELECT c.id AS community_id, c.name AS community_name, 
           ps.pickup_day, ps.pickup_time
    FROM communities c
    LEFT JOIN pickup_schedules ps ON c.id = ps.community_id
    ORDER BY c.id, ps.pickup_day, ps.pickup_time
";

// Execute the query
$result = mysqli_query($conn, $query);

// Check for query errors
if (!$result) {
    die('Error executing query: ' . mysqli_error($conn));
}

// Initialize the response array
$response = array();
$communities = array();
$current_community_id = null;
$current_community = null;

// Fetch the results and group them by community and day
while ($row = mysqli_fetch_assoc($result)) {
    // Check if we're dealing with a new community
    if ($current_community_id != $row['community_id']) {
        // Add the previous community if it exists
        if ($current_community) {
            $communities[] = $current_community;
        }

        // Set up a new community
        $current_community_id = $row['community_id'];
        $current_community = array(
            'name' => $row['community_name'],
            'pickupSchedule' => array()
        );
    }

    // Add pickup schedule for the current community
    if ($row['pickup_day'] && $row['pickup_time']) {
        // Check if the day already exists in the pickup schedule
        $found = false;
        foreach ($current_community['pickupSchedule'] as &$schedule) {
            if (in_array($row['pickup_day'], $schedule['days'])) {
                // Add the time if the day exists
                $schedule['times'][] = $row['pickup_time'];
                $found = true;
                break;
            }
        }
        
        // If the day doesn't exist, create a new entry
        if (!$found) {
            $current_community['pickupSchedule'][] = array(
                'days' => array($row['pickup_day']),
                'times' => array($row['pickup_time'])
            );
        }
    }
}

// Add the last community
if ($current_community) {
    $communities[] = $current_community;
}

// Return the response as JSON
$response['status'] = 'success';
$response['data'] = $communities;

mysqli_close($conn);

// Set the response content type to JSON
header('Content-Type: application/json');
echo json_encode($response);
?>
