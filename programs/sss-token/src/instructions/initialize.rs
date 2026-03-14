use anchor_lang::prelude::*;
use anchor_spl::token_2022::{Token2022};
use anchor_spl::token_interface::Mint;

use crate::state::{StablecoinConfig, InitializeParams};
use crate::utils::Validator;

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// Master authority (will have all roles initially)
    #[account(mut)]
    pub master_authority: Signer<'info>,

    /// Mint account (will be created by Token-2022)
    #[account(
        init,
        payer = master_authority,
        mint::decimals = 0, // Will be set via params
        mint::authority = stablecoin_config.key(),
        mint::token_program = token_program,
    )]
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    /// Stablecoin configuration PDA
    #[account(
        init,
        payer = master_authority,
        space = StablecoinConfig::space(),
        seeds = [b"stablecoin-config", mint.key().as_ref()],
        bump
    )]
    pub stablecoin_config: Account<'info, StablecoinConfig>,

    /// Token-2022 program
    pub token_program: Program<'info, Token2022>,

    /// System program
    pub system_program: Program<'info, System>,

    /// Rent sysvar
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
    // Validate parameters
    Validator::validate_name(&params.name)?;
    Validator::validate_symbol(&params.symbol)?;
    Validator::validate_uri(&params.uri)?;
    Validator::validate_decimals(params.decimals)?;

    msg!("Initializing {} ({}) - Preset: {}", 
        params.name, 
        params.symbol, 
        params.preset_name()
    );

    // Initialize config PDA
    let config = &mut ctx.accounts.stablecoin_config;
    config.master_authority = ctx.accounts.master_authority.key();
    config.mint = ctx.accounts.mint.key();
    config.name = params.name;
    config.symbol = params.symbol;
    config.uri = params.uri;
    config.decimals = params.decimals;
    config.enable_permanent_delegate = params.enable_permanent_delegate;
    config.enable_transfer_hook = params.enable_transfer_hook;
    config.default_account_frozen = params.default_account_frozen;
    config.is_paused = false;
    config.bump = ctx.bumps.stablecoin_config;

    msg!("✓ Stablecoin initialized successfully");
    msg!("  Mint: {}", config.mint);

    Ok(())
}
