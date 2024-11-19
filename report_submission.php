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

// Retrieve form data (from POST request)
$selectedIssue = $_POST['selectedIssue'] ?? '';
$issueLocation = $_POST['issueLocation'] ?? '';
$issueDescription = $_POST['issueDescription'] ?? '';
$additionalComments = $_POST['additionalComments'] ?? '';
$userId = $_POST['userId'] ?? '';
$userCommunity = $_POST['userCommunity'] ?? '';

if (empty($selectedIssue) || empty($issueLocation) || empty($issueDescription) || empty($userId)) {
    http_response_code(400);
    echo json_encode(['message' => 'Please fill in all fields: issue, location, description, and user ID.']);
    exit;
}

// Handle file upload
$uploadedImage = null;
if (isset($_FILES['uploadedImage']) && $_FILES['uploadedImage']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['uploadedImage']['tmp_name'];
    $fileName = $_FILES['uploadedImage']['name'];
    $fileNameCmps = explode(".", $fileName);
    $fileExtension = strtolower(end($fileNameCmps));

    // Allowed file extensions
    $allowedFileExtensions = array('jpg', 'jpeg', 'png', 'gif');

    if (in_array($fileExtension, $allowedFileExtensions)) {
        // Generate a unique file name
        $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
        $uploadFileDir = './uploads/';
        if (!file_exists($uploadFileDir)) {
            mkdir($uploadFileDir, 0777, true);
        }
        $dest_path = $uploadFileDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $dest_path)) {
            $uploadedImage = $newFileName;
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to upload image']);
            exit;
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid file type. Only JPG, PNG, and GIF are allowed.']);
        exit;
    }
}

// Insert report data into database
$sql = "INSERT INTO issue_reports (selected_issue, issue_location, issue_description, additional_comments, uploaded_image, user_id, user_community) 
        VALUES (:selectedIssue, :issueLocation, :issueDescription, :additionalComments, :uploadedImage, :userId, :userCommunity)";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':selectedIssue' => $selectedIssue,
        ':issueLocation' => $issueLocation,
        ':issueDescription' => $issueDescription,
        ':additionalComments' => $additionalComments,
        ':uploadedImage' => $uploadedImage,
        ':userId' => $userId,
        ':userCommunity' => $userCommunity
    ]);

    // Send notification
    $notificationMessage = "New report submitted: $selectedIssue at $issueLocation";
    $notificationSql = "INSERT INTO notification (user_id, message) VALUES (:userId, :message)";
    $notificationStmt = $pdo->prepare($notificationSql);
    $notificationStmt->execute([
        ':userId' => $userId,
        ':message' => $notificationMessage
    ]);

    // Prepare success response
    $response = [
        'status' => 'success',
        'message' => 'Report submitted successfully and notification sent.',
        'data' => [
            'selectedIssue' => $selectedIssue,
            'issueLocation' => $issueLocation,
            'issueDescription' => $issueDescription,
            'additionalComments' => $additionalComments,
            'uploadedImage' => $uploadedImage,
        ]
    ];
    http_response_code(200);
    echo json_encode($response);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Error saving data: ' . $e->getMessage()]);
}
