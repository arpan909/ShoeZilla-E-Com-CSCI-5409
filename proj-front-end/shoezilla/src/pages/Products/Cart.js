import React, { useState } from "react";
import withContext from "../../withContext";
import CartItem from "./CartItem";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Cart = (props) => {
  const [localCart, setlocalCart] = useState("");
  const { cart } = props.context;
  const navigator = useNavigate();
  const cartKeys = Object.keys(cart || {});
  let email = "";
  if (localStorage.getItem("user") != null) {
    email = JSON.parse(localStorage.getItem("user"))["email"];
  } else {
    toast("Please Login First");
    navigator("/login");
  }
  const clearCart = () => {
    let cart = {};
    localStorage.removeItem("cart");
    setlocalCart({ cart });
  };

  const checkout1 = async () => {
    const { products } = props.context;
    if (!localStorage.getItem("user")) {
      this.routerRef.current.history.push("/login");
      return;
    }
    try {
      const basicHeaders = {
        "Content-Type": "application/json",
      };
      const id = products[0].id.S;
      console.log(id);
      const email = JSON.parse(localStorage.getItem("user"))["email"];
      const response = await fetch(
        `https://f7tbow1yrj.execute-api.us-east-1.amazonaws.com/api/order/create/${id}`,
        {
          method: "POST",
          headers: {
            ...basicHeaders,
          },
          body: JSON.stringify({
            email,
            orderQuantity: 1,
            orderStatus: "created",
            paymentType: "credit card",
          }),
        }
      );

      console.log(JSON.stringify(response));
      toast.success("Your order has been created! Thank you");
      clearCart();
      navigator("/");
    } catch (err) {
      console.log(err);
    }

    //this.setState({ products });
  };

  return (
    <>
      <div className="hero">
        <div className="hero-body">
          <h4 className="title">My Cart</h4>
        </div>
      </div>
      <br />
      <div className="container">
        {cartKeys.length ? (
          <div className="column columns is-multiline">
            {cartKeys.map((key) => (
              <CartItem
                cartKey={key}
                key={key}
                cartItem={cart[key]}
                removeFromCart={props.context.removeFromCart}
              />
            ))}
            <div className="column is-12 is-clearfix">
              <br />
              <div className="is-pulled-right">
                <button
                  onClick={props.context.clearCart}
                  className="button is-danger "
                >
                  Clear cart
                </button>{" "}
                {/* Develop the checkout feature */}
                <button className="button is-success" onClick={checkout1}>
                  Checkout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="column">
            <div className="title has-text-grey-light">No item in cart!</div>
          </div>
        )}
      </div>
    </>
  );
};

export default withContext(Cart);
