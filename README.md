# Rakoon Launcher

Programatically launch your own token on [rakoon.fun](https://rakoon.fun) with this simple script.

---

## 🚀 Quick Start

### 1. Install

```bash
# Clone the repo
git clone git@github.com:dcts/rakoon-launcher.git

# Go into the directory
cd rakoon-launcher

# Install dependencies
npm install
```

### 2. Configure

Update the code wherever you see `// TODO(developer)`:

1. **Seed Phrase**  
   Replace the default seed phrase with your own. You can generate one using the [Radix Wallet App](https://wallet.radixdlt.com) → create a new account → export your 24-word seed phrase.

2. **Network**  
   Change the network from `"stokenet"` to `"mainnet"` if you’re ready to launch live.

3. **Token Metadata**  
   Customize your memecoin’s name, symbol, and other details.

💡 **Important**:  
Top up your wallet with at least **40 XRD** (30 XRD launch fee + 10 XRD for transactions).  
On *stokenet*, you can get test XRD directly in the wallet app.

### 3. Launch

Once configured and funded, launch your token with:

```bash
npm run launch
```

You’ll receive a transaction ID. Check it on the Radix explorer:

- **Stokenet**: [stokenet-dashboard.radixdlt.com/transaction/INSERT_TX_ID](https://stokenet-dashboard.radixdlt.com/transaction/INSERT_TX_ID)  
- **Mainnet**: [dashboard.radixdlt.com/transaction/INSERT_TX_ID](https://dashboard.radixdlt.com/transaction/INSERT_TX_ID)

---

## 💬 Questions?

Join the [Rakoon Telegram Chat](https://t.me/rakoonFun) — we're happy to help!
