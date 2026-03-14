use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;
use state::*;

declare_id!("8YkrKuinMsuBwds8zU2unhSvV2oYqjgXyp2TCiTLYPiy");

#[program]
pub mod sss_token {
    use super::*;

    /// Initialize a new stablecoin with SSS-1 or SSS-2 preset
    pub fn initialize(
        ctx: Context<Initialize>,
        params: InitializeParams,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, params)
    }

    /// Mint tokens to a destination account
    pub fn mint(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        instructions::mint::handler(ctx, amount)
    }

    /// Burn tokens from an account
    pub fn burn(
        ctx: Context<BurnTokens>,
        amount: u64,
    ) -> Result<()> {
        instructions::burn::handler(ctx, amount)
    }

    /// Freeze an account (prevent transfers)
    pub fn freeze_account(
        ctx: Context<FreezeAccount>,
    ) -> Result<()> {
        instructions::freeze_account::handler(ctx)
    }

    /// Thaw a frozen account (allow transfers)
    pub fn thaw_account(
        ctx: Context<ThawAccount>,
    ) -> Result<()> {
        instructions::thaw_account::handler(ctx)
    }

    /// Pause all token operations
    pub fn pause(
        ctx: Context<Pause>,
    ) -> Result<()> {
        instructions::pause::handler(ctx)
    }

    /// Unpause token operations
    pub fn unpause(
        ctx: Context<Unpause>,
    ) -> Result<()> {
        instructions::unpause::handler(ctx)
    }

    /// Update minter authority and quota
    pub fn update_minter(
        ctx: Context<UpdateMinter>,
        new_minter: Pubkey,
        quota: u64,
    ) -> Result<()> {
        instructions::update_minter::handler(ctx, new_minter, quota)
    }

    /// Transfer master authority to a new address
    pub fn transfer_authority(
        ctx: Context<TransferAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        instructions::transfer_authority::handler(ctx, new_authority)
    }

    // ========== SSS-2 ONLY (Compliance) ==========

    /// Add an address to the blacklist (SSS-2 only)
    pub fn add_to_blacklist(
        ctx: Context<AddToBlacklist>,
        reason: String,
    ) -> Result<()> {
        instructions::add_to_blacklist::handler(ctx, reason)
    }

    /// Remove an address from the blacklist (SSS-2 only)
    pub fn remove_from_blacklist(
        ctx: Context<RemoveFromBlacklist>,
    ) -> Result<()> {
        instructions::remove_from_blacklist::handler(ctx)
    }

    /// Seize tokens from a blacklisted account (SSS-2 only)
    pub fn seize(
        ctx: Context<Seize>,
        amount: u64,
    ) -> Result<()> {
        instructions::seize::handler(ctx, amount)
    }
}
