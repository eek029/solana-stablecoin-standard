use anchor_lang::prelude::*;
use crate::state::{StablecoinConfig, BlacklistEntry};
use crate::utils::RbacValidator;

#[derive(Accounts)]
pub struct RemoveFromBlacklist<'info> {
    #[account(
        seeds = [b"stablecoin-config", stablecoin_config.mint.as_ref()],
        bump = stablecoin_config.bump,
    )]
    pub stablecoin_config: Account<'info, StablecoinConfig>,

    #[account(mut)]
    pub blacklister: Signer<'info>,

    #[account(
        mut,
        close = blacklister,
        seeds = [b"blacklist", stablecoin_config.key().as_ref(), address.key().as_ref()],
        bump = blacklist_entry.bump,
    )]
    pub blacklist_entry: Account<'info, BlacklistEntry>,

    /// CHECK: Address to remove from blacklist
    pub address: AccountInfo<'info>,
}

pub fn handler(ctx: Context<RemoveFromBlacklist>) -> Result<()> {
    // SSS-2 required
    ctx.accounts.stablecoin_config.require_sss2()?;

    RbacValidator::require_master(&ctx.accounts.stablecoin_config, &ctx.accounts.blacklister.key())?;

    msg!("✓ Address {} removed from blacklist", ctx.accounts.address.key());
    Ok(())
}
