import { ConnectButton, useConnectWallet, useCurrentAccount, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export const wheel = (set, get) => ({
  result: null,
  spinned: false, // bolean telling if wheel has been spinned
  isSpinning: false, // boolean telling if wheel is spinning
  isWinner: false, // boolean telling if the result is a winner

  
  loadingContract: { status: false, message: "" },

  setResult: (result) =>
    set((state) => ({
      ...state,
      wheel: {
        ...state.wheel,
        result,
      },
    })),

  setSpinned: (spinned) =>
    set((state) => ({
      ...state,
      wheel: {
        ...state.wheel,
        spinned,
      },
    })),

  setIsSpinning: (isSpinning) =>
    set((state) => ({
      ...state,
      wheel: {
        ...state.wheel,
        isSpinning,
      },
    })),

  setIsWinner: (isWinner) =>
    set((state) => ({
      ...state,
      wheel: {
        ...state.wheel,
        isWinner,
      },
    })),

  setLoadingContract: (loadingContract) =>
    set((state) => ({
      ...state,
      wheel: {
        ...state.wheel,
        loadingContract,
      },
    })),

  writeContract: async () => {
    const { selection, numbers, ticket } = get().grid;
    const { setIsSpinning, setResult, setSpinned, setIsWinner } = get().wheel;
    const { contractAddress } = get();

    // const wallet = useConnectWallet();
    // console.log(wallet,"wallet")

    // use getFullnodeUrl to define Devnet RPC location
    // const rpcUrl = getFullnodeUrl('devnet');
    
    // // create a client connected to devnet
    // const client = new SuiClient({ url: rpcUrl });


    // const tx = new Transaction();

    // const rewardAmount = 100;

    // tx.moveCall({
    //   target: '0x2::0xf6a3395c9fe17f84609d5652bbbd3fa30730cae43893e176e6411beb2787a2c4::create',
    //   arguments: [tx.pure.u64(rewardAmount)],
    // });

    // tx.setGasBudget(100000000)

    // tx.setSender("0x1abb48bc4aac9e2689ad1b73fd5cfbbf6bdbade8e75ebf1466da4c3c41d16d46")

    // const singed = await tx.build({ client });
    // console.log(singed,"singed")

    // const execute = await client.executeTransactionBlock(singed);
    // console.log(execute,"execute");
    // signAndExecuteTransaction(
    //   {
    //     transaction: tx,
    //     chain: 'sui:devnet',
    //   },
    //   {
    //     onSuccess: (result) => {
    //       console.log('executed transaction', result);
    //     },
    //   },
    // );
    // const sign = await signer.signAndExecuteTransactionB({ signer: signer, transaction: tx });

    // console.log(sign,"signed the game")

    setIsSpinning(true);

    // const data = await waitForTransaction({
    //   hash,
    //   confirmations: 1,
    // });

    const log = data.logs.find((log) => log.address === contractAddress);
    const parsedLog = roulette.interface.parseLog(log);
    const logRequestId = parsedLog.args.requestId;

    const unwatch = watchContractEvent(

      // event name SpinComplete == emitted ??


      (requestId, randomNumber) => {
        if (requestId === logRequestId) {
          unwatch();
          
          const result = randomNumber.mod(37).toNumber(); // 20

          setIsSpinning(false);
          setSpinned(true);
          setResult(result);

          const found = numbers.find((item) => item.number === result);
          setIsWinner(found.checked);
        }
      }
    );
  },
});
