# Clarinet Blockheight Test

Simple repo to reproduce a simple test case.

Theory is block height tracked by simnet functions does not match with block height stored in proposals.

Need to test across Clarity versions as default here is 3, so far so good.

- [ ] expand tests to cover more public function calls / skipped blocks
- [ ] query multiple records and test against stored block height
- [ ] recreate contract with clarity_version = 2 and run same tests

To run the tests:

```bash
npm i
npm test
```
