import React, { Component } from "react";
import withContext from "../../withContext";
import { Navigate } from "react-router-dom";
import axios from "axios";

const initState = {
  name: "",
  price: "",
  stock: "",
  url: "",
  description: "",
};

class AddProduct extends Component {
  constructor(props) {
    super(props);
    this.state = initState;
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { name, price, stock, url, description } = this.state;

    if (name && price) {
      const id =
        Math.random().toString(36).substring(2) + Date.now().toString(36);

      try {
        const basicHeaders = {
          "Content-Type": "application/json",
        };
        const response = await fetch(
          `https://f7tbow1yrj.execute-api.us-east-1.amazonaws.com/api/product/new`,
          {
            method: "POST",
            headers: {
              ...basicHeaders,
            },
            body: JSON.stringify({
              name,
              price,
              stock,
              description,
            }),
          }
        );
      } catch (err) {
        console.log(err);
      }

      this.props.context.addProduct(
        {
          name,
          price,
          url,
          description,
          stock: stock || 0,
        },
        () => this.setState(initState)
      );
      this.setState({
        flash: { status: "is-success", msg: "Product created successfully" },
      });
    } else {
      this.setState({
        flash: { status: "is-danger", msg: "Please enter name and price" },
      });
    }
  };

  handleChange = (e) => {
    if (e.target.name === "image") {
      console.log("Image Uploading");
    } else {
      this.setState({ [e.target.name]: e.target.value, error: "" });
    }
  };

  render() {
    const { name, price, stock, url, description } = this.state;
    const { user } = this.props.context;

    return !(user && user.accessLevel < 1) ? (
      <Navigate to="/" />
    ) : (
      <>
        <div className="hero">
          <div className="hero-body">
            <h4 className="title">Add Product</h4>
          </div>
        </div>
        <br />
        <br />
        <form onSubmit={this.handleSubmit}>
          <div className="columns is-centered">
            <div className="column is-half">
              <div className="field">
                <label className="label">Product Name: </label>
                <input
                  className="input"
                  type="text"
                  name="name"
                  value={name}
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Price: </label>
                <input
                  className="input"
                  type="number"
                  name="price"
                  value={price}
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Available in Stock: </label>
                <input
                  className="input"
                  type="number"
                  name="stock"
                  value={stock}
                  onChange={this.handleChange}
                />
              </div>
              {/* <div className="field">
                <label className="label">URL: </label>
                <input
                  className="input"
                  type="text"
                  name="url"
                  value={url}
                  onChange={this.handleChange}
                />
              </div> */}
              <div className="field">
                <label className="label">Description: </label>
                <textarea
                  className="textarea"
                  type="text"
                  rows="2"
                  style={{ resize: "none" }}
                  name="description"
                  value={description}
                  onChange={this.handleChange}
                />
              </div>
              <span>Post photo</span>

              <div>
                <label>
                  <input
                    onChange={this.handleChange}
                    type="file"
                    name="image"
                    accept="image"
                    required
                    placeholder="choose a file"
                  />
                </label>
              </div>

              {this.state.flash && (
                <div className={`notification ${this.state.flash.status}`}>
                  {this.state.flash.msg}
                </div>
              )}
              <div className="field is-clearfix">
                <button
                  className="button is-link is-outlined is-pulled-right"
                  type="submit"
                  onClick={this.handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </form>
      </>
    );
  }
}

export default withContext(AddProduct);
