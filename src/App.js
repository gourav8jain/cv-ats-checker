import React, { useState } from 'react';
import { Upload, FileText, Link, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js with stable worker and fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
} catch (error) {
  // Fallback to local worker if CDN fails
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

function App() {
  const [jobTitle, setJobTitle] = useState('');
  const [jdLink, setJdLink] = useState('');
  const [cvText, setCvText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isScannedPDF, setIsScannedPDF] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [problems, setProblems] = useState([]);

  const extractTextFromPDF = async (file) => {
    try {
      console.log('Starting PDF text extraction for:', file.name);
      
      // Add timeout for PDF processing
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PDF processing timeout')), 45000); // 45 second timeout
      });

      const processPromise = (async () => {
        // Convert file to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
        
        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          verbosity: 0, // Reduce console output
          disableWorker: false, // Enable worker for better performance
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true
        });
        
        // If worker fails, try without worker
        let pdf;
        try {
          pdf = await loadingTask.promise;
        } catch (workerError) {
          console.warn('Worker failed, trying without worker:', workerError);
          const fallbackTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            disableWorker: true, // Disable worker as fallback
            verbosity: 0
          });
          pdf = await fallbackTask.promise;
        }
        
        console.log('PDF loaded successfully, total pages:', pdf.numPages);
        
        if (pdf.numPages === 0) {
          throw new Error('PDF has no pages');
        }
        
        let extractedText = '';
        let successfulPages = 0;
        let failedPages = 0;
        
        // Process each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          try {
            console.log(`Processing page ${pageNum}/${pdf.numPages}`);
            
            const page = await pdf.getPage(pageNum);
            
            // Get text content from the page
            const textContent = await page.getTextContent();
            
            if (textContent && textContent.items && textContent.items.length > 0) {
              // Extract text from each text item
              const pageText = textContent.items
                .map(item => item.str || '')
                .filter(str => str && str.trim())
                .join(' ');
              
              if (pageText.trim()) {
                extractedText += pageText + '\n';
                successfulPages++;
                console.log(`Page ${pageNum}: Extracted ${pageText.length} characters`);
              } else {
                console.log(`Page ${pageNum}: No text content found`);
                failedPages++;
              }
            } else {
              console.log(`Page ${pageNum}: No text items found`);
              failedPages++;
            }
          } catch (pageError) {
            console.warn(`Error processing page ${pageNum}:`, pageError);
            failedPages++;
          }
        }
        
        console.log(`PDF processing completed. Successful: ${successfulPages}, Failed: ${failedPages}`);
        
        // Check if we got any meaningful text
        if (!extractedText.trim()) {
          console.warn('No text content could be extracted from PDF');
          setIsScannedPDF(true);
          return 'PDF uploaded (scanned/image-based document - no text content available for analysis)';
        }
        
        // If most pages failed, it might be a scanned document
        if (failedPages > successfulPages) {
          console.warn('Many pages failed to process - likely a scanned document');
          setIsScannedPDF(true);
          return `PDF uploaded (partial text extracted from ${successfulPages}/${pdf.numPages} pages - limited analysis available)`;
        }
        
        setIsScannedPDF(false);
        console.log('Text extraction successful, total length:', extractedText.length);
        return extractedText;
      })();

      // Race between processing and timeout
      return await Promise.race([processPromise, timeoutPromise]);
      
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      
      // Provide specific error messages
      if (error.message === 'PDF processing timeout') {
        throw new Error('PDF processing took too long. The file might be too large or complex. Please try a smaller file or convert to Word format.');
      } else if (error.name === 'PasswordException') {
        throw new Error('This PDF is password-protected. Please remove the password and try again.');
      } else if (error.name === 'InvalidPDFException') {
        throw new Error('This file appears to be corrupted or not a valid PDF. Please try a different file.');
      } else if (error.message.includes('network')) {
        throw new Error('Network error while processing PDF. Please check your internet connection and try again.');
      } else {
        throw new Error(`PDF processing failed: ${error.message}. Please try a different file or convert to Word format.`);
      }
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document (.pdf, .docx, .doc)');
      return;
    }

    // Check file size (limit to 20MB for PDFs, 10MB for Word docs)
    const maxSize = file.type === 'application/pdf' ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large. Please use files smaller than ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    setIsProcessingFile(true);
    setIsScannedPDF(false);
    setCvText('');
    
    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.type === 'application/msword') {
        try {
          console.log('Processing Word document:', file.name);
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          
          if (!result.value || !result.value.trim()) {
            throw new Error('No text content found in Word document');
          }
          
          text = result.value;
          console.log('Word document processed successfully, text length:', text.length);
        } catch (wordError) {
          console.error('Word document processing failed:', wordError);
          alert('Error processing Word document. Please try a different file or convert to PDF.');
          return;
        }
      }
      
      setCvText(text);
      console.log('File processing completed successfully');
      
    } catch (error) {
      console.error('File processing error:', error);
      alert(error.message);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: false,
    disabled: isProcessingFile
  });

  const analyzeATS = async () => {
    if (!cvText || !jobTitle) {
      alert('Please upload a CV and enter a job title');
      return;
    }

    // Check if API key is available
    const apiKey = process.env.REACT_APP_AI_API_KEY;
    if (!apiKey) {
      alert('AI API key not configured. Please check your environment setup.');
      return;
    }

    setIsAnalyzing(true);
    setAtsScore(null);
    setRecommendations([]);
    setProblems([]);

    try {
      // Initialize AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Analyze this CV for ATS (Applicant Tracking System) compatibility for the position of "${jobTitle}".
        
        CV Content:
        ${cvText}
        
        Job Description Link: ${jdLink || 'Not provided'}
        
        Please provide:
        1. An ATS score from 0-100 with explanation
        2. List of specific problems that could hurt ATS scoring
        3. Actionable recommendations to improve ATS score
        
        Format your response as JSON:
        {
          "score": number,
          "scoreExplanation": "string",
          "problems": ["string"],
          "recommendations": ["string"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setAtsScore(parsed.score);
          setProblems(parsed.problems || []);
          setRecommendations(parsed.recommendations || []);
        } else {
          // Fallback parsing
          const scoreMatch = text.match(/(\d+)/);
          if (scoreMatch) {
            setAtsScore(parseInt(scoreMatch[1]));
          }
          setRecommendations([text]);
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        setRecommendations([text]);
      }
    } catch (error) {
      console.error('Error analyzing CV:', error);
      
      if (error.message.includes('API key')) {
        alert('Invalid or missing API key. Please check your AI API key and try again.');
      } else if (error.message.includes('quota')) {
        alert('API quota exceeded. Please check your AI API usage limits.');
      } else {
        alert(`Error analyzing CV: ${error.message}. Please try again.`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-300';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">CV ATS Checker</h1>
          </div>
          <p className="text-white/80 text-lg">Get instant ATS scoring and recommendations for your CV</p>
        </div>

        {/* Main Form */}
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-white font-medium mb-2">Job Title *</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Software Engineer, Marketing Manager"
                className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Job Description Link (Optional)</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <input
                  type="url"
                  value={jdLink}
                  onChange={(e) => setJdLink(e.target.value)}
                  placeholder="https://example.com/job-description"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">Upload CV *</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-400 bg-primary-50/20'
                  : 'border-white/30 hover:border-white/50'
              } ${isProcessingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} disabled={isProcessingFile} />
              {isProcessingFile ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-white/60 animate-spin" />
                  <p className="text-white">Processing your CV...</p>
                  <p className="text-white/60 text-sm">This may take a few moments</p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-white">Drop your CV here...</p>
                  ) : (
                    <div>
                      <p className="text-white mb-2">Drag & drop your CV here, or click to select</p>
                      <p className="text-white/60 text-sm">Supports PDF and Word documents</p>
                      <p className="text-white/40 text-xs mt-1">For best results, use text-based PDFs (not scanned documents)</p>
                    </div>
                  )}
                </>
              )}
            </div>
            {cvText && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg">
                <div className="flex items-center gap-2 text-white/80 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">CV loaded successfully</span>
                </div>
                <p className="text-white/60 text-sm">
                  {cvText.length > 100 ? `${cvText.substring(0, 100)}...` : cvText}
                </p>
                {isScannedPDF && (
                  <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-400 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Scanned PDF Detected</span>
                    </div>
                    <p className="text-yellow-300 text-xs">
                      This appears to be a scanned document. For best ATS results, consider using a text-based PDF or converting to Word format.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeATS}
            disabled={!cvText || !jobTitle || isAnalyzing}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze ATS Score
              </>
            )}
          </button>
          
        </div>

        {/* Results */}
        {atsScore !== null && (
          <div className="glass-effect rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">ATS Analysis Results</h2>
            
            {/* Score Display */}
            <div className={`text-center p-6 rounded-xl border-2 mb-8 ${getScoreBgColor(atsScore)}`}>
              <div className="text-4xl font-bold mb-2">
                <span className={getScoreColor(atsScore)}>{atsScore}</span>
                <span className="text-gray-600">/100</span>
              </div>
              <p className="text-gray-700 font-medium">
                {atsScore >= 80 ? 'Excellent ATS Compatibility' : 
                 atsScore >= 60 ? 'Good ATS Compatibility' : 
                 'Needs Improvement for ATS'}
              </p>
            </div>

            {/* Problems and Recommendations */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Problems */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Issues Found
                </h3>
                <div className="space-y-3">
                  {problems.map((problem, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50/20 rounded-lg">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-white/90 text-sm">{problem}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50/20 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-white/90 text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 