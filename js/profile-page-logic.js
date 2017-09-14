
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
  var eventsRef = database.ref("events/");

  var userName;
  var title;
  var street;
  var city;
  var state;
  var zipcode;
  var date;
  var time;
  var location;
  var description;
  var link;

  var eventLon;
  var eventLat;

  var keyArray = [];
  var distArray = [];
  var sorted;

  var displayInstrument = function(instrument) {
    var URL = "http://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC&q=" + instrument + "&limit=1";
    $.ajax({
        url: URL,
        method: 'GET'
       }).done(function(response) {
           console.log(response.data[0].images.fixed_height_small.url);
           var imageURL = response.data[0].images.fixed_height_small.url;
           $("#instrument-image1").append("<img src='" + response.data[0].images.fixed_height_small.url + "'>");
           console.log("<img src='" + response.data[0].images.fixed_height_small.url + "'>");
       });  
  };
  

  var loadProfile = function() {
    userName = localStorage.getItem("userName");
    console.log(userName);
    query = database.ref("users/" + userName);
    query.once("value").then(function(snapshot) { 
      console.log(snapshot.val); 
      $("#name-profile").text(snapshot.val().name);
      $("#genre-profile").text(snapshot.val().genre);
      $("#instrument-profile").text(snapshot.val().instrument);
      $("#homeCity-profile").text(snapshot.val().homeCity);
      $("#aboutYou-profile").text(snapshot.val().aboutYou);
      $("#links-profile").text(snapshot.val().links);
      $("#song1-profile").text(snapshot.val().song1);
      $("#song2-profile").text(snapshot.val().song2);
      $("#song3-profile").text(snapshot.val().song3);
      $("#band1-profile").text(snapshot.val().band1);
      $("#band2-profile").text(snapshot.val().band2);
      $("#band3-profile").text(snapshot.val().band3);
      displayInstrument(snapshot.val().instrument);
    });
    
  };

  loadProfile();

  var addNewEvent = function() {
    console.log("hi");

    var newEvent = {
      title: title,
      street: street,
      city: city,
      state: state,
      zipcode: zipcode,
      date: date,
      time: time,
      eventLon: eventLon,
      eventLat: eventLat,
      description: description,
      link: link
    };

    eventsRef.push(newEvent);

    console.log(newEvent);

    $("#title-input").val("");
    $("#street-input").val("");
    $("#city-input").val("");
    $("#state-input").val("");
    $("#zip-input").val("");
    $("#date-input").val("");
    $("#time-input").val("");
    $("#description-input").val("");
    $("#link-input").val("");

    bootbox.alert("Event successfully added");
  };

  var coordinates = function(street, city, state, zipcode) {
    var replaceAddress = street.split(" ").join("+");
    var address = replaceAddress + "+" + city + "+" + state + "+" + zipcode;
    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyAGrEKN1Msn1IQeAs_Ctw4SbM-yX40fGPc";
   
   $.ajax({
        url: queryURL,
        method: "GET"
      }).done(function(response) {
        console.log(response);
        //distArray.push(response.rows[0].elements[0].distance.value);
        eventLon = response.results[0].geometry.location.lng;
        eventLat = response.results[0].geometry.location.lat;
        console.log(eventLat);
        console.log(eventLon);
        addEvent();
      }).fail(function() {
        bootbox.alert("Invalid address");
      })
  };

  $("#event-modal-btn").on("click", function() {
    $("#create-event-modal").modal();
  });

  $("#event-form").on("submit", function(e) {
    e.preventDefault();

    var form = $(this);
    form.parsley().validate();

    if (form.parsley().isValid()) {
      bootbox.confirm("Are you sure you want to create this event?", function(result) {
        if(result) {
          title = $("#title-input").val().trim();
          street = $("#street-input").val().trim();
          city = $("#city-input").val().trim();
          state = $("#state-input").val().trim();
          zipcode = $("#zip-input").val().trim();
          date = $("#date-input").val().trim();
          time = $("#time-input").val().trim();
          description = $("#description-input").val().trim();
          link = $("#link-input").val().trim();
          coordinates(street, city, state, zipcode);
          addNewEvent();
        }
      });  
    } 

  });

  var findDistance = function() {
    eventsRef.once("value").then(function(snapshot) {
      //console.log(snapshot);
      snapshot.forEach(function(childSnapshot) {

        var key = childSnapshot.key;
        var eventLon = childSnapshot.val().eventLon;
        var eventLat = childSnapshot.val().eventLat;
        var userLon = localStorage.getItem("userLon");
        var userLat = localStorage.getItem("userLat");

        var eventDistance = distance(userLon, userLat ,eventLon, eventLat); 
              
        keyArray.push(key);

      });

    });
  };

  findDistance();

//display events from firebase db
  var addEvent = function(key, event, date, description, street, city, state, zipcode, link) {
    $("#event").append("<div class='row event-medium-container' id='event-container" + key + "'><div class='col-xs-12'><h3 class='event-medium-title' id='event-title" + key + "'>" + event + "</h3></div><div class='col-xs-2'></div><div class='col-xs-8'><p class='event-medium-description' id='event-description" + key + "'>Description: " + description + "</p><p class='event-medium-date' id='event-date" + key + "'>Date: " + date + "</p><br><p class='event-medium-location' id='event-location" + key + "'>Location: " + street + ", " + city + ", " + state + " " + zipcode + "</p><br><a href='" + link + "' class='event-medium-link' id='event-link" + key + "'>Check Us Out</a></div></div>");

    $("#event-container" + key).attr("key", key);

  };

  var loadSortedEvents = function() {
    for (var i = 0; i < keyArray.length; i++) {
      query = database.ref("events/" + keyArray[i]);
      query.once("value").then(function(snapshot) {

        var event = snapshot.val().title;
        var street = snapshot.val().street;
        var city = snapshot.val().city;
        var state = snapshot.val().state;
        var zipcode = snapshot.val().zipcode;
        var date = snapshot.val().date;
        var description = snapshot.val().description;
        var link = snapshot.val().link;
        var user = snapshot.val().user;

        addEvent(keyArray[i], event, date, description, street, city, state, zipcode, link);

      });
    }
  };

  $(document.body).on("click", ".event-medium-container", function() {
      var event = $(this).attr("key");
      localStorage.setItem("eventKey", event);
      //window.location.href to push the page or reload html?
      console.log("You clicked on event: " + event);
  });

  var distance = function(userLon, userLat, eventLon, eventLat) {
    var queryURL = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + userLat + "," + userLon + "&destinations=" + eventLat + "," + eventLon + "&key=AIzaSyAGrEKN1Msn1IQeAs_Ctw4SbM-yX40fGPc";

    $.ajax({
        url: queryURL,
        method: "GET"
      }).done(function(response) {
        console.log(response);
        distArray.push(response.rows[0].elements[0].distance.value);
    });
  };

  var bubbleSort = function(distArr, keyArr) {

    var end = distArr.length - 1;
    sorted = true;
    for (var i = 0; i < end; i++) {
      if (distArr[i] > distArr[i + 1]) {
        var tempDist = distArr[i];
        distArr[i] = distArr[i + 1];
        distArr[i + 1] = tempDist;
        var tempKey = keyArr[i];
        keyArr[i] = keyArr[i + 1];
        keyArr[i + 1] = tempKey;
        sorted = false;
        console.log("Distance Array: " + distArray);
        console.log("Key Array: " + keyArray);
      }
    }
  };

  var bubbleCall = function() {
    do {
      bubbleSort(distArray, keyArray);
    } while (!sorted);
  }

  setTimeout(bubbleCall, 1000 * 4);
  setTimeout(loadSortedEvents, 1000 * 5);

});