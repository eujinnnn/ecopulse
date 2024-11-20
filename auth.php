<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include Composer autoload file to load PHPMailer
require 'vendor/autoload.php';

// Use PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Database connection
$host = 'localhost';
$db_name = 'ecopulse';
$username = 'ecopulse';
$password = 'ecopulse123';

// Create connection with error handling
try {
    $conn = new mysqli($host, $username, $password, $db_name);
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit();
}

// Get and decode JSON input
$jsonInput = file_get_contents('php://input');
if (!$jsonInput) {
    http_response_code(400);
    echo json_encode(['error' => 'No input received']);
    exit();
}

$data = json_decode($jsonInput);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
    exit();
}

// Handle different actions
try {
    if (!isset($data->action)) {
        throw new Exception('No action specified');
    }

    switch ($data->action) {
        case 'signup':
            signup($data);
            break;
        case 'login':
            login($data);
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function signup($data) {
    global $conn;
    
    if (!isset($data->signupEmail) || !isset($data->signupUsername)) {
        throw new Exception('Missing required signup data');
    }

    $email = mysqli_real_escape_string($conn, $data->signupEmail);
    $username = mysqli_real_escape_string($conn, $data->signupUsername);

    // Check for existing user
    $checkQuery = "SELECT * FROM users WHERE username = '$username' OR email = '$email'";
    $result = mysqli_query($conn, $checkQuery);
    
    if ($result && mysqli_num_rows($result) > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email or username already exists']);
        return;
    }

    // Generate password and create user
    $password = generateRandomPassword();
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert user into the database
    $insertQuery = "INSERT INTO users (email, username, password, role, community) 
                    VALUES ('$email', '$username', '$hashedPassword', 'Member', 'default')";

    if (mysqli_query($conn, $insertQuery)) {
        $userId = mysqli_insert_id($conn);
        
        // Check if the user ID is 1 to assign Super Admin role
        if ($userId == 1) {
            $updateRoleQuery = "UPDATE users SET role = 'Super Admin' WHERE id = $userId";
            mysqli_query($conn, $updateRoleQuery);
        }

        // For testing, return password directly in response
        echo json_encode([
            'success' => true,
            'message' => 'Signup successful',
            'debug_info' => [
                'temporary_password' => $password,
                'email' => $email,
                'userId' => $userId,
                'role' => $userId == 1 ? 'Super Admin' : 'Member'
            ]
        ]);
        
        // Send password by email asynchronously
        sendPasswordByEmail($email, $password);
    } else {
        throw new Exception('Failed to create user: ' . mysqli_error($conn));
    }
}

function login($data) {
    global $conn;
    
    if (!isset($data->loginUsername) || !isset($data->loginPassword)) {
        throw new Exception('Missing login credentials');
    }

    $username = mysqli_real_escape_string($conn, $data->loginUsername);
    $password = mysqli_real_escape_string($conn, $data->loginPassword);

    $query = "SELECT * FROM users WHERE username = '$username' LIMIT 1";
    $result = mysqli_query($conn, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        if (password_verify($password, $user['password'])) {
            echo json_encode([
                'success' => true,
                'token' => base64_encode($user['id'] . ':' . time()),
                'role' => $user['role'],
                'userId' => $user['id'],
                'community' => $user['community']
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
}

function generateRandomPassword($length = 8) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return substr(str_shuffle($chars), 0, $length);
}

function sendPasswordByEmail($email, $password) {
    $mail = new PHPMailer(true);
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'qppq5273@gmail.com';  // Replace with your email
        $mail->Password = 'xhzfujhqpzdbcmnv';  // Replace with your email password or app-specific password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Recipients
        $mail->setFrom('qppq5273@gmail.com', 'EcoPulse');
        $mail->addAddress($email);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Welcome to EcoPulse - Your Password';
        $mail->Body = "<p>Your temporary password is: <strong>$password</strong></p>";

        // Send email
        $mail->send();
        return true;
    } catch (Exception $e) {
        // Log error message if email fails
        error_log("Mail error: " . $mail->ErrorInfo);
        return false;
    }
}
