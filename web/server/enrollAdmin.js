'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// const ccpPath = path.join(process.cwd(), 'connection.json');
// const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
// const ccp = JSON.parse(ccpJSON);

const configPath = path.join(process.cwd(), "config.json");
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

const appAdmin = config.appAdmin;

async function main() {
  try {

    // Create a new CA client for interacting with the CA.
    // const caURL = ccp.certificateAuthorities['ca'].url;
    const caURL = config.caName;
    const ca = new FabricCAServices(caURL);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get(appAdmin);
    if (identity) {
      console.log(`An identity for ${appAdmin} already exists in the wallet`);
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({ enrollmentID: appAdmin, enrollmentSecret: config.appAdminSecret });
    const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: config.orgMSPID,
			type: 'X.509',
		};
    await wallet.put(appAdmin, x509Identity);
    console.log(`Successfully enrolled client ${appAdmin} and imported it into the wallet`);

  } catch (error) {
    console.error(`Failed to enroll ${appAdmin}: ${error}`);
    process.exit(1);
  }
}

main();
