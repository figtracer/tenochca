use crate::{Tenochca, test::utils};

#[test]
unconstrained fn registers_artist_profile() {
    let (mut env, contract_address, artist, _) = utils::setup_contract(false);
    env.call_public(artist, Tenochca::at(contract_address).register_profile());

    env.advance_next_block_timestamp_by(300);

    let is_registered = env.view_public(Tenochca::at(contract_address).is_registered(artist));
    assert(is_registered, "artist should be registered");
}

#[test]
unconstrained fn donation_updates_total_received() {
    let (mut env, contract_address, artist, fan) = utils::setup_contract(false);
    let donation_amount: u64 = 10;
    let expected_total: Field = donation_amount as Field;

    env.call_public(artist, Tenochca::at(contract_address).register_profile());

    env.advance_next_block_timestamp_by(300);

    env.call_private(fan, Tenochca::at(contract_address).donate(artist, donation_amount));

    let total = env.view_public(Tenochca::at(contract_address).get_total_received(artist));
    assert(total == expected_total, f"expected total to equal {expected_total} but got {total}");
}

#[test]
unconstrained fn total_artists_count() {
    let (mut env, contract_address, artist, _) = utils::setup_contract(false);
    let expected_count: u64 = 1;

    env.call_public(artist, Tenochca::at(contract_address).register_profile());

    env.advance_next_block_timestamp_by(300);

    let count = env.view_public(Tenochca::at(contract_address).get_artists_count());
    assert(count == expected_count, f"expected count to equal {expected_count} but got {count}");
}

#[test]
unconstrained fn initial_artists_count_is_zero() {
    let (mut env, contract_address, _, _) = utils::setup_contract(false);
    let expected_count: u64 = 0;

    let count = env.view_public(Tenochca::at(contract_address).get_artists_count());
    assert(
        count == expected_count,
        f"expected initial count to equal {expected_count} but got {count}",
    );
}

#[test(should_fail_with = "artist already registered")]
unconstrained fn rejects_duplicate_registration() {
    let (mut env, contract_address, artist, _) = utils::setup_contract(false);

    env.call_public(artist, Tenochca::at(contract_address).register_profile());
    env.advance_next_block_timestamp_by(300);

    // Attempt to register again - should fail
    env.call_public(artist, Tenochca::at(contract_address).register_profile());
}

#[test]
unconstrained fn gets_owner() {
    let (mut env, contract_address, owner, _) = utils::setup_contract(false);

    let contract_owner = env.view_public(Tenochca::at(contract_address).get_owner());
    assert(contract_owner == owner, "owner should match");
}

#[test]
unconstrained fn gets_artist_at_index() {
    let (mut env, contract_address, artist, _) = utils::setup_contract(false);

    env.call_public(artist, Tenochca::at(contract_address).register_profile());
    env.advance_next_block_timestamp_by(300);

    let artist_at_index = env.view_public(Tenochca::at(contract_address).get_artist_at_index(0));
    assert(artist_at_index == artist, "artist at index 0 should match registered artist");
}

#[test]
unconstrained fn multiple_artists_registration() {
    let (mut env, contract_address, artist1, artist2) = utils::setup_contract(false);
    let artist3 = env.create_light_account();
    let expected_count: u64 = 3;

    env.call_public(artist1, Tenochca::at(contract_address).register_profile());
    env.call_public(artist2, Tenochca::at(contract_address).register_profile());
    env.call_public(artist3, Tenochca::at(contract_address).register_profile());

    env.advance_next_block_timestamp_by(300);

    let count = env.view_public(Tenochca::at(contract_address).get_artists_count());
    assert(count == expected_count, f"expected count to equal {expected_count} but got {count}");

    // Verify all artists are registered
    let is_registered1 = env.view_public(Tenochca::at(contract_address).is_registered(artist1));
    let is_registered2 = env.view_public(Tenochca::at(contract_address).is_registered(artist2));
    let is_registered3 = env.view_public(Tenochca::at(contract_address).is_registered(artist3));

    assert(is_registered1, "artist1 should be registered");
    assert(is_registered2, "artist2 should be registered");
    assert(is_registered3, "artist3 should be registered");

    // Verify artists are stored at correct indices
    let artist_at_0 = env.view_public(Tenochca::at(contract_address).get_artist_at_index(0));
    let artist_at_1 = env.view_public(Tenochca::at(contract_address).get_artist_at_index(1));
    let artist_at_2 = env.view_public(Tenochca::at(contract_address).get_artist_at_index(2));

    assert(artist_at_0 == artist1, "artist at index 0 should be artist1");
    assert(artist_at_1 == artist2, "artist at index 1 should be artist2");
    assert(artist_at_2 == artist3, "artist at index 2 should be artist3");
}

#[test]
unconstrained fn multiple_donations_to_same_artist() {
    let (mut env, contract_address, artist, fan) = utils::setup_contract(false);
    let donation1: u64 = 10;
    let donation2: u64 = 20;
    let donation3: u64 = 5;
    let expected_total: Field = (donation1 + donation2 + donation3) as Field;

    env.call_public(artist, Tenochca::at(contract_address).register_profile());
    env.advance_next_block_timestamp_by(300);

    env.call_private(fan, Tenochca::at(contract_address).donate(artist, donation1));
    env.call_private(fan, Tenochca::at(contract_address).donate(artist, donation2));
    env.call_private(fan, Tenochca::at(contract_address).donate(artist, donation3));

    let total = env.view_public(Tenochca::at(contract_address).get_total_received(artist));
    assert(total == expected_total, f"expected total to equal {expected_total} but got {total}");
}

#[test(should_fail_with = "artist not registered")]
unconstrained fn rejects_donation_to_unregistered_artist() {
    let (mut env, contract_address, artist, fan) = utils::setup_contract(false);
    let donation_amount: u64 = 10;

    env.call_private(fan, Tenochca::at(contract_address).donate(artist, donation_amount));
}

#[test(should_fail_with = "amount must be greater than zero")]
unconstrained fn rejects_zero_amount_donation() {
    let (mut env, contract_address, artist, fan) = utils::setup_contract(false);
    let zero_amount: u64 = 0;

    env.call_public(artist, Tenochca::at(contract_address).register_profile());
    env.advance_next_block_timestamp_by(300);

    env.call_private(fan, Tenochca::at(contract_address).donate(artist, zero_amount));
}

#[test]
unconstrained fn artist_not_registered_before_delay() {
    let (mut env, contract_address, artist, _) = utils::setup_contract(false);

    env.call_public(artist, Tenochca::at(contract_address).register_profile());

    // Check before delay - should not be registered yet
    let is_registered = env.view_public(Tenochca::at(contract_address).is_registered(artist));
    assert(!is_registered, "artist should not be registered before delay");
}

#[test]
unconstrained fn unregistered_artist_has_zero_total() {
    let (mut env, contract_address, artist, _) = utils::setup_contract(false);
    let expected_total: Field = 0;

    let total = env.view_public(Tenochca::at(contract_address).get_total_received(artist));
    assert(
        total == expected_total,
        f"unregistered artist should have total {expected_total} but got {total}",
    );
}

#[test]
unconstrained fn multiple_donations_to_different_artists() {
    let (mut env, contract_address, artist1, fan) = utils::setup_contract(false);
    let artist2 = env.create_light_account();
    let donation_amount: u64 = 15;
    let expected_total: Field = donation_amount as Field;

    env.call_public(artist1, Tenochca::at(contract_address).register_profile());
    env.call_public(artist2, Tenochca::at(contract_address).register_profile());
    env.advance_next_block_timestamp_by(300);

    env.call_private(fan, Tenochca::at(contract_address).donate(artist1, donation_amount));
    env.call_private(fan, Tenochca::at(contract_address).donate(artist2, donation_amount));

    let total1 = env.view_public(Tenochca::at(contract_address).get_total_received(artist1));
    let total2 = env.view_public(Tenochca::at(contract_address).get_total_received(artist2));

    assert(
        total1 == expected_total,
        f"artist1 should have total {expected_total} but got {total1}",
    );
    assert(
        total2 == expected_total,
        f"artist2 should have total {expected_total} but got {total2}",
    );
}
