use serde::{Deserialize, Serialize};

const VU_ENDPOINT: &str = "https://veniceunleashed.net/latest-build";

#[derive(Serialize, Deserialize, Debug)]
pub struct VeniceEndpointData {
    pub buildnum: i32,
    pub installer_url: String,
    pub installer_size: i32,
    pub zip_url: String,
    pub zip_size: i32,
}

pub async fn get_vu_info() -> Result<VeniceEndpointData, Box<dyn std::error::Error>> {
    let info = reqwest::get(VU_ENDPOINT).await?.json().await?;
    println!("{:?}", info);
    return Ok(info);
}
