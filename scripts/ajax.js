/*
Script: ajax.js
*/

var $url="ajax.php";
var $home="index.php";
var $add="add_player.php";

function checkuser (email) {
	var myAjax = new Ajax ($url, {
            postBody: "action=getuser&email="+email.value,
	    onComplete: handleResponse
	});
	myAjax.request();
}

function handleResponse(responseText, responseXML) {
	
    var email = document.forms[0].email;
    if (responseText == '1') {
		    if (confirm("User with this email already exists.  Would you like to continue with existing information?")) {
			email.removeAttribute("onBlur");
			window.location=$home+"?email="+email.value;
		    } else {
			alert("Ok, please register using a different email address.");
			email.value="";
			email.focus();
		    }
		} else if (responseText == '2') {
		    if (confirm("User with this email already has players registered.  Would you like to register additional players?")) {
			email.removeAttribute("onBlur");
			window.location=$add+"?email="+email.value;
		    } else {
			alert("Ok, please register using a different email address. ");
			email.value="";
			email.focus();
		    }
		}
}


/*
function checkuser (email) {

    var req = new Request(
	{url: $url,
	 method: 'post',
	 onSuccess: function(responseText, responseXML) {
	     if (responseText == '1') {
		 if (confirm("User with this email already exists.  Would you like to continue with existing information?")) {
		     email.removeAttribute("onBlur");
		     window.location=$home+"?email="+email.value;
		 } else {
		     alert("Ok, please register using a different email address.");
		     email.value="";
		     email.focus();
		 }
	     } else if (responseText == '2') {
		 if (confirm("User with this email already has players registered.  Would you like to register additional players?")) {
		     email.removeAttribute("onBlur");
		     window.location=$add+"?email="+email.value;
		 } else {
		     alert("Ok, please register using a different email address. ");
		     email.value="";
		     email.focus();
		 }
	     }
	 },
	});

	req.post("action=getuser&email="+email.value);
}
*/