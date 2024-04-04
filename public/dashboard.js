function maskPassword(password) {
    return '•'.repeat(password.length); // Replace each character with a dot
}

function openLoginPopup() {
    document.getElementById("loginPopup").style.display = "block";
}

function closeLoginPopup() {
    document.getElementById("loginPopup").style.display = "none";
}

function togglePasswordVisibility(button) {
    // console.log("Button clicked!")
    // Get the parent element of the button
    var passwordCell = button.parentNode;

    // Find the elements with the classes 'password-masked' and 'password-shown'
    var passwordMasked = passwordCell.querySelector('.password-masked');
    var passwordShown = passwordCell.querySelector('.password-shown');
    var icon = button.querySelector('img');

    // console.log(passwordMasked.style.display);

    // Toggle the visibility of the elements
    if (passwordMasked.style.display !== 'none') {
        // If password-masked is visible, hide it and show password-shown
        passwordMasked.style.display = 'none';
        passwordShown.style.display = 'inline';
        icon.src = "/eye_closed.svg";
        icon.alt = "Hide Password";
        // button.innerHTML = '<img src="/eye_closed.svg" alt="Hide Password">';
    } else {
        // If password-shown is visible, hide it and show password-masked
        passwordShown.style.display = 'none';
        passwordMasked.style.display = 'inline';
        icon.src = "/eye_open.svg";
        icon.alt = "Show Password";
        // button.innerHTML = '<img src="/eye_open.svg" alt="Show Password">';
    }
}

