#[path = "utils/tables/tables.rs"] mod tables;
#[path = "config/config.rs"] mod config;

use axum::{
    routing::{get, post},
    extract::Json,
    http::StatusCode,
    Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;

#[derive(Serialize, Deserialize)]
struct Message {
    text: String,
}

// GET handler
async fn hello_world() -> Json<Message> {
    Json(Message {
        text: "Hello from Rust API 🚀".to_string(),
    })
}

// POST handler
async fn echo(Json(payload): Json<Message>) -> (StatusCode, Json<Message>) {
    (StatusCode::OK, Json(payload))
}

#[tokio::main]
async fn main() {
    config::Init();


    let app = Router::new()
        .route("/", get(hello_world))
        .route("/echo", post(echo));

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse()
        .expect("PORT must be a number");
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("Server running at http://{addr}");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
