import React from "react";

function OrderItem(props) {
  const { order, index } = props;
  let flag = 0;
  const {
    orderTimeStamp,
    orderId,
    orderStatus,
    email,
    orderQuantity,
    productId,
    paymentType,
  } = order;

  return (
    <div>
      <table class="table table-bordered">
        <tbody>
          <tr>
            <th scope="row">{index + 1}</th>
            <td>{orderId}</td>
            <td>{orderTimeStamp}</td>
            <td>{orderStatus}</td>
            <td>{orderQuantity}</td>
            <td>{productId}</td>
            <td>{paymentType}</td>
            <td>{email}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default OrderItem;
