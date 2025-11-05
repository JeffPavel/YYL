<?php include "util.inc"; ?>
<?php include "html.inc"; ?>
<?php


###get fees from db
$regtext = get_custom_value("reg_text");
$regfee = get_custom_value("registration");
$newbagfee = get_custom_value("new_bag");
$divtext = get_custom_value("division");
$passcode = get_custom_value("passcode");
###


if ($_SERVER['REQUEST_METHOD'] === POST ) {


  if ($_POST['Change']) {
    $update=1;
  }

  if ($_POST['Addplayer']) {
    #register form received
    if (!checkregistered($_POST)) {
#      register_user($_POST);  # not registered users should not see this page
    }
    $num_players_added = add_player($_POST);
    $loggedin=1;
  }

  if ($_POST['Update']) {
    update_players($_POST);
    $update=0;
  }
  

  if ($_POST['Login']) {
    $id=validatelogin($_POST);

    if ($id<1) {
      $message = "badlogin";
    } else {
      $info = get_reg_info($_POST);
      $loggedin=1;
      $confirmed=$info['confirmed'];
    }
  }
  $info=get_reg_info($_POST);
#  print_r($info);
 } elseif ($_SERVER['REQUEST_METHOD'] === GET ) {
   if ($_GET['email']) {
     $info=get_reg_single($_GET['email']);
     $add=1;
   } else {
     header("Location: http://www.bestworldcoins.com/yyl");
   }
 }
print yyl_header();
?>

<div class=banner align=center>
Use this form to register SECURELY online.
  Please note that you will not be registered until you have completed all steps and confirmed your payment information.
  <div class=note3> <?php print nl2br($regtext) ?> </div>
</div>
<BR>
<div id=divinfo class="myhidden"><?php print $divtext; ?></div>
<div class="step">
    <?php if ($loggedin) {
  print "Step 2 of 3";
} else {
  print "Step 1 of 3";
 }
?>
</div>
<BR>

<?php
if ($info && !$add) {
  print "  <div id=\"update\" class=main>";

  if ($confirmed) {
    print "Your reservation for Yavneh Youth League is confirmed.<BR>";
    print "<A HREF=\"http://www.yavnehyouthleague.com\"> Home </a> ";
  } else {
    $num_players = count($info['players']);
    $added_players=get_unpaid_players($info['players']);
    $amount=calculate_update_amount($regfee,$newbagfee,$info,count($added_players));

    print "<span class=ty>";
    print "Please note that your registration is not final until payment is complete. </span>";
    print "<TABLE class=reg_form width=600><TR><TD> Email: <TD> ".$info['email'];
    print "<TR><TD> Family Name: <TD> ".$info['last_name'];
    print "<TR><TD> Number of players: <TD>". count($added_players);
    if ($num_players>0) {
      print " (";
      for ($i=0;$i<$num_players;$i++) {
	if ($info['players'][$i]['paid'] == 0) {
	  print ($info['players'][$i]['name']);
	  if ($i <$num_players-1) {
	    print ", ";
	  }
	}
      }
      print ") ";
    }
    print "<TR><TD> Total: <TD> $".$amount;
    print "</table>";
    print "<form name=updateform method=post action=add_player.php>";
    print "<input type=\"hidden\"  name=\"email\" value=\"".$info['email']."\">";
    print "<input type=\"hidden\" name=\"Change\" value=\"Change\">";
    print "</form>";

#    print "<A href=\"#\" class=note2 onClick=\"document.updateform.submit();return false;\"> Change your registration </A> or ";
#    print "<span class=note3> complete your registration by paying securely with your PayPal account or with a credit card through PayPal.</SPAN> <BR>";
#    print "<span class=note>(Paypal account not required - you can use your credit card by clicking the 'Continue' link on the payment page.)</span>";
#    print_r($info);
    print "<table><TR><TD> ".paypal_link($amount,$info['id'],$added_players);
?>
<CENTER>
<HR width=500>
<HR width=500>
<HR width=500>
</CENTER>
  <input onClick="document.paypalform.submit();return false;" style="padding: 7px; font-size: 18px; width: 140px" type="button" value="Finalize & Pay"> 



<?php
#  <input onClick="document.updateform.submit();return false;" style="padding: 7px; font-size: 18px; width: 140px" type="button" value="Change Info"> 
#    print "<TD> <span class=note><--  click here to make your payment </span></TABLE>";
  }
  print "</div>";
} else {
?>
<div id="register" class="main">
<FORM name="register" action="add_player.php" method="post" onSubmit="return checkplayers(this);">
<TABLE class="reg_form"> 
 <TR class="subheading"> <TD colspan=2 > Email:
<TR><TD><?php    print "<input type=hidden name=email value=".$info['email'].">". $info['email']; ?>

<TR class="subheading"> <TD colspan=2 > Registered players:
<TR><TD>
<?php 
print player_info($info['players']);
?>

<TR class="subheading"> <TD colspan=2 > Additional players to register
<TR><TD>
<select id="playerSelect" name="num_players" onChange="showhideplayerdivs()">
<option value=1> 1
<option value=2> 2
<option value=3> 3
<option value=4> 4
</select>
</TABLE>
<?php 
  print player_form(1,null,false,$newbagfee);
  for ($n=2;$n<5;$n++) {
    $hidden=true;
    print player_form($n,null,$hidden,$newbagfee);
    print "<TR><TD colspan=2><HR width=500>";
  }

?>


<BR><BR>

   <input type=hidden id="passcode" style="display:none" value="<?php print str_rot13($passcode); ?>">
<TABLE>
<TR> <TD colspan=2 align=center>

   <?php if ($passcode) { ?>
   Registration passcode (provided by commissioner)
   <input type="text" id="passcodetext">
     <?php } ?>


  <?php if ($update) { ?>
<input type=hidden name="id" value="<?php print $info['id']; ?>">

<INPUT TYPE=submit name="Update" style="padding: 10px; font-size: 18px; width: 100px" value="Next">
			   <?php } else { ?>
<INPUT TYPE=submit style="padding: 10px; font-size: 18px; width: 100px" name="Addplayer" value ="Next">

      <?php }
 }
?>

</TABLE>
</FORM>
</div>
<div class=footer2>
Copyright <script type='text/javascript'> document.write((new Date()).getFullYear());</script>, Yavneh Youth League. All rights reserved.</div>

</body>
</html>
