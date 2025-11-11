use crate::manager::{models::member::{BudgetMember, UpsertMemberReq}, models::role::Role};
use crate::utils::{database::database::DbPool, error::error::AppError};
use crate::manager::{repository::members::MemberRepo};
pub struct MemberService;
impl MemberService {
    pub async fn list(pool: &DbPool, budget_id: &str) -> Result<Vec<BudgetMember>, AppError> { MemberRepo::list(pool, budget_id).await }
    pub async fn upsert(pool: &DbPool, budget_id: &str, req: UpsertMemberReq) -> Result<BudgetMember, AppError> {
        if Role::from_str(&req.role).is_none() { return Err(AppError::BadRequest("invalid role".into())); }
        MemberRepo::upsert(pool, budget_id, &req.user_id, &req.role).await
    }
    pub async fn delete(pool: &DbPool, budget_id: &str, user_id: &str) -> Result<(), AppError> { MemberRepo::delete(pool, budget_id, user_id).await }
}
