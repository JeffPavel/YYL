import React from 'react';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';

const ConfirmationScreen = ({ formData, costPerPlayer, onAccept, onGoBack, newBagFee, terms }) => {
    
    // Calculate unpaid players (only count *filled* player slots)
    const unpaidPlayers = formData.players.filter(
        p => p.name && p.paid !== 1
    );
    const numUnpaid = unpaidPlayers.length;
    const playerCost = numUnpaid * costPerPlayer;

    const bagCost = unpaidPlayers.reduce((total, player) => {
        // Add fee ONLY if they are NOT a new player AND they explicitly want a bag
        if (!player.isNewPlayer && player.wantsBag === '1') {
            return total + newBagFee;
        }
        return total;
    }, 0); // Start cost at 0

    // 4. Calculate total
    const totalCost = playerCost + bagCost;
    const numBags = bagCost / newBagFee;
	console.log(terms);
    return (
        <Container className="py-5" style={{ maxWidth: '600px' }}>
            <Card className="shadow-sm">
                <Card.Header as="h4" className="bg-primary text-white">
                    Confirm Registration
                </Card.Header>
                <Card.Body>
                    <p className="lead">Please review your information before proceeding.</p>
                    <ListGroup variant="flush" className="mb-4">
                        <ListGroup.Item>
                            <Row>
                                <Col><div dangerouslySetInnerHTML={{ __html: terms }}></div></Col>
                            </Row>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Row>
                                <Col sm={4}><strong>Email:</strong></Col>
                                <Col sm={8}>{formData.email1}</Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row>
                                <Col sm={4}><strong>Last Name:</strong></Col>
                                <Col sm={8}>{formData.lastName}</Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row>
                                <Col sm={4}><strong>Unpaid Players:</strong></Col>
                                <Col sm={8}>{numUnpaid}</Col>
                            </Row>
                        </ListGroup.Item>
{bagCost > 0 && (
                        <ListGroup.Item>
                            <Row>
                                <Col sm={5}><strong>New Bags:</strong></Col>
                                <Col sm={7}>{numBags} @ ${newBagFee.toFixed(2)}/each</Col>
                            </Row>
                        </ListGroup.Item>
                    )}
                        <ListGroup.Item className="bg-light">
                            <Row className="fw-bold fs-5">
                                <Col sm={4}>Total Due:</Col>
                                <Col sm={8} className="text-success">
                                    ${totalCost.toFixed(2)}
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    </ListGroup>
                    
                    <div className="d-flex justify-content-between">
                        <Button variant="outline-secondary" size="lg" onClick={onGoBack}>
                            &laquo; Change Info
                        </Button>
                        <Button variant="success" size="lg" onClick={onAccept}>
                            I Accept &raquo;
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ConfirmationScreen;