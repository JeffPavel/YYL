import React, { useState, useMemo, useRef } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
// 1. IMPORT CONTROLLER
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';

// Import our helpers
import { parseLeagueStatus, mapLegacyDataToState, createLegacyPayload } from '../util/Utils';
import ConfirmationScreen from './ConfirmationScreen';
import PaymentScreen from './PaymentScreen';
import LeagueStatus from './LeagueStatus';
import PlayerForm from './PlayerForm';
import { Remote } from '../api/Remote';

const defaultPlayer = {
    id: '', name: '', school: '', otherSchool: '', age: '', gender: '',
    grade: '', shirt: '', growth: '',
    isNewPlayer: false, wantsBag: '0', paid: 0
};

const RegistrationForm = ({ serverStatusData = "", requiredPasscode = "", costPerPlayer = 100, newBagFee = 15, terms }) => {

    const [step, setStep] = useState('register');
    const [isChecking, setIsChecking] = useState(false);
    const [existingUser, setExistingUser] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const formRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
        setError,
        reset
    } = useForm({
        defaultValues: {
            id: '', email1: '', email2: '', lastName: '', motherName: '', fatherName: '',
            phone: '', cell1: '', cell2: '', prefContact: 'home',
            addr1: '', addr2: '', city: '', state: 'NJ', zip: '',
            ecn: '', ecp: '', comments: '', passcode: '',
            numPlayers: 1,
            players: [defaultPlayer]
        }
    });

    // --- RHF Field Array for Players ---
    const { fields, append, remove } = useFieldArray({
        control,
        name: "players"
    });

    const { leagueStatus, additionalInfoText } = useMemo(() => {
        const lines = (serverStatusData.toString() || "").split('\n');
        const status = parseLeagueStatus(lines);
        const emptyLineIndex = lines.findIndex(line => line.trim() === '');
        let infoText = [];
        if (emptyLineIndex !== -1) {
            const textLines = lines.slice(emptyLineIndex + 1);
            infoText = textLines.map((line, index) => {
                if (line.includes("waiting list HERE")) {
                    return (
                        <span key={index}>
                            If the grade / gender combination is not available below, you should add your information to the
                            {' '}
                            <a href="https://docs.google.com/forms/d/1qweAXvtY9Tj8q3DjGe5zetmAczznlnhCMoNc8khXPTY/viewform" target="_blank" rel="noopener noreferrer">
                                waiting list HERE.
                            </a>
                            <br />
                        </span>
                    );
                }
                return <span key={index}>{line}<br /></span>;
            });
        }
        return { leagueStatus: status, additionalInfoText: infoText };
    }, [serverStatusData]);
    const Required = () => <span className="text-danger fw-bold ms-1">*</span>;

    // --- HANDLERS ---
    const handleEmailBlur = async (e) => {
        const email = e.target.value;
        if (!email || existingUser) return;
        setIsChecking(true);
        try {
            const result = await Remote.getUserInfo(email);
            //console.log(result);
            if (result.email) {
                const structuredData = mapLegacyDataToState(result);
                // Use RHF's reset to populate the entire form
                reset(structuredData);
                setExistingUser(true);
            }
        } catch (error) {
            console.error("API Error", error);
            setSubmitError("Could not check email. Please try again.");
        } finally {
            setIsChecking(false);
        }
    };

    const onSubmit = async (data) => {
        setSubmitError("");
        if (requiredPasscode && data.passcode !== requiredPasscode) {
            setError("passcode", { type: "manual", message: "Invalid passcode. Please try again." });
            return;
        }
        const unpaidPlayers = data.players.filter(p => p.name && p.paid !== 1);
        const numUnpaid = unpaidPlayers.length;
        if (numUnpaid === 0) {
            setIsSubmitting(true);
            try {
                const payloadString = createLegacyPayload(data);
                console.log("Updating (no payment):", payloadString);
                if (data.id) {
                    await Remote.updateUser(createLegacyPayload(data));
                } else {
                    await Remote.registerUser(createLegacyPayload(data));
                }
                setStep('update_success');
            } catch (error) {
                console.error("Update failed!", error);
                setSubmitError("An error occurred while saving. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setStep('confirm');
        }
    };

    const onError = (formErrors) => {
        console.log("Form validation failed:", formErrors);
    };

    const currentFormData = watch();

    const handleAccept = async () => {
        setIsSubmitting(true);
        setSubmitError("");
        try {
            const payloadString = createLegacyPayload(currentFormData); // Use watched data
            console.log("Submitting:", payloadString);

            if (currentFormData.id) {
                await Remote.updateUser(payloadString);
            } else {
                await Remote.registerUser(payloadString);
            }
            const result = await Remote.getUserInfo(currentFormData.email1);
            const structuredData = mapLegacyDataToState(result);
            reset(structuredData);
            setStep('payment');
        } catch (error) {
            console.error("Submission failed!", error);
            setSubmitError("Could not submit registration. Please try again.");
            setStep('confirm');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangeInfo = () => {
        setStep('register');
        setSubmitError("");
    };

    if (leagueStatus.isClosed) {
        return (
            <Container className="py-5">
                <Alert variant="warning" className="text-center">
                    <h4>Registration is currently closed</h4>
                    <p>All divisions are currently full or closed for the season.</p>
                </Alert>
            </Container>
        );
    }

    if (step === 'register') {
        return (
            <Container className="py-4" style={{ maxWidth: '900px' }}>
                <Form noValidate onSubmit={handleSubmit(onSubmit, onError)} ref={formRef}>

                    {submitError && <Alert variant="danger">{submitError}</Alert>}

                    <Card className="mb-4">
                        <Card.Header className="bg-primary text-white">Family Information</Card.Header>
                        <Card.Body>
                            {/* --- THIS IS THE START OF THE CHANGE --- */}
                            <Row className="mb-2">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Parent 1 Email <Required /></Form.Label>
                                        {existingUser ? (
                                            <div className="form-control-plaintext fw-bold text-primary">
                                                {watch("email1")}
                                                <span className="text-muted fw-normal ms-2">(Registered)</span>
                                            </div>
                                        ) : (
                                            <Form.Control
                                                type="email"
                                                placeholder={isChecking ? "Checking..." : ""}
                                                disabled={isChecking}
                                                {...register("email1", {
                                                    required: "Please provide a valid email."
                                                })}
                                                isInvalid={!!errors.email1}
                                                onBlur={handleEmailBlur}
                                            />
                                        )}
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email1?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                
                                {/* Parent 2 Email is hidden if user exists */}
                                {!existingUser && (
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Parent 2 Email</Form.Label>
                                            <Form.Control type="email" {...register("email2")} />
                                        </Form.Group>
                                    </Col>
                                )}
                            </Row>

                            {/* All other family info is hidden if user exists */}
                            {!existingUser && (
                                <>
                                    <Row className="mb-2">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Last Name <Required /></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    {...register("lastName", {
                                                        required: "Please fill out this field."
                                                    })}
                                                    isInvalid={!!errors.lastName}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.lastName?.message}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Mother's Name</Form.Label>
                                                <Form.Control type="text" {...register("motherName")} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Father's Name</Form.Label>
                                                <Form.Control type="text" {...register("fatherName")} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Home Phone</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    {...register("phone", {
                                                        pattern: {
                                                            value: /^[1-9]\d{9}$/,
                                                            message: "10 digits, no spaces (e.g., 2015551234)."
                                                        }
                                                    })}
                                                    isInvalid={!!errors.phone}
                                                    aria-describedby="phone-help-text"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.phone?.message}
                                                </Form.Control.Feedback>
                                                <Form.Text id="phone-help-text" muted>
                                                    10 digits, no dashes or spaces.
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Mother's Cell <Required /></Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    {...register("cell1", {
                                                        required: "Mother's cell is required.",
                                                        pattern: {
                                                            value: /^[1-9]\d{9}$/,
                                                            message: "10 digits, no spaces."
                                                        }
                                                    })}
                                                    isInvalid={!!errors.cell1}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.cell1?.message}
                                                </Form.Control.Feedback>
                                                <Form.Text className="text-muted">For single parent household enter same number for both parents.</Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Father's Cell <Required /></Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    {...register("cell2", {
                                                        required: "Father's cell is required.",
                                                        pattern: {
                                                            value: /^[1-9]\d{9}$/,
                                                            message: "10 digits, no spaces."
                                                        }
                                                    })}
                                                    isInvalid={!!errors.cell2}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.cell2?.message}
                                                </Form.Control.Feedback>
                                                <Form.Text className="text-muted">For single parent household enter same number for both parents.</Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group as={Row} className="mb-3 bg-light py-2 rounded mx-0">
                                        <Form.Label column sm={3} className="fw-bold">Preferred Auto-Call:</Form.Label>
                                        <Col sm={9} className="d-flex align-items-center">
                                            <Form.Check inline label="Home" type="radio" value="home"
                                                {...register("prefContact")} />
                                            <Form.Check inline label="Mother's Cell" type="radio" value="cell1"
                                                {...register("prefContact")} />
                                            <Form.Check inline label="Father's Cell" type="radio" value="cell2"
                                                {...register("prefContact")} />
                                        </Col>
                                    </Form.Group>
                                    <Row className="mb-2">
                                        <Col md={6}><Form.Group><Form.Label>Address</Form.Label><Form.Control type="text" {...register("addr1")} /></Form.Group></Col>
                                        <Col md={6}><Form.Group><Form.Label>Address (cont)</Form.Label><Form.Control type="text" {...register("addr2")} /></Form.Group></Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={5}><Form.Group><Form.Label>City <Required /></Form.Label>
                                            <Form.Control type="text" isInvalid={!!errors.city} {...register("city", { required: "City is required" })} />
                                            <Form.Control.Feedback type="invalid">{errors.city?.message}</Form.Control.Feedback>
                                        </Form.Group></Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>State</Form.Label>
                                                <Form.Select {...register("state")}>
                                                    <option value="NJ">New Jersey</option>
                                                    <option value="NY">New York</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}><Form.Group><Form.Label>Zip Code</Form.Label><Form.Control type="text" {...register("zip")} /></Form.Group></Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={6}><Form.Group><Form.Label>Emergency Contact Name</Form.Label><Form.Control type="text" {...register("ecn")} /></Form.Group></Col>
                                        <Col md={6}><Form.Group><Form.Label>Emergency Contact Phone</Form.Label><Form.Control type="text" {...register("ecp")} /></Form.Group></Col>
                                    </Row>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Additional Comments</Form.Label>
                                        <Form.Control type="text" {...register("comments")} />
                                        <Form.Text className="text-muted">No teammate requests accepted.</Form.Text>
                                    </Form.Group>
                                </>
                            )}
                            {/* --- THIS IS THE END OF THE CHANGE --- */}
                        </Card.Body>
                    </Card>

                    <LeagueStatus text={serverStatusData} />
                    <Card className="mb-4">
                        <Card.Header className="bg-info text-white">Player Information</Card.Header>
                        <Card.Body>
                            <Form.Group as={Row} className="mb-4 align-items-center">
                                <Form.Label column sm={4} md={3} className="fw-bold fs-5">
                                    Players for upcoming season:
                                </Form.Label>
                                <Col sm={3} md={2}>
                                    <Controller
                                        name="numPlayers"
                                        control={control}
                                        render={({ field }) => (
                                            <Form.Select
                                                {...field}
                                                size="lg"
                                                onChange={e => {
                                                    // This logic now runs *only* when the user changes the value
                                                    field.onChange(e);

                                                    const newNumPlayers = parseInt(e.target.value, 10);
                                                    const currentFieldsLength = fields.length;
                                                    const diff = newNumPlayers - currentFieldsLength;

                                                    if (diff > 0) {
                                                        for (let i = 0; i < diff; i++) {
                                                            append(defaultPlayer);
                                                        }

                                                        setTimeout(() => {
                                                            if (formRef.current) {
                                                                const playersData = watch("players");
                                                                // Find the first player with an empty name
                                                                const firstEmptyPlayerIndex = playersData.findIndex(p => !p.name);
                                                                // If all are filled, default to focusing the first new one
                                                                const targetIndex = (firstEmptyPlayerIndex !== -1) ? firstEmptyPlayerIndex : currentFieldsLength;

                                                                const targetInput = formRef.current.querySelector(
                                                                    `input[name="players.${targetIndex}.name"]`
                                                                );

                                                                if (targetInput) {
                                                                    targetInput.focus();
                                                                    targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                }
                                                            }
                                                        }, 0);
                                                    } else if (diff < 0) {
                                                        remove(Array.from({ length: Math.abs(diff) }, (_, i) => currentFieldsLength - 1 - i));
                                                    }
                                                }}
                                            >
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                            </Form.Select>
                                        )}
                                    />
                                </Col>
                            </Form.Group>

                            {fields.map((field, index) => (
                                <PlayerForm
                                    key={field.id}
                                    index={index}
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    watch={watch}
                                    setValue={setValue}
                                    additionalInfoText={additionalInfoText}
                                    leagueStatus={leagueStatus}
                                    newBagFee={newBagFee}
                                    isLocked={watch(`players.${index}.paid`) === 1}
                                />
                            ))}
                        </Card.Body>
                    </Card>
                    <Card className="bg-light text-center p-4 mt-5">
                        <Form.Group as={Row} className="justify-content-center align-items-start">
                            {requiredPasscode && (
                                <>
                                    <Form.Label column xs="auto" className="pt-2">Registration Passcode:</Form.Label>
                                    <Col xs="auto">
                                        <Form.Control
                                            type="text"
                                            {...register("passcode", {
                                                required: "This field is required."
                                            })}
                                            isInvalid={!!errors.passcode}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passcode?.message}
                                        </Form.Control.Feedback>
                                    </Col>
                                </>
                            )}
                            <Col xs="auto">
                                <Button variant="success" size="lg" type="submit" className="px-4" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <><Spinner as="span" animation="border" size="sm" /> Saving...</>
                                    ) : (
                                        'Next »'
                                    )}
                                </Button>
                            </Col>
                        </Form.Group>
                        {requiredPasscode && (
                            <Form.Text className="text-muted">(Provided by commissioner)</Form.Text>
                        )}
                    </Card>
                </Form>
            </Container>
        );
    }

    if (step === 'confirm') {
        return (
            <ConfirmationScreen
                formData={currentFormData} // Use the watched data
                costPerPlayer={costPerPlayer}
                newBagFee={newBagFee}
                onAccept={handleAccept}
                onGoBack={handleChangeInfo}
                isSubmitting={isSubmitting}
                submitError={submitError}
                terms={terms}
            />
        );
    }

    if (step === 'payment') {
        return (
            <PaymentScreen
                formData={currentFormData} // Use the watched data
                costPerPlayer={costPerPlayer}
                newBagFee={newBagFee}
                onGoBack={handleChangeInfo}
            />
        );
    }

    if (step === 'update_success') {
        return (
            <Container className="py-5" style={{ maxWidth: '600px' }}>
                <Alert variant="success">
                    <Alert.Heading>Update Successful!</Alert.Heading>
                    <p>Your family and player information has been successfully saved.</p>
                </Alert>
            </Container>
        );
    }
}

export default RegistrationForm;