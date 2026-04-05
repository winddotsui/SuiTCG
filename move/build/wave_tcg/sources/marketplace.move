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
    const ENotOwner: u64 = 4;
    const EInvalidPrice: u64 = 5;
    const PLATFORM_FEE_BPS: u64 = 100;
    const TOURNAMENT_ENTRY_FEE: u64 = 10_000_000_000;

    public struct MarketplaceRegistry has key {
        id: UID,
        platform_wallet: address,
        total_listings: u64,
    }

    public struct Listing has key, store {
        id: UID,
        listing_id: u64,
        seller: address,
        card_name: String,
        game: String,
        condition: String,
        price_mist: u64,
        image_url: String,
        is_active: bool,
    }

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

    public struct ListingCreated has copy, drop {
        listing_id: u64,
        seller: address,
        card_name: String,
        game: String,
        price_mist: u64,
    }

    public struct ListingSold has copy, drop {
        listing_id: u64,
        seller: address,
        buyer: address,
        price_mist: u64,
    }

    public struct TournamentJoined has copy, drop {
        tournament_id: ID,
        participant: address,
        entry_fee_mist: u64,
    }

    fun init(ctx: &mut TxContext) {
        let registry = MarketplaceRegistry {
            id: object::new(ctx),
            platform_wallet: tx_context::sender(ctx),
            total_listings: 0,
        };
        transfer::share_object(registry);
    }

    public fun create_listing(
        registry: &mut MarketplaceRegistry,
        card_name: vector<u8>,
        game: vector<u8>,
        condition: vector<u8>,
        price_mist: u64,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(price_mist > 0, EInvalidPrice);
        registry.total_listings = registry.total_listings + 1;
        let listing = Listing {
            id: object::new(ctx),
            listing_id: registry.total_listings,
            seller: tx_context::sender(ctx),
            card_name: string::utf8(card_name),
            game: string::utf8(game),
            condition: string::utf8(condition),
            price_mist,
            image_url: string::utf8(image_url),
            is_active: true,
        };
        event::emit(ListingCreated {
            listing_id: registry.total_listings,
            seller: tx_context::sender(ctx),
            card_name: string::utf8(card_name),
            game: string::utf8(game),
            price_mist,
        });
        transfer::share_object(listing);
    }

    public fun buy_listing(
        registry: &mut MarketplaceRegistry,
        listing: &mut Listing,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(listing.is_active, ENotActive);
        assert!(coin::value(&payment) >= listing.price_mist, EInsufficientPayment);
        let fee = (listing.price_mist * PLATFORM_FEE_BPS) / 10_000;
        let seller_amount = listing.price_mist - fee;
        listing.is_active = false;
        let buyer = tx_context::sender(ctx);
        let mut payment_mut = payment;
        let fee_coin = coin::split(&mut payment_mut, fee, ctx);
        let seller_coin = coin::split(&mut payment_mut, seller_amount, ctx);
        transfer::public_transfer(fee_coin, registry.platform_wallet);
        transfer::public_transfer(seller_coin, listing.seller);
        transfer::public_transfer(payment_mut, buyer);
        event::emit(ListingSold {
            listing_id: listing.listing_id,
            seller: listing.seller,
            buyer,
            price_mist: listing.price_mist,
        });
    }

    public fun create_tournament(
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

    public fun join_tournament(
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

    public fun cancel_listing(
        listing: &mut Listing,
        ctx: &mut TxContext
    ) {
        assert!(listing.seller == tx_context::sender(ctx), 4);
        assert!(listing.is_active, ENotActive);
        listing.is_active = false;
    }

    public fun edit_listing(
        listing: &mut Listing,
        new_price_mist: u64,
        ctx: &mut TxContext
    ) {
        assert!(listing.seller == tx_context::sender(ctx), 4);
        assert!(listing.is_active, ENotActive);
        assert!(new_price_mist > 0, EInvalidPrice);
        listing.price_mist = new_price_mist;
    }

    public struct Offer has key {
        id: UID,
        listing_id: ID,
        buyer: address,
        seller: address,
        offer_mist: u64,
        payment: Coin<SUI>,
        is_active: bool,
        expires_epoch: u64,
    }

    public struct OfferMade has copy, drop {
        offer_id: ID,
        listing_id: ID,
        buyer: address,
        seller: address,
        offer_mist: u64,
    }

    public struct OfferAccepted has copy, drop {
        offer_id: ID,
        buyer: address,
        seller: address,
        offer_mist: u64,
    }

    public struct OfferCancelled has copy, drop {
        offer_id: ID,
        buyer: address,
    }

    public fun make_offer(
        listing: &Listing,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(listing.is_active, ENotActive);
        assert!(coin::value(&payment) > 0, EInvalidPrice);
        let buyer = tx_context::sender(ctx);
        assert!(buyer != listing.seller, ENotOwner);

        let offer = Offer {
            id: object::new(ctx),
            listing_id: object::id(listing),
            buyer,
            seller: listing.seller,
            offer_mist: coin::value(&payment),
            payment,
            is_active: true,
            expires_epoch: tx_context::epoch(ctx) + 7,
        };

        event::emit(OfferMade {
            offer_id: object::id(&offer),
            listing_id: object::id(listing),
            buyer,
            seller: listing.seller,
            offer_mist: coin::value(&offer.payment),
        });

        transfer::share_object(offer);
    }

    public fun accept_offer(
        registry: &MarketplaceRegistry,
        offer: &mut Offer,
        ctx: &mut TxContext
    ) {
        assert!(offer.seller == tx_context::sender(ctx), ENotOwner);
        assert!(offer.is_active, ENotActive);

        offer.is_active = false;
        let fee = (offer.offer_mist * PLATFORM_FEE_BPS) / 10_000;
        let seller_amount = offer.offer_mist - fee;

        let fee_coin = coin::split(&mut offer.payment, fee, ctx);
        let seller_coin = coin::split(&mut offer.payment, seller_amount, ctx);

        transfer::public_transfer(fee_coin, registry.platform_wallet);
        transfer::public_transfer(seller_coin, offer.seller);

        event::emit(OfferAccepted {
            offer_id: object::id(offer),
            buyer: offer.buyer,
            seller: offer.seller,
            offer_mist: offer.offer_mist,
        });
    }

    public fun cancel_offer(
        offer: &mut Offer,
        ctx: &mut TxContext
    ) {
        assert!(offer.buyer == tx_context::sender(ctx), ENotOwner);
        assert!(offer.is_active, ENotActive);

        offer.is_active = false;
        let amount = coin::value(&offer.payment);
        let refund = coin::split(&mut offer.payment, amount, ctx);
        transfer::public_transfer(refund, offer.buyer);

        event::emit(OfferCancelled {
            offer_id: object::id(offer),
            buyer: offer.buyer,
        });
    }

}