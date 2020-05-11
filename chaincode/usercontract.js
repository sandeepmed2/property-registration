'use strict';

const {Contract} = require('fabric-contract-api');
const RegnetHelper = require('./utils.js');

class RegnetUserContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.property-registration-network.regnet.usercontract');
	}

	/* ****** All custom functions are defined below ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Regnet Smart Contract Instantiated');
	}

	/**
	 * Helper function to check if request is initiated by Users
	 * @param ctx - The transaction context object
	 * @returns
	 */
	static isRequestedByUser(ctx) {
		return ctx.clientIdentity.getMSPID() === "usersMSP";
	}

	/**
	 * Create a new user registration request on the network
	 * @param ctx - The transaction context object
	 * @param name - Name of the user
	 * @param emailId - Email ID of the user
	 * @param phoneNumber - Phone number of the user
	 * @param aadharNumber - Aadhar card number of the user
	 * @returns
	 */
	async requestNewUser(ctx, name, emailId, phoneNumber, aadharNumber) {
		//Allow only users to invoke new user registrartion requests
		if(!RegnetUserContract.isRequestedByUser(ctx)){
			throw new Error("Only members of User organization can initiate new user registration requests");
		}

		//Create a new composite key for the new user registration request
		const userRegRequestKey = RegnetHelper.getUserRegRequestKey(ctx,name,aadharNumber);

		//Check if there is already a request for given user
		if(await RegnetHelper.isAssetExisting(ctx,userRegRequestKey)){
			throw new Error("Registration request for given name and Aadhar number already placed");
		}

		//Create a user registration request object to be stored in blockchain
		let newUserRegReqObject = {
			name: name,
			emailId: emailId,
			phoneNumber: phoneNumber,
			aadharNumber: aadharNumber,
			createdAt: new Date()
		};

		//Store the user registration request to blockchain
		await RegnetHelper.putAssetData(ctx,userRegRequestKey,newUserRegReqObject);

		//Return value of new user registration request created
		return newUserRegReqObject;
	}

	/**
	 * Recharge user account with upgrad coins
	 * @param ctx - The transaction context object
	 * @param name - Name of the user
	 * @param aadharNumber - Aadhar card number of the user
	 * @param bankTransactionId - Transaction ID to determine number of coins to be recharged
	 * @returns
	 */
	async rechargeAccount(ctx, name, aadharNumber, bankTransactionId) {
		//Allow only users to recharge their accounts
		if(!RegnetUserContract.isRequestedByUser(ctx)){
			throw new Error("Only members of User organization can recharge their accounts");
		}

		//Validate the input Bank Transaction ID
		if(bankTransactionId !== "upg100" && bankTransactionId !== "upg500" && bankTransactionId !== "upg1000"){
			throw new Error("Invalid Bank Transaction ID");
		}

		//Create composite key to fetch user data from network
    const userKey = RegnetHelper.getUserKey(ctx,name,aadharNumber);

    //Check if given user exists
		if(!await RegnetHelper.isAssetExisting(ctx,userKey)){
			throw new Error("No User exists with given name and Aadhar number.");
		}

		//Get User buffer and convert to JSON object
		let userBuffer = await RegnetHelper.getAssetBuffer(ctx,userKey);
		let user = JSON.parse(userBuffer.toString());

		//Update upgradCoins of user based on bankTransactionId
		user.upgradCoins += (bankTransactionId === "upg100") ? 100 :
												(bankTransactionId === "upg500") ? 500 : 1000;
		user.updatedAt = new Date();

		//Store updated user asset back on ledger
		await RegnetHelper.putAssetData(ctx,userKey,user);
	}

	/**
	 * View current state of user
	 * @param ctx - The transaction context object
	 * @param name - Name of the user
	 * @param aadharNumber - Aadhar card number of the user
	 * @returns
	 */
	async viewUser(ctx, name, aadharNumber) {
		//Create composite key to fetch user data from network
    const userKey = RegnetHelper.getUserKey(ctx,name,aadharNumber);

    //Check if given user exists
		if(!await RegnetHelper.isAssetExisting(ctx,userKey)){
			throw new Error("No User exists with given name and Aadhar number.");
		}

		//Return value of user from blockchain
		let userBuffer = await RegnetHelper.getAssetBuffer(ctx,userKey);
		return JSON.parse(userBuffer.toString());
	}

	/**
	 * Create a new property registration request on the network
	 * @param ctx - The transaction context object
	 * @param name - Name of the property onwer
	 * @param aadharNumber - Aadhar card number of the property owner
	 * @param propertyID - ID of the property to be registered
	 * @param price - Price of the property to be registered
	 * @returns
	 */
	async propertyRegistrationRequest(ctx, name, aadharNumber, propertyID, price) {
		//Allow only users to register properties
		if(!RegnetUserContract.isRequestedByUser(ctx)){
			throw new Error("Only members of User organization can register properties");
		}

		//Create composite key to fetch owner data from network
    const ownerKey = RegnetHelper.getUserKey(ctx,name,aadharNumber);

    //Check if given owner exists
		if(!await RegnetHelper.isAssetExisting(ctx,ownerKey)){
			throw new Error("Property registration request cannot be captured since Owner with given name and Aadhar number does not exist.");
		}

		//Create a new composite key for the new property registration request
		const propRegRequestKey = RegnetHelper.getPropRegRequestKey(ctx,propertyID);

		//Check if there is already a request for given property
		if(await RegnetHelper.isAssetExisting(ctx,propRegRequestKey)){
			throw new Error("There is already a registration request for given property");
		}

		//Convert input property price from String to Integer
		let propertyPrice = parseInt(price);

		//Create new property registration request object
		let newPropRegRequest = {
			propertyID: propertyID,
			owner: ownerKey,
			price: propertyPrice,
			status: "registered" //New property is by default in registered state
		};

		//Store property registrartion request on blockchain
		await RegnetHelper.putAssetData(ctx,propRegRequestKey,newPropRegRequest);

		//Return value of new property registration request created
		return newPropRegRequest;
	}

	/**
	 * View current state of property
	 * @param ctx - The transaction context object
	 * @param propertyID - ID of the property
	 * @returns
	 */
	async viewProperty(ctx, propertyID) {
		//Create composite key to fetch property data from network
    const propertyKey = RegnetHelper.getPropertyKey(ctx,propertyID);

    //Check if given property exists
		if(!await RegnetHelper.isAssetExisting(ctx,propertyKey)){
			throw new Error("No Property exists with given property ID.");
		}

		//Return value of property from blockchain
		let propertyBuffer = await RegnetHelper.getAssetBuffer(ctx,propertyKey);
		return JSON.parse(propertyBuffer.toString());
	}

	/**
	 * Update property status
	 * @param ctx - The transaction context object
	 * @param propertyID - ID of the property
	 * @param name - Name of the user
	 * @param aadharNumber - Aadhar card number of the user
	 * @param status - Status to be updated for the property
	 * @returns
	 */
	async updateProperty(ctx, propertyID, name, aadharNumber, status) {
		//Allow only users to update property status
		if(!RegnetUserContract.isRequestedByUser(ctx)){
			throw new Error("Only members of User organization can update property status");
		}

		//Check if input status is valid
		if(status !== "registered" && status !== "onSale"){
			throw new Error("Invalid input status. Status should be either registered or onSale!!!");
		}

		//Create composite key to fetch Owner data from network
    const ownerKey = RegnetHelper.getUserKey(ctx,name,aadharNumber);

    //Check if given owner exists
		if(!await RegnetHelper.isAssetExisting(ctx,ownerKey)){
			throw new Error("Owner with given name and Aadhar number does not exist.");
		}

		//Create composite key to fetch property data from network
    const propertyKey = RegnetHelper.getPropertyKey(ctx,propertyID);

    //Check if given property exists
		if(!await RegnetHelper.isAssetExisting(ctx,propertyKey)){
			throw new Error("No Property exists with given property ID.");
		}

		//Get property buffer and convert to JSON object
		let propertyBuffer = await RegnetHelper.getAssetBuffer(ctx,propertyKey);
		let property = JSON.parse(propertyBuffer.toString());

		//Verify if status update request is initiated by property owner
		if(property.owner !== ownerKey){
			throw new Error("Only Owner of the property is allowed to updated its status!!!");
		}

		//Verify that input status is not same as property status
		if(property.status === status){
			throw new Error("Input status is same as property status. No update performed!!!")
		}

		//Update property Status
		property.status = status;
		property.updatedAt = new Date();

		//Update property back on ledger
	  await RegnetHelper.putAssetData(ctx,propertyKey,property);
	}

	/**
	 * Purchase property
	 * @param ctx - The transaction context object
	 * @param propertyID - ID of the property
	 * @param name - Name of the buyer
	 * @param aadharNumber - Aadhar card number of the buyer
	 * @returns
	 */
	async purchaseProperty(ctx, propertyID, name, aadharNumber) {
		//Allow only users to purchase property
		if(!RegnetUserContract.isRequestedByUser(ctx)){
			throw new Error("Only members of User organization can purchase property");
		}

		//Create composite key to fetch Buyer data from network
    const buyerKey = RegnetHelper.getUserKey(ctx,name,aadharNumber);

    //Check if Buyer exists
		if(!await RegnetHelper.isAssetExisting(ctx,buyerKey)){
			throw new Error("Buyer with given name and Aadhar number does not exist.");
		}

		//Create composite key to fetch property data from network
    const propertyKey = RegnetHelper.getPropertyKey(ctx,propertyID);

    //Check if given property exists
		if(!await RegnetHelper.isAssetExisting(ctx,propertyKey)){
			throw new Error("No Property exists with given property ID.");
		}

		//Get property buffer and convert to JSON object
		let propertyBuffer = await RegnetHelper.getAssetBuffer(ctx,propertyKey);
		let property = JSON.parse(propertyBuffer.toString());

		//Verify if property is currently listed for sale
		if(property.status !== "onSale"){
			throw new Error("Sorry, given property is currently not listed for sale!!!");
		}

		//Verify that buyer and property owner are not same
		if(property.owner === buyerKey){
			throw new Error("Invalid purchase attempt, buyer is already the property owner!!!");
		}

		//Get buyer buffer and convert to JSON object
		let buyerBuffer = await RegnetHelper.getAssetBuffer(ctx,buyerKey);
		let buyer = JSON.parse(buyerBuffer.toString());

		//Verify if buyer has sufficient balance to purchase the property
		if(buyer.upgradCoins < property.price){
			throw new Error("Sorry, buyer does not have sufficient account balance to purchase the property. Recharge the buyer account!!!");
		}

		//Get seller buffer and convert to JSON object
		let sellerKey = property.owner;
		let sellerBuffer = await RegnetHelper.getAssetBuffer(ctx,sellerKey);
		let seller = JSON.parse(sellerBuffer.toString());

		//Deduct property price from buyer account and credit them to seller who is selling the property
		buyer.upgradCoins -= property.price;
		buyer.updatedAt = new Date();
		seller.upgradCoins += property.price;
		seller.updatedAt = new Date();

		//Update property status and make buyer as the onwer since purchase is now complete
		property.owner = buyerKey;
		property.status = "registered"; //Update property status to registered since it is now sold
		property.updatedAt = new Date();

		//Store updated seller, buyer and property details back on ledger
	  await RegnetHelper.putAssetData(ctx,sellerKey,seller);
		await RegnetHelper.putAssetData(ctx,buyerKey,buyer);
		await RegnetHelper.putAssetData(ctx,propertyKey,property);
	}

}

module.exports = RegnetUserContract;
