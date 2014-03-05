var map;
var arrets;
var current_ligne="A";
$(document).ready(function(){
    init_map();
    load_arrets();
    placer_arrets();
});

function load_arrets()
{
    $.ajax({
        dataType: "json",
        url: "data/arrets.json",
        async:false,
        success: function(data) {
            arrets=data;
        }
    })
}
function placer_arrets()
{
    $.each(arrets.lignes, function(i, ligne) {
        $.each(ligne.arrets, function(i, arret) {
            var myLatlng = new google.maps.LatLng(arret.lon, arret.lat);
            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map
            });
        });
        
    });
}
function init_map() 
{
    
    var latlng = new google.maps.LatLng(48.737173, -3.458);
    
    var options = {
        center: latlng,
        zoom: 13,
        streetViewControl: false, 
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    map = new google.maps.Map(document.getElementById("map"), options);
}
