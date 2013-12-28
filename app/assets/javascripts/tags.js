$(document).ready(function() {
  var tags = null;
  var tagsUrl = $("#what-matters").attr("data-url");

  $("body").on("click", ".tag-close", function(e) {
    e.preventDefault();
    $(this).parent().parent().remove();
  });

  $.ajax({
    url: tagsUrl,
    method: "get",
    dataType: "json"
  })
  .done(function(data) {
    tags = data.tags;
    $("#what-matters").autocomplete({
      source: tags,
      select: function(event, ui) {
        appendTag($(this).val(), ui);
        $(this).val('');
        return false;
      }
    });
    // $("#not-important").autocomplete({
    //   source: tags,
    //   select: function(event, ui) {
    //     appendTag($(this), ui);
    //     $(this).val('');
    //     return false;
    //   }
    // });
  });

  $("#what-matters").keyup(function(event){
    var newTag = $("#what-matters").val();
    if(event.keyCode == 13 && newTag != ""){
      addNewTag();
    }
  });

  $("body").on("focusout", "#what-matters", function(event){
    var newTag = $("#what-matters").val();
    if(newTag != ""){
      addNewTag();
    }
  });

  var appendTag = function(input) {
    // if (input.attr("id") == "what-matters") {
    $("#what-matters-list").append("<li data-tag='" + input + "'><span class='label secondary'>" + input + "<a href='#' class='tag-close' style='margin-left: 5px; color: black;'>&times;</a></span></li>");
    // } else {
      // $("#not-important-list").append("<li data-tag='" + tag.item.label + "'><span class='label secondary'>" + tag.item.label + "<a href='#' class='tag-close' style='margin-left: 5px; color: black;'>&times;</a></span></li>");
    // }
  }

  var addNewTag = function() {
    var newTag = $("#what-matters").val();
    appendTag(newTag);
    $("#what-matters").val("");
  }
});