use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Token2022};
use anchor_spl::token_interface::{Mint, TokenAccount};
use anchor_spl::token_2022::Burn as BurnCpi;

use crate::state::StablecoinConfig;
use crate::utils::RbacValidator;

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(
        seeds = [b"stablecoin-config", mint_account.key().as_ref()],
        bump = stablecoin_config.bump,
    )]
    pub stablecoin_config: Account<'info, StablecoinConfig>,

    pub burner: Signer<'info>,

    #[account(
        mut,
        address = stablecoin_config.mint
    )]
    pub mint_account: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub source: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Program<'info, Token2022>,
}

pub fn handler(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
    RbacValidator::require_not_paused(&ctx.accounts.stablecoin_config)?;

    let cpi_accounts = BurnCpi {
        mint: ctx.accounts.mint_account.to_account_info(),
        from: ctx.accounts.source.to_account_info(),
        authority: ctx.accounts.burner.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
    );

    token_2022::burn(cpi_ctx, amount)?;

    msg!("✓ Burned {} tokens", amount);
    Ok(())
}
