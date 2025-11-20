use aztec::macros::aztec;
pub mod test;

#[aztec]
pub contract Tenochca {
    use aztec::{
        macros::{functions::{external, initializer, internal, view}, storage::storage},
        protocol_types::address::AztecAddress,
        state_vars::{DelayedPublicMutable, map::Map, PublicImmutable, PublicMutable},
    };

    #[storage]
    struct Storage<Context> {
        owner: PublicImmutable<AztecAddress, Context>,
        is_registered: Map<AztecAddress, DelayedPublicMutable<bool, REGISTERED_ARTIST_DELAY, Context>, Context>,
        registered_artists: Map<u64, PublicMutable<AztecAddress, Context>, Context>,
        total_artists: PublicMutable<u64, Context>,
        artist_totals: Map<AztecAddress, PublicMutable<Field, Context>, Context>,
    }

    /* GLOBAL VARIABLES */
    global REGISTERED_ARTIST_DELAY: u64 = 300;

    /*=========================== Constructor =========================*/
    #[external("public")]
    #[initializer]
    fn constructor(owner: AztecAddress) {
        storage.owner.initialize(owner);
        storage.total_artists.write(0);
    }

    /*=========================== External Functions =========================*/
    #[external("public")]
    fn register_profile() {
        let caller: AztecAddress = context.msg_sender().unwrap();

        let is_registered = storage.is_registered.at(caller).get_current_value();
        assert(!is_registered, "artist already registered");

        storage.is_registered.at(caller).schedule_value_change(true);

        let current_count = storage.total_artists.read();
        storage.registered_artists.at(current_count).write(caller);
        storage.total_artists.write(current_count + 1);
    }

    #[external("private")]
    fn donate(artist: AztecAddress, amount: u64) {
        assert(amount > 0, "amount must be greater than zero");

        Tenochca::at(context.this_address()).add_to_total_public(artist, amount as Field).enqueue(
            &mut context,
        );
    }

    /*=========================== Internal Functions =========================*/
    #[external("public")]
    #[internal]
    fn add_to_total_public(artist: AztecAddress, amount: Field) {
        let is_registered = storage.is_registered.at(artist).get_current_value();
        assert(is_registered, "artist not registered");

        let current_total = storage.artist_totals.at(artist).read();
        storage.artist_totals.at(artist).write(current_total + amount);
    }

    /*=========================== View Functions =========================*/
    #[external("public")]
    #[view]
    fn is_registered(artist: AztecAddress) -> bool {
        storage.is_registered.at(artist).get_current_value()
    }

    #[external("public")]
    #[view]
    fn get_total_received(artist: AztecAddress) -> Field {
        storage.artist_totals.at(artist).read()
    }

    #[external("public")]
    #[view]
    fn get_artists_count() -> u64 {
        storage.total_artists.read()
    }

    #[external("public")]
    #[view]
    fn get_artist_at_index(index: u64) -> AztecAddress {
        storage.registered_artists.at(index).read()
    }

    #[external("public")]
    #[view]
    fn get_owner() -> AztecAddress {
        storage.owner.read()
    }
}
