
const signupform = document.getElementById("signupform");

if (signupform) {
    signupform.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = signupform.username.value;
        const email = signupform.email.value;
        const password = signupform.password.value;

        fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ username, email, password })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Logged in ..")
            alert(data.message || "Signup success!");
        })
        .catch(err => {
            console.error("Signup error:", err);
            alert("Signup failed.");
        });
    });
}

// ✅ Login form logic
const loginform = document.getElementById("loginform");

if (loginform) {
    loginform.addEventListener("submit", (e) => {
        e.preventDefault();

      
        const email = loginform.email.value;
        const password = loginform.password.value;

        fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "/dashboard.html";
            } else {
                alert(data.message || "Login failed!");
            }
        })
        .catch(err => {
            console.error("Login error:", err);
            alert("Login failed.");
        });
    });
}
