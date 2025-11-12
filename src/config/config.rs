use std::env;
use dotenvy::dotenv;

#[derive(Debug, Clone)]
pub struct Config {
    network_cfg: NetworkConfig,
    database_cfg: DatabaseConfig,
    jwt_cfg: JwtConfig,
    cors_origins: Vec<String>,
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
        });
    }
}

pub fn get_config() -> Config {
    if unsafe { GLOBAL_CONFIG.is_none() } {
        init();
    }
    
    unsafe { GLOBAL_CONFIG.clone().unwrap() }
}