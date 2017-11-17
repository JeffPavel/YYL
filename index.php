<?php include "util.inc"; ?>
<?php include "html.inc"; ?>
<?php
print yyl_header();

###get fees from db
$regtext = get_custom_value("reg_text");

$regfee = get_custom_value("registration");
$newbagfee = get_custom_value("new_bag");
$divtext = get_custom_value("division");
$passcode = get_custom_value("passcode");
$disclaimer = get_custom_value("disclaimer");
###


if ($_SERVER['REQUEST_METHOD'] === POST ) {
  if ($_POST['Change']) {
    $update=1;
  }

  if ($_POST['Register']) {
    #register form received
    if (!checkregistered($_POST)) {
      register_user($_POST);
    } else {
      $info=get_reg_info($_POST); 
      if ($info['confirmed']==0) {
	update($_POST);
      } else {
	$message="ar";
      }
    }
    $loggedin=1;
  }

  if ($_POST['Update']) {
    update_reg($_POST);
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
     $update=1;

   }
 }

?>

<div class=banner align=center>
Use this form to register SECURELY online.
  Please note that you will not be registered until you have completed all steps and confirmed your payment information.
  <div class=note3> <?php print nl2br($regtext) ?> </div>
</div>

<?php
if ($message == "ar") {
  print "<div id=\"message\" class=\"message\">";
  print "Error: <BR>";
  print "User <span>".$_POST['email']."</span> is already registered and payment was received. If you wish to register more players (or wish to sponsor a team), please contact <span>commissioner@yavnehyouthleague.com</span>.";
  print "</div>";
  exit (0);
} elseif ($message == "badlogin") {
  print "Invalid login.";
}
?>

<?php
$sponsor=0;
if ($_POST['sponsor'] == 'on') {
  $sponsor = 1;
 }

$discount=4*$fee;

if ($info && !$update) {
  print "  <div id=\"update\" class=main>";

  if ($confirmed) {
    print "Your reservation for Yavneh Youth League is confirmed.<BR>";
    print "<A HREF=\"http://www.yavnehyouthleague.com\"> Home </a> ";
  } else {
    $num_players = count($info['players']);
    $amount=calculate_reg_amount($regfee,$newbagfee,$info);

    print "<span class=ty>";
    print "Please note that your registration is not final until payment is complete. </span>";
    print "<TABLE class=reg_form width=600><TR><TD> Email: <TD> ".$info['email'];
    print "<TR><TD> Family Name: <TD> ".$info['last_name'];
    print "<TR><TD> Number of players <TD>". $num_players;
    if ($num_players>0) {
      print " (";
      for ($i=0;$i<$num_players;$i++) {
	print ($info['players'][$i]['name']);
	if ($i <$num_players-1) {
	  print ", ";
	}
      }
      print ") ";
    }
    print "<TR><TD> Total: <TD> $".$amount;
    print "</table>";
    print "<form name=updateform method=post action=index.php>";
    print "<input type=\"hidden\"  name=\"email\" value=\"".$info['email']."\">";
    print "<input type=\"hidden\" name=\"fn\" value=\"".$info['first_name']."\">";
    print "<input type=\"hidden\" name=\"ln\" value=\"".$info['last_name']."\">";
    print "<input type=\"hidden\" name=\"phone\" value=\"".$info['phone']."\">";
    print "<input type=\"hidden\" name=\"cell1\" value=\"".$info['cell1']."\">";
    print "<input type=\"hidden\" name=\"cell2\" value=\"".$info['cell2']."\">";
    print "<input type=\"hidden\" name=\"addr1\" value=\"".$info['addr1']."\">";
    print "<input type=\"hidden\" name=\"addr2\" value=\"".$info['addr2']."\">";
    print "<input type=\"hidden\" name=\"city\" value=\"".$info['city']."\">";
    print "<input type=\"hidden\" name=\"state\" value=\"".$info['state']."\">";
    print "<input type=\"hidden\" name=\"zip\" value=\"".$info['zip']."\">";
    print "<input type=\"hidden\" name=\"insurance\" value=\"".$info['insurance']."\">";
    print "<input type=\"hidden\" name=\"policy\" value=\"".$info['policy']."\">";

    $index=0;
    if (count($info['players'])>0) {
      foreach ($info['players'] as $player) {
	print "<input type=\"hidden\" name=\"pname";
	print $index;
	print "value=\"".$player['pname'].$index."\">";
	print "<input type=\"hidden\" name=\"pschool";
	print $index;
	print "value=\"".$player['pschool'].$index."\">";
	print "<input type=\"hidden\" name=\"page";
	print $index;
	print "value=\"".$player['page'].$index."\">";

	print "<input type=\"hidden\" name=\"psex";
	print $index;
	print "value=\"".$player['psex'].$index."\">";

	$index++;
      }
    } else {
      
    }
    if ($sponsor) {
      print "<input type=\"hidden\" name=\"sponsor\" value=\"on\">";
    }
    print "<input type=\"hidden\" name=\"Change\" value=\"Change\">";
    print "</form>";


#    print "<span class=note3> complete your registration by paying securely with your PayPal account or with a credit card through PayPal.</SPAN> <BR>";
#    print "<span class=note>(Paypal account not required - you can use your credit card by clicking the 'Continue' link on the payment page.)</span>";
#    print_r($info);


?>
<script type="text/javascript">
   function acceptconditions() {
      var dis = document.getElementById("disclaimer");
      dis.style.display = "none";
      var pay = document.getElementById("paymentbutton");
      pay.style.display = "block";
    }
</script>
<DIV id="disclaimer" >
<TABLE><TR><TD class="main"> 
<span> 
<font size=+1>  Terms and Conditions:
</font>
<P>
<?php
    print $disclaimer;
?>
<BR>
<HR width=500>
<HR width=500>
<HR width=500>
  <input type="button" onClick="acceptconditions()"; style="padding: 7px; font-size: 18px; width: 140px" value="I Accept"> 
  <input onClick="document.updateform.submit();return false;" style="padding: 7px; font-size: 18px; width: 140px" type="button" value="Change Info"> 

</TABLE>
</div>

<div id="paymentbutton" style="display: none;">
<?php
  print paypal_link($amount,$info['id'],$info['players']);
  }
?>


<HR width=500>
<HR width=500>
<HR width=500>

  <input onClick="document.paypalform.submit();return false;" style="padding: 7px; font-size: 18px; width: 140px" type="button" value="Finalize & Pay"> 
  <input onClick="document.updateform.submit();return false;" style="padding: 7px; font-size: 18px; width: 140px" type="button" value="Change Info"> 
 <DIV> <span class=note5> Once your registration is complete, you will get a payment confirmation emailed to you at the address you provide to PayPal</div>
<?php  
 } else {
?>
<div class=main>
<span class=note>
Click here for <A target=_blank HREF="https://docs.google.com/document/d/1_qOR0tEVtxxVBisk322qNZgQs3BbhPaWZLF7ug-kBR8/edit?hl=en&authkey=CLOQrdgG"> Registration Instructions </A> <span> 
</div>
<?php
#
# Register/update form
#
?>
<div id="register" class=main> 
<FORM name="register" action="index.php" method="post" onSubmit="return checkform(this);">
<TABLE class="reg_form"> 
<TR class="subheading"> <TD colspan=2 > Family Information
<TR> <TD> <span class=required> Parent 1 Email:  </span> <TD>
    <?php if ($update == 1) {
    print "<input type=hidden name=email value=".$info['email'].">". $info['email'];
  } else {
?>
 <INPUT TYPE="text" onBlur="clearMe(this);checkuser(this);" name="email" value="<?php print $info['email']; ?>">
      <?php }
  if (!$info['email']) {
    print  "&larr;<span class=note4>  Please make sure this email is accurate </span>";
  }
?>
<TR> <TD> Parent 2 Email: <TD> <INPUT TYPE="text" name="email2" value="<?php print $info['email2']; ?>"><BR>
<TR> <TD> <span class=required> Last Name: </span> <TD><INPUT TYPE="text" name="ln" onBlur="clearMe(this)" value="<?php print $info['last_name']; ?>"><BR>
<TR> <TD> Mother's Name: <TD><INPUT TYPE="text" name="mother_name" value="<?php print $info['mother_name']; ?>"><BR>
<TR> <TD> Father's Name: <TD><INPUT TYPE="text" name="father_name" value="<?php print $info['father_name']; ?>"><BR>
<!-- ###
<TR><TD colspan=2 class="note"> This will be used as your username 
<TR> <TD> Password: <TD><INPUT TYPE="password" name="password"><BR>
<TR> <TD> Confirm Password: <TD><INPUT TYPE="password" name="conf"><BR> 
<TR> <TD> First Name: <TD><INPUT TYPE="text" name="fn" value="<?php print $info['first_name']; ?>"><BR>
-->

   <TR> <TD> <span class=required> Home Phone: </span> <TD>  <INPUT TYPE="text" onBlur="clearMe(this)" maxlength=15 size=15 name="phone" value="<?php print $info['phone']; ?>"><BR> <span class=note5> 
<TR> <TD> Mother's Cell Phone: <TD>  <INPUT TYPE="text" name="cell1" value="<?php print $info['cell1']; ?>"><BR> 
<TR> <TD> Father's Cell Phone : <TD>  <INPUT TYPE="text" name="cell2" value="<?php print $info['cell2']; ?>"><BR> 
    <TR><TD> Preferred Auto-Call Phone Number:
<TD>
<?php
    if ($info['pref_contact'] == 'cell1' || $info['pref_contact'] == 'cell2') {
      print "<input type=radio name=pref_contact value=home > Home";
    } else {
      print "<input type=radio name=pref_contact value=home checked> Home";
    }
?>
    <input type=radio name=pref_contact value=cell1> Mother's Cell
    <input type=radio name=pref_contact value=cell2> Father's Cell
<TR> <TD> Address: <TD>  <INPUT TYPE="text" onBlur="clearMe(this)" name="addr1" value="<?php print $info['addr1']; ?>"><BR>
<TR> <TD> Address (cont): <TD>  <INPUT TYPE="text" name="addr2" value="<?php print $info['addr2']; ?>"><BR>
<TR> <TD> City: <TD>  <INPUT TYPE="text" onBlur="clearMe(this)" name="city" value="<?php print $info['city']; ?>"><BR>
<TR> <TD> State: <TD>  <?php print getStateSelect($info['state']); ?>
<TR> <TD> Zip Code: <TD> <INPUT TYPE="text" onBlur="clearMe(this)" name="zip" value="<?php print $info['zip']; ?>"><BR> 
<!-- <TR> <TD width=360> Insurance Carrier: <INPUT TYPE="text" onBlur="clearMe(this)" name="insurance" value="<?php print $info['insurance']; ?>"><BR> 
								
 <TD> Policy number: <INPUT TYPE="text" name="policy" onBlur="clearMe(this)" value="<?php print $info['policy']; ?>"><BR> 
-->
<TR> <TD width=360> Emergency Contact: <INPUT TYPE="text" name="ecn" value="<?php print $info['emerg_cont_name']; ?>"><BR> 
								
 <TD> Emergency Contact Phone: <INPUT TYPE="text" name="ecp" value="<?php print $info['emerg_cont_phone']; ?>"><BR> 
   <TR><TD colspan=2> Additional comments: <INPUT TYPE="text" name="comments" maxlength=50 size=50 value="<?php print $info['comments']; ?>">
   &larr; <span class=note4> No teammate requests accepted </span>
<!-- 
<TR > <TD align=right> <input type="checkbox" name="sponsor" onClick="toggleSponsorName(this)"
<?php if ($info['sponsor']=='on' || $info['sponsor']==1) print "checked"; ?> >  I am interested in sponsoring a team (
$<?php print $sponsorfee; ?> )
-->

<!--
<TR> <TD> Sponsorship name: <TD>  <INPUT TYPE="text" name="sponsor_name" value="<?php print $_POST['sponsor_name']; ?>" 

-->
<BR>
<TR class="subheading"> <TD colspan=2 style="padding-bottom: 5px;"> Player Information 

<TR><TD align=center colspan=2>
  <div id=divinfo class="myhidden"><?php print $divtext; ?></div>
<div id='divinfodisplay'> <?php 
		  $divtext = str_replace("closed","<span style=\"color: #990000;\">closed</span>",$divtext);
print nl2br($divtext); 

?> </div>

<TR><TD> Players for upcoming season: 
<select id="playerSelect" name="num_players" onChange="showhideplayerdivs()">
<?php 
  $num_p = count($info['players']);
  if ($num_p>0) {
#    print "<input type=hidden name=num_players value=$num_p> <span class=note> $num_p </span>";
    for ($i=$num_p;$i<5;$i++) {
      print "<option  value=$i> $i </option>";
    }
  } else {
?> 
<option value=1> 1
<option value=2> 2
<option value=3> 3
<option value=4> 4
<?php
      }
?>
</select>
</TABLE>
<?php 
  print player_form(1,$info['players'][0],false,$newbagfee);
  for ($n=2;$n<5;$n++) {
    print "<TR><TD colspan=2><HR width=500>";
    $hidden=true;
    if ($info['players'][$n-1]) {
      $hidden=false;
    } 
    print player_form($n,$info['players'][$n-1],$hidden,$newbagfee);

  }

?>

<BR><BR>
   <input type=hidden id="passcode" style="display:none" value="<?php print str_rot13($passcode); ?>">
<TABLE>
<TR> <TD colspan=2 align=center >

   <?php if ($passcode) { ?>
   Registration passcode (provided by commissioner)
   <input type="text" id="passcodetext">
     <?php } ?>
  <?php if ($update) { ?>
<input type=hidden name="id" value="<?php print $info['id']; ?>">

<INPUT id="next" TYPE=submit name="Update" style="padding: 10px; font-size: 18px; width: 100px" value="Next">
			   <?php } else { ?>
<INPUT id="next" TYPE=submit style="padding: 10px; font-size: 18px; width: 100px" name="Register" value ="Next">

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
