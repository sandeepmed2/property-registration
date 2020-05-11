'use strict';

//This class contains all helper utility functions like fetching data from ledger, verifying data existence...
class RegnetHelper {
  /**
	 * Helper function to get asset data buffer from ledger
	 * @param ctx - The transaction context object
	 * @param assetKey - Composite key of asset to be fetched
	 * @returns
	 */
	static async getAssetBuffer(ctx, assetKey) {
		//Fetch asset details with given key
		return await ctx.stub
									.getState(assetKey)
									.catch(err => console.log(err));
	}

	/**
	 * Helper function to put asset data on ledger
	 * @param ctx - The transaction context object
	 * @param assetKey - Composite key of asset to be created or updated
	 * @param assetData - Asset data to put on ledger
	 * @returns
	 */
	static async putAssetData(ctx, assetKey, assetData) {
		//Convert input JSON object to buffer and store it to blockchain
		let dataBuffer = Buffer.from(JSON.stringify(assetData));
		await ctx.stub.putState(assetKey, dataBuffer);
	}

  /**
	 * Helper function to verify if given asset exists
	 * @param ctx - The transaction context object
	 * @param assetKey - Composite key of asset to be verified
	 * @returns
	 */
	static async isAssetExisting(ctx, assetKey) {
    //Return true if asset is existing
    let assetBuffer = await RegnetHelper.getAssetBuffer(ctx,assetKey);
		return assetBuffer.length !== 0;
	}

  /**
	 * Helper function to construct User registration request key
	 * @param ctx - The transaction context object
	 * @param name - Name of the user
	 * @param aadharNumber - Aadhar card number of the user
	 * @returns
	 */
	static getUserRegRequestKey(ctx, name, aadharNumber) {
		return ctx.stub.createCompositeKey('org.property-registration-network.regnet.request.user', [name + '-' + aadharNumber]);
	}

	/**
	 * Helper function to construct User composite key
	 * @param ctx - The transaction context object
	 * @param name - Name of the user
	 * @param aadharNumber - Aadhar card number of the user
	 * @returns
	 */
	static getUserKey(ctx, name, aadharNumber) {
		return ctx.stub.createCompositeKey('org.property-registration-network.regnet.user', [name + '-' + aadharNumber]);
	}

  /**
	 * Helper function to construct Property registration request key
	 * @param ctx - The transaction context object
	 * @param propertyID - ID of the property to be registered
	 * @returns
	 */
	static getPropRegRequestKey(ctx, propertyID) {
		return ctx.stub.createCompositeKey('org.property-registration-network.regnet.request.property', [propertyID]);
	}

	/**
	 * Helper function to construct Property composite key
	 * @param ctx - The transaction context object
	 * @param propertyID - ID of the property
	 * @returns
	 */
	static getPropertyKey(ctx, propertyID) {
		return ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyID]);
	}

}

module.exports = RegnetHelper;
