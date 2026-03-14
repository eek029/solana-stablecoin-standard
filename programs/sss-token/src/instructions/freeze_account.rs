use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Token2022};
use anchor_spl::token_interface::{Mint, TokenAccount};

use crate::state::StablecoinConfig;
use crate::utils::RbacValidator;

#[derive(Accounts)]
pub struct FreezeAccount<'info> {
    #[account(
        seeds = [b"stablecoin-config", mint.key().as_ref()],
        bump = stablecoin_config.bump,
    )]
    pub stablecoin_config: Account<'info, StablecoinConfig>,

    pub authority: Signer<'info>,

    #[account(address = stablecoin_config.mint)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Program<'info, Token2022>,
}

pub fn handler(ctx: Context<FreezeAccount>) -> Result<()> {
    RbacValidator::require_master(&ctx.accounts.stablecoin_config, &ctx.accounts.authority.key())?;

    let seeds = &[
        b"stablecoin-config",
        ctx.accounts.mint.to_account_info().key.as_ref(),
        &[ctx.accounts.stablecoin_config.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = token_2022::FreezeAccount {
        account: ctx.accounts.token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        authority: ctx.accounts.stablecoin_config.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );

    token_2022::freeze_account(cpi_ctx)?;

    msg!("✓ Account {} frozen", ctx.accounts.token_account.key());
    Ok(())
}
