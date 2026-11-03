import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-scan-to-text',
  templateUrl: './scan-to-text.component.html',
  styleUrls: ['./scan-to-text.component.scss']
})
export class ScanToTextComponent implements OnInit {
  scannedText: string = '';
  private apiUrl = 'https://vision.googleapis.com/v1/images:annotate'; // Google Vision API endpoint
  private apiKey = 'AIzaSyBZpFUbVrUQPz89xJlA7IcCj-UGQ5Y5NU4'; 

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  // Method triggered when a file is selected
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64Image = (reader.result as string).split(',')[1]; // Remove the metadata part
        this.scanImage(base64Image);
      };

      reader.readAsDataURL(file);
    }
  }

  // Method to send the image to the Google Vision API for OCR processing
  private scanImage(base64Image: string): void {
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
            },
          ],
        },
      ],
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // Call the OCR API
    this.http.post(`${this.apiUrl}?key=${this.apiKey}`, requestBody, { headers }).subscribe(
      (response: any) => {
        // Handle response and extract text
        this.scannedText = response.responses[0]?.fullTextAnnotation?.text || 'No text detected.';
      },
      (error) => {
        console.error('OCR Error:', error);
        this.scannedText = 'Error occurred during scanning.';
      }
    );
  }
}
 