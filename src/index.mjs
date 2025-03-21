import { getAccountData, launchMemecoin } from "./lib/radix-tools.mjs";

/*
 * The following script creates a token and launches it on rakoon.fun (STOKENET)
 * (if you want mainnet, simply change network below to "mainnet")
 * (please also use your own seedphrase)
 * 
 * Required packages:
 * -> radix-account-tools-js: to programataically generate wallets
 * -> @radixdlt/radix-engine-toolkit: to programatically submit a TX to the radix ledger
 *                                    without radix wallet app.
 */


/**
 * SCRIPT BEGINS HERE
 */
(async() => {
  // 1 GENERATE WALLET
  // TODO(developer): change to "mainnet" when you want to launch on mainnet
  const network = "stokenet";
  // TODO(developer): change this seed phrase. BELOW SEED IS JUST FOR DEMO PURPOSE.
  const seedPhrase =
    "dad march shift during nurse grab panther faith grass skill hotel hobby rather course smart tribe require express noble gun deputy uniform reason history";
  // generates wallet programatically
  const accountData = await getAccountData(seedPhrase, network);
  console.log(`Bot initialized with ${network} account:\n${accountData.address}`);

  // 2 SET COIN METADATA
  const memecoin = {
    name: "Kangoroo Coin",
    symbol: "KANGOROO",
    description: "Random Kangoroo coin programatically launched with https://github.com/dcts/rakoon-launcher",
    imageUrl: "https://www.allthingswild.co.uk/wp-content/uploads/2021/12/c668a130-8268-49a5-b2c5-10677193ea74.jpg",
    telegramUrl: "https://t.me/example",
    xUrl: "https://x.com/example",
    websiteUrl: "https://website.com", 
  }
  console.log("Memecoin data:");
  console.log(memecoin);

  // 3 LAUNCH ON RAKOON
  console.log(`launching memecoin on rakoon fun on ${network}`);
  const txId = await launchMemecoin(accountData, network, memecoin);
  console.log(`transaction successfull! TXID: ${txId}`);
})();
