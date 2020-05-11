'use strict';

const {Contract} = require('fabric-contract-api');
const RegnetHelper = require('./utils.js');

class RegnetRegistrarContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.property-registration-network.regnet.registrarcontract');
	}

  /**
	 * Helper function to check if request is initiated by Registrar
	 * @param ctx - The transaction context object
	 * @returns
	 */
	static isRequestedByRegistrar(ctx) {
		return ctx.clientIdentity.getMSPID() === "registrarMSP";
	}

	/* ****** All custom functions are defined below ***** */

	/**
	 * Approve a user registration request and create a new user on the network
	 * @param ctx - The transaction context object
	 * @param name - Name of the user
	 * @param aadharNumber - Aadhar card number of the user
	 * @returns
	 */
	async approveNewUser(ctx, name, aadharNumber) {
		//Allow only registrars to approve new user registrartion requests
		if(!RegnetRegistrarContract.isRequestedByRegistrar(ctx)){
			throw new Error("Only members of Registrar organization can approve new user registration requests");
		}

		//Create composite key for the user registration request to fetch it from network
		const userRegRequestKey = RegnetHelper.getUserRegRequestKey(ctx,name,aadharNumber);

		//Check if there is a request for given user
		if(!await RegnetHelper.isAssetExisting(ctx,userRegRequestKey)){
			throw new Error("No registration request is available for given name and Aadhar number!!!");
		}

    let userRequestBuffer = await RegnetHelper.getAssetBuffer(ctx,userRegRequestKey)
    let userRequest = JSON.parse(userRequestBuffer.toString());

    //Create composite key for the new user to be created on network
    const userKey = RegnetHelper.getUserKey(ctx,name,aadharNumber);

    //Check if given user already exists
		if(await RegnetHelper.isAssetExisting(ctx,userKey)){
			throw new Error("User already exists with given name and Aadhar number.");
		}

    //Create a new User asset to be stored in blockchain
		let newUserObject = {
			name: userRequest.name,
			emailId: userRequest.emailId,
			phoneNumber: userRequest.phoneNumber,
			aadharNumber: userRequest.aadharNumber,
      upgradCoins: 0,
			createdAt: new Date(),
      updatedAt: new Date()
		};

		//Store User asset on blockchain
    await RegnetHelper.putAssetData(ctx,userKey,newUserObject);

    //Return value of new user created
		return newUserObject;
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
	 * Approve a property registration request and create a new property on the network
	 * @param ctx - The transaction context object
	 * @param propertyID - ID of the property
	 * @returns
	 */
	async approvePropertyRegistration(ctx, propertyID) {
		//Allow only registrars to approve new property registrartion requests
		if(!RegnetRegistrarContract.isRequestedByRegistrar(ctx)){
			throw new Error("Only members of Registrar organization can approve new property registration requests");
		}

		//Create composite key for the property registration request to fetch it from network
		const propRegRequestKey = RegnetHelper.getPropRegRequestKey(ctx,propertyID);

		//Check if there is a request for given property
		if(!await RegnetHelper.isAssetExisting(ctx,propRegRequestKey)){
			throw new Error("No registration request is available for given property!!!");
		}

    let propRequestBuffer = await RegnetHelper.getAssetBuffer(ctx,propRegRequestKey);
    let propRequest = JSON.parse(propRequestBuffer.toString());

    //Create composite key for the new property to be created on network
    const propertyKey = RegnetHelper.getPropertyKey(ctx,propertyID);

    //Check if given property already exists
		if(await RegnetHelper.isAssetExisting(ctx,propertyKey)){
			throw new Error("Property already exists with given property ID.");
		}

    //Create a new Property asset to be stored in blockchain
		let newPropertyObject = {
			propertyID: propRequest.propertyID,
      owner: propRequest.owner,
      price: propRequest.price,
      status: propRequest.status,
			createdAt: new Date(),
      updatedAt: new Date()
		};

		//Store Property asset on blockchain
    await RegnetHelper.putAssetData(ctx,propertyKey,newPropertyObject);

    //Return value of new property created
		return newPropertyObject;
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

}

module.exports = RegnetRegistrarContract;
