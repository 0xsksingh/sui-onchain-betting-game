

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

   // todo: write to the contract

    setIsSpinning(true);

    const data = await waitForTransaction({
      hash,
      confirmations: 1,
    });

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
