import { log } from "./debug";
import { JoyApi } from "./joyApi";
import { EraStatus } from "./Types";
import { PromiseAllObj } from "./utils";

const api = new JoyApi();

export async function getChainState() {
  await api.init;

  const status = await PromiseAllObj({
    totalIssuance: await api.totalIssuance(),
    finalizedBlockHeight: await api.finalizedBlockHeight(),
    validators: await api.validatorsData(),
    system: await api.systemData(),
  });

  log(status)
  return status;
}

export async function getValidatorStatistics(address: string, blockStart: number): Promise<EraStatus> {
  await api.init;
  const status = await PromiseAllObj({
    status: await api.getActiveErasForBlock(address, blockStart)
  })
  return status as unknown as EraStatus
}
