import React from 'react';
import '../css/yyl.css';

const Instructions = ({ regfee, newbagfee}) => {
	
	return(
		<div>
		<p className="banner">
              Use this form to register SECURELY online. Please note that you will not be registered until you have completed all steps and confirmed your payment information.
       </p>
<p className="banner">
Registration Fee:
</p>
<p className="banner">
Grades K-8: { regfee } (includes jersey and hat)
</p>
<p className="banner">
All new YYL players get a league bag as our gift. Select the box 'New YYL Player' for these children.
</p>
<p className="banner">
Returning players can purchase a league bag for ${ newbagfee }.
If you want one, select 'New Bag = Yes' to add the ${ newbagfee } to your purchase & leave 'New YYL Player' unchecked.
If you do not want one, select 'New Bag = No' & leave 'New YYL Player' unchecked. This is the default setting.
</p>
<p className="banner info-text-container">
     Click here for <a target="_blank" href="https://docs.google.com/document/d/1_qOR0tEVtxxVBisk322qNZgQs3BbhPaWZLF7ug-kBR8/edit?hl=en&authkey=CLOQrdgG"> Registration Instructions </a> 
</p>
</div>
)
};

export default Instructions;