<?php

$fp = fopen("env.txt","r");
$env=fgets($fp);
$env=rtrim($env);
if (!$env) {
  $env="test"; #default
 }
if ($env == "Production") {
  $dbhost="yyldbuser.db.7181398.hostedresource.com";
  $dbuser="yyldbuser";
  $dbname="yyldbuser";
  $dbpass = 'Yyl2008';
  $paymentcomplete = "http://signup.yavnehyouthleague.com/signup/payment_complete.php";
  $notify_url = "http://signup.yavnehyouthleague.com/signup/payment_process.php";
  $paymentcomplete_bbq = "http://signup.yavnehyouthleague.com/game/payment_complete.php";
  $notify_url_bbq = "http://signup.yavnehyouthleague.com/game/payment_process.php";
  $adminlogin_url = "http://signup.yavnehyouthleague.com/signup/login.php";
  $admin_url = "http://signup.yavnehyouthleague.com/signup/login.php";
 } else {
  $dbhost="127.0.0.1";
  $dbuser="bestworl_yyl";
  $dbname="bestworl_yyl";
  $dbpass = 'yyl2008';
  $paymentcomplete = "http://bestworldcoins.com/yyl/payment_complete.php";
  $notify_url = "http://bestworldcoins.com/yyl/payment_process.php";
  $paymentcomplete_bbq = "http://bestworldcoins.com/yyl/game/payment_complete.php";
  $notify_url_bbq = "http://bestworldcoins.com/yyl/game/payment_process.php";
  $adminlogin_url = "http://www.bestworldcoins.com/yyl/login.php";
  $admin_url = "http://www.bestworldcoins.com/yyl/admin.php";
 }

  if (!mysql_connect($dbhost,$dbuser,$dbpass)) {
    echo "Failed to connect to mysql server $dbhost!<BR>";
    exit(-999);
  }
  mysql_select_db($dbname);

#num - number of attendees
function get_pay_amount($sponsorfee,$fee,$sponsor,$num,$discount) {
  print "$sponsorfee,$fee,$sponsor,$num,$discount";
if ($sponsor) {
  $bbqfee = $num*$fee - $discount;
  if ($bbqfee < 0) {
    $bbqfee = 0;
  }
  $amount=$sponsorfee+$bbqfee;
 } else {
  $bbqfee=$info['num_adults']*$fee;
  $amount=$info['num_adults']*$fee;
 }
 return $amount;
}

function get_event_users_table_name() {
	$event = get_custom_value("event");
	return "users_".$event;
}

function get_event_table_name() {
	return get_custom_value("event");
}

function calculate_update_amount($regfee,$newbagfee,$info,$num_players_added) {
  $amount = $regfee * $num_players_added;
  foreach ($info['players'] as $player) {
#    print_r($player);
   if ($player['new_bag']==1) {
      $amount+=$newbagfee;
    } 
  }

  return $amount;
}

function calculate_reg_amount($regfee,$newbagfee,$info) {

  $amount = $regfee * count($info['players']);
  foreach ($info['players'] as $player) {
#    print_r($player);
   if ($player['new_bag']==1) {
      $amount+=$newbagfee;
    } 
  }
  return $amount;
}

function checkregistered($ar) {
  return checkreg($ar,false);
}

function checkreg($ar,$custom) {
  $table = "users";
  if ($custom == 'bbq') {
    $table="users_bbq";
  } elseif ($custom == 'game') {
    $table=get_event_users_table_name();
  } elseif ($custom != false) {
    $table.="_".$custom;
  }
  $query = "select id from $table where email=\"".$ar['email']."\"";
#  print "["."$query"."]<BR>";
  $res = mysql_query($query);
  if (mysql_num_rows($res) > 0) {
    return TRUE;
  }
  return FALSE;
}

function validatelogin($ar) {
  $query = "select id from users where email=\"".$ar['email']."\" and password=\"".$ar['password']."\"";
#  print "["."$query"."]";
  $res = mysql_query($query);
  if (mysql_num_rows($res) > 0) {
    $row = mysql_fetch_assoc($res);
    return $row['id'];
  }
  return FALSE;

}
function get_custom() {
  $query = "select * from fees";

  $res = mysql_query($query);
  if (mysql_num_rows($res) > 0) {
    while(($resultArray[] = mysql_fetch_assoc($res)) || array_pop($resultArray)); 
  }
  return $resultArray;
}

function get_custom_value($field) {
  $query = "select * from fees where custom_field = \"$field\"";

  $res = mysql_query($query);
  if (mysql_num_rows($res) > 0) {
    $row = mysql_fetch_assoc($res);
  }
  return $row['custom_value'];
}

function set_custom($ar) {
  if ($ar) {
    foreach ($ar as $key => $value) {
#      $key = str_replace("_"," ",$key);
      $value=trim($value);
#      print "$key=$value<BR>";
      $query = "update fees set custom_value=\"$value\" where custom_field=\"$key\"";
#      print "->$query<-<BR>";
      
      try {
	$res = mysql_query($query);
	$arv.=$key." ";
      } catch (Exception $e) {
	print 'Caught exception: '.  $e->getMessage(). "\n";
      }
    }
    print "$arv Values updated. <BR>";
  }
}

function player_info($players) {
  foreach ($players as $player) {
    print $player['name'].", age: ".$player['age'];
    if ($player['paid']==0) {
      print " <- payment not received";
    }
    print "<BR>";
  }
}

function get_unpaid_players($players) {
  $added=array();
  foreach ($players as $player) {
    if ($player['paid']==0) {
      $added[]=$player;
    }
  }
  return $added;
}

function player_form($n,$player,$hidden,$nb) {
  print "<div id=playerdiv".$n;
  if ($hidden) {
    print " style=\"display:none\" ";
  }
  print " class=playerform>";
  print "<TABLE><TR> ";
  print "<TD width=250> <span class=required> First Name: </span> <INPUT TYPE=\"text\" onBlur=\"clearMe(this)\" size=15 name=\"pname";
  print $n;
  print "\" value=\"".$player['name']."\"> ";
  print "<TD width=150> <span class=required> School: </span> ";
  print get_school_select($n,$player['school']);

  print "<TD rowspan = 2 width=200 style=\"border-left: 2px dashed yellow; padding-left: 5px; margin-left: 5px; color: #AAAAAA\"> If the grade for your child is not available, please put your child on the waiting list by clicking ";
  print "<A style=\"color: #FFFF99;\" HREF=\"https://docs.google.com/spreadsheet/viewform?formkey=dEhqcEFNdnJmYkxCSHl3VHRSWlAtcVE6MQ\" target=_blank> here </A>";
  print "<TR>";
  print "<TD> <span class=required> Age: </span> <INPUT TYPE=\"text\" size=3 maxlength=3 onBlur=\"clearMe(this)\" name=\"page";
  print $n;
  print "\" value=\"".$player['age']."\"> &nbsp;";

  print "<span class=required> Gender: </span> ";
  print "<select id=\"psex".$n."\" name=\"psex"; 
  print $n;
  print "\" onChange=\"getGradeSelect(".$n.")\" onBlur=\"clearMe2(this)\"> <option value=\"0\" > - Select - </option>";
  print "<option value=\"M\"";
  if ($player['gender']=="M") {
    print " SELECTED ";
  }
  print "> Male";
  print "<option value=\"F\"";
  if ($player['gender']=="F") {
    print " SELECTED ";
  }

  print "> Female </select>";
  print "<TD>";
  print "<span class=required> Grade: </span> ";
  print get_grade_select($n,$player['grade']);

  print "<TD>";
  print "&nbsp;";
  print "<span class=required> Shirt Size: </span> ";
  print get_shirt_select($n,$player['shirt']);

  print "<TR><TD>";
  print "<input type=checkbox id=bagchk".$n;
  print " onClick=\"baglogic(document.getElementById('bagchk".$n."'),document.getElementById('newbagradiodiv".$n."'),document.getElementById('newbagtextdiv".$n."'),$n)\" name=preturning_player";
  print $n;
  if ($player['returning_player']==1) {
    print " CHECKED";
  }
  print "> New YYL Player (includes bag)";
#  print "<input type=checkbox name=pret_player_2";
#  print $n;
#  if ($player['ret_player_2']==1) {
#    print " CHECKED";
#  }
#  print "> 2009 player";
  print "<TD> <div id=newbagradiodiv".$n."> New Bag: ";
  print "<input type=radio id=pnew_bag".$n." name=pnew_bag";
  print $n;
  if ($player['new_bag']==0) {
    print " CHECKED";
  }
  print " value=0> No";
  print "<input type=radio name=pnew_bag";
  print $n;
  if ($player['new_bag']==1) {
    print " CHECKED";
  }
  print " value=1> Yes";
  print "<BR> <span class=note> $".$nb." to purchase a league bag </span></div>";
  print "<div style=\"display:none;\"id=newbagtextdiv".$n."><span class=note> New bag is free for new players.</span></div>";
  if ($player['id']) {
    print "<input type=\"hidden\" name=\"pid";
    print $n;
    print "\" value=".$player['id']."> <BR>";
    #print "id=".$player['id']; 
  }
  print "</TABLE></DIV>";
}

function get_grade_select($n,$grade) {
  $rv = "<select name=\"pgrade";
  $rv.=$n;
  $rv.="\" onBlur=\"clearMe2(this)\">";
  $rv.="<option value=\"0\"> - Select -\n";
#  for ($i=1;$i<9;$i++ ) {
#    if ($i==$grade) {
  if ($grade) {
    $rv.="<option value=\"$grade\" SELECTED> $grade\n";
  }
#    } else {
#      $rv.="<option value=\"$i\"> $i\n";
#    }
#  }
  $rv.="</select>\n";
  return $rv;
}

function get_players_by_grade($grade_start,$grade_end,$gender) {
  $query = "select count(distinct(players.id)) as count from players left outer join users on users.id=players.user_id left outer join yyl_reg on users.id = yyl_reg.user_id where confirmed=1 and grade between $grade_start and $grade_end and gender=\"$gender\"";
  $res = mysql_query($query);
  $row = mysql_fetch_assoc($res);
  return $row['count'];
}
function get_total_paid_players() {
  $query = "select count(distinct(players.id)) as count from players left outer join users on users.id=players.user_id left outer join yyl_reg on users.id = yyl_reg.user_id where confirmed=1 and players.paid=1";
  $res = mysql_query($query);
  $row = mysql_fetch_assoc($res);
  return $row['count'];
}

function get_transactions() {
  $query = " select count(*) as count,sum(amount) as total from yyl_reg";
  $res = mysql_query($query);
  $row = mysql_fetch_assoc($res);
  return $row;
}



function get_shirt_size($index) {
  switch ($index) {
  case 1:
    return "YM(10-12)";
    break;
  case 2:
    return "YL(14-16)";
    break;
  case 3:
    return "AS(34-36)";
    break;
  case 4:
    return "AM(38-40)";
    break;
  case 5:
    return "AL(42-44)";
    break;
  case 6:
    return "XL(46-48)";
    break;
  case 7:
    return "XXL(50-52)";
    break;
  }
}
function get_school_select($n,$school) {
  $schools = array("BPY","GBDS","Heatid","Lyncrest","MDS","Moriah","Noam","RYNJ","Yavneh","OTHER");
  $rv = "<select onChange=\"schoolSelect(this,".$n.")\" name=\"schoolselect";
  $rv.=$n;
  $rv.="\" >";
  $rv.="<option value=\"\"> - Select -\n";
  foreach ($schools as $s) {
    $rv.="<option value=\"$s\" ";
    if ($s==$school || ($s=="OTHER" && !in_array($school,$schools)) && $school != '') {
      $rv.="SELECTED";
    }
    $rv.=">".$s."\n";
  }
#  $rv.="<option value=\"OTHER\">OTHER";
  $rv.="</select>&nbsp;";

  $rv.= "<TD> <span ";
  if (in_array($school,$schools)) {
    $rv.=   " style=\"display:none;\" ";
  }
  $rv.= "id='schooltext".$n."' > School name: <font color=red> * </font> <INPUT id = pschool".$n." TYPE=\"text\" name=\"pschool";
  $rv.= $n;
  $rv.= "\" value=\"".$school."\"> </div>";

  return $rv;
}

function get_shirt_select($n,$size) {
  $rv = "<select name=\"pshirt";
  $rv.=$n;
  $rv.="\" onBlur=\"clearMe2(this)\">";

  $rv.="<option value=\"0\"> - Select -\n";
  for ($i=1;$i<7;$i++ ) {
    $rv.="<option value=\"$i\" ";
    if ($i==$size) {
      $rv.="SELECTED";
    }
    $rv.=">".get_shirt_size($i)."\n";
  }
  $rv.="</select>\n";
  return $rv;
}

function delete_event_user($user_id,$event) {

  $users = get_event_users_table_name();
  $query = "delete from $event where user_id=$user_id";
  $res = mysql_query($query);
  $query = "delete from $users where id=$user_id";
  $res = mysql_query($query);
}

function delete_user($user_id) {

  $query = "delete from players where user_id=$user_id";
#  print $query;
  $res = mysql_query($query);

  $query = "delete from users where id=$user_id";
#  print $query;
  $res = mysql_query($query);
}

function delete_player($id) {
  $query = "delete from players where id=$id";
  $res = mysql_query($query);
}

function get_reg_single($email) {
  $ar = array('email' => $email);
  return get_reg_info($ar);
}

function get_player_by_id($id) {
  $query = "select * from players where id=".$id;
  $res = mysql_query($query);
  if ($res) {
    if (mysql_num_rows($res) > 0) {
      $result = mysql_fetch_assoc($res);
    }
  }
  return $result;
}

function get_reg_info($ar) {

  $query = "select * from users where email=\"$ar[email]\"";
#  print "["."$query"."]";
  $res = mysql_query($query);
  if (mysql_num_rows($res) > 0) {
    $row = mysql_fetch_assoc($res);
  }

  $id=$row['id'];
  $query = "select * from yyl_reg where user_id=".$id;
  $res = mysql_query($query);
  if ($res) {
    $row2 = mysql_fetch_assoc($res);
    $row['confirmed'] = $row2['confirmed'];
  }

  $query = "select * from players where user_id=".$id;
  $res = mysql_query($query);
  if ($res) {
    if (mysql_num_rows($res) > 0) {
      while(($resultArray[] = mysql_fetch_assoc($res)) || array_pop($resultArray)); 
    }
  }
  $row['players']=$resultArray;
#  print_r($row);
  return $row;
}

function get_info($ar) {
  $event = get_event_table_name();
  $users = get_event_users_table_name();
  $query = "select * from $users,$event where email=\"".$ar['email']."\" and $users.id=$event.user_id";
#  print "["."$query"."]<BR>";
  $res = mysql_query($query);
  if (mysql_num_rows($res) > 0) {
    $row = mysql_fetch_assoc($res);
    return $row;
  }
  return FALSE;

}

function get_reg_all() {
  $query="select *,ifnull(payment_date,curdate()+1) as ordercolumn from users left outer join yyl_reg on users.id = yyl_reg.user_id order by ordercolumn desc";
  $res = mysql_query($query);
  if (mysql_num_rows($res) > 0) {
    while(($resultArray[] = mysql_fetch_assoc($res)) || array_pop($resultArray)); 
  }
#  print_r($resultArray);
  for ($i=0;$i<count($resultArray);$i++) {
    $query = "select * from players where user_id=".$resultArray[$i]['id'];
#    print "["."$query"."]";
    $res = mysql_query($query);
    if ($res) {
      if (mysql_num_rows($res) > 0) {
	while(($presultArray[] = mysql_fetch_assoc($res)) || array_pop($presultArray)); 
      }
      if ($presultArray) {
	$resultArray[$i]['players']=$presultArray;
      }
    }
    $presultArray=null;
  }
#  print_r($resultArray);
  return $resultArray;
}

function get_reg_csv() {
  $query="select * from users";
  $res = mysql_query($query);
  if (mysql_num_rows($res) > 0) {
    while(($resultArray[] = mysql_fetch_assoc($res)) || array_pop($resultArray)); 
  }
#  print_r($resultArray);
  for ($i=0;$i<count($resultArray);$i++) {
    $query = "select * from players where user_id=".$resultArray[$i]['id'];
#    print "["."$query"."]";
    $res = mysql_query($query);
    if ($res) {
      if (mysql_num_rows($res) > 0) {
	while(($presultArray[] = mysql_fetch_assoc($res)) || array_pop($presultArray)); 
      }
      if ($presultArray) {
	$resultArray[$i]['players']=$presultArray;
      }
    }
    $presultArray=null;
  }
#  print_r($resultArray);
  return $resultArray;
}

function get_all() {
  $event = get_event_table_name();
  $users = get_event_users_table_name();
  $query = "select * from $users,$event where $users.id=$event.user_id order by confirmed desc,payment_date desc,user_id desc";
#  print "["."$query"."]";
  $res = mysql_query($query);
  if (mysql_num_rows($res) > 0) {
    while(($resultArray[] = mysql_fetch_assoc($res)) || array_pop($resultArray)); 
  }
  return $resultArray;

}
function update_reg($ar) {
  $id = $ar['id'];
  $fn = $ar['fn'];
  $ln = $ar['ln'];
  $mother_name = $ar['mother_name'];
  $father_name = $ar['father_name'];
  $email = $ar['email'];
  $email2 = $ar['email2'];
  $cell1 = $ar['cell1'];
  $cell2 = $ar['cell2'];
  $phone = $ar['phone'];
  $ecn = $ar['ecn'];
  $ecp = $ar['ecp'];
  $addr1 = $ar['addr1'];
  $addr2 = $ar['addr2'];
  $city = $ar['city'];
  $state = $ar['state'];
  $zip = $ar['zip'];
  $pref_contact = $ar['pref_contact'];
  $insurance = $ar['insurance'];
  $policy = $ar['policy'];
  $comments = $ar['comments'];
  $num_players = $ar['num_players'];
  for ($i=1;$i<=$num_players;$i++) {
    $pid[$i]=$ar['pid'.$i];
    $pname[$i] = $ar['pname'.$i];
    $pschool[$i] = $ar['pschool'.$i];
    $page[$i] = $ar['page'.$i];
    $pgrade[$i] = $ar['pgrade'.$i];
    $psex[$i] = $ar['psex'.$i];
    $pnew_bag[$i] = $ar['pnew_bag'.$i];
    $pshirt[$i] = $ar['pshirt'.$i];
    if ($ar['preturning_player'.$i] == "on") {
      $rp[$i] = 1;
    } else {
      $rp[$i] = 0;
    }
    if ($ar['pret_player_2'.$i] == "on") {
      $rp2[$i] = 1;
    } else {
      $rp2[$i] = 0;
    }
  }

  $query ="update users set email=\"$email\",first_name=\"$fn\",last_name=\"$ln\",";
  $query.=" mother_name=\"$mother_name\",father_name=\"$father_name\",";
  $query.=" email2=\"$email2\",cell1=\"$cell1\",cell2=\"$cell2\", ";
  $query.=" addr1=\"$addr1\",addr2=\"$addr2\",phone=\"$phone\", ";
  $query.=" city=\"$city\",state=\"$state\",zip=\"$zip\", ";
  $query.=" insurance=\"$insurance\",policy=\"$policy\",pref_contact=\"$pref_contact\",comments=\"$comments\" ";
  $query.=" where id=$id";

  mysql_query($query);
  for ($i=1;$i<=$num_players;$i++) {
    if ($pid[$i]) {
      $query = " update players set ";
      $query.="name=\"$pname[$i]\",age=\"$page[$i]\",school=\"$pschool[$i]\", ";
      $query.=" grade=\"$pgrade[$i]\",gender=\"$psex[$i]\",shirt=\"$pshirt[$i]\", ";
      $query.=" new_bag=\"$pnew_bag[$i]\",returning_player=$rp[$i],ret_player_2=$rp2[$i]";
      $query.=" where id=$pid[$i]";
    } else {
      $query = "insert into players (id, user_id, name, school, age, grade, shirt, returning_player, ret_player_2, gender, new_bag) values (";
      $query.="NULL,$id,\"$pname[$i]\",\"$pschool[$i]\",$page[$i], $pgrade[$i], $pshirt[$i],$rp[$i],$rp2[$i],\"$psex[$i]\",$pnew_bag[$i]);";
    }
#    print "query=[$query]<BR><BR>";
    mysql_query($query);
  }

}

function update($ar) {
#  print_r($ar);
  $event = get_event_table_name();
  $users = get_event_users_table_name();

  $id = $ar['id'];
  $fn = $ar['fn'];
  $ln = $ar['ln'];
  $sn = $ar['sponsor_name'];
  $email = $ar['email'];
  $sponsor=0;
  if ($ar['sponsor'] == 'on') {
    $sponsor = 1;
  }
  $na = $ar['numadults'];
  $query="update $users set email=\"$email\",first_name=\"$fn\",last_name=\"$ln\" where id=$id";
#  print $query;
  mysql_query($query);
  $query="update $event set num_adults=\"$na\",sponsor=$sponsor,sponsor_name=\"$sn\" where user_id=$id";
#  print $query;
  mysql_query($query);
}

#registration
function add_player($ar) {
#  print_r($ar);
  $email = $ar['email'];
  $num_players = $ar['num_players'];

  for ($i=1;$i<=$num_players;$i++) {
    $pname[$i] = $ar['pname'.$i];
    $pschool[$i] = $ar['pschool'.$i];
    $page[$i] = $ar['page'.$i];
    $pgrade[$i] = $ar['pgrade'.$i];
    $psex[$i] = $ar['psex'.$i];
    $pnew_bag[$i] = $ar['pnew_bag'.$i];
    $pshirt[$i] = $ar['pshirt'.$i];
    if ($ar['preturning_player'.$i] == "on") {
      $rp[$i] = 1;
    } else {
      $rp[$i] = 0;
    }
    if ($ar['pret_player_2'.$i] == "on") {
      $rp2[$i] = 1;
    } else {
      $rp2[$i] = 0;
    }
  }

  $query="select id from users where email=\"$email\"";
  $res = mysql_query($query);
  $row = mysql_fetch_assoc($res);
  $userid = $row['id'];

  for ($i=1;$i<=$num_players;$i++) {

    $query = "insert into players (id, user_id, name, school, age, grade, shirt, returning_player, ret_player_2, gender, new_bag) values (";
    $query.="NULL,$userid,\"$pname[$i]\",\"$pschool[$i]\",$page[$i], $pgrade[$i], $pshirt[$i],$rp[$i],$rp2[$i],\"$psex[$i]\",$pnew_bag[$i]);";
#    print "[".$query."]";
    mysql_query($query);
  }
  return $num_players;
}

function register_user($ar) {
#  print_r($ar);
  $fn = $ar['fn'];
  $ln = $ar['ln'];
  $mother_name = $ar['mother_name'];
  $father_name = $ar['father_name'];
  $email = $ar['email'];
  $email2 = $ar['email2'];
  $cell1 = $ar['cell1'];
  $cell2 = $ar['cell2'];
  $phone = $ar['phone'];
  $ecn = $ar['ecn'];
  $ecp = $ar['ecp'];
  $addr1 = $ar['addr1'];
  $addr2 = $ar['addr2'];
  $city = $ar['city'];
  $state = $ar['state'];
  $zip = $ar['zip'];
  $pref_contact = $ar['pref_contact'];
  $num_players = $ar['num_players'];
  $insurance = $ar['insurance'];
  $comments = $ar['comments'];
  $policy = $ar['policy'];
  for ($i=1;$i<=$num_players;$i++) {
    $pname[$i] = $ar['pname'.$i];
    $pschool[$i] = $ar['pschool'.$i];
    $page[$i] = $ar['page'.$i];
    $pgrade[$i] = $ar['pgrade'.$i];
    $psex[$i] = $ar['psex'.$i];
    $pnew_bag[$i] = $ar['pnew_bag'.$i];
    $pshirt[$i] = $ar['pshirt'.$i];
    if ($ar['preturning_player'.$i] == "on") {
      $rp[$i] = 1;
    } else {
      $rp[$i] = 0;
    }
    if ($ar['pret_player_2'.$i] == "on") {
      $rp2[$i] = 1;
    } else {
      $rp2[$i] = 0;
    }
  }

  $query="insert into users (id,first_name,mother_name,father_name,last_name,email,email2,phone,cell1,cell2,addr1,addr2,city,state,zip,insurance,policy,password,emerg_cont_name,emerg_cont_phone,pref_contact,comments) values (";
  $query.="NULL,\"$fn\",\"$mother_name\",\"$father_name\",\"$ln\",\"$email\",\"$email2\",\"$phone\",\"$cell1\",\"$cell2\",";
  $query.="\"$addr1\",\"$addr2\",\"$city\",\"$state\",\"$zip\",\"$insurance\",\"$policy\",\"$password\",\"$ecn\",\"$ecp\",\"$pref_contact\",\"$comments\")";
  mysql_query($query);
  $userid=mysql_insert_id();
  for ($i=1;$i<=$num_players;$i++) {

    $query = "insert into players (id, user_id, name, school, age, grade, shirt, returning_player, ret_player_2, gender, new_bag) values (";
    $query.="NULL,$userid,\"$pname[$i]\",\"$pschool[$i]\",$page[$i], $pgrade[$i], $pshirt[$i],$rp[$i],$rp2[$i],\"$psex[$i]\",$pnew_bag[$i]);";
#    print "[".$query."]";
    mysql_query($query);
  }
}

#barbeque
function register($ar) {
#  print_r($ar);
  $event = get_event_table_name();
  $fn = $ar['fn'];
  $ln = $ar['ln'];
  $email = $ar['email'];
  $phone = $ar['phone'];
  $addr1 = $ar['addr1'];
  $addr2 = $ar['addr2'];
  $city = $ar['city'];
  $state = $ar['state'];
  $zip = $ar['zip'];
  $na = $ar['numadults'];
  $sn = $ar['sponsor_name'];
  $sponsor = 0;
  if ($ar['sponsor'] == 'on') {
    $sponsor = 1;
  }
  $users = get_event_users_table_name();

  $query="insert into $users (id,first_name,last_name,email,phone,addr1,addr2,city,state,zip,password) values (";
  $query.="NULL,\"$fn\",\"$ln\",\"$email\",\"$phone\",\"$addr1\",\"$addr2\",\"$city\",\"$state\",\"$zip\",\"$password\")";
#  print "[$query]<BR>";
  mysql_query($query);
  $userid=mysql_insert_id();

  $query = "insert into $event (id, user_id, num_adults, num_children, confirmed, sponsor,sponsor_name) values (NULL,$userid,$na,0,0, $sponsor, \"$sn\");";
#  print "[$query]<BR>";
  mysql_query($query);

#  print $query;
}


function paypal_link ($amount,$id,$players) {
  $email="commissioner@yavnehyouthleague.com";
#<form name="_xclick" target="paypal" action="https://www.paypal.com" method="post">
#<input type="hidden" name="cmd" value="_cart">
#http://www.paypal.com/en_US/i/btn/sc-but-01.gif
#<input type="image" src="paypal.gif" border="0" name="submit" alt="Make payments with PayPal - it's fast, free and secure!">
#<input type="hidden" name="add" value="1">
  $item_name = "yyl_registration_".$id."_".count($players);
  $item_number=$id;
  $i=1;
  foreach ($players as $player) {
    $items.="<input type=\"hidden\" name=\"item_name_".$i."\" value=\"".$player['name']."\">\n";
    $items.="<input type=\"hidden\" name=\"quantity_".$i."\" value=\"1\">\n";
    $items.="<input type=\"hidden\" name=\"amount_".$i++."\" value=\"".$regfee."\">\n";
    $item_number.="_".$player['id'];
  }
# <input type="hidden" name="item_name" value="$item_name">
# <input type="hidden" name="amount" value="$amount">
#<input type="hidden" name="cmd" value="_xclick">
  $return = $GLOBALS['paymentcomplete'];
  $notify = $GLOBALS['notify_url'];
$paypallink = <<<EOT

<form name="paypalform" action="https://www.paypal.com/cgi-bin/webscr" method="post">
<input type="hidden" name="cmd" value="_xclick">
<input type="hidden" name="business" value="$email">
<input type="hidden" name="item_name" value="$item_name">
<input type="hidden" name="amount" value="$amount">
<input type="hidden" name="item_number" value="$item_number">
<input type="hidden" name="no_shipping" value="2">
<input type="hidden" name="return" value="$return">
<input type="hidden" name="notify_url" value="$notify">
<input type="hidden" name="currency_code" value="USD">
<input type="hidden" name="bn" value="PP-BuyNowBF">
<input id=ppl type="image" src="https://www.paypal.com/en_US/i/bnr/horizontal_solution_PPeCheck.gif" border="0" name="submit" alt="Make payments with PayPal - it's fast, free and secure!">
<img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">

</form>
EOT;
 return $paypallink;
}

function paypal_link_event ($amount,$id) {
  $email="commissioner@yavnehyouthleague.com";
  $event = get_custom_value("event");
#<form name="_xclick" target="paypal" action="https://www.paypal.com" method="post">
#<input type="hidden" name="cmd" value="_cart">
#http://www.paypal.com/en_US/i/btn/sc-but-01.gif
#<input type="image" src="paypal.gif" border="0" name="submit" alt="Make payments with PayPal - it's fast, free and secure!">
#<input type="hidden" name="add" value="1">
  $item_name = $event."_".$id;
  $return = $GLOBALS['paymentcomplete_bbq'];
  $notify = $GLOBALS['notify_url_bbq'];
$paypallink = <<<EOT

<form action="https://www.paypal.com/cgi-bin/webscr" method="post">
<input type="hidden" name="cmd" value="_xclick">
<input type="hidden" name="business" value="$email">
<input type="hidden" name="item_name" value="$item_name">
<input type="hidden" name="amount" value="$amount">
<input type="hidden" name="no_shipping" value="2">
<input type="hidden" name="return" value="$return">
<input type="hidden" name="notify_url" value="$notify">
<input type="hidden" name="currency_code" value="USD">
<input type="hidden" name="bn" value="PP-BuyNowBF">
<input id=ppl type="image" src="https://www.paypal.com/en_US/i/bnr/horizontal_solution_PPeCheck.gif" border="0" name="submit" alt="Make payments with PayPal - it's fast, free and secure!">
<img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">

</form>

EOT;
 return $paypallink;
}

function getStateSelect ($state) {
  $rv= <<<EOT
<select name="state"> 
<option value=""> - Select - </option>
<option value="AL">Alabama</option> 
<option value="AK">Alaska</option> 
<option value="AZ">Arizona</option> 
<option value="AR">Arkansas</option> 
<option value="CA">California</option> 
<option value="CO">Colorado</option> 
<option value="CT">Connecticut</option> 
<option value="DE">Delaware</option> 
<option value="DC">District Of Columbia</option> 
<option value="FL">Florida</option> 
<option value="GA">Georgia</option> 
<option value="HI">Hawaii</option> 
<option value="ID">Idaho</option> 
<option value="IL">Illinois</option> 
<option value="IN">Indiana</option> 
<option value="IA">Iowa</option> 
<option value="KS">Kansas</option> 
<option value="KY">Kentucky</option> 
<option value="LA">Louisiana</option> 
<option value="ME">Maine</option> 
<option value="MD">Maryland</option> 
<option value="MA">Massachusetts</option> 
<option value="MI">Michigan</option> 
<option value="MN">Minnesota</option> 
<option value="MS">Mississippi</option> 
<option value="MO">Missouri</option> 
<option value="MT">Montana</option> 
<option value="NE">Nebraska</option> 
<option value="NV">Nevada</option> 
<option value="NH">New Hampshire</option> 
<option value="NJ">New Jersey</option> 
<option value="NM">New Mexico</option> 
<option value="NY">New York</option> 
<option value="NC">North Carolina</option> 
<option value="ND">North Dakota</option> 
<option value="OH">Ohio</option> 
<option value="OK">Oklahoma</option> 
<option value="OR">Oregon</option> 
<option value="PA">Pennsylvania</option> 
<option value="RI">Rhode Island</option> 
<option value="SC">South Carolina</option> 
<option value="SD">South Dakota</option> 
<option value="TN">Tennessee</option> 
<option value="TX">Texas</option> 
<option value="UT">Utah</option> 
<option value="VT">Vermont</option> 
<option value="VA">Virginia</option> 
<option value="WA">Washington</option> 
<option value="WV">West Virginia</option> 
<option value="WI">Wisconsin</option> 
<option value="WY">Wyoming</option>
</select>
EOT;
  if ($state!="") {
    $rv = str_replace($state."\"",$state."\" SELECTED",$rv);
  } else {
    $rv = str_replace(">New Jersey", " SELECTED>New Jersey",$rv);
  }
  return $rv;
}
?>