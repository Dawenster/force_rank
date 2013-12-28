$(document).ready(function() {
  $("body").on("click", ".read-more", function(e) {
    e.preventDefault();
    var fullContent = $(this).attr("data-full-description");
    $(this).parent().text(fullContent);
  });
});