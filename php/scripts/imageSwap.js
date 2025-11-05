function getGradeSelect(player_num) {
    var g = 'psex'+player_num;
    var genderEl = document.getElementById(g);
    // alert ("index="+index);
    var d = document.getElementById('divinfo');
    var text = d.innerHTML;
    var arr = text.split('\n');
    var index = genderEl.selectedIndex;
    var val = genderEl.options[index].value;

    var ibarr = arr[0].split(' ');
    var ibstatus = ibarr[3];

    if (!arr[1]) {
	//stupid ie does not split on new line
	var igstatus=ibarr[7];
	var jbstatus=ibarr[11];
	var jgstatus=ibarr[15];
	var sbstatus=ibarr[19];
	var sgstatus=ibarr[23];
	var kstatus=ibarr[26];
    } else {
	var igarr = arr[1].split(' ');
	var igstatus = igarr[3];

	var jbarr = arr[2].split(' ');
	var jbstatus = jbarr[3];
	var jgarr = arr[3].split(' ');
	var jgstatus = jgarr[3];

	var sbarr = arr[4].split(' ');
	var sbstatus = sbarr[3];
	var sgarr = arr[5].split(' ');
	var sgstatus = sgarr[3];
	var karr = arr[6].split(' ');
	var kstatus = karr[2];
    }

    var gp1 = document.forms[0].pgrade1;
    var gp2 = document.forms[0].pgrade2;
    var gp3 = document.forms[0].pgrade3;
    var gp4 = document.forms[0].pgrade4;
    var gp1index = gp1.selectedIndex;
    var gp2index = gp2.selectedIndex;
    var gp3index = gp3.selectedIndex;
    var gp4index = gp4.selectedIndex;


    if (player_num==1) {
	actionElement = gp1;
    }
    if (player_num==2) {
	actionElement = gp2;
    }
    if (player_num==3) {
	actionElement = gp3;
    }
    if (player_num==4) {
	actionElement = gp4;
    }

    clearOptions(actionElement);

    if (kstatus == 'open') {
	actionElement.options[actionElement.options.length] = new Option('K', '13');
    }
    if ((val=='M' && ibstatus == 'open') || (val=='F' && igstatus=='open')) {
	actionElement.options[actionElement.options.length] = new Option('1', '1');
    }
    if ((val=='M' && jbstatus == 'open') || (val=='F' && jgstatus=='open')) {
	actionElement.options[actionElement.options.length] = new Option('2', '2');
	actionElement.options[actionElement.options.length] = new Option('3', '3');
	actionElement.options[actionElement.options.length] = new Option('4', '4');
    }
    if ((val=='M' && sbstatus == 'open') || (val=='F' && sgstatus=='open')) {
	actionElement.options[actionElement.options.length] = new Option('5', '5');
	actionElement.options[actionElement.options.length] = new Option('6', '6');
	actionElement.options[actionElement.options.length] = new Option('7', '7');
	actionElement.options[actionElement.options.length] = new Option('8', '8');
    }
}

function clearOptions(selectEl) {
    var options=selectEl.getElementsByTagName("option");
    for (i=options.length-1; i>0; i--)
    {
	selectEl.removeChild(options[i]);
    }
}

function schoolSelect(el,player_num) {
    var id = 'schooltext'+player_num;
    var pid = 'pschool'+player_num;
    var sc = document.getElementById(id);
    var psc = document.getElementById(pid);
    if (el.value == 'OTHER') {
	sc.style.display = "block";
	psc.value = "";
    } else {
	sc.style.display = "none";
	psc.value = el.value;
    }
}

function clearMe(el) {
    if (el.value!= undefined && el.value!="") {
	el.style.backgroundColor = "white";
    }
}

function clearMe2(el) {
    if (el.value != 0 ) {
	el.style.backgroundColor = "white";
    }
}

function checkbbqform(form) {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    var etest = reg.test(form.email.value);
    if (form.email.value == "" || !etest) {
	alert( "Please enter a valid email address." );
	form.email.style.backgroundColor = "yellow";
	form.email.focus();
	return false ;
    }
    var fields = new Array(form.fn, form.ln,form.phone);
    var fieldTitles = new Array("First Name", "Last Name","Home Phone");

    for (i=0;i<fields.length;i++) {
	if (fields[i].value == undefined || fields[i].value == "") {
	    alert( fieldTitles[i]+" cannot be empty." );
	    try {
		fields[i].style.backgroundColor = "yellow";
		fields[i].focus();
	    } catch (err) {
		//alert(err);
	    }
	    return false;
	}
    }


}

function checkform(form) {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    var etest = reg.test(form.email.value);
    if (form.email.value == "" || !etest) {
	alert( "Please enter a valid email address." );
	form.email.style.backgroundColor = "yellow";
	form.email.focus();
	return false ;
    }

    var fields = new Array(form.ln,form.phone);
    var fieldTitles = new Array("Last Name","Home Phone");

    for (i=0;i<fields.length;i++) {
	if (fields[i].value == undefined || fields[i].value == "") {
	    alert( fieldTitles[i]+" cannot be empty." );
	    try {
		fields[i].style.backgroundColor = "yellow";
		fields[i].focus();
	    } catch (err) {
		//alert(err);
	    }
	    return false;
	}
    }
    
    var phonereg = /^.{0,1}[0-9]{3}.{0,1}.{0,1}[0-9]{3}.{0,1}[0-9]{4}\s*$/;
    var ptest = phonereg.test(form.phone.value);
    if (!ptest) {
	alert("Please enter a valid phone number.");
	form.phone.style.backgroundColor = "yellow";
	form.phone.focus();
	return false;
    }


    var ret = checkplayers(form);
    
    return ret;
}

function rot13(s)
{
    return (s ? s : this).split('').map(function(_) {
					    
       if (!_.match(/[A-Za-z]/)) return _;
         c = Math.floor(_.charCodeAt(0) / 97);
         k = (_.toLowerCase().charCodeAt(0) - 83) % 26 || 26;
      return String.fromCharCode(k + ((c == 0) ? 64 : 96));
    }).join('');
}

function checkpasscode () {
    var textel = document.getElementById("passcodetext");
    var passcode = document.getElementById("passcode").value;
    if (textel !=null) {
	text = document.getElementById("passcodetext").value;

	if (passcode) {
	    if (!text) {
		alert("Empty registration passcode");
		return false;
	    }

	    var encodedPasscode = rot13(text);
//	    alert(encodedPasscode);
//	    alert ("encoded entered passcode = ["+encodedPasscode+"]\nphp encoded passcode = ["+passcode+"]");
	    if (encodedPasscode.toLowerCase() != passcode.toLowerCase()) {
		alert("Incorrect registration passcode");
		return false;
	    }
	}
    }

    return true;
}

function baglogic(chk,div1,div2,player_num) {
    if (chk.checked) {
	div1.style.display = "none";
	div2.style.display = "block";
	var newbag = document.getElementById('pnew_bag'+player_num);
	newbag.checked = true;
    } else {
	div2.style.display = "none";
	div1.style.display = "block";
    }
}

function checkplayers(form) {
    var ret = true;
    //first player
    var pf = new Array(form.pname1,form.page1,form.pschool1);
    var playerTextFieldNames = new Array("Player Name","Player Age","School");
    var playerSelectFieldNames = new Array("Shirt","Gender","Grade");
    var ret = validateTextArray(pf,playerTextFieldNames);
    var pf = new Array(form.pshirt1, form.psex1, form.pgrade1);
    ret = ret && validateAge(form.page1);
    ret = ret && validateSelectArray(pf,playerSelectFieldNames);

    var num_players = form.num_players.value;

    //player two
    if (num_players > 1) {
	var pf = new Array(form.pname2,form.page2,form.pschool2);
	ret = ret && validateTextArray(pf,playerTextFieldNames);
	var pf = new Array(form.pshirt2, form.psex2, form.pgrade2);
	ret = ret && validateSelectArray(pf,playerSelectFieldNames);
	ret = ret && validateAge(form.page2);
    }

    //player three
    if (num_players > 2) {
	var pf = new Array(form.pname3,form.page3,form.pschool3);
	ret = ret && validateTextArray(pf,playerTextFieldNames);
	var pf = new Array(form.pshirt3, form.psex3, form.pgrade3);
	ret = ret && validateSelectArray(pf,playerSelectFieldNames);
	ret = ret && validateAge(form.page3);
    }

    //player four
    if (num_players > 3) {
	var pf = new Array(form.pname4,form.page4,form.pschool4);
	ret = ret && validateTextArray(pf,playerTextFieldNames);
	var pf = new Array(form.pshirt4, form.psex4, form.pgrade4);
	ret = ret && validateSelectArray(pf,playerSelectFieldNames);
	ret = ret && validateAge(form.page4);
    }

    ret = ret && checkpasscode();
    return ret;

}
function validateAge(agefield) {
    var test_result = /^\d+$/.test(agefield.value);
    if (!test_result || agefield.value < 5 || agefield.value > 14) {
	alert("Please enter age as a number between 5 and 14");
	agefield.style.backgroundColor="yellow";
	agefield.focus();
	return false;
    } 
    return true;
}

function validateTextArray(fields,names) {
    for (i=0;i<fields.length;i++) {
	if (fields[i].value == undefined || fields[i].value == "") {
	    alert( names[i]+" cannot be empty." );
	    try {
		fields[i].style.backgroundColor = "yellow";
		fields[i].focus();
	    } catch (err) {
		//alert(err);
	    }
	    return false;
	}
    }
    return true;
}

function validateSelectArray(fields,names) {
    for (i=0;i<fields.length;i++) {
	if (fields[i].value == 0) {
	    alert( "Please select "+ names[i]);
	    try {
		fields[i].style.backgroundColor = "yellow";
		fields[i].focus();
	    } catch (err) {
		//alert(err);
	    }
	    return false;
	}
    }
    return true;
}

function toggleSponsorName(sponsorCheckbox) {

//    sponsorCheckbox.checked = true;
//    return;
    var form = sponsorCheckbox.form;
    var sn = form.sponsor_name;

    if (sponsorCheckbox.checked) {
	sn.disabled=false;
    } else {
	sn.disabled=true;
    }
}
function showhideplayerdivs() {

    var sel = document.getElementById('playerSelect')
    var index = sel.selectedIndex;
    var val = sel.options[index].value;

    var pd2 = document.getElementById('playerdiv2');
    var pd3 = document.getElementById('playerdiv3');
    var pd4 = document.getElementById('playerdiv4');
    if (val == 1) {
	pd2.style.display='none';
	pd3.style.display='none';
	pd4.style.display='none';
    } else if (val == 2) {
	pd2.style.display='block';
	pd3.style.display='none';
	pd4.style.display='none';
    }else if (val == 3) {
	pd2.style.display='block';
	pd3.style.display='block';
	pd4.style.display='none';
    }else if (val == 4) {
	pd2.style.display='block';
	pd3.style.display='block';
	pd4.style.display='block';
    }

}

function showhide(divid) {

    var d = document.getElementById(divid);
    //hide other divs
    var login = document.getElementById('login');
    var reg = document.getElementById('register');
    var update = document.getElementById('update');
    var m = document.getElementById('message');
    m.innerHTML = "";

    var other;
    var other2;
    if (d.id=='register') {
	other = login;
	other2 = update;
    } else   if (d.id=='login') {
	other = reg;
	other2 = update;
    } else {
	other = login;
	other2 = reg;
    }

    if (d.style.display == 'block') {
	d.style.display = 'none';
    } else {

	if (other!=null) {
	    other.style.display='none';
	}
	if (other2!=null) {
	    other2.style.display='none';
	}
	d.style.display = 'block';
    }
    
}
-->