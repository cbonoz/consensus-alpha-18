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

#### Useful Links

* https://www.reddit.com/r/nebulas/comments/8fi47r/nebulas_developers_questions_and_support_resources/