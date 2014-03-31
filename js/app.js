var map;
var arrets;
var horaires;
var vacances;
var current_ligne="A";
var current_location = new google.maps.LatLng(48.737173, -3.458);
var marker_image = new Array();
var current_horaire_id ="";
var current_arret="";
marker_image['A'] = new google.maps.MarkerImage("img/marker3.png");
marker_image['B'] = new google.maps.MarkerImage("img/marker1.png");
marker_image['C'] = new google.maps.MarkerImage("img/marker4.png");
marker_image['Marché'] = new google.maps.MarkerImage("img/marker5.png");


var blue_marker = new google.maps.MarkerImage("img/marker2.png");
var pink_marker = new google.maps.MarkerImage("img/marker6.png");



$(document).ready(function(){
    //me_localiser();
    init_map();
    load_arrets();
    load_horaires();
    load_vacances();
    placer_arrets();
    arrets_proches();
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
function load_horaires()
{
    $.ajax({
        dataType: "json",
        url: "data/horaires.json",
        async:false,
        success: function(data) {
            horaires=data;
        }
    })
}
function load_vacances()
{
    $.ajax({
        dataType: "json",
        url: "data/vacances.json",
        async:false,
        success: function(data) {
            vacances=data;
        }
    })
}
function change_ligne(nom_ligne)
{
    current_ligne=nom_ligne;
    init_map();
    placer_arrets();
    
}
function placer_arrets()
{
    var tableau_arret = [];
    
    $.each(arrets.lignes, function(i, ligne) {
        if(current_ligne==ligne.ligne){
            $.each(ligne.arrets, function(i, arret) {
                
                tableau_arret2 = $.grep(tableau_arret, function(el,ind) {
                    return (el == arret.arret);// dans le tableau_arret on regarde si il existe déjà un des arret 
                });
                if(tableau_arret2.length == 0 )// si il n'y a aucunes corespondance, on affiche le point
                {
                    var myLatlng = new google.maps.LatLng(arret.lon, arret.lat);
                    
                    tableau_arret.push(arret.arret);
                    
                    var marker = new MarkerWithLabel({
                        position: myLatlng,
                        draggable: false,
                        raiseOnDrag: true,
                        map: map,
                        labelContent: arret.arret,
                        labelClass: "map-labels", // the CSS class for the label
                        icon: marker_image[current_ligne]
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                        $.mobile.changePage( "#horaires", { transition: "slide", direction: "left" });
                        
                        affiche_horaires(marker.labelContent);
                    });
                }
            });
        }
    });
    arrets_proches();
}
function init_map() 
{
    var options = {
        center: current_location,
        zoom: 13,
        streetViewControl: false, 
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    
    map = new google.maps.Map(document.getElementById("map"), options);
    
    var marker = new google.maps.Marker({
        position: current_location,
        icon: blue_marker,
        map: map
    });
}
function me_localiser()
{
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Votre systeme ne suporte actuellement pas la localisation");
    }
}

function success(position) {
    // variable to store the coordinates
    current_location = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
    init_map();
    load_arrets();
    placer_arrets();
    var marker = new google.maps.MarkerWithLabel({
        position: current_location,
        icon: blue_marker,
        map: map
    });
    arrets_proches();
}

function error(msg) {
    // select the span with id status
    alert("Actuellement, votre systeme ne supporte pas la localisation");
}
function arrets_proches()
{
    var tableau_arret = new Array();
    
    $.each(arrets.lignes, function(i, ligne) {
        $.each(ligne.arrets, function(i, arret) {
            tableau_arret2 = $.grep(tableau_arret, function(el,ind) {
                return (el.arret == arret.arret);// dans le tableau_arret on regarde si il existe déjà un des arret 
            });
            if(tableau_arret2.length == 0 )// si il n'y a aucunes corespondance, on affiche le point
            {
                var temp = new Array();
                temp['arret']=arret.arret;
                temp['distance']=getDistanceFromLatLonInKm(arret.lon,arret.lat,current_location.lat(),current_location.lng());
                tableau_arret.push(temp);
                
            }
            
        });
    });
    tableau_arret.sort(function(a,b) {
        // assuming distance is always a valid integer
        return a.distance - b.distance;
    });
    $('#liste_arrets_proches').empty();
    for(var i=0; i<=10; i++)
    {
        
        $('#liste_arrets_proches').append('<li><a href="#horaires" onclick="affiche_horaires(\''+tableau_arret[i].arret+'\');" data-transition="slide" >' + tableau_arret[i].arret + ' <span class="ui-li-count ui-body-a">'+tableau_arret[i].distance.toFixed(2)+' km</span></a></li>').listview('refresh');
        
    }
}
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) 
{
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    
    return d;
}

function deg2rad(deg) 
{
    return deg * (Math.PI/180)
}

function affiche_horaires(arret)
{
    current_arret=arret;
    var tableau_horaires = new Array();
    var show_horaire = false;
    $.each(horaires.horaires, function(i, horaires_item) 
           {
               $.each(horaires_item.tournees, function(i, tournees) 
                      {
                          $.each(tournees.horaires, function(i, horaire) 
                                 {  
                                     if(horaire.arret==arret)
                                     {
                                         var tableau_horaire = new Array();
                                         tableau_horaire['horaire']=horaire.horaire;
                                         tableau_horaire['to']=horaires_item.to;
                                         tableau_horaire['ligne']=horaires_item.ligne;
                                         tableau_horaire['velo']=tournees.velo;
                                         tableau_horaire['id']=horaire.id;
                                         
                                         var d=new Date();
                                         var weekday=new Array(7);
                                         weekday[0]=horaires_item.sunday ;
                                         weekday[1]=horaires_item.monday;
                                         weekday[2]=horaires_item.Tuesday ;
                                         weekday[3]=horaires_item.wednesday ;
                                         weekday[4]=horaires_item.thursday ;
                                         weekday[5]=horaires_item.friday ;
                                         weekday[6]=horaires_item.saturday ;
                                         
                                         var n = d.getDay();
                                         
                                         if(weekday[n]==1)
                                         {
                                             show_horaire = true;
                                         }
                                         //Si la ligne ne passe que pendant les vacances
                                         if(horaires_item.type=="vacances" && check_vacances() && show_horaire && !isFerie())
                                         {
                                             tableau_horaires.push(tableau_horaire);
                                         }
                                         //Si la ligne ne passe que en période scolaire
                                         if(horaires_item.type=="scolaire" && !check_vacances() && show_horaire && !isFerie())
                                         {
                                             tableau_horaires.push(tableau_horaire);
                                         }
                                         //Si la ligne passe tout le temps
                                         if(horaires_item.type=="normal" && show_horaire && !isFerie())
                                         {
                                             tableau_horaires.push(tableau_horaire);
                                         }
                                     }
                                     
                                 });
                          
                      });
           });
    $('#liste_horaires').empty();
    if(tableau_horaires.length!=0)
    {
        tableau_horaires.sort(function(a,b){return a['horaire']-b['horaire']});
        $('#liste_horaires').empty();
        $('#liste_horaires').append('<p style="text-align:center;">'+arret+'</p>').listview('refresh');
        $.each(tableau_horaires, function(i, item)
               {
                   if(item['horaire'].toString().length==3)
                   {
                       var horaire_string = "0"+item['horaire'].toString().substring(0,1)+"h"+item['horaire'].toString().substring(1,3);
                   }
                   else
                   {
                       var horaire_string = item['horaire'].toString().substring(0,2)+"h"+item['horaire'].toString().substring(2,4);
                   }
                   if(item['velo']==true)
                   {
                       var velo_class='class="ui-btn-icon-right ui-icon-myicon velo-icon"';
                       
                   }
                   $('#liste_horaires').append('<li><a href="#sms" onclick="sms_page();" data-index="'+item['id']+'" data-transition="slide">\
<img class="icon-menu" src="img/bus.png">\
<h2>'+horaire_string+'</h2>\
<p>Direction <b>'+item['to']+'</b></p></a>\
<span class="ui-li-count">Ligne '+item['ligne']+'</span>\
<span '+velo_class+'></span></a>\
</li>').listview('refresh');
                   current_horaire_id=item['id'];
               });
    }
    else
    {
        $('#liste_horaires').empty();
        $('#liste_horaires').append('<p style="text-align:center;">'+arret+'</p>').listview('refresh');
        $('#liste_horaires').append('<h3 style="text-align:center;">Aucun bus ne passe aujourd\'hui à cet arrêt</h3>').listview('refresh');
    }
}

function check_vacances(){
    var is_vacances = false;
    new Date().getTime();
    var time = Date.now()/1000;
    time=Math.floor(time);
    $.each(vacances.hollidays, function(i, item)
           {
               if(item.start>=time && time<=item.end)
               {
                   is_vacances = true;
               }
           });
    return is_vacances;
}

function isFerie()
{
    var an = new Date().getFullYear();
    var ferie = false;
    var JourAn = new Date(an, "00", "01")
    var FeteTravail = new Date(an, "04", "01")
    var Victoire1945 = new Date(an, "04", "08")
    var FeteNationale = new Date(an,"06", "14")
    var Assomption = new Date(an, "07", "15")
    var Toussaint = new Date(an, "10", "01")
    var Armistice = new Date(an, "10", "11")
    var Noel = new Date(an, "11", "25")
    
    var G = an%19
    var C = Math.floor(an/100)
    var H = (C - Math.floor(C/4) - Math.floor((8*C+13)/25) + 19*G + 15)%30
    var I = H - Math.floor(H/28)*(1 - Math.floor(H/28)*Math.floor(29/(H + 1))*Math.floor((21 - G)/11))
    var J = (an*1 + Math.floor(an/4) + I + 2 - C + Math.floor(C/4))%7
    var L = I - J
    var MoisPaques = 3 + Math.floor((L + 40)/44)
    var JourPaques = L + 28 - 31*Math.floor(MoisPaques/4)
    var Paques = new Date(an, MoisPaques-1, JourPaques)
    var LundiPaques = new Date(an, MoisPaques-1, JourPaques+1)
    var Ascension = new Date(an, MoisPaques-1, JourPaques+39)
    var Pentecote = new Date(an, MoisPaques-1, JourPaques+49)
    var LundiPentecote = new Date(an, MoisPaques-1, JourPaques+50)
    
    
    var jours_feries =  new Array(JourAn, Paques, LundiPaques, FeteTravail, Victoire1945, Ascension, Pentecote, LundiPentecote, FeteNationale, Assomption, Toussaint, Armistice, Noel);
    
    $.each(jours_feries, function(i, jour)
           {
               
               if(Math.floor(jour.getTime()/1000/60/60/24) == Math.floor(new Date().getTime()/1000/60/60/24))
               {
                   ferie=true;
               }
               
           });
    
    
    return ferie;
}

function sms_page()
{
    $('#select-choice-1').append('<option value="1">1 minute</option>');
    for(var i=2;i<60; i++)
    {
        $('#select-choice-1').append('<option value="'+i+'">'+i+' minutes</option>');
    }
    
}
function receive_sms()
{
    var num = document.getElementById("tel-1").value;
    var temp = $( "#select-choice-1" ).val();
    if(num.length==10 &&(num.toString().substring(0,2)=="06"||num.toString().substring(0,2)=="07"))
    {
        $.ajax({
            dataType: "html",
            url: "http://projects.emerginov.org/LannionBus/abonnement.php?numero="+num+"&id="+current_horaire_id+"&minutes="+temp+"",
            async:false,
            success: function(data) {
                if(data=="ok")
                {
                    $('#popupBasic2').popup("open");
                    setTimeout(function() {
                        window.location = "#horaires";
                        affiche_horaires(current_arret);
                    }, 2000);                    
                }
            }
        })
    }else
    {
        $('#popupBasic').popup("open");
    }
}
function return_horaires()
{
    window.location = "#horaires";
    affiche_horaires(current_arret);
}


