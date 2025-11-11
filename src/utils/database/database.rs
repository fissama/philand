use sqlx::{mysql::MySqlPoolOptions, MySql, Pool};
pub type DbPool = Pool<MySql>;

pub async fn create_pool(url: &str) -> anyhow::Result<DbPool> {
    let pool = MySqlPoolOptions::new()
        .max_connections(10)
        .connect(url)
        .await?;
    Ok(pool)
}
