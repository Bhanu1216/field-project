document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault(); 

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    if (name && email) {
        document.getElementById("successMessage").style.display = "block";
        document.getElementById("registerForm").reset();
    } else {
        alert("Please fill out all fields.");
    }
});
