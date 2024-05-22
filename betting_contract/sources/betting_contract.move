module betting_contract::betting_contract {
    use sui::balance::Balance;
    use sui::coin::{Self, Coin};
    use sui::tx_context::TxContext;
    use sui::random::{Random, new_generator};
    use sui::table::Table;
    use std::vector;
    use sui::sui::SUI;

    const SPONSER_WALLET : address = @0x3205f568eb92e891f889686c21270e51e0c0987d618a2b413d8e9c9b19d320ed;
    const MIN_BET: u64 = 10000; // 0.001 SUI equivalent in smallest denomination
    const HOUSE_COMMISSION: u64 = 10; // 10% commission
    const DEPLOYER_COMMISSION: u64 = 2; // 2% commission
    const SPIN_MODULO: u64 = 37; // to ensure spin results are within range 0-36

    public struct Bet has store {
        amount: u64,
        bet_type: u8,
        value: u64,
    }

    public struct SpinResult has store {
        result: u64,
        is_complete: bool,
    }

    public struct BettingGame has key, store {
        id: UID,
        house_balance: Balance<SUI>,
        spin_count: u64,
        bets: Table<u64, Bet>,
        spin_results: Table<u64, SpinResult>,
        deployer: address,
        sponsor_wallet: address,
    }

    public fun init_game(sponsor_wallet: address, ctx: &mut TxContext): BettingGame {
        BettingGame {
            id: object::new(ctx),
            house_balance: Balance::zero(),
            spin_count: 0,
            bets: Table::new(ctx),
            spin_results: Table::new(ctx),
            deployer: tx_context::sender(ctx),
            sponsor_wallet,
        }
    }

    public fun place_bet(game: &mut BettingGame, amount: u64, bet_type: u8, value: u64, coin: Coin<SUI>, ctx: &mut TxContext) {
        assert!(amount >= MIN_BET, 0);
        let user = tx_context::sender(ctx);

        // Ensure the user has enough balance in the coin
        assert!(coin.value() >= amount, 1);

        let new_bet = Bet { amount, bet_type, value };
        Table::add(&mut game.bets, user, new_bet);
        Balance::add(&mut game.house_balance, coin.split(amount, ctx));

        // Increment spin count and start the spin
        game.spin_count += 1;
        start_spin(game, ctx);
    }

    fun start_spin(game: &mut BettingGame, ctx: &mut TxContext, r: &Random) {
        let mut generator = r.new_generator(ctx);
        let random_value = generator.generate_u8_in_range(1, 100);
        complete_spin(game, random_value, ctx);
    }

    fun complete_spin(game: &mut BettingGame, random_value: u64, ctx: &mut TxContext) {
        let spin_result = random_value % SPIN_MODULO;
        let spin_data = SpinResult { result: spin_result, is_complete: true };

        Table::add(&mut game.spin_results, game.spin_count, spin_data);

        // Check bet results
        check_bets(game, ctx);
    }

    fun check_bets(game: &mut BettingGame, ctx: &mut TxContext) {
        let user = tx_context::sender(ctx);
        if let Some(bet) = Table::remove(&mut game.bets, user) {
            let spin_data = Table::borrow(&game.spin_results, game.spin_count);

            match bet.bet_type {
                0 => { // Number Bet
                    if bet.value == spin_data.result {
                        let payout = bet.amount * 35;
                        distribute_winnings(game, user, payout, ctx);
                    } else {
                        handle_loss(game, bet.amount, ctx);
                    }
                },
                1 => { // Half Bet
                    if (bet.value == 1 && spin_data.result < 19) || (bet.value == 2 && spin_data.result >= 19) {
                        let payout = bet.amount * 2;
                        distribute_winnings(game, user, payout, ctx);
                    } else {
                        handle_loss(game, bet.amount, ctx);
                    }
                },
                2 => { // Third Bet
                    let third_result = if spin_data.result > 0 && spin_data.result < 13 {
                        1
                    } else if spin_data.result > 12 && spin_data.result < 25 {
                        2
                    } else {
                        3
                    };
                    if bet.value == third_result {
                        let payout = bet.amount * 3;
                        distribute_winnings(game, user, payout, ctx);
                    } else {
                        handle_loss(game, bet.amount, ctx);
                    }
                },
                3 => { // Even/Odd Bet
                    if spin_data.result != 0 && ((bet.value == 1 && spin_data.result % 2 == 0) || (bet.value == 2 && spin_data.result % 2 != 0)) {
                        let payout = bet.amount * 2;
                        distribute_winnings(game, user, payout, ctx);
                    } else {
                        handle_loss(game, bet.amount, ctx);
                    }
                },
                4 => { // Color Bet
                    let is_black = is_black_number(spin_data.result);
                    if (bet.value == 1 && is_black) || (bet.value == 2 && !is_black && spin_data.result != 0) {
                        let payout = bet.amount * 2;
                        distribute_winnings(game, user, payout, ctx);
                    } else {
                        handle_loss(game, bet.amount, ctx);
                    }
                },
                _ => (),
            }
        }
    }

    fun handle_loss(game: &mut BettingGame, amount: u64, ctx: &mut TxContext) {
        let sponsor_amount = amount * HOUSE_COMMISSION / 100;
        let deployer_amount = amount * DEPLOYER_COMMISSION / 100;
        let house_amount = amount - sponsor_amount - deployer_amount;

        Balance::transfer(&mut game.house_balance, game.sponsor_wallet, sponsor_amount, ctx);
        Balance::transfer(&mut game.house_balance, game.deployer, deployer_amount, ctx);
    }

    public fun distribute_winnings(game: &mut BettingGame, user: Address, amount: u64, ctx: &mut TxContext) {
        assert!(Balance::value(&game.house_balance) >= amount, 2);
        Balance::transfer(&mut game.house_balance, user, amount, ctx);
    }

    public fun fund_house(game: &mut BettingGame, amount: Coin<SUI>, ctx: &mut TxContext) {
        Balance::add(&mut game.house_balance, amount);
    }

    public fun withdraw_commission(game: &mut BettingGame, amount: u64, ctx: &mut TxContext) {
        assert!(Balance::value(&game.house_balance) >= amount, 3);
        Balance::transfer(&mut game.house_balance, game.deployer, amount, ctx);
    }

    public fun withdraw_sponsor_fund(game: &mut BettingGame, amount: u64, ctx: &mut TxContext) {
        assert!(Balance::value(&game.house_balance) >= amount, 4);
        Balance::transfer(&mut game.house_balance, game.sponsor_wallet, amount, ctx);
    }

    public fun is_black_number(number: u8): bool {
        let black_numbers = vector::u8(
            2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
        );
        vector::contains(&black_numbers, &number)
    }
}