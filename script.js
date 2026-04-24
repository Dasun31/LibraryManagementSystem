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
      password: signupPassword,
      lendBooks: 0
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
      qty: Number(qty),
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

function updateBook1() {
  let isbn = document.getElementById("isbn").value;

  if (isbn === "") {
    alert("Enter ISBN ");
    return;
  }

  db.ref("books/" + isbn).once("value", function (snapshot) {
    if (!snapshot.exists()) {
      alert("This Book Does Not Exist");
      return;
    }
    localStorage.setItem("updateISBN", isbn);
    window.location.href = "updateBook.html";

  })
}

function updateBook2() {
  let updateISBN = localStorage.getItem("updateISBN")
  document.getElementById("updateisbn").value = updateISBN;
  let title = document.getElementById("bookTitle").value;
  let author = document.getElementById("author").value;
  let category = document.getElementById("category").value;
  let qty = document.getElementById("bookQty").value;

  if (title === "" || author === "" || qty === "" || category === "") {
    alert("Please Fill All Fields");
    return;
  }

  db.ref("books/" + updateISBN).update({
    title: title,
    author: author,
    category: category,
    qty: qty
  }).then(() => {
    alert("Book Updated Successfully..");
    window.location.href = "adminMain.html";
  }).catch((error) => {
    alert(error.message);
  })
}

window.onload = function () {

  let updateISBN = localStorage.getItem("updateISBN");

  if (updateISBN) {

    document.getElementById("updateisbn").value = updateISBN;
    document.getElementById("isbn").disabled = true;

  }
}

function lendBook() {

  let isbn = document.getElementById("isbn").value;
  let email = document.getElementById("email").value;
  let date = document.getElementById("lendDate").value;
  let emailKey = email.replaceAll(".", "_");

  if (isbn === "" || email === "" || date === "") {
    alert("Fill All Fields");
    return;
  }

  db.ref("books/" + isbn).once("value", function (bookSnapshot) {

    if (!bookSnapshot.exists()) {
      alert("Book Does Not Exist");
      return;
    }

    let book = bookSnapshot.val();

    if (Number(book.qty) === 0) {
      alert("Book Not Available");
      return;
    }

    db.ref("users/" + emailKey).once("value", function (userSnapshot) {

      if (!userSnapshot.exists()) {
        alert("Member Does Not Exist");
        return;
      }

      let member = userSnapshot.val();

      if (member.lendBooks >= 5) {
        alert(member.name + " has borrowed 5 books. Limit reached");
        return;
      }

      db.ref("lendings/" + emailKey + "-" + isbn).once("value", function (snapshot) {
        if (snapshot.exists()) {
          alert("This Member Already Has Borrowed This Book.");
          return;
        }

        db.ref("users/" + emailKey).update({
          lendBooks: member.lendBooks + 1
        });

        db.ref("books/" + isbn).update({
          qty: Number(book.qty) - 1
        });

        db.ref("lendings/" + emailKey + "-" + isbn).set({
          isbn: isbn,
          email: email,
          lendDate: date,
          returnDate: null,
          status: "Borrowed"
        }).then(() => {
          alert("Book lent successfully");

          document.getElementById("isbn").value = "";
          document.getElementById("email").value = "";
          document.getElementById("lendDate").value = "";
        }).catch((error) => {
          alert(error.message);
        });
      })
    });
  });
}

function returnBook() {
  let isbn = document.getElementById("isbn").value;
  let email = document.getElementById("email").value;
  let date = document.getElementById("returnDate").value;
  let emailKey = email.replaceAll(".", "_");

  if (isbn === "" || email === "" || date === "") {
    alert("Fill All Fields");
    return;
  }


  db.ref("books/" + isbn).once("value", function (booksnapshot) {
    if (!booksnapshot.exists()) {
      alert("Book Does Not Found");
      return;
    }

    let book = booksnapshot.val();

    db.ref("users/" + emailKey).once("value", function (usersnapshot) {
      if (!usersnapshot.exists()) {
        alert("Member Does Not Found");
        return;
      }

      let member = usersnapshot.val();

      db.ref("lendings/" + emailKey + "-" + isbn).once("value", function (lendsnapshot) {
        if (!lendsnapshot.exists()) {
          alert("This Member Has Not Borrowed This Book.");
          return;
        }
        let lendBook = lendsnapshot.val();
        if (lendBook.status === "Returned") {
          alert("Member Has Already Return This Book..");
        }

        db.ref("lendings/" + emailKey + "-" + isbn).update({
          status: "Returned",
          returnDate: date
        });

        alert("Book Returned Successfully..");

        db.ref("users/" + emailKey).update({
          lendBooks: member.lendBooks - 1
        });

        db.ref("books/" + isbn).update({
          qty: book.qty + 1
        });
        document.getElementById("isbn").value = "";
        document.getElementById("email").value = "";
        document.getElementById("returnDate").value = "";
      });
    });
  });
}

function removeMember() {
  let email = document.getElementById("email").value;
  let emailKey = email.replaceAll(".", "_");

  if (email === "") {
    alert("Fill All Fields");
    return;
  }
  db.ref("users/" + emailKey).once("value", function (snapshot) {
    if (!snapshot.exists()) {
      alert("This Member Does Not Found");
      return;
    }

    let member = snapshot.val();

    if (member.lendBooks !== 0) {
      alert("This Member Does Not Return " + member.lendBooks + " Books.Can Not Remove Until Return Books..");
      return;
    }

    db.ref("users/" + emailKey).remove().then(() => {
      alert("Successfully Removed Member..");
    }).catch((error) => {
      alert(error.message)
    })

    document.getElementById("email").value = ""
  })
}

function viewFictionBooks() {
  localStorage.setItem("category", "fiction")
  window.location.href = "viewBooks2.html"
}
function viewNovelBooks() {
  localStorage.setItem("category", "novel")
  window.location.href = "viewBooks2.html"
}
function viewScienceBooks() {
  localStorage.setItem("category", "science")
  window.location.href = "viewBooks2.html"
}
function viewHistoryBooks() {
  localStorage.setItem("category", "history")
  window.location.href = "viewBooks2.html"
}
function viewTechBooks() {
  localStorage.setItem("category", "technology")
  window.location.href = "viewBooks2.html"

}
