import Wheel from "./Wheel";
import SpinButton from "./SpinButton";
import { useEffect, useState } from "react";
import useStore from "/src/store";
import howler from "howler";
import { useAccounts } from "@mysten/dapp-kit";
import Bid from "./Bid";
import gsap from "gsap";
import { ConnectButton, useConnectWallet, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";

 const  WheelModule=()=> {
  const accounts = useAccounts();
  const { mutate: SignAndExecuteTransaction , executeFromWallet } = useSignAndExecuteTransaction();
  const [buttonDisabled, setButtonDisabled] = useState(
    accounts.length !== 0 ? "" : "disabled"
  );

  const neonBlink = new howler.Howl({
    src: ["/sounds/neon-blink.wav"],
    volume: 0.01,
  });

  const blink = new howler.Howl({
    src: ["/sounds/blink.wav"],
    volume: 0.01,
  });

  const { numbers, selection } = useStore((state) => state.grid);
  const {
    result,
    spinned,
    isSpinning,
    writeContract: spinWheel,
  } = useStore((state) => state.wheel);

  const [colorSliceColor, setColorSliceColor] = useState("");
  const [whiteSliceColor, setWhiteSliceColor] = useState("");
  const [centerResultClass, setCenterResultClass] = useState("");
  const [center, setCenter] = useState(null);
  const [animationId, setAnimationId] = useState(0);
  const frameTime = 200;

  //functions

  useEffect(() => {
    if (isSpinning && !spinned) {
      setAnimationId(setInterval(animations, frameTime));
    }
    if (!isSpinning && spinned) {
      clearInterval(animationId);
      highlight(numbers[result]);
    }
  }, [isSpinning, spinned]);

  async function buttonHandle() {
    if (buttonDisabled === "disabled") {
      shakeConnectButton();
      return;
    }

    if (!selection) {
      shakeGrid();
      return;
    }

    await call();
    await spinWheel();
  }

  function animations() {
    // highlight the animation at the moment timePassed
    const i = Math.floor(Math.random() * 37);
    highlight(numbers[i]);
  }

  //highlight number on wheel
  function highlight(num) {
    setCenter(num.number); //set center number
    //   num.number % 2 === 0 ? neonBlink.play() : blink.play();
    neonBlink.play();
    wheelStrokeColor(num);

    document
      .querySelectorAll("#white-slices .slices")
      .forEach(function (slice) {
        slice.classList.remove("selected");
      });
    document
      .querySelectorAll("#color-slices .slices")
      .forEach(function (slice) {
        slice.classList.remove("selected");
      });

    sliceColor(num);
  }
  // change color of wheel to match number
  function wheelStrokeColor(num) {
    setColorSliceColor(`var(--${num.color})`);
    setWhiteSliceColor(`var(--${num.color})`);
    setCenterResultClass(num.color);
  }

  function sliceColor(num) {
    const currentWhiteSlice = document.querySelector(
      `#white-slices #slice-${num.number}`
    );
    const currentColorSlice = document.querySelector(
      `#color-slices #slice-${num.number}-color`
    );
    if (num.number > 0) {
      currentWhiteSlice.classList.add("selected");
      currentColorSlice.classList.add("selected");
    }
  }

  const call = async () => {
    const rpcUrl = getFullnodeUrl('devnet');
    const client = new SuiClient({ url: rpcUrl });

    const tx = new Transaction();
    const rewardAmount = 1000000000;
    const oneMinute = 1 * 60 * 1000; 
    // tx.moveCall({
    //   target: '6EmgnQK64YoRUhpQE6AwWDQaxQpDspurYRncZqmhPv5T::roll_dice::roll_dice_quiet',
    //   arguments: [
    //     tx.pure(Date.now() + oneMinute),
    //     tx.pure.u64(100_000_000)
    //   ],
    // });

    const [feeCoin] = tx.splitCoins(tx.gas, [
      tx.pure(100_000_000),
    ]);

    tx.moveCall({
      target: `0xa25c09e571864ab351bdc3d08181c063469d08bd550ca662e815f78ff8450707::betting_contract::place_bet`,
      arguments: [
        tx.object(
          "0xdf4273ed5c0f90fecc40af54f9d37ac86c44e54588dc52da27bf9cd5e64e8b48"
        ), // game: &mut Game
        tx.object(feeCoin), // coin: Coin<SUI>
        tx.object(SUI_CLOCK_OBJECT_ID), // clock: &Clock
      ],
    });

    tx.setGasBudget(1000000000);
    tx.setSender("0x1abb48bc4aac9e2689ad1b73fd5cfbbf6bdbade8e75ebf1466da4c3c41d16d46");

    const txn = await SignAndExecuteTransaction(
      {
        transaction: tx,
        chain: 'sui:devnet',
      })
      console.log(txn,"txn")
    // console.log(signtxn,"signed")
    try{

        const txn = await SignAndExecuteTransaction(
        {
          transaction: tx,
          chain: 'sui:devnet',
        },
        {
          onSuccess: (result) => {
            console.log('executed transaction', result);
          },
        },
        {
          onError: (err) => {
            console.log('executed transaction', err,err.message);
          },
        }
      );

          console.log(txn,"txnnnn")
    } catch(error) {
      console.log(error,"error",error.message);
    }

  }


  //return
  return (
    <wheel-module>
      <Wheel
        colorSliceColor={colorSliceColor}
        whiteSliceColor={whiteSliceColor}
      />

      {/* <Bid /> */}

      <SpinButton
        center={center}
        buttonHandle={buttonHandle}
        buttonDisabled={buttonDisabled}
        centerResultClass={centerResultClass}
      />
    </wheel-module>
  );
}

function shakeGrid() {
  const grid = gsap.timeline({ paused: true, repeat: 1 });
  grid
    .to("numbers-grid", {
      duration: 0.2,
      //   color: "var(--green)",
      filter: "brightness(1.5) saturate(1.5)",
      rotate: 1,
      ease: "power2.in",
    })
    .to("numbers-grid ", {
      duration: 0.2,
      filter: "brightness(1) saturate(1)",
      //   color: "white",
      rotate: 0,
      ease: "power2.in",
    });

  grid.play();
  return;
}
function shakeConnectButton() {
  const connectButton = document.querySelector("button.connect");
  //  scroll to top
  console.log(connectButton);
  window.scrollTo(0, 0);
  connectButton.classList.add("wobble-connect");
  setTimeout(() => {
    connectButton.classList.remove("wobble-connect");
  }, 1200);
  return;
}

export default WheelModule;