localStorage.clear();

var map, infoWindow;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 6
  });
  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.log(pos);
      var userLat = pos.lat;
      var userLon = pos.lng;

      localStorage.setItem("userLat", userLat);
      localStorage.setItem("userLon", userLon);

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
};

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
  'Error: The Geolocation service failed.' :
  'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
};


$(document).ready(function() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAGrEKN1Msn1IQeAs_Ctw4SbM-yX40fGPc",
    authDomain: "findyourjam-2008f.firebaseapp.com",
    databaseURL: "https://findyourjam-2008f.firebaseio.com",
    projectId: "findyourjam-2008f",
    storageBucket: "findyourjam-2008f.appspot.com",
    messagingSenderId: "992674752226"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
  var userRef = firebase.database().ref("users/");

  var userName;
  var email;
  var query;
  var form;

//Validation stuff
  var checkIfUserExists = function(userName) {
    query = database.ref("users/" + userName);
    query.once('value', function(snap) {
      var userExists = (snap.val() !== null);
      userExistsCallback(userName, email, userExists);
    });
  };

  var userExistsCallback = function(userName, email, userExists) {
    if (userExists) {
      console.log(userExists);
      console.log(email);
      checkEmail(userName, email);
    } else {
      bootbox.confirm("User name does not exist.  Would you like to create an account?", function(result) {
        if(result) {
          $("#user-name-sign-in-input").val(userName);
          $("#email-sign-in-input").val(email);
          $("#sign-in-modal").modal();
        }
      });
    }
  };

  var checkEmail = function(userName, email) {
    query = database.ref("users/" + userName);
    query.once('value', function(snap) {
      console.log(snap.val().email);
      console.log(email);
      var correctEmail = (snap.val().email === email);
      console.log(correctEmail);
      checkEmailCallback(userName, email, correctEmail);
    });
  };

  var checkEmailCallback = function(userName, email, correctEmail) {
    if(correctEmail) {

      localStorage.setItem("userName", userName);
      window.location.href = "profile-page.html";
      console.log("valid email");
    } else {
      bootbox.alert("Wrong email for that account");
    }
  };

  //Login Form
  $("#login-form").on('submit', function(e) {
    e.preventDefault();

    email = $("#email-input").val().trim();
    userName = $("#user-name-input").val().trim();

    form = $(this);
    form.parsley().validate();

    if (form.parsley().isValid()) {
      checkIfUserExists(userName);
    }
  });
  

  $("#create-user-btn").on("click", function() {
    $("#sign-in-modal").modal();
  });

  //Self-explanatory
  var createUser = function() {
    $("#sign-in-modal").modal("hide");

    var name = $("#name-input").val().trim();
    var homeCity = $("#home-city-input").val().trim();
    var instrument = $("#instrument-input").val().trim();
    var phone = $("#phone-input").val().trim();
    var genre = $("#genre-input").val().trim();
    var band1 = $("#bands-input1").val().trim();
    var band2 = $("#bands-input2").val().trim();
    var band3 = $("#bands-input3").val().trim();
    var song1 = $("#songs-input1").val().trim();
    var song2 = $("#songs-input2").val().trim();
    var song3 = $("#songs-input3").val().trim();
    var links = $("#links-input").val().trim();
    var aboutYou = $("#about-input").val().trim();

    var newUser = {
      name: name,
      instrument: instrument,
      email: email,
      homeCity: homeCity,
      phone: phone,
      genre: genre,
      band1: band1,
      band2: band2,
      band3: band3,
      song1: song1,
      song2: song2,
      song3: song3,
      links: links,
      aboutYou: aboutYou
    };
  
    userRef.child(userName).set(newUser);

    localStorage.setItem("userName", userName);

    window.location.href = "profile-page.html";

    $("#name-input").val("");
    $("#email-input").val("");
    $("#instrument-input").val("");
    $("#home-city-input").val("");
    $("#phone-input").val("");
    $("#user-name-input").val("");
    $("#genre-input").val("");
    $("#bands-input1").val("");
    $("#bands-input2").val("");
    $("#bands-input3").val("");
    $("#songs-input1").val("");
    $("#songs-input2").val("");
    $("#songs-input3").val("");
    $("#links-input").val("");
    $("#about-input").val(""); 

  };
  
  //Sign-in form
  $("#sign-in-form").on("submit", function(e) {
    e.preventDefault();

    userName = $("#user-name-sign-input").val().trim();
    email = $("#email-sign-input").val().trim();

    var form = $(this);
    form.parsley().validate();

    if (form.parsley().isValid()) {
      createUser();
      localStorage.setItem("userName", userName);  
    } else {
      bootbox.alert("Invalid Form");
    }
  });
});
