var xmlResponse;


$(document).ready(function () {

    $("#headerTitle").hide(300).show(1500);
    $('#fetch_data').click(function(){ // Fetching xmnl file
        fetchData();
    });

    $('#search_field').keyup(
            filterValues
    );

});



function fetchData() {
    $.ajax({
        type: "GET",
        url: "./example.xml", //TODO exchange pass of .xml
        dataType: "xml",
        error: function (e) {
            alert("An error occurred while processing XML file");
            console.log("XML reading Failed: ", e);
        },
        success: function (response) {
            displayData(response);
        }
    });      
};

function displayData(xmlResponse) {

    console.log(xmlResponse);
    var itemsArray = $(xmlResponse).find("Catalog").children();
    var elementCounter = itemsArray.length;
    console.log(itemsArray);
    var table = $('table tbody');
    table.empty();
    var htmlTable = '';

    for(var i = 0; i < elementCounter; i++) {
        var itemParam = itemsArray[i].children;
        htmlTable += '<tr><td>' + itemParam[9].innerHTML + '</td><td>' 
        + itemParam[8].innerHTML + '</td><td>' + itemParam[10].innerHTML 
        + '</td><td>' + itemParam[5].innerHTML + '</td><td>'
         + itemParam[6].innerHTML + '</td>'
    };
    console.log(htmlTable);
    table.append(htmlTable);
};


function filterValues() {
    // Declare variables 
    var input = $('#search_field');
    var tr = $('tbody tr');
    
    filter = input[0].value.toUpperCase();
    console.log(filter);

    for (i = 0; i < tr.length; i++) {
        itemName = tr[i].getElementsByTagName("td")[0]; //Fetching Name element of a table
        if (itemName) {
            txtValue = itemName.textContent || itemName.innerText || itemName.innerHTML;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        } 
    }
};




