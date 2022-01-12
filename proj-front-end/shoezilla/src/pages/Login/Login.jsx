import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import jwt, { decode } from "jsonwebtoken";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const navigator = useNavigate();
  const validateInput = () => {
    return email.length > 0 && password.length > 0;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post(
      "https://gyzr1gaitl.execute-api.us-east-1.amazonaws.com/test/login",
      {
        userName: email,
        password,
      }
    ).catch((res) => {
      return { status: 401, message: 'Unauthorized' }
    });
    console.log(res.data);
    if(res.status === 200 && res.data.body.includes("idToken")) {
      const decodedToken = jwt.decode(JSON.parse(res.data.body).idToken.jwtToken);
      const user = {
        email: decodedToken["cognito:username"],
        token: decodedToken,
        accessLevel: decodedToken["custom:role"] === "admin" ? 0 : 1
      }

      localStorage.setItem("user", JSON.stringify(user));
      setMsg("Logged in!");
      console.log(user)
      console.log(decodedToken["custom:role"])
      console.log(localStorage.getItem("user").length)
      navigator("/");
    } else {
      alert("Invalid Credentials.");
    }
  
    // console.log(res.data);
    // // console.log();
    // if (JSON.parse(res.data.body)["code"]) {
    //   setError("invalid username or pass");
    //   return;
    // }
   // const decodedToken = jwt.decode(JSON.parse(res.data.body).idToken.jwtToken);
    // console.log(jwt.decode(JSON.parse(res.data.body).idToken.jwtToken));
    // setMsg("Logged in!");
    //setError("Hello " + decodedToken["cognito:username"]);
  }
  
  return (
    <div className="Login">
      <Form onSubmit={handleSubmit}>
        <h2>Login</h2>
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
        {/* <p>{error}</p> */}
        <Button
          className="mt-3"
          type="submit"
          size="lg"
          block
          disabled={!validateInput()}
        >
          Login
        </Button>
      </Form>
      <h1>{msg}</h1>
      <h2 className="text-danger">{error}</h2>
    </div>
  );
}
