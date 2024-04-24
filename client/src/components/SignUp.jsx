// components/Signup.js
import React from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            role: 'buyer'
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    handleSubmit(event) {
        event.preventDefault();
        // Handle the signup process here
        console.log('Email: ', this.state.email);
        console.log('Password: ', this.state.password);
        console.log('Role: ', this.state.role);
        // Here, you can add your logic for signing up the user
        // After signing up, you can redirect the user to the main page
        // You can use history.push('/main') for redirection
        // Replace '/main' with the appropriate route for the main page
    }

    render() {
        return (
            <Container>
                <Row className="justify-content-md-center mt-5">
                    <Col md="6">
                        <h2>Sign Up</h2>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    name="email"
                                    value={this.state.email}
                                    onChange={this.handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    value={this.state.password}
                                    onChange={this.handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicCheckbox">
                                <Form.Check
                                    type="radio"
                                    label="Buyer"
                                    name="role"
                                    value="buyer"
                                    checked={this.state.role === 'buyer'}
                                    onChange={this.handleChange}
                                />
                                <Form.Check
                                    type="radio"
                                    label="Seller"
                                    name="role"
                                    value="seller"
                                    checked={this.state.role === 'seller'}
                                    onChange={this.handleChange}
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit">
                                Sign Up
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default SignUp;
