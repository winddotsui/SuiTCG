module wave_tcg::marketplace {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::table::{Self, Table};
    use std::string::{Self, String};

    const EInsufficientPayment: u64 = 0;
    const ETournamentFull: u64 = 1;
    const EAlreadyRegistered: u64 = 2;
    const ENotActive: u64 = 3;
    const TOURNAMENT_ENTRY_FEE: u64 = 10_000_000_000;

    public struct Tournament has key {
        id: UID,
        name: String,
        prize_pool_mist: u64,
        max_participants: u64,
        participant_count: u64,
        participants: Table<address, bool>,
        is_active: bool,
        organizer: address,
    }

    public struct TournamentJoined has copy, drop {
        tournament_id: ID,
        participant: address,
        entry_fee_mist: u64,
    }

    public entry fun create_tournament(
        name: vector<u8>,
        max_participants: u64,
        ctx: &mut TxContext
    ) {
        let tournament = Tournament {
            id: object::new(ctx),
            name: string::utf8(name),
            prize_pool_mist: 0,
            max_participants,
            participant_count: 0,
            participants: table::new(ctx),
            is_active: true,
            organizer: tx_context::sender(ctx),
        };
        transfer::share_object(tournament);
    }

    public entry fun join_tournament(
        tournament: &mut Tournament,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let participant = tx_context::sender(ctx);
        assert!(tournament.is_active, ENotActive);
        assert!(tournament.participant_count < tournament.max_participants, ETournamentFull);
        assert!(!table::contains(&tournament.participants, participant), EAlreadyRegistered);
        assert!(coin::value(&payment) >= TOURNAMENT_ENTRY_FEE, EInsufficientPayment);

        table::add(&mut tournament.participants, participant, true);
        tournament.participant_count = tournament.participant_count + 1;
        tournament.prize_pool_mist = tournament.prize_pool_mist + TOURNAMENT_ENTRY_FEE;

        transfer::public_transfer(payment, tournament.organizer);

        event::emit(TournamentJoined {
            tournament_id: object::id(tournament),
            participant,
            entry_fee_mist: TOURNAMENT_ENTRY_FEE,
        });
    }

    public fun get_participant_count(t: &Tournament): u64 { t.participant_count }
    public fun get_prize_pool(t: &Tournament): u64 { t.prize_pool_mist }
    public fun is_registered(t: &Tournament, addr: address): bool {
        table::contains(&t.participants, addr)
    }
}