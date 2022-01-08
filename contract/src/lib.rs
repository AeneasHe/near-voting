/*
 * This is an example of a Rust smart contract with two simple, symmetric functions:
 *
 * 1. set_greeting: accepts a greeting, such as "howdy", and records it for the user (account_id)
 *    who sent the request
 * 2. get_greeting: accepts an account_id and returns the greeting saved for it, defaulting to
 *    "Hello"
 *
 * Learn more about writing NEAR smart contracts with Rust:
 * https://github.com/near/near-sdk-rs
 *
 */

// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
use near_sdk::collections::UnorderedMap;

use near_sdk::{env, near_bindgen, setup_alloc};

mod types;

use types::*;

setup_alloc!();

// Structs in Rust are similar to other languages, and may include impl keyword as shown below
// Note: the names of the structs are not important when calling the smart contract, but the function names are
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Voting {
    records: LookupMap<String, String>,
    votes_received: UnorderedMap<String, u32>,
    candidate_hash: LookupMap<String, String>,
    voter_status: UnorderedMap<String, bool>,
    valid_candidates: LookupMap<String, bool>,
}

// 默认
impl Default for Voting {
    fn default() -> Self {
        Self {
            records: LookupMap::new(StorageKey::Records),
            votes_received: UnorderedMap::new(StorageKey::VotesReceived),
            candidate_hash: LookupMap::new(StorageKey::CandidateHash),
            voter_status: UnorderedMap::new(StorageKey::VoterStatus),
            valid_candidates: LookupMap::new(StorageKey::ValidCandidates),
        }
    }
}

#[near_bindgen]
impl Voting {
    pub fn set_greeting(&mut self, message: String) {
        let account_id = env::signer_account_id();

        // Use env::log to record logs permanently to the blockchain!
        env::log(format!("Saving greeting '{}' for account '{}'", message, account_id,).as_bytes());

        self.records.insert(&account_id, &message);
    }

    // `match` is similar to `switch` in other languages; here we use it to default to "Hello" if
    // self.records.get(&account_id) is not yet defined.
    // Learn more: https://doc.rust-lang.org/book/ch06-02-match.html#matching-with-optiont
    pub fn get_greeting(&self, account_id: String) -> String {
        match self.records.get(&account_id) {
            Some(greeting) => greeting,
            None => "Hello".to_string(),
        }
    }

    pub fn set_candidates(&mut self, candidate_names: Vec<String>, candidate_hashes: Vec<String>) {
        for i in 0..candidate_names.len() {
            self.valid_candidates.insert(&candidate_names[i], &true);
            self.candidate_hash
                .insert(&candidate_names[i], &candidate_hashes[i]);
        }
    }

    pub fn total_votes_for(&self, candidate: String) -> u32 {
        match self.votes_received.get(&candidate) {
            Some(votes) => votes,
            None => 0,
        }
    }

    pub fn reset_votes(&mut self) {
        self.votes_received.clear();
        self.voter_status.clear();
    }

    pub fn vote_for_candidate(&mut self, candidate: String, voter: String, signed_message: String) {
        let status = match self.voter_status.get(&voter) {
            Some(status) => status,
            None => false,
        };

        assert_eq!(status, false, "voter already voted");

        let signature = match self.candidate_hash.get(&candidate) {
            Some(hash) => hash,
            None => "".to_string(),
        };

        assert_eq!(signature, signed_message, "signed_message not true");

        let votes = match self.votes_received.get(&candidate) {
            Some(votes) => votes + 1,
            None => 1,
        };
        self.votes_received.insert(&candidate, &votes);
        self.voter_status.insert(&voter, &true);
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 *
 * To run from contract directory:
 * cargo test -- --nocapture
 *
 * From project root, to run in combination with frontend tests:
 * yarn test
 *
 */
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    // mock the context for testing, notice "signer_account_id" that was accessed above from env::
    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice_near".to_string(),
            signer_account_id: "bob_near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol_near".to_string(),
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 19,
        }
    }

    #[test]
    fn set_then_get_greeting() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = Voting::default();
        contract.set_greeting("howdy".to_string());
        assert_eq!(
            "howdy".to_string(),
            contract.get_greeting("bob_near".to_string())
        );
    }

    #[test]
    fn get_default_greeting() {
        let context = get_context(vec![], true);
        testing_env!(context);
        let contract = Voting::default();
        // this test did not call set_greeting so should return the default "Hello" greeting
        assert_eq!(
            "Hello".to_string(),
            contract.get_greeting("francis.near".to_string())
        );
    }
}
