use anchor_lang::prelude::*;

declare_id!("BVgKp4J7noHD8xEj5fysAbTXzD9KXirLhY1rhyRvF8Ui");

#[program]
pub mod programs_sss_token {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
