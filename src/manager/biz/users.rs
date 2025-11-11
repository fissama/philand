use crate::manager::{models::user::{User, CreateUserReq}};
use crate::utils::{database::database::DbPool, error::error::AppError};
use crate::manager::{repository::users::UserRepo};
pub struct UserService;

impl UserService {
    pub async fn list(pool: &DbPool) -> Result<Vec<User>, AppError> { UserRepo::list(pool).await }
    pub async fn create(pool: &DbPool, req: CreateUserReq, cost: u32) -> Result<User, AppError> { UserRepo::create(pool, req, cost).await }
    pub async fn find_auth(pool: &DbPool, email: &str) -> Result<Option<(String, String)>, AppError> { UserRepo::find_auth(pool, email).await }
}
