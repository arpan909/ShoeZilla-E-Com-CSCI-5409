import React from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProductItem = (props) => {
  const { product } = props;
  const navigator = useNavigate();
  let flag = 0;
  const defUrl = `https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1621946973-under-armour-hovr-sonic-4-1621898887.jpg?crop=1.00xw:0.797xh;0,0.159xh&resize=320%3A%2A`;
  let url = defUrl;
  if (!product.hasOwnProperty("url")) {
    url = defUrl;
  } else {
    url = product.url.S;
  }

  if (
    localStorage.getItem("user") != null &&
    JSON.parse(localStorage.getItem("user"))["accessLevel"] < 1
  ) {
    flag = 1;
  }

  return (
    <div className=" column is-half">
      <div className="box">
        <div className="media">
          <div className="media-left">
            <figure className="image is-64x64">
              <img src={url} alt="Product" />
            </figure>
          </div>
          <div className="media-content">
            <b style={{}}>
              {product.name.S} <span className="tag">${product.price.N}</span>
            </b>
            <div>{product.description.S}</div>
            {product.stock.N > 0 ? (
              <small>{product.stock.N + " Available"}</small>
            ) : (
              <small className="has-text-danger">Out Of Stock</small>
            )}
            {flag == 0 && (
              <div className="is-clearfix">
                <button
                  className="button is-small is-outlined is-link   is-pulled-right"
                  onClick={() =>
                    props.addToCart({
                      id: product.name.S,
                      product,
                      amount: 1,
                    })
                  }
                >
                  Add to Cart
                </button>
              </div>
            )}

            {flag == 1 && (
              <div className="is-clearfix">
                <button
                  class="button is-warning small"
                  onClick={async () => {
                    const id = product.id.S;
                    const response = await fetch(
                      `https://f7tbow1yrj.execute-api.us-east-1.amazonaws.com/api/product/${id}`,
                      {
                        method: "DELETE",
                      }
                    );

                    const data = await response.json();
                    console.log(data);
                    if (data.message.includes("Success")) {
                      toast("Successfully deleted the product");
                      navigator("/products");
                    }
                  }}
                >
                  Remove Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
