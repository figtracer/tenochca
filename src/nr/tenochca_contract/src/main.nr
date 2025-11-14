use aztec::macros::aztec;
pub mod test;

#[aztec]
pub contract Tenochca {
    use aztec::{
        macros::{functions::{external, initializer, internal, view}, storage::storage},
        protocol_types::address::AztecAddress,
        state_vars::{PublicImmutable, PublicMutable},
    };

    #[storage]
    struct Storage<Context> {}

    #[external("public")]
    #[initializer]
    fn constructor(owner: AztecAddress) {}

}
