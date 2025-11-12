use std::net::SocketAddr;
use std::sync::Arc;
use axum::{routing::{get, post, patch}, Router, http::Method, http::HeaderValue};
use tower_http::cors::{CorsLayer, AllowOrigin, AllowHeaders};
use dotenvy::dotenv;
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;
use crate::config::config::get_config;
use crate::utils::database;

mod config;
mod handler;
mod manager;
mod utils;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let subscriber = FmtSubscriber::builder().with_max_level(Level::INFO).with_env_filter(tracing_subscriber::EnvFilter::from_default_env()).finish();
    let _ = tracing::subscriber::set_global_default(subscriber);

    dotenv().ok();
    config::config::init();
    let db_url = get_config().get_database_config().get_url();
    let pool = database::database::create_pool(&db_url).await?;
    //sqlx::migrate!("./migrations").run(&pool).await?;
    let state = Arc::new(handler::AppState { pool });

    let cors_layer = {
        let origins_vec = get_config().get_cors_origins();
        if !origins_vec.is_empty() {
            let origins: Vec<axum::http::HeaderValue> = origins_vec
                .into_iter()
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .map(|s| axum::http::HeaderValue::from_str(&s).expect("invalid CORS origin"))
                .collect();
            CorsLayer::new().allow_origin(AllowOrigin::list(origins))
                .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS, Method::PATCH])
                .allow_headers(AllowHeaders::list(vec![
                    axum::http::header::AUTHORIZATION,
                    axum::http::header::CONTENT_TYPE,
                    axum::http::header::ACCEPT,
                    axum::http::header::ORIGIN,
                ]))
                .allow_credentials(true)
        } else {
            CorsLayer::permissive()
        }
    };

    let protected = Router::new()
        .route("/api/users", get(handler::users::list))
        .route("/api/budgets", get(handler::budgets::list).post(handler::budgets::create))
        .route("/api/budgets/{id}", get(handler::budgets::get))
        .route("/api/budgets/{id}/categories", get(handler::categories::list).post(handler::categories::create))
        .route("/api/budgets/{id}/entries", get(handler::entries::list).post(handler::entries::create))
        .route("/api/budgets/{id}/summary/monthly", get(handler::summaries::monthly))
        .route("/api/budgets/{id}/members", get(handler::members::list).post(handler::members::upsert))
        .route("/api/budgets/{id}/members/{user_id}", patch(handler::members::update).delete(handler::members::delete))
        .route_layer(axum::middleware::from_fn(handler::auth::auth_middleware));

    let app = Router::new()
        .route("/healthz", get(handler::health::health))
        .route("/auth/signup", post(handler::auth::signup))
        .route("/auth/login", post(handler::auth::login))
        .merge(protected)
        .with_state(state)
        .layer(cors_layer);

    let port: u16 = get_config().get_network_config().get_port().parse().unwrap_or(3000);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("listening on http://{addr}");
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();;
    Ok(())
}
