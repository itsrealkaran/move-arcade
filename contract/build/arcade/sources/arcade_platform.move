// filename: arcade_platform.move
module 0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2::arcade_platform {
    use std::signer;
    use std::vector;
    use std::option;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};

    // ---------- Errors ----------
    const ENOT_REGISTERED: u64 = 1;
    const EINVALID_AMOUNT: u64 = 2;
    const EINSUFFICIENT_FUNDS: u64 = 3;
    const EPOOL_ALREADY_DISTRIBUTED: u64 = 4;
    const EPOOL_NOT_READY: u64 = 5;
    const ENOT_ADMIN: u64 = 6;
    const EPOOL_IS_EMPTY: u64 = 7;
    const EINVALID_PAGINATION: u64 = 8;
    const EPOOL_NOT_FOUND: u64 = 9;

    // ---------- Config ----------
    struct Admin has key { 
        addr: address 
    }

    struct ResourceCap has key {
        cap: account::SignerCapability,
    }

    // ---------- User resource ----------
    struct UserInfo has key, copy, drop, store {
        name: vector<u8>,
        vault_balance: u128,
    }

    // ---------- Per-game per-day leaderboard entry ----------
    struct ScoreEntry has copy, drop, store {
        player: address,
        score: u64,
        timestamp: u64,
    }

    struct Pool has key, store {
        game_id: u64,
        date: u64,
        total: u128,
        players: vector<address>,
        scores: Table<address, ScoreEntry>,
        distributed: bool,
    }

    // Simplified pool info for view functions (without Table)
    struct PoolInfo has copy, drop, store {
        game_id: u64,
        date: u64,
        total: u128,
        players: vector<address>,
        distributed: bool,
    }

    // ---------- Events ----------
    #[event]
    struct SignupEvent has drop, store { 
        player: address, 
        name: vector<u8> 
    }
    
    #[event]
    struct DepositEvent has drop, store { 
        player: address, 
        amount: u128 
    }
    
    #[event]
    struct WithdrawEvent has drop, store { 
        player: address, 
        amount: u128 
    }
    
    #[event]
    struct PlayEvent has drop, store { 
        player: address, 
        game_id: u64, 
        date: u64, 
        fee: u128, 
        score: u64 
    }
    
    #[event]
    struct DistributionEvent has drop, store { 
        game_id: u64, 
        date: u64, 
        distributed_amount: u128 
    }

    // ---------- Storage maps ----------
    struct Users has key { 
        inner: Table<address, UserInfo> 
    }
    
    struct GameDateKey has copy, drop, store { 
        game_id: u64, 
        date: u64 
    }
    
    struct Pools has key { 
        inner: Table<GameDateKey, Pool> 
    }
    
    struct Treasury has key { 
        balance: u128 
    }

    // ---------- Init function ----------
    fun init_module(admin: &signer) {
        let (resource_signer, resource_cap) = account::create_resource_account(admin, b"arcade_platform");
        move_to(admin, Admin { addr: signer::address_of(admin) });
        move_to(admin, ResourceCap { cap: resource_cap });
        move_to(admin, Users { inner: table::new<address, UserInfo>() });
        move_to(admin, Pools { inner: table::new<GameDateKey, Pool>() });
        move_to(admin, Treasury { balance: 0 });
        coin::register<AptosCoin>(&resource_signer);
    }

    // ---------- Register user ----------
    public entry fun signup(account: &signer, name: vector<u8>) acquires Users {
        let addr = signer::address_of(account);
        let users_ref = borrow_global_mut<Users>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        if (table::contains(&users_ref.inner, addr)) {
            let info = table::borrow_mut(&mut users_ref.inner, addr);
            info.name = name;
        } else {
            let info = UserInfo { name: name, vault_balance: 0 };
            table::add(&mut users_ref.inner, addr, info);
        };
        
        event::emit(SignupEvent { player: addr, name });
    }

    // ---------- Deposit coins into vault ----------
    public entry fun deposit(account: &signer, amount: u64) acquires Users, ResourceCap {
        assert!(amount > 0, EINVALID_AMOUNT);
        let addr = signer::address_of(account);
        let users_ref = borrow_global_mut<Users>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        assert!(table::contains(&users_ref.inner, addr), ENOT_REGISTERED);
        let user = table::borrow_mut(&mut users_ref.inner, addr);
        
        // Transfer coins from user to resource account
        let resource_cap = &borrow_global<ResourceCap>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2).cap;
        let resource_addr = account::get_signer_capability_address(resource_cap);
        coin::transfer<AptosCoin>(account, resource_addr, amount);
        
        user.vault_balance = user.vault_balance + (amount as u128);
        
        event::emit(DepositEvent { player: addr, amount: amount as u128 });
    }

    // ---------- Withdraw from vault ----------
    public entry fun withdraw(account: &signer, amount: u64) acquires Users, ResourceCap {
        let addr = signer::address_of(account);
        let users_ref = borrow_global_mut<Users>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        assert!(table::contains(&users_ref.inner, addr), ENOT_REGISTERED);
        let user = table::borrow_mut(&mut users_ref.inner, addr);
        assert!(user.vault_balance >= (amount as u128), EINSUFFICIENT_FUNDS);
        user.vault_balance = user.vault_balance - (amount as u128);
        
        // Check if user has AptosCoin registered
        if (!coin::is_account_registered<AptosCoin>(addr)) {
            coin::register<AptosCoin>(account);
        };
        
        // Transfer from resource account to user
        let resource_cap = &borrow_global<ResourceCap>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2).cap;
        let resource_signer = account::create_signer_with_capability(resource_cap);
        coin::transfer<AptosCoin>(&resource_signer, addr, amount);
        
        event::emit(WithdrawEvent { player: addr, amount: (amount as u128) });
    }

    // ---------- Play: charge fee, add to pool, store score ----------
    public entry fun play(player: &signer, game_id: u64, score: u64, play_fee: u64) acquires Users, Pools {
        let addr = signer::address_of(player);
        let users_ref = borrow_global_mut<Users>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        assert!(table::contains(&users_ref.inner, addr), ENOT_REGISTERED);
        let user = table::borrow_mut(&mut users_ref.inner, addr);
        assert!(user.vault_balance >= (play_fee as u128), EINSUFFICIENT_FUNDS);
        user.vault_balance = user.vault_balance - (play_fee as u128);
        
        let ts = timestamp::now_seconds();
        let date = ts / 86400;
        let pools_ref = borrow_global_mut<Pools>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        let key = GameDateKey { game_id, date };
        
        if (!table::contains(&pools_ref.inner, key)) {
            let scores_table = table::new<address, ScoreEntry>();
            let pool = Pool { 
                game_id, 
                date, 
                total: (play_fee as u128), 
                players: vector::singleton(addr), 
                scores: scores_table, 
                distributed: false 
            };
            table::add(&mut pools_ref.inner, key, pool);
            let pool_ref = table::borrow_mut(&mut pools_ref.inner, key);
            let entry = ScoreEntry { player: addr, score, timestamp: ts };
            table::add(&mut pool_ref.scores, addr, entry);
        } else {
            let pool_ref = table::borrow_mut(&mut pools_ref.inner, key);
            pool_ref.total = pool_ref.total + (play_fee as u128);
            if (!table::contains(&pool_ref.scores, addr)) {
                vector::push_back(&mut pool_ref.players, addr);
                let entry = ScoreEntry { player: addr, score, timestamp: ts };
                table::add(&mut pool_ref.scores, addr, entry);
            } else {
                let existing = table::borrow_mut(&mut pool_ref.scores, addr);
                if (score > existing.score) {
                    existing.score = score;
                    existing.timestamp = ts;
                } else if (score == existing.score && ts < existing.timestamp) {
                    existing.timestamp = ts;
                }
            }
        };
        
        event::emit(PlayEvent { 
            player: addr, 
            game_id, 
            date, 
            fee: (play_fee as u128), 
            score 
        });
    }

    // ---------- Read functions ----------
    #[view]
    public fun get_user(addr: address): option::Option<UserInfo> acquires Users {
        let users_ref = borrow_global<Users>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        if (table::contains(&users_ref.inner, addr)) {
            let u = table::borrow(&users_ref.inner, addr);
            option::some(*u)
        } else {
            option::none<UserInfo>()
        }
    }

    #[view]
    public fun get_pool(game_id: u64, date: u64): option::Option<PoolInfo> acquires Pools {
        let pools_ref = borrow_global<Pools>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        let key = GameDateKey { game_id, date };
        if (table::contains(&pools_ref.inner, key)) {
            let p = table::borrow(&pools_ref.inner, key);
            let pool_info = PoolInfo {
                game_id: p.game_id,
                date: p.date,
                total: p.total,
                players: p.players,
                distributed: p.distributed,
            };
            option::some(pool_info)
        } else {
            option::none<PoolInfo>()
        }
    }

    // New function to get a paginated leaderboard
    #[view]
    public fun get_leaderboard(game_id: u64, date: u64, offset: u64, limit: u64): vector<ScoreEntry> acquires Pools {
        let pools_ref = borrow_global<Pools>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        let key = GameDateKey { game_id, date };
        assert!(table::contains(&pools_ref.inner, key), EPOOL_NOT_FOUND);
        let pool = table::borrow(&pools_ref.inner, key);
        
        let players_vec = pool.players;
        let entries = vector::empty<ScoreEntry>();
        let i_len = vector::length(&players_vec);
        let i = 0;
        while (i < i_len) {
            let player_addr = *vector::borrow(&players_vec, i);
            let entry = *table::borrow(&pool.scores, player_addr);
            vector::push_back(&mut entries, entry);
            i = i + 1;
        };

        sort_by_score_and_timestamp(&mut entries);

        let result = vector::empty<ScoreEntry>();
        let total_entries = vector::length(&entries);

        assert!(offset + limit <= total_entries, EINVALID_PAGINATION);
        
        let k = offset;
        while (k < offset + limit) {
            vector::push_back(&mut result, *vector::borrow(&entries, k));
            k = k + 1;
        };
        
        result
    }

    // ---------- Distribution ----------
    public entry fun distribute(_caller: &signer, game_id: u64, date: u64) acquires Pools, Users, Treasury {
        let pools_ref = borrow_global_mut<Pools>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        let key = GameDateKey { game_id, date };
        assert!(table::contains(&pools_ref.inner, key), EPOOL_NOT_READY);
        let pool = table::borrow_mut(&mut pools_ref.inner, key);
        assert!(!pool.distributed, EPOOL_ALREADY_DISTRIBUTED);
        let now = timestamp::now_seconds();
        let today = now / 86400;
        assert!(date < today, EPOOL_NOT_READY);

        let total = pool.total;
        if (total == 0) {
            pool.distributed = true;
            event::emit(DistributionEvent { game_id, date, distributed_amount: 0 });
            return
        };

        let share_top1 = total * 25 / 100;
        let share_top2 = total * 15 / 100;
        let share_top3 = total * 5 / 100;
        let share_all = total * 5 / 100;
        let keep_treasury = total * 50 / 100;
        let total_distributed_amount = 0;

        let players_vec = pool.players;
        let entries = vector::empty<ScoreEntry>();
        let i_len = vector::length(&players_vec);
        let i = 0;
        while (i < i_len) {
            let player_addr = *vector::borrow(&players_vec, i);
            let entry = *table::borrow(&pool.scores, player_addr);
            vector::push_back(&mut entries, entry);
            i = i + 1;
        };
        
        sort_by_score_and_timestamp(&mut entries);

        let users_ref = borrow_global_mut<Users>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        let current_rank = 1;
        let last_score = option::none<u64>();
        let tied_players_count = 0;
        let current_prize_pool = 0;

        let i = 0;
        while (i < vector::length(&entries)) {
            let entry = vector::borrow(&entries, i);
            
            if (option::is_some(&last_score) && *option::borrow(&last_score) == entry.score) {
                tied_players_count = tied_players_count + 1;
            } else {
                if (tied_players_count > 0) {
                    let per_player_prize = current_prize_pool / (tied_players_count as u128);
                    let k = i - tied_players_count;
                    while (k < i) {
                        let tied_entry = vector::borrow(&entries, k);
                        credit_player_vault(users_ref, tied_entry.player, per_player_prize);
                        total_distributed_amount = total_distributed_amount + per_player_prize;
                        k = k + 1;
                    }
                };
                
                current_rank = current_rank + tied_players_count;
                tied_players_count = 1;
                current_prize_pool = 0;
                last_score = option::some(entry.score);
                
                if (current_rank == 1) {
                    current_prize_pool = share_top1;
                } else if (current_rank == 2) {
                    current_prize_pool = share_top2;
                } else if (current_rank == 3) {
                    current_prize_pool = share_top3;
                } else {
                    break
                }
            };
            i = i + 1;
        };

        if (tied_players_count > 0 && current_prize_pool > 0) {
            let per_player_prize = current_prize_pool / (tied_players_count as u128);
            let k = i - tied_players_count;
            while (k < i) {
                let tied_entry = vector::borrow(&entries, k);
                credit_player_vault(users_ref, tied_entry.player, per_player_prize);
                total_distributed_amount = total_distributed_amount + per_player_prize;
                k = k + 1;
            }
        };

        let players_count = vector::length(&players_vec);
        if (players_count > 0) {
            let per_player_all = share_all / (players_count as u128);
            if (per_player_all > 0) {
                let i = 0;
                while (i < players_count) {
                    let p = *vector::borrow(&players_vec, i);
                    credit_player_vault(users_ref, p, per_player_all);
                    total_distributed_amount = total_distributed_amount + per_player_all;
                    i = i + 1;
                }
            }
        };

        let treasury = borrow_global_mut<Treasury>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        treasury.balance = treasury.balance + keep_treasury + (total - total_distributed_amount);

        pool.distributed = true;
        
        event::emit(DistributionEvent { 
            game_id, 
            date, 
            distributed_amount: total_distributed_amount 
        });
    }

    public entry fun withdraw_treasury(admin: &signer, amount: u64, to: address) acquires Admin, Treasury, ResourceCap {
        let admin_res = borrow_global<Admin>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        assert!(signer::address_of(admin) == admin_res.addr, ENOT_ADMIN);
        let treasury = borrow_global_mut<Treasury>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2);
        assert!(treasury.balance >= (amount as u128), EINSUFFICIENT_FUNDS);
        treasury.balance = treasury.balance - (amount as u128);
        
        // Transfer from resource account to target address
        let resource_cap = &borrow_global<ResourceCap>(@0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2).cap;
        let resource_signer = account::create_signer_with_capability(resource_cap);
        
        // Check if target has AptosCoin registered
        if (!coin::is_account_registered<AptosCoin>(to)) {
            // Target needs to register themselves, we can't do it for them
            abort ENOT_REGISTERED
        };
        
        coin::transfer<AptosCoin>(&resource_signer, to, amount);
    }
    
    // --- Helper functions ---
    fun credit_player_vault(users_ref: &mut Users, addr: address, amount: u128) {
        if (table::contains(&users_ref.inner, addr)) {
            let user = table::borrow_mut(&mut users_ref.inner, addr);
            user.vault_balance = user.vault_balance + amount;
        }
    }

    fun sort_by_score_and_timestamp(entries: &mut vector<ScoreEntry>) {
        let n = vector::length(entries);
        let i = 0;
        while (i < n) {
            let j = 0;
            while (j < n - i - 1) {
                let a = *vector::borrow(entries, j);
                let b = *vector::borrow(entries, j + 1);
                
                if (a.score < b.score) {
                    vector::swap(entries, j, j + 1);
                } else if (a.score == b.score && a.timestamp > b.timestamp) {
                    vector::swap(entries, j, j + 1);
                };
                j = j + 1;
            };
            i = i + 1;
        }
    }
}