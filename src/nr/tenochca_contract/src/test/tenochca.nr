use crate::{Tenochca, test::utils};

#[test]
unconstrained fn registers_artist_profile() {
    let (mut env, contract_address, artist, _) = utils::setup_contract(false);
    env.call_public(artist, Tenochca::at(contract_address).register_profile());

    let is_registered = env.view_public(Tenochca::at(contract_address).is_registered(artist));
    assert(is_registered, "artist should be registered");
}

#[test]
unconstrained fn donation_updates_total_received() {
    let (mut env, contract_address, artist, fan) = utils::setup_contract(false);
    let donation_amount: u64 = 10;
    let expected_total: Field = donation_amount as Field;

    env.call_public(artist, Tenochca::at(contract_address).register_profile());
    env.call_private(fan, Tenochca::at(contract_address).donate(artist, donation_amount));

    let total = env.view_public(Tenochca::at(contract_address).get_total_received(artist));
    assert(total == expected_total, f"expected total to equal {expected_total} but got {total}");
}
