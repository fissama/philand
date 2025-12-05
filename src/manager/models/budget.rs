use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum BudgetType {
    Standard,
    Saving,
    Debt,
    Invest,
    Sharing,
}

impl std::fmt::Display for BudgetType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BudgetType::Standard => write!(f, "standard"),
            BudgetType::Saving => write!(f, "saving"),
            BudgetType::Debt => write!(f, "debt"),
            BudgetType::Invest => write!(f, "invest"),
            BudgetType::Sharing => write!(f, "sharing"),
        }
    }
}

impl std::str::FromStr for BudgetType {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "standard" => Ok(BudgetType::Standard),
            "saving" => Ok(BudgetType::Saving),
            "debt" => Ok(BudgetType::Debt),
            "invest" => Ok(BudgetType::Invest),
            "sharing" => Ok(BudgetType::Sharing),
            _ => Err(format!("Invalid budget type: {}", s)),
        }
    }
}

impl TryFrom<String> for BudgetType {
    type Error = String;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        value.parse()
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct Budget {
    pub id: String,
    pub owner_id: String,
    pub name: String,
    pub currency_code: String,
    #[sqlx(try_from = "String")]
    pub budget_type: BudgetType,
    pub description: Option<String>,
    pub archived: bool,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Debug, Serialize)]
pub struct BudgetWithRole {
    pub id: String,
    pub owner_id: String,
    pub name: String,
    pub currency_code: String,
    pub budget_type: BudgetType,
    pub description: Option<String>,
    pub archived: bool,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
    pub user_role: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateBudgetReq {
    #[serde(skip_deserializing)]
    pub owner_id: String,
    pub name: String,
    pub currency_code: Option<String>,
    pub budget_type: Option<BudgetType>,
    pub description: Option<String>,
}

