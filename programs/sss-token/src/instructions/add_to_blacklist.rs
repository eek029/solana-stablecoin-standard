use anchor_lang::prelude::*;
use crate::state::{StablecoinConfig, BlacklistEntry};
use crate::utils::{RbacValidator, Validator};

#[derive(Accounts)]
pub struct AddToBlacklist<'info> {
    #[account(
        seeds = [b"stablecoin-config", stablecoin_config.mint.as_ref()],
        bump = stablecoin_config.bump,
    )]
    pub stablecoin_config: Account<'info, StablecoinConfig>,

    #[account(mut)]
    pub blacklister: Signer<'info>,

    #[account(
        init,
        payer = blacklister,
        space = BlacklistEntry::space(),
        seeds = [b"blacklist", stablecoin_config.key().as_ref(), address.key().as_ref()],
        bump
    )]
    pub blacklist_entry: Account<'info, BlacklistEntry>,

    /// CHECK: Address to blacklist
    pub address: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<AddToBlacklist>, reason: String) -> Result<()> {
    // SSS-2 required
    ctx.accounts.stablecoin_config.require_sss2()?;

    RbacValidator::require_master(&ctx.accounts.stablecoin_config, &ctx.accounts.blacklister.key())?;
    Validator::validate_blacklist_reason(&reason)?;

    let entry = &mut ctx.accounts.blacklist_entry;
    entry.stablecoin_config = ctx.accounts.stablecoin_config.key();
    entry.address = ctx.accounts.address.key();
    entry.reason = reason.clone();
    entry.timestamp = Clock::get()?.unix_timestamp;
    entry.blacklister = ctx.accounts.blacklister.key();
    entry.bump = ctx.bumps.blacklist_entry;

    msg!("✓ Address {} blacklisted: {}", ctx.accounts.address.key(), reason);
    Ok(())
}
