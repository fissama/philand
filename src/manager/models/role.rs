#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Role { Owner, Manager, Contributor, Viewer }
impl Role {
    pub fn from_str(s: &str) -> Option<Self> {
        match s { "owner"=>Some(Self::Owner), "manager"=>Some(Self::Manager), "contributor"=>Some(Self::Contributor), "viewer"=>Some(Self::Viewer), _=>None }
    }
    // pub fn as_str(&self) -> &'static str {
    //     match self { Self::Owner=>"owner", Self::Manager=>"manager", Self::Contributor=>"contributor", Self::Viewer=>"viewer" }
    // }
    pub fn rank(&self) -> u8 { match self { Self::Owner=>3, Self::Manager=>2, Self::Contributor=>1, Self::Viewer=>0 } }
}
