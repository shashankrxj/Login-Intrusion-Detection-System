# Login Intrusion Detection System (Login-IDS)
Login-IDS is a secure authentication system designed to enhance security by enforcing strict password policies, tracking failed login attempts, and implementing temporary account locks to mitigate brute-force attacks. It provides admin-accessible logs, user alerts for remaining login attempts, and robust data protection with JWT tokens and password hashing.

This project builds upon features from my [Signin-Signup-template Project](https://github.com/shashankrxj/Signin-Signup-page-with-MongoDB), specifically the sign-in and sign-up functionality.

## Features

- **Password Policy**: Ensures strong passwords with a minimum length of 8 characters, at least one uppercase letter, and one special character.
- **Account Lockout**: Locks accounts after three consecutive failed login attempts for one minute to prevent brute-force attacks.
- **Admin Alerts**: Sends alerts to the admin when users exceed failed login limits.
- **User Alerts**: Notifies users of remaining login attempts before lockout.
- **Activity Logs**: Maintains detailed logs of all login activities for monitoring.
- **Data Security**: Implements JWT tokens for authentication and bcrypt for password hashing.


## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: EJS templates, CSS
- **Database**: MongoDB, Mongoose
- **Security**: bcrypt for hashing, JWT for token authentication

## Installation & Setup

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/shashankrxj/Login-Intrusion-Detection-System.git
   
2. Navigate to the project directory:
   ```bash
   cd Login-IDS

3. Install dependencies:
   ```bash
   npm install

4. Create a .env file and configure environment variables:
   ```bash
   MONGO_URI=<your-mongodb-uri>
   SECRET_KEY=<your-secret-key>

5. Start the application:
   ```bash
   npm start

## Usage

- **Sign Up**: Register new users with enforced strong password policies.
- **Login Attempts**: Tracks all successful and failed login attempts, notifying users about remaining chances before lockout.
- **Intrusion Detection**: Automatically locks users for 1 minute after exceeding 3 failed attempts.
- **Admin Panel**:Provides a comprehensive log of all activities, including signups, logins, logouts, and failed attempts, with timestamps and status updates.

### Admin Logs Overview
Here’s a preview of how the admin logs look, showing details of login attempts, including timestamps and statuses:

![Admin-log](https://github.com/user-attachments/assets/b7a202d4-5c10-4fb5-9c08-d502068816ec)


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
