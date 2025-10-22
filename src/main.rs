#[path = "utils/tables/tables.rs"] mod tables;

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
    // Define routes
    let app = Router::new()
        .route("/", get(hello_world))
        .route("/echo", post(echo));

    // Bind to localhost:3000
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server running at http://{addr}");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
