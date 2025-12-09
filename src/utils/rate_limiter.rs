use dashmap::DashMap;
use std::net::IpAddr;
use std::sync::Arc;
use std::time::{Duration, Instant};

#[derive(Clone)]
pub struct RateLimitEntry {
    pub count: u32,
    pub window_start: Instant,
    pub locked_until: Option<Instant>,
}

#[derive(Clone)]
pub struct RateLimiter {
    // IP -> (short_window_count, long_window_count, fail_count, locked_until)
    store: Arc<DashMap<IpAddr, RateLimitEntry>>,
    short_window: Duration,
    short_max: u32,
    long_window: Duration,
    long_max: u32,
    // fail_threshold: u32,
    // fail_lock_duration: Duration,
}

impl RateLimiter {
    pub fn new(
        short_window_sec: u64,
        short_max: u32,
        long_window_sec: u64,
        long_max: u32,
        _fail_threshold: u32,
        _fail_lock_min: u64,
    ) -> Self {
        Self {
            store: Arc::new(DashMap::new()),
            short_window: Duration::from_secs(short_window_sec),
            short_max,
            long_window: Duration::from_secs(long_window_sec),
            long_max,
            // fail_threshold,
            // fail_lock_duration: Duration::from_secs(fail_lock_min * 60),
        }
    }

    pub fn check_rate_limit(&self, ip: IpAddr) -> Result<(), String> {
        let now = Instant::now();

        // Check if IP is locked
        if let Some(mut entry) = self.store.get_mut(&ip) {
            if let Some(locked_until) = entry.locked_until {
                if now < locked_until {
                    let remaining = (locked_until - now).as_secs();
                    return Err(format!("Too many failed attempts. Locked for {} more seconds", remaining));
                } else {
                    // Lock expired, reset
                    entry.locked_until = None;
                    entry.count = 0;
                    entry.window_start = now;
                }
            }

            // Check if window expired
            if now.duration_since(entry.window_start) > self.long_window {
                entry.count = 1;
                entry.window_start = now;
                return Ok(());
            }

            // Increment count
            entry.count += 1;

            // Check short window (more strict)
            if now.duration_since(entry.window_start) < self.short_window {
                if entry.count > self.short_max {
                    return Err(format!("Rate limit exceeded: {} requests in {} seconds", entry.count, self.short_window.as_secs()));
                }
            }

            // Check long window
            if entry.count > self.long_max {
                return Err(format!("Rate limit exceeded: {} requests in {} seconds", entry.count, self.long_window.as_secs()));
            }

            Ok(())
        } else {
            // First request from this IP
            self.store.insert(ip, RateLimitEntry {
                count: 1,
                window_start: now,
                locked_until: None,
            });
            Ok(())
        }
    }

    // pub fn record_failure(&self, ip: IpAddr) {
    //     let now = Instant::now();
        
    //     if let Some(mut entry) = self.store.get_mut(&ip) {
    //         if now.duration_since(entry.window_start) > self.long_window {
    //             entry.count = 1;
    //             entry.window_start = now;
    //         } else {
    //             entry.count += 1;
    //         }

    //         if entry.count >= self.fail_threshold {
    //             entry.locked_until = Some(now + self.fail_lock_duration);
    //             tracing::warn!("IP {} locked due to {} failed attempts", ip, entry.count);
    //         }
    //     } else {
    //         self.store.insert(ip, RateLimitEntry {
    //             count: 1,
    //             window_start: now,
    //             locked_until: None,
    //         });
    //     }
    // }

    // pub fn cleanup_expired(&self) {
    //     let now = Instant::now();
    //     self.store.retain(|_, entry| {
    //         if let Some(locked_until) = entry.locked_until {
    //             if now < locked_until {
    //                 return true;
    //             }
    //         }
    //         now.duration_since(entry.window_start) < self.long_window
    //     });
    // }
}
