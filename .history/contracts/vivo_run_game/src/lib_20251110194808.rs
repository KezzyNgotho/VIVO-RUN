#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Symbol, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PlayerStats {
    pub total_games_played: u32,
    pub total_score: u64,
    pub high_score: u64,
    pub tokens_earned: u64,
    pub level: u32,
    pub available_lives: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Quest {
    pub title: Symbol,
    pub description: Symbol,
    pub reward_amount: u64,
    pub target_score: u64,
    pub active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct QuestProgress {
    pub progress: u64,
    pub completed: bool,
    pub claimed: bool,
}

const PLAYER_STATS: Symbol = symbol_short!("PLR_STATS");
const QUESTS: Symbol = symbol_short!("QUESTS");
const QUEST_PROGRESS: Symbol = symbol_short!("QUEST_PRG");
const TOKEN: Symbol = symbol_short!("TOKEN");

#[contract]
pub struct VivoRunGame;

#[contractimpl]
impl VivoRunGame {
    /// Initialize the contract with a token address
    pub fn initialize(env: Env, token: Address) {
        env.storage().instance().set(&TOKEN, &token);
    }

    /// Submit a game score and earn tokens
    pub fn submit_game_score(env: Env, player: Address, score: u64) {
        player.require_auth();
        
        // Calculate tokens earned (1 token per 100 points)
        let tokens_earned = score / 100;
        
        // Get or create player stats
        let mut stats = Self::get_player_stats(env.clone(), player.clone());
        stats.total_games_played += 1;
        stats.total_score += score;
        if score > stats.high_score {
            stats.high_score = score;
        }
        stats.tokens_earned += tokens_earned;
        
        // Update player stats
        env.storage()
            .persistent()
            .set(&(PLAYER_STATS, player.clone()), &stats);
        
        // Mint tokens if token contract is set
        if let Some(_token) = env.storage().instance().get::<_, Address>(&TOKEN) {
            // In a real implementation, you would call the token contract to mint
            // For now, we just update the stats
        }
        
        // Update quest progress
        Self::update_quest_progress(env, player, score);
    }

    /// Get player statistics
    pub fn get_player_stats(env: Env, player: Address) -> PlayerStats {
        env.storage()
            .persistent()
            .get(&(PLAYER_STATS, player))
            .unwrap_or(PlayerStats {
                total_games_played: 0,
                total_score: 0,
                high_score: 0,
                tokens_earned: 0,
                level: 1,
                available_lives: 3,
            })
    }

    /// Claim a quest reward
    pub fn claim_quest_reward(env: Env, player: Address, quest_id: u32) {
        player.require_auth();
        
        let mut progress = Self::get_quest_progress(env.clone(), player.clone(), quest_id);
        
        if !progress.completed {
            panic!("Quest not completed");
        }
        if progress.claimed {
            panic!("Quest already claimed");
        }
        
        progress.claimed = true;
        env.storage()
            .persistent()
            .set(&(QUEST_PROGRESS, player.clone(), quest_id), &progress);
        
        // Get quest reward
        if let Some(quest) = Self::get_quest(env.clone(), quest_id) {
            // Update player stats with reward
            let mut stats = Self::get_player_stats(env.clone(), player.clone());
            stats.tokens_earned += quest.reward_amount;
            env.storage()
                .persistent()
                .set(&(PLAYER_STATS, player), &stats);
        }
    }

    /// Get quest details
    pub fn get_quest(env: Env, quest_id: u32) -> Option<Quest> {
        env.storage()
            .instance()
            .get(&(QUESTS, quest_id))
    }

    /// Get quest progress for a player
    pub fn get_quest_progress(env: Env, player: Address, quest_id: u32) -> QuestProgress {
        env.storage()
            .persistent()
            .get(&(QUEST_PROGRESS, player, quest_id))
            .unwrap_or(QuestProgress {
                progress: 0,
                completed: false,
                claimed: false,
            })
    }

    /// Buy a lifeline (costs 10 tokens)
    pub fn buy_lifeline(env: Env, player: Address) {
        player.require_auth();
        
        let mut stats = Self::get_player_stats(env.clone(), player.clone());
        
        if stats.tokens_earned < 10 {
            panic!("Insufficient tokens");
        }
        
        stats.tokens_earned -= 10;
        stats.available_lives += 1;
        
        env.storage()
            .persistent()
            .set(&(PLAYER_STATS, player), &stats);
    }

    /// Create a quest (admin function)
    pub fn create_quest(
        env: Env,
        quest_id: u32,
        title: Symbol,
        description: Symbol,
        reward_amount: u64,
        target_score: u64,
    ) {
        let quest = Quest {
            title,
            description,
            reward_amount,
            target_score,
            active: true,
        };
        
        env.storage()
            .instance()
            .set(&(QUESTS, quest_id), &quest);
    }

    /// Update quest progress based on score
    fn update_quest_progress(env: Env, player: Address, score: u64) {
        // Check all active quests
        for quest_id in 0..10 {
            if let Some(quest) = Self::get_quest(env.clone(), quest_id) {
                if quest.active {
                    let mut progress = Self::get_quest_progress(env.clone(), player.clone(), quest_id);
                    progress.progress += score;
                    
                    if progress.progress >= quest.target_score && !progress.completed {
                        progress.completed = true;
                    }
                    
                    env.storage()
                        .persistent()
                        .set(&(QUEST_PROGRESS, player.clone(), quest_id), &progress);
                }
            }
        }
    }
}

#[cfg(test)]
mod test;

