document.getElementById("login-form").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent form submission

  // Get input values
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  // Hash the entered password
  bcrypt.hash(password, 10, function(err, hashedPassword) {
      if (err) {
          console.error(err);
          return;
      }

      // Here you would typically make a request to your server to fetch the hashed password associated with the entered username
      // For the sake of this example, let's assume the hashed password is hardcoded
      var storedHashedPassword = "$2a$10$6UvMlW5xfVUZUaVL9LjvnuzO6pSvWgwLw6QhzO0Q7Bo8Y9zjc9B1G"; // This is just an example, replace it with your actual hashed password

      // Compare the hashed passwords
      bcrypt.compare(password, storedHashedPassword, function(err, result) {
          if (err) {
              console.error(err);
              return;
          }

          if (result) {
              // If passwords match, redirect to dashboard or perform further actions
              window.location.href = "dashboard.html";
          } else {
              // If passwords don't match, display error message
              document.getElementById("error-message").innerText = "Invalid username or password";
          }
      });
  });
});


// console.log("Working!")
// document.querySelector(".btn").addEventListener("click", (e) => {
//   e.preventDefault()
//   console.log("Button clicked!")
//   console.log(username.value, password.value)
//   let passwords = localStorage.getItem("passwords")
//   console.log(passwords)
//   if(passwords == null){
//     let json = []
//     json.push({username: username.value, password:password.value})
//     alert("User created!")
//     localStorage.setItem(passwords, JSON.stringify(json))
//   }
//   else{
//     let json = JSON.parse(localStorage.getItem("passwords"))
//     json.push({username: username.value, password:password.value})
//     alert("User created!")
//     localStorage,setItem("passwords", JSON.stringify(json))
//   }
// })