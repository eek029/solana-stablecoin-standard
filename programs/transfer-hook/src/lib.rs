use anchor_lang::prelude::*;
use anchor_spl::token_2022::spl_token_2022::extension::transfer_hook::TransferHookAccount;
use spl_transfer_hook_interface::instruction::ExecuteInstruction;

declare_id!("55ahbn1dMDaGTMKGb3aRF2joihXL6zP1uv5npVtNpqAm");

#[program]
pub mod transfer_hook {
    use super::*;

    /// Called by Token-2022 on every transfer
    /// Checks if sender or recipient is blacklisted
    pub fn execute(ctx: Context<Execute>, amount: u64) -> Result<()> {
        // Get the mint and check if sender/recipient have blacklist entries
        let mint = ctx.accounts.mint.key();
        
        // Check if source_account is blacklisted
        // This would typically check a PDA: ["blacklist", config, source_account]
        // For now, we'll implement a simple check
        
        msg!("Transfer Hook: Checking transfer of {} tokens", amount);
        msg!("From: {}", ctx.accounts.source_account.key());
        msg!("To: {}", ctx.accounts.destination_account.key());
        
        // TODO: Implement actual blacklist check against PDAs
        // require!(!is_blacklisted(source), ErrorCode::AccountBlacklisted);
        // require!(!is_blacklisted(destination), ErrorCode::AccountBlacklisted);
        
        Ok(())
    }

    /// Initialize the extra account metas for the transfer hook
    pub fn initialize_extra_account_meta_list(
        _ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        // This would set up which extra accounts the hook needs
        // For blacklist checking, we need the StablecoinConfig PDA
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Execute<'info> {
    /// CHECK: Source token account (validated by Token-2022)
    pub source_account: UncheckedAccount<'info>,
    
    /// CHECK: Mint account (validated by Token-2022)
    pub mint: UncheckedAccount<'info>,
    
    /// CHECK: Destination token account (validated by Token-2022)
    pub destination_account: UncheckedAccount<'info>,
    
    /// CHECK: Authority (validated by Token-2022)
    pub authority: UncheckedAccount<'info>,
    
    /// CHECK: Extra account metas (validated by Transfer Hook Interface)
    pub extra_account_metas: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    /// CHECK: Extra account metas to initialize
    #[account(mut)]
    pub extra_account_metas: UncheckedAccount<'info>,
    
    /// Mint account
    /// CHECK: Validated by transfer hook interface
    pub mint: UncheckedAccount<'info>,
    
    /// Payer
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// System program
    pub system_program: Program<'info, System>,
}
