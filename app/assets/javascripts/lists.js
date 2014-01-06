$(document).ready(function() {
  var lastLocationSearch = "";
  var lastEstablishmentSearch = "";
  setInterval(function() {
    currentLocationSearch = $('#location').val();

    if (currentLocationSearch != lastLocationSearch) {
      lastLocationSearch = currentLocationSearch;
      callGoogle(currentLocationSearch);
      $("#add-establishments").removeAttr("disabled");
      $(".establishment-search-button").removeClass("disabled");
      $(".establishment-search-button").addClass("secondary");
    }
  }, 100);

  $(".save-button").click(function() {
    saveList();
  });

  $(".establishment-search-button").click(function() {
    if (!$(this).hasClass("disabled")) {
      callYelp();
    }
  });

  $("#add-establishments").keyup(function(event){
    if(event.keyCode == 13){
      callYelp();
    }
  });

  $("body").on("click", ".establishment-close", function(e) {
    e.preventDefault();
    $(this).parent().parent().parent().parent().remove()
  });

  $("body").on("click", ".add-review-notes-link", function(e) {
    e.preventDefault();
    $(this).parent().parent().parent().siblings("textarea").toggle();

    if ($(this).text() == "Add optional review notes") {
      $(this).text("Remove note");
    } else {
      $(this).text("Add optional review notes");
      $(this).parent().parent().parent().siblings("textarea").val("");
    }
  });

  $("body").on("click", ".establishment-result", function(e) {
    e.preventDefault();

    var name = $(this).children().children(".result-name").text();
    var yelpId = $(this).attr("data-yelp-id");
    var image = $(this).attr("data-image");
    var establishmentLocation = $(this).attr("data-location");
    var url = $(this).attr("data-url");
    var mobileUrl = $(this).attr("data-mobile-url");

    var ajaxUrl = $(".selected-results-list").attr("data-ajax-url");

    var data = {
      name: name,
      mobile_url: mobileUrl,
      url: url,
      image: image,
      location: establishmentLocation,
      yelp_id: yelpId
    }

    $(this).parent().remove();

    $.ajax({
      url: ajaxUrl,
      method: "get",
      dataType: 'json',
      data: data
    })
    .done(function(data) {
      $(".selected-results-list").append(data.template);
      $("." + yelpId).simpleSlider();
      $("." + yelpId).simpleSlider("setValue", .5)
      $("." + yelpId).siblings(".slider").children(".dragger").text("50");
    })

  });

  var displaySlidersOnEdit = function() {
    var sliders = $(".selected-slider");
    sliders.simpleSlider();

    for (var i = 0; i < sliders.length; i++) {
      var itemScore = $(sliders[i]).attr("data-item-score");
      $(sliders[i]).simpleSlider("setValue", itemScore)
      $(sliders[i]).siblings(".slider").children(".dragger").text(Math.round(itemScore * 100));
    }
  }

  $("body").on("slider:changed", ".selected-slider", function (event, data) {
    $(this).siblings(".slider").children(".dragger").text(Math.round(data.value * 100));
  });

  displaySlidersOnEdit();

  var fieldsFilledInCorrectly = function() {
    $(".error").remove(); // Remove any existing error boxes

    var whatMatters = $("#what-matters-list").children();
    var establishments = $("h4");
    var title = $("#title").val();
    var description = $("#description").val();
    if (whatMatters.length > 0 && establishments.length > 0 && title != "" && description != "") {
      return true
    } else {
      return false
    }
  }

  var addErrorBoxes = function() {
    var whatMatters = $("#what-matters-list").children();
    var establishments = $("h4");
    var title = $("#title").val();
    var description = $("#description").val();
    if (whatMatters.length == 0) {
      $("#what-matters").after("<small class='error'>Please add at least one</small>")
    }
    if (establishments.length == 0) {
      $("#location").after("<small class='error'>Please add at least one</small>")
      $("#add-establishments").after("<small class='error'>Please add at least one (add location first)</small>")
    }
    if (title == "") {
      $("#title").after("<small class='error'>Please create a name for your list</small>")
    }
    if (description == "") {
      $("#description").after("<small class='error'>Please describe your list</small>")
    }
  }

  var saveList = function() {
    if (fieldsFilledInCorrectly()) {
      saveLoader("on");

      var whatMatters = $("#what-matters-list").children();
      var whatMattersList = [];
      for (var i = 0; i < whatMatters.length; i++) {
        whatMattersList.push($(whatMatters[i]).attr("data-tag"));
      }

      // var notImportant = $("#not-important-list").children();
      // var notImportantList = [];
      // for (var i = 0; i < notImportant.length; i++) {
      //   notImportantList.push($(notImportant[i]).attr("data-tag"));
      // }

      var establishments = $("h4");
      var establishmentsList = [];
      for (var i = 0; i < establishments.length; i++) {
        establishmentsList.push(
          {
            name: $(establishments[i]).text(),
            image: $(establishments[i]).attr("data-image"),
            location: $(establishments[i]).attr("data-location"),
            url: $(establishments[i]).attr("data-url"),
            mobile_url: $(establishments[i]).attr("data-mobile-url"),
            score: $(establishments[i]).parent().parent().siblings(".slider").children(".dragger").text()
          }
        )
      }

      var notes = $(".notes");
      var notesList = [];
      for (var i = 0; i < notes.length; i++) {
        notesList.push(
          {
            content: $(notes[i]).val(),
            item: $(notes[i]).attr("data-item-name")
          }
        )
      }

      var method = $(".data-method").attr("data-type");

      $.ajax({
        'url': $("form").attr("action"),
        'method': method,
        'dataType': 'json',
        'data': {
          title: $("#title").val(),
          description: $("#description").val(),
          matters: whatMattersList,
          // notImportant: notImportantList,
          establishments: establishmentsList,
          notes: notesList
        }
      })
      .done(function(data) {
        window.location = data.path;
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        saveLoader("off");
      })
    } else {
      addErrorBoxes();
    }
  }

  var callGoogle = function(term) {
    var callGoogleUrl = $("#location").attr("data-url");
    $.ajax({
      'url': callGoogleUrl,
      'dataType': 'json',
      'data': { term: term }
    })
    .done(function(data) {
      raw_cities = data.results.predictions;
      var cities = [];
      for (var i = 0; i < raw_cities.length; i++) {
        cities.push(raw_cities[i].description);
      }
      $('#location').autocomplete({
        source: cities
      });
    });
  }

  var searchLoader = function(status) {
    if (status == "on") {
      $(".establishment-search-button").text("Searching");
      $(".establishment-search-button").addClass("disabled");
      $(".establishment-search-button").removeClass("secondary");
    } else {
      $(".establishment-search-button").text("Search");
      $(".establishment-search-button").removeClass("disabled");
      $(".establishment-search-button").addClass("secondary");
    }
    $(".result-search-loader").toggle();
  }

  var saveLoader = function(status) {
    if (status == "on") {
      $(".save-button").text("Saving");
      $(".save-button").addClass("disabled");
    } else {
      $(".save-button").text("Save");
      $(".save-button").removeClass("disabled");
    }
    $(".save-loader").toggle();
  }

  var callYelp = function() {
    searchLoader("on");

    var auth = null;
    var term = $('#add-establishments').val();
    var authDetailsUrl = $("#add-establishments").attr("data-url");
    var searchLocation = $("#location").val();

    $.ajax({
      url: authDetailsUrl,
      method: "get",
      dataType: "json"
    })
    .done(function(data) {
      auth = data.auth;
      var accessor = {
        consumerSecret: auth.consumerSecret,
        tokenSecret: auth.accessTokenSecret
      };

      parameters = [];
      parameters.push(['term', term]);
      parameters.push(['location', searchLocation]);
      parameters.push(['callback', 'cb']);
      parameters.push(['oauth_consumer_key', auth.consumerKey]);
      parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
      parameters.push(['oauth_token', auth.accessToken]);
      parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

      var message = { 
        'action': 'http://api.yelp.com/v2/search',
        'method': 'GET',
        'parameters': parameters 
      };

      OAuth.setTimestampAndNonce(message);
      OAuth.SignatureMethod.sign(message, accessor);

      var parameterMap = OAuth.getParameterMap(message.parameters);
      parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)

      $.ajax({
        'url': message.action,
        'data': parameterMap,
        'cache': true,
        'dataType': 'jsonp',
        'jsonpCallback': 'cb',
        timeout: 3000,
        error: function(xhr, status, err){ 
          $(".search-results-list").append("<li>Hm... this is taking too long.  Are you searching in a country that <a href='http://officialblog.yelp.com/'>Yelp doesn't exist in</a>?</li>");
          searchLoader("off");
        }
      })
      .done(function(data) {
        $(".search-results-list li").remove(); // Removes all the li items
        var raw_establishments = data.businesses;

        if (raw_establishments.length > 0) {
          $(".search-results-list").append("<li>Select from below (results from Yelp):</li>");
          var ajaxUrl = $(".search-results-list").attr("data-ajax-url");

          for (var i = 0; i < Math.min(raw_establishments.length, 5); i++) {
            var data = {
              name: raw_establishments[i].name,
              mobile_url: raw_establishments[i].mobile_url,
              url: raw_establishments[i].url,
              image: raw_establishments[i].image_url,
              location: raw_establishments[i].location.address[0],
              full_location: raw_establishments[i].location.display_address.join(", "),
              yelp_id: raw_establishments[i].id
            }

            $.ajax({
              url: ajaxUrl,
              method: "get",
              dataType: 'json',
              data: data
            })
            .done(function(data) {
              $(".search-results-list").append(data.template);
            })
          }
        } else {
          $(".search-results-list").append("<li>No results - please try another search</li>");
        }
        searchLoader("off");
      })
    });
  }
});