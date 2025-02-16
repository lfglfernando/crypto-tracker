const API_URL = "http://localhost:3000"; 

document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token); // Guardar el token en localStorage
            alert("Login successful!");
            window.location.href = "index.html"; // Redirigir al dashboard
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Login failed. Please try again.");
    }
});
