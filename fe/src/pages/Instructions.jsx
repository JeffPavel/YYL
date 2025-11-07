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
If you want one, select 'New Bag = Yes' to add the $15 to your purchase & leave 'New YYL Player' unchecked.
If you do not want one, select 'New Bag = No' & leave 'New YYL Player' unchecked. This is the default setting.
</p>
<hr className="bannerhr"/>
</div>
)
};

export default Instructions;