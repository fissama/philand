use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    networ_cfg: NetworkConfig,
    database_cfg: DatabaseConfig,
}

impl Config {
    pub fn get_network_config(&self) -> NetworkConfig {
        self.networ_cfg.clone()
    }

    pub fn get_database_config(&self) -> DatabaseConfig {
        self.database_cfg.clone()
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
    host: String,
    port: String,
    user: String,
    password: String,
    database: String,
    url: String,
}

impl DatabaseConfig {
    pub fn get_host(&self) -> String {
        self.host.clone()
    }

    pub fn get_port(&self) -> String {
        self.port.clone()
    }
    
    pub fn get_user(&self) -> String {
        self.user.clone()
    }

    pub fn get_password(&self) -> String {
        self.password.clone()
    }

    pub fn get_database(&self) -> String {
        self.database.clone()
    }

    pub fn get_url(&self) -> String {
        if self.url.is_empty() {
            self.url = format!("postgres://{}:{}@{}:{}/{}",
                self.get_user(),
                self.get_password(),
                self.get_host(),
                self.get_port(),
                self.get_database(),
            );
        }

        self.url.clone()
    }
}

static mut GLOBAL_CONFIG: Option<Config> = None;

pub fn init() {
    unsafe {
        dotenv().ok();
        GLOBAL_CONFIG = Some(Config {
            networ_cfg: NetworkConfig {
                host: env::var("NET_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
                port: env::var("NET_PORT").unwrap_or_else(|_| "3000".to_string()),
            },
            database_cfg: DatabaseConfig {
                host: env::var("DB_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
                port: env::var("DB_PORT").unwrap_or_else(|_| "5432".to_string()),
                user: env::var("DB_USER").unwrap_or_else(|_| "postgres".to_string()),
                password: env::var("DB_PASSWORD").unwrap_or_else(|_| "postgres".to_string()),
                database: env::var("DB_DATABASE").unwrap_or_else(|_| "philand".to_string()),
                url: env::var("DB_URL").unwrap_or_else(|_| self::get_config().get_database_config().get_url()),
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