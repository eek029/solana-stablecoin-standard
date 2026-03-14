use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Stablecoin is currently paused. No operations allowed.")]
    TokenPaused,

    #[msg("SSS-2 features (transfer hook and permanent delegate) must be enabled for compliance operations.")]
    SSS2NotEnabled,

    #[msg("Minter quota exceeded. Cannot mint more than allocated amount.")]
    MinterQuotaExceeded,

    #[msg("Invalid minter authority. This address is not authorized to mint.")]
    InvalidMinter,

    #[msg("Invalid blacklister authority. This address is not authorized to manage blacklist.")]
    InvalidBlacklister,

    #[msg("Invalid pauser authority. This address is not authorized to pause/unpause.")]
    InvalidPauser,

    #[msg("Invalid seizer authority. This address is not authorized to seize funds.")]
    InvalidSeizer,

    #[msg("Account is not blacklisted. Cannot perform blacklist-specific operations.")]
    NotBlacklisted,

    #[msg("Account is already blacklisted.")]
    AlreadyBlacklisted,

    #[msg("Name too long. Maximum 64 characters.")]
    NameTooLong,

    #[msg("Symbol too long. Maximum 16 characters.")]
    SymbolTooLong,

    #[msg("URI too long. Maximum 200 characters.")]
    UriTooLong,

    #[msg("Blacklist reason too long. Maximum 200 characters.")]
    BlacklistReasonTooLong,

    #[msg("Invalid decimals. Must be between 0 and 9.")]
    InvalidDecimals,

    #[msg("Arithmetic overflow detected.")]
    Overflow,

    #[msg("Arithmetic underflow detected.")]
    Underflow,
}
