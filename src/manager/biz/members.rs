use crate::manager::{models::member::{BudgetMember, BudgetMemberWithUser, UpsertMemberReq}, models::role::Role};
use crate::utils::{database::database::DbPool, error::error::AppError};
use crate::manager::{repository::members::MemberRepo, repository::users::UserRepo};
pub struct MemberService;
impl MemberService {
    pub async fn list(pool: &DbPool, budget_id: &str) -> Result<Vec<BudgetMember>, AppError> { MemberRepo::list(pool, budget_id).await }
    
    pub async fn list_with_users(pool: &DbPool, budget_id: &str) -> Result<Vec<BudgetMemberWithUser>, AppError> { MemberRepo::list_with_users(pool, budget_id).await }
    pub async fn upsert(pool: &DbPool, budget_id: &str, req: UpsertMemberReq) -> Result<BudgetMember, AppError> {
        if Role::from_str(&req.role).is_none() { 
            return Err(AppError::BadRequest("invalid role".into())); 
        }
        
        // Look up user by email
        let user_id = UserRepo::get_id_by_email(pool, &req.email).await?
            .ok_or_else(|| AppError::BadRequest("User not found with this email".into()))?;
        
        MemberRepo::upsert(pool, budget_id, &user_id, &req.role).await
    }
    
    pub async fn update_by_user_id(pool: &DbPool, budget_id: &str, user_id: &str, role: &str) -> Result<BudgetMember, AppError> {
        if Role::from_str(role).is_none() { 
            return Err(AppError::BadRequest("invalid role".into())); 
        }
        MemberRepo::upsert(pool, budget_id, user_id, role).await
    }
    pub async fn delete(pool: &DbPool, budget_id: &str, user_id: &str) -> Result<(), AppError> { MemberRepo::delete(pool, budget_id, user_id).await }
}
