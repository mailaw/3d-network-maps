
var data;



function readEntityData(results){
  data = results['data'];
  for (let index = 0; index < data.length; index++) {
    var entity_row = data[index];
  }

}


function handleFileSelect(evt) {
  var file = evt.target.files[0];

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: readEntityData
  });


}

$(document).ready(function(){
  $("#csv-file").change(handleFileSelect);
});
