import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

export default function Signup() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");
  const navigator = useNavigate();

  const validateInput = () => {
    return (
      userName.length > 0 &&
      email.length > 0 &&
      password.length > 0 &&
      password === confirmPass
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post(
      "https://gyzr1gaitl.execute-api.us-east-1.amazonaws.com/test/signup",
      {
        userName,
        email,
        password,
      }
    );
    console.log(res.data);
    if (res.data.statusCode == 400) {
      setMsg(res.data.body);
      return;
    }
    navigator("/login");
  };

  return (
    <div className="Signup">
      <Form onSubmit={handleSubmit}>
        <h2>Signup</h2>
        <Form.Group controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            autoFocus
            type="text"
            onChange={(e) => {
              setUserName(e.target.value);
            }}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="text"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            autoFocus
            type="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            autoFocus
            type="password"
            onChange={(e) => {
              setConfirmPass(e.target.value);
            }}
          ></Form.Control>
        </Form.Group>

        {/* <p>{error}</p> */}
        <Button
          className="mt-3"
          type="submit"
          size="lg"
          block
          disabled={!validateInput()}
        >
          Signup
        </Button>
      </Form>
      {/* {/* <h1>{msg}</h1> */}
      <h2 className="text-danger">{msg}</h2>
    </div>
  );
}
