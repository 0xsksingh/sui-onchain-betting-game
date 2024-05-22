import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
export default function Admin() {
	const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
	const [digest, setDigest] = useState('');
	const currentAccount = useCurrentAccount();
	const [rewardAmount, setRewardAmount] = useState(100000);
	const [endTime, setEndTime] = useState(1); // time in minutes

	const handleRewardAmountChange = (e) => {
		setRewardAmount(Number(e.target.value));
	};

	const handleEndTimeChange = (e) => {
		setEndTime(Number(e.target.value));
	};

	const handleCreateGame = () => {
		const tx = new Transaction();
		const oneMinute = 1 * 60 * 1000; // 1 minute in milliseconds
		const calculatedEndTime = Date.now() + endTime * oneMinute;

		tx.moveCall({
			target: `0xa25c09e571864ab351bdc3d08181c063469d08bd550ca662e815f78ff8450707::betting_contract::create`,
			arguments: [
				tx.pure(calculatedEndTime), // end_time: u64
				tx.pure(rewardAmount), // cost_in_sui: u64
			],
		});

		tx.setGasBudget(100000000);
		tx.setSender(currentAccount?.address || '');

		signAndExecuteTransaction(
			{
				transaction: tx,
				chain: 'sui:devnet',
			},
			{
				onSuccess: (result) => {
					console.log('executed transaction', result);
					setDigest(result.digest);
				},
			}
		);
	};

	const handledistributeRewards =() => {

		const tx = new Transaction();
		transactionBlock.moveCall({
			target: "0xa25c09e571864ab351bdc3d08181c063469d08bd550ca662e815f78ff8450707::betting_contract::close",
			arguments: [
			  transactionBlock.object(
				"0x15cbd693f7d390f9f066276750866fd578afeeccd132e39d4fd3ad1a3efbc29a"
			  ), // game: Game instance
			  transactionBlock.object("0x8"), // r: &Random
			  transactionBlock.object("0x6"), // clock: &Clock,
			],
		  });

		  signAndExecuteTransaction(
			{
				transaction: tx,
				chain: 'sui:devnet',
			},
			{
				onSuccess: (result) => {
					console.log('executed transaction', result);
					setDigest(result.digest);
				},
			}
		);
	}

	return (
		<div style={{ padding: 20 }}>
			{currentAccount && (
				<>
					<div>
						<label>
							Reward Amount:
							<input type="number" value={rewardAmount} onChange={handleRewardAmountChange} />
						</label>
					</div>
					<div>
						<label>
							End Time (minutes):
							<input type="number" value={endTime} onChange={handleEndTimeChange} />
						</label>
					</div>
					<div>
						<button onClick={handleCreateGame}>
							Create the Betting Game instance
						</button>
					</div>

					<div>
						<button onClick={handledistributeRewards}>
							Distribute the rewards
						</button>
					</div>
					<div>Digest: {digest}</div>
				</>
			)}
		</div>
	);
}
