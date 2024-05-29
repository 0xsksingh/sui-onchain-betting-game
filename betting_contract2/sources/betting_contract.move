/// Module: Betting Game Contract2
/// This module implements a roullete style betting game where participants can bet on particular numbers in SUI.
/// At the end of the game, a winner is selected among the participants, and the balance is transferred to the winner.

module betting_contract2::betting_contract2 {
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::random::{Self, Random, new_generator};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::tx_context::{sender};

    /// Error codes
    const EGameInProgress: u64 = 0;
    const EGameAlreadyCompleted: u64 = 1;
    const EInvalidAmount: u64 = 2;
    const EReachedMaxParticipants: u64 = 3;

    const MaxParticipants: u32 = 500;

    /// BettingGame represents a set of parameters of a single game.
    public struct BettingGame has key {
        id: UID,
        cost_in_sui: u64,
        participants: u32,
        end_time: u64,
        balance: Balance<SUI>,
        participants_table: Table<u32, address>,
    }

    /// Create a shared-object BettingGame.
    ///
    /// Parameters:
    /// - end_time: Timestamp when the game ends.
    /// - cost_in_sui: Cost in SUI to participate in the raffle.
    /// - ctx: Transaction context.
    public fun create(
        end_time: u64,
        cost_in_sui: u64,
        ctx: &mut TxContext
    ) {
        let game = BettingGame {
            id: object::new(ctx),
            cost_in_sui,
            participants: 0,
            end_time,
            balance: balance::zero(),
            participants_table: table::new(ctx),
        };
        transfer::share_object(game);
    }

    /// Anyone can place their bet.
    ///
    /// Parameters:
    /// - game: Reference to the game instance being played.
    /// - coin: Coin used to participate in the game.
    /// - clock: Current timestamp.
    /// - ctx: Transaction context.
    public fun place_bet(
        game: &mut BettingGame, 
        coin: Coin<SUI>, 
        clock: &Clock, 
        ctx: &mut TxContext
    ) {
        assert!(game.end_time > clock::timestamp_ms(clock), EGameAlreadyCompleted);
        assert!(coin::value(&coin) == game.cost_in_sui, EInvalidAmount);
        assert!(game.participants < MaxParticipants, EReachedMaxParticipants);

        game.participants = game.participants + 1;
        coin::put(&mut game.balance, coin);
        table::add(&mut game.participants_table, game.participants, sender(ctx));
    }
    
    /// Admin can close the game and send the balance to the winners of the Bets.
    ///
    /// The function is defined as private entry to prevent calls from other Move functions. (If calls from other
    /// functions are allowed, the calling function might abort the transaction depending on the winner.)
    /// Gas based attacks are not possible since the gas cost of this function is independent of the winner.
    ///
    /// Parameters:
    /// - game: BettingGame object to be closed.
    /// - r: Random number generator.
    /// - clock: Current block timestamp.8
    /// - ctx: Transaction context.
    entry fun distribute_winnings(
        game: BettingGame,
        r: &Random,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(game.end_time <= clock::timestamp_ms(clock), EGameInProgress);
        let BettingGame { id, cost_in_sui: _, participants, end_time: _, balance, mut participants_table } = game;
        
        if (participants == 1) {
            let winner = 1;
            let winner_address = *table::borrow(&participants_table, winner);
            let reward = coin::from_balance(balance, ctx);
            transfer::public_transfer(reward, winner_address);
            table::remove(&mut participants_table, 1);
        } else if (participants > 1) {
            let mut generator = new_generator(r, ctx);88
            let winner = random::generate_u32_in_range(&mut generator, 1, participants);
            let winner_address = *table::borrow(&participants_table, winner);
            let reward = coin::from_balance(balance, ctx);
            transfer::public_transfer(reward, winner_address);

            let mut i = 1;
            while (i <= participants) {
                table::remove(&mut participants_table, i);
                i = i + 1;
            };
        } else {
            balance::destroy_zero(balance);
        };

        table::destroy_empty(participants_table);
        object::delete(id);
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

}