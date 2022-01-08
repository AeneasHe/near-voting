use near_sdk::borsh::{self, BorshSerialize};
use near_sdk::BorshStorageKey;

/**for stablepool */
#[derive(BorshStorageKey, BorshSerialize)]
pub(crate) enum StorageKey {
    Records,
    VotesReceived,
    CandidateHash,
    VoterStatus,
    ValidCandidates,
}
