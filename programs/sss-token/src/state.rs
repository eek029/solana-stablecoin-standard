use anchor_lang::prelude::*;

/// Configuration PDA for the stablecoin
/// Seeds: ["stablecoin-config", mint.key()]
#[account]
#[derive(Debug)]
pub struct StablecoinConfig {
    /// Master authority (can perform all operations)
    pub master_authority: Pubkey,
    
    /// Mint address
    pub mint: Pubkey,
    
    /// Token name
    pub name: String,
    
    /// Token symbol
    pub symbol: String,
    
    /// Metadata URI
    pub uri: String,
    
    /// Decimals
    pub decimals: u8,
    
    /// Enable permanent delegate (required for SSS-2 seize)
    pub enable_permanent_delegate: bool,
    
    /// Enable transfer hook (required for SSS-2 blacklist enforcement)
    pub enable_transfer_hook: bool,
    
    /// Default state for new accounts (true = frozen by default)
    pub default_account_frozen: bool,
    
    /// Is the token currently paused?
    pub is_paused: bool,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl StablecoinConfig {
    /// Calculate space needed for the account
    pub const fn space() -> usize {
        8 + // discriminator
        32 + // master_authority
        32 + // mint
        4 + 64 + // name (String with max 64 chars)
        4 + 16 + // symbol (String with max 16 chars)
        4 + 200 + // uri (String with max 200 chars)
        1 + // decimals
        1 + // enable_permanent_delegate
        1 + // enable_transfer_hook
        1 + // default_account_frozen
        1 + // is_paused
        1 + // bump
        64 // padding for future extensions
    }

    /// Check if this is SSS-1 (minimal) preset
    pub fn is_sss1(&self) -> bool {
        !self.enable_transfer_hook && !self.enable_permanent_delegate
    }

    /// Check if this is SSS-2 (compliant) preset
    pub fn is_sss2(&self) -> bool {
        self.enable_transfer_hook && self.enable_permanent_delegate
    }

    /// Validate that SSS-2 features are enabled before executing compliance instructions
    pub fn require_sss2(&self) -> Result<()> {
        require!(
            self.is_sss2(),
            crate::error::ErrorCode::SSS2NotEnabled
        );
        Ok(())
    }
}

/// Minter authority with quota tracking
/// Seeds: ["minter", stablecoin_config.key(), minter_authority.key()]
#[account]
#[derive(Debug)]
pub struct MinterConfig {
    /// The stablecoin config this minter belongs to
    pub stablecoin_config: Pubkey,
    
    /// Minter authority
    pub minter: Pubkey,
    
    /// Maximum amount this minter can mint
    pub quota: u64,
    
    /// Amount already minted by this minter
    pub minted: u64,
    
    /// Bump seed
    pub bump: u8,
}

impl MinterConfig {
    pub const fn space() -> usize {
        8 + // discriminator
        32 + // stablecoin_config
        32 + // minter
        8 + // quota
        8 + // minted
        1 + // bump
        16 // padding
    }

    /// Check if minter has quota available
    pub fn has_quota(&self, amount: u64) -> bool {
        self.minted.saturating_add(amount) <= self.quota
    }

    /// Update minted amount
    pub fn add_minted(&mut self, amount: u64) -> Result<()> {
        require!(
            self.has_quota(amount),
            crate::error::ErrorCode::MinterQuotaExceeded
        );
        self.minted = self.minted.saturating_add(amount);
        Ok(())
    }
}

/// Blacklist entry for SSS-2 compliance
/// Seeds: ["blacklist", stablecoin_config.key(), address.key()]
#[account]
#[derive(Debug)]
pub struct BlacklistEntry {
    /// The stablecoin config this entry belongs to
    pub stablecoin_config: Pubkey,
    
    /// Blacklisted address
    pub address: Pubkey,
    
    /// Reason for blacklisting
    pub reason: String,
    
    /// Timestamp when blacklisted
    pub timestamp: i64,
    
    /// Authority who blacklisted
    pub blacklister: Pubkey,
    
    /// Bump seed
    pub bump: u8,
}

impl BlacklistEntry {
    pub const fn space() -> usize {
        8 + // discriminator
        32 + // stablecoin_config
        32 + // address
        4 + 200 + // reason (String with max 200 chars)
        8 + // timestamp
        32 + // blacklister
        1 + // bump
        16 // padding
    }
}

/// Initialize parameters
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct InitializeParams {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
    pub enable_permanent_delegate: bool,
    pub enable_transfer_hook: bool,
    pub default_account_frozen: bool,
}

impl InitializeParams {
    /// Detect preset type
    pub fn preset_name(&self) -> &str {
        if self.enable_transfer_hook && self.enable_permanent_delegate {
            "SSS-2 (Compliant)"
        } else if !self.enable_transfer_hook && !self.enable_permanent_delegate {
            "SSS-1 (Minimal)"
        } else {
            "Custom"
        }
    }
}
