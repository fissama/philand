#[path = "utils/tables/tables.rs"] mod tables;

fn main() {
    println!("Hello, world! {}", tables::USERS);
}
