use anchor_lang::prelude::*;
use crate::state::StablecoinConfig;
use crate::utils::RbacValidator;

#[derive(Accounts)]
pub struct Unpause<'info> {
    #[account(
        mut,
        seeds = [b"stablecoin-config", stablecoin_config.mint.as_ref()],
        bump = stablecoin_config.bump,
    )]
    pub stablecoin_config: Account<'info, StablecoinConfig>,

    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<Unpause>) -> Result<()> {
    RbacValidator::require_master(&ctx.accounts.stablecoin_config, &ctx.accounts.authority.key())?;

    ctx.accounts.stablecoin_config.is_paused = false;

    msg!("✓ Token operations resumed");
    Ok(())
}
