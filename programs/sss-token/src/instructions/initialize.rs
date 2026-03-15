use anchor_lang::prelude::*;
use anchor_spl::token_2022::Token2022;
use spl_token_2022::{
    extension::{
        ExtensionType,
        default_account_state::instruction::initialize_default_account_state,
        transfer_hook::instruction::initialize as initialize_transfer_hook,
    },
    instruction::initialize_permanent_delegate,
    state::AccountState,
};

use crate::state::{StablecoinConfig, InitializeParams};
use crate::utils::Validator;

#[derive(Accounts)]
#[instruction(params: InitializeParams)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub master_authority: Signer<'info>,

    /// CHECK: Created manually with extensions via CPI
    #[account(mut, signer)]
    pub mint: AccountInfo<'info>,

    #[account(
        init,
        payer = master_authority,
        space = StablecoinConfig::space(),
        seeds = [b"stablecoin-config", mint.key().as_ref()],
        bump
    )]
    pub stablecoin_config: Account<'info, StablecoinConfig>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
    Validator::validate_name(&params.name)?;
    Validator::validate_symbol(&params.symbol)?;
    Validator::validate_uri(&params.uri)?;
    Validator::validate_decimals(params.decimals)?;

    msg!("Initializing {} ({}) - Preset: {}",
        params.name,
        params.symbol,
        params.preset_name()
    );

    let mint_key = ctx.accounts.mint.key();
    let config_key = ctx.accounts.stablecoin_config.key();
    let mint_info = ctx.accounts.mint.to_account_info();
    let authority_info = ctx.accounts.master_authority.to_account_info();
    let system_info = ctx.accounts.system_program.to_account_info();
    let rent = &ctx.accounts.rent;

    // 1. Build list of extensions needed
    let mut extension_types = vec![];
    if params.default_account_frozen {
        extension_types.push(ExtensionType::DefaultAccountState);
    }
    if params.enable_permanent_delegate {
        extension_types.push(ExtensionType::PermanentDelegate);
    }
    if params.enable_transfer_hook {
        extension_types.push(ExtensionType::TransferHook);
    }

    // 2. Calculate account size and lamports
    let space = ExtensionType::try_calculate_account_len::<spl_token_2022::state::Mint>(
        &extension_types,
    )
    .map_err(|e| anchor_lang::error::Error::from(e))?;

    let lamports = rent.minimum_balance(space);

    // 3. Create the raw mint account via system program
    anchor_lang::solana_program::program::invoke(
        &anchor_lang::solana_program::system_instruction::create_account(
            ctx.accounts.master_authority.key,
            &mint_key,
            lamports,
            space as u64,
            &spl_token_2022::id(),
        ),
        &[
            authority_info.clone(),
            mint_info.clone(),
            system_info.clone(),
        ],
    )?;

    // 4. Initialize extensions BEFORE calling initialize_mint2
    if params.default_account_frozen {
        let ix = initialize_default_account_state(
            &spl_token_2022::id(),
            &mint_key,
            &AccountState::Frozen,
        )
        .map_err(|e| anchor_lang::error::Error::from(e))?;

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[mint_info.clone()],
        )?;
    }

    if params.enable_permanent_delegate {
        let ix = initialize_permanent_delegate(
            &spl_token_2022::id(),
            &mint_key,
            &config_key,
        )
        .map_err(|e| anchor_lang::error::Error::from(e))?;

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[mint_info.clone()],
        )?;
    }

    if params.enable_transfer_hook {
        let ix = initialize_transfer_hook(
            &spl_token_2022::id(),
            &mint_key,
            Some(config_key),
            Some(crate::ID),
        )
        .map_err(|e| anchor_lang::error::Error::from(e))?;

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[mint_info.clone()],
        )?;
    }

    // 5. Initialize the mint itself
    let ix = spl_token_2022::instruction::initialize_mint2(
        &spl_token_2022::id(),
        &mint_key,
        &config_key,
        Some(&config_key),
        params.decimals,
    )
    .map_err(|e| anchor_lang::error::Error::from(e))?;

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            mint_info.clone(),
            rent.to_account_info(),
        ],
    )?;

    // 6. Store config
    let config_pda_key = ctx.accounts.stablecoin_config.key();
    let config = &mut ctx.accounts.stablecoin_config;
    config.master_authority = ctx.accounts.master_authority.key();
    config.mint = mint_key;
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
    msg!("  Config PDA: {}", config_pda_key);
    msg!("  SSS-1: {}", config.is_sss1());
    msg!("  SSS-2: {}", config.is_sss2());
    msg!("  Decimals: {}", config.decimals);

    Ok(())
}
