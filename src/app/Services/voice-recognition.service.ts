import { Injectable } from '@angular/core';

declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
   recognition = new (window['webkitSpeechRecognition'] || window['SpeechRecognition'])
  //recognition = new webkitSpeechRecognition();
  isStoppedSpeechRecog = false;
  public text = '';
  tempWords: string = '';
  commandCallback: (command: string, value?: any) => void;
  private commandProcessed = false;
  

  constructor() {
    this.initEventListeners();
  }

  // init(commandCallback: (command: string, value?: number) => void) {
  //   this.commandCallback = commandCallback;
  //   this.recognition.interimResults = true;
  //   this.recognition.continuous = true;
  //   this.recognition.lang = 'en-US';
  
  //   this.recognition.addEventListener('result', (e: any) => {
  //     let transcript = '';
  //     for (let i = 0; i < e.results.length; i++) {
  //       const result = e.results[i];
  //       if (result.isFinal) {
  //         transcript += result[0].transcript;
  //       }
  //     }
      
  //     if (transcript && !this.commandProcessed) {
  //       this.tempWords = transcript.trim();
  //       console.log('Final transcript:', transcript);
  //       this.checkForCommand(transcript);
  //     } else {
  //       console.log('Interim transcript:', transcript);
  //     }
  //   // }
  //   });
  //   this.recognition.onresult = (e: any) => {
  //     let interimTranscript = '';
  //     let finalTranscript = '';

  //     for (let i = 0; i < e.results.length; i++) {
  //       const result = e.results[i];
  //       const transcript = result[0].transcript;

  //       if (result.isFinal) {
  //         finalTranscript += transcript;
  //       }
  //     }

  //     if (finalTranscript) {
  //       this.tempWords = finalTranscript.trim();
  //       console.log('Final transcript:', finalTranscript);
  //       this.checkForCommand(finalTranscript);
  //     } else {
  //       console.log('Interim transcript:', interimTranscript);
  //     }
  //   };
  // }
  init(commandCallback: (command: string, value?: number) => void) {
    this.commandCallback = commandCallback;
  
    // Ensure the recognition object is correctly initialized
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition(); // Initialize recognition object
      this.recognition.continuous = true; // Set to false for non-continuous listening
      this.recognition.interimResults = false; // No interim results
      this.recognition.lang = 'en-US'; // Language
  
      // Add event listener for 'result'
      this.recognition.onresult = (e: any) => {
        // Process the final result
        const finalTranscript = e.results[0][0].transcript;
        console.log('Final transcript:', finalTranscript);
        this.tempWords = finalTranscript.trim();
        this.checkForCommand(finalTranscript); // Your custom command processing
      };
  
      // this.recognition.onerror = (e: any) => {
      //   console.error('Speech recognition error:', e);
      // };
  
      this.recognition.onend = () => {
        console.log('Speech recognition ended');
      };
  
      // Start recognition
      this.recognition.start();
    } else {
      alert('Your browser does not support voice recognition!');
    }
  }
  
  checkForCommand(transcript: string) {
    // alert(transcript)
    const normalizedTranscript = transcript.trim().toLowerCase();
    if (normalizedTranscript.includes('done')) {
      this.commandCallback('done');
    } else if (normalizedTranscript.includes('next')) {
      this.commandCallback('next');
    } else if (normalizedTranscript.includes('change quantity to')) {
      const quantityMatch = normalizedTranscript.match(/change quantity to (\d+)/);
      if (quantityMatch && quantityMatch[1]) {
        const quantity = parseInt(quantityMatch[1], 10);
        this.commandCallback('change quantity to', quantity);
      }
    }else if (normalizedTranscript.includes('change item name to')) {
      const itemNameMatch = transcript.match(/change item name to (.+)/i);
      if (itemNameMatch && itemNameMatch[1]) {
        const itemName = itemNameMatch[1].trim();
        this.commandCallback('change item name to', itemName);
        // this.commandProcessed = true; // Mark command as processed
      }
    }else if (normalizedTranscript.includes('read slot')) {
      const slotMatch = normalizedTranscript.match(/read slot (\d{2})/);
      if (slotMatch && slotMatch[1]) {
        const rackId = parseInt(slotMatch[1][0], 10);  // First digit as rackId
        const slotId = parseInt(slotMatch[1][1], 10);  // Second digit as slotId
        this.commandCallback('read slot', { rackId, slotId });
      }
    }
    else{
      this.commandCallback(normalizedTranscript);
    }
    // Add more commands as needed
  }

  start() {
    this.isStoppedSpeechRecog = false;
    this.recognition.start();
    console.log('Speech recognition started');
  }

  stop() {
    this.isStoppedSpeechRecog = true;
    this.wordConcat();
    this.recognition.stop();
    console.log('End speech recognition');
  }

  wordConcat() {
    this.text = this.text + ' ' + this.tempWords + '.';
    this.tempWords = '';
  }

  private initEventListeners() {
    this.recognition.onend = () => {
      if (this.isStoppedSpeechRecog) {
        console.log('End speech recognition');
      } else {
        this.wordConcat();
        this.recognition.start();
      }
    };
  }
}
