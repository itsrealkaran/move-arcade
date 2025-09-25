address 0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2 {
module arcade_platform {
    use std::signer;
    use std::vector;
    use std::option;
    use std::error;
    use std::timestamp;
    use std::string;

    use aptos_framework::coin;
    use aptos_framework::aptos_coin;

    // -----------------------
    // Errors
    // -----------------------
    const ENOT_ADMIN: u64 = 1;
    const ENOT_REGISTERED: u64 = 2;
    const EINSUFFICIENT_FUNDS: u64 = 3;
    const EPOOL_NOT_FOUND: u64 = 4;
    const EPOOL_ALREADY_DISTRIBUTED: u64 = 5;
    const EINVALID_AMOUNT: u64 = 6;
    const EALREADY_INIT: u64 = 7;

    // -----------------------
    // Data types
    // -----------------------

    /// A registered user profile (stored in global Users resource under module admin address)
    struct UserProfile has copy, drop, store {
        addr: address,
        name: vector<u8>,       // UTF-8 bytes for display name
        vault_balance: u64      // tracked in octas (APT smallest unit)
    }

    /// Container of all user profiles (kept under admin address)
    struct Users has key {
        inner: vector<UserProfile>
    }

    /// Score entry for a player's best score (timestamp used for tie-break)
    struct ScoreEntry has copy, drop, store {
        player: address,
        score: u64,
        ts: u64
    }

    /// Pool key (game_id + dateIndex)
    struct GameDateKey has copy, drop, store {
        game_id: u64,
        date: u64
    }

    /// Pool resource for a given (game_id, date)
    struct Pool has copy, drop, store {
        key: GameDateKey,
        total: u64,                  // total vaulted for this pool (bookkeeping)
        players: vector<address>,    // unique players
        scores: vector<ScoreEntry>,  // one best ScoreEntry per player
        distributed: bool
    }

    /// Container of pools (kept under admin address)
    struct Pools has key {
        inner: vector<Pool>
    }

    /// Module treasury holds actual APT coins under admin address.
    /// Admin must initialize it by calling `init` with a seed coin.
    struct Treasury has key {
        vault: coin::Coin<aptos_coin::AptosCoin>, // actual coin resource custody
        balance: u64                               // bookkeeping (should match coin::value)
    }

    // -----------------------
    // Events
    // -----------------------
    struct SignupEvent has store { player: address, name: vector<u8> }
    struct DepositEvent has store { player: address, amount: u64 }
    struct WithdrawEvent has store { player: address, amount: u64 }
    struct PlayEvent has store { player: address, game_id: u64, date: u64, fee: u64, score: u64 }
    struct DistributionEvent has store { game_id: u64, date: u64, distributed: u64 }

    struct EventHandles has key {
        signup: event::EventHandle<SignupEvent>,
        deposit: event::EventHandle<DepositEvent>,
        withdraw: event::EventHandle<WithdrawEvent>,
        play: event::EventHandle<PlayEvent>,
        distribution: event::EventHandle<DistributionEvent>
    }

    // -----------------------
    // Initialization (admin)
    // -----------------------
    /// init must be called by the module publisher/admin once.
    /// admin provides a seed coin (can be small) to create the treasury under their account.
    public entry fun init(admin: &signer, seed: coin::Coin<aptos_coin::AptosCoin>) {
        let admin_addr = signer::address_of(admin);
        // protect double-init (Users or Treasury existing)
        assert!(!exists<Users>(admin_addr) && !exists<Pools>(admin_addr) && !exists<Treasury>(admin_addr), EALREADY_INIT);

        // create empty users/pools containers under admin address
        move_to(admin, Users { inner: vector::empty<UserProfile>() });
        move_to(admin, Pools { inner: vector::empty<Pool>() });

        // create treasury under admin, seeded with provided coin
        move_to(admin, Treasury { vault: seed, balance: coin::value(&seed) });

        // make event handles
        let eh_signup = event::new_event_handle<SignupEvent>(admin);
        let eh_deposit = event::new_event_handle<DepositEvent>(admin);
        let eh_withdraw = event::new_event_handle<WithdrawEvent>(admin);
        let eh_play = event::new_event_handle<PlayEvent>(admin);
        let eh_dist = event::new_event_handle<DistributionEvent>(admin);

        move_to(admin, EventHandles {
            signup: eh_signup, deposit: eh_deposit, withdraw: eh_withdraw, play: eh_play, distribution: eh_dist
        });
    }

    // helper to assert admin
    fun assert_admin(caller: &signer) {
        let admin_addr = signer::address_of(caller);
        // the module resources live under the module publisher address (0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2)
        // assert caller equals module publisher address
        assert!(admin_addr == @0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2, ENOT_ADMIN);
    }

    // -----------------------
    // User registration
    // -----------------------
    public entry fun signup(caller: &signer, name: vector<u8>) acquires Users, EventHandles {
        let admin_addr = @0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2;
        // Users container is stored under admin address
        assert!(exists<Users>(admin_addr), ENOT_REGISTERED);
        let mut users_ref = borrow_global_mut<Users>(admin_addr);

        let addr = signer::address_of(caller);
        let idx_opt = find_user_index(&users_ref.inner, addr);
        if (option::is_some(&idx_opt)) {
            // user already exists -> update name
            let idx = *option::borrow(&idx_opt);
            let mut u = vector::borrow_mut(&mut users_ref.inner, idx);
            u.name = name;
        } else {
            // create new user profile (vault balance starts 0)
            let profile = UserProfile { addr, name, vault_balance: 0u64 };
            vector::push_back(&mut users_ref.inner, profile);
        }

        // emit event
        let mut evs = borrow_global_mut<EventHandles>(admin_addr);
        event::emit_event(&mut evs.signup, SignupEvent { player: addr, name });
    }

    // -----------------------
    // Deposits / Withdraw (user)
    // -----------------------
    /// deposit APT from user's wallet into their on-contract vault (bookkeeping).
    /// Admin's Treasury.vault receives the actual coin custody.
    public entry fun deposit(user: &signer, amount: u64) acquires Users, Treasury, EventHandles {
        assert!(amount > 0, EINVALID_AMOUNT);
        let admin_addr = @0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2;
        assert!(exists<Users>(admin_addr), ENOT_REGISTERED);
        assert!(exists<Treasury>(admin_addr), ENOT_REGISTERED);

        // Withdraw coin from user account
        let coin_x = coin::withdraw<aptos_coin::AptosCoin>(user, amount);

        // Merge coin into treasury.vault (treasury lives under admin address)
        let mut treas = borrow_global_mut<Treasury>(admin_addr);
        coin::merge(&mut treas.vault, coin_x);
        treas.balance = treas.balance + amount;

        // update user's vault_balance bookkeeping
        let addr = signer::address_of(user);
        let mut users_ref = borrow_global_mut<Users>(admin_addr);
        let idx_opt = find_user_index(&users_ref.inner, addr);
        assert!(option::is_some(&idx_opt), ENOT_REGISTERED);
        let idx = *option::borrow(&idx_opt);
        let mut profile = vector::borrow_mut(&mut users_ref.inner, idx);
        profile.vault_balance = profile.vault_balance + amount;

        // emit event
        let mut evs = borrow_global_mut<EventHandles>(admin_addr);
        event::emit_event(&mut evs.deposit, DepositEvent { player: addr, amount });
    }

    /// withdraw from your vault (user requests coin back)
    /// This extracts coins from the admin Treasury.vault and deposit to user address
    public entry fun withdraw(user: &signer, amount: u64) acquires Users, Treasury, EventHandles {
        assert!(amount > 0, EINVALID_AMOUNT);
        let admin_addr = @0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2;
        assert!(exists<Users>(admin_addr), ENOT_REGISTERED);
        assert!(exists<Treasury>(admin_addr), ENOT_REGISTERED);

        let addr = signer::address_of(user);
        let mut users_ref = borrow_global_mut<Users>(admin_addr);
        let idx_opt = find_user_index(&users_ref.inner, addr);
        assert!(option::is_some(&idx_opt), ENOT_REGISTERED);
        let idx = *option::borrow(&idx_opt);
        let mut profile = vector::borrow_mut(&mut users_ref.inner, idx);
        assert!(profile.vault_balance >= amount, EINSUFFICIENT_FUNDS);
        profile.vault_balance = profile.vault_balance - amount;

        // extract coin from treasury and deposit to user account
        let mut treas = borrow_global_mut<Treasury>(admin_addr);
        assert!(treas.balance >= amount, EINSUFFICIENT_FUNDS);
        let coin_part = coin::extract(&mut treas.vault, amount);
        treas.balance = treas.balance - amount;
        coin::deposit(addr, coin_part);

        // emit event
        let mut evs = borrow_global_mut<EventHandles>(admin_addr);
        event::emit_event(&mut evs.withdraw, WithdrawEvent { player: addr, amount });
    }

    // -----------------------
    // Play / Hit
    // -----------------------
    /// User plays a game: `play_fee` is charged from user's vault_balance and credited to that day's pool for the game.
    /// The user's best score for that (game,day) is recorded (ties favored by earlier timestamp).
    public entry fun play_hit(player: &signer, game_id: u64, score: u64, play_fee: u64) acquires Users, Pools, EventHandles {
        let admin_addr = @0x93259eb31e6e504c308f188f7bb96fd4f496948899c9c03fbb6be2e5645632c2;
        assert!(exists<Users>(admin_addr), ENOT_REGISTERED);
        assert!(exists<Pools>(admin_addr), ENOT_REGISTERED);

        let addr = signer::address_of(player);
        let mut users_ref = borrow_global_mut<Users>(admin_addr);
        let idx_opt = find_user_index(&users_ref.inner, addr);
        assert!(option::is_some(&idx_opt), ENOT_REGISTERED);
        let idx = *option::borrow(&idx_opt);
        let mut profile = vector::borrow_mut(&mut users_ref.inner, idx);

        assert!(profile.vault_balance >= play_fee, EINSUFFICIENT_FUNDS);
        profile.vault_balance = profile.vault_balance - play_fee;

        // compute date index (UTC day)
        let ts = timestamp::now_seconds();
        let date = ts / 86400;

        // pools live under admin
        let mut pools_ref = borrow_global_mut<Pools>(admin_addr);
        let key = GameDateKey { game_id, date };

        let pool_idx_opt = find_pool_index(&pools_ref.inner, key);
        if (!option::is_some(&pool_idx_opt)) {
            // new pool
            let mut players_vec = vector::empty<address>();
            vector::push_back(&mut players_vec, addr);
            let mut scores_vec = vector::empty<ScoreEntry>();
            vector::push_back(&mut scores_vec, ScoreEntry { player: addr, score, ts });
            let new_pool = Pool {
                key,
                total: play_fee,
                players: players_vec,
                scores: scores_vec,
                distributed: false
            };
            vector::push_back(&mut pools_ref.inner, new_pool);
        } else {
            let pool_idx = *option::borrow(&pool_idx_opt);
            let mut pool_ref = vector::borrow_mut(&mut pools_ref.inner, pool_idx);
            pool_ref.total = pool_ref.total + play_fee;
            // update score entry: keep best score; if tie, earlier ts wins
            let sidx_opt = find_score_index(&pool_ref.scores, addr);
            if (!option::is_some(&sidx_opt)) {
                vector::push_back(&mut pool_ref.players, addr);
                vector::push_back(&mut pool_ref.scores, ScoreEntry { player: addr, score, ts });
            } else {
                let sidx = *option::borrow(&sidx_opt);
                let mut entry = vector::borrow_mut(&mut pool_ref.scores, sidx);
                if (score > entry.score) {
                    entry.score = score;
                    entry.ts = ts;
                } else if (score == entry.score && ts < entry.ts) {
                    entry.ts = ts;
                }
            }
        }

        // emit play event
        let mut evs = borrow_global_mut<EventHandles>(admin_addr);
        event::emit_event(&mut evs.play, PlayEvent { player: addr, game_id, date, fee: play_fee, score });
    }

    // -----------------------
    // Distribution (admin)
    // -----------------------
    /// Admin triggers distribution for a given (game_id, date). Admin must be module publisher account.
    /// This function will:
    ///  - compute winners (top3) and equal-split share for all players,
    ///  - extract coins from the treasury.vault and deposit them to winners' vault_balance (crediting their profile.vault_balance),
    ///  - remaining 50% stays in treasury (bookkeeping).
    public entry fun distribute_pool(admin: &signer, game_id: u64, date: u64) acquires Pools, Users, Treasury, EventHandles {
        // only admin (module publisher) can run this
        assert_admin(admin);
        let admin_addr = signer::address_of(admin);

        let mut pools_ref = borrow_global_mut<Pools>(admin_addr);
        let key = GameDateKey { game_id, date };
        let pool_idx_opt = find_pool_index_by_key(&pools_ref.inner, &key);
        assert!(option::is_some(&pool_idx_opt), EPOOL_NOT_FOUND);

        let pool_idx = *option::borrow(&pool_idx_opt);
        let mut pool_ref = vector::borrow_mut(&mut pools_ref.inner, pool_idx);
        assert!(!pool_ref.distributed, EPOOL_ALREADY_DISTRIBUTED);

        // pool total bookkeeping (we charged play_fee bookkeeping to pool.total when play_hit was called)
        let pool_total = pool_ref.total;
        if (pool_total == 0) {
            pool_ref.distributed = true;
            return;
        }

        // Determine shares (integer math, floor division; remainder goes to treasury)
        let share_top1 = pool_total * 25u64 / 100u64;
        let share_top2 = pool_total * 15u64 / 100u64;
        let share_top3 = pool_total * 5u64 / 100u64;
        let share_all  = pool_total * 5u64 / 100u64;
        let share_treasury = pool_total * 50u64 / 100u64;

        // Build entries vector, sort by (score desc, ts asc)
        let mut entries = vector::empty<ScoreEntry>();
        let n_scores = vector::length(&pool_ref.scores);
        let mut i = 0;
        while (i < n_scores) {
            let e = *vector::borrow(&pool_ref.scores, i);
            vector::push_back(&mut entries, e);
            i = i + 1;
        }
        sort_scores_desc_ts_asc(&mut entries);

        // Prepare awards vector (player -> amount)
        let mut awards = vector::empty<(address, u64)>();

        // Award top1 (handle ties)
        internal_award_rank(&mut entries, 0, share_top1, &mut awards);
        // Award top2
        let idx_for_top2 = next_rank_index(&entries, 0);
        internal_award_rank(&mut entries, idx_for_top2, share_top2, &mut awards);
        // Award top3
        let idx_for_top3 = next_rank_index(&entries, idx_for_top2);
        internal_award_rank(&mut entries, idx_for_top3, share_top3, &mut awards);

        // award share_all equally to all players
        let players_count = vector::length(&pool_ref.players) as u64;
        let per_player_all = if (players_count > 0) { share_all / players_count } else { 0u64 };
        let mut pi = 0;
        while (pi < vector::length(&pool_ref.players)) {
            let p = *vector::borrow(&pool_ref.players, pi);
            vector::push_back(&mut awards, (p, per_player_all));
            pi = pi + 1;
        }

        // Sum awarded
        let mut total_awarded = 0u64;
        let mut ai = 0;
        while (ai < vector::length(&awards)) {
            let pair = *vector::borrow(&awards, ai);
            total_awarded = total_awarded + pair.1;
            ai = ai + 1;
        }

        // remainder -> treasury (due to integer division rounding)
        let remainder = pool_total - (share_treasury + total_awarded);
        let final_treasury_add = share_treasury + remainder;

        // Now actually move coins: extract total_award_sum + final_treasury_add from treasury.vault,
        // then deposit winners via coin::deposit, and keep final_treasury_add in treasury.vault (we won't move it out).
        // We will extract only the amount to send to winners (total_awarded). Treasury retains final_treasury_add.
        if (total_awarded > 0) {
            // extract coins from treasury vault
            let mut treas = borrow_global_mut<Treasury>(admin_addr);
            assert!(treas.balance >= total_awarded, EINSUFFICIENT_FUNDS);
            let distribute_coin = coin::extract(&mut treas.vault, total_awarded);
            treas.balance = treas.balance - total_awarded;

            // Now split distribute_coin into pieces and deposit to winners.
            // We'll iterate awards and for each award.amount split from distribute_coin and deposit to player's address.
            let mut remaining_coin = distribute_coin;
            let mut aj = 0;
            while (aj < vector::length(&awards)) {
                let (winner, amt) = *vector::borrow(&awards, aj);
                if (amt > 0) {
                    let piece = coin::extract(&mut remaining_coin, amt);
                    // deposit actual APT coins to winner account
                    coin::deposit(winner, piece);
                    // NOTE: We *also* credit their vault_balance bookkeeping so user can see funds in vault (optional)
                    credit_user_vault_balance(admin_addr, winner, amt);
                }
                aj = aj + 1;
            }
            // any leftover in remaining_coin (should be zero) we put back to treasury.vault
            let leftover = coin::value(&remaining_coin);
            if (leftover > 0) {
                coin::merge(&mut treas.vault, remaining_coin);
                treas.balance = treas.balance + leftover;
            } else {
                // remaining_coin is empty (dropped)
            }
        }

        // Add rounding/treasury portion to bookkeeping (treasury already kept share)
        let mut treas_final = borrow_global_mut<Treasury>(admin_addr);
        treas_final.balance = treas_final.balance + final_treasury_add;
        // NOTE: the physical coins for final_treasury_add should already be present in treasury.vault;
        // they were not extracted above and may already be part of treasury.vault bookkeeping from deposits.

        // mark pool distributed
        pool_ref.distributed = true;

        // emit event
        let mut evs = borrow_global_mut<EventHandles>(admin_addr);
        event::emit_event(&mut evs.distribution, DistributionEvent { game_id, date, distributed: total_awarded });
    }

    /// Admin may withdraw from treasury to external address
    public entry fun treasury_withdraw(admin: &signer, to: address, amount: u64) acquires Treasury {
        assert_admin(admin);
        let admin_addr = signer::address_of(admin);
        let mut treas = borrow_global_mut<Treasury>(admin_addr);
        assert!(treas.balance >= amount, EINSUFFICIENT_FUNDS);
        let coin_part = coin::extract(&mut treas.vault, amount);
        treas.balance = treas.balance - amount;
        coin::deposit(to, coin_part);
    }

    // -----------------------
    // Internal helpers
    // -----------------------
    fun find_user_index(users: &vector<UserProfile>, who: address): option::Option<u64> {
        let len = vector::length(users);
        let mut i = 0;
        while (i < len) {
            let u = vector::borrow(users, i);
            if (u.addr == who) {
                return option::some(i);
            }
            i = i + 1;
        }
        option::none()
    }

    fun find_pool_index(pools: &vector<Pool>, key: GameDateKey): option::Option<u64> {
        let n = vector::length(pools);
        let mut i = 0;
        while (i < n) {
            let p = vector::borrow(pools, i);
            if (p.key.game_id == key.game_id && p.key.date == key.date) {
                return option::some(i);
            }
            i = i + 1;
        }
        option::none()
    }

    // same as above but key ref
    fun find_pool_index_by_key(pools: &vector<Pool>, key_ref: &GameDateKey): option::Option<u64> {
        let n = vector::length(pools);
        let mut i = 0;
        while (i < n) {
            let p = vector::borrow(pools, i);
            if (p.key.game_id == key_ref.game_id && p.key.date == key_ref.date) {
                return option::some(i);
            }
            i = i + 1;
        }
        option::none()
    }

    fun find_score_index(scores: &vector<ScoreEntry>, who: address): option::Option<u64> {
        let len = vector::length(scores);
        let mut i = 0;
        while (i < len) {
            let s = vector::borrow(scores, i);
            if (s.player == who) { return option::some(i); }
            i = i + 1;
        }
        option::none()
    }

    // sort entries (insertion sort) by score desc, ts asc
    fun sort_scores_desc_ts_asc(scores: &mut vector<ScoreEntry>) {
        let n = vector::length(scores);
        let mut i = 1;
        while (i < n) {
            let key = *vector::borrow(scores, i);
            let mut j = i;
            while (j > 0) {
                let prev = *vector::borrow(scores, j - 1);
                let cond_prev_better = (prev.score > key.score) || (prev.score == key.score && prev.ts <= key.ts);
                if (cond_prev_better) { break; }
                // swap prev forward
                let tmp = prev;
                *vector::borrow_mut(scores, j) = tmp;
                j = j - 1;
            }
            *vector::borrow_mut(scores, j) = key;
            i = i + 1;
        }
    }

    // given sorted entries, returns first index after block of ties starting at idx
    fun next_rank_index(entries: &vector<ScoreEntry>, idx: u64): u64 {
        let n = vector::length(entries);
        if (idx >= n) { return n; }
        let base_score = vector::borrow(entries, idx).score;
        let mut j = idx + 1;
        while (j < n) {
            if (vector::borrow(entries, j).score == base_score) {
                j = j + 1;
            } else { break; }
        }
        j
    }

    /// award the `share` for the group starting at start_index (ties share split equally)
    fun internal_award_rank(entries: &vector<ScoreEntry>, start_index: u64, share: u64, out: &mut vector<(address, u64)>) {
        let n = vector::length(entries);
        if (start_index >= n || share == 0) { return; }
        let s = vector::borrow(entries, start_index);
        let target_score = s.score;
        let mut tied = vector::empty<address>();
        let mut j = start_index;
        while (j < n) {
            let ej = vector::borrow(entries, j);
            if (ej.score == target_score) {
                vector::push_back(&mut tied, ej.player);
                j = j + 1;
            } else { break; }
        }
        let tied_count = vector::length(&tied) as u64;
        if (tied_count == 0) { return; }
        let per_player = share / tied_count;
        let mut k = 0;
        while (k < vector::length(&tied)) {
            let p = *vector::borrow(&tied, k);
            vector::push_back(out, (p, per_player));
            k = k + 1;
        }
    }

    // credit user's vault_balance bookkeeping (adds to existing profile.vault_balance)
    fun credit_user_vault_balance(admin_addr: address, who: address, amount: u64) acquires Users {
        let mut users_ref = borrow_global_mut<Users>(admin_addr);
        let idx_opt = find_user_index(&users_ref.inner, who);
        if (option::is_some(&idx_opt)) {
            let idx = *option::borrow(&idx_opt);
            let mut u = vector::borrow_mut(&mut users_ref.inner, idx);
            u.vault_balance = u.vault_balance + amount;
        } else {
            // user not registered: we will ignore and leave funds in their account (in practice deposit occurred to their address already)
            // optionally, we could create a profile for them (but we prefer explicit signup)
        }
    }

} // module
} // address
