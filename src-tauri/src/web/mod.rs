// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::Emitter;

const VU_ENDPOINT: &str = "https://veniceunleashed.net/latest-build";

use crate::speed_calc::SpeedCalculator;

use futures_util::StreamExt;
use reqwest::Client;
use serde_json::json;
use std::env;
use std::io;
use std::path::Path;
use std::str::FromStr;
use tauri::{AppHandle, Manager, Runtime};
use tokio::fs::{File, OpenOptions};
use tokio::io::AsyncWriteExt;
use tokio::time::{timeout, Duration as TokioDuration};
use winreg::enums::*;
use winreg::RegKey;

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

/*
****************************************************************************
***** Everything below here is copied from Limit Theory Redux Launcher *****
****************************************************************************

Copyright 2025 Limit Theory Redux Team

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

async fn extract_zip<R: Runtime>(
    zip_path: &Path,
    path: &Path,
    main_window: &tauri::WebviewWindow<R>,
) -> Result<(), String> {
    use std::fs::{self, File as StdFile};
    use zip::ZipArchive; // Sync for zip extraction (non-blocking)

    if !path.exists() {
        fs::create_dir_all(path).map_err(|e| e.to_string())?;
        env::set_current_dir(path).map_err(|e| e.to_string())?;
        println!(
            "Successfully changed working directory to {}!",
            path.display()
        );
    } else {
        env::set_current_dir(path).map_err(|e| e.to_string())?;
        println!(
            "Successfully changed working directory to {}!",
            path.display()
        );
    }

    let file = StdFile::open(zip_path).map_err(|e| format!("Failed to open zip: {}", e))?;
    let mut archive =
        ZipArchive::new(file).map_err(|e| format!("Failed to read zip archive: {}", e))?;
    let archive_len = archive.len() as i64;

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| format!("Failed to access zip entry {}: {}", i, e))?;
        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };

        {
            let comment = file.comment();
            if !comment.is_empty() {
                println!("File {i} comment: {comment}");
            }
        }

        if (*file.name()).ends_with('/') {
            println!("File {} extracted to \"{}\"", i, outpath.display());
            fs::create_dir_all(&outpath)
                .map_err(|e| format!("Failed to create dir {}: {}", outpath.display(), e))?;
        } else {
            println!(
                "File {} extracted to \"{}\" ({} bytes)",
                i,
                outpath.display(),
                file.size()
            );
            if let Some(p) = outpath.parent() {
                fs::create_dir_all(p).map_err(|e| {
                    format!(
                        "Failed to create parent dir for {}: {}",
                        outpath.display(),
                        e
                    )
                })?;
            }
            let mut outfile = fs::File::create(&outpath).map_err(|e| {
                format!("Failed to create output file {}: {}", outpath.display(), e)
            })?;
            io::copy(&mut file, &mut outfile)
                .map_err(|e| format!("Failed to copy file {}: {}", outpath.display(), e))?;
        }

        // Emit remaining files (convert to i64 if needed)
        let remaining = archive_len - (i as i64 + 1);
        main_window
            .emit("extracting-files", remaining)
            .map_err(|e| format!("Failed to emit extracting-files: {}", e))?;
    }

    Ok(())
}

fn delete_directory_contents(dir: std::fs::ReadDir) {
    for entry in dir {
        let path = entry.unwrap().path();
        if path.is_dir() {
            delete_directory_contents(std::fs::read_dir(&path).unwrap());
            std::fs::remove_dir(&path).unwrap();
        } else {
            std::fs::remove_file(&path).unwrap();
        }
    }
}

#[cfg(target_os = "windows")]
fn save_installation_path(install_path: &Path) -> io::Result<()> {
    let hklm = RegKey::predef(HKEY_CURRENT_USER);
    let path;
    if cfg!(debug_assertions) {
        path = r"SOFTWARE\vu-launcher\vu-launcher-dev";
    } else {
        path = r"SOFTWARE\vu-launcher\vu-launcher";
    }
    let (key, _disp) = hklm.create_subkey(&path)?;

    key.set_value("InstallPath", &install_path.to_str().unwrap())?;
    Ok(())
}

#[tauri::command]
#[cfg(target_os = "windows")]
pub async fn download_game<R: Runtime>(
    app: AppHandle<R>,
    install_path: &str,
) -> Result<(), String> {
    use std::time::{Duration as StdDuration, Instant};

    use crate::preferences::set_default_preferences;

    let client = Client::builder()
        .timeout(StdDuration::from_secs(30))
        .build()
        .map_err(|_| "Failed to create HTTP client")?;

    let temp_dir = std::env::temp_dir();
    let url = "https://veniceunleashed.net/files/vu.zip".to_string();
    let dl_file_path = temp_dir.join("vu_launcher-windows.zip");
    let installation_path = Path::new(&install_path).join("VeniceUnleashed");

    // Partial/resume support
    let mut downloaded: u64 = 0;
    let resumed = dl_file_path.exists() && {
        if let Ok(metadata) = std::fs::metadata(&dl_file_path) {
            downloaded = metadata.len();
            true
        } else {
            false
        }
    };
    if resumed {
        println!("Resuming from partial download: {} bytes", downloaded);
    }

    let mut total_size: u64 = 0;

    let Some(main_window) = app.get_webview_window("main") else {
        return Ok(());
    };

    // Global timeout for entire download (safety net: 30min total)
    let global_timeout = StdDuration::from_secs(1800); // 30 minutes
    let download_start = Instant::now();
    println!(
        "Download started – global timeout: {}s",
        global_timeout.as_secs()
    );

    // Infinite retry loop (no attempt count – run until done or global timeout)
    let mut local_file: Option<File> = None;
    let retry_delay = StdDuration::from_secs(2);
    let mut stream_dropped = true; // Track for explicit drop

    'download_loop: loop {
        // Check global timeout first
        let global_elapsed = download_start.elapsed();
        if global_elapsed >= global_timeout {
            println!(
                "Global timeout after {:.1}s total – stalling to manual resume",
                global_elapsed.as_secs_f64()
            );
            // Flush any partial
            if let Some(mut f) = local_file.take() {
                let _ = f.flush().await;
                let _ = f.sync_all().await;
            }
            let progress = if total_size > 0 {
                (downloaded as f64 / total_size as f64) * 100.0
            } else {
                0.0
            };
            let _ = main_window.emit("download-stalled", ());
            return Err(format!("Download stalled after {}s global timeout (progress: {:.1}%). Check connection and resume.", global_timeout.as_secs(), progress));
        }
        println!(
            "Global elapsed: {:.1}s – continuing (downloaded {} / {})",
            global_elapsed.as_secs_f64(),
            downloaded,
            total_size
        );

        // Setup/Re-setup file for append – SYNC SIZE ON REOPEN
        let mut new_file = if dl_file_path.exists() {
            // Always check current disk size to sync counter (handles any drift)
            if let Ok(metadata) = std::fs::metadata(&dl_file_path) {
                let current_size = metadata.len();
                if current_size != downloaded {
                    println!(
                        "Disk sync: File {} != memory {} – updating downloaded",
                        current_size, downloaded
                    );
                    downloaded = current_size;
                }
            }
            OpenOptions::new()
                .append(true)
                .open(&dl_file_path)
                .await
                .map_err(|e| format!("File append failed: {}", e))?
        } else if resumed {
            OpenOptions::new()
                .append(true)
                .open(&dl_file_path)
                .await
                .map_err(|e| format!("Error opening partial file: {}", e))?
        } else {
            File::create(&dl_file_path)
                .await
                .map_err(|e| format!("Error creating file: {}", e))?
        };

        // Initial sync
        let _ = new_file.flush().await;
        new_file
            .sync_all()
            .await
            .map_err(|e| format!("Initial sync failed: {}", e))?;
        local_file = Some(new_file);
        println!("Loop iteration: Appended file from {} bytes", downloaded);

        // Setup request
        let mut request = client.get(&url);
        if downloaded > 0 {
            request = request.header("Range", format!("bytes={}-", downloaded));
        }

        let response = request
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        let status = response.status();
        if status != 200 && status != 206 {
            println!(
                "Invalid status {} – retrying after {}s",
                status,
                retry_delay.as_secs()
            );
            if let Some(mut f) = local_file.take() {
                let _ = f.flush().await;
                let _ = f.sync_all().await;
            }
            tokio::time::sleep(retry_delay).await;
            continue 'download_loop;
        }

        // Determine total_size (once or reuse)
        let local_total_size = if total_size == 0 {
            if let Some(content_range) = response.headers().get("Content-Range") {
                if let Ok(range_str) = content_range.to_str() {
                    if let Some(total_start) = range_str.rfind('/') {
                        if let Ok(full_total) = range_str[total_start + 1..].parse() {
                            println!("Total size from Content-Range: {} bytes", full_total);
                            full_total
                        } else {
                            0
                        }
                    } else {
                        0
                    }
                } else {
                    0
                }
            } else if status == 200 {
                response.content_length().unwrap_or(0)
            } else if let Some(remaining) = response.content_length() {
                downloaded + remaining
            } else {
                0
            }
        } else {
            total_size
        };
        if local_total_size == 0 {
            let head_client = Client::new();
            let head_response = head_client
                .head(&url)
                .send()
                .await
                .map_err(|e| format!("Head probe failed: {}", e))?;
            total_size = head_response.content_length().unwrap_or(0);
            println!("Total size from HEAD probe: {} bytes", total_size);
        } else {
            total_size = local_total_size;
        }

        // Validate resume
        if downloaded > total_size {
            let _ = std::fs::remove_file(&dl_file_path);
            main_window
                .emit(
                    "download-corrupt",
                    json!({"reason": "partial-oversize", "progress": 0.0, "action": "deleted"}),
                )
                .ok();
            return Err("Corrupt partial – deleted for fresh start".to_string());
        }

        main_window
            .emit("download-total-size", total_size as f64)
            .ok();
        if resumed && downloaded > 0 && total_size > 0 {
            let initial_progress = (downloaded as f64 / total_size as f64) * 100.0;
            main_window.emit("download-progress", initial_progress).ok();
        }

        let mut local_stream = response.bytes_stream();
        let mut speed_calculator = SpeedCalculator::new(5000);
        let mut last_speed_time = Instant::now();
        let mut last_downloaded_local = downloaded;
        let mut last_speed_emit_time = Instant::now();
        let mut last_progress_check = downloaded;

        // Per-iteration stall detection (timeouts only – triggers retry)
        let chunk_timeout = TokioDuration::from_secs(10);
        let stall_timeout = StdDuration::from_secs(30);
        let max_consecutive_timeouts = 3;
        let progress_window_duration = StdDuration::from_secs(20);

        let mut no_progress_start = Instant::now();
        let mut consecutive_timeouts = 0;

        'stream_loop: loop {
            // Global timeout check inside stream loop too
            if download_start.elapsed() >= global_timeout {
                println!("Global timeout during stream – stalling");
                break 'download_loop;
            }

            if downloaded >= total_size {
                break 'download_loop; // Success!
            }

            // Manual elapsed for chunk timeout
            let chunk_start = Instant::now();
            let next_result = timeout(chunk_timeout, local_stream.next()).await;
            let chunk_elapsed = chunk_start.elapsed().as_secs_f64();

            match next_result {
                Ok(Some(item)) => {
                    match item {
                        Ok(chunk) => {
                            if chunk.is_empty() {
                                println!("Empty chunk – end of stream");
                                break 'download_loop;
                            }

                            // Success: Reset, write + flush
                            consecutive_timeouts = 0;
                            local_file
                                .as_mut()
                                .unwrap()
                                .write_all(&chunk)
                                .await
                                .map_err(|e| format!("Error writing chunk: {}", e))?;
                            downloaded += chunk.len() as u64;
                            last_progress_check = downloaded;

                            local_file.as_mut().unwrap().flush().await.ok();

                            // Overshoot protection
                            if downloaded > total_size {
                                println!("Overshoot: {} > {} – truncating", downloaded, total_size);
                                if local_file
                                    .as_mut()
                                    .unwrap()
                                    .set_len(total_size)
                                    .await
                                    .is_err()
                                {
                                    println!("Truncate failed during stream");
                                    break 'download_loop;
                                }
                                downloaded = total_size;
                                local_file.as_mut().unwrap().sync_all().await.ok();
                                main_window.emit("download-corrupt", json!({"reason": "overshoot-truncated", "progress": 100.0, "action": "truncated"})).ok();
                            }

                            no_progress_start = Instant::now();
                            println!(
                                "Progress: {} bytes (after {:.1}s chunk)",
                                downloaded, chunk_elapsed
                            );

                            let progress = (downloaded as f64 / total_size as f64) * 100.0;
                            main_window.emit("download-progress", progress).ok();

                            // Speed calc
                            let time_since_last = last_speed_time.elapsed().as_secs_f64();
                            if time_since_last >= 0.5 {
                                let speed = ((downloaded - last_downloaded_local) as f64 / 1024.0)
                                    / time_since_last;
                                if speed > 0.0 {
                                    speed_calculator.add_speed(speed);
                                }
                                let average_speed = speed_calculator.average_speed().max(0.0);
                                if last_speed_emit_time.elapsed() > StdDuration::from_millis(500) {
                                    println!("Speed: {:.2} KB/s", average_speed);
                                    main_window.emit("download-speed", average_speed).ok();
                                    last_speed_emit_time = Instant::now();
                                }
                                last_downloaded_local = downloaded;
                                last_speed_time = Instant::now();
                            }
                        }
                        Err(decode_error) => {
                            consecutive_timeouts += 1;
                            println!(
                                "Decode error (consecutive: {}) after {:.1}s",
                                consecutive_timeouts, chunk_elapsed
                            );
                            if consecutive_timeouts >= max_consecutive_timeouts {
                                println!("Max consecutive decode errors – retrying stream");
                                break 'stream_loop;
                            }
                        }
                    }
                }
                Ok(None) => {
                    println!("Stream ended normally");
                    break 'download_loop;
                }
                Err(_) => {
                    // Chunk timeout
                    consecutive_timeouts += 1;
                    println!(
                        "Chunk timeout after {:.1}s (consecutive: {})",
                        chunk_elapsed, consecutive_timeouts
                    );

                    let elapsed_no_progress = no_progress_start.elapsed().as_secs_f64();
                    if elapsed_no_progress < progress_window_duration.as_secs_f64()
                        && downloaded > last_progress_check
                    {
                        no_progress_start = Instant::now();
                        println!("Recent progress – resetting stall timer");
                    }

                    // Stall check: End this stream iteration (retry new one)
                    if consecutive_timeouts >= max_consecutive_timeouts
                        || no_progress_start.elapsed() >= stall_timeout
                    {
                        let reason = if consecutive_timeouts >= max_consecutive_timeouts {
                            "consecutive timeouts"
                        } else {
                            "no progress"
                        };
                        println!(
                            "Stall detected after {:.1}s {} – auto-retrying new stream",
                            chunk_elapsed, reason
                        );
                        break 'stream_loop;
                    }
                }
            }
        }

        // End of iteration (stall or end) – prepare for retry or complete
        if let Some(mut f) = local_file.take() {
            let _ = f.flush().await;
            f.sync_all().await.ok();
        }
        drop(local_stream); // Ensure drop
        stream_dropped = true;

        if downloaded >= total_size {
            break 'download_loop; // Complete – exit
        }

        // Auto-retry: No limit, just delay and loop
        println!(
            "Auto-retrying from {} bytes after {}s delay (global elapsed: {:.1}s)",
            downloaded,
            retry_delay.as_secs(),
            download_start.elapsed().as_secs_f64()
        );
        tokio::time::sleep(retry_delay).await;
    }

    // Download complete – FINAL SYNC & VALIDATION (unchanged)
    println!("Download complete – performing final sync and validation");
    if dl_file_path.exists() {
        if let Some(mut existing_file) = local_file.take() {
            existing_file.flush().await.ok();
            if let Err(e) = existing_file.sync_all().await {
                println!("Final sync warning: {}", e);
            }
        } else {
            let mut reopen_file = OpenOptions::new()
                .write(true)
                .open(&dl_file_path)
                .await
                .map_err(|e| format!("Reopen for final sync failed: {}", e))?;
            reopen_file
                .sync_all()
                .await
                .map_err(|e| format!("Final sync failed: {}", e))?;
        }
        tokio::time::sleep(StdDuration::from_millis(100)).await;
        println!("Final sync complete");
    }

    main_window.emit("download-progress", 100.0f64).ok();

    println!(
        "Validation: In-memory = {} bytes, total_size = {} bytes",
        downloaded, total_size
    );
    if let Ok(metadata) = std::fs::metadata(&dl_file_path) {
        let file_len = metadata.len();
        println!("On-disk file len = {} bytes", file_len);
        if file_len == total_size {
            println!("Validation passed: Exact match");
        } else {
            let delta = (file_len as i64 - total_size as i64).abs();
            if delta < 1024 {
                println!("Minor delta ({} bytes) – tolerating as complete", delta);
            } else if file_len > total_size {
                println!("Overshoot ({file_len} > {total_size}) – retrying truncate");
                if let Ok(mut truncate_file) = File::options().write(true).open(&dl_file_path).await
                {
                    if truncate_file.set_len(total_size).await.is_ok() {
                        truncate_file.sync_all().await.ok();
                        tokio::time::sleep(StdDuration::from_millis(100)).await;
                        if let Ok(new_metadata) = std::fs::metadata(&dl_file_path) {
                            let new_len = new_metadata.len();
                            println!("Post-truncate len = {new_len} bytes");
                            if new_len == total_size {
                                println!("Truncate succeeded – passed");
                            } else {
                                let _ = std::fs::remove_file(&dl_file_path);
                                main_window.emit("download-corrupt", json!({"reason": "size-mismatch", "progress": 100.0, "action": "deleted"})).ok();
                                return Err("Mismatch after truncate – deleted".to_string());
                            }
                        } else {
                            let _ = std::fs::remove_file(&dl_file_path);
                            main_window.emit("download-corrupt", json!({"reason": "no-metadata", "progress": 100.0, "action": "deleted"})).ok();
                            return Err("Could not re-validate".to_string());
                        }
                    } else {
                        let _ = std::fs::remove_file(&dl_file_path);
                        main_window.emit("download-corrupt", json!({"reason": "truncate-fail", "progress": 100.0, "action": "deleted"})).ok();
                        return Err("Truncate failed – deleted".to_string());
                    }
                } else {
                    let _ = std::fs::remove_file(&dl_file_path);
                    main_window.emit("download-corrupt", json!({"reason": "size-mismatch", "progress": 100.0, "action": "deleted"})).ok();
                    return Err("Reopen for truncate failed".to_string());
                }
            } else {
                println!("Incomplete ({file_len} < {total_size}) – error");
                let _ = std::fs::remove_file(&dl_file_path);
                main_window
                    .emit(
                        "download-corrupt",
                        json!({"reason": "incomplete", "progress": 100.0, "action": "deleted"}),
                    )
                    .ok();
                return Err("File incomplete – deleted for retry".to_string());
            }
        }
    } else {
        println!("No metadata – error");
        let _ = std::fs::remove_file(&dl_file_path);
        main_window
            .emit(
                "download-corrupt",
                json!({"reason": "no-metadata", "progress": 100.0, "action": "deleted"}),
            )
            .ok();
        return Err("Could not verify file – deleted".to_string());
    }

    // Cleanup old install
    if let Ok(dir) = std::fs::read_dir(&installation_path) {
        delete_directory_contents(dir);
        println!("Deleted old installation contents");
    }

    main_window.emit("download-extracting", ()).ok();

    match extract_zip(&dl_file_path, &installation_path, &main_window).await {
        Ok(_) => {
            println!("ZIP extracted successfully!");
            // FIXED: Emit vu-install-complete with success payload + path (matches frontend listener)
            let install_path_str = installation_path.to_str().unwrap_or("");
            let _ = main_window.emit(
                "vu-install-complete",
                json!({
                    "success": true,
                    "path": install_path_str
                }),
            );
            println!(
                "Emitting vu-install-complete: success=true, path={}",
                install_path_str
            );
        }
        Err(e) => {
            println!("Extract error: {}", e);
            let _ = std::fs::remove_file(&dl_file_path);
            let reason = if e.to_string().contains("invalid Zip")
                || e.to_string().contains("EOCD")
                || e.to_string().contains("corrupt")
            {
                "zip-invalid"
            } else {
                "extract-fail"
            };
            // FIXED: Emit failure payload too (for consistency)
            let _ = main_window.emit(
                "vu-install-complete",
                json!({
                    "success": false,
                    "error": e.to_string()
                }),
            );
            println!(
                "Emitting vu-install-complete: success=false (extract fail: {})",
                e
            );
            main_window.emit("download-corrupt", json!({"reason": reason, "progress": 100.0, "action": "deleted", "error": e.to_string()})).ok();
            return Err(format!(
                "Extraction failed ({}): {}. Deleted ZIP – retry.",
                reason, e
            ));
        }
    }

    let _ = std::fs::remove_file(&dl_file_path);
    println!("Downloaded ZIP deleted successfully");

    if let Err(e) = save_installation_path(&installation_path) {
        println!("Registry error: {}", e);
    }
    set_default_preferences();

    println!(
        "Download completed successfully in {:.1}s total",
        download_start.elapsed().as_secs_f64()
    );
    Ok(())
}
