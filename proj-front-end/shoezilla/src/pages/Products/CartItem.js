import React from "react";

const CartItem = props => {
  const { cartItem, cartKey } = props;

  const { product, amount } = cartItem;

  const defUrl = `https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1621946973-under-armour-hovr-sonic-4-1621898887.jpg?crop=1.00xw:0.797xh;0,0.159xh&resize=320%3A%2A`
  let url = defUrl;
  if(! product.hasOwnProperty('url')){
    url = defUrl;
  }else{
    url = product.url.S
  }
  return (
    <div className=" column is-half">
      <div className="box">
        <div className="media"> 
          <div className="media-left">
            <figure className="image is-64x64">
              <img
                src={url}
                alt="def"
              />
            </figure>
          </div>
          <div className="media-content">
            <b style={{  }}>
              {product.name.S}{" "}
              <span className="tag">${product.price.N}</span>
            </b>
            <div>{product.description.S}</div>
            <small>{`${amount} in cart`}</small>
          </div>
          <div
            className="media-right"
            onClick={() => props.removeFromCart(cartKey)}
          >
            {/* <span className="delete is-large"></span> */}
            <button class="button is-warning small">Remove</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;