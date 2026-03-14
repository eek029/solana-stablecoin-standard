use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Token2022};
use anchor_spl::token_interface::{Mint, TokenAccount};
use anchor_spl::token_2022::TransferChecked;

use crate::state::{StablecoinConfig, BlacklistEntry};
use crate::utils::RbacValidator;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct Seize<'info> {
    #[account(
        seeds = [b"stablecoin-config", mint_account.key().as_ref()],
        bump = stablecoin_config.bump,
    )]
    pub stablecoin_config: Account<'info, StablecoinConfig>,

    pub seizer: Signer<'info>,

    #[account(address = stablecoin_config.mint)]
    pub mint_account: Box<InterfaceAccount<'info, Mint>>,

    /// Account to seize from (must be blacklisted)
    #[account(mut)]
    pub source: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Blacklist entry proving the account is blacklisted
    #[account(
        seeds = [b"blacklist", stablecoin_config.key().as_ref(), source.owner.as_ref()],
        bump = blacklist_entry.bump,
    )]
    pub blacklist_entry: Account<'info, BlacklistEntry>,

    /// Treasury account to receive seized tokens
    #[account(mut)]
    pub treasury: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Program<'info, Token2022>,
}

pub fn handler(ctx: Context<Seize>, amount: u64) -> Result<()> {
    // SSS-2 required
    ctx.accounts.stablecoin_config.require_sss2()?;

    RbacValidator::require_master(&ctx.accounts.stablecoin_config, &ctx.accounts.seizer.key())?;

    // Verify account is actually blacklisted
    require!(
        ctx.accounts.blacklist_entry.address == ctx.accounts.source.owner,
        ErrorCode::NotBlacklisted
    );

    // Transfer via permanent delegate authority (config PDA)
    let mint_key = ctx.accounts.mint_account.key();
    let seeds = &[
        b"stablecoin-config",
        mint_key.as_ref(),
        &[ctx.accounts.stablecoin_config.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let decimals = ctx.accounts.mint_account.decimals;
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.source.to_account_info(),
        mint: ctx.accounts.mint_account.to_account_info(),
        to: ctx.accounts.treasury.to_account_info(),
        authority: ctx.accounts.stablecoin_config.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );

    token_2022::transfer_checked(cpi_ctx, amount, decimals)?;

    msg!("✓ Seized {} tokens from {} to treasury", 
        amount, 
        ctx.accounts.source.key()
    );

    Ok(())
}
