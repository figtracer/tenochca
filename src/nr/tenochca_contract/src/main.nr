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
        registered_artists: Map<AztecAddress, DelayedPublicMutable<bool, REGISTERED_ARTIST_DELAY, Context>, Context>,
        artist_totals: Map<AztecAddress, PublicMutable<Field, Context>, Context>,
    }

    /* GLOBAL VARIABLES */
    global REGISTERED_ARTIST_DELAY: u64 = 0;

    #[external("public")]
    #[initializer]
    fn constructor(owner: AztecAddress) {
        storage.owner.initialize(owner);
    }

    #[external("public")]
    fn register_profile() {
        let caller: AztecAddress = context.msg_sender().unwrap();

        let is_registered = storage.registered_artists.at(caller).get_current_value();

        assert(!is_registered, "artist already registered");

        storage.registered_artists.at(caller).schedule_value_change(true);
    }

    #[external("private")]
    fn donate(artist: AztecAddress, amount: u64) {
        assert(amount > 0, "amount must be greater than zero");

        Tenochca::at(context.this_address()).add_to_total_public(artist, amount as Field).enqueue(
            &mut context,
        );
    }

    #[external("public")]
    #[internal]
    fn add_to_total_public(artist: AztecAddress, amount: Field) {
        let is_registered = storage.registered_artists.at(artist).get_current_value();
        assert(is_registered, "artist not registered");

        let current_total = storage.artist_totals.at(artist).read();
        storage.artist_totals.at(artist).write(current_total + amount);
    }

    #[external("public")]
    #[view]
    fn get_total_received(artist: AztecAddress) -> Field {
        storage.artist_totals.at(artist).read()
    }

    #[external("public")]
    #[view]
    fn is_registered(artist: AztecAddress) -> bool {
        storage.registered_artists.at(artist).get_current_value()
    }

    #[external("public")]
    #[view]
    fn get_owner() -> AztecAddress {
        storage.owner.read()
    }
}
