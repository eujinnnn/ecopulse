<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$servername = "localhost";
$username = "ecopulse";
$password = "ecopulse123";
$dbname = "ecopulse";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]));
}

// Get input data from the request
$reportType = $_POST['reportType'] ?? null;
$startDate = $_POST['startDate'] ?? null;
$endDate = $_POST['endDate'] ?? null;
$userId = $_POST['userId'] ?? null;
$userRole = $_POST['userRole'] ?? null;
$userCommunity = $_POST['userCommunity'] ?? null;

// Prepare the response array
$response = [];

// Check if all required fields are provided
if (!$reportType || !$startDate || !$endDate || !$userRole) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required parameters.'
    ]);
    exit();
}

// Initialize variables for join and filter conditions
$joinCondition = '';
$filter = '';
$params = [$startDate, $endDate];
$paramTypes = "ss";

// Debugging: Print the incoming parameters for admin checks
error_log("User Role: $userRole");
error_log("User Community: $userCommunity");

if ($userRole === 'Super Admin') {
    // Admin with default community: fetch all data without community filter
    $joinCondition = ''; // No need to join users
    $filter = ''; // No filter for user_community
} elseif ($userRole === 'Admin') {
    if ($reportType === 'Issues Report') {
        // For Pickup Statistics, filter by user_community from pickups table
        $filter = " AND i.user_community = ? ";
    } else {
        $filter = " AND p.user_community = ? ";
    }
    $params[] = $userCommunity;
    $paramTypes .= "s"; // Add type for the community filter
} else {
    // Regular users: join with users table and filter by userId
    if ($reportType === 'Issues Report') {
        // Join with issue_reports table (as user_id is in the issue_reports table)
        $joinCondition = "JOIN users u ON i.user_id = u.id";
    } else {
        // Join with pickups table (user_id is in pickups)
        $joinCondition = "JOIN users u ON p.user_id = u.id";
    }
    $filter = " AND u.id = ? ";
    $params[] = $userId;
    $paramTypes .= "i"; // Add type for userId filter
}

// Temporarily remove the community filter and check if data returns
// Prepare the query based on the report type
$query = '';
switch ($reportType) {
    case 'Pickup Statistics':
        $query = "SELECT DATE(p.created_at) AS date, COUNT(*) AS total_pickups
                  FROM pickups p
                  $joinCondition
                  WHERE p.created_at BETWEEN ? AND ? $filter
                  GROUP BY DATE(p.created_at)
                  ORDER BY DATE(p.created_at)";
        break;

    case 'Issues Report':
        $query = "SELECT DATE(i.created_at) AS date, i.selected_issue, COUNT(*) AS total_issues
                  FROM issue_reports i
                  $joinCondition
                  WHERE i.created_at BETWEEN ? AND ? $filter
                  GROUP BY DATE(i.created_at), i.selected_issue
                  ORDER BY DATE(i.created_at)";
        break;

    case 'Recycling Rates':
        $query = "SELECT DATE(p.created_at) AS date, p.recyclables, COUNT(*) AS total_recycled
                  FROM pickups p
                  $joinCondition
                  WHERE p.created_at BETWEEN ? AND ? 
                  AND p.recyclables IN ('plastic', 'paper', 'aluminium')
                  $filter
                  GROUP BY DATE(p.created_at), p.recyclables
                  ORDER BY DATE(p.created_at)";
        break;

    default:
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid report type.'
        ]);
        exit();
}

// Debugging: Log the final query for inspection
error_log("Final Query: $query");

// Prepare and execute the query
$stmt = $conn->prepare($query);
if ($stmt === false) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error preparing query: ' . $conn->error
    ]);
    exit();
}

$stmt->bind_param($paramTypes, ...$params);
if (!$stmt->execute()) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error executing query: ' . $stmt->error
    ]);
    exit();
}

$result = $stmt->get_result();

// Check if results are found
if ($result->num_rows == 0) {
    echo json_encode([
        'status' => 'error',
        'message' => 'No data found for the selected report.'
    ]);
    exit();
}

$labels = [];
$values = [];
$issues = [];
$recyclables = [];

// Fetch the data and prepare it for the frontend
while ($row = $result->fetch_assoc()) {
    $labels[] = $row['date'];

    if ($reportType === 'Issues Report') {
        $values[] = $row['total_issues'];
        $issues[] = $row['selected_issue'];
    } elseif ($reportType === 'Recycling Rates') {
        $values[] = $row['total_recycled'];
        $recyclables[] = $row['recyclables'];
    } else {
        $values[] = $row['total_pickups'];
    }
}

// Return the data as a JSON response
$response['status'] = 'success';
$response['labels'] = $labels;
$response['values'] = $values;

if ($reportType === 'Issues Report') {
    $response['issues'] = $issues;
} elseif ($reportType === 'Recycling Rates') {
    $response['recyclables'] = $recyclables;
}

echo json_encode($response);

// Close the connection
$stmt->close();
$conn->close();
?>
