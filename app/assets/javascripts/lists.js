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
    callYelp();
  });

  $("#add-establishments").keyup(function(event){
    if(event.keyCode == 13){
      callYelp();
    }
  });

  var saveList = function() {
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
          score: $(establishments[i]).siblings(".slider").children(".dragger").text()
        }
      )
    }

    $.ajax({
      'url': $("form").attr("action"),
      'method': 'post',
      'dataType': 'json',
      'data': {
        title: $("#title").val(),
        description: $("#description").val(),
        matters: whatMattersList,
        // notImportant: notImportantList,
        establishments: establishmentsList
      }
    })
    .done(function(data) {
      window.location = data.path;
    })
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

  var callYelp = function() {
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
        'success': function(data, textStats, XMLHttpRequest) {
          $(".search-results-list li").remove(); // Removes all the li items
          raw_establishments = data.businesses;
          var establishments = [];
          for (var i = 0; i < Math.min(raw_establishments.length, 5); i++) {
            establishments.push(raw_establishments[i].name);
            var str = "<li><a href='#' class='establishment-result' data-mobile-url='" + raw_establishments[i].mobile_url
            str += "' data-url='" + raw_establishments[i].url
            str += "' data-image='" + raw_establishments[i].image_url
            str += "' data-location='" + searchLocation
            str += "' data-yelp-id='" + raw_establishments[i].id
            str += "'>" + raw_establishments[i].name + "</a></li>"

            $(".search-results-list").append(str);
          }
          $(".establishment-result").click(function(e) {
            e.preventDefault();

            var yelpId = $(this).attr("data-yelp-id");
            var image = $(this).attr("data-image");
            var establishmentLocation = $(this).attr("data-location");
            var url = $(this).attr("data-url");
            var mobileUrl = $(this).attr("data-mobile-url");

            var str = "<li><h4 data-mobile-url='" + mobileUrl
            str += "' data-url='" + url
            str += "' data-location='" + establishmentLocation
            str += "' data-image='" + image
            str += "' >" + $(this).text()
            str += "<a href='#' class='establishment-close' style='margin-left: 5px; color: black;'>&times;</a></h4>"
            str += "<div class='add-review-notes'><a href='#' class='add-review-notes-link'>Add optional review notes</a></div>"
            str += "<textarea class='hide' placeholder='Why did you rank this place the way you did?' data-item-name='" + $(this).text()
            str += "'></textarea>"
            str += "<input class='selected-slider "
            str += yelpId + "'></input></li>"

            $(".selected-results-list").append(str);
            $("." + yelpId).simpleSlider();
            $("." + yelpId).simpleSlider("setValue", .5)
            $("." + yelpId).siblings(".slider").children(".dragger").text("50");

            $(".establishment-close").click(function(e) {
              e.preventDefault();
              $(this).parent().parent().remove()
            });

            $(".add-review-notes-link").click(function(e) {
              e.preventDefault()
              $(this).parent().siblings("textarea").toggle();
              if ($(this).text() == "Add optional review notes") {
                $(this).text("Remove note");
              } else {
                $(this).text("Add optional review notes");
                $(this).parent().siblings("textarea").val("");
              }
            });

            $(this).parent().remove();


            $(".selected-slider").bind("slider:changed", function (event, data) {
              // console.log(data.value);
              $(this).siblings(".slider").children(".dragger").text(Math.ceil(data.value * 100));
            });
          });
        }
      });
    });
  }
});