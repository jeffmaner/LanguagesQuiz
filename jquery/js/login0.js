(function() {
  function setCookie(name, value, expirationDays) {
    var expirationDate = new Date(),
        cookieValue = "";
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    cookieValue = encodeURIComponent(value) + ((expirationDays==null) ? "" : "; expires=" + expirationDate.toUTCString());
    document.cookie = name + "=" + cookieValue;
  }

  function getCookie(name) {
    var value = document.cookie,
        start = value.indexOf(" " + name + "="),
        end   = 0;

    if (start == -1) {
      start = value.indexOf(name + "=");
    }
    if (start == -1) {
      value = null;
    } else {
      start = value.indexOf("=", start) + 1;
      end = value.indexOf(";", start);
      if (end == -1) {
        end = value.length;
      }
      value = decodeURIComponent(value.substring(start, end));
    }

    return value;
  }

  function login() {
    var u = $("#userID").val(),
        p = $("#password").val();

    if (localStorage.userID !== undefined) {
      if (localStorage.userID === u) {
        if (localStorage.password === p) {
          alert("Authenticated!");
        } else {
          alert("Unable to authenticate.");
        }
      } else {
        localStorage.userID = u;
        localStorage.password = p;
        alert("User added.");
      }
    } else {
      localStorage.userID = u;
      localStorage.password = p;
      alert("User added.");
    }

    if (getCookie("userID") === null) {
      setCookie("userID", u);
    }

    // TODO: This should trigger the anchor to close the login form. Alas, it doesn't.
    $("#closeLogin").trigger("click");
    $("#loginForm").style("opacity:0");
    
    return false; // Stop event propagation.

    // TODO: How to make the form disappear on authentication?
  }

  var userID = getCookie("userID");

  // Chrome won't let me set cookies. Huh? It works in firefox.
  if (userID !== null) {
    $("#welcome").text("Welcome, " + userID + ".");
  }

  $("#loginLink").click(function() {$("#userID").focus();});
  $("#loginForm").submit(login);
}());