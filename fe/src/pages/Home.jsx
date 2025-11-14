import React, { useEffect, useState } from 'react';
import Header from './Header';
import Instructions from './Instructions';
import RegistrationForm from './RegistrationForm';
import { Remote } from '../api/Remote';

const Home = () => {

	const [regfee, setRegfee] = useState(0);
	const [newbagfee, setNewbagfee] = useState(0);
	const [divtext, setDivtext] = useState([]);
	const [passcode, setPasscode] = useState("");
	const [terms, setTerms] = useState("");

    useEffect(() => {
		async function fetchData() {
			console.log('Getting setup data...');
			const c = await Remote.getInfo();
			setRegfee(Number(c.regfee));
			setNewbagfee(Number(c.newbagfee));
			setDivtext(c.divtext);
			setPasscode(c.passcode);
			setTerms(c.disclaimer);
		}
		fetchData();
	}, []);

	return (
		<div className="home-container">
			<Instructions regfee={regfee} newbagfee={newbagfee}/>
			<RegistrationForm costPerPlayer={regfee} newBagFee={newbagfee} serverStatusData={divtext} requiredPasscode={passcode} terms={terms} />
		</div>
	)
};

export default Home;