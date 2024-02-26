use std::{error::Error, path::PathBuf};

use tokio::fs::create_dir_all;

pub struct PackageConfiguration<'s> {
    pub package_name: &'s str,
    pub package_version: &'s str,
    pub package_directory: &'s str,
}

pub async fn generate_package(
    configuration: PackageConfiguration<'_>,
) -> Result<(), Box<dyn Error>> {
    let PackageConfiguration {
        package_name,
        package_version,
        package_directory: package_directory_path,
    } = configuration;

    let mut path = PathBuf::new();
    path.push(package_directory_path);
    create_dir_all(path).await?;

    let mut path = PathBuf::new();
    path.push(package_directory_path);
    path.push("src");
    create_dir_all(path).await?;

    Ok(())
}
