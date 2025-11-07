import React, { useState, useMemo, useRef } from 'react';
import { Alert, Spinner, Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { Remote } from '../api/Remote';
import { parseLeagueStatus, createLegacyPayload, mapLegacyDataToState } from '../util/Utils';
import LeagueStatus from './LeagueStatus';
import ConfirmationScreen from './ConfirmationScreen';
import PaymentScreen from './PaymentScreen';

const RegistrationForm = ({ regfee, newbagfee, serverStatusData = {}, passcode = "", terms = "" }) => {
	// --- STATE MANAGEMENT ---
	const leagueStatus = useMemo(() => parseLeagueStatus(serverStatusData), [serverStatusData]);
    const [step, setStep] = useState('register');
	const [isSubmitting, setIsSubmitting] = useState(false);
    const [numPlayers, setNumPlayers] = useState(1);
	const [isChecking, setIsChecking] = useState(false);
	const [existingUser, setExistingUser] = useState(false);
	const [formData, setFormData] = useState({
		// Family Info
		id: '', email1: '', email2: '', lastName: '', motherName: '', fatherName: '',
		phone: '', cell1: '', cell2: '', prefContact: 'home',
		addr1: '', addr2: '', city: '', state: 'NJ', zip: '',
		ecn: '', ecp: '', comments: '', passcode: '', numPlayers: 1, 
		// Player Data (Initialize 4 empty slots)
		players: Array(4).fill({
			id: '', name: '', school: '', otherSchool: '', age: '', gender: '',
			grade: '', shirt: '', growth: '',
			isNewPlayer: false, wantsBag: '0', paid: 0
		})
	});
	const [passcodeError, setPasscodeError] = useState("");
    const passcodeRef = useRef(null); // Ref for focus

	// --- HANDLERS ---
    const handleEmailBlur = async (e) => {
        const email = e.target.value;
		console.log(`Handle Email blur ${e.target.value}`);

        if (!email || existingUser) return; // Don't check if empty or already locked

        setIsChecking(true);
        try {
            const result = await Remote.getUserInfo(email);
			console.log(result);
           if (result.email) {
            // 1. MAP THE DATA FIRST
            const structuredData = mapLegacyDataToState(result);

            // 2. SET STATE WITH MAPPED DATA
            setFormData(prev => ({
                ...prev,
                ...structuredData
            }));
			console.log(`Form data received: ${JSON.stringify(formData)}`);
			
            setNumPlayers(structuredData.numPlayers);
            setExistingUser(true);
        }            // 2. Update number of players dropdown based on returned data
            setNumPlayers(result.players.length || 1);
            // 3. Lock the user
            setExistingUser(true);
        
    } catch (error) {
        console.error("API Error", error);
    } finally {
        setIsChecking(false);
    }
}

	const handleFamilyChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handlePrimaryEmailChange = (e) => {
		console.log(e.target);

	}

	const handlePlayerChange = (index, field, value) => {
		setFormData(prev => {
			const updatedPlayers = [...prev.players];
			updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
			return { ...prev, players: updatedPlayers };
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setPasscodeError("");
		
		if (passcode && formData.passcode !== passcode) {
            setPasscodeError("Invalid passcode. Please try again.");
            // Focus the input field so user can immediately type
            passcodeRef.current?.focus();
            return; // STOP SUBMISSION
        }

		const unpaidPlayers = formData.players.filter(
            p => p.name && p.paid !== 1
        );
        const numUnpaid = unpaidPlayers.length;

         if (numUnpaid === 0) {
            // FLOW A: No unpaid players -> Update and Finish
            setIsSubmitting(true);
            try {
                const payloadString = createLegacyPayload(formData);
                console.log("Updating (no payment):", payloadString);
	    		if (formData.id) {
		    		await Remote.updateUser(createLegacyPayload(formData));
		    	} else {
     		    	await Remote.registerUser(createLegacyPayload(formData));
				}
                
                
                // Show success screen
                setStep('update_success'); 

            } catch (error) {
                console.error("Update failed!", error);
                setPasscodeError("An error occurred while saving. Please try again.");
            } finally {
                setIsSubmitting(false);
            }

        } else {
            // FLOW B: Has unpaid players -> Go to Confirmation (original flow)
            setStep('confirm');
        }
	};

    const handleAccept = async () => {
        console.log("Submitting to backend...");
        
        // 1. Create the final payload string
        const payloadString = createLegacyPayload(formData);

        try {
			if (formData.id) {
				await Remote.updateUser(createLegacyPayload(formData));
			} else {
			    await Remote.registerUser(createLegacyPayload(formData));
            }
            const result = await Remote.getUserInfo(formData.email1);
		    const structuredData = mapLegacyDataToState(result);
            setFormData(prev => ({
                ...prev,
                ...structuredData
            }));

            // 3. Move to final step
            setStep('payment');

         } catch (error) {
            console.error("Submission failed!", error);
            // Optionally, show an error and stay on 'confirm' step
            // setApiError("Could not submit registration. Please try again.");
        }
    };

    const handleChangeInfo = () => {
        setStep('register');
    };


	// Helper to render standard required asterisk
	const Required = () => <span className="text-danger fw-bold ms-1">*</span>;

	// --- RENDER HELPERS ---
	const renderPlayerForm = (index) => {
		const player = formData.players[index];
		const availableGrades = leagueStatus.grades[player.gender] || [];
        const isGradeDisabled = !player.gender || availableGrades.length === 0;
		const pNum = index + 1;
		
		if (leagueStatus.isClosed) {
           return <Alert key={index} variant="warning">Registration is closed for this year</Alert>;
        }

		return (
			<Card key={index} className="mb-4 shadow-sm">
				<Card.Header className="bg-info text-white fw-bold">
					<span> Player {pNum} </span> {player.paid == 1 && (
        <span className="badge bg-white text-success fs-6 px-3 py-2">
            PAID ✓
        </span>
    )}
                </Card.Header>
				<Card.Body>
					{/* Row 1: Name & School */}
					<Row className="mb-2">
						<Col md={6}>
							<Form.Group as={Row}>
							<input type="hidden" name="id" value={formData.id || ''} />
								<Form.Label column sm={4} className="text-end fw-bold">First Name:<Required /></Form.Label>
								<Col sm={8}>
									<Form.Control
										type="text"
										value={player.name}
										onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
										required
									/>
								</Col>
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group as={Row}>
								<Form.Label column sm={4} className="text-end fw-bold">School:<Required /></Form.Label>
								<Col sm={8}>
									<Form.Select
										value={player.school}
										required
										onChange={(e) => handlePlayerChange(index, 'school', e.target.value)}
									>
										<option value="">- Select -</option>
										{['BPY', 'GBDS', 'Heatid', 'Lyncrest', 'MDS', 'Moriah', 'Noam', 'RYNJ', 'Yavneh', 'OTHER'].map(opt => (
											<option key={opt} value={opt}>{opt}</option>
										))}
									</Form.Select>
									{/* CONDITIONAL "OTHER" INPUT */}
									{player.school === 'OTHER' && (
										<div className="mt-2">
											<Form.Label className="text-danger small">School name: *</Form.Label>
											<Form.Control
												type="text"
												size="sm"
												value={player.otherSchool}
												required={player.school === 'OTHER'}
												onChange={(e) => handlePlayerChange(index, 'otherSchool', e.target.value)}
											/>
										</div>
									)}
								</Col>
							</Form.Group>
						</Col>
					</Row>

					{/* Row 2: Age & Gender */}
					<Row className="mb-2">
						<Col md={6}>
							<Form.Group as={Row}>
								<Form.Label column sm={4} className="text-end fw-bold">Age:<Required /></Form.Label>
								<Col sm={4}>
									<Form.Control
										type="text" maxLength={3}
										value={player.age}
										onChange={(e) => handlePlayerChange(index, 'age', e.target.value)}
										required
									/>
								</Col>
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group as={Row}>
								<Form.Label column sm={4} className="text-end fw-bold">Gender:<Required /></Form.Label>
								<Col sm={8}>
									<Form.Select
										value={player.gender}
										required 
										onChange={(e) => handlePlayerChange(index, 'gender', e.target.value)}
									>
										<option value="">- Select -</option>
										<option value="M">Male</option>
										<option value="F">Female</option>
									</Form.Select>
								</Col>
							</Form.Group>
						</Col>
					</Row>

					{/* Row 3: Grade & Shirt */}
					<Row className="mb-2">
						<Col md={6}>
							<Form.Group as={Row}>
								<Form.Label column sm={4} className="text-end fw-bold">Grade:<Required /></Form.Label>
								<Col sm={8}>
									<Form.Select
                    value={player.grade}
                    required
                    disabled={isGradeDisabled}
                    onChange={(e) => handlePlayerChange(index, 'grade', e.target.value)}
            >
                <option value="">
                    {player.gender ? "- Select -" : "Select Gender first"}
                </option>
                
                {availableGrades.map(gradeObj => (
                    <option key={gradeObj.value} value={gradeObj.value}>
                        {gradeObj.label === 'K' ? 'Kindergarten' : `Grade ${gradeObj.label}`}
                    </option>
                ))}
            </Form.Select>
								</Col>
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group as={Row}>
								<Form.Label column sm={4} className="text-end fw-bold">Shirt Size:<Required /></Form.Label>
								<Col sm={8}>
									<Form.Select
    value={player.shirt}
    required
    onChange={(e) => handlePlayerChange(index, 'shirt', e.target.value)}
>
    <option value="">- Select -</option>
    <option value="1">YM(10-12)</option>
    <option value="2">YL(14-16)</option>
    <option value="3">AS(34-36)</option>
    <option value="4">AM(38-40)</option>
    <option value="5">AL(42-44)</option>
    <option value="6">XL(46-48)</option>
</Form.Select>
								</Col>
							</Form.Group>
						</Col>
					</Row>

					{/* Row 4: Growth Priority */}
					<Form.Group as={Row} className="mb-3">
						<Form.Label column sm={2} className="text-end">Growth Priority:</Form.Label>
						<Col sm={10}>
							<Form.Control
								type="text"
								value={player.growth}
								onChange={(e) => handlePlayerChange(index, 'growth', e.target.value)}
							/>
							<Form.Text className="text-muted">
								What can YYL do to help your child grow?
                            </Form.Text>
						</Col>
					</Form.Group>

					{/* Row 5: New Player / Bag Logic */}
					<Row className="bg-light p-2 rounded">
						<Col md={4}>
							<Form.Check
								type="checkbox"
								label="New YYL Player (includes bag)"
								checked={player.isNewPlayer}
								onChange={(e) => handlePlayerChange(index, 'isNewPlayer', e.target.checked)}
							/>
						</Col>
						<Col md={8}>
							{player.isNewPlayer ? (
								<span className="text-success small">New bag is free for new players.</span>
							) : (
									<div className="d-flex align-items-center">
										<span className="me-3">New Bag:</span>
										<Form.Check inline type="radio" label="No" name={`bag${pNum}`}
											checked={player.wantsBag === '0'}
											onChange={() => handlePlayerChange(index, 'wantsBag', '0')}
										/>
										<Form.Check inline type="radio" label="Yes ($15)" name={`bag${pNum}`}
											checked={player.wantsBag === '1'}
											onChange={() => handlePlayerChange(index, 'wantsBag', '1')}
										/>
									</div>
								)}
						</Col>
					</Row>
				</Card.Body>
			</Card>
		);
	};

	if (step === 'register') {
	return (
		<Container className="py-4" style={{ maxWidth: '900px' }}>
			<Form onSubmit={handleSubmit}>
     			<input type="hidden" name="id" value={formData.id || ''} />
				{/* === SECTION 1: FAMILY INFO === */}
				<Card className="mb-4">
					<Card.Header className="bg-primary text-white">Family Information</Card.Header>
					<Card.Body>
						{/* Parent Emails */}
						<Row className="mb-2">
							<Col md={6}>
								<Form.Group>
        <Form.Label>Parent 1 Email <Required /></Form.Label>
        {existingUser ? (
            /* LOCKED STATE: Renders as a regular div, styled like plain text input */
            <div className="form-control-plaintext fw-bold text-primary">
                {formData.email1}
                 <span className="text-muted fw-normal ms-2">(Registered)</span>
            </div>
        ) : (
             /* EDITABLE STATE */
            <Form.Control
                type="email"
                name="email1"
                required
                placeholder={isChecking ? "Checking..." : ""}
                disabled={isChecking}
                onBlur={handleEmailBlur}
                onChange={handleFamilyChange}
                value={formData.email1}
            />
        )}
        {!existingUser && <Form.Text className="text-muted">
            {isChecking ? "Checking database..." : "Enter email to check for existing registration."}
        </Form.Text>}
    </Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group>
									<Form.Label>Parent 2 Email</Form.Label>
									<Form.Control type="email" name="email2"
										onChange={handleFamilyChange} value={formData.email2} />
								</Form.Group>
							</Col>
						</Row>

						{/* Names */}
						<Row className="mb-2">
							<Col md={4}>
								<Form.Group>
									<Form.Label>Last Name <Required /></Form.Label>
									<Form.Control type="text" name="lastName" required
										onChange={handleFamilyChange} value={formData.lastName} />
								</Form.Group>
							</Col>
							<Col md={4}>
								<Form.Group>
									<Form.Label>Mother's Name</Form.Label>
									<Form.Control type="text" name="motherName"
										onChange={handleFamilyChange} value={formData.motherName} />
								</Form.Group>
							</Col>
							<Col md={4}>
								<Form.Group>
									<Form.Label>Father's Name</Form.Label>
									<Form.Control type="text" name="fatherName"
										onChange={handleFamilyChange} value={formData.fatherName} />
								</Form.Group>
							</Col>
						</Row>

						{/* Phones */}
						<Row className="mb-3">
							<Col md={4}>
								<Form.Group>
									<Form.Label>Home Phone</Form.Label>
									<Form.Control type="text" name="phone"
										onChange={handleFamilyChange} value={formData.phone} />
								</Form.Group>
							</Col>
							<Col md={4}>
								<Form.Group>
									<Form.Label>Mother's Cell <Required /></Form.Label>
									<Form.Control type="text" name="cell1" required
										onChange={handleFamilyChange} value={formData.cell1} />
										<Form.Text className="text-muted">For single parent household enter same number for both parents.</Form.Text>
								</Form.Group>
							</Col>
							<Col md={4}>
								<Form.Group>
									<Form.Label>Father's Cell <Required /></Form.Label>
									<Form.Control type="text" name="cell2" required
										onChange={handleFamilyChange} value={formData.cell2} />
										<Form.Text className="text-muted">For single parent household enter same number for both parents.</Form.Text>
								</Form.Group>
							</Col>
						</Row>

						{/* Preferred Contact Radio */}
						<Form.Group as={Row} className="mb-3 bg-light py-2 rounded">
							<Form.Label column sm={3} className="fw-bold">Preferred Auto-Call:</Form.Label>
							<Col sm={9} className="d-flex align-items-center">
								<Form.Check inline label="Home" name="prefContact" type="radio" value="home"
									checked={formData.prefContact === 'home'} onChange={handleFamilyChange} />
								<Form.Check inline label="Mother's Cell" name="prefContact" type="radio" value="cell1"
									checked={formData.prefContact === 'cell1'} onChange={handleFamilyChange} />
								<Form.Check inline label="Father's Cell" name="prefContact" type="radio" value="cell2"
									checked={formData.prefContact === 'cell2'} onChange={handleFamilyChange} />
							</Col>
						</Form.Group>

						{/* Address */}
						<Row className="mb-2">
							<Col md={6}>
								<Form.Group>
									<Form.Label>Address</Form.Label>
									<Form.Control type="text" name="addr1" onChange={handleFamilyChange} value={formData.addr1} />
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group>
									<Form.Label>Address (cont)</Form.Label>
									<Form.Control type="text" name="addr2" onChange={handleFamilyChange} value={formData.addr2} />
								</Form.Group>
							</Col>
						</Row>
						<Row className="mb-3">
							<Col md={5}>
								<Form.Group>
									<Form.Label>City <Required /></Form.Label>
									<Form.Control type="text" name="city" required onChange={handleFamilyChange} value={formData.city} />
								</Form.Group>
							</Col>
							<Col md={4}>
								<Form.Group>
									<Form.Label>State</Form.Label>
									<Form.Select name="state" value={formData.state} onChange={handleFamilyChange}>
										<option value="NJ">New Jersey</option>
										<option value="NY">New York</option>
										{/* Add other states if needed */}
									</Form.Select>
								</Form.Group>
							</Col>
							<Col md={3}>
								<Form.Group>
									<Form.Label>Zip Code</Form.Label>
									<Form.Control type="text" name="zip" onChange={handleFamilyChange} value={formData.zip} />
								</Form.Group>
							</Col>
						</Row>

						{/* Emergency & Comments */}
						<Row className="mb-3">
							<Col md={6}>
								<Form.Group>
									<Form.Label>Emergency Contact Name</Form.Label>
									<Form.Control type="text" name="ecn" onChange={handleFamilyChange} value={formData.ecn} />
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group>
									<Form.Label>Emergency Contact Phone</Form.Label>
									<Form.Control type="text" name="ecp" onChange={handleFamilyChange} value={formData.ecp} />
								</Form.Group>
							</Col>
						</Row>
						<Form.Group className="mb-3">
							<Form.Label>Additional Comments</Form.Label>
							<Form.Control type="text" name="comments" onChange={handleFamilyChange} value={formData.comments} />
							<Form.Text className="text-muted">No teammate requests accepted.</Form.Text>
						</Form.Group>
					</Card.Body>
				</Card>

				{/* === SECTION 2: PLAYER INFO === */}
				<LeagueStatus text={serverStatusData} />

				<Form.Group as={Row} className="mb-4 align-items-center">
					<Form.Label column sm={4} md={3} className="fw-bold fs-5">
						Players for upcoming season:
                    </Form.Label>
					<Col sm={3} md={2}>
						<Form.Select
							size="lg"
							value={numPlayers}
							onChange={(e) => setNumPlayers(parseInt(e.target.value))}
						>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
						</Form.Select>
					</Col>
				</Form.Group>

				{/* DYNAMIC PLAYER LOOP */}
				{[...Array(numPlayers)].map((_, i) => renderPlayerForm(i))}

				{/* === SUBMIT SECTION === */}
				<Card className="bg-light text-center p-4 mt-5">
					<Form.Group as={Row} className="justify-content-center align-items-start">
                    <Form.Label column xs="auto" className="pt-2">Registration Passcode: 
                        {passcode && <Required />}
                    </Form.Label>
                    <Col xs="auto">
                        <Form.Control
                            type="text"
                            name="passcode"
                            ref={passcodeRef} // Attach ref here
                            value={formData.passcode}
                            onChange={(e) => {
                                handleFamilyChange(e);
                                if (passcodeError) setPasscodeError(""); // Clear error on type
                            }}
                            isInvalid={!!passcodeError} // Bootstrap invalid styling
                            required={!!passcode} // HTML required attribute
                        />
                        <Form.Control.Feedback type="invalid">
                            {passcodeError}
                        </Form.Control.Feedback>
                    </Col>
                    <Col xs="auto">
                        <Button variant="success" size="lg" type="submit" className="px-4" disabled={isSubmitting}>
    {isSubmitting ? (
        <>
            <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
            />
            {' '}Saving...
        </>
    ) : (
        'Next »'
    )}
</Button>
                    </Col>
                </Form.Group>
					<Form.Text className="text-muted">(Provided by commissioner)</Form.Text>
				</Card>
			</Form>
		</Container>
	);
	}
	if (step === 'confirm') {
        return (
            <ConfirmationScreen
                formData={formData}
                costPerPlayer={Number(regfee)}
				newBagFee={Number(newbagfee)}
                onAccept={handleAccept}
                onGoBack={handleChangeInfo}
				terms={terms}
            />
        );
    }

 if (step === 'payment') {
        return (
            <PaymentScreen
                formData={formData} // This now contains the final IDs
                costPerPlayer={Number(regfee)}
                newBagFee={Number(newbagfee)}
                onGoBack={handleChangeInfo} // Goes back to 'confirm'
            />
        );
    }

if (step === 'update_success') {
        return (
            <Container className="py-5" style={{ maxWidth: '600px' }}>
                <Alert variant="success">
                    <Alert.Heading>Update Successful!</Alert.Heading>
                    <p>
                        Your family and player information has been successfully saved.
						
                    </p>
                    <hr />
                    {/* Optional: Add a button to go back to the site's homepage */}
                    <Button variant="success" onClick={() => setStep('register')}>
                        Add more players
                    </Button>
                </Alert>
            </Container>
        );
    }


};

export default RegistrationForm;