function logout() {
    localStorage.removeItem("token"); //Elimina token
    window.location.href = "login.html"; //Redigir al login
}