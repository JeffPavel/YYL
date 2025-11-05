function hide() {
    var $userdiv = $("#edit_user");
    $userdiv.hide();
}

function getUserInfo(id) {

    var $userdiv = $("#edit_user");
    $.ajax({
	url: "ajax.php?action=getuserinfo&email="+id
      }).done(function( data ) {
	    if ( console && console.log ) {
		console.log( data );
		if (data == null) {
		    alert("User information not found!");
		} else {
		    build_form(data);
		}
	    }
	});

    $userdiv.show();
}

function getPlayerInfo(id) {

    var $userdiv = $("#edit_user");
    $.ajax({
	url: "ajax.php?action=getplayerinfo&id="+id
      }).done(function( data ) {
	    if ( console && console.log ) {
		console.log( data );
		if (data == null) {
		    alert("User information not found!");
		} else {
		    build_player_form(data);
		}
	    }
	});

    $userdiv.show();
}

function build_player_form(data) {
    var player = JSON.parse(data);

    var userform = "<BR>Id: "+player.id+"<BR><form name=update_player id=update_player>"
    userform += "<input name=pid id=pid type=hidden value="+player.id+">";
    userform += "<BR>Name: <input name=pname id=pname value='"+player.name+"'>";
    userform += "<BR>Age: <input name=page id=page value="+player.age+">";
    userform +="<BR>Grade: <select name=pgrade>";
    for (i = 0; i<9; i++) {
	userform +="<option value="+i;
	if (player.grade==i) {
	    userform+=" selected";
	}
	if (i==0) {
	    userform+="> K \n";
	} else {
	    userform+="> "+i+"\n";
	}
    }
    userform+="</select>";
    var shirts = ["YM(10-12)","YL(14-16)","AS(34-36)","AM(38-40)","AL(42-44)","XL(46-48)"];
    userform +="<BR>Shirt: <select name=pshirt>";
    for (i = 1; i<7; i++) {
	userform +="<option value="+i;
	if (player.shirt==i) {
	    userform+=" selected";
	}
	userform+="> \n"+shirts[i-1];
    }
    userform+="</select>";

    userform += "<BR>School: <input name=pschool id=pschool value='"+player.school+"'>";
    userform += "<BR>Gender: <input name=pgender id=pgender value="+player.gender+">";
    userform += "<BR>New bag: <input name=pnew_bag id=pnew_bag value="+player.new_bag+">";
    userform += "<BR>Returning Player: <input name=preturning_player id=preturning_player value="+player.returning_player+">";
    userform += "<BR><input type=submit name=editplayer>";
    console.log(userform);
    $("#formdata").html(userform);
}

function build_form(data) {
    var user = JSON.parse(data);
    var userform = "<BR>Updating user " + user.id;
    userform += "<BR><form name=update_user id=update_user>Email: <input name=email id=email value=emailvalue> <BR>";
    userform += " Last Name: <input name=last_name id=last_name value=lnvalue><BR>";
    userform += "<input name=userid id=userid type=hidden value="+user.id+">";
    userform += "<input type=submit name=edituser>";
    var arr_from_json = JSON.parse(data);
    userform = userform.replace('emailvalue',arr_from_json.email);
    userform = userform.replace('fnvalue',arr_from_json.first_name);
    userform = userform.replace('lnvalue',arr_from_json.last_name);
    $("#formdata").html(userform);
}
