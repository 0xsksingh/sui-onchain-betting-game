# Onchain Betting Game on SUI 

- Built with GSAP Animation and Sui's randomness.

- Welcome to the Realtime Betting Game built on SUI. This project brings the excitement of betting on a roulette-style game to the sui blockchain. 
- Players can wager on various outcomes and see results in real-time, all powered by Sui.

## Architecture of the project

![image](https://github.com/0xsksingh/sui-onchain-betting-game/assets/129384571/f136579e-411d-4d44-a01d-1855711c710c)

## How to Play

1. **Place Your Bet**: Choose from different betting options, including:
   - Betting on a single number (0-36)
   - Betting on even or odd numbers
   - Betting on black or red colors
   - Betting on the first or second halves of the table
   - Betting on the first, second, or third thirds of the table

2. **Submit Your Wager**: Each bet requires a minimum of 1 SUI to play. You can place your bet by calling the corresponding function with your chosen parameters.

3. **Spin the Wheel**: After placing your bet, call the `spinBettingWheel()` function to spin the wheel and determine the outcome.

4. **Collect Your Winnings**: If your bet is successful, you'll receive payouts based on the odds of your chosen outcome. Payouts range from 2:1 to 35:1, depending on the type of bet.

## Betting Options

- **Single Number**: Bet on a specific number from 0 to 36.
- **Even/Odd**: Bet on whether the winning number will be even or odd.
- **Black/Red**: Bet on whether the winning number will be black or red.
- **First/Second Half**: Bet on whether the winning number will be in the first or second half of the table.
- **First/Second/Third Third**: Bet on whether the winning number will be in the first, second, or third third of the table.

## Smart Contract Details

- **Minimum Bet**: 1 SUI
- **House Balance**: The contract ensures that the house (contract) and sponsor wallet remain solvent. If the house balance is too low, it can be refilled by sending ETH directly to the contract address.
- **Random Number Generation**: The contract utilizes Sui's randomness module for secure and unbiased random number generation.
