<?php
function yyl_header() {
$rv = <<< EOT
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head><link rel='shortcut icon' href='favicon.jpg' />
<link rel='icon' href='favicon.jpg' /><meta http-equiv="Content-Type" content="text/html; charset=utf-8" />    
<title>Yavneh Youth League</title>
    <meta name="description" content="A Shomer Shabbat baseball little league affiliated with Yavneh Academy and serving 
the children attending the Jewish day schools throughout Northern New Jersey."/>
    <meta name="keywords" content="yavneh jewish baseball shabbat shabbos yeshiva softball little league"/>
    <meta http-equiv='Content-Type' content='text/html;charset=utf-8' />
    <meta http-equiv='Content-Location' content='/Home.html' />
    <style>
    body { margin:0; padding:0; }
    </style>
    <script type='text/javascript' src='scripts/imageSwap.js'></script>
    <script type='text/javascript' src='scripts/ajax.js'></script>
    <script type='text/javascript' src='scripts/mootools.js'></script>

    <link rel='stylesheet' type='text/css' id='layout1.css' href='css/newyyl.css' />

</head><body>
<div class="header_background">
	&nbsp;
</div>
<div class="header">

EOT;
$home = 'http://www.yavnehyouthleague.com/';
$menuleft = array("STANDINGS","SCHEDULE","FIELDS");
$rv.="<div class=header_first_link_left> <A HREF=$home> HOME </A> </div>";  
foreach ($menuleft as $menuitem) {
  $rv.="<div class=header_link_left_break> | </div>";  
  $rv.="<div class=header_link_left> <A HREF=$home/" . strtolower($menuitem) . "> $menuitem </A> </div>";  
}

$rv.= <<< EOT
<div class="header_image">
<img src="images/logo.png">
</div>
EOT;

$menuright = array("SPONSORS", "FAQ");
$rv.="<div class=header_last_link_right> <A HREF=$home/contact> CONTACT</A> </div>";  
foreach ($menuright as $menuitem) {
  $rv.="<div class=header_link_right_break> | </div>";  
  $rv.="<div class=header_link_right> <A HREF=$home/" . strtolower($menuitem) . "> $menuitem </A> </div>";  
}
  $rv.="<div class=header_link_right_break> | </div>";  
  $rv.="<div class=header_link_right> <A HREF=$home/readings> RULES & READINGS </A> </div>";  

$rv.="</div>";
return $rv;
}