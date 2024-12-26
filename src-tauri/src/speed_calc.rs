// ****************************************************************************
// ***** Everything below here is copied from Limit Theory Redux Launcher *****
// ****************************************************************************

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
