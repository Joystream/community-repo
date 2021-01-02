# PolkadotJS Browser Test

The extension is optimized for usability and hides complexity. Compared to the Pioneer UI where three algorithms can be selected for key creation the extension uses sr25519 for creation abd is able to import other types as well (polkadot-js/extension#339).

The minimal password length is 6 characters while Pioneer has no restrictions.

Cross-chain keys have been tested with https://testnet.joystream.org and https://polkadot.js.org.

## Android

Browser | Google | Brave | Tor Browser
-- | -- | -- | --
Installable | Yes | Yes | No (`Experimental`)
Usable | No<sup>1</sup> | No<sup>1</sup> |  

1) Neither a popup nor a symbol are shown.

## Linux

Browser | Firefox | Tor Browser | Chrome | Chromium
-- | -- | -- | -- | --
Installable | Yes | Yes | Yes | Yes
Cross-chain keys | Yes | Yes | Yes | Yes
Add via JSON file | Yes | Yes | Yes | Yes
Import raw seed, mnemonic | Yes | Yes | Yes | Yes
Create new seed | Yes | Yes | Yes | Yes
Backup seeds and or JSON file | Yes | Yes | Yes | Yes

## MacOS / iOS

No extension available for download, but developers can build it themselves (see polkadot-js/extension#377 and [A Change to the Safari Extension](http://blog.lastpass.com/2019/01/change-safari-extension/), January 2019).

## Windows

Browser | Brave | Chrome | Edge | Firefox | Opera | Tor Browser
-- | -- | -- | -- | -- | -- | --
Installable | Yes | Yes | Yes | Yes | Yes | Yes
Cross-chain keys | Yes | Yes | Yes | Yes | Yes | Yes
Add via JSON file | Yes | Yes | Yes | Yes | Yes | Yes
Import raw seed, mnemonic | Yes | Yes | Yes | Yes | Yes | Yes
Backup seeds and/or JSON file | Yes | Yes | Yes | Yes | Yes | Yes

