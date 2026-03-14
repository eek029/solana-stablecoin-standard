use anchor_lang::prelude::*;
use crate::state::StablecoinConfig;
use crate::error::ErrorCode;

/// Role-Based Access Control helpers
pub struct RbacValidator;

impl RbacValidator {
    /// Check if signer is master authority
    pub fn is_master(config: &StablecoinConfig, signer: &Pubkey) -> bool {
        config.master_authority == *signer
    }

    /// Require master authority
    pub fn require_master(config: &StablecoinConfig, signer: &Pubkey) -> Result<()> {
        require!(
            Self::is_master(config, signer),
            ErrorCode::InvalidMinter // Generic error, can be specialized
        );
        Ok(())
    }

    /// Check if token is not paused
    pub fn require_not_paused(config: &StablecoinConfig) -> Result<()> {
        require!(!config.is_paused, ErrorCode::TokenPaused);
        Ok(())
    }
}

/// Validation helpers
pub struct Validator;

impl Validator {
    pub fn validate_name(name: &str) -> Result<()> {
        require!(name.len() <= 64, ErrorCode::NameTooLong);
        Ok(())
    }

    pub fn validate_symbol(symbol: &str) -> Result<()> {
        require!(symbol.len() <= 16, ErrorCode::SymbolTooLong);
        Ok(())
    }

    pub fn validate_uri(uri: &str) -> Result<()> {
        require!(uri.len() <= 200, ErrorCode::UriTooLong);
        Ok(())
    }

    pub fn validate_decimals(decimals: u8) -> Result<()> {
        require!(decimals <= 9, ErrorCode::InvalidDecimals);
        Ok(())
    }

    pub fn validate_blacklist_reason(reason: &str) -> Result<()> {
        require!(reason.len() <= 200, ErrorCode::BlacklistReasonTooLong);
        Ok(())
    }
}

/// Math helpers with overflow protection
pub struct SafeMath;

impl SafeMath {
    pub fn add(a: u64, b: u64) -> Result<u64> {
        a.checked_add(b).ok_or(ErrorCode::Overflow.into())
    }

    pub fn sub(a: u64, b: u64) -> Result<u64> {
        a.checked_sub(b).ok_or(ErrorCode::Underflow.into())
    }
}
