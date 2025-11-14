use crate::manager::{models::user::{User, CreateUserReq}};
use crate::utils::{database::database::DbPool, error::error::AppError};
use bcrypt::{hash, DEFAULT_COST};
use sqlx::Row;

pub struct UserRepo;

impl UserRepo {
    pub async fn list(pool: &DbPool) -> Result<Vec<User>, AppError> {
        Ok(sqlx::query_as::<_, User>("SELECT * FROM users ORDER BY created_at DESC").fetch_all(pool).await?)
    }
    
    pub async fn get_by_id(pool: &DbPool, id: &str) -> Result<User, AppError> {
        sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
            .bind(id)
            .fetch_optional(pool)
            .await?
            .ok_or(AppError::NotFound)
    }
    
    pub async fn create(pool: &DbPool, req: CreateUserReq, cost: u32) -> Result<User, AppError> {
        let id = uuid::Uuid::new_v4().to_string();
        let cost = if cost < 4 { DEFAULT_COST } else { cost };
        let hashed = hash(&req.password, cost).map_err(|_| AppError::Internal)?;
        sqlx::query("INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)")
            .bind(&id).bind(&req.email).bind(&req.name).bind(&hashed).execute(pool).await?;
        Self::get_by_id(pool, &id).await
    }
    
    pub async fn update(pool: &DbPool, user: &User) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE users SET name = ?, bio = ?, timezone = ?, locale = ?, updated_at = ? WHERE id = ?"
        )
        .bind(&user.name)
        .bind(&user.bio)
        .bind(&user.timezone)
        .bind(&user.locale)
        .bind(user.updated_at)
        .bind(&user.id)
        .execute(pool)
        .await?;
        Ok(())
    }
    
    pub async fn update_avatar(pool: &DbPool, user_id: &str, avatar: &str) -> Result<(), AppError> {
        let avatar_value = if avatar.is_empty() {
            None
        } else {
            Some(avatar)
        };
        
        sqlx::query("UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?")
            .bind(avatar_value)
            .bind(user_id)
            .execute(pool)
            .await?;
        Ok(())
    }
    
    pub async fn find_auth(pool: &DbPool, email: &str) -> Result<Option<(String, String)>, AppError> {
        let row = sqlx::query("SELECT id, password_hash FROM users WHERE email = ?").bind(email).fetch_optional(pool).await?;
        Ok(row.map(|r| (r.get::<String, _>("id"), r.get::<String, _>("password_hash"))))
    }
}
