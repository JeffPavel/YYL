import React, { useRef, useMemo } from 'react';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import paypalLogo from '/src/assets/images/horizontal_solution_PPeCheck.gif';

const PaymentScreen = ({ formData, costPerPlayer, newBagFee, onGoBack }) => {
    // 1. Create a ref to access the form DOM element
    const paypalFormRef = useRef(null);
console.log(formData);
    // 2. Memoize all calculations. This recalculates only if formData changes.
    const paymentDetails = useMemo(() => {
        // Find all players who are unpaid and have a name
        const unpaidPlayers = formData.players.filter(
            p => p.name && p.paid !== 1
        );
        const numUnpaid = unpaidPlayers.length;

        // Calculate costs
        const playerCost = numUnpaid * Number(costPerPlayer);
        const bagCost = unpaidPlayers.reduce((total, player) => {
            if (!player.isNewPlayer && player.wantsBag === '1') {
                return total + Number(newBagFee);
            }
            return total;
        }, 0);
        
        const totalCost = playerCost + bagCost;
        const numBags = bagCost / Number(newBagFee);

        // --- Generate PayPal Specific Fields ---
        const userId = formData.id;
        const itemName = `yyl_registration_${userId}_${numUnpaid}`;
        
        // Create item_number: user_id_player1_id_player2_id...
        const unpaidPlayerIds = unpaidPlayers.map(p => p.id).filter(Boolean); // Get IDs
        const itemNumber = `${userId}_${unpaidPlayerIds.join('_')}`;
		console.log(`itemName=${itemName}`);
				console.log(`itemNumber=${itemNumber}`);

        return {
            unpaidPlayers,
            numUnpaid,
            totalCost,
            playerCost,
            bagCost,
            numBags,
            itemName,
            itemNumber
        };
    }, [formData, costPerPlayer, newBagFee]);


    // 3. This function clicks the hidden submit button
    const handleFinalizeAndPay = () => {
        // Ensure the form ref is attached and submit it
        if (paypalFormRef.current) {
            paypalFormRef.current.submit();
        } else {
            console.error("PayPal form ref is not found.");
        }
    };

    return (
        <Container className="py-5" style={{ maxWidth: '600px' }}>
            <Card className="shadow-sm">
                <Card.Header as="h4" className="bg-primary text-white">
                    Step 3: Finalize Payment
                </Card.Header>
                <Card.Body>
                    <ListGroup variant="flush" className="mb-4">
                        {/* Static Info */}
                        <ListGroup.Item>
                            <Row><Col sm={4}><strong>Email:</strong></Col><Col sm={8}>{formData.email1}</Col></Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row><Col sm={4}><strong>Last Name:</strong></Col><Col sm={8}>{formData.lastName}</Col></Row>
                        </ListGroup.Item>
                        
                        {/* Dynamic Cost Info */}
                        <ListGroup.Item>
                            <Row>
                                <Col sm={5}><strong>Unpaid Players:</strong></Col>
                                <Col sm={7}>{paymentDetails.numUnpaid} @ ${Number(costPerPlayer).toFixed(2)}/each</Col>
                            </Row>
                        </ListGroup.Item>

                        {paymentDetails.bagCost > 0 && (
                            <ListGroup.Item>
                                <Row>
                                    <Col sm={5}><strong>New Bags:</strong></Col>
                                    <Col sm={7}>{paymentDetails.numBags} @ ${Number(newBagFee).toFixed(2)}/each</Col>
                                </Row>
                            </ListGroup.Item>
                        )}
                        
                        <ListGroup.Item className="bg-light">
                            <Row className="fw-bold fs-5">
                                <Col sm={5}>Total Due:</Col>
                                <Col sm={7} className="text-success">
                                    ${paymentDetails.totalCost.toFixed(2)}
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    </ListGroup>

                    {/* 4. The requested PayPal image */}
                    <div className="text-center mb-4">
                        <img 
                            src={paypalLogo} 
                            alt="Pay with PayPal"
                            style={{ maxWidth: '100%' }}
                        />
                    </div>
                    
                    {/* 5. The buttons */}
                    <div className="d-flex justify-content-between">
                        <Button variant="outline-secondary" size="lg" onClick={onGoBack}>
                            &laquo; Change Info
                        </Button>
                        <Button variant="success" size="lg" onClick={handleFinalizeAndPay}>
                            Finalize and Pay &raquo;
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* 6. THE HIDDEN PAYPAL FORM */}
            <form 
                ref={paypalFormRef} 
                name="paypalform" 
                action="https://www.paypal.com/cgi-bin/webscr" 
                method="post"
                style={{ display: 'none' }}
            >
                {/* Static Values */}
                <input type="hidden" name="cmd" value="_xclick" />
                <input type="hidden" name="business" value="commissioner@yavnehyouthleague.com" />
                <input type="hidden" name="no_shipping" value="2" />
                <input type="hidden" name="return" value="http://signup.yavnehyouthleague.com/signup/payment_complete.php" />
                <input type="hidden" name="notify_url" value="http://signup.yavnehyouthleague.com/signup/payment_process.php" />
                <input type="hidden" name="currency_code" value="USD" />
                <input type="hidden" name="bn" value="PP-BuyNowBF" />
                
                {/* Dynamic Values - we use 'key' to force React to update them if they change */}
                <input key={paymentDetails.totalCost} type="hidden" name="amount" value={paymentDetails.totalCost.toFixed(2)} />
                <input key={paymentDetails.itemName} type="hidden" name="item_name" value={paymentDetails.itemName} />
                <input key={paymentDetails.itemNumber} type="hidden" name="item_number" value={paymentDetails.itemNumber} />
            </form>
        </Container>
    );
};

export default PaymentScreen;