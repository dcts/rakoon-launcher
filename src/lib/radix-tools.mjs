import { generateAccountsFromMnemonic } from "radix-account-tools-js";
import {
  Convert,
  RadixEngineToolkit,
  TransactionBuilder,
  generateRandomNonce,
  NetworkId,
} from "@radixdlt/radix-engine-toolkit";

/**
 * Given a seedphrase and network, returns sensitive account data (private + public key).
 * @param {string} seedphrase 24 word seedphrase. Words should be separated by whitespace.
 * @param {string} network "mainnet" or "stokenet".
 * @param {number} index Each seedphrase can produce an unlimited supply of addresses. If unclear, use 0.
 * @returns object holding account private and public key as well as address.
 */
export async function getAccountData(seedphrase, network, index = 0) {
  const accounts = await generateAccountsFromMnemonic(
    seedphrase,
    [index],
    network.toLowerCase() === "stokenet" ? 2 : 1
  );
  return {
    privateKey: accounts[0].privateKey,
    publicKey: accounts[0].publicKey,
    address: accounts[0].accountAddress,
  };
}

/**
 * Launches a memecoin on rakoon fun programatically and returns the TX id.
 * @param {obj} account must have privateKey, publicKey and address fields.
 * @param {string} network "mainnet" or "stokenet"
 * @param {obj} memecoin must have fields "name", "symbol", "description", "imageUrl"
 * @returns string (transaction id)
 */
export const launchMemecoin = async (account, network, memecoin) => {
  console.log("building tx manifest...");
  const launchTxManifest = buildLaunchTxManifest(
    memecoin,
    account.address,
    network
  );
  console.log("\n\n===TX MANIFEST===\n");
  console.log(launchTxManifest);
  return await submitTxManifest(
    launchTxManifest,
    network.toLowerCase(),
    account
  );
};


// ================
// HELPER FUNCTIONS
// ================
const buildLaunchTxManifest = (memecoin, userAddress, network) => {
  const radixResourceAddress =
    network.toLowerCase() === "stokenet"
      ? "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"
      : "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd";
  const rakoonMainComponent =
    network.toLowerCase() === "stokenet"
      ? "component_tdx_2_1cq5f5c9urtteu4f56qzektucdg0tuwxg9ckecl6vmav09nhpptjssd"
      : "component_rdx1cq32tyxth5edlk5j3et0rzwxtr79pdr85c59jnjg5fxp3t4azajuld";
  const { name, symbol, imageUrl, description, telegramUrl, xUrl, websiteUrl } = memecoin;
  return `
    CALL_METHOD
        Address("${userAddress}")
        "withdraw"
        Address("${radixResourceAddress}")
        Decimal("30");
    TAKE_ALL_FROM_WORKTOP
        Address("${radixResourceAddress}")
        Bucket("fee_bucket");
    
    CALL_METHOD
        Address("${rakoonMainComponent}")
        "new_token_curve_advanced"
        "${name || ""}"
        "${symbol || ""}"
        "${description || ""}"
        "${imageUrl || ""}"
        "${telegramUrl || ""}"
        "${xUrl || ""}"
        "${websiteUrl || ""}"
        "cs2"
        "oci"
        Decimal("250000")
        Decimal("250000")
        Decimal("25000")
        Decimal("0.05")
        0u32
        Decimal("0")
        None
        0i64
        Bucket("fee_bucket");
    CALL_METHOD
        Address("${userAddress}")
        "deposit_batch"
        Expression("ENTIRE_WORKTOP");
  `;
};

const submitTxManifest = async (
  txManifestString, // string
  network = "mainnet", // string, "mainnet" or "stokenet"
  account, // AccountData
  feeToLock = 10 // number
) => {
  if (feeToLock > 0) {
    txManifestString =
      `CALL_METHOD Address("${account.address}") "lock_fee" Decimal("${feeToLock}");` +
      txManifestString;
  }
  let txManifest = {
    instructions: {
      kind: "String",
      value: txManifestString,
    },
    blobs: [],
  };
  // Get current epoch (needed for TransactionBuilder)
  console.log("...running getCurrentEpoch()");
  const currentEpoch = await getCurrentEpoch(network);
  // Build transaction
  console.log("...running TransactionBuilder.new()");
  const notarizedTx = await TransactionBuilder.new().then((builder) =>
    builder
      .header({
        networkId:
          network === "mainnet" ? NetworkId.Mainnet : NetworkId.Stokenet,
        startEpochInclusive: currentEpoch,
        endEpochExclusive: currentEpoch + 5,
        notaryPublicKey: account.publicKey,
        notaryIsSignatory: true,
        nonce: generateRandomNonce(),
        tipPercentage: 0,
      })
      .manifest(txManifest)
      .notarize(account.privateKey)
  );
  // Notarize transaction
  console.log("...running RadixEngineToolkit.NotarizedTransaction.intentHash");
  const transactionData =
    await RadixEngineToolkit.NotarizedTransaction.intentHash(notarizedTx);
  const transactionId = transactionData.id;
  // Compile notarized transaction
  console.log("...running RadixEngineToolkit.NotarizedTransaction.compile");
  const compiledTx = await RadixEngineToolkit.NotarizedTransaction.compile(
    notarizedTx
  );
  // Convert to Uint8Array
  console.log("...running Convert.Uint8Array");
  const txHex = Convert.Uint8Array.toHexString(compiledTx);
  // Submit final TX
  console.log("...running submitNotarizedTransaction to submit final TX");
  await submitNotarizedTransaction(network, txHex);
  return transactionId;
};

async function getCurrentEpoch(network) {
  validateNetwork(network);
  const response = await fetch(`https://${network}.radixdlt.com/status/gateway-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return Number(data.ledger_state.epoch);
}

function validateNetwork(network) {
  if (network !== "mainnet" && network !== "stokenet") {
    throw new Error(
      `Invalid network specified. Must be either 'mainnet' or 'stokenet'. Got: ${network}`
    );
  }
}

async function submitNotarizedTransaction(network, txHex) {
  validateNetwork(network);
  const response = await fetch(`https://${network}.radixdlt.com/transaction/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      notarized_transaction_hex: txHex,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to submit transaction: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
  }
}