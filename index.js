import { ethers } from "./ethers-5.2.js"
import { abi } from "./constant.js"
import { contractAddress } from "./constant.js"



const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
connectButton.addEventListener('click', () => connect())
fundButton.addEventListener('click', () => fund())
const balanceButton = document.getElementById("balanceButton")
balanceButton.addEventListener('click', () => getBalance())
const withdrawButton = document.getElementById("withdraw")
withdrawButton.addEventListener('click', () => withdraw())

async function connect() {
    if (window.ethereum) {
        //check if Metamask is installed

        const address = await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
        });
        connectButton.innerHTML = "Connected!";
    } else {
        connectButton.innerHTML = "Please install Metamask";
    }
}

async function getBalance() {
    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function withdraw() {
    if (window.ethereum) {
        console.log("withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const wallet = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, wallet);

        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider);
            console.log("done !")
        } catch (error) {
            console.log(error);
        }
    }
}


async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log("Funding account with " + ethAmount + " ETH");
    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const wallet = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, wallet);
        try {
            const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) });
            await listenForTransactionMine(transactionResponse, provider);
            console.log("done !")
        } catch (error) {
            console.log(error);
        }
    }
}




function listenForTransactionMine(transactionResponse, provider) {
    console.log("Mining " + transactionResponse.hash + "...")
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transaction) => {
            console.log("Mined " + transaction.confirmations + " confirmations for " + transactionResponse.hash)
            resolve()
        })
    })
}


