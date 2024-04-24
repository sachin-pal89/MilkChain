import React from "react";
import { Button, Card } from "react-bootstrap";
require('dotenv').config();

class ProductList extends React.Component {
    render() {
        return (
            <div id="productList">
                {this.props.products.map((product, key) => (
                    <div key={key} className="mt-5 mb-5">
                        <Card>
                            <Card.Img
                                variant="top"
                                src={`${process.env.REACT_GATEWAY_URL}/ipfs/${product.imgHash}`}
                                // src={`https://yellow-tricky-anteater-38.mypinata.cloud/ipfs/Qme1w3UUnQ1QZ5Sqpy5YKXh9Tb7ctKUo6NFQJByYApugrt`}
                            />
                            <Card.Text as="div">
                                <div>
                                    <p className="productName">{product.name}</p>
                                    <p className="productPrice">Price: {product.price} ETH</p>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        this.props.createOrder(product.id, product.price);
                                    }}
                                >
                                    Buy Now
                                </Button>
                            </Card.Text>
                        </Card>
                    </div>
                ))}
            </div>
        );
    }
}

export default ProductList;