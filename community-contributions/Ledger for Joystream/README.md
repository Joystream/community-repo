# Community Bounty #8. Ledger for Joystream

### **Environment:**

- Arch Linux
- Google Chrome 89.0.4389.114
- polkadot{.js} extension 0.37.1
- Joystream Node 5.1.0-9d9e77751-x86_64-linux-gnu
- Ledger Live 2.25.1
- Ledger Nano X (firmware 1.2.4-5)

## 1. Test compatibility of Ledger on Joystream

### Can a Ledger be used to sign transactions on [Pioneer](https://testnet.joystream.org/#/accounts) w/o an extension?

Ledger Nano doesn't show up on [https://testnet.joystream.org/#/accounts](https://testnet.joystream.org/#/accounts) without `polkadot {.js}` extension (1 screenshot). If you enable the extension, all the addresses that are associated with it appear (2 screenshot). My hardware wallet is respectively `Ledger Nano X (Extension)`. The name can be changed to any other in the extension when adding the wallet (3 screenshot), but the inscription `Extension` in brackets on the `My Keys` page will remain. The Add account button is only for creating a new or restoring an old paper wallet (4 screenshot). Ledger cannot be connected here: this requires an extension.

1 | 2 | 3 | 4
--- | --- | --- | ---
![___2021-04-24_19-43-57](https://user-images.githubusercontent.com/1708881/116784767-0bd99000-aaa7-11eb-8da9-43ab3c5e53fe.png) | ![___2021-04-24_19-44-16](https://user-images.githubusercontent.com/1708881/116784957-121c3c00-aaa8-11eb-88de-6bd1603efbdd.png) | ![___2021-04-24_19-44-19](https://user-images.githubusercontent.com/1708881/116784977-31b36480-aaa8-11eb-97b9-3d22d1354456.png) | ![___2021-04-24_20-05-21](https://user-images.githubusercontent.com/1708881/116784994-47c12500-aaa8-11eb-8468-eeae5a53c7e6.png)

### Can a Ledger be used to sign transactions on [Polkadot JS apps](https://polkadot.js.org/apps/#/accounts) w/o an extension?

Here it is also suggested to download the `polkadot {.js}` extension, if it is not installed (5 and 6 screenshots). But there is another option:

1. Go to [Settings](https://polkadot.js.org/apps/#/settings) and select "Attach Ledger via WebUSB" under "manage hardware connections" (7 screenshot). There is no such item on the page: [https://testnet.joystream.org/#/settings](https://testnet.joystream.org/#/settings).
2. Return to the [Accounts](https://polkadot.js.org/apps/#/accounts) page and click on the "Add via Ledger" button (8 screenshot).
3. Specify name, type and index (9 screenshot).

5 | 6 | 7 | 8 | 9
--- | --- | --- | --- | ---
![___2021-04-24_19-46-02](https://user-images.githubusercontent.com/1708881/116785419-7b04b380-aaaa-11eb-9335-062927db3f72.png) | ![___2021-04-24_19-46-12](https://user-images.githubusercontent.com/1708881/116785427-83f58500-aaaa-11eb-835a-da94b3b5438d.png) | ![___2021-04-24_20-07-22](https://user-images.githubusercontent.com/1708881/116785445-a7203480-aaaa-11eb-94ab-093fcd9c971e.png) | ![___2021-04-24_20-08-30](https://user-images.githubusercontent.com/1708881/116785453-b1dac980-aaaa-11eb-9311-da4202819dc9.png) | ![___2021-04-24_20-08-30](https://user-images.githubusercontent.com/1708881/116785459-b8694100-aaaa-11eb-9103-b5fd9d42bcb2.png) |![___2021-04-24_20-10-19](https://user-images.githubusercontent.com/1708881/116785462-bf904f00-aaaa-11eb-9993-671fc9a70f0a.png)

When you create a transaction on the Ledger Nano, information about it is displayed (11 photo). It can be approved (12 photo) or rejected.

10 | 11 | 12
--- | --- | ---
![IMG_20210424_204354](https://user-images.githubusercontent.com/1708881/116785799-78a35900-aaac-11eb-9558-2ab7cbe98da0.jpg) | ![IMG_20210424_204451](https://user-images.githubusercontent.com/1708881/116785802-7b9e4980-aaac-11eb-88ec-4f5135a86a70.jpg) | ![IMG_20210424_204511](https://user-images.githubusercontent.com/1708881/116785805-7d680d00-aaac-11eb-8289-a76acac5ce1a.jpg)

### Can a Ledger be used to sign transactions on Pioneer with the [extension](https://polkadot.js.org/extension/)

No, I get an error when sending coins from Ledger Nano to other addresses:

```
Something went wrong with the query and rendering of this component. Unable to find supported chain for 0xabf929bb2e7d75083f6f7b5f5ad3dd6ef94cab0c1db12cc1a0a4ddccf76c18a9
```

![___2021-04-08_01-19-10](https://user-images.githubusercontent.com/1708881/116785867-e3ed2b00-aaac-11eb-929f-0520190180ee.png)

### Can a Ledger be used to sign transactions on Polkadot with the [extension](https://polkadot.js.org/extension/)

In this case, when sending coins, you will first need to click on the "Sign on Ledger" button, then confirm the transaction on the hardware wallet.

![___2021-04-24_20-51-41](https://user-images.githubusercontent.com/1708881/116785951-53631a80-aaad-11eb-8508-ba6ac0ac6d34.png)

## 2. Which substrate keytypes are supported by Ledger
### Schnorrkel (`sr25519`), Edwards (`ed25519`), `ECDSA`?

Now only `ed25519`. `Sr25519` planned. Source: [Polkadot Accounts · Polkadot Wiki](https://wiki.polkadot.network/docs/en/learn-accounts#portability)

## 3. Transaction testing

- Test (at least) a single transaction from each `section`, and log:
    - `method`
    - `input`
    - data displayed on ledger (can be image)
    - data displayed in Pioneer/extension (can be screenshot)
    - if fail:
        - error message(s) displayed Pioneer/extension (can be screenshot)
        - error message displayed on node (if any)

### Node start command

```bash
$ ./joystream-node --pruning archive --validator --dev --log runtime,txpool,transaction-pool
```

I created ordinary transactions for sending coins through the "Send" button: an error appears in the extension (see point 1), but there is nothing about it in the logs.

![___2021-05-01_15-58-35](https://user-images.githubusercontent.com/1708881/116786272-c325d500-aaae-11eb-928d-caaa79713a38.png)

On the [Extrinsics](https://testnet.joystream.org/#/extrinsics) page, I tried to create a transaction `system.remark(0x7465737420746573742074657374)`. Result: again the error `Something went wrong`, as in point 1. As I understand it, these transactions do not even get into the blockchain.

## 4. What are the derivation paths, and recovery mechanism, for each keytype supported

- Find the derivation path used for each of the keytypes supported.
- Check if you are able to successfully recover the key without using a Ledger, and sign a transaction with it, by some mix of:
    - the BIP39 tool
    - Subkey
    - Pioneer
    - Polkadot/substrate documentation
- If successful: note down all steps, and results in such a way that your results are reproducible
    - Your seed
    - All commands
    - All results
    - Everything you inserted in to the browser
- If unsuccessful: note down all steps of your attempts, and results in such a way that your results are reproducible, and/or can be ruled out by someone else attempting this

**Seed:** `defy embark buzz express keep chat melody diagram cherry bag office race`

Ledger Live and the extension display this address: `16Vchf4ANYiHjHALzVeDKEvNjY7i4Ynn1AEfdJwAVwyb43u3`.
If you do not connect Ledger Nano in the extension, but restore the wallet by phrase, the address is: `15Vdpb2YMECWyjRzoFjgMQA5bpSLMyGdFfKr7Hf4paebMbTf`.

From https://testnet.joystream.org/ Ledger Nano connected via extension: `5HZKZKo6WmSpHk9q2rbDB66Dsv84NFEdvfWBU1wowrx4sbZC`.
Wallet imported using the phrase: `5GZLgFmUVSw3YCRUqcggDFKvkCSgffiVBAbMwzfiGVd5BPjz`.

### From Ledger Live

```jsx
{
  "index": 0,
  "freshAddressPath": "44'/354'/0'/0'/0'",
  "id": "js:2:polkadot:16Vchf4ANYiHjHALzVeDKEvNjY7i4Ynn1AEfdJwAVwyb43u3:polkadotbip44",
  "blockHeight": 4633191
}
```

Ledger does not support the Joystream network. It only supports Polkadot, Kusama, Dock and Polymath. Task in the `polkadot {.js}` extension repository with details: [https://github.com/polkadot-js/extension/issues/694](https://github.com/polkadot-js/extension/issues/694). To work with any network, you first need to install the appropriate application in Ledger Live. Source code of applications for working with Polkadot, Kusama and Polymesh:

- [Zondax/ledger-polkadot](https://github.com/Zondax/ledger-polkadot)
- [Zondax/ledger-kusama](https://github.com/Zondax/ledger-kusama)
- [Zondax/ledger-polymesh](https://github.com/Zondax/ledger-polymesh)

It is also worth adding that in the extension you can select "Allow use on any chain" for paper wallets. For a hardware wallet, this option is not available, you must definitely select a specific network.

### [Magnum Gold in PolkadotRu](https://t.me/PolkadotRu/27791)

> *Regarding Ledger, by the way, I would just like to draw your attention to the fact that due to hardware limitations, derivation of the key from the seed phrase is not compatible with most other projects in the ecosystem.*

### [Ledger-compatible key derivation in subkey · Issue #7824 · paritytech/substrate](https://github.com/paritytech/substrate/issues/7824)

> *Background to current problem: The key derivation function Ledger uses is different from all other places (built on top of our Rust or JS libraries): it's a hardware limitation of Ledger's and there's little we can do about this.*
>
> *Feature request: Add a Ledger compatibility layer in Subkey — basically a CLI mode where you type in a Ledger phrase and get back a json file with a key which you can import in other places.*
>
> *The goal is to be able to use subkey to convert a Ledger seedphrase into a format you can later import into, say, PolkadotJS.*

### [Any way to customize the derivation path format? · Issue #39 · Zondax/ledger-polkadot](https://github.com/Zondax/ledger-polkadot/issues/39)

> *Ledger devices follow the de-facto standard BIP39 and BIP44. Substrate unfortunately is not BIP39/BIP44 compatible. You can find parity's decision here: [https://github.com/paritytech/substrate-bip39#substrate-bip39](https://github.com/paritytech/substrate-bip39#substrate-bip39)*

## 5. Research, without any testing required, if any other hardware wallet manufacturer supports Polkadot/substrate (and by extension Joystream)

**Trezor** doesn't support: [https://trezor.io/coins/](https://trezor.io/coins/)

**BitBox02** too: [https://shiftcrypto.ch/coins/](https://shiftcrypto.ch/coins/)

**Keepkey:** [the official page](https://shapeshift.com/keepkey) indicated that it supports 40+ coins, but the full list is currently not available (after authorization, the error "This page doesn't exist"): [https://keepkey.zendesk.com/hc/en-us/articles/360003047479-What-Digital-Assets-Does-KeepKey-Support-](https://keepkey.zendesk.com/hc/en-us/articles/360003047479-What-Digital-Assets-Does-KeepKey-Support-). From [this article](https://www.reddit.com/r/dot/comments/gm4nfu/hardware_wallets_that_supports_polkadot/)), Keepkey does not support Polkadot. I have not found information about this anywhere else.

**Cobo Vault:** you can add Polkadot and Kusama: [https://cobo.com/hardware-wallet/supported-crypto-assets](https://cobo.com/hardware-wallet/supported-crypto-assets) . You can also add this wallet to `polkadot{.js}`.

**SafePal S1** supports Polkadot and Kusama: [https://shop.safepal.io/products/safepal-hardware-wallet-s1-bitcoin-wallet](https://shop.safepal.io/products/safepal-hardware-wallet-s1-bitcoin-wallet) . But derivation paths like the Ledger Nano: [https://stackoverflow.com/questions/66323948/polkadot-js-import-bip44-address-w-derivation](https://stackoverflow.com/questions/66323948/polkadot-js-import-bip44-address-w-derivation)
