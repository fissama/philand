use crate::utils::database::database::DbPool;
use crate::utils::rate_limiter::RateLimiter;
use std::sync::Arc;

pub mod health;
pub mod users;
pub mod budgets;
pub mod categories;
pub mod entries;
pub mod summaries;
pub mod auth;
pub mod members;
pub mod profile;

#[derive(Clone)]
pub struct AppState { 
    pub pool: DbPool,
    pub rate_limiter: Arc<RateLimiter>,
}
pub type AppCtx = Arc<AppState>;
