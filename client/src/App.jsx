import React from "react";
import DopeShop from './contracts/DopeShop.json';
import Web3 from 'web3';
import Navbar from './components/SiteNavbar';
import Main from './components/Main';
import { Container } from "react-bootstrap";
import { create } from "ipfs-http-client";
require('dotenv').config();

const auth = `Bearer ${process.env.REACT_PINATA_JWT}`; // Replace with your Pinata JWT key
const ipfs = create({
  host: 'gateway.pinata.cloud',
  port: 443,
  protocol: 'https',
  headers: {
    authorization: auth
  }
});

const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhNTA4Mzg4ZS1lZGZhLTRhOTEtOGJlYS0xZWU3NDA0OWRiODQiLCJlbWFpbCI6InNhY2hpbnBhbDAxMDEyMDAzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmNjFhZDE3OTIzYmUxZGZlYmEzNCIsInNjb3BlZEtleVNlY3JldCI6IjExOWM3ZjJkMzg5YTUzNWY1Zjc0ZTlmMTA5YTQ1NTllYWY2NDk2OGJmYTViYjhjYmRlZWM3MTdiZTU3ZmVkNzQiLCJpYXQiOjE3MTM2MzEyODN9.zAXsiF0esy7OEBFCJfnBUr5zqJABLGyKdxOY9G7HXBk"

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      dopeShop: null,
      products: [],
      orders: [],
      sales: [],
      myProducts: [],
      loading: true,
      show: 'products'
    }
    this.handleNav = this.handleNav.bind(this)
    this.captureFile = this.captureFile.bind(this);
    this.addProduct = this.addProduct.bind(this);
    this.createOrder = this.createOrder.bind(this);
  }


  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = DopeShop.networks[networkId]
    if (networkData) {
      const dopeshop = new web3.eth.Contract(DopeShop.abi, networkData.address)
      this.setState({ dopeshop })
      const productCount = await dopeshop.methods.productCount().call()

      for (let i = productCount; i > 0; i--) {
        var product = await dopeshop.methods.products(i).call()
        console.log(product, "product details");
        if (product.seller === this.state.account) {
          this.setState({
            myProducts: [...this.state.myProducts, product]
          })
        } else {
          this.setState({
            products: [...this.state.products, product]
          })
        }
      }

      const ordersCount = await dopeshop.methods.ordersCount().call()
      for (let i = ordersCount; i > 0; i--) {
        var order = await dopeshop.methods.orders(i).call()
        product = await dopeshop.methods.products(order.productId).call()
        order = { ...order, imgHash: product.imgHash, name: product.name, price: product.price }
        if (order.seller === this.state.account) {
          this.setState({
            sales: [...this.state.sales, order]
          })
        } else if (order.buyer === this.state.account) {
          this.setState({
            orders: [...this.state.orders, order]
          })
        }
      }


      this.setState({ loading: false })
      console.log(this.state.products, this.state.orders, this.state.sales)
    } else {
      window.alert('dopeShop contract not deployed to detected network.')
    }
  }

  handleNav(show) {
    console.log(show)
    this.setState({ show })
  }

  captureFile(event) {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsDataURL(file);
  
    reader.onloadend = () => {
      const buffer = reader.result;
      const fileType = file.type; // Store file type if available
      this.setState({ buffer, fileType });
      console.log('uploading', buffer);
    };
  }
  

  addProduct(name, price) {
    this.setState({ loading: true });
    const formData = new FormData();
  
    const buffer = this.state.buffer;
    const fileType = this.state.fileType; // Use stored fileType if available
    console.log(fileType)
    if (!buffer) {
      console.error('No file selected!');
      return;
    }

    formData.append('file', new Blob([buffer], { type: fileType || 'application/octet-stream' })); // Use stored fileType or defaultt
    
    const pinataMetadata = JSON.stringify({
      name: name,
      // Add other required fields as per Pinata's documentation
    });
    formData.append("pinataMetadata", pinataMetadata);
  
    fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
      body: formData
    })
      .then(res => res.json())
      .then(async (res) => {
        console.log(res);
        if (!res.IpfsHash) {
          console.error('Pinning failed!');
          return;
        }
        console.log(res.IpfsHash);
        this.state.dopeshop.methods.addProduct(name, res.IpfsHash, price).send({ from: this.state.account }).on('transactionHash', async (hash) => {
          this.setState({ loading: false });
          console.log(name, price);
        })
      })
      .catch(err => {
        console.error(err);
        this.setState({ loading: false });
      })
  }
  

  createOrder(productId, price) {
    this.setState({ loading: true })
    this.state.dopeshop.methods.createOrder(productId).send({ from: this.state.account, value: Web3.utils.toWei(price, 'Ether') }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
      console.log('ordered')
    })
  }

  render() {
    return (
      <div id="App">
        <Navbar account={this.state.account} handleNav={this.handleNav} />
        <div className="main">
          {this.state.loading
            ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
            : <Container>
              <Main
                show={this.state.show}
                products={this.state.products}
                myProducts={this.state.myProducts}
                orders={this.state.orders}
                sales={this.state.sales}
                captureFile={this.captureFile}
                addProduct={this.addProduct}
                createOrder={this.createOrder}
              />
            </Container>
          }
        </div>
      </div>
    );
  }
}

export default App;
