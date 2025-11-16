use std::env;
use dotenvy::dotenv;

#[derive(Debug, Clone)]
pub struct Config {
    network_cfg: NetworkConfig,
    database_cfg: DatabaseConfig,
    jwt_cfg: JwtConfig,
    cors_origins: Vec<String>,
    rate_limit_cfg: RateLimitConfig,
    reset_cfg: ResetConfig,
    google_cfg: GoogleConfig,
}

impl Config {
    pub fn get_network_config(&self) -> NetworkConfig {
        self.network_cfg.clone()
    }

    pub fn get_database_config(&self) -> DatabaseConfig {
        self.database_cfg.clone()
    }

    pub fn get_jwt_config(&self) -> JwtConfig {
        self.jwt_cfg.clone()
    }

    pub fn get_cors_origins(&self) -> Vec<String> {
        self.cors_origins.clone()
    }

    pub fn get_rate_limit_config(&self) -> RateLimitConfig {
        self.rate_limit_cfg.clone()
    }

    pub fn get_reset_config(&self) -> ResetConfig {
        self.reset_cfg.clone()
    }

    pub fn get_google_cfg(&self) -> GoogleConfig {
        self.google_cfg.clone()
    }
}

#[derive(Debug, Clone)]
pub struct NetworkConfig {
    host: String,
    port: String,
}

impl NetworkConfig {
    pub fn get_host(&self) -> String {
        self.host.clone()
    }

    pub fn get_port(&self) -> String {
        self.port.clone()
    }
}

#[derive(Debug, Clone)]
pub struct DatabaseConfig {
    url: String,
}

impl DatabaseConfig {
    pub fn get_url(&self) -> String {
        self.url.clone()
    }
}

#[derive(Debug, Clone)]
pub struct JwtConfig {
    secret: String,
    ttl_min: i64,
    bcrypt_cost: u32,
}

impl JwtConfig {
    pub fn get_secret(&self) -> String {
        self.secret.clone()
    }

    pub fn get_ttl_min(&self) -> i64 {
        self.ttl_min
    }

    pub fn get_bcrypt_cost(&self) -> u32 {
        self.bcrypt_cost
    }
}

#[derive(Debug, Clone)]
pub struct RateLimitConfig {
    pub short_window_sec: u64,
    pub short_max: u32,
    pub long_window_sec: u64,
    pub long_max: u32,
    pub fail_threshold: u32,
    pub fail_lock_min: u64,
}

#[derive(Debug, Clone)]
pub struct ResetConfig {
    pub token_ttl_min: i64,
    pub otp_ttl_min: i64,
}

#[derive(Debug, Clone)]
pub struct GoogleConfig {
    client_id: String,
    client_secret: String,
    redirect_uri: String,
}

impl GoogleConfig {
    pub fn get_client_id(&self) -> String {
        self.client_id.clone()
    }

    pub fn get_client_secret(&self) -> String {
        self.client_secret.clone()
    }

    pub fn get_redirect_uri(&self) -> String {
        self.redirect_uri.clone()
    }
}

static mut GLOBAL_CONFIG: Option<Config> = None;

pub fn init() {
    unsafe {
        dotenv().ok();
        GLOBAL_CONFIG = Some(Config {
            network_cfg: NetworkConfig {
                host: env::var("NET_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
                port: env::var("NET_PORT").unwrap_or_else(|_| "3000".to_string()),
            },
            database_cfg: DatabaseConfig {
                url: env::var("DB_URL").unwrap_or_else(|_| "mysql://philand:philand@127.0.0.1:3306/philand?ssl-mode=DISABLED".to_string()),
            },
            jwt_cfg: JwtConfig {
                secret: env::var("JWT_SECRET").unwrap_or_else(|_| "dev-super-secret-change-me".to_string()),
                ttl_min: env::var("JWT_TTL_MIN").unwrap_or_else(|_| "10080".to_string()).parse().unwrap_or(10080),
                bcrypt_cost: env::var("BCRYPT_COST").unwrap_or_else(|_| "12".to_string()).parse().unwrap_or(12),
            },
            cors_origins: env::var("CORS_ORIGINS").unwrap_or_else(|_| "http://localhost:3000".to_string()).split(',').map(|s| s.trim().to_string()).collect(),
            rate_limit_cfg: RateLimitConfig {
                short_window_sec: env::var("AUTH_RATE_LIMIT_SHORT_WINDOW_SEC").unwrap_or_else(|_| "10".to_string()).parse().unwrap_or(10),
                short_max: env::var("AUTH_RATE_LIMIT_SHORT_MAX").unwrap_or_else(|_| "8".to_string()).parse().unwrap_or(8),
                long_window_sec: env::var("AUTH_RATE_LIMIT_LONG_WINDOW_SEC").unwrap_or_else(|_| "600".to_string()).parse().unwrap_or(600),
                long_max: env::var("AUTH_RATE_LIMIT_LONG_MAX").unwrap_or_else(|_| "80".to_string()).parse().unwrap_or(80),
                fail_threshold: env::var("AUTH_FAIL_LOCK_THRESHOLD").unwrap_or_else(|_| "10".to_string()).parse().unwrap_or(10),
                fail_lock_min: env::var("AUTH_FAIL_LOCK_MIN").unwrap_or_else(|_| "15".to_string()).parse().unwrap_or(15),
            },
            reset_cfg: ResetConfig {
                token_ttl_min: env::var("RESET_TOKEN_TTL_MIN").unwrap_or_else(|_| "15".to_string()).parse().unwrap_or(15),
                otp_ttl_min: env::var("RESET_OTP_TTL_MIN").unwrap_or_else(|_| "10".to_string()).parse().unwrap_or(10),
            },
            google_cfg: GoogleConfig {
               client_id: env::var("GOOGLE_CLIENT_ID").unwrap_or_else(|_| "your-google-client-id.apps.googleusercontent.com".to_string()),
               client_secret: env::var("GOOGLE_CLIENT_SECRET").unwrap_or_else(|_| "your-google-client-secret".to_string()),
               redirect_uri: env::var("GOOGLE_REDIRECT_URI").unwrap_or_else(|_| "http://localhost:3000/auth/google/callback".to_string()),
            },
        });
    }
}

pub fn get_config() -> Config {
    if unsafe { GLOBAL_CONFIG.is_none() } {
        init();
    }
    
    unsafe { GLOBAL_CONFIG.clone().unwrap() }
}