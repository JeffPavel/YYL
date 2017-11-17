<?php
include "util.inc";
$fp = fopen("payment_log", 'a'); 
fwrite($fp,"----------------------------------------------\n");
$today = date("F j, Y, g:i a\n"); 
fwrite($fp,$today);

if ($_POST) {
  fwrite ($fp, print_r($_POST,true));

  $email=$_POST['payer_email'];
  $orderid=$_POST['item_name'];
  $item_number=$_POST['item_number'];
  $amount=$_POST['payment_gross'];
  $txn_id=$_POST['txn_id'];
  $parent_txn_id=$_POST['parent_txn_id'];
#  print_r($_POST);

  $ordera=explode("_",$orderid);
  if ($ordera[0]=='bbq') {
    $userid = $ordera[1];
    $query = "update bbq2011 set confirmed=1,amount=$amount,payment_date=now() where user_id=$userid";
  } else {
    $userid = $ordera[2];
    $paid_players = $ordera[3];


    $q = "select * from yyl_reg where txn_id = \"$parent_txn_id\"";
    print $q;
    print "<BR>";
    $res2 = mysql_query($q);
    ### check for refund or additional payment
    if (mysql_num_rows($res2) > 0) {
      $row = mysql_fetch_assoc($res2); 
      $txn_id = $row['txn_id'];
      $refund = 0;
      if ($amount < 0) {
	$refund = $amount;
      }
      $query = "update yyl_reg set amount=amount+$amount,refund=$refund where txn_id = \"$txn_id\"";

    } else {
      ### new transaction
      $query = "insert into yyl_reg (payment_id,user_id,amount,num_players,payment_date,confirmed,txn_id,original_amount) values (NULL,$userid,$amount,$paid_players,now(),1,\"$txn_id\",$amount)";
      $players=explode("_",$item_number);
      $user_id = array_shift($players);
      $players_where_clause = "";
      while ($playerid = array_shift($players)) {
	$playerquery = "update players set paid=1 where id=".$playerid;
	$res = mysql_query($playerquery);
      }
    }
    print "$query\n<BR>";
    $res = mysql_query($query);
  }
 }

fclose($fp);


