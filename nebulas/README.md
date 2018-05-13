Nebulas Smart Contract Code
---
testing123


#### Contract interface

The smart contract for a particular commodity future on Liquidity looks
like the following. Submit a post request to `/Contract` with this body.
<pre>
{
    "symbol": "CRDUSD, // commodity symbol.
    "endPrice": $55.00, // end price.
    "participants":[XXXX, ...], // addresses of the participants (use index for corresponding amount and side).
    "amounts": [1.00, ...], // bet amounts in NAS
    "sides": [1, ...], // 1 if above, 0 if below
    "expirationDate": XXXX // timestamp when the price will be checked.
}
</pre>

#### To view smart contract code:

* open `web-wallet/index.html`
* go to contract or check tx status.


Contract deployed:
tx hash: 9152ea8a20dd3bf4fb1ce7253a9b528cc9babbf3e9c05b09b9d236cf190ab4e8

#### Useful Links

* https://www.reddit.com/r/nebulas/comments/8fi47r/nebulas_developers_questions_and_support_resources/