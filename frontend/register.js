const API_URL = "http://localhost:3000"; 

document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration successful! Please log in.");
            window.location.href = "login.html"; // Redirigir al login
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Registration failed. Please try again.");
    }
});
