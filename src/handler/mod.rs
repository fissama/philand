use crate::utils::database::database::DbPool;
use std::sync::Arc;

pub mod health;
pub mod users;
pub mod budgets;
pub mod categories;
pub mod entries;
pub mod summaries;
pub mod auth;
pub mod members;

#[derive(Clone)]
pub struct AppState { pub pool: DbPool }
pub type AppCtx = Arc<AppState>;
