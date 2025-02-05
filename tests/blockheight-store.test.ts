import {
  Cl,
  ClarityValue,
  cvToValue,
  StringAsciiCV,
  TupleCV,
  UIntCV,
} from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;

const contractAddress = `${deployer}.blockheight-store`;

const startingStacksBlockHeight = simnet.blockHeight;
const startingBitcoinBlockHeight = simnet.burnBlockHeight;

let currentStacksBlockHeight = simnet.blockHeight;
let currentBitcoinBlockHeight = simnet.burnBlockHeight;

type CustomPrintEvent = {
  event: "print_event";
  data: {
    contract_identifier: string;
    raw_value: string;
    topic: string;
    value: ContractPrintEvent;
    costs: null;
  };
};

type ContractPrintEvent = TupleCV<{
  notification: StringAsciiCV;
  payload: TupleCV<ContractPrintEventPayload>;
}>;

type ContractPrintEventPayload = {
  stacksBlock: UIntCV;
  bitcoinBlock: UIntCV;
};

describe("testing stored vs simnet block height", () => {
  it("should succeed throughout the conditions in this test", () => {
    // check if the stored block height is equal to the simnet block height
    expect(currentStacksBlockHeight).toEqual(simnet.blockHeight);
    expect(currentBitcoinBlockHeight).toEqual(simnet.burnBlockHeight);
    // output info to start debugging
    console.log("current epoch", simnet.currentEpoch);
    console.log(
      "clarity version",
      simnet.getDefaultClarityVersionForCurrentEpoch()
    );

    // progress the chain and update stored block heights
    simnet.mineEmptyBlocks(10);
    currentStacksBlockHeight = simnet.blockHeight;
    currentBitcoinBlockHeight = simnet.burnBlockHeight;
    // check distance from starting
    expect(startingStacksBlockHeight + 10).toEqual(currentStacksBlockHeight);
    expect(startingBitcoinBlockHeight + 10).toEqual(currentBitcoinBlockHeight);

    // progress the chain and update stored block heights
    simnet.mineEmptyBurnBlocks(10);
    currentStacksBlockHeight = simnet.blockHeight;
    currentBitcoinBlockHeight = simnet.burnBlockHeight;
    // check distance from starting (cumulative)
    expect(startingStacksBlockHeight + 20).toEqual(currentStacksBlockHeight);
    expect(startingBitcoinBlockHeight + 20).toEqual(currentBitcoinBlockHeight);

    // call the public function to update the stored block height
    const createBlockRecord = simnet.callPublicFn(
      contractAddress,
      "create-block-record",
      [],
      deployer
    );
    expect(createBlockRecord.result).toBeOk(Cl.bool(true));
    // update stored block heights
    currentStacksBlockHeight = simnet.blockHeight;
    currentBitcoinBlockHeight = simnet.burnBlockHeight;

    // extract block height from result
    const customPrintEvent = createBlockRecord.events.find(
      (eventRecord) => eventRecord.event === "print_event"
    ) as CustomPrintEvent;
    console.log("customPrintEvent", JSON.stringify(customPrintEvent, null, 2));
    const stacksBlock = parseInt(
      cvToValue(customPrintEvent.data.value.data.payload.data.stacksBlock, true)
    );
    const bitcoinBlock = parseInt(
      cvToValue(
        customPrintEvent.data.value.data.payload.data.bitcoinBlock,
        true
      )
    );

    // check the extracted block height matches simnet
    expect(stacksBlock).toEqual(simnet.blockHeight);
    expect(bitcoinBlock).toEqual(simnet.burnBlockHeight);
    // check the extracted block height matches stored
    expect(stacksBlock).toEqual(currentStacksBlockHeight);
    expect(bitcoinBlock).toEqual(currentBitcoinBlockHeight);

    // progress the chain and update stored block heights
    simnet.mineEmptyBlocks(10);
    currentStacksBlockHeight = simnet.blockHeight;
    currentBitcoinBlockHeight = simnet.burnBlockHeight;
    // check distance from starting (10 + 10 + 1 + 10)
    expect(startingStacksBlockHeight + 31).toEqual(currentStacksBlockHeight);
    expect(startingBitcoinBlockHeight + 31).toEqual(currentBitcoinBlockHeight);
  });
});
