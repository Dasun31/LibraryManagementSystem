const firebaseConfig = {
  apiKey: "AIzaSyCAGNP4_J0-aYz7zV6vQxCDGVT3117xlBI",
  authDomain: "librarymanagementsystem-5d37a.firebaseapp.com",
  databaseURL:
    "https://librarymanagementsystem-5d37a-default-rtdb.firebaseio.com",
  projectId: "librarymanagementsystem-5d37a",
  storageBucket: "librarymanagementsystem-5d37a.appspot.com",
  messagingSenderId: "36010980494",
  appId: "1:36010980494:web:a1a4fd730b48583596c5df"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

function signUp() {

  let name = document.getElementById("name").value;
  let mobile = document.getElementById("mobile").value;
  let signupEmail = document.getElementById("signupEmail").value;
  let signupPassword = document.getElementById("signupPassword").value;

  let emailKey = signupEmail.replaceAll(".", "_");

  if (name === "" || mobile === "" || signupEmail === "" || signupPassword === "") {
    alert("Please Fill All Fields");
    return;
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    alert("Mobile number must be 10 digits");
    return;
  }

  db.ref("users/" + emailKey).once("value", function (snapshot) {
    if (snapshot.exists()) {
      alert("Email Already Registered..");
      return;
    }

    db.ref("users/" + emailKey).set({
      name: name,
      mobile: mobile,
      email: signupEmail,
      password: signupPassword
    })
      .then(() => {
        alert("Sign Up Successfully");
        window.location.href = "memberMain.html";
      })
      .catch((error) => {
        alert(error.message);
      });
  })
}

function login() {
  let email = document.getElementById("loginEmail").value;
  let password = document.getElementById("loginPassword").value;

  let emailKey = email.replaceAll(".", "_");

  if (email === "" || password === "") {
    alert("Fill All Fields");
    return;
  }

  if (email === "admin@gmail.com" && password === "admin123") {
    alert("Login Successful");
    window.location.href = "adminMain.html"
    return;
  }

  db.ref("users/" + emailKey).once("value", function (snapshot) {
    if (!snapshot.exists()) {
      alert("User Not Found.");
      return;
    }

    let user = snapshot.val();
    if (user.password === password) {
      alert("Login Successful");
      window.location.href = "memberMain.html";
    } else {
      alert("Incorrect Password..");
    }
  })
}

function addBook() {
  let title = document.getElementById("bookTitle").value;
  let author = document.getElementById("author").value;
  let isbn = document.getElementById("isbn").value;
  let category = document.getElementById("category").value;
  let qty = document.getElementById("bookQty").value;

  if (title === "" || author === "" || isbn === "" || qty === "" || category === "") {
    alert("Please Fill All Fields");
    return;
  }

  db.ref("books/" + isbn).once("value", function (snapshot) {
    if (snapshot.exists()) {
      alert("This Book Already Added.");
      return;
    }

    db.ref("books/" + isbn).set({
      title: title,
      author: author,
      isbn: isbn,
      qty: qty,
      category: category
    }).then(() => {
      alert("Book Added Successfully..");

      document.getElementById("bookTitle").value = "";
      document.getElementById("author").value = "";
      document.getElementById("isbn").value = "";
      document.getElementById("category").value = "";
      document.getElementById("bookQty").value = "";

    }).catch((error) => {
      alert(error.message);
    })
  })

}