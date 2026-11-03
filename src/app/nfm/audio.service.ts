import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private audio = new Audio();
    private interval: any;
    constructor() {
        this.audio.src = './assets/audio/Task_alarm.mp3';
    }
    play() {
        this.audio.play();
        setTimeout(() => {
            this.interval = setInterval(() => {
                this.audio.play();
            }, 3000);
        }, 3000);
    }
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        clearInterval(this.interval);
        console.log('cleared');
    }
    playOrderAudio() {
        this.audio.play();
        setTimeout(() => {
            this.interval = setInterval(() => {
                this.audio.play();
            }, 3000);
        }, 2000);
    }
}
