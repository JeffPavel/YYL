<?php 
include "util.inc"; 
$users = get_reg_csv();
$sep = "\t";

$fp = fopen("yylall.txt", 'w'); 
$fppaid = fopen("yylpaid.txt", 'w'); 
fwrite($fp,"Last Name\tNumbPlayers\te-mail address\tAlternate email\t Mother's Name\tFather's Name\tHome Phone #\tMother's Cell Phone\tFather's Cell Phone\tPreferred AutoCall #\tAddress1\t Address2\t City\tState\tZip\tInsurance\tPolicy#\tEmerg Name\tEmerg Phone #\tFamily Comment\tName\tNew Player\t Paid Amt\tNew Bag\tRec Date 10\tAge\tM/F\tGrade\tSize\tSchool\n");
fwrite($fppaid,"Last Name\tNumbPlayers\te-mail address\tAlternate email\t Mother's Name\tFather's Name\tHome Phone #\tPreferred AutoCallH\tMother's Cell Phone\tPreferred AutoCallM\tFather's Cell Phone\tPreferred AutoCallF\tAddress1\t Address2\t City\tState\tZip\tInsurance\tPolicy#\tEmerg Name\tEmerg Phone #\tFamily Comment\tName\tNew Player\t Paid Amt\tNew Bag\tRec Date 10\tAge\tM/F\tGrade\tSize\tSchool\n");
$p2 = null;
foreach ($users as $user) {
  if ($user['players']) {
    $n=count($user['players']);
    $p2=array();
    $p=array();
    $p3=array();
    $query = "select sum(amount) as payment from yyl_reg where user_id=".$user['id'];
    $res = mysql_query($query);
    $row = mysql_fetch_assoc($res);
    $payment = $row['payment'];
    if ($payment>0) {
      $query = "select num_players,payment_date,amount from yyl_reg where user_id=".$user['id'];
      $res = mysql_query($query);
      while(($p[] = mysql_fetch_assoc($res)) || array_pop($p));
      $p2=null;
      $p3=null;
      if ($p) {
	foreach ($p as $payment) {
#	print "$i:$payment[amount],$payment[num_players]<BR>";
	  for($j=0;$j<$payment['num_players'];$j++) {
	    $money=$payment['amount']*1.0/$payment['num_players']*1.0;
	    $per_player = sprintf("%01.2f", $money);
	    $p2[] = $per_player;
	    $p3[] = $payment['payment_date'];
	  }
	}
      }
    }
    #    $money=$payment*1.0/$n*1.0;
    #    $per_player = sprintf("%01.2f", $money);

    $i=0;
    foreach ($user['players'] as $player) {

      $str = $user['last_name'].$sep.$n.$sep.$user['email'].$sep.$user['email2'].$sep.$user['mother_name'];
      $str.=$sep.$user['father_name'].$sep.$user['phone'].$sep;
#      if ($user['pref_contact'] == 'home') {
#	$str.='Yes';
#      } else {
#	$str.='No';
#      }
      $str.=$user['cell1'].$sep;
#      if ($user['pref_contact'] == 'cell1') {
#	$str.='Yes';
#      } else {
#	$str.='No';
#      }
      $str.=$user['cell2'].$sep;
      if ($user['pref_contact'] == 'cell2') {
	if ($user['cell2']) {
	  $str.=$user['cell2'];
	} else {
	  $str.=$user['phone'];
	}
      } elseif ($user['pref_contact'] == 'cell1') {
	if ($user['cell1']) {
	  $str.=$user['cell1'];
	} else {
	  $str.=$user['phone'];
	}
      } else {
	  $str.=$user['phone'];
      }
      $str.=$sep; #TODO received
      $str.=$user['addr1'].$sep;
      $str.=$user['addr2'].$sep;
      $str.=$user['city'].$sep;
      $str.=$user['state'].$sep;
      $str.=$user['zip'].$sep;
      $str.=$user['insurance'].$sep;
      $str.=$user['policy'].$sep;
      $str.=$user['emerg_cont_name'].$sep;
      $str.=$user['emerg_cont_phone'].$sep;
      $str.=$user['comment'].$sep;
      $str.=$player['name'].$sep;
      if ($player['returning_player']) {
	$str.='Yes'.$sep;
      } else {
	$str.='No'.$sep;
      }
      if ($p2[$i]>0) {
#	print $user['id']." ".$user['email'].":".$per_player."<BR>";
	$str.=$p2[$i].$sep;
      } else {
	$str.=$sep;
      }

      if ($player['new_bag']) {
	$str.="Yes".$sep;
      } else {
	$str.="No".$sep;
      }
      $str.=$p3[$i].$sep; #TODO received
      $str.=$player['age'].$sep;
      $str.=$player['gender'].$sep;
      if ($player['grade']==0) {
	$str.='K'.$sep;
      } else {
	$str.=$player['grade'].$sep;
      }
      $str.=get_shirt_size($player['shirt']).$sep;
      $str.=$player['school'].$sep;

      $str.="\n";
#      print $str;
      fwrite($fp,$str);
      if ($p3[$i]>0) {
	fwrite($fppaid,$str);
      }
      $i++;
    }
  }
}
?>
Right click on the link to save file <BR>
<a href="yylpaid.txt"> Paid users only</a> <BR>
<a href="yylall.txt"> All users </a>