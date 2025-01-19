function getCleanStatus(){
  //get all .anonymized-in-progress achor tags data-id
  var ids = [];
  $(".anonymized-in-progress").each(function(){
      ids.push($(this).attr('data-id'));
  });
  //send ajax request to get clean status
  $.ajax({
      url: '/get_anonymize_status/',
      type: 'GET',
      data: { 'ids': ids },
      success: function(response) {
          //response is like this {'id': 'status', 'id': 'status'}
          for (const [key, value] of Object.entries(response)) {
              if(value == true){
                  $(`.anonymized-in-progress[data-id=${key}]`).text("Yes").removeClass("anonymized-in-progress").removeClass("btn-warning").addClass("btn-success");
              }else if(value == false){
                  $(`.anonymized-in-progress[data-id=${key}]`).text("No").removeClass("anonymized-in-progress").addClass("btn-danger");
              }
          }
      },
      error: function(error) {
          console.log(error);
      }
  });
}
