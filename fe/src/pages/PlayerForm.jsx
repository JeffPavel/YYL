import React from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
// 1. Import RHF hooks for use in this component
import { useWatch, Controller } from 'react-hook-form';

const PlayerForm = ({ 
    index, 
    control,    // RHF prop
    register,   // RHF prop
    errors,     // RHF prop
    watch,      // RHF prop
    setValue,   // RHF prop
    isLocked,   // Status prop
    additionalInfoText, 
    leagueStatus,
    newBagFee
}) => {

    // --- RHF WATCHERS ---
    // We watch these values to dynamically update the UI
    const selectedGender = watch(`players.${index}.gender`);
    const selectedSchool = watch(`players.${index}.school`);
    const isNewPlayer = watch(`players.${index}.isNewPlayer`);

    // --- DERIVED STATE ---
    const availableGrades = leagueStatus.grades[selectedGender] || [];
    const isGradeDisabled = !selectedGender || availableGrades.length === 0;

    const Required = () => <span className="text-danger fw-bold ms-1">*</span>;

    return (
        <Card key={index} className="mb-4 shadow-sm">
            <Card.Header
                className={`d-flex justify-content-between align-items-center fw-bold text-white ${
                    isLocked ? 'bg-success' : 'bg-info'
                }`}
            >
                <span>Player {index + 1} Information</span>
                {isLocked && (
                    <span className="badge bg-white text-success fs-6 px-3 py-2">
                        PAID ✓
                    </span>
                )}
            </Card.Header>

            <Card.Body>
                <Row>
                    <Col lg={8}>
                        {/* Row 1: Name & School */}
                        <Row className="mb-2">
                            <Col md={6}>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={4} className="text-end fw-bold">First Name:<Required /></Form.Label>
                                    <Col sm={8}>
                                        <Form.Control 
                                            type="text" 
                                            disabled={isLocked} 
                                            // Register with RHF relative to the field array
                                            {...register(`players.${index}.name`, { 
                                                required: "Please fill out this field." 
                                            })}
                                            isInvalid={!!errors.players?.[index]?.name}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.players?.[index]?.name?.message}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={4} className="text-end fw-bold">School:<Required /></Form.Label>
                                    <Col sm={8}>
                                        {/* Form.Select requires <Controller> */}
                                        <Controller
                                            name={`players.${index}.school`}
                                            control={control}
                                            rules={{ required: "Please select a school." }}
                                            render={({ field }) => (
                                                <Form.Select 
                                                    {...field} 
                                                    disabled={isLocked} 
                                                    isInvalid={!!errors.players?.[index]?.school}
                                                >
                                                    <option value="">- Select -</option>
                                                    {['BPY', 'GBDS', 'Heatid', 'Lyncrest', 'MDS', 'Moriah', 'Noam', 'RYNJ', 'Yavneh', 'OTHER'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </Form.Select>
                                            )}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.players?.[index]?.school?.message}
                                        </Form.Control.Feedback>
                                        
                                        {/* Conditional "Other School" input */}
                                        {selectedSchool === 'OTHER' && (
                                            <div className="mt-2">
                                                <Form.Label className="text-danger small">School name: *</Form.Label>
                                                <Form.Control 
                                                    type="text" 
                                                    size="sm" 
                                                    disabled={isLocked} 
                                                    {...register(`players.${index}.otherSchool`, {
                                                        required: "Please provide a school name."
                                                    })}
                                                    isInvalid={!!errors.players?.[index]?.otherSchool}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.players?.[index]?.otherSchool?.message}
                                                </Form.Control.Feedback>
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
                                            type="text" 
                                            maxLength={3} 
                                            disabled={isLocked} 
                                            {...register(`players.${index}.age`, { 
                                                required: "Required." 
                                            })}
                                            isInvalid={!!errors.players?.[index]?.age}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.players?.[index]?.age?.message}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={4} className="text-end fw-bold">Gender:<Required /></Form.Label>
                                    <Col sm={8}>
                                        <Controller
                                            name={`players.${index}.gender`}
                                            control={control}
                                            rules={{ required: "Please select a gender." }}
                                            render={({ field }) => (
                                                <Form.Select 
                                                    {...field} 
                                                    disabled={isLocked} 
                                                    isInvalid={!!errors.players?.[index]?.gender}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        // Also reset grade when gender changes
                                                        setValue(`players.${index}.grade`, "");
                                                    }}
                                                >
                                                    <option value="">- Select -</option>
                                                    <option value="M">Male</option>
                                                    <option value="F">Female</option>
                                                </Form.Select>
                                            )}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.players?.[index]?.gender?.message}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Row 3: Grade & Shirt */}
                        <Row className="mb-2">
                            <Col md={6}>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={4} className="text-end fw-bold">Current Grade:<Required /></Form.Label>
                                    <Col sm={8}>
                                        <Controller
                                            name={`players.${index}.grade`}
                                            control={control}
                                            rules={{ required: "Please select a grade." }}
                                            render={({ field }) => (
                                                <Form.Select 
                                                    {...field} 
                                                    disabled={isLocked || isGradeDisabled} 
                                                     className={isGradeDisabled ? "grade-disabled-text" : ""} 
                                                    isInvalid={!!errors.players?.[index]?.grade}
                                                >
                                                    <option value="">{selectedGender ? "- Select -" : "Select Gender first"}</option>
                                                    {availableGrades.map(gradeObj => <option key={gradeObj.value} value={gradeObj.value}>{gradeObj.label === 'K' ? 'Kindergarten' : `Grade ${gradeObj.label}`}</option>)}
                                                </Form.Select>
                                            )}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.players?.[index]?.grade?.message}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={4} className="text-end fw-bold">Shirt Size:<Required /></Form.Label>
                                    <Col sm={8}>
                                        <Controller
                                            name={`players.${index}.shirt`}
                                            control={control}
                                            rules={{ required: "Please select a size." }}
                                            render={({ field }) => (
                                                <Form.Select {...field} disabled={isLocked} isInvalid={!!errors.players?.[index]?.shirt}>
                                                    <option value="">- Select -</option>
                                                    <option value="1">YM(10-12)</option>
                                                    <option value="2">YL(14-16)</option>
                                                    <option value="3">AS(34-36)</option>
                                                    <option value="4">AM(38-40)</option>
                                                    <option value="5">AL(42-44)</option>
                                                    <option value="6">XL(46-48)</option>
                                                </Form.Select>
                                            )}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.players?.[index]?.shirt?.message}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Row 4: Growth Priority (not required) */}
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2} className="text-end">Growth Priority:</Form.Label>
                            <Col sm={10}>
                                <Form.Control 
                                    type="text" 
                                    disabled={isLocked} 
                                    {...register(`players.${index}.growth`)}
                                />
                            </Col>
                        </Form.Group>

                        {/* Row 5: New Player / Bag Logic */}
                        <Row className="bg-light p-2 rounded mx-0">
                            <Col md={4}>
                                <Controller
                                    name={`players.${index}.isNewPlayer`}
                                    control={control}
                                    render={({ field }) => (
                                        <Form.Check 
                                            type="checkbox" 
                                            label="New YYL Player (includes bag)" 
                                            checked={field.value}
                                            disabled={isLocked} 
                                            onChange={(e) => field.onChange(e.target.checked)}
                                        />
                                    )}
                                />
                            </Col>
                            <Col md={8}>
                                {/* Watch the isNewPlayer value to conditionally render this */}
                                {isNewPlayer ? (
                                    <span className="text-success small">New bag is free for new players.</span>
                                ) : (
                                    <div className="d-flex align-items-center">
                                        <span className="me-3">New Bag:</span>
                                        <Form.Check 
                                            inline 
                                            type="radio" 
                                            label="No" 
                                            value="0"
                                            disabled={isLocked}
                                            {...register(`players.${index}.wantsBag`)}
                                            checked={watch(`players.${index}.wantsBag`) === '0'}
                                        />
                                        <Form.Check 
                                            inline 
                                            type="radio" 
                                            label={`Yes ($${newBagFee})`} 
                                            value="1"
                                            disabled={isLocked}
                                            {...register(`players.${index}.wantsBag`)}
                                            checked={watch(`players.${index}.wantsBag`) === '1'}
                                        />
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Col> {/* End Form Fields Column */}
                    
                    {/* --- COLUMN 2: INFO TEXT --- */}
                    <Col lg={4} className="mt-3 mt-lg-0 info-text-container" style={{ 
                        borderLeft: '2px dashed #ffc107', 
                        paddingLeft: '15px',
                        fontSize: '0.9rem',
                        color: '#6c757d' 
                    }}>
                        <h6 className="text-dark">League Information</h6>
                        <div>
                            {additionalInfoText}
                        </div>
                    </Col> {/* End Info Text Column */}

                </Row> {/* End 2-Column Layout Row */}
            </Card.Body>
        </Card>
    );
};
    
export default PlayerForm;