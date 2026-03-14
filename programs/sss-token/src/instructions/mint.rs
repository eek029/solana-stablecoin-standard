use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Token2022, MintTo};
use anchor_spl::token_interface::{Mint, TokenAccount};

use crate::state::{StablecoinConfig, MinterConfig};
use crate::utils::RbacValidator;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct MintTokens<'info> {
    /// Stablecoin configuration
    #[account(
        seeds = [b"stablecoin-config", mint_account.key().as_ref()],
        bump = stablecoin_config.bump,
    )]
    pub stablecoin_config: Account<'info, StablecoinConfig>,

    /// Minter authority or master authority
    pub minter: Signer<'info>,

    /// Minter config (optional - only needed if not master)
    #[account(
        mut,
        seeds = [b"minter", stablecoin_config.key().as_ref(), minter.key().as_ref()],
        bump = minter_config.bump,
    )]
    pub minter_config: Option<Account<'info, MinterConfig>>,

    /// Mint account
    #[account(
        mut,
        address = stablecoin_config.mint
    )]
    pub mint_account: Box<InterfaceAccount<'info, Mint>>,

    /// Destination token account
    #[account(mut)]
    pub destination: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Token program
    pub token_program: Program<'info, Token2022>,
}

pub fn handler(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
    let config = &ctx.accounts.stablecoin_config;
    
    // Check if token is paused
    RbacValidator::require_not_paused(config)?;

    // Check authorization
    let is_master = RbacValidator::is_master(config, &ctx.accounts.minter.key());
    
    if !is_master {
        // Require minter config and check quota
        let minter_config = ctx.accounts.minter_config.as_mut()
            .ok_or(ErrorCode::InvalidMinter)?;
        
        minter_config.add_minted(amount)?;
        
        msg!("Minter {} quota: {}/{}", 
            ctx.accounts.minter.key(),
            minter_config.minted,
            minter_config.quota
        );
    } else {
        msg!("Minting {} as master authority", amount);
    }

    // Mint tokens
    let mint_key = ctx.accounts.mint_account.key();
    let seeds = &[
        b"stablecoin-config",
        mint_key.as_ref(),
        &[config.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint_account.to_account_info(),
        to: ctx.accounts.destination.to_account_info(),
        authority: ctx.accounts.stablecoin_config.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );

    token_2022::mint_to(cpi_ctx, amount)?;

    msg!("✓ Minted {} tokens to {}", amount, ctx.accounts.destination.key());

    Ok(())
}
