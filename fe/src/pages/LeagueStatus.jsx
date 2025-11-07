import React from 'react';
import '../css/yyl.css';
import { Card } from 'react-bootstrap';
const LeagueStatus = ({ text }) => {

	let status = (text.toString()).replace(/\r\n/g, "<BR>");
	status = status.replace(/closed/g,"<font color=red>closed</font>");
	status = status.replace(/open/g,"<font color=green>open</font>");
	return (
		<Card className="mb-4">
		  <Card.Header className="bg-primary text-white">League Status</Card.Header>
			<Card.Body dangerouslySetInnerHTML={{ __html: status }} />
		</Card>
	)
};
export default LeagueStatus;