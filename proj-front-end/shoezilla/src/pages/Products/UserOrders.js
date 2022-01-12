import React, { useState, useEffect } from "react";
import withContext from "../../withContext";
import OrderItem from "./OrderItem";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const navigator = useNavigate();
  let email = "";
  let accessLevel = "";
  if (localStorage.getItem("user") != null) {
    email = JSON.parse(localStorage.getItem("user"))["email"];
    accessLevel = JSON.parse(localStorage.getItem("user"))["accessLevel"];
  } else {
    toast("Please Login First");
    navigator("/login");
  }

  const fetchProducts = async () => {
    const response = await fetch(
      accessLevel > 0
        ? `https://f7tbow1yrj.execute-api.us-east-1.amazonaws.com/api/orders/user/${email}`
        : `https://f7tbow1yrj.execute-api.us-east-1.amazonaws.com/api/admin/orders/list`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    console.log(data);
    setOrders(data["data"]);
  };

  return (
    <div>
      <button className="btn btn-primary btn-sm" onClick={fetchProducts}>
        Get My Orders
      </button>
      <div>
        {orders && orders.length ? (
          orders.map((order, index) => (
            <OrderItem order={order} index={index}></OrderItem>
          ))
        ) : (
          <div className="column">
            <span className="title has-text-grey-light">No orders found!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserOrders;
