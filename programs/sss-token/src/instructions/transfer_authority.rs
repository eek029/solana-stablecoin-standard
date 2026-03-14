use anchor_lang::prelude::*;
use crate::state::StablecoinConfig;
use crate::utils::RbacValidator;

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    #[account(
        mut,
        seeds = [b"stablecoin-config", stablecoin_config.mint.as_ref()],
        bump = stablecoin_config.bump,
    )]
    pub stablecoin_config: Account<'info, StablecoinConfig>,

    pub current_authority: Signer<'info>,

    /// CHECK: New authority public key
    pub new_authority: AccountInfo<'info>,
}

pub fn handler(ctx: Context<TransferAuthority>, new_authority: Pubkey) -> Result<()> {
    RbacValidator::require_master(&ctx.accounts.stablecoin_config, &ctx.accounts.current_authority.key())?;

    let old_authority = ctx.accounts.stablecoin_config.master_authority;
    ctx.accounts.stablecoin_config.master_authority = new_authority;

    msg!("✓ Authority transferred from {} to {}", old_authority, new_authority);
    Ok(())
}
