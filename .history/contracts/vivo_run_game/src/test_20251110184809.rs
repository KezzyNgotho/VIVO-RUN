#![cfg(test)]

use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env};

#[test]
fn test_submit_score() {
    let env = Env::default();
    let contract_id = env.register_contract(None, VivoRunGame);
    let client = VivoRunGameClient::new(&env, &contract_id);
    
    let player = Address::generate(&env);
    
    // Submit a score
    client.submit_game_score(&player, &150);
    
    // Check stats
    let stats = client.get_player_stats(&player);
    assert_eq!(stats.total_games_played, 1);
    assert_eq!(stats.total_score, 150);
    assert_eq!(stats.high_score, 150);
    assert_eq!(stats.tokens_earned, 1); // 150 / 100 = 1
}

#[test]
fn test_quest_system() {
    let env = Env::default();
    let contract_id = env.register_contract(None, VivoRunGame);
    let client = VivoRunGameClient::new(&env, &contract_id);
    
    let player = Address::generate(&env);
    
    // Create a quest
    client.create_quest(
        &0,
        &symbol_short!("Score 1000"),
        &symbol_short!("Reach 1000 points"),
        &100,
        &1000,
    );
    
    // Submit scores to complete quest
    client.submit_game_score(&player, &600);
    client.submit_game_score(&player, &400);
    
    // Check quest progress
    let progress = client.get_quest_progress(&player, &0);
    assert_eq!(progress.completed, true);
    
    // Claim reward
    client.claim_quest_reward(&player, &0);
    
    let stats = client.get_player_stats(&player);
    assert_eq!(stats.tokens_earned, 100); // 100 from quest reward
}

#[test]
fn test_buy_lifeline() {
    let env = Env::default();
    let contract_id = env.register_contract(None, VivoRunGame);
    let client = VivoRunGameClient::new(&env, &contract_id);
    
    let player = Address::generate(&env);
    
    // Earn tokens first
    client.submit_game_score(&player, &1000); // Earns 10 tokens
    
    let stats_before = client.get_player_stats(&player);
    assert_eq!(stats_before.tokens_earned, 10);
    assert_eq!(stats_before.available_lives, 3);
    
    // Buy lifeline
    client.buy_lifeline(&player);
    
    let stats_after = client.get_player_stats(&player);
    assert_eq!(stats_after.tokens_earned, 0);
    assert_eq!(stats_after.available_lives, 4);
}

