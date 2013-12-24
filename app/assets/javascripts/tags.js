$(document).ready(function() {
  var tags = null;
  var tagsUrl = $("#what-matters").attr("data-url");

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
        appendTag($(this), ui);
        $(this).val('');
        return false;
      }
    });
    $("#not-important").autocomplete({
      source: tags,
      select: function(event, ui) {
        appendTag($(this), ui);
        $(this).val('');
        return false;
      }
    });
  });

  var appendTag = function(input, tag) {
    if (input.attr("id") == "what-matters") {
      $("#what-matters-list").append("<li><span class='label secondary'>" + tag.item.label + "<a href='#' class='tag-close' style='margin-left: 5px; color: black;'>&times;</a></span></li>");
    } else {
      $("#not-important-list").append("<li><span class='label secondary'>" + tag.item.label + "<a href='#' class='tag-close' style='margin-left: 5px; color: black;'>&times;</a></span></li>");
    }
    $(".tag-close").click(function(e) {
      e.preventDefault();
      $(this).parent().parent().remove();
    });
  }
});