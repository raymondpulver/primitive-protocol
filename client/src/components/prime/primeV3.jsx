import React, { Component, PureComponent } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import { colors } from '../../theme/theme';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import LinkM from '@material-ui/core/Link';
import GitHubIcon from '@material-ui/icons/GitHub';
import TwitterIcon from '@material-ui/icons/Twitter';
import Paper from '@material-ui/core/Paper';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';
import Link from '@material-ui/core/Link';

import Web3 from 'web3';
import HorizontalNonLinearStepper from './stepper';
import Board from './board';
import Column from './column';
import OrderForm from './orderForm';
import NavButton from './navButton';
import Footer from './footer';

import INITIAL_CONTEXT from './constants';
import TOKENS_CONTEXT from './tokenAddresses';
import PrimeContract from '../../artifacts/Prime.json';

import MintForm from './mintForm';
import INITIAL_OPTIONS from './intialOptions';
import ApproveForm from './approveForm';
import InventoryV2 from './inventoryV2';
import Erc20 from '../../artifacts/tUSD.json';
import Exchange from '../../artifacts/Exchange.json';
import { Web3ReactProvider, getWeb3ReactContext } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import Web3Modal from 'web3modal';
import Header from './header';

import OptionsChainTable from './optionsChainTable';
import OptionsChainTableV2 from './optionsChainTableV2';
import PositionsTable from './positionsTable';
import OpenPosition from './openPosition';

const providerOptions = {
};

function ellipseAddress(address) {
    let width = 4;
    let newAddress = `${address.slice(0, width)}...${address.slice(-width)}`;
    return newAddress;
};

function initWeb3(provider) {
    const web3 = new Web3(provider);
  
    web3.eth.extend({
      methods: [
        {
          name: "chainId",
          call: "eth_chainId",
          outputFormatter: web3.utils.hexToNumber
        }
      ]
    });
  
    return web3;
};

const styles = theme => ({
    root: {
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: colors.background,
        [theme.breakpoints.up('sm')]: {
            flexDirection: 'column',
        },
    },
    chainContainer: {
        display: 'flex',
        minWidth: '30%',
        minHeigth: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        [theme.breakpoints.up('sm')]: {
            flexDirection: 'column',
        },
        margin: '16px',
        backgroundColor: colors.banner,
    },
    chainHeader: {
        display: 'flex',
        height: '10%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        textAlign: 'center',
        color: colors.primary,
    },
    chainHeaderTypography: {
        width: '50%',
        alignItems: 'center',
        textAlign: 'center',

    },
    chainBody: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'row',
        margin: '16px',
        borderRadius: '16px',
    },
    chainButton: {
        backgroundColor: colors.secondary,
        color: colors.banner,
        borderRadius: '4px',
        margin: '16px',
        '&:hover': {
            backgroundColor: colors.success,
        },
    },
    chainFooter: {

    },
    navButton: {
        backgroundColor: colors.secondary,
        color: colors.banner,
        borderRadius: '4px',
        margin: '16px',
        '&:hover': {
            backgroundColor: colors.success,
        },
    },
    connectButton: {
        backgroundColor: colors.secondary,
        color: colors.banner,
        borderRadius: '16px',
        marginTop: '16px',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        '&:hover': {
            backgroundColor: colors.success,
        },
    },
    header: {
        display: 'flex',
        height: '10%',
    },

    body: {
        display: 'flex',
        flexDirection: 'row',
        minHeight: '90%',
        minHeight: '90vh',
        width: '100%',
        margin: '8px',
    },

    openPosition: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.banner,
        width: '25%',
        margin: '8px',
    },

    core: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.background,
        width: '75%',
        /* minHeight: '150vh', */
        margin: '8px',
    },

    coreHeader: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        backgroundColor: colors.banner ,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
    },

    coreHeaderTypography: {
        width: '33.33%',
        textAlign: 'center',
    },

    chain: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.banner,
        /* height: '60%', */
        marginBottom: '8px',
    },

    positions: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.banner,
        /* minHeight: '40%', */
        marginTop: '8px',
    },

    footer: {
        display: 'flex',
        flexDirection: 'column',
        margin: '16px',
    },

});

class PrimeV3 extends Component {
    constructor(props) {
        super(props);
        this.state = {...INITIAL_OPTIONS};
        this.web3Modal = new Web3Modal({
            network: 'rinkeby',
            cacheProvider: true,
            providerOptions
        });

        /* CORE */
        this.getWeb3 = this.getWeb3.bind(this);
        this.getAccount = this.getAccount.bind(this);
        this.getNetwork = this.getNetwork.bind(this);
        this.resetApp = this.resetApp.bind(this);

        /* SELECTIONS */
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSelectAmounts = this.handleSelectAmounts.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.selectAmounts = this.selectAmounts.bind(this);

        /* NAVIGATION */
        this.checkValid = this.checkValid.bind(this);
        this.goForward = this.goForward.bind(this);
        this.goBackward = this.goBackward.bind(this);
        this.goToDashboard = this.goToDashboard.bind(this);
        
        /* HELPER WEB3 FUNCTIONS */
        this.handleApprove = this.handleApprove.bind(this);
        this.handleAllowance = this.handleAllowance.bind(this);
        this.getInstance = this.getInstance.bind(this);
        this.getTokenAbi = this.getTokenAbi.bind(this);
        this.getTokenAddress = this.getTokenAddress.bind(this);
        this.getContractInstance = this.getContractInstance.bind(this);

        /* CONTRACT INTERACTION */
        this.handleMint = this.handleMint.bind(this);
        this.createPrime = this.createPrime.bind(this);
        this.primeExercise = this.primeExercise.bind(this);
        this.primeClose = this.primeClose.bind(this);

        /* GET DATA */
        this.getCurrentPrimeOutput = this.getCurrentPrimeOutput.bind(this);
        this.getBalanceOfPrime = this.getBalanceOfPrime.bind(this);
        this.getOwnerOfPrime = this.getOwnerOfPrime.bind(this);
        this.getPrimeProperties = this.getPrimeProperties.bind(this);
        this.getPastEvents = this.getPastEvents.bind(this);
        this.getPrimeInventory = this.getPrimeInventory.bind(this);
        this.getBalanceOfErc20 = this.getBalanceOfErc20.bind(this);
        this.getWalletData = this.getWalletData.bind(this);
        this.getProfitData = this.getProfitData.bind(this);
        this.getBankData = this.getBankData.bind(this);
        this.getBankInventory = this.getBankInventory.bind(this);
        this.getMintedPrimes = this.getMintedPrimes.bind(this);
        this.getDeactivatedPrimes = this.getDeactivatedPrimes.bind(this);
        this.getActivePrimes = this.getActivePrimes.bind(this);

        this.onConnect = this.onConnect.bind(this);
        this.getOptionChain = this.getOptionChain.bind(this);
        this.getPositions = this.getPositions.bind(this);
        this.getUsdToEth = this.getUsdToEth.bind(this);
        this.handleOptionSelect = this.handleOptionSelect.bind(this);
        this.handleOrder = this.handleOrder.bind(this);

        this.getOptions = this.getOptions.bind(this);
    }

    componentDidMount = async () => {
        if (this.web3Modal.cachedProvider) {
            this.onConnect();
        };
    };

    /* WEB3 FUNCTIONS */
    getWeb3 = async () => {
        const provider = await this.web3Modal.connect();
        const web3 = new Web3(provider)
        return web3;
    };

    resetApp = async () => {
        const { web3 } = this.state;
        console.log(web3.currentProvider)
        if (web3 && web3.currentProvider && web3.currentProvider.close) {
          await web3.currentProvider.close();
          console.log('web3 on reset', web3)
        }
        await this.web3Modal.clearCachedProvider();
        console.log('RESET APP')
        this.setState( INITIAL_OPTIONS );
    };

    onConnect = async () => {
        const provider = await this.web3Modal.connect();

        const web3 = initWeb3(provider);

        const accounts = await web3.eth.getAccounts();

        const address = accounts[0];

        const networkId = await web3.eth.net.getId();

        const chainId = await web3.eth.getChainId();
        await this.setState({
            web3: web3,
            provider: provider,
            connected: true,
            address: address,
            chainId: chainId,
            networkId: networkId,
            account: address,
        });
        /* await this.getBalanceOfPrime();
        await this.getPastEvents('PrimeMinted');
        await this.getPrimeInventory();
        await this.getWalletInventory();
        await this.getBankInventory();
        await this.getProfitData();
        await this.getActivePrimes(); */
        /* await this.getPrimeInventory(); */
        /* await this.getOptionChain('call', '1', 'tETH', 'DAI', '1600473585');
        await this.getOptionChain('put', '1', 'DAI', 'tETH', '1600473585'); */
        /* await this.getPositions(); */
        await this.getOptions();
        console.log({web3, provider, address,  chainId, networkId})
    };

    getAccount = async () => {
        console.time('getAccount');
        const web3 = this.state.web3;
        if(web3) {
            let accounts = await web3.eth.getAccounts();
            let account = accounts[0];
            /* console.trace({account}) */
            this.setState({
                account: account,
            })
            return(account);
        }
        console.timeEnd('getAccount');
    };

    getNetwork = async () => {
        console.time('getNetwork');
        const web3 = this.state.web3;
        if(web3) {
            let networkId = await web3.eth.net.getId();
            /* console.trace({networkId}) */
            console.timeEnd('getTokenAddress');
            return(networkId);
        }
        console.timeEnd('getNetwork');
    };

    getContractInstance = async (Contract) => {
        console.time('getContractInstance');
        let contractName = Contract.contractName;
        if(
            this.state.instances
            && this.state.instances[contractName]
        ) {
            let _instance = this.state.instances[contractName][0]['instance']
            console.timeEnd('getContractInstance');
            return _instance;
        };


        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();

        // GET CONTRACT
        const deployedNetwork = await Contract.networks[networkId];
        const instance = new web3.eth.Contract(
            Contract.abi,
            deployedNetwork && deployedNetwork.address,
        );

        const name = await instance.methods.name().call();

        /* console.trace({instance}) */
        let instanceArray = (this.state.instances) ? Array.from(this.state.instances) : [];
        let newArray = [
            {
                name: name,
                instance: instance,
                address: deployedNetwork.address
            }
        ]
        instanceArray.push(newArray);
        this.setState({
            instances: {
                ...this.state.instances,
                [contractName]: newArray,
            }
        });
        console.timeEnd('getContractInstance');
        return instance;
    };

    getAllowance = async (symbol) => {
        let instance = await this.getInstance(symbol);
        let prime = await this.getContractInstance(PrimeContract);
        const account = await this.getAccount();
        let allowance = await instance.methods.allowance(
            account,
            prime._address
        ).call();
        this.setState({
            allowances: {
                ...this.state.allowances,
                [symbol]: [allowance],
            },
        });
        return allowance;
    };

    getTokenAddress = (networkId, symbol) => {
        console.time('getTokenAddress');
        let token = TOKENS_CONTEXT[networkId][symbol];
        if(typeof token !== 'undefined' && typeof token.address !== 'undefined') {
            /* console.trace(token.address) */
            console.timeEnd('getTokenAddress');
            return token.address;
        } else {
            /* console.trace(token.address) */
            console.timeEnd('getTokenAddress');
            return '';
        }
    };

    getTokenAbi = (networkId, symbol) => {
        console.time('getTokenAbi');
        let token = TOKENS_CONTEXT[networkId][symbol];
        if(typeof token !== 'undefined' && typeof token.address !== 'undefined') {
            /* console.trace(token.address) */
            console.timeEnd('getTokenAbi');
            return token.abi;
        } else {
            /* console.trace(token.address) */
            console.timeEnd('getTokenAbi');
            return '';
        }
    };

    getInstance = async (symbol) => {
        console.time('getContractInstance');
        if(
            this.state.instances
            && this.state.instances[symbol]
        ) {
            let _instance = this.state.instances[symbol][0]['instance']
            console.timeEnd('getContractInstance');
            return _instance;
        };


        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();

        // GET CONTRACT
        const deployedNetwork = networkId;
        let address = await this.getTokenAddress(networkId, symbol);
        let abi = await this.getTokenAbi(networkId, symbol);
        const instance = new web3.eth.Contract(
            abi,
            deployedNetwork && address,
        );

        const name = await instance.methods.name().call();

        /* console.trace({instance}) */
        let instanceArray = (this.state.instances) ? Array.from(this.state.instances) : [];
        let newArray = [
            {
                name: name,
                instance: instance,
                address: deployedNetwork.address
            }
        ]
        instanceArray.push(newArray);
        this.setState({
            instances: {
                ...this.state.instances,
                [symbol]: newArray,
            }
        });
        console.timeEnd('getContractInstance');
        return instance;
    };

    handleApprove = async (contractInstance, approveAddr, approveAmt, _from) => {
        console.time('handleApprove');
        let approve = await contractInstance.methods.approve(
                approveAddr,
                approveAmt
            ).send({
                from: _from,
        });
        console.timeEnd('handleApprove');
        return approve;
    };

    handleAllowance = async (symbol) => {
        console.log('HANDLE ALLOWANCE FOR: ', symbol)
        const web3 = this.state.web3;
        const account = await this.getAccount();
        let instance = await this.getInstance(symbol);
        let prime = await this.getContractInstance(PrimeContract);
        let primeAddress = prime._address;
        let allowance = await web3.utils.toWei('1000000000');
        let approve = await instance.methods.approve(
            primeAddress,
            allowance
        ).send({
            from: account,
        });

        this.setState({
            allowances: {
                ...this.state.allowances,
                [symbol]: allowance,
            },
        });
        return approve;
    };

    createPrime = async (
        collateralAsset, 
        paymentAsset, 
        addressReceiver, 
        expirationDate,
        collateralAmount,
        paymentAmount
    ) => {
        if(
            isNaN(collateralAmount)
            || isNaN(paymentAmount)
        ) {
            return;
        }


        // GET WEB3 AND ACCOUNT
        const web3 = this.state.web3;

        /* console.trace({web3}) */
        const account = await this.getAccount();

        // GET NETWORK ID
        const networkId = await this.getNetwork();

        // GET PRIME CONTRACT
        let primeInstance = await this.getContractInstance(PrimeContract);
        let collateralInstance = await this.getInstance(collateralAsset);

        /* collateralAmount = (await web3.utils.toWei(collateralAmount)).toString();
        paymentAmount = (await web3.utils.toWei(paymentAmount)).toString(); */
        // CALL PRIME METHOD
        let result;
        if(typeof primeInstance !== 'undefined') {
            let nonce = await primeInstance.methods.nonce().call();
            let DEFAULT_AMOUNT_WEI = await web3.utils.toWei((1).toString());
            /* 
            * TOKENS_CONTEXT is a constant that can search for addresses of assets
            * TOKENS_CONTEXT[NETWORKID][TOKEN_SYMBOL].address
            */

            let primeAddress = primeInstance._address;
            let allowance = await this.getAllowance(collateralAsset);
            if(allowance < collateralAmount) {
                await this.handleApprove(
                    collateralInstance, 
                    primeAddress, 
                    collateralAmount, 
                    account
                );
            }

            const _xis = collateralAmount;
            const _yak = this.getTokenAddress(networkId, collateralAsset);
            const _zed = paymentAmount;
            const _wax = this.getTokenAddress(networkId, paymentAsset);
            const _pow = expirationDate;
            const _gem = addressReceiver;

            /*
            * @dev From the Prime.sol contract
            * @param _xis Amount of collateral to deposit.
            * @param _yak Address of collateral asset.
            * @param _zed Amount of payment asset.
            * @param _wax Payment asset address.
            * @param _pow Expiry timestamp.
            * @param _gem Receiver address.
            * @return bool Success.
            */
            result = await primeInstance.methods.createPrime(
                _xis,
                _yak,
                _zed,
                _wax,
                _pow,
                _gem,
            ).send({
                from: account,
            });

            this.setState({
                /* createPrimeTx: result, */
                onDashboard: true,
            }, (async () => {
                        await this.getPositions();
                    }
                )
                
            );
            console.trace({result});
        }

        
        console.timeEnd('createPrime');
        return result;
    };

    /* COMPONENT FUNCTIONS */

    handleSelect = (value, name) => {
        console.log('select value', value, name);
        this.setState({
            selection: {
                ...this.state.selection,
                [name]: value,
            }
        }, () => this.checkValid());

        
    };

    checkValid = () => {
        let selection = (this.state.selection) ? this.state.selection : '';
        let valid = false;
        if(
            typeof selection['collateral'] !== 'undefined' 
            && typeof selection['payment'] !== 'undefined' 
            && typeof selection['expiration'] !== 'undefined' 
        ) {
            console.log(
                'VALID', 
                selection['collateral'],
                selection['payment'],
                selection['expiration']
            );
            valid = true;
            
        } else {
            valid = false;
        }

        this.setState({
            valid: valid,
        });
        return valid;
    };

    selectAmounts = () => {
        if(this.state.valid) {
            this.setState({
                selectAmounts: !this.state.selectAmounts
            });
        }
        
    };

    handleSubmit = async () => {
        console.time('handleSubmit');
        await this.getCurrentPrimeOutput();
        /* GET BOARD STATE AND LOAD INTO PAYLOAD FOR ETHEREUM TX */
        const account = await this.getAccount();
        let payloadArray = [];
        let addressReceiver = account;
        let _collateral = this.state.selection['collateral'];
        let _payment = this.state.selection['payment'];
        let _expiration = this.state.selection['expiration'];
        

        /* GET QUANTITY OF ASSETS */
        let collateralAmount = (this.state.collateralAmount) ? (this.state.collateralAmount) : undefined;
        let paymentAmount = (this.state.paymentAmount) ? (this.state.paymentAmount) : undefined;
        if(
            typeof collateralAmount === 'undefined'
            || typeof paymentAmount === 'undefined'
        ) {
            console.log({collateralAmount, paymentAmount}, 'COLLAT OR PAYMENT QTY UNDEFINED')
            return;
        }
        console.log({collateralAmount, paymentAmount})

        /* PASS PARAMETERS TO CONTRACT FUNCTION AND SEND TRANSACTION */
        try {
            await this.createPrime(
                _collateral,
                _payment,
                addressReceiver,
                _expiration,
                collateralAmount,
                paymentAmount
            );
        } catch(error) {
            console.log({error})
        }

        console.trace({
            payloadArray, 
            _collateral, 
            _payment, 
            addressReceiver, 
            _expiration, 
            collateralAmount,
            paymentAmount 
        });
        console.timeEnd('handleSubmit');
    };

    handleSelectAmounts = (name, amount) => {
        let collateralAmount = (this.state.collateralAmount) ? this.state.collateralAmount : 0;
        let paymentAmount = (this.state.paymentAmount) ? this.state.paymentAmount : 0;
        console.log({amount})
        switch(name) {
            case 'collateral':
                collateralAmount = amount;
                break;
            case 'payment':
                paymentAmount = amount;
                break;  
        };

        this.setState({
            collateralAmount: collateralAmount,
            paymentAmount: paymentAmount,
        }, () => {this.checkValid(); this.getCurrentPrimeOutput();})
        console.log('HANDLE ASSET AMOUNT', {collateralAmount, paymentAmount})
    };

    getCurrentPrimeOutput = async () => {
        const web3 = this.state.web3;
        let primeInstance = await this.getContractInstance(PrimeContract);
        let xis, yakSymbol, zed, waxSymbol, pow;

        function createData( xis, yakSymbol, zed, waxSymbol, pow) {
            return { xis, yakSymbol, zed, waxSymbol, pow };
        };

        let primeOutput = [];
        
        let collateral = (this.state.collateralAmount) ? this.state.collateralAmount : 0;
        let payment = (this.state.paymentAmount) ? this.state.paymentAmount : 0;
        let expiration = (this.state.selection) ? (this.state.selection['expiration']) ? (this.state.selection['expiration']) : '' : '';
        let collateralSym = (this.state.selection) ? (this.state.selection['collateral']) ? (this.state.selection['collateral']) : '' : '';
        let paymentSym = (this.state.selection) ? (this.state.selection['payment']) ? (this.state.selection['payment']) : '' : '';
        
        if(isNaN(payment)) {
            payment = 'INVALID';
        }

        if(isNaN(collateral)) {
            collateral = 'INVALID';
        }

        xis = collateral;
        yakSymbol = collateralSym;
        zed = payment;
        waxSymbol = paymentSym;
        pow = expiration;
        const date = new Date(pow * 1000);
        pow = (date.toDateString());
        let data = createData(
            xis,
            yakSymbol,
            zed,
            waxSymbol,
            pow,
        );

        primeOutput.push(data)
        console.log({primeOutput})
        this.setState({
            primeOutput: primeOutput,
        })
        return primeOutput;
    };

    goForward = async () => {
        let goForward;
        let maxSteps = 2;
        if(this.state.valid) {
            let allowance = await this.getAllowance(this.state.selection['collateral']);
            console.log({allowance})
            if(allowance > 0) {
                goForward = this.state.step + 2;
            } else {
                goForward = this.state.step + 1;
            }
            if(goForward > maxSteps) {
                goForward = maxSteps;
            }
            this.setState({
                step: goForward,
            },);
        }
        console.log({goForward})
    };

    goBackward = () => {
        let goBackward;
        if(this.state.valid) {
            if(this.state.allowances[this.state.selection['collateral']] > 0) {
                goBackward = this.state.step - 2;
            } else {
                goBackward = this.state.step - 1;
            }
            if(goBackward < 0) {
                goBackward = 0;
            }
            this.setState({
                step: goBackward,
            });
        }
        console.log({goBackward})
    };

    getBalanceOfPrime = async () => {
        console.time('getBalanceOfPrime')
        // GET WEB3 AND ACCOUNT
        const web3 = this.state.web3;

        // GET INJECTED ACCOUNT
        const account = await this.getAccount();

        // GET PRIME CONTRACT
        let primeInstance = await this.getContractInstance(PrimeContract);

        let result = await primeInstance.methods.balanceOf(
            account
        ).call();
        this.setState({
            primeBalance: result,
        });
        console.timeEnd('getBalanceOfPrime');
        return result;
    };

    getBalanceOfErc20 = async () => {
        console.time('getBalanceOfErc20')
        // GET WEB3 AND ACCOUNT
        const web3 = this.state.web3;

        // GET INJECTED ACCOUNT
        const account = await this.getAccount();

        // GET PRIME CONTRACT
        let ercInstance = await this.getContractInstance(Erc20);

        let result = await ercInstance.methods.balanceOf(
            account
        ).call();
        this.setState({
            ercBalance: result,
        });
        console.timeEnd('getBalanceOfErc20');
        return result;
    };

    getOwnerOfPrime = async (tokenId) => {
        console.time('getOwnerOfPrime')
        // GET WEB3 AND ACCOUNT
        const web3 = this.state.web3;

        // GET INJECTED ACCOUNT
        const account = await this.getAccount();

        // GET PRIME CONTRACT
        let primeInstance = await this.getContractInstance(PrimeContract);

        let result = await primeInstance.methods.ownerOf(
            tokenId
        ).call();
        this.setState({
            ownerOf: {
                [tokenId]: result,
            }
        });
        console.timeEnd('getOwnerOfPrime');
        return result;
    };

    getPrimeProperties = async (tokenId) => {
        console.time('getPrimeProperties')
        // GET WEB3 AND ACCOUNT
        const web3 = this.state.web3;

        // GET INJECTED ACCOUNT
        const account = await this.getAccount();

        // GET PRIME CONTRACT
        let primeInstance = await this.getContractInstance(PrimeContract);

        let result = await primeInstance.methods.getPrime(
            tokenId
        ).call();
        this.setState({
            primeTokens: {
                [tokenId]: result
            }
        });
        console.timeEnd('getPrimeProperties');
        console.log({result});
        return result;
    };

    getPastEvents = async (event) => {
        // GET PRIME CONTRACT
        let primeInstance = await this.getContractInstance(PrimeContract);
        const account = await this.getAccount();
        let result = await primeInstance.getPastEvents(event, {
            filter: {_user: account},
            fromBlock: 0,
            toBlock: 'latest',
        });
        let returnValues = [];
        for(var i = 0; i < result.length; i++){
            returnValues.push(result[i].returnValues);
        }
        
        let userMintedPrimes = [];
        for(var i = 0; i < result.length; i++){
            userMintedPrimes.push(result[i].returnValues['_tokenId']);
        }

        this.setState({
            pastEvents: {
                [event]: result,
            },
            returnValues: {
                [event]: returnValues,
            },
            userMintedPrimes: {
                [account] : userMintedPrimes,
            }
        });
        /* console.log(result);
        console.log({returnValues})
        console.log({userMintedPrimes}) */
        return result;
    };

    getPrimeInventory = async () => {
        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();
        let primeInstance = await this.getContractInstance(PrimeContract);

        let nonce = await primeInstance.methods.nonce().call();

        function createData(tokenId, xis, yakSymbol, zed, waxSymbol, pow, gem, position) {
            return { tokenId, xis, yakSymbol, zed, waxSymbol, pow, gem, position };
        };

        let primeRows = [];
        let activePrimes = await this.getActivePrimes();
        let userOwnedPrimes = [];
        let position = {};

        for(var i = 1; i <= nonce; i++) {
            if((await this.getOwnerOfPrime(i)) === account) {
                userOwnedPrimes.push(i);
                position[`${i}`] = 'Long';
            } else {
                console.log('Does not own: ', i)
                if(activePrimes.indexOf(`${i}`) !== -1) {
                    position[`${i}`] = 'Short';
                    userOwnedPrimes.push(i);
                }
            }
        };


        for(var i = 0; i < userOwnedPrimes.length; i++) {
            let properties = await this.getPrimeProperties(userOwnedPrimes[i]);
            let yakInstance = new web3.eth.Contract(
                Erc20.abi,
                networkId && properties['yak'],
            );
            let yakSymbol = await yakInstance.methods.symbol().call();

            let waxInstance = new web3.eth.Contract(
                Erc20.abi,
                networkId && properties['wax'],
            );
            let waxSymbol = await waxInstance.methods.symbol().call();

            let tokenId = userOwnedPrimes[i];
            let xis = await web3.utils.fromWei(properties['xis']);
            let zed = await web3.utils.fromWei(properties['zed']);
            const date = new Date(properties['pow'] * 1000);
            let pow = (date.toDateString());
            let data = createData(
                tokenId,
                xis,
                yakSymbol,
                zed,
                waxSymbol,
                pow,
                properties['gem'],
                position[`${tokenId}`]
            );

            primeRows.push(data)
            console.log({primeRows})
        }
        this.setState({
            primeRows: primeRows,
        },);
        return primeRows;
    };

    getWalletData = async (instance, account) => {
        const web3 = this.state.web3;
        let _prime = await this.getContractInstance(PrimeContract);
        function createData(symbol, balance) {
            return { symbol, balance };
        };
        let sym = await instance.methods.symbol().call();
        let bal = await web3.utils.fromWei(await instance.methods.balanceOf(account).call()); /* BAL OF WALLET */
        /* let bal;
        bal = await web3.utils.fromWei(await _prime.methods.getBalance(account, instance._address).call()); */
        
        let data = createData(sym, bal);
        return data;
    };

    getWalletInventory = async () => {
        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();

        function createData(symbol, balance) {
            return { symbol, balance };
        };


        // GET CONTRACTS

        const daiAbi = this.getTokenAbi(networkId, 'DAI')
        const daiAddress = this.getTokenAddress(networkId, 'DAI')
        const daiNetwork = '4';
        const daiInstance = new web3.eth.Contract(
            daiAbi,
            daiNetwork && daiAddress,
        );

        const tUSDAbi = this.getTokenAbi(networkId, 'tUSD')
        const tUSDAddress = this.getTokenAddress(networkId, 'tUSD')
        const tUSDNetwork = '4';
        const tUSDInstance = new web3.eth.Contract(
            tUSDAbi,
            tUSDNetwork && tUSDAddress,
        );

        const tETHAbi = this.getTokenAbi(networkId, 'tETH')
        const tETHAddress = this.getTokenAddress(networkId, 'tETH')
        const tETHNetwork = '4';
        const tETHInstance = new web3.eth.Contract(
            tETHAbi,
            tETHNetwork && tETHAddress,
        );

        let ethBal = await web3.utils.fromWei(await web3.eth.getBalance(account));
        let ethSym = 'ETH'
        let ethData = createData(ethSym, ethBal);
        let walletRows = [];
        walletRows.push(ethData);
        walletRows.push(await this.getWalletData(daiInstance, account));
        walletRows.push(await this.getWalletData(tUSDInstance, account));
        walletRows.push(await this.getWalletData(tETHInstance, account));
        console.log({walletRows})

        this.setState({
            walletRows: walletRows,
        },);

        return walletRows;
    };

    getBankData = async (instance, account) => {
        const web3 = this.state.web3;
        let _prime = await this.getContractInstance(PrimeContract);
        function createData(symbol, balance) {
            return { symbol, balance };
        };
        let sym = await instance.methods.symbol().call();
        let bal;
        bal = await web3.utils.fromWei(await _prime.methods.getBalance(account, instance._address).call());
        
        let data = createData(sym, bal);
        return data;
    };

    getBankInventory = async () => {
        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();

        // GET CONTRACTS

        const daiAbi = this.getTokenAbi(networkId, 'DAI')
        const daiAddress = this.getTokenAddress(networkId, 'DAI')
        const daiNetwork = '4';
        const daiInstance = new web3.eth.Contract(
            daiAbi,
            daiNetwork && daiAddress,
        );

        const tUSDAbi = this.getTokenAbi(networkId, 'tUSD')
        const tUSDAddress = this.getTokenAddress(networkId, 'tUSD')
        const tUSDNetwork = '4';
        const tUSDInstance = new web3.eth.Contract(
            tUSDAbi,
            tUSDNetwork && tUSDAddress,
        );

        const tETHAbi = this.getTokenAbi(networkId, 'tETH')
        const tETHAddress = this.getTokenAddress(networkId, 'tETH')
        const tETHNetwork = '4';
        const tETHInstance = new web3.eth.Contract(
            tETHAbi,
            tETHNetwork && tETHAddress,
        );

        let bankRows = [];
        bankRows.push(await this.getBankData(daiInstance, account));
        bankRows.push(await this.getBankData(tUSDInstance, account));
        bankRows.push(await this.getBankData(tETHInstance, account));
        console.log({bankRows})

        this.setState({
            bankRows: bankRows,
        },);

        return bankRows;
    };

    primeExercise = async (tokenId) => {
        // GETS KEY PARAMS
        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();
        let primeInstance = await this.getContractInstance(PrimeContract);

        // GETS PRIME PROPERTIES
        let properties = await this.getPrimeProperties(tokenId);

        // GETS PAYMENT CONTRACT INTERFACE
        let paymentInstance = new web3.eth.Contract(
            Erc20.abi,
            networkId && properties['wax'],
        );

        // APPROVES PRIME TO GET PAYMENT FROM OWNER
        let approvePayment = await this.handleApprove(
            paymentInstance, 
            primeInstance._address,
            (await web3.utils.toWei(properties['zed'])),
            account
        );

        // EXERCISES PRIME TOKEN
        let exercise = await primeInstance.methods.exercise(
            tokenId
        ).send({
            from: account
        });

        // SENDS COLLATERAL TO PAYMENT RECEIVER
        let withdraw = await primeInstance.methods.withdraw(
            properties['xis'],
            properties['yak']
        ).send({
            from: account
        });

        // GETS THE NEW INVENTORY STATE
        console.log('PRIME EXERCISE', {exercise})
        await this.getPrimeInventory();
        return exercise;
    };

    primeClose = async (tokenId) => {
        // GETS KEY PARAMS
        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();
        let primeInstance = await this.getContractInstance(PrimeContract);

        // GETS PRIME PROPERTIES
        let properties = await this.getPrimeProperties(tokenId);

        // Close PRIME TOKEN
        let close = await primeInstance.methods.close(
            tokenId,
            tokenId
        ).send({
            from: account
        });

        // GETS THE NEW INVENTORY STATE
        console.log('PRIME CLOSE', {close})
        await this.getPrimeInventory();
        return close;
    };

    getMintedPrimes = async () => {
        // GETS KEY PARAMS
        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();
        let primeInstance = await this.getContractInstance(PrimeContract);

        let mintedPrimes = (await primeInstance.methods.getActor(account).call()).mintedTokens;
        this.setState({
            mintedPrimes: mintedPrimes,
        });
        return mintedPrimes;
    };

    getDeactivatedPrimes = async () => {
        // GETS KEY PARAMS
        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();
        let primeInstance = await this.getContractInstance(PrimeContract);

        let deactivatedPrimes = (await primeInstance.methods.getActor(account).call()).deactivatedTokens;
        this.setState({
            deactivatedPrimes: deactivatedPrimes,
        });
        return deactivatedPrimes;
    };

    getActivePrimes = async () => {
        let minted = await this.getMintedPrimes();
        let inactive = await this.getDeactivatedPrimes();
        /* let ownedPrimes = await this.getPrimeInventory(); */

        let activePrimes = minted.filter(val => !inactive.includes(val));
        /* activePrimes = ownedPrimes.filter(val => !activePrimes.includes(val)); */
        console.log({activePrimes})
        this.setState({
            activePrimes: activePrimes
        });
        return activePrimes;
    };

    handleMint = async (symbol) => {
        console.log('MINT: ', symbol)
        console.time('handleMint');

        if(symbol === 'U' || symbol === 'S' || symbol === 'ETH') {
            console.log('SYMBOL DOESNT HAVE MINT FUNCTION', symbol)
            return;
        };

        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();


        /* GET CONTRACTS */
        let address = this.getTokenAddress(networkId, symbol);
        let abi = this.getTokenAbi(networkId, symbol);
        const instance = new web3.eth.Contract(
            abi,
            networkId && address,
        );

        let amount = await web3.utils.toWei((100).toString());
        let mint = await instance.methods.mint(
            account,
            amount,
        ).send({
            from: account,
        });

        console.log({mint})
        await this.getWalletInventory();
        console.timeEnd('handleMint');
    };

    getProfitData = async () => {
        /* 
        * GETS DATA FOR GRAPH INFO 
        * NEED TO GET ALL PRIME DATA
        * ETH/USD RATE
        * CONVERT TOKENS TO THEIR USD VALUE
        * COMPARE USD VALUES
        * RETURN DATA OBJECT
        */

        /* KEY VARIABLES */
        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();
        let data = (this.state.data) ? this.state.data 
            : {
            labels: [],
            datasets: [
              {
                label: 'Net Profit in USD $',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: []
              }
            ]
          };
        console.log({data})
        let collateralAmt;
        let collateralSym;
        let paymentAmt;
        let paymentSym;
        let cRatio;
        let pRatio;
        let cValue;
        let pValue;
        let netValue;
        let tokenId;
        let usdToEth;
        let totalCollateralValue = 0;
        let totalPaymentValue = 0;
        let totalNetValue = 0;
        let highestNetValue = 0;
        let highestTokenId;
        let statsArray = [];

        /* USD TO ETH PRICE */
        const cUsdEthAbi = this.getTokenAbi(networkId, 'CHAIN-USDETH')
        const cUsdEthAddress = this.getTokenAddress(networkId, 'CHAIN-USDETH')
        const cUsdEthNetwork = networkId;
        const cUsdEthInstance = new web3.eth.Contract(
            cUsdEthAbi,
            cUsdEthNetwork && cUsdEthAddress,
        );

        let price;
        try {
            price = await cUsdEthInstance.methods.latestAnswer().call({from: account});
        } catch (err) {
            console.log({err})
        }

        let timestamp;
        try {
            timestamp = await cUsdEthInstance.methods.latestTimestamp().call({from: account});
        } catch (err) {
            console.log({err})
        }
        
        usdToEth = price / 10**8;
        console.log({usdToEth, timestamp})

        let primeRows = (this.state.primeRows) ? this.state.primeRows : [];
        console.log({primeRows}, 'GET PROFIT DATA')

        const labels = data['labels'];
        console.log({labels})
        const newLabel = Array.from(labels)

        const dataArray = data['datasets'][0]['data'];
        console.log({dataArray})
        const addedData = Array.from(dataArray)

        let tokenValues = {};

        for(var i = 0; i < primeRows.length; i++) {
            collateralAmt = primeRows[i].xis;
            paymentAmt = primeRows[i].zed;
            collateralSym = primeRows[i].yakSymbol;
            paymentSym = primeRows[i].waxSymbol;
            tokenId = primeRows[i].tokenId;
            console.log({tokenId})
            switch(collateralSym) {
                case 'DAI':
                    cRatio = 1;
                    break;
                case 'U':
                    cRatio = usdToEth;
                    break;
                case 'S':
                    cRatio = 1;
                    break;
                case 'tUSD':
                    cRatio = 1;
                    break;
                case 'tETH':
                    cRatio = usdToEth;
                    break;    
            };

            switch(paymentSym) {
                case 'DAI':
                    pRatio = 1;
                    break;
                case 'U':
                    pRatio = usdToEth;
                    break;
                case 'S':
                    pRatio = 1;
                    break;
                case 'tUSD':
                    pRatio = 1;
                    break;
                case 'tETH':
                    pRatio = usdToEth;
                    break;  
            };

            cValue = collateralAmt * cRatio;
            pValue = paymentAmt * pRatio;
            console.log({cValue, pValue})
            const valueData = {
                [collateralSym]: {
                    cValue: cValue,
                },
                [paymentSym]: {
                    pValue: pValue,
                },
                ['tokenId']: {
                    tokenId: tokenId,
                },
            };

            netValue = (cValue - pValue);
            newLabel.push(tokenId);
            addedData.push((netValue).toFixed(2))
            console.log({newLabel, addedData, netValue})

            totalCollateralValue = totalCollateralValue + cValue;
            totalPaymentValue = totalPaymentValue + pValue;
            totalNetValue = totalNetValue + netValue;
            console.log({totalNetValue})
            if(netValue > highestNetValue) {
                highestNetValue = netValue;
                highestTokenId = tokenId;
            };

            tokenValues[tokenId] = {
                nV: (netValue).toFixed(2),
                pV: (pValue).toFixed(2),
                cV: (cValue).toFixed(2),
            };
            
        };
        
        const newData = {
            ...data,
            labels: newLabel,
            datasets: [{
                ...data['datasets'][0],
                data: addedData,
            }],
        };

        const newStatsData = {
            tCV: (totalCollateralValue).toFixed(2),
            tPV: (totalPaymentValue).toFixed(2),
            tNV: (totalNetValue).toFixed(2),
            hNV: (highestNetValue).toFixed(2),
            hID: highestTokenId,
            tokenValues: tokenValues,

        }

        
        this.setState({
            data: newData,
            statsData: newStatsData,
        },)
    };

    goToDashboard = () => {
        this.setState({
            onDashboard: !this.state.onDashboard,
        });
    };

    getUsdToEth = async () => {
        const networkId = await this.getNetwork();
        const web3 = this.state.web3;
        const account = this.state.account;
        /* USD TO ETH PRICE */
        const cUsdEthAbi = this.getTokenAbi(networkId, 'CHAIN-USDETH')
        const cUsdEthAddress = this.getTokenAddress(networkId, 'CHAIN-USDETH')
        const cUsdEthNetwork = networkId;
        const cUsdEthInstance = new web3.eth.Contract(
            cUsdEthAbi,
            cUsdEthNetwork && cUsdEthAddress,
        );

        let price;
        try {
            price = await cUsdEthInstance.methods.latestAnswer().call({from: account});
        } catch (err) {
            console.log({err})
        }

        let timestamp;
        try {
            timestamp = await cUsdEthInstance.methods.latestTimestamp().call({from: account});
        } catch (err) {
            console.log({err})
        }
        
        let usdToEth = price / 10**8;
        return usdToEth;
    }

    /* OPTION CHAIN */
    getOptionChain = async (type, collateralAmount, collateralType, strikeType, expiration) => {
        console.log('GET OPTION CHAIN FOR', type)
        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();
        let primeInstance = await this.getContractInstance(PrimeContract);
        let nonce = await primeInstance.methods.nonce().call();

        let bid, ask, qty, strike, strikeUnits;
        let collateral, collateralUnits, collateralSym, strikeSym;
        function createData( tokenId, collateral, collateralUnits, bid, ask, qty, strike, strikeUnits ) {
            return { tokenId, collateral, collateralUnits, bid, ask, qty, strike, strikeUnits };
        };

        /* THE OPTIONS AVAILABLE - TOKEN IDS */
        let activeOptions = await this.getActivePrimes();

        /* OPTION DATA GOES HERE */
        let optionRows = [];
        

        /*  GET INSTANCES */
        let collateralInstance = await this.getInstance(collateralType);
        let strikeInstance = await this.getInstance(strikeType);
        console.log('GOT INSTANCES', {collateralType, strikeType})

        bid = '10';
        ask = '15';
        qty = '5';
        strike = '100';
        strikeUnits = strikeType;

        
        


        /* FOR EACH AVAILABLE OPTION - GET THE OPTION DATA AND PUSH INTO ARRAY */
        for(var i = 0; i < activeOptions.length; i++) {
            let tokenId = activeOptions[i];
            let properties = await primeInstance.methods.getPrime(
                tokenId
            ).call();

            
            
            collateralInstance = new web3.eth.Contract(
                Erc20.abi,
                networkId && properties.yak,
            );
            collateralSym = await collateralInstance.methods.symbol().call();

            strikeInstance = new web3.eth.Contract(
                Erc20.abi,
                networkId && properties.wax,
            );
            strikeSym = await strikeInstance.methods.symbol().call();
            strikeUnits = strikeSym;
            collateral = await web3.utils.fromWei(properties.xis);
            strike = await web3.utils.fromWei(properties.zed);
            let underlyingMatch;
            let expirationMatch = (properties.pow && expiration);
            switch(type) {
                case 'call':
                    underlyingMatch = (collateral === collateralAmount)
                    break;
                case 'put':
                    underlyingMatch = (strike === collateralAmount)
                    break;
            };

            if(
                collateralType === collateralSym 
                && strikeType === strikeSym 
                && underlyingMatch
                && expirationMatch
            ) {
                
                console.log({tokenId, collateralType, collateralSym, collateral, strikeType, strikeSym,  strike})
                
                collateralUnits = collateralType;
                let data = createData(
                    tokenId,
                    collateral,
                    collateralUnits,
                    bid,
                    ask,
                    qty,
                    strike,
                    strikeUnits
                );
                
                optionRows.push(data)
            }
        };

        optionRows.sort((a, b) => parseFloat(a.strike) - parseFloat(b.strike));
        this.setState({
            optionRows: {
                ...this.state.optionRows,
                [type]: optionRows,
            }
        },);

        console.log({optionRows})
        return optionRows;
    };

    /* POSITION */
    getPositions = async () => {
        const web3 = this.state.web3;
        const account = await this.getAccount();
        const networkId = await this.getNetwork();
        let primeInstance = await this.getContractInstance(PrimeContract);

        let nonce = await primeInstance.methods.nonce().call();

        let tokenId, longOrShort, name, netProfit, costBasis, premium, expiration;
        let cValue, pValue;
        function createData(tokenId, longOrShort, name, netProfit, costBasis, premium, expiration) {
            return { tokenId, longOrShort, name, netProfit, costBasis, premium, expiration };
        };


        let primeRows = await this.getPrimeInventory();
        let positionRows = [];
        let usdEthRatio = await this.getUsdToEth();

        for(var i = 0; i < primeRows.length; i++) {
            
            let row = primeRows[i];
            let ratio;
            switch(row.yakSymbol) {
                case 'tETH':
                    ratio = usdEthRatio;
                    break;
                case 'tUSD':
                    ratio = 1;
                    break;
                case 'DAI':
                    ratio = 1;
                    break;
            }
            cValue = ratio * row.xis;

            switch(row.waxSymbol) {
                case 'tETH':
                    ratio = usdEthRatio;
                    break;
                case 'tUSD':
                    ratio = 1;
                    break;
                case 'DAI':
                    ratio = 1;
                    break;
            }

            
            pValue = ratio * row.zed;
            tokenId = row.tokenId;
            longOrShort = row.position;
            name = `${row.xis} ${row.yakSymbol} / ${row.zed} ${row.waxSymbol}`;
            switch(longOrShort) {
                case 'Long':
                    netProfit = cValue - pValue;
                    break;
                case 'Short':
                    netProfit = pValue - cValue;
                    break;
            }
            costBasis = '10';
            premium = '20';
            netProfit = 
                (longOrShort === 'Long')
                ? (premium - costBasis) ? (`+ ${(premium - costBasis)}`) : (`- ${(premium - costBasis)}`)
                    : (premium - costBasis) ? (`- ${(premium - costBasis)}`) : (`+ ${(premium - costBasis)}`);

            expiration = row.pow;



            let data = createData(
                tokenId, 
                longOrShort, 
                name, 
                netProfit, 
                costBasis, 
                premium, 
                expiration
            );

            positionRows.push(data)

            /* CHECK FOR DUPLICATES AND INCREMENT QTY */
            for(var i = 0; i < positionRows.length; i++) {
                const match = positionRows.filter(
                    row => {
                        return (
                            data.longOrShort === row.longOrShort 
                            && data.expiration === row.expiration
                            && data.name === row.name
                        );
                    }
                );

                /* if(match.length > 1) {
                    console.log({match});
                } */
            }
            
        }
        console.log({positionRows})
        this.setState({
            positionRows: positionRows,
        },);
    };


    /* 
     * FLOW:
     * USER SELECTS OPTION PAIR
     * USER SELECTS EXPIRATION DATE
     * GET OPTIONS FUNCTION GETS INITIAL OPTION DATA
     * AND RETURNS THE OPTIONS AND THEIR MATCHING TOKENS
     * USER SELECTS OPTION
     * IF THERE IS A MATCHING TOKEN ID, IT WILL POPULATE
     * ORDER FORM WITH ITS PROPERTIES
     * IF NO MATCHING TOKEN, IT WILL CREATE A MOCK TOKEN
     * AND POPULATE THE ORDER FORM WITH THE MOCK PROPERTIES
     * THIS.STATE.OPTIONSELECT RETURNS THE SELECTED OPTION
     * PROPERTIES.
     * USER THEN SUBMITS ORDER WITH POPULATED VALUES
     * 
     * KEY STATE VALUES
     * call/put Column CONTAINS ALL INFO FOR OPTION CHAIN
     * optionSelection CONTAINS INFO FOR SELECTED OPTION
    */

    getOptions = async (collateralSymbol, strikeSymbol, expiration) => {
        console.log(`Getting Options chain for ${collateralSymbol} / ${strikeSymbol} Pairs expiring ${expiration}`)
        let pair = `${collateralSymbol}-${strikeSymbol}`;

        const web3 = this.state.web3;
        let primeInstance = await this.getContractInstance(PrimeContract);
        const deployedNetwork = await Exchange.networks[this.state.networkId];
        const exchangeInstance = new web3.eth.Contract(
            Exchange.abi,
            deployedNetwork && deployedNetwork.address,
        );


        let nonce = await primeInstance.methods.nonce().call();
        const networkId = this.state.networkId;
        const context = TOKENS_CONTEXT[networkId];

        let callOptions = (this.state.option[pair]) ? this.state.option[pair][expiration]['call'] : [];
        let callMatches = await compareOptionsArray(callOptions);
        let callOrders = await getOrders(callMatches);
        let callColumn = {
            'pair': pair,
            'expiration': expiration,
            'options': callOptions,
            'matches': callMatches,
            'orders': callOrders,

        };

        let putOptions = (this.state.option[pair]) ? this.state.option[pair][expiration]['put'] : [];
        let putMatches = await compareOptionsArray(putOptions);;
        let putOrders = await getOrders(putMatches);
        let putColumn = {
            'pair': pair,
            'expiration': expiration,
            'options': putOptions,
            'matches': putMatches,
            'orders': putOrders,
        };

        /* COMPARE AN INTIAL STATE OPTION WITH A REAL TOKEN */
        async function compareOptionsArray(array) {
            let arrayMatches = {};
            for(var i = 0; i < array.length; i++) {
                let option = array[i];
                let cAddress = context[option.collateralUnits].address;
                let sAddress = context[option.strikeUnits].address;
                let cAmt = option.collateral;
                let sAmt = option.strike;
                let matches = [];
            
                matches = await getMatches(cAmt, cAddress, sAmt, sAddress, expiration);
            
                /* COMBINE ALL MATCHING TOKEN IDS WITH THE CALLOPTION AT i */
                arrayMatches[i] = matches;
            }

            return arrayMatches;
        };

        /* COMPARE PROPERTIES WITH ALL TOKENS */
        async function getMatches(cAmt, cAddress, sAmt, sAddress, expiration) {
            let matches = [];
            /* FOR EACH TOKEN IN THE NONCE, COMPARE and PUSH TOKENIDs MATCHING */
            for(var x = 1; x < nonce; x++) {
                let prime = await primeInstance.methods.getPrime(x).call();
    
                let pow = prime['pow'];
                if(pow != expiration) {
                    continue;
                }
    
                let yak = prime['yak'];
                let wax = prime['wax'];
                if((yak != cAddress) || (wax != sAddress)) {
                    continue;
                }
    
                let xis = await web3.utils.fromWei(prime['xis']);
                if((xis != cAmt)) {
                    continue;
                }
    
                let zed = await web3.utils.fromWei(prime['zed']);
    
                if(
                    yak === cAddress
                    && xis === cAmt
                    && wax === sAddress
                    && zed === sAmt
                    && pow === expiration
                ) {
                    matches.push(x)
                } /* else{
                    console.log('no match', {cAddress, cAddressPrime, sAddress, sAddressPrime, cAmount, cAmt, sAmount, sAmt, pExpiration, expiration})
                } */
            }
            return matches;
        };

        /* FOR EACH MATCH, GET BID/ASK */
        async function getOrders(obj) {
            let len = Object.keys(obj).length;
            let orders = {
                'sell': {},
                'buy': {},
            };
            for(var i = 0; i < len; i++) {
                for(var x = 0; x < obj[i].length; x++ ) {
    
                    let buyOrder = await exchangeInstance.methods.getBuyOrder(obj[i][x]).call();
                    if(buyOrder.tokenId > 0) {
                        console.log('MATCHED BUY ORDER', buyOrder.tokenId)
                        let bidPrice = buyOrder.bidPrice;
                        orders['buy'][obj[i][x]] = bidPrice;
                    }

                    let sellOrder = await exchangeInstance.methods.getSellOrder(obj[i][x]).call();
                    if(sellOrder.tokenId > 0) {
                        console.log('MATCHED SELL ORDER', sellOrder.tokenId)
                        let askPrice = sellOrder.askPrice;
                        orders['sell'][obj[i][x]] = askPrice;
                    }
                }
            }
            
            return orders;
        };

        console.log({callColumn, putColumn})
        /* UPDATE STATE WITH THE INITIAL OPTIONS AND THE MATCHING MINTED TOKENS */
        this.setState({
            callOptions: callOptions,
            putOptions: putOptions,
            callMatches: callMatches,
            putMatches: putMatches,
            putColumn: putColumn,
            callColumn: callColumn,
        });
    
    };

    handleOptionSelect = async (type, pair, expiration, orders, option, tokenIds,) => {
        /* TYPE IS CALL OR PUT */
        /* IF HAS NO MATCHING TOKEN IDS - NEED TO MOCK A NEW TOKEN TO MINT */
        function mockToken( ace, xis, yak, zed, wax, pow, gem, ) {
            return { ace, xis, yak, zed, wax, pow, gem,}
        }
        console.log({option})

        const web3 = this.state.web3;
        
        let properties;
        let tokenId = tokenIds[0];

        if(typeof tokenId === 'undefined') {
            let cAmount = await web3.utils.toWei(option.collateral);
            let sAmount = await web3.utils.toWei(option.strike);
            properties = mockToken(
                this.state.account,
                cAmount,
                '',
                sAmount,
                '',
                expiration,
                this.state.account
            );

        } else {
            properties = await this.getPrimeProperties(tokenId);
        }
        
        this.setState({
            optionSelection: {
                'type': type,
                'pair': pair,
                'expiration': expiration,
                'properties': properties,
                'cAsset': option.collateralUnits,
                'sAsset': option.strikeUnits,
                'tokenIds': tokenIds,
            }
        });

        console.log({tokenIds});
        console.log(this.state.optionSelection)
    };

    handleOrder = async (buyOrder, deposit, bid, ask, collateralAmount, collateralSym, strikeAmount, strikeSym, expiration) => {
        console.log({ buyOrder, deposit, bid, ask, collateralAmount, collateralSym, strikeAmount, strikeSym, expiration });
        
        /* await this.getCurrentPrimeOutput(); */
        const web3 = this.state.web3;
        const account = this.state.account;
        const networkId = this.state.networkId;
        const deployedNetwork = await Exchange.networks[this.state.networkId];
        const _exchange = new web3.eth.Contract(
            Exchange.abi,
            deployedNetwork && deployedNetwork.address,
        );
        const primeInstance = await this.getContractInstance(PrimeContract)
        let nonce = await primeInstance.methods.nonce().call();
        let buyOrderResult, sellOrderResult;
        let mintedPrime;
        /* IF BUY ORDER, PLACE A BID,
         * ELSE, ITS A SELL ORDER,
         * MINT A PRIME AND SELL IT FOR
         * ASKING PRICE
        */
        if(buyOrder) {
            bid = await web3.utils.toWei((bid).toString());

            /* IF THERES AN OPTION ON MARKET, BUY IT */
            console.log('BUY ORDER TRUE', this.state.optionSelection);
            let tokenIds = this.state.optionSelection['tokenIds'];
            if(tokenIds.length > 0) {

                /* FOR ALL MATCHING TOKENS, CHECK ACTIVE SELL ORDERS ON EXCHANGE */
                for(var i = 0; i < tokenIds.length; i++) {
                    let getSellOrder = await _exchange.methods.getSellOrder(tokenIds[i]).call();
                    console.log(getSellOrder.tokenId, {getSellOrder})
                    if(getSellOrder.tokenId > 0) {
                        console.log('MATCHING TOKEN AVAILABLE FOR PURCHASE', getSellOrder.tokenId)
                        try {
                            buyOrderResult = await _exchange.methods.buyOrder(
                                getSellOrder.tokenId,
                                bid
                            ).send({from: account, value: bid})
                        } catch (error) {
                            console.log({error})
                        }
                    }
                }

                
            } else {
                console.log('NO BUYABLE OPTIONS - PENDING ORDER');
                /* SUBMIT ORDER FUNCTION FOR EXCHANGE */
            }

            
        } else {
            ask = await web3.utils.toWei((ask).toString());

            /* IF YOU OWN A PRIME WITH MATCHING PROPERTIES, SELL IT */

            /* GET ALL OWNED PRIMES */
            let userOwnedPrimes = [];
            for(var i = 1; i <= nonce; i++) {
                if((await this.getOwnerOfPrime(i)) === account) {
                    userOwnedPrimes.push(i);
                } else {
                    console.log('Does not own: ', i)
                }
            };

            /* FOR EACH PRIME COMPARE PROPERTIES */
            let matchingPrimes = [];
            for(var i = 0; i < userOwnedPrimes.length; i++) {
                let tokenId = userOwnedPrimes[i];
                let properties = await primeInstance.methods.getPrime(tokenId).call();
                if(
                    expiration === properties.pow
                    && account === properties.gem
                ) {
                    let cAddress = TOKENS_CONTEXT[networkId][collateralSym].address;
                    let sAddress = TOKENS_CONTEXT[networkId][strikeSym].address;

                    if(
                        cAddress === properties.yak
                        && sAddress === properties.wax
                    ) {
                        let cAmt = await web3.utils.toWei((collateralAmount).toString());
                        let sAmt = await web3.utils.toWei((strikeAmount).toString());

                        if(
                            cAmt === properties.xis
                            && sAmt === properties.zed
                        ) {
                            console.log('USER OWNS MATCHING PRIME', {tokenId})
                            matchingPrimes.push(tokenId);
                        }
                    }
                }
            }

            if(matchingPrimes.length > 0) {
                let tokenId = matchingPrimes[0];
                /* SELL PRIME TO EXCHANGE FOR ASK PRICE */
                await primeInstance.methods.approve(_exchange._address, tokenId).send({from: account});
                try {
                    sellOrderResult = await _exchange.methods.sellOrder(
                        tokenId,
                        ask,
                    ).send({from: account})
                } catch (error) {
                    console.log({error})
                }
    
                console.log('SELLING OWNED PRIMED', {tokenId, sellOrderResult})
            } else {
                /* MINT PRIME */
                try {
                    mintedPrime = await this.createPrime(
                        collateralSym,
                        strikeSym,
                        this.state.account,
                        expiration,
                        collateralAmount,
                        strikeAmount
                    );
                } catch(error) {
                    console.log({error})
                }
                console.trace({
                    collateralSym,
                    strikeSym,
                    account,
                    expiration,
                    collateralAmount,
                    strikeAmount
                });
    
                let tokenId = mintedPrime.events['PrimeMinted'].returnValues['_tokenId'];
    
                /* SELL PRIME TO EXCHANGE FOR ASK PRICE */
                await primeInstance.methods.approve(_exchange._address, tokenId).send({from: account});
                try {
                    sellOrderResult = await _exchange.methods.sellOrder(
                        tokenId,
                        ask,
                    ).send({from: account})
                } catch (error) {
                    console.log({error})
                }
    
                console.log('SELLING NEWLY MINTED PRIME', {tokenId, sellOrderResult})
            }
        }

        await this.getOptions('tETH', 'DAI', '1600473585');
        /* console.log(mintedPrime.events)
        console.log(mintedPrime.events['PrimeMinted'])
        console.log(mintedPrime.events['PrimeMinted'].returnValues)
        console.log(mintedPrime.events['PrimeMinted'].returnValues._tokenId)
        console.log(mintedPrime.events['PrimeMinted'].returnValues['_tokenId']) */
    };

    render () {
        const { classes } = this.props;
        
        let collateral = (this.state.selection) ? (this.state.selection['collateral']) ? this.state.selection['collateral'] : '' : '';
        let payment = (this.state.selection) ? (this.state.selection['payment']) ? this.state.selection['payment'] : '' : '';
        let expiration = (this.state.selection) ? (this.state.selection['expiration']) ? this.state.selection['expiration'] : '' : '';
        let step = this.state.step;
        let allowanceSet = (this.state.allowances) ? (this.state.allowances[collateral]) ? (this.state.allowances[collateral] > 1000000) ? true : false : false : false;
        
        let optionChainName = 'tETH / DAI';
        
        return(
            <>
            <div className={classes.root} key='root'>

                <Header
                    className={classes.header}
                    address={(this.state.account) ? this.state.account : ''}
                    chainId={this.state.chainId}
                    classes={classes}
                    account={(this.state.account) ? this.state.account : ''}
                    onConnect={this.onConnect}
                    connected={this.state.connected}
                    resetApp={this.resetApp}
                />

                {/* FLEX DIRECTION IS ROW FOR CONTENTS */}
                <Card className={classes.body} key='body'>

                    {/* LEFT 25% PORTION OF SCREEN */}
                    <Card className={classes.openPosition} key='open'>

                        <OpenPosition
                            optionSelection={this.state.optionSelection}
                            handleOrder={this.handleOrder}
                        />

                    </Card>

                    {/* FLEX DIRECTION IS COLUMN - HOLDS CHAIN AND POSITIONS */}
                    <Card className={classes.core} key='core'>
                        
                        {/* FLEX DIRECTION COLUMN */}
                        <Card className={classes.chain} key='chain'>
                            {/* CORE HEADER - FLEX DIRECTION ROW */}
                            <Box className={classes.coreHeader}>
                                <Typography className={classes.coreHeaderTypography}>CALLS</Typography>
                                <Typography className={classes.coreHeaderTypography}>OPTION CHAIN FOR {optionChainName}</Typography>
                                <Typography className={classes.coreHeaderTypography}>PUTS</Typography>
                            </Box>

                            <Box className={classes.coreHeader}>
                                <Button 
                                    className={classes.navButton} 
                                    onClick={() => this.getOptions('tETH', 'DAI', '1600473585')}
                                >
                                    TETH/DAI expiring Fri Sep 18
                                </Button>
                            </Box> 

                            <OptionsChainTableV2
                                title={''}
                                optionCallRows={this.state.callOptions}
                                optionPutRows={this.state.putOptions}
                                callMatches={this.state.callMatches}
                                putMatches={this.state.putMatches}
                                callColumn={this.state.callColumn}
                                putColumn={this.state.putColumn}
                                handleOptionSelect={this.handleOptionSelect}
                            />

                        </Card>

                        {/* FLEX DIRECTION COLUMN */}
                        <Card className={classes.positions} key='positions'>
                            <Box className={classes.coreHeader}>
                                <Typography className={classes.coreHeaderTypography}>Positions for {ellipseAddress(this.state.account)}</Typography>
                            </Box> 
                            <PositionsTable
                                title={''}
                                positionRows={this.state.positionRows}
                            />

                        </Card>

                    </Card>

                </Card>

                <Box className={classes.footer}>
                    <Typography variant="h1" align="center" gutterBottom style={{ }}>
                        <div>
                            <LinkM href="https://github.com/Alexangelj/DFCP" underline='none'>
                                <GitHubIcon />
                            </LinkM>
                            <LinkM href="https://github.com/Alexangelj/DFCP" underline='none'>
                                <TwitterIcon />
                            </LinkM>
                        </div>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center">
                      {'Copyright © '}
                      <Link color="inherit" href="/prime" underline='none'>
                        Decentralized Financial Crafting Protocol
                      </Link>{' '}
                      {new Date().getFullYear()}
                      {'.'}
                    </Typography>
                </Box>
                 
            </div>    
            </>
        );
    };

};

export default withStyles(styles)(PrimeV3);