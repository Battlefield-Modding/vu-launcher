/*
Copyright 2025 Limit Theory Redux Team

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

use std::collections::VecDeque;

pub struct SpeedCalculator {
    window: VecDeque<f64>,
    window_size: usize,
}

impl SpeedCalculator {
    pub fn new(window_size: usize) -> Self {
        SpeedCalculator {
            window: VecDeque::with_capacity(window_size),
            window_size,
        }
    }

    pub fn add_speed(&mut self, speed: f64) {
        if self.window.len() == self.window_size {
            self.window.pop_front();
        }
        self.window.push_back(speed);
    }

    pub fn average_speed(&self) -> f64 {
        self.window.iter().sum::<f64>() / self.window.len() as f64
    }
}
