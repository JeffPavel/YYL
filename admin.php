<?php
include "util.inc";
### authentication
if (!isset($_COOKIE["user2014"]))
  header("Location: ".$adminlogin_url);
###
if ($_REQUEST['editplayer']) {
  $query="update players set name=\"".$_REQUEST['pname']."\"";
  $query.=",age=".$_REQUEST['page'];
  $query.=",grade=".$_REQUEST['pgrade'];
  $query.=",shirt=".$_REQUEST['pshirt'];
  $query.=",school=\"".$_REQUEST['pschool']."\"";
  $query.=",new_bag=".$_REQUEST['pnew_bag'];
  $query.=",gender=\"".$_REQUEST['pgender']."\"";
  $query.=",returning_player=".$_REQUEST['preturning_player'];
  $query.=" where id=".$_REQUEST['pid'];
  print "$query";
  mysql_query($query);
} elseif ($_REQUEST['edituser']) {
  $query="update users set last_name=\"".$_REQUEST['last_name']."\"";
#  $query.=",last_name=\"";
#  $query.=$_REQUEST['last_name'];
#  $query.="\"";
  $query.=",email=\"";
  $query.=$_REQUEST['email'];
  $query.="\"";
  $query.=" where id=".$_REQUEST['userid'];
  print "$query";
  mysql_query($query);
} else {
  set_custom($_POST);
}
if ($_GET) {
  if ($_GET['action'] == 'delete_user') {
    delete_user($_GET['id']);
  } elseif ($_GET['action'] == 'delete_player') {
    delete_player($_GET['id']);
  }
 }
$results = get_reg_all();
$custom = get_custom();
$trans = get_transactions();

#print_r($results);
?>
<HTML>
<HEAD>
<script type="text/javascript" src="//code.jquery.com/jquery-1.9.1.js"></script>
<script type="text/javascript" src="//code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
<script type="text/javascript" src="scripts/admin.js"></script>
<style>
  .floating {
height: 500px;
width: 300px;
right: 0;
top: 0;
margin: 2px;
padding: 5px;
position: fixed;
background-color: #DDDDDD;
display: none;
  }
  .innerfloating {
    background-color: #EEEEEE;
    height: 100%;
border: 1px;
   }
  .fltop {
position: relative;
    float: left;
cursor: move;
   }
  .flclose {
position: relative;
    float: right;
cursor: pointer;
color: red;
    font-size: 12px;
   }
</style>
</headl>
<BODY>
<HR>
<A HREF="gencsv.php"> Download CSV </a>
<HR>
<form name=fee action=admin.php method=post>
<TABLE>
<div class="floating" id="edit_user">
  <div class="fltop">  Edit user Information </div>
  <div class="flclose" onClick="hide();">Close</div>
  <div class="innerfloating" id="formdata"><BR></div>
</div>
</div>
<script>
  $(function() {
      $( "#edit_user" ).draggable();
    });

  </script>
<?php
  print "Welcome " . $_COOKIE["user"] . "!<br>";
#print_r($custom);
foreach ($custom as $row) {
  if ($row['type'] == 'fee') {
    print "<TR><TD>". $row['custom_field']." <TD> <input name=\"$row[custom_field]\" value=".$row['custom_value'].">";
  } elseif ($row['type'] == 'text') {
    print "<TR><TD> ". $row['custom_field']." <TD> <textarea cols=30 rows=4 name=\"$row[custom_field]\">".$row['custom_value']." </textarea>";
  }
  if ($row['fee'] == 'sponsor') {
    $sponsorfee=$row['amount'];
  } else {
    $fee = $row['amount'];
  }
}
print "<TR><TD colspan=2 align=middle> <input type=submit>";
?>
</TABLE>
</form>

<Table border=1> <TR><TD colspan=9 align=center> Breakdown of paid players </TR>
<TR><TD> 1st grade boys <TD> 1st grade girls <TD> 2-4th grade boys <TD> 2-4th grade girls
<TD> 5-8th grade boys <TD> 5-8th grade girls <TD> TOTAL PAID PLAYERS <TD> Total GROSS <TD> Total NET
<TR>
<?php
print"<TD align=center>";
print get_players_by_grade(1,1,'M');
print"<TD align=center>";
print get_players_by_grade(1,1,'F');
print"<TD align=center>";
print get_players_by_grade(2,4,'M');
print"<TD align=center>";
print get_players_by_grade(2,4,'F');
print"<TD align=center>";
print get_players_by_grade(5,8,'M');
print"<TD align=center>";
print get_players_by_grade(5,8,'F');
print"<TD align=center>";
print get_total_paid_players();
print"<TD align=center>";
print $trans['total'];
print"<TD align=center style=\"background-color: #BBFFBB\">";
$t = $trans['total'] - $trans['total'] * 0.029 - $trans['count']*.30;
print $t;
?>
</TABLE>


<table cellspacing=3 cellpadding=3><TR>
<TD align=center>User Id
<TD align=center>Email
<TD align=center>Name
<TD align=center>Phone
<TD align=center>Number of registered Players
<TD align=center>Number of paid Players
<TD align=center>Payment 
<TD align=center>Payment Date
<TD align=center>Refund
<TD>
<?php
$action="admin.php";
foreach ($results as $row) {
  $id = $row['id'];
  if ($resultsbyid[$id]) {
    if ($row['amount']>0 && $resultsbyid[$id]['amount']) { #make sure refunded rows don't count
      $resultsbyid[$id]['num_players']+=$row['num_players'];
      $resultsbyid[$id]['amount']+=$row['amount'];
      $resultsbyid[$id]['otherpayments'][] = $row['payment_date'];
    }
  } else {
    $resultsbyid[$id] = $row;
  }
}

foreach ($resultsbyid as $id => $row) {

  if ($row['confirmed']==1) { 
    print "<TR bgcolor=EEFFEE>";
  } else {
    print "<TR bgcolor=FFEEEE>";
  }
  print "<TD>$row[id]";
  print "<TD>$row[email]";
  print "<TD onClick=\"getUserInfo('$row[email]');\">$row[first_name] $row[last_name]";
  print "<TD>$row[phone]";
  $num_players = count($row['players']);

  if ($num_players < $row['num_players']) {
    print "<TD style=\"border: 2px red dashed;\" align=center>".$num_players;
    print "<TD style=\"border: 2px red dashed;\" align=center>".$row['num_players'];
  } else {
    print "<TD align=center>".$num_players;
    print "<TD align=center>".$row['num_players'];
  }
  print "<TD>";
  if ($row['confirmed']==1) {
    print "$row[amount]";
    $total+=$row['amount'];
    $players+=$num_players;
  }
  
#  print "<TD>";
#   if ($row['sponsor']==1) {
#     print "Sponsor: ".$row['sponsor_name'];
#  }
   print "<TD> $row[payment_date]";
   if ($row['otherpayments']) {
     for ($i=0;$i<count($row['otherpayments']);$i++) {
       print "<BR>";
       print $row['otherpayments'][$i];
     }
   }
   print "<TD>  ";
   if ($row['refund']!=0) {
     print "<font color = red> ! </font> ";
     print $row['refund'];
   }
   print "<TD>  ";
   if ($row['confirmed']!=1) {
     print "<A onclick=\"return confirm('Are you sure you want to delete family $row[last_name]?')\" href=$action?action=delete_user&id=$row[id]><img alt=\"delete user\" title=\"delete user $row[first_name] $row[last_name]\" border=0 src=\"images/x.gif\"></A>";

   }
   print "<TR><TD><TD><TD colspan=7>";
    if ($num_players>0) {
      print " <font size=-1>";
      for ($i=0;$i<$num_players;$i++) {

	$name = $row['players'][$i]['name']; 
	$id = $row['players'][$i]['id']; 
	if ($row['players'][$i]['paid']==1) {
	  $style="\"background-color: BBFFBB\"";
	} else {
	  $style="\"background-color: FFBBBB\"";
	}
        $school_full = $row['players'][$i]['school'];
	print "(<span title=\"$school_full\" style=$style onClick=\"getPlayerInfo($id);\">$name</span>)";
	print ", ";
	print ("grade: ".$row['players'][$i]['grade'].", ");
#	print ("age: ".$row['players'][$i]['age'].", ");
	print ("(".$row['players'][$i]['gender']."), ");
	$school=substr($row['players'][$i]['school'],0,4);
	print ("<span title=\"$school_full\">(".$school.")</span> ");



	if ($row['players'][$i]['new_bag']) {
	  print "(new bag) ";
	}
	print "&nbsp;";
	print "<A onclick=\"return confirm('Are you sure you want to delete player $name?')\" href=$action?action=delete_player&id=$id><img width=12 height=12 alt=\"delete $name\" title=\"delete $name\" border=0 src=\"x.gif\"></A>";
	if ($i <$num_players-1) {
	  print " | ";
	}
      }
      print "</font>";
    }


}

print "<TR><TD colspan=3 align=middle><b> Total confirmed: <span> <font size=+1> $players </span>";
print "<TD colspan=3 align=middle> <b>Total collected: $<span><font size=+1>$total</span>";
print "</table>";
?>
<font color=red> ! </font> - order fully or partially refunded
</body>
</html>