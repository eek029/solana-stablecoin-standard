use anchor_lang::prelude::*;
use crate::state::{StablecoinConfig, MinterConfig};
use crate::utils::RbacValidator;

#[derive(Accounts)]
pub struct UpdateMinter<'info> {
    #[account(
        seeds = [b"stablecoin-config", stablecoin_config.mint.as_ref()],
        bump = stablecoin_config.bump,
    )]
    pub stablecoin_config: Account<'info, StablecoinConfig>,

    #[account(mut)]
    pub master_authority: Signer<'info>,

    #[account(
        init_if_needed,
        payer = master_authority,
        space = MinterConfig::space(),
        seeds = [b"minter", stablecoin_config.key().as_ref(), new_minter_address.key().as_ref()],
        bump
    )]
    pub minter_config: Account<'info, MinterConfig>,

    /// CHECK: New minter public key
    pub new_minter_address: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UpdateMinter>, new_minter: Pubkey, quota: u64) -> Result<()> {
    RbacValidator::require_master(&ctx.accounts.stablecoin_config, &ctx.accounts.master_authority.key())?;

    let config = &mut ctx.accounts.minter_config;
    config.stablecoin_config = ctx.accounts.stablecoin_config.key();
    config.minter = new_minter;
    config.quota = quota;
    config.minted = 0;
    config.bump = ctx.bumps.minter_config;

    msg!("✓ Minter {} configured with quota {}", new_minter, quota);
    Ok(())
}
