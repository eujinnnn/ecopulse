<?php

session_start();

// Check if the user is logged in
if (!isset($_SESSION['username'])) {
    header("Location: login.php");  // Redirect to login if not logged in
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Database connection
$servername = "localhost";
$username = "BIT210";
$password = "";
$dbname = "myweb2";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS waste_pickups (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    wasteType VARCHAR(50) NOT NULL,
    pickupDate DATE NOT NULL,
    pickupTime VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === FALSE) {
    die("Error creating table: " . $conn->error);
}

// Generate upcoming valid pickup dates (Tuesdays and Thursdays for the next 4 weeks)
function generateValidPickupDates($daysAllowed = ['Tuesday', 'Thursday'], $numWeeks = 4) {
    $validDates = [];
    $currentDate = new DateTime();
    
    for ($i = 0; $i < $numWeeks * 7; $i++) {
        $dayName = $currentDate->format('l');
        if (in_array($dayName, $daysAllowed)) {
            $validDates[] = $currentDate->format('Y-m-d'); // Store as YYYY-MM-DD
        }
        $currentDate->modify('+1 day'); // Go to the next day
    }

    return $validDates;
}

// Generate valid dates (Tuesdays and Thursdays)
$validPickupDates = generateValidPickupDates();

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get form inputs
    $address = $_POST['address'];
    $wasteType = $_POST['wasteType'];
    $pickupDate = $_POST['pickupDate'];
    $pickupTime = $_POST['pickupTime'];

    // Check if the user ID is set in the session
    if (!isset($_SESSION['id'])) {
        die("User ID is not set in the session.");
    }

    $userId = $_SESSION['id']; // Now it's safe to access

    // Basic validation
    if (empty($address) || empty($wasteType) || empty($pickupDate) || empty($pickupTime)) {
        $error = "All fields are required!";
        $_SESSION['error'] = $error; // Store error message in session
    } else {
        // Fetch user email based on user ID
        $userQuery = "SELECT email FROM userss WHERE id = ?";
        $userStmt = $conn->prepare($userQuery);
        $userStmt->bind_param("i", $userId); // Assuming user_id is an integer
        $userStmt->execute();
        $userResult = $userStmt->get_result();
        $user = $userResult->fetch_assoc();

        if ($user) {
            $email = $user['email']; // Get the email address from the result

            // Insert data into waste_pickups table
            $stmt = $conn->prepare("INSERT INTO waste_pickups (address, wasteType, pickupDate, pickupTime) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $address, $wasteType, $pickupDate, $pickupTime);

            if ($stmt->execute()) {
                // Send confirmation email using PHPMailer
                $mail = new PHPMailer(true);

                try {
                    // Server settings
                    $mail->isSMTP();
                    $mail->Host       = 'smtp.gmail.com';  // Correct SMTP server for Gmail
                    $mail->SMTPAuth   = true;
                    $mail->Username   = 'qppq5273@gmail.com';  // Your email address
                    $mail->Password   = 'xhzfujhqpzdbcmnv';     // Your App Password
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port       = 587;

                    // Recipients
                    $mail->setFrom('qppq5273@gmail.com', 'Waste Pickup Service');
                    $mail->addAddress($email);  // Send to the user's email

                    // Content
                    $mail->isHTML(true);
                    $mail->Subject = 'Waste Pickup Confirmation';
                    $mail->Body    = "
                    <table style='width: 100%; border-collapse: collapse;'>
                    <tr>
                            <th style='text-align: left; padding: 8px; border: 1px solid #ddd;'>Pickup Date</th>
                            <th style='text-align: left; padding: 8px; border: 1px solid #ddd;'>Pickup Time</th>
                            <th style='text-align: left; padding: 8px; border: 1px solid #ddd;'>Waste Type</th>
                            <th style='text-align: left; padding: 8px; border: 1px solid #ddd;'>Address</th>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'>$pickupDate</td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>$pickupTime</td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>$wasteType</td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>$address</td>
                        </tr>
                    </table>
                ";


                    // Enable debugging
                    $mail->SMTPDebug = 0;  // Set to 0 to disable debug output

                    // Send the email
                    $mail->send();
                    $_SESSION['confirmationMessage'] = "Your waste pickup is scheduled on $pickupDate at $pickupTime for $wasteType at $address. A confirmation email has been sent.";
                } catch (Exception $e) {
                    $error = "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
                    error_log("Mailer Error: {$mail->ErrorInfo}");  // Log the error
                    $_SESSION['error'] = $error; // Store error in session for user feedback
                }
            } else {
                $error = "Error: " . $stmt->error;
                $_SESSION['error'] = $error; // Store error message in session
            }
        } else {
            $error = "No user found with this ID.";
            $_SESSION['error'] = $error; // Store error message in session
        }
    }
}

// Clear session error message after displaying
if (isset($_SESSION['error'])) {
    $errorMessage = $_SESSION['error'];
    unset($_SESSION['error']);  // Clear it after displaying
} else {
    $errorMessage = '';
}

// Check for confirmation message
if (isset($_SESSION['confirmationMessage'])) {
    $confirmationMessage = $_SESSION['confirmationMessage'];
    unset($_SESSION['confirmationMessage']);  // Clear it after displaying
} else {
    $confirmationMessage = '';
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Schedule Waste Pickup</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-image: url('recycle2.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
            margin: 0;
            padding: 20px;
        }
        .container {
            margin-top: 50px;
        }
        .card {
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            background-color: rgba(255, 255, 255, 0.5); 
            float: center;
            
        }
        .btn-custom {
            background-color: #28a745;
            color: white;
            
        }
        .btn-custom:hover {
            background-color: #218838;
        }
        label {
            color: #222222;
        }
        /*.recycle-info {
            display: flex;
            align-items: center;
            color: white;
            margin-bottom: 20px;
        }
        .recycle-icon {
            width: 80px; /* Adjust size of the icon */
           /* height: 80px;
            margin-right: 15px;
        } 
        .recycle-desc {
            font-size: 18px;
        } */

        #map {
            height: 400px;  /* Set the map height */
            width: 100%;
            margin-bottom: 20px;
        }
    </style>
    <!-- Leaflet.js and Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
</head>
<body>
<?php if (!empty($confirmationMessage)): ?>
    <div class="d-flex justify-content-center align-items-center" style="height: 100vh; position: fixed; top: 0; left: 0; width: 100%; z-index: 999;">
        <div class="text-center" style="max-width: 500px;">
            <div class="alert alert-success" id="confirmationMessage">
                <?php echo $confirmationMessage; ?>
            </div>
            <div class="alert alert-info">
                Redirecting in <span id="countdown">10</span> seconds...
            </div>
        </div>
    </div>
    <script>
        // Countdown timer for 10 seconds
        let countdown = 10;
        const countdownDisplay = document.getElementById('countdown');

        const interval = setInterval(function() {
            countdown--;
            countdownDisplay.innerText = countdown;

            if (countdown <= 0) {
                clearInterval(interval);
                window.location.href = 'login.php'; // Redirect to login page
            }
        }, 1000);
    </script>
<?php endif; ?>


    <div class="container">
        <div class="row">
            <!-- Left Column for Recycle Icon and Description 
            <div class="col-md-5">
                <div class="recycle-info">
                    <img src="green-house.png" alt="Recycle Icon" class="recycle-icon">
                    <p class="recycle-desc">Recycling helps reduce waste in landfills, conserves natural resources, and prevents pollution. Make sure to properly separate your recyclable waste before scheduling a pickup.</p>
                </div>
            </div>
            -->

            <!-- Right Column for Schedule Pickup Card -->
            <div class="">
                <div class="card">
                    <div class="card-body">
                        <h2 class="card-title text-center">Schedule Waste Pickup</h2>

                        <form id="pickupForm" action="" method="POST">
                            <!--  Map Selecting Address -->
                            <div id="map"></div>

                           <!-- Address Input  -->
                            <div class="mb-3">
                                <label for="address" class="form-label"><b>Selected Address:</b></label>
                                <input type="text" id="address" name="address" class="form-control" placeholder="Select your address from the map" required>
                                <br>
                                <small class="alert alert-danger">You can edit the address if needed.</small>
                            </div>


                            <!-- Waste Type Selection -->
                            <div class="mb-3">
                                <label for="wasteType" class="form-label"><b>Select Waste Type:</b></label>
                                <select id="wasteType" name="wasteType" class="form-select" required>
                                    <option value="" disabled selected>Select Waste Type</option>
                                    <option value="household">Household Waste</option>
                                    <option value="recyclable">Recyclable Waste</option>
                                    <option value="hazardous">Hazardous Waste</option>
                                </select>
                            </div>


                            <!-- Pickup Date Selection -->
                            <div class="mb-3">
                                <label for="pickupDate" class="form-label"><b>Select Pickup Date:</b></label>
                                <select id="pickupDate" name="pickupDate" class="form-select" required>
                                    <option value="" disabled selected>Select Pickup Date</option>
                                    <!-- Replace this with dynamic date options -->
                                    <option value="2024-10-20">October 20, 2024</option>
                                    <option value="2024-10-21">October 21, 2024</option>
                                </select>
                            </div>

                            <!-- Pickup Time Selection -->
                            <div class="mb-3">
                                <label for="pickupTime" class="form-label"><b>Select Pickup Time:</b></label>
                                <select id="pickupTime" name="pickupTime" class="form-select" required>
                                    <option value="" disabled selected>Select Pickup Time</option>
                                    <option value="9:00 AM">9:00 AM</option>
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="11:00 AM">11:00 AM</option>
                                    <option value="1:00 PM">1:00 PM</option>
                                    <option value="2:00 PM">2:00 PM</option>
                                </select>
                            </div>

                            <button type="submit" class="btn btn-custom">Schedule Pickup</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Initialize the map with default view
        const map = L.map('map').setView([40.712776, -74.005974], 13);  // Default to New York

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Create a draggable marker
        let marker = L.marker([40.712776, -74.005974], {
            draggable: true
        }).addTo(map);

        // Reverse Geocoding using Nominatim API
        function getAddress(lat, lng) {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.address) {
                        const address = data.display_name;
                        document.getElementById("address").value = address;  // Set the address input field
                    }
                })
                .catch(error => {
                    console.error('Error fetching address:', error);
                });
        }

        // Update the address when the map is clicked
        map.on('click', function(e) {
            const { lat, lng } = e.latlng;
            marker.setLatLng(e.latlng);  // Move the marker
            getAddress(lat, lng);        // Get the address
        });

        // Update the address when the marker is dragged
        marker.on('dragend', function(e) {
            const { lat, lng } = e.target.getLatLng();
            getAddress(lat, lng);
        });

        // Use Geolocation API to get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Set map view to current location
                map.setView([lat, lng], 13);
                marker.setLatLng([lat, lng]);  // Move marker to current location

                // Fetch and display the current address
                getAddress(lat, lng);
            }, function() {
                console.error('Geolocation failed or permission denied.');
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    </script>
</body>
</html>
